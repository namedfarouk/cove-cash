/**
 * test-cloak-flow.ts
 *
 * End-to-end smoke test for the Cloak SDK on Solana mainnet.
 *
 * INVARIANT (project-wide rule, must hold for every Cove deposit code path):
 *   Persist the serialized UTXO to disk BEFORE issuing any network call that
 *   shields funds. The blinding factor is generated client-side, never written
 *   to chain, and is required to spend the UTXO. Lose it and the funds are
 *   permanently inaccessible. No exceptions.
 *
 * Flow:
 *   1. Connect to mainnet.
 *   2. Load a depositor keypair from `.keypair.json`.
 *   3. If `scripts/shielded-utxo.json` already exists in `deposited` state,
 *      resume directly into the withdraw step. Otherwise:
 *      a. Generate a fresh UTXO ownership keypair (the "claim-link" keypair).
 *      b. Build the deposit UTXO via createUtxo (this generates blinding).
 *      c. Persist the UTXO to disk in `pending_deposit` state.
 *      d. Call transact() to perform the on-chain deposit.
 *      e. Update the persisted file with index/commitment/siblingCommitment
 *         and flip state to `deposited`.
 *   4. Withdraw the full UTXO to the hardcoded recipient via fullWithdraw,
 *      wrapped in a retry loop (up to 5 attempts, 10s waits) since the relay
 *      sync delay tends to surface as fetch failures shortly after deposit.
 *   5. Log every step.
 *
 * Run:
 *   npx tsx scripts/test-cloak-flow.ts
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  CLOAK_PROGRAM_ID,
  NATIVE_SOL_MINT,
  type Utxo,
  createUtxo,
  createZeroUtxo,
  deserializeUtxo,
  fullWithdraw,
  generateUtxoKeypair,
  serializeUtxo,
  transact,
} from "@cloak.dev/sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

// ---------------------------------------------------------------------------
// Config — edit RECIPIENT before running.
// ---------------------------------------------------------------------------

const RPC_URL = "https://api.mainnet-beta.solana.com";
const KEYPAIR_PATH = ".keypair.json";
const UTXO_FILE = "scripts/shielded-utxo.json";

// TODO: replace with the wallet that should receive the withdrawn SOL.
const RECIPIENT_PUBKEY = "HufjhhgUoMYtN4gVgq52KegfzKE2MLyyGby669kcT2ov";

// 0.02 SOL = 20,000,000 lamports — the minimum deposit per Cloak docs.
const DEPOSIT_LAMPORTS = 20_000_000n;

// Withdraw retry policy (relay sync delay typically clears within a minute).
const WITHDRAW_MAX_ATTEMPTS = 5;
const WITHDRAW_RETRY_DELAY_MS = 10_000;

// ---------------------------------------------------------------------------

type PersistedUtxoFile = {
  state: "pending_deposit" | "deposited";
  // Base64 of serializeUtxo() output. This is the only field we strictly need to
  // reconstruct the UTXO; the rest is human-readable metadata for debugging.
  serializedB64: string;
  amount: string;
  mint: string;
  ownerPrivateKeyHex: string;
  // Populated only after transact() succeeds.
  index?: number;
  commitment?: string;
  siblingCommitment?: string;
  depositSignature?: string;
};

function bigintToHex(n: bigint): string {
  return "0x" + n.toString(16).padStart(64, "0");
}

function persistUtxo(utxo: Utxo, extra: Partial<PersistedUtxoFile>) {
  const serialized = serializeUtxo(utxo);
  const payload: PersistedUtxoFile = {
    state: "pending_deposit",
    serializedB64: Buffer.from(serialized).toString("base64"),
    amount: utxo.amount.toString(),
    mint: utxo.mintAddress.toBase58(),
    ownerPrivateKeyHex: bigintToHex(utxo.keypair.privateKey),
    ...extra,
  };
  writeFileSync(resolve(UTXO_FILE), JSON.stringify(payload, null, 2));
}

function loadUtxoFile(): PersistedUtxoFile | null {
  const path = resolve(UTXO_FILE);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as PersistedUtxoFile;
}

async function rehydrateUtxo(file: PersistedUtxoFile): Promise<Utxo> {
  const bytes = Uint8Array.from(Buffer.from(file.serializedB64, "base64"));
  const utxo = await deserializeUtxo(bytes);
  // serializeUtxo persists index but not commitment/sibling; re-attach the fields
  // the withdraw proof needs from the saved metadata.
  if (file.commitment !== undefined) utxo.commitment = BigInt(file.commitment);
  if (file.siblingCommitment !== undefined) {
    utxo.siblingCommitment = BigInt(file.siblingCommitment);
  }
  if (file.index !== undefined) utxo.index = file.index;
  return utxo;
}

async function performDeposit(
  connection: Connection,
  depositor: Keypair,
): Promise<Utxo> {
  // Fund check first so we don't generate keys + write files just to fail.
  const balanceLamports = await connection.getBalance(depositor.publicKey);
  console.log("    depositor balance (lamports):", balanceLamports);
  if (BigInt(balanceLamports) < DEPOSIT_LAMPORTS + 1_000_000n) {
    throw new Error(
      `Depositor needs at least ${DEPOSIT_LAMPORTS + 1_000_000n} lamports (deposit + fees).`,
    );
  }

  // Generate the claim-link keypair. In a real Cove flow this private key is
  // what gets encoded into a payment-receive link.
  console.log("    generating UTXO ownership keypair (claim-link keypair)");
  const utxoOwner = await generateUtxoKeypair();
  console.log(
    "    utxo owner private key (hex):",
    bigintToHex(utxoOwner.privateKey),
  );

  // Build the output UTXO. createUtxo() generates the random blinding factor —
  // this is the single most important piece of secret state in the whole flow.
  const depositOutput = await createUtxo(
    DEPOSIT_LAMPORTS,
    utxoOwner,
    NATIVE_SOL_MINT,
  );

  // INVARIANT: persist BEFORE any network call. If transact() crashes, the
  // blinding is still on disk and (combined with on-chain scan) the deposit
  // can in principle be recovered.
  console.log("    persisting UTXO to disk BEFORE network call:", UTXO_FILE);
  persistUtxo(depositOutput, { state: "pending_deposit" });

  const zeroInput = await createZeroUtxo(NATIVE_SOL_MINT);

  console.log("    submitting deposit tx for", DEPOSIT_LAMPORTS, "lamports");
  const depositResult = await transact(
    {
      inputUtxos: [zeroInput],
      outputUtxos: [depositOutput],
      externalAmount: DEPOSIT_LAMPORTS,
      depositor: depositor.publicKey,
    },
    {
      connection,
      programId: CLOAK_PROGRAM_ID,
      depositorKeypair: depositor,
      onProgress: (status) => console.log("    [deposit progress]", status),
    },
  );

  console.log("    DEPOSIT_SIGNATURE:", depositResult.signature);
  console.log("    commitment indices:", depositResult.commitmentIndices);
  console.log(
    "    output commitments:",
    depositResult.outputCommitments.map((c) => c.toString()),
  );
  console.log("    new merkle root:", depositResult.newRoot);

  // Hydrate the in-memory UTXO with the on-chain metadata fullWithdraw needs.
  depositOutput.index = depositResult.commitmentIndices[0];
  depositOutput.commitment = depositResult.outputCommitments[0];
  depositOutput.siblingCommitment = depositResult.siblingCommitments[1];

  // Update the persisted file with the post-deposit state. From this point on,
  // the script is fully resumable from disk.
  persistUtxo(depositOutput, {
    state: "deposited",
    index: depositOutput.index,
    commitment: depositOutput.commitment?.toString(),
    siblingCommitment: depositOutput.siblingCommitment?.toString(),
    depositSignature: depositResult.signature,
  });

  return depositOutput;
}

async function withdrawWithRetry(
  utxo: Utxo,
  recipient: PublicKey,
  connection: Connection,
  depositor: Keypair,
) {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= WITHDRAW_MAX_ATTEMPTS; attempt++) {
    try {
      console.log(
        `    withdraw attempt ${attempt}/${WITHDRAW_MAX_ATTEMPTS} → ${recipient.toBase58()}`,
      );
      return await fullWithdraw([utxo], recipient, {
        connection,
        programId: CLOAK_PROGRAM_ID,
        depositorKeypair: depositor,
        onProgress: (status) => console.log("    [withdraw progress]", status),
      });
    } catch (err) {
      lastErr = err;
      console.warn(
        `    attempt ${attempt} failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      if (attempt < WITHDRAW_MAX_ATTEMPTS) {
        console.log(`    waiting ${WITHDRAW_RETRY_DELAY_MS}ms before retry...`);
        await new Promise((r) => setTimeout(r, WITHDRAW_RETRY_DELAY_MS));
      }
    }
  }
  throw lastErr;
}

async function main() {
  // Step 1: Open an RPC connection to Solana mainnet.
  console.log("[1/5] Connecting to Solana mainnet:", RPC_URL);
  const connection = new Connection(RPC_URL, "confirmed");

  // Step 2: Load the depositor keypair (JSON byte array, solana-keygen format).
  console.log("[2/5] Loading depositor keypair from", KEYPAIR_PATH);
  const secretKeyBytes = JSON.parse(
    readFileSync(resolve(KEYPAIR_PATH), "utf8"),
  );
  const depositor = Keypair.fromSecretKey(Uint8Array.from(secretKeyBytes));
  console.log("    depositor pubkey:", depositor.publicKey.toBase58());

  // Validate recipient up-front to avoid wasting a deposit on a typo.
  if (RECIPIENT_PUBKEY === "REPLACE_WITH_RECIPIENT_PUBKEY") {
    throw new Error("Set RECIPIENT_PUBKEY in scripts/test-cloak-flow.ts first.");
  }
  const recipient = new PublicKey(RECIPIENT_PUBKEY);

  // Step 3: Either resume from disk or run a fresh deposit.
  console.log("[3/5] Checking for existing shielded UTXO at", UTXO_FILE);
  const existing = loadUtxoFile();
  let depositUtxo: Utxo;

  if (existing && existing.state === "deposited" && existing.index !== undefined) {
    console.log(
      "    found 'deposited' UTXO (index",
      existing.index,
      "); skipping deposit and resuming",
    );
    depositUtxo = await rehydrateUtxo(existing);
  } else if (existing && existing.state === "pending_deposit") {
    // The previous run crashed between persistUtxo and transact's success
    // path. We can't safely re-deposit (might double-spend funds) and we don't
    // know if the on-chain tx landed. Bail loudly and let a human investigate.
    throw new Error(
      `Found pending_deposit UTXO at ${UTXO_FILE}. The previous deposit may or ` +
        `may not have landed on chain. Check the depositor's recent txs against ` +
        `the saved owner pubkey before deleting this file or rerunning.`,
    );
  } else {
    console.log("    no existing UTXO file — running fresh deposit");
    depositUtxo = await performDeposit(connection, depositor);
  }

  console.log("    UTXO ready:", {
    amount: depositUtxo.amount.toString(),
    mint: depositUtxo.mintAddress.toBase58(),
    index: depositUtxo.index,
    commitment: depositUtxo.commitment?.toString(),
  });

  // Step 4: Withdraw with retry. Relay sync delay shortly after a deposit
  // commonly surfaces as a fetch failure on the first withdraw attempt.
  console.log("[4/5] Withdrawing full UTXO to:", recipient.toBase58());
  const withdrawResult = await withdrawWithRetry(
    depositUtxo,
    recipient,
    connection,
    depositor,
  );

  console.log("    WITHDRAW_SIGNATURE:", withdrawResult.signature);
  console.log("    withdraw commitment indices:", withdrawResult.commitmentIndices);
  console.log("    withdraw new merkle root:", withdrawResult.newRoot);

  // Step 5: Done.
  console.log("[5/5] End-to-end Cloak flow succeeded.");
  console.log("    withdraw tx:", withdrawResult.signature);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("FAILED:", err);
    process.exit(1);
  },
);
