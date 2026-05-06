"use client";

import { useMemo, useState } from "react";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Copy } from "lucide-react";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { VersionedTransaction } from "@solana/web3.js";

import { useCoveLanguage } from "@/components/cove-language";
import {
  CoveNavbar,
  CovePage,
  PageReveal,
  PremiumCard,
  fadeUp,
} from "@/components/cove-ui";
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
  const { t } = useCoveLanguage();
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

      const persisted: PersistedDeposit = {
        state: "pending_deposit",
        serializedB64: prepared.utxoSerializedBase64,
        amount: prepared.metadata.amount,
        mint: prepared.metadata.mint,
        ownerPublicKeyHex: prepared.utxoOwnerPublicKeyHex,
        ownerPrivateKeyHex: prepared.utxoOwnerPrivateKeyHex,
        r: prepared.utxoBlindingHex,
        index: prepared.metadata.commitmentIndex,
        commitment: prepared.metadata.expectedCommitment,
        siblingCommitment: prepared.metadata.expectedSiblingCommitment,
      };
      const storageKey = persistDeposit(persisted);

      const tx = VersionedTransaction.deserialize(
        base64ToBytes(prepared.unsignedTransactionBase64),
      );
      const { blockhash: freshBlockhash, lastValidBlockHeight: freshLastValid } =
        await connection.getLatestBlockhash("confirmed");
      tx.message.recentBlockhash = freshBlockhash;

      setStatus({ kind: "signing" });
      const signed = await signTransaction(tx);

      setStatus({ kind: "submitting" });
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
      });

      setStatus({ kind: "confirming", signature });
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: freshBlockhash,
          lastValidBlockHeight: freshLastValid,
        },
        "confirmed",
      );
      if (confirmation.value.err) {
        throw new Error(
          `confirmation error: ${JSON.stringify(confirmation.value.err)}`,
        );
      }

      persistDeposit({
        ...persisted,
        state: "deposited",
        depositSignature: signature,
      });

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
    <CovePage
      navbar={
        <CoveNavbar
          cta={{ label: t.nav.dashboard, href: "/dashboard" }}
          walletSlot={<WalletMultiButton />}
        />
      }
      contentClassName="flex items-center py-10 sm:py-14"
    >
      <PageReveal className="mx-auto w-full max-w-xl">
        <motion.section variants={fadeUp}>
          <PremiumCard className="border-emerald-500/20 dark:border-emerald-400/20">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    {t.send.liveTransferComposer}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">
                    {t.send.sendPrivatePayment}
                  </h2>
                </div>
                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
                  Mainnet
                </span>
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-zinc-200 bg-zinc-50/80 p-5 dark:border-white/8 dark:bg-white/[0.03]">
                <label className="block space-y-3">
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {t.send.amount}
                  </span>
                  <input
                    type="number"
                    min={MIN_SOL}
                    step="0.001"
                    value={amountSol}
                    onChange={(e) => setAmountSol(e.target.value)}
                    placeholder={MIN_SOL.toString()}
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-lg font-medium text-zinc-950 outline-none transition-colors duration-200 placeholder:text-zinc-400 focus:border-emerald-500 dark:border-white/10 dark:bg-black/30 dark:text-white dark:focus:border-emerald-300"
                  />
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t.send.minimumSol}
                  </span>
                </label>

                <motion.button
                  whileHover={canSubmit ? { scale: 1.01 } : undefined}
                  whileTap={canSubmit ? { scale: 0.995 } : undefined}
                  onClick={handleGenerate}
                  disabled={!canSubmit}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-400 dark:text-zinc-950 dark:hover:bg-emerald-300"
                >
                  {t.send.generateClaimLink}
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>

              <div className="mt-6">
                <StatusPanel status={status} connected={connected} />
              </div>
            </div>
          </PremiumCard>
        </motion.section>
      </PageReveal>
    </CovePage>
  );
}

function StatusPanel({
  status,
  connected,
}: {
  status: Status;
  connected: boolean;
}) {
  const { t } = useCoveLanguage();
  if (status.kind === "idle") {
    return (
      <div className="rounded-[1.5rem] border border-zinc-200 bg-white/70 p-4 text-sm text-zinc-600 shadow-[0_12px_30px_rgba(15,23,42,0.04)] dark:border-white/8 dark:bg-white/[0.03] dark:text-zinc-400 dark:shadow-none">
        {connected ? t.send.readyToPrepare : t.send.connectWalletToBegin}
      </div>
    );
  }

  if (status.kind === "preparing") {
    return <InlineNotice tone="neutral">{t.send.preparingDeposit}</InlineNotice>;
  }
  if (status.kind === "signing") {
    return <InlineNotice tone="neutral">{t.send.waitingForSignature}</InlineNotice>;
  }
  if (status.kind === "submitting") {
    return <InlineNotice tone="neutral">{t.send.submittingTransaction}</InlineNotice>;
  }
  if (status.kind === "confirming") {
    return (
      <InlineNotice tone="neutral">
        {t.send.confirmingOnChain}
        <span className="ml-1 font-mono text-xs">{status.signature.slice(0, 12)}…</span>
      </InlineNotice>
    );
  }
  if (status.kind === "error") {
    return <InlineNotice tone="error">{status.message}</InlineNotice>;
  }

  return (
    <div className="space-y-4 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
      <div className="flex items-center gap-2 font-medium">
        <CheckCircle2 className="h-4 w-4" />
        {t.send.depositConfirmed}
      </div>

      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-emerald-700/80 dark:text-emerald-300/80">
          {t.send.claimLinkLabel}
        </span>
        <div className="flex gap-2">
          <input
            readOnly
            value={status.url}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-2xl border border-emerald-500/20 bg-white/80 px-3 py-3 text-xs font-mono text-zinc-900 outline-none dark:border-white/10 dark:bg-black/20 dark:text-zinc-100"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            type="button"
            onClick={() => navigator.clipboard.writeText(status.url)}
            className="inline-flex items-center justify-center rounded-2xl border border-emerald-500/20 bg-white/70 px-3 text-zinc-900 transition-colors duration-200 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <Copy className="h-4 w-4" />
          </motion.button>
        </div>
      </label>

      <p className="break-all text-xs text-emerald-800/80 dark:text-emerald-200/80">
        {t.send.signatureLabel} <span className="font-mono">{status.signature}</span>
      </p>
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        {t.send.openDashboardPrefix}
        <Link href="/dashboard" className="underline">
          {t.send.dashboardLinkText}
        </Link>
        {t.send.openDashboardSuffix}
      </p>
    </div>
  );
}

function InlineNotice({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "neutral" | "error";
}) {
  return (
    <div
      className={`rounded-[1.5rem] border p-4 text-sm shadow-[0_12px_30px_rgba(15,23,42,0.04)] dark:shadow-none ${
        tone === "error"
          ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          : "border-zinc-200 bg-white/70 text-zinc-600 dark:border-white/8 dark:bg-white/[0.03] dark:text-zinc-400"
      }`}
    >
      {children}
    </div>
  );
}
