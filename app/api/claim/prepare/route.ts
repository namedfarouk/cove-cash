/**
 * POST /api/claim/prepare
 *
 * Server-side companion for the Cove claim flow. Reconstructs the input UTXO
 * from the recipient's claim URL, runs the Cloak SDK's fullWithdraw() in Node,
 * and returns one of three response modes depending on how the SDK chose to
 * complete the withdraw.
 *
 * ─── Three-mode response ─────────────────────────────────────────────────────
 *
 * fullWithdraw() can complete via one of two paths inside transact():
 *
 *   • **Relay path (default for withdraws as of @cloak.dev/sdk@0.1.5).** The
 *     SDK POSTs the proof to https://api.cloak.ag/transact. The relay holds
 *     its own wallet, pays the fee, signs the tx, submits, and returns
 *     `{ signature, commitment_indices }`. fullWithdraw() resolves with the
 *     signature in the TransactResult. signTransaction is NEVER called on
 *     this path. The user's wallet does not pop up.
 *
 *   • **Direct-submit path.** Only entered when relayUrl is null/empty AND a
 *     signer is provided. fullWithdraw() calls the signTransaction callback
 *     with a fully-built VersionedTransaction, then submits it itself. This
 *     is the same path deposits use.
 *
 * The trap pattern (capture VersionedTransaction in a closure, throw to
 * abort) only fires on the direct-submit path. For relay-path success, we
 * extract the signature from the TransactResult's return value instead.
 *
 * Modes returned:
 *   { mode: "relay_submitted", signature, metadata } — relay submitted; client
 *       should confirm on chain (signature is already on the wire).
 *   { mode: "user_sign", unsignedTransactionBase64, metadata } — direct path
 *       was taken; client signs, submits, confirms (same as deposit flow).
 *   { error: "..." } with HTTP 500 — neither path completed successfully.
 *
 * The trap stays in the route as a forward-compat fallback. If a future SDK
 * version forces client-side signing for withdraws (no relay default), the
 * trap activates and we return user_sign mode without code changes.
 *
 * ─── SDK contract we depend on (verified against 0.1.5) ──────────────────────
 *
 *   1. fullWithdraw → partialWithdraw → transact returns TransactResult with
 *      a non-empty `signature` field whenever the on-chain tx was submitted.
 *      [SDK index.js: line 7207, line 6219-6224.]
 *   2. The relay path at index.js:7073-7240 calls POST {relayUrl}/transact and
 *      relies entirely on the relay's signing wallet. signTransaction is never
 *      invoked.
 *   3. The direct-submit path at index.js:7020 is gated on `!relayUrl`. We
 *      don't pass relayUrl, so the SDK uses the default and the direct path is
 *      not taken.
 *
 * Regression check: scripts/test-cloak-flow.ts exercises full end-to-end on
 * mainnet with a programmatic keypair. Re-run before any SDK upgrade.
 *
 * ─── Secrets handling ────────────────────────────────────────────────────────
 *
 * Owner private key and blinding pass through this handler in memory only.
 * Do not log them. Do not write them to a database, cache, or telemetry.
 */

import {
  CLOAK_PROGRAM_ID,
  NATIVE_SOL_MINT,
  type TransactResult,
  type Utxo,
  derivePublicKey,
  fullWithdraw,
} from "@cloak.dev/sdk";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RPC_URL =
  process.env.SOLANA_RPC_URL ??
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
  "https://api.mainnet-beta.solana.com";

function hexToBigint(hex: string): bigint {
  return BigInt(hex.startsWith("0x") || hex.startsWith("0X") ? hex : "0x" + hex);
}

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

