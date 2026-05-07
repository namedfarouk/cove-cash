"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  Link2,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { useCoveLanguage } from "@/components/cove-language";
import {
  CoveNavbar,
  CovePage,
  PageReveal,
  PremiumCard,
  SectionEyebrow,
  fadeUp,
  secondaryButtonClass,
} from "@/components/cove-ui";
import { buildClaimUrl } from "@/lib/cove/claim-link";
import { type PersistedDeposit } from "@/lib/cove/storage";

const STORAGE_KEY_PREFIX = "cove:pending-utxo:";

type Row = {
  ownerPublicKeyHex: string;
  index: number;
  amount: string;
  mint: string;
  commitment: string;
  siblingCommitment: string;
  ownerPrivateKeyHex: string;
  r?: string;
  depositSignature: string;
  serializedB64: string;
  status: "loading" | "pending" | "claimed";
};

type LoadState =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "ready"; rows: Row[] }
  | { kind: "error"; message: string };

function lamportsToSol(lamportsStr: string): string {
  const lamports = BigInt(lamportsStr);
  const whole = lamports / 1_000_000_000n;
  const frac = lamports % 1_000_000_000n;
  const fracStr = frac.toString().padStart(9, "0").replace(/0+$/, "");
  return fracStr.length > 0 ? `${whole}.${fracStr}` : whole.toString();
}

function readDepositedFromStorage(): Row[] {
  const rows: Row[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(STORAGE_KEY_PREFIX)) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const entry = JSON.parse(raw) as PersistedDeposit;
      if (entry.state !== "deposited") continue;
      if (
        entry.index === undefined ||
        !entry.commitment ||
        !entry.siblingCommitment ||
        !entry.depositSignature
      ) {
        continue;
      }
      rows.push({
        ownerPublicKeyHex: entry.ownerPublicKeyHex,
        index: entry.index,
        amount: entry.amount,
        mint: entry.mint,
        commitment: entry.commitment,
        siblingCommitment: entry.siblingCommitment,
        ownerPrivateKeyHex: entry.ownerPrivateKeyHex,
        r: entry.r,
        depositSignature: entry.depositSignature,
        serializedB64: entry.serializedB64,
        status: "loading",
      });
    } catch {
      // Skip malformed entry
    }
  }
  rows.sort((a, b) => b.index - a.index);
  return rows;
}

