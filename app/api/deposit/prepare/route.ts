/**
 * POST /api/deposit/prepare
 *
 * Server-side companion for the Cove send flow. Runs the Cloak SDK's transact()
 * in Node (where it works without browser polyfills), captures the unsigned
 * VersionedTransaction the SDK builds internally, and returns it along with the
 * UTXO state the recipient will eventually need to claim.
 *
 * ─── Why a trap, and what we're depending on ─────────────────────────────────
 *
 * The Cloak SDK's transact() has no "build but don't submit" mode (verified
 * against @cloak.dev/sdk@0.1.5). It always reaches connection.sendRawTransaction
 * inline. To get an unsigned tx out, we provide a `signTransaction` callback
 * that captures the VersionedTransaction the SDK is about to submit and throws
 * a sentinel error to abort. We catch the sentinel, return the captured tx.
 *
 * SDK contract we depend on (verified in dist/index.js as of 0.1.5):
 *   1. transact() with `signTransaction` (not `depositorKeypair`) routes through
 *      submitTransactionDirect (line 5828) which calls
 *      `await depositor.signTransaction(versionedTx)` at line 6050 with a
 *      fully-built VersionedTransaction (message + empty signature slots).
 *   2. The signing call is inside a try/catch that propagates errors upward,
 *      so throwing from our callback aborts cleanly without retries.
 *   3. paddedOutputs[] preserves the order of outputUtxos[] (line 6433). We
 *      pass [depositOutput, paddingOutput] explicitly so we control both
 *      commitments and don't have to read what the SDK padded with.
 *   4. commitmentIndices == [nextIndex, nextIndex + 1] where nextIndex comes
 *      from readMerkleTreeState (line 5838 → return at line 6222).
 *
 * If a future SDK version (a) wraps the signing call in a retry loop that
 * swallows the sentinel, (b) sends a different tx than the one passed to the
 * callback, or (c) reorders/replaces our outputs — this route will fail loudly
 * (sentinel never thrown, capturedTx still null, route returns an error). The
 * existing scripts/test-cloak-flow.ts is a regression check that validates the
 * SDK's full deposit path with real signing and should be re-run before any
 * SDK upgrade.
 *
 * ─── Secrets handling ────────────────────────────────────────────────────────
 *
 * The owner private key and UTXO blinding pass through this handler in memory.
 * Do not log them. Do not write them to a database, cache, or telemetry.
 */

import {
  CLOAK_PROGRAM_ID,
  NATIVE_SOL_MINT,
  computeUtxoCommitment,
  createUtxo,
  createZeroUtxo,
  generateUtxoKeypair,
  getShieldPoolPDAs,
  readMerkleTreeState,
  serializeUtxo,
  transact,
} from "@cloak.dev/sdk";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RPC_URL =
  process.env.SOLANA_RPC_URL ??
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
  "https://api.mainnet-beta.solana.com";

const RELAY_URL = process.env.CLOAK_RELAY_URL;

function bigintToHex(n: bigint): string {
  return "0x" + n.toString(16).padStart(64, "0");
}

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

