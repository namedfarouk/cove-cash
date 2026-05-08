/**
 * scan-notes.ts
 *
 * Viewing-key dashboard prototype for Cove.
 *
 * Given a UTXO ownership private key (the same key that's encoded into a Cove
 * "claim link"), derive the diversified viewing key `nk`, then trial-decrypt
 * every shield-pool transaction visible to that key. The output is a structured
 * compliance report — the same data shape Cove's recipient dashboard will eventually
 * render.
 *
 * IMPORTANT: this script is read-only. It cannot recover the blinding factor
 * needed to *spend* a UTXO; the on-chain compact chain note only carries
 * `{ timestamp, commitment }`. To spend, the holder of the owner key must also
 * have the serialized UTXO (with its blinding) persisted client-side. Use this
 * script for ledger views, not for fund recovery.
 *
 * Run:
 *   npx tsx scripts/scan-notes.ts
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  CLOAK_PROGRAM_ID,
  getNkFromUtxoPrivateKey,
  scanTransactions,
  toComplianceReport,
} from "@cloak.dev/sdk";
import { Connection, Keypair } from "@solana/web3.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const RPC_URL = process.env.SOLANA_RPC_URL ?? process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";
const KEYPAIR_PATH = ".keypair.json";

// UTXO owner private key for the existing test UTXO (the one whose 0.02 SOL is
// already in the pool but unspendable due to lost blinding). Replace as needed
// when scanning for a different recipient.
const UTXO_OWNER_PRIVATE_KEY_HEX =
  "0x02bf36220af670ed39f1511c047d596e4da47afff0c665ed83ec9375ed33c2b1";

// Scanner knobs. Setting `limit` higher trades RPC calls for completeness.
const SCAN_LIMIT = 0; // 0 = scan everything visible to the program ID
const SCAN_BATCH_SIZE = 50;

// ---------------------------------------------------------------------------

function hexToBigint(hex: string): bigint {
  return BigInt(hex.startsWith("0x") ? hex : "0x" + hex);
}

async function main() {
  // Step 1: RPC connection.
  console.log("[1/5] Connecting to Solana mainnet:", RPC_URL);
  const connection = new Connection(RPC_URL, "confirmed");

  // Step 2: Load the depositor wallet. The scanner doesn't strictly need it,
  // but logging the wallet alongside the report helps cross-check ownership.
  console.log("[2/5] Loading depositor wallet from", KEYPAIR_PATH);
  const secretKeyBytes = JSON.parse(
    readFileSync(resolve(KEYPAIR_PATH), "utf8"),
  );
  const depositor = Keypair.fromSecretKey(Uint8Array.from(secretKeyBytes));
  console.log("    depositor pubkey:", depositor.publicKey.toBase58());

  // Step 3: Derive the viewing key `nk` from the UTXO owner private key.
  // `nk` is the symmetric key used to trial-decrypt compact chain notes and
  // identify which transactions belong to this recipient.
  console.log("[3/5] Deriving viewing key nk from UTXO owner private key");
  const ownerPrivateKey = hexToBigint(UTXO_OWNER_PRIVATE_KEY_HEX);
  const viewingKeyNk = getNkFromUtxoPrivateKey(ownerPrivateKey);
  console.log(
    "    nk (hex):",
    Buffer.from(viewingKeyNk).toString("hex"),
  );

  // Step 4: Walk the shield-pool program's transactions and trial-decrypt.
  console.log("[4/5] Scanning shield-pool transactions (this may take a minute)");
  const scanResult = await scanTransactions({
    connection,
    programId: CLOAK_PROGRAM_ID,
    viewingKeyNk,
    limit: SCAN_LIMIT,
    batchSize: SCAN_BATCH_SIZE,
    walletPublicKey: depositor.publicKey.toBase58(),
    onProgress: (processed, total) =>
      console.log(`    [scan progress] ${processed}/${total}`),
    onStatus: (status) => console.log("    [scan status]", status),
  });

  console.log("    scan complete:", {
    rpcCallsMade: scanResult.rpcCallsMade,
    matchedTransactions: scanResult.transactions.length,
    lastSignature: scanResult.lastSignature,
  });

  // Step 5: Convert to the JSON-serializable compliance report. This is the
  // shape Cove's dashboard will consume.
  console.log("[5/5] Compiling compliance report");
  const report = toComplianceReport(scanResult);
  console.log(JSON.stringify(report, null, 2));
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("FAILED:", err);
    process.exit(1);
  },
);