export default function DashboardPage() {
  const { connection } = useConnection();
  const { t } = useCoveLanguage();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [exporting, setExporting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<Record<number, string>>({});

  useEffect(() => {
    const rows = readDepositedFromStorage();
    if (rows.length === 0) {
      setState({ kind: "empty" });
      return;
    }
    setState({ kind: "ready", rows });

    (async () => {
      try {
        const res = await fetch("/api/dashboard/status", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            utxos: rows.map((r) => ({
              index: r.index,
              ownerPrivateKeyHex: r.ownerPrivateKeyHex,
              commitment: r.commitment,
              siblingCommitment: r.siblingCommitment,
              amount: r.amount,
              mint: r.mint,
              depositSignature: r.depositSignature,
              state: "deposited" as const,
            })),
          }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(err.error ?? `status fetch failed: ${res.status}`);
        }
        const data = (await res.json()) as {
          statuses: { index: number; claimed: boolean }[];
        };
        const byIndex = new Map(data.statuses.map((s) => [s.index, s.claimed]));
        setState({
          kind: "ready",
          rows: rows.map((r) => ({
            ...r,
            status: byIndex.get(r.index) ? "claimed" : "pending",
          })),
        });
      } catch (err) {
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    })();
  }, []);

  async function handleCopyClaimLink(row: Row) {
    setCopyFeedback((prev) => ({ ...prev, [row.index]: t.dashboard.loadingState }));
    try {
      if (row.r) {
        const claimUrl = buildClaimUrl({
          v: 1,
          sk: row.ownerPrivateKeyHex,
          r: row.r,
          amt: row.amount,
          mint: row.mint,
          idx: row.index,
          cm: row.commitment,
          sib: row.siblingCommitment,
          sig: row.depositSignature,
        });
        await navigator.clipboard.writeText(claimUrl);
        setCopyFeedback((prev) => ({ ...prev, [row.index]: t.dashboard.copied }));
        setTimeout(
          () => setCopyFeedback((prev) => ({ ...prev, [row.index]: "" })),
          2000,
        );
        return;
      }

      const res = await fetch("/api/recover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serializedB64: row.serializedB64,
          ownerPrivateKeyHex: row.ownerPrivateKeyHex,
          amount: row.amount,
          mint: row.mint,
          index: row.index,
          commitment: row.commitment,
          siblingCommitment: row.siblingCommitment,
          depositSignature: row.depositSignature,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `recover failed: ${res.status}`);
      }
      const data = (await res.json()) as { claimUrl: string };
      await navigator.clipboard.writeText(data.claimUrl);
      setCopyFeedback((prev) => ({ ...prev, [row.index]: "Copied" }));
      setTimeout(
        () => setCopyFeedback((prev) => ({ ...prev, [row.index]: "" })),
        2000,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setCopyFeedback((prev) => ({
        ...prev,
        [row.index]: `${t.dashboard.errorPrefix}${message}`,
      }));
    }
  }

  async function handleExportCsv() {
    if (state.kind !== "ready") return;
    setExporting(true);
    try {
      const sigs = state.rows.map((r) => r.depositSignature);
      const txs = await Promise.all(
        sigs.map(async (sig) => {
          try {
            return await connection.getTransaction(sig, {
              maxSupportedTransactionVersion: 0,
              commitment: "confirmed",
            });
          } catch {
            return null;
          }
        }),
      );
      const dateBySig = new Map<string, string>();
      for (let i = 0; i < sigs.length; i++) {
        const t = txs[i]?.blockTime;
        if (t) dateBySig.set(sigs[i], new Date(t * 1000).toISOString());
      }

      const header = [
        "date",
        "amount_sol",
        "mint",
        "status",
        "deposit_signature",
        "claim_signature",
        "commitment_index",
      ].join(",");
      const lines = state.rows.map((r) => {
        const date = dateBySig.get(r.depositSignature) ?? "";
        const status = r.status === "claimed" ? "claimed" : "pending";
        return [
          date,
          lamportsToSol(r.amount),
          r.mint,
          status,
          r.depositSignature,
          "",
          r.index,
        ].join(",");
      });
      const csv = [header, ...lines].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cove-compliance-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const rows = state.kind === "ready" ? state.rows : [];
  const pendingCount = rows.filter((row) => row.status === "pending").length;
  const claimedCount = rows.filter((row) => row.status === "claimed").length;

  return (
    <CovePage
      navbar={
        <CoveNavbar
          cta={{ label: t.nav.sendPayment, href: "/send" }}
          walletSlot={<WalletMultiButton />}
        />
      }
      contentClassName="py-10 sm:py-14"
    >
      <PageReveal className="space-y-8">
        <motion.section variants={fadeUp} className="max-w-3xl">
          <SectionEyebrow>{t.dashboard.eyebrow}</SectionEyebrow>
          <h1 className="mt-6 font-syne text-4xl font-semibold tracking-tighter text-white sm:text-5xl">
            {t.dashboard.title}
          </h1>
          <p className="mt-4 max-w-2xl font-inter text-base leading-7 text-zinc-400">
            {t.dashboard.subtitle}
          </p>
        </motion.section>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: WalletCards,
              label: t.dashboard.trackedDeposits,
              value: rows.length.toString(),
            },
            {
              icon: Clock3,
              label: t.dashboard.pendingClaims,
              value: pendingCount.toString(),
            },
            {
              icon: CheckCircle2,
              label: t.dashboard.claimedStat,
              value: claimedCount.toString(),
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.label} variants={fadeUp}>
                <PremiumCard>
                  <div className="p-5">
                    <Icon className="h-5 w-5 text-cove-accent" />
                    <p className="mt-4 font-inter text-sm text-zinc-500">
                      {item.label}
                    </p>
                    <p className="mt-1 font-syne text-3xl font-semibold tracking-tighter text-white">
                      {item.value}
                    </p>
                  </div>
                </PremiumCard>
              </motion.div>
            );
          })}
        </div>

        <motion.section variants={fadeUp}>
          <PremiumCard>
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-inter text-sm text-zinc-500">
                    {t.dashboard.complianceSafeExport}
                  </p>
                  <h2 className="mt-2 font-syne text-2xl font-semibold tracking-tighter text-white">
                    {t.dashboard.depositActivity}
                  </h2>
                </div>

                {state.kind === "ready" && state.rows.length > 0 ? (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    onClick={handleExportCsv}
                    disabled={exporting}
                    className={secondaryButtonClass}
                  >
                    <Download className="h-4 w-4" />
                    {exporting ? t.dashboard.exporting : t.dashboard.exportCsv}
                  </motion.button>
                ) : null}
              </div>

              {state.kind === "loading" ? (
                <Notice tone="neutral">{t.dashboard.readingLocal}</Notice>
              ) : null}

              {state.kind === "empty" ? (
                <Notice tone="neutral">
                  {t.dashboard.noDepositsFoundPrefix}
                  <Link href="/send" className="underline">
                    {t.dashboard.noDepositsFoundLinkLabel}
                  </Link>
                  .
                </Notice>
              ) : null}

              {state.kind === "error" ? (
                <Notice tone="error">{state.message}</Notice>
              ) : null}

              {state.kind === "ready" && state.rows.length > 0 ? (
                <div className="mt-8 space-y-3">
                  <div className="hidden grid-cols-[1.1fr_1fr_0.95fr_1fr_auto] gap-3 px-4 font-inter text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 md:grid">
                    <span>{t.dashboard.colAmount}</span>
                    <span>{t.dashboard.colMint}</span>
                    <span>{t.dashboard.colStatus}</span>
                    <span>{t.dashboard.colDepositTx}</span>
                    <span>{t.dashboard.colActions}</span>
                  </div>

                  {state.rows.map((row) => (
                    <motion.div
                      whileHover={{ scale: 1.005 }}
                      key={row.index}
                      className="grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 transition-colors duration-200 hover:bg-white/[0.04] md:grid-cols-[1.1fr_1fr_0.95fr_1fr_auto] md:items-center"
                    >
                      <div>
                        <p className="font-inter text-xs uppercase tracking-[0.2em] text-zinc-500 md:hidden">
                          {t.dashboard.colAmount}
                        </p>
                        <p className="font-syne tabular-nums text-base font-semibold tracking-tight text-white">
                          {lamportsToSol(row.amount)} SOL
                        </p>
                      </div>

                      <div>
                        <p className="font-inter text-xs uppercase tracking-[0.2em] text-zinc-500 md:hidden">
                          {t.dashboard.colMint}
                        </p>
                        <p className="font-mono text-sm text-zinc-300">
                          {row.mint.slice(0, 4)}…{row.mint.slice(-4)}
                        </p>
                      </div>

                      <div>
                        <p className="font-inter text-xs uppercase tracking-[0.2em] text-zinc-500 md:hidden">
                          {t.dashboard.colStatus}
                        </p>
                        <StatusBadge status={row.status} />
                      </div>

                      <div>
                        <p className="font-inter text-xs uppercase tracking-[0.2em] text-zinc-500 md:hidden">
                          {t.dashboard.colDepositTx}
                        </p>
                        <a
                          href={`https://solscan.io/tx/${row.depositSignature}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-sm text-zinc-300 transition hover:text-white"
                        >
                          {row.depositSignature.slice(0, 8)}…
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          type="button"
                          onClick={() => handleCopyClaimLink(row)}
                          className={`${secondaryButtonClass} px-3 py-2 text-xs`}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copyFeedback[row.index] || t.dashboard.copyClaimLink}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : null}
            </div>
          </PremiumCard>
        </motion.section>
      </PageReveal>
    </CovePage>
  );
}

function StatusBadge({ status }: { status: Row["status"] }) {
  const { t } = useCoveLanguage();
  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-inter text-xs text-zinc-300">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-zinc-400" />
        {t.dashboard.checkingBadge}
      </span>
    );
  }
  if (status === "claimed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-inter text-xs text-white">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {t.dashboard.claimedBadge}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-cove-accent/30 bg-cove-accent/10 px-3 py-1 font-inter text-xs text-cove-accent">
      <Link2 className="h-3.5 w-3.5" />
      {t.dashboard.pendingClaimBadge}
    </span>
  );
}

function Notice({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "neutral" | "error";
}) {
  return (
    <div
      className={`mt-6 rounded-2xl border p-4 font-inter text-sm ${
        tone === "error"
          ? "border-cove-accent/40 bg-cove-accent/10 text-white"
          : "border-white/10 bg-black/40 text-zinc-400"
      }`}
    >
      {children}
    </div>
  );
}
