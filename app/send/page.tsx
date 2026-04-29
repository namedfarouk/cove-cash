"use client";

import { useMemo, useState } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { VersionedTransaction } from "@solana/web3.js";

import { buildClaimUrl } from "@/lib/cove/claim-link";
import { persistDeposit, type PersistedDeposit } from "@/lib/cove/storage";

const MIN_SOL = 0.02;

type PrepareResponse = {
  unsignedTransactionBase64: string;
  utxoSerializedBase64: string;
  utxoOwnerPrivateKeyHex: string;
  utxoOwnerPublicKeyHex: string;
  utxoBlindingHex: string;
  metadata: {
    amount: string;
    mint: string;
    commitmentIndex: number;
    siblingCommitmentIndex: number;
    expectedCommitment: string;
    expectedSiblingCommitment: string;
    recentBlockhash: string;
    lastValidBlockHeight: number | null;
  };
};

type Status =
  | { kind: "idle" }
  | { kind: "preparing" }
  | { kind: "signing" }
  | { kind: "submitting" }
  | { kind: "confirming"; signature: string }
  | {
      kind: "success";
      url: string;
      signature: string;
      storageKey: string;
    }
  | { kind: "error"; message: string };

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export default function SendPage() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  const [amountSol, setAmountSol] = useState<string>("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const amountLamports = useMemo<bigint | null>(() => {
    const n = Number(amountSol);
    if (!Number.isFinite(n) || n < MIN_SOL) return null;
    return BigInt(Math.round(n * 1e9));
  }, [amountSol]);

  const canSubmit =
    connected &&
    publicKey &&
    signTransaction &&
    amountLamports !== null &&
    status.kind !== "preparing" &&
    status.kind !== "signing" &&
    status.kind !== "submitting" &&
    status.kind !== "confirming";

  async function handleGenerate() {
    if (!publicKey || !signTransaction || amountLamports === null) return;

    setStatus({ kind: "preparing" });
    try {
      // 1. Ask the server to build everything (proof + unsigned tx + UTXO state).
      const res = await fetch("/api/deposit/prepare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amountLamports: amountLamports.toString(),
          depositorPublicKey: publicKey.toBase58(),
        }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errBody.error ?? `prepare failed: ${res.status}`);
      }
      const prepared = (await res.json()) as PrepareResponse;

      // 2. INVARIANT: persist the UTXO BEFORE we sign or submit. If signing
      //    is rejected or submission fails, the blinding is still on disk so
      //    a recovery flow can locate the deposit on chain.
      const persisted: PersistedDeposit = {
        state: "pending_deposit",
        serializedB64: prepared.utxoSerializedBase64,
        amount: prepared.metadata.amount,
        mint: prepared.metadata.mint,
        ownerPublicKeyHex: prepared.utxoOwnerPublicKeyHex,
        ownerPrivateKeyHex: prepared.utxoOwnerPrivateKeyHex,
        index: prepared.metadata.commitmentIndex,
        commitment: prepared.metadata.expectedCommitment,
        siblingCommitment: prepared.metadata.expectedSiblingCommitment,
      };
      const storageKey = persistDeposit(persisted);

      // 3. Deserialize the unsigned tx and ask the wallet to sign.
      const tx = VersionedTransaction.deserialize(
        base64ToBytes(prepared.unsignedTransactionBase64),
      );

      setStatus({ kind: "signing" });
      const signed = await signTransaction(tx);

      // 4. Submit and confirm.
      setStatus({ kind: "submitting" });
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
      });

      setStatus({ kind: "confirming", signature });
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: prepared.metadata.recentBlockhash,
          lastValidBlockHeight: prepared.metadata.lastValidBlockHeight ?? 0,
        },
        "confirmed",
      );
      if (confirmation.value.err) {
        throw new Error(
          `confirmation error: ${JSON.stringify(confirmation.value.err)}`,
        );
      }

      // 5. Update the persisted entry with deposited state + signature.
      persistDeposit({
        ...persisted,
        state: "deposited",
        depositSignature: signature,
      });

      // 6. Build the claim URL.
      const url = buildClaimUrl({
        v: 1,
        sk: prepared.utxoOwnerPrivateKeyHex,
        r: prepared.utxoBlindingHex,
        amt: prepared.metadata.amount,
        mint: prepared.metadata.mint,
        idx: prepared.metadata.commitmentIndex,
        cm: prepared.metadata.expectedCommitment,
        sib: prepared.metadata.expectedSiblingCommitment,
        sig: signature,
      });

      console.log("[cove/send] full URL:", url);
      console.log("[cove/send] deposit signature:", signature);
      console.log("[cove/send] localStorage key:", storageKey);

      setStatus({ kind: "success", url, signature, storageKey });
    } catch (err) {
      console.error("[cove/send] failed:", err);
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xl font-semibold tracking-tight">Cove</span>
        <WalletMultiButton />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 bg-white dark:bg-zinc-950">
          <h1 className="text-xl font-semibold">Send a private payment</h1>

          <label className="block space-y-1">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Amount (SOL)
            </span>
            <input
              type="number"
              min={MIN_SOL}
              step="0.001"
              value={amountSol}
              onChange={(e) => setAmountSol(e.target.value)}
              placeholder={MIN_SOL.toString()}
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
            />
            <span className="text-xs text-zinc-500">Minimum {MIN_SOL} SOL</span>
          </label>

          <button
            onClick={handleGenerate}
            disabled={!canSubmit}
            className="w-full rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate claim link
          </button>

          <StatusPanel status={status} connected={connected} />
        </div>
      </main>
    </div>
  );
}

function StatusPanel({
  status,
  connected,
}: {
  status: Status;
  connected: boolean;
}) {
  if (status.kind === "idle") {
    return (
      <p className="text-sm text-zinc-500">
        {connected ? "Ready." : "Connect a wallet to begin."}
      </p>
    );
  }

  if (status.kind === "preparing") {
    return (
      <p className="text-sm text-zinc-500">
        Preparing deposit (proof generation, ~10–30s)...
      </p>
    );
  }
  if (status.kind === "signing") {
    return (
      <p className="text-sm text-zinc-500">Waiting for wallet signature...</p>
    );
  }
  if (status.kind === "submitting") {
    return <p className="text-sm text-zinc-500">Submitting transaction...</p>;
  }
  if (status.kind === "confirming") {
    return (
      <p className="text-sm text-zinc-500">
        Confirming on chain... <span className="font-mono">{status.signature.slice(0, 12)}…</span>
      </p>
    );
  }
  if (status.kind === "error") {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300">
        {status.message}
      </div>
    );
  }

  // success
  return (
    <div className="space-y-2">
      <div className="rounded-md border border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-900 p-3 text-sm text-green-700 dark:text-green-300">
        Deposit confirmed.
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-zinc-500">Claim link</span>
        <input
          readOnly
          value={status.url}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs font-mono"
        />
      </label>
      <p className="text-xs text-zinc-500 break-all">
        Signature: <span className="font-mono">{status.signature}</span>
      </p>
    </div>
  );
}
