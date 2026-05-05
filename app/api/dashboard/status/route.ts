/**
 * POST /api/dashboard/status
 *
 * Batch nullifier-PDA lookup for the recipient's dashboard. Reconstructs
 * minimal Utxo objects from each localStorage entry, calls verifyUtxos, and
 * returns claimed/pending status keyed by leaf index.
 *
 * verifyUtxos requires { commitment, mintAddress, keypair.privateKey, index }.
 * blinding/sibling/amount aren't needed for the nullifier check — we ignore
 * them here even when the client sends them.
 *
 * Secrets handling: ownerPrivateKeyHex passes through in memory only. No logs.
 */

import {
  CLOAK_PROGRAM_ID,
  type Utxo,
  derivePublicKey,
  verifyUtxos,
} from "@cloak.dev/sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RPC_URL =
  process.env.SOLANA_RPC_URL ??
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
  "https://api.mainnet-beta.solana.com";

function hexToBigint(hex: string): bigint {
  return BigInt(hex.startsWith("0x") || hex.startsWith("0X") ? hex : "0x" + hex);
}

type InputUtxo = {
  index: number;
  ownerPrivateKeyHex: string;
  commitment: string;
  siblingCommitment: string;
  amount: string;
  mint: string;
  depositSignature: string;
  state: "pending_deposit" | "deposited";
};

export async function POST(req: Request) {
  let body: { utxos?: InputUtxo[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!Array.isArray(body.utxos)) {
    return NextResponse.json(
      { error: "utxos must be an array" },
      { status: 400 },
    );
  }
  if (body.utxos.length === 0) {
    return NextResponse.json({ statuses: [] });
  }

  const connection = new Connection(RPC_URL, "confirmed");

  // Reconstruct minimal Utxo literals. We tag each one with its leaf index so
  // we can match verifyUtxos's spent/unspent/skipped partitions back to the
  // original input ordering.
  const reconstructed: Utxo[] = [];
  const indexByUtxo = new WeakMap<Utxo, number>();
  for (const inp of body.utxos) {
    try {
      const sk = hexToBigint(inp.ownerPrivateKeyHex);
      const pk = await derivePublicKey(sk);
      const utxo: Utxo = {
        amount: BigInt(inp.amount),
        keypair: { privateKey: sk, publicKey: pk },
        // blinding isn't needed for nullifier; placeholder zero.
        blinding: 0n,
        mintAddress: new PublicKey(inp.mint),
        index: inp.index,
        commitment: BigInt(inp.commitment),
      };
      reconstructed.push(utxo);
      indexByUtxo.set(utxo, inp.index);
    } catch (err) {
      // Malformed entry — leave it out of the verify call, fold into the
      // response as unverifiable later.
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        `[dashboard/status] dropping malformed entry index=${inp.index}: ${message}`,
      );
    }
  }

  let result;
  try {
    result = await verifyUtxos(reconstructed, connection, CLOAK_PROGRAM_ID);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `verifyUtxos failed: ${message}` },
      { status: 500 },
    );
  }

  // Build a per-input status keyed by leaf index. Defaults to claimed=false
  // for entries that didn't reach verifyUtxos (parse errors above) or that
  // verifyUtxos placed in `skipped`. The UI treats those as pending; rare in
  // practice and visible only if localStorage is corrupted.
  const claimedIndices = new Set<number>();
  for (const u of result.spent) {
    const idx = indexByUtxo.get(u);
    if (idx !== undefined) claimedIndices.add(idx);
  }

  const statuses = body.utxos.map((inp) => ({
    index: inp.index,
    claimed: claimedIndices.has(inp.index),
  }));

  return NextResponse.json({ statuses });
}
