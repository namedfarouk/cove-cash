/**
 * Claim-link encoding for Cove.
 *
 * A claim link is a URL of the form
 *   https://covecash.app/claim/<base64url-encoded-blob>
 * where the blob is a JSON object containing everything the recipient needs to
 * spend the shielded UTXO: owner private key, amount, mint, leaf index,
 * commitment, sibling commitment, deposit signature.
 *
 * The blob INCLUDES the secret needed to spend, so anyone with the link can
 * claim. Treat it like a bearer instrument.
 */
const DEFAULT_APP_URL = "https://covecash.app";

export type ClaimBlobV1 = {
  v: 1;
  // Owner private key (bigint hex) — secret. Whoever holds this can spend.
  sk: string;
  // Blinding factor (bigint hex) — secret. Required by the spend ZK proof to
  // recompute the commitment witness. Lose it and the UTXO is unspendable.
  r: string;
  amt: string;
  mint: string;
  idx: number;
  // Commitment hash (decimal string of bigint).
  cm: string;
  // Sibling commitment hash (decimal string of bigint).
  sib: string;
  // Deposit transaction signature.
  sig: string;
};

function base64ToBase64Url(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBase64(b64url: string): string {
  const padded = b64url + "=".repeat((4 - (b64url.length % 4)) % 4);
  return padded.replace(/-/g, "+").replace(/_/g, "/");
}

export function encodeClaimBlob(blob: ClaimBlobV1): string {
  const json = JSON.stringify(blob);
  return base64ToBase64Url(btoa(json));
}

export function decodeClaimBlob(encoded: string): ClaimBlobV1 {
  const json = atob(base64UrlToBase64(encoded));
  return JSON.parse(json) as ClaimBlobV1;
}

export function buildClaimUrl(blob: ClaimBlobV1): string {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;

  return `${baseUrl.replace(/\/$/, "")}/claim/${encodeClaimBlob(blob)}`;
}
