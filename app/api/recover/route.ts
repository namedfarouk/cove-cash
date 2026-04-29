/**
 * POST /api/recover
 *
 * Recovery flow for deposits made before the URL schema included `r`.
 *
 * Pre-`r` deposits left their state in the sender's localStorage but produced
 * unspendable claim links (URL was missing the blinding factor). The
 * localStorage entry includes `serializedB64` — the SDK's serializeUtxo() output,
 * which DOES carry the blinding. This route deserializes that blob, extracts
 * the blinding, and rebuilds a complete claim URL.
 *
 * No on-chain interaction. Pure local data transformation.
 *
 * ─── Secrets handling ────────────────────────────────────────────────────────
 *
 * Owner private key, blinding, and the resulting claim URL all flow through
 * this handler in memory. Do not log them. Do not write them to a database,
 * cache, or telemetry. The response payload IS the bearer instrument.
 */

import {
  type Utxo,
  computeUtxoCommitment,
  deserializeUtxo,
} from "@cloak.dev/sdk";
import { PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";

import { buildClaimUrl } from "@/lib/cove/claim-link";

export const runtime = "nodejs";

function hexToBigint(hex: string): bigint {
  return BigInt(hex.startsWith("0x") || hex.startsWith("0X") ? hex : "0x" + hex);
}

function bigintToHex(n: bigint): string {
  return "0x" + n.toString(16).padStart(64, "0");
}

function base64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

export async function POST(req: Request) {
  let body: {
    serializedB64?: string;
    ownerPrivateKeyHex?: string;
    amount?: string;
    mint?: string;
    index?: number;
    commitment?: string;
    siblingCommitment?: string;
    depositSignature?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const required = [
    "serializedB64",
    "ownerPrivateKeyHex",
    "amount",
    "mint",
    "index",
    "commitment",
    "siblingCommitment",
    "depositSignature",
  ] as const;
  for (const key of required) {
    if (body[key] === undefined || body[key] === null || body[key] === "") {
      return NextResponse.json(
        { error: `missing required field: ${key}` },
        { status: 400 },
      );
    }
  }

  // 1. Decode and deserialize the UTXO. deserializeUtxo populates amount,
  //    keypair (with derived publicKey), blinding, mintAddress, and index from
  //    the byte layout. Commitment is NOT in the blob and must be recomputed.
  let utxo: Utxo;
  try {
    const bytes = base64ToBytes(body.serializedB64!);
    utxo = await deserializeUtxo(bytes);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `failed to deserialize UTXO: ${message}` },
      { status: 400 },
    );
  }

  // 2. Sanity-check the deserialized state against the inputs. Mismatches
  //    indicate a corrupted localStorage entry or a tampered request — refuse
  //    to build a URL we can't trust.
  const inputAmount = BigInt(body.amount!);
  if (utxo.amount !== inputAmount) {
    return NextResponse.json(
      {
        error: `amount mismatch: serialized=${utxo.amount}, input=${inputAmount}`,
      },
      { status: 400 },
    );
  }

  const inputSk = hexToBigint(body.ownerPrivateKeyHex!);
  if (utxo.keypair.privateKey !== inputSk) {
    return NextResponse.json(
      { error: "ownerPrivateKeyHex does not match the serialized UTXO's keypair" },
      { status: 400 },
    );
  }

  let inputMint: PublicKey;
  try {
    inputMint = new PublicKey(body.mint!);
  } catch {
    return NextResponse.json(
      { error: "mint is not a valid base58 pubkey" },
      { status: 400 },
    );
  }
  if (!utxo.mintAddress.equals(inputMint)) {
    return NextResponse.json(
      {
        error: `mint mismatch: serialized=${utxo.mintAddress.toBase58()}, input=${inputMint.toBase58()}`,
      },
      { status: 400 },
    );
  }

  if (utxo.index !== body.index) {
    return NextResponse.json(
      {
        error: `index mismatch: serialized=${utxo.index}, input=${body.index}`,
      },
      { status: 400 },
    );
  }

  // Recompute the commitment from the deserialized UTXO (uses the blinding
  // that just came out of the blob). If this matches the input commitment,
  // we know the blinding is correct.
  const recomputedCommitment = await computeUtxoCommitment(utxo);
  const inputCommitment = BigInt(body.commitment!);
  if (recomputedCommitment !== inputCommitment) {
    return NextResponse.json(
      {
        error: `commitment mismatch: recomputed from serialized blinding=${recomputedCommitment}, input=${inputCommitment}. The serialized UTXO does not match this localStorage entry.`,
      },
      { status: 400 },
    );
  }

  // 3. Build the claim URL using the freshly-extracted blinding.
  const claimUrl = buildClaimUrl({
    v: 1,
    sk: body.ownerPrivateKeyHex!,
    r: bigintToHex(utxo.blinding),
    amt: body.amount!,
    mint: body.mint!,
    idx: body.index!,
    cm: body.commitment!,
    sib: body.siblingCommitment!,
    sig: body.depositSignature!,
  });

  return NextResponse.json({
    claimUrl,
    blindingHex: bigintToHex(utxo.blinding),
  });
}