export async function POST(req: Request) {
  let body: {
    utxoOwnerPrivateKeyHex?: string;
    blindingHex?: string;
    amount?: string;
    mint?: string;
    commitmentIndex?: number;
    expectedCommitment?: string;
    expectedSiblingCommitment?: string;
    recipientWalletPublicKey?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const required = [
    "utxoOwnerPrivateKeyHex",
    "blindingHex",
    "amount",
    "commitmentIndex",
    "expectedCommitment",
    "expectedSiblingCommitment",
    "recipientWalletPublicKey",
  ] as const;
  for (const key of required) {
    if (body[key] === undefined || body[key] === null || body[key] === "") {
      return NextResponse.json(
        { error: `missing required field: ${key}` },
        { status: 400 },
      );
    }
  }

  let sk: bigint;
  let r: bigint;
  let amount: bigint;
  let commitment: bigint;
  let siblingCommitment: bigint;
  try {
    sk = hexToBigint(body.utxoOwnerPrivateKeyHex!);
    r = hexToBigint(body.blindingHex!);
    amount = BigInt(body.amount!);
    commitment = BigInt(body.expectedCommitment!);
    siblingCommitment = BigInt(body.expectedSiblingCommitment!);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `failed to parse numeric fields: ${message}` },
      { status: 400 },
    );
  }

  if (amount <= 0n) {
    return NextResponse.json(
      { error: "amount must be positive" },
      { status: 400 },
    );
  }
  if (typeof body.commitmentIndex !== "number" || body.commitmentIndex < 0) {
    return NextResponse.json(
      { error: "commitmentIndex must be a non-negative integer" },
      { status: 400 },
    );
  }

  let recipientPubkey: PublicKey;
  try {
    recipientPubkey = new PublicKey(body.recipientWalletPublicKey!);
  } catch {
    return NextResponse.json(
      { error: "recipientWalletPublicKey is not a valid base58 pubkey" },
      { status: 400 },
    );
  }

  const mint = body.mint ? new PublicKey(body.mint) : NATIVE_SOL_MINT;
  const connection = new Connection(RPC_URL, "confirmed");

  // 1. Reconstruct the input UTXO. Utxo is an interface; a plain object
  //    satisfies it. derivePublicKey re-derives pk from sk via Poseidon.
  const pk = await derivePublicKey(sk);
  const inputUtxo: Utxo = {
    amount,
    keypair: { privateKey: sk, publicKey: pk },
    blinding: r,
    mintAddress: mint,
    index: body.commitmentIndex,
    commitment,
    siblingCommitment,
  };

  // 2. Trap setup — kept as forward-compat fallback. Under the current SDK
  //    (0.1.5) this never fires for withdraws because the relay submits
  //    server-side without invoking signTransaction. If a future SDK forces
  //    client signing for withdraws, capturedTx will be populated and the
  //    user_sign branch below activates without other changes.
  let capturedTx: VersionedTransaction | null = null;
  const signTransactionTrap = async <T,>(tx: T): Promise<T> => {
    capturedTx = tx as unknown as VersionedTransaction;
    throw new Error("signature intercepted");
  };

  // 3. Run fullWithdraw. Three possible outcomes:
  //    - resolves with TransactResult → relay submitted (default path)
  //    - throws with capturedTx populated → trap fired (direct-submit path)
  //    - throws with capturedTx null → real failure (relay rejected, etc.)
  let withdrawResult: TransactResult | null = null;
  let transactError: unknown = null;
  try {
    withdrawResult = await fullWithdraw([inputUtxo], recipientPubkey, {
      connection,
      programId: CLOAK_PROGRAM_ID,
      depositorPublicKey: recipientPubkey,
      walletPublicKey: recipientPubkey,
      signTransaction: signTransactionTrap,
      enforceViewingKeyRegistration: false,
    });
  } catch (err) {
    transactError = err;
  }

  // Mode 1: trap fired AND throw propagated → user-sign path. Return the
  // unsigned tx for the recipient's wallet to sign and submit.
  if (capturedTx && transactError) {
    const tx: VersionedTransaction = capturedTx;
    const recentBlockhash = tx.message.recentBlockhash;
    let lastValidBlockHeight: number | null = null;
    try {
      const currentHeight = await connection.getBlockHeight("confirmed");
      lastValidBlockHeight = currentHeight + 150;
    } catch {
      // non-fatal; client can query its own
    }
    return NextResponse.json({
      mode: "user_sign" as const,
      unsignedTransactionBase64: bytesToBase64(tx.serialize()),
      metadata: {
        amount: amount.toString(),
        mint: mint.toBase58(),
        recipient: recipientPubkey.toBase58(),
        recentBlockhash,
        lastValidBlockHeight,
      },
    });
  }

  // Mode 2: fullWithdraw resolved with a signature → relay submitted the tx.
  // Client should confirm on chain. The relay's blockhash isn't returned to
  // us, so we ship a fresh blockhash + lastValidBlockHeight as a polling
  // strategy for confirmTransaction (the tx is already on the wire; the
  // strategy just controls how long the client polls before giving up).
  if (withdrawResult?.signature) {
    let recentBlockhash: string;
    let lastValidBlockHeight: number | null = null;
    try {
      const latest = await connection.getLatestBlockhash("confirmed");
      recentBlockhash = latest.blockhash;
      lastValidBlockHeight = latest.lastValidBlockHeight;
    } catch {
      // Fallback: empty blockhash. Client can use deprecated single-arg
      // confirmTransaction or query its own.
      recentBlockhash = "";
    }
    return NextResponse.json({
      mode: "relay_submitted" as const,
      signature: withdrawResult.signature,
      metadata: {
        amount: amount.toString(),
        mint: mint.toBase58(),
        recipient: recipientPubkey.toBase58(),
        recentBlockhash,
        lastValidBlockHeight,
      },
    });
  }

  // Mode 3: real failure. Either the relay rejected after all retries
  // (RelayInternalError), proof generation failed, or some other SDK error.
  const message =
    transactError instanceof Error
      ? transactError.message
      : String(transactError ?? "fullWithdraw produced no result and no error");
  return NextResponse.json(
    { error: `fullWithdraw failed: ${message}` },
    { status: 500 },
  );
}