export async function POST(req: Request) {
  let body: {
    amountLamports?: string;
    depositorPublicKey?: string;
    mintAddress?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!body.amountLamports || !body.depositorPublicKey) {
    return NextResponse.json(
      { error: "amountLamports and depositorPublicKey are required" },
      { status: 400 },
    );
  }

  let amount: bigint;
  try {
    amount = BigInt(body.amountLamports);
  } catch {
    return NextResponse.json(
      { error: "amountLamports must be a bigint string" },
      { status: 400 },
    );
  }
  if (amount <= 0n) {
    return NextResponse.json(
      { error: "amountLamports must be positive" },
      { status: 400 },
    );
  }

  let depositorPubkey: PublicKey;
  try {
    depositorPubkey = new PublicKey(body.depositorPublicKey);
  } catch {
    return NextResponse.json(
      { error: "depositorPublicKey is not a valid base58 pubkey" },
      { status: 400 },
    );
  }

  const mint = body.mintAddress
    ? new PublicKey(body.mintAddress)
    : NATIVE_SOL_MINT;

  const connection = new Connection(RPC_URL, "confirmed");

  // 1. Generate the claim-link keypair. The private key returned to the client
  //    is what the recipient will need to spend.
  const utxoOwner = await generateUtxoKeypair();

  // 2. Build the deposit output (with random blinding) and an explicit padding
  //    output. We provide the padding ourselves so we know its commitment for
  //    the siblingCommitment field — the SDK would otherwise generate one
  //    internally and not surface it.
  const depositOutput = await createUtxo(amount, utxoOwner, mint);
  const paddingOutput = await createZeroUtxo(mint);
  const zeroInput = await createZeroUtxo(mint);

  // 3. Compute both output commitments. createUtxo already populates
  //    .commitment but recompute defensively in case a future SDK version
  //    skips that.
  const depositCommitment =
    depositOutput.commitment ?? (await computeUtxoCommitment(depositOutput));
  const paddingCommitment =
    paddingOutput.commitment ?? (await computeUtxoCommitment(paddingOutput));
  depositOutput.commitment = depositCommitment;
  paddingOutput.commitment = paddingCommitment;

  // 4. Read merkle state to determine where our outputs will land. Same race
  //    the SDK has (another deposit could land between our read and submit) —
  //    the on-chain program enforces correctness; if our proof was built
  //    against a stale root, the program rejects with RootNotFound.
  const pdas = getShieldPoolPDAs(CLOAK_PROGRAM_ID, mint);
  const treeState = await readMerkleTreeState(connection, pdas.merkleTree, true);
  const nextIndex = treeState.nextIndex;
  const commitmentIndex = nextIndex;
  const siblingCommitmentIndex = nextIndex + 1;

  depositOutput.index = commitmentIndex;
  depositOutput.siblingCommitment = paddingCommitment;

  // 5. Set up the trap and run transact. The callback captures the SDK's
  //    fully-built VersionedTransaction into a closure variable BEFORE throwing.
  //    We use the closure (not the error instance) to retrieve the tx because
  //    the SDK wraps thrown errors in its own retry/rebuild logic — by the time
  //    our catch fires, the original error type is gone, but `capturedTx` is
  //    still set from the side effect. The SDK may retry signing multiple times;
  //    each retry overwrites capturedTx with a fresh tx. The final value is the
  //    one we return (latest blockhash, latest proof witness state).
  let capturedTx: VersionedTransaction | null = null;
  const signTransactionTrap = async <T,>(tx: T): Promise<T> => {
    capturedTx = tx as unknown as VersionedTransaction;
    throw new Error("signature intercepted");
  };

  let transactError: unknown = null;
  try {
    await transact(
      {
        inputUtxos: [zeroInput],
        outputUtxos: [depositOutput, paddingOutput],
        externalAmount: amount,
        depositor: depositorPubkey,
      },
      {
        connection,
        programId: CLOAK_PROGRAM_ID,
        depositorPublicKey: depositorPubkey,
        walletPublicKey: depositorPubkey,
        signTransaction: signTransactionTrap,
        enforceViewingKeyRegistration: false,
        relayUrl: RELAY_URL,
      },
    );
    // transact returned without throwing — meaning the SDK swallowed our throw
    // (and somehow proceeded to a non-error completion). If capturedTx is also
    // null, the trap didn't fire at all and the SDK contract changed.
    if (!capturedTx) {
      return NextResponse.json(
        {
          error:
            "SDK contract violation: transact() completed without invoking signTransaction. The trap pattern this route depends on is broken; check @cloak.dev/sdk version.",
        },
        { status: 500 },
      );
    }
  } catch (err) {
    transactError = err;
  }

  // Trap-fired path: capturedTx is set from the side effect inside the
  // callback, regardless of whether the SDK wrapped, retried, or rethrew our
  // sentinel error. We trust the closure variable, not the error type.
  if (!capturedTx) {
    const message =
      transactError instanceof Error
        ? transactError.message
        : String(transactError);
    return NextResponse.json(
      { error: `transact failed before signing: ${message}` },
      { status: 500 },
    );
  }

  // TS can't see the closure mutation, so it narrows capturedTx to `never`
  // after the guard. Re-bind to a typed local so the rest of the function
  // doesn't need non-null assertions everywhere.
  const tx: VersionedTransaction = capturedTx;

  // 6. Best-effort lastValidBlockHeight for the client's confirmTransaction.
  //    The blockhash baked into the tx is canonical; the lastValidBlockHeight
  //    here is a fresh estimate (~150 slots ahead of current height).
  const recentBlockhash = tx.message.recentBlockhash;
  let lastValidBlockHeight: number | null = null;
  try {
    const currentHeight = await connection.getBlockHeight("confirmed");
    lastValidBlockHeight = currentHeight + 150;
  } catch {
    // non-fatal; client can query its own
  }

  return NextResponse.json({
    unsignedTransactionBase64: bytesToBase64(tx.serialize()),
    utxoSerializedBase64: bytesToBase64(serializeUtxo(depositOutput)),
    utxoOwnerPrivateKeyHex: bigintToHex(utxoOwner.privateKey),
    utxoOwnerPublicKeyHex: bigintToHex(utxoOwner.publicKey),
    // Required for the claim flow to reconstruct the spend witness. Without
    // this the URL blob is missing `r` and the UTXO is unspendable.
    utxoBlindingHex: bigintToHex(depositOutput.blinding),
    metadata: {
      amount: amount.toString(),
      mint: mint.toBase58(),
      commitmentIndex,
      siblingCommitmentIndex,
      expectedCommitment: depositCommitment.toString(),
      expectedSiblingCommitment: paddingCommitment.toString(),
      recentBlockhash,
      lastValidBlockHeight,
    },
  });
}
