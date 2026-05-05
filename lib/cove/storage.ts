/**
 * Browser-side persistence for in-flight Cove deposits.
 *
 * Project invariant: every deposit code path must persist the serialized UTXO
 * (which contains the blinding factor) BEFORE issuing any network call. The
 * blinding lives only client-side; lose it and the funds are permanently
 * inaccessible.
 *
 * No @cloak.dev/sdk imports here — the client bundle stays SDK-free now that
 * deposit prep happens server-side. We persist whatever the server returned;
 * any future spend flow rehydrates server-side from these same fields.
 */

const KEY_PREFIX = "cove:pending-utxo:";

export type PersistedDeposit = {
  state: "pending_deposit" | "deposited";
  // Base64 of the SDK's serializeUtxo() output (computed server-side). Carries
  // amount, owner private key, blinding, mint, and index.
  serializedB64: string;
  amount: string;
  mint: string;
  ownerPublicKeyHex: string;
  ownerPrivateKeyHex: string;
  r?: string;
  index?: number;
  commitment?: string;
  siblingCommitment?: string;
  depositSignature?: string;
};

export function storageKeyForOwner(ownerPublicKeyHex: string): string {
  return KEY_PREFIX + ownerPublicKeyHex;
}

export function persistDeposit(payload: PersistedDeposit): string {
  const key = storageKeyForOwner(payload.ownerPublicKeyHex);
  localStorage.setItem(key, JSON.stringify(payload));
  return key;
}

export function loadDeposit(
  ownerPublicKeyHex: string,
): PersistedDeposit | null {
  const raw = localStorage.getItem(storageKeyForOwner(ownerPublicKeyHex));
  if (!raw) return null;
  return JSON.parse(raw) as PersistedDeposit;
}
