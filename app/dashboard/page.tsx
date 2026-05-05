"use client";

import { useEffect, useState } from "react";

import { useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

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
  // Derived
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
      // Required fields for verifyUtxos lookup. Skip entries missing any of
      // them — they can't be checked on chain.
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
  // Newest first by leaf index. Approximate but close enough.
  rows.sort((a, b) => b.index - a.index);
  return rows;
}

export default function DashboardPage() {
  const { connection } = useConnection();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [exporting, setExporting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<Record<number, string>>({});

  useEffect(() => {
    const rows = readDepositedFromStorage();
    if (rows.length === 0) {
      setState({ kind: "empty" });
      return;
    }
    // Show rows immediately in loading state, then fill in status.
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
    setCopyFeedback((prev) => ({ ...prev, [row.index]: "loading..." }));
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
        setCopyFeedback((prev) => ({ ...prev, [row.index]: "copied" }));
        setTimeout(
          () => setCopyFeedback((prev) => ({ ...prev, [row.index]: "" })),
          2000,
        );
        return;
      }

      // Older entries do not include `r`, so recover it from serializedB64.
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
      setCopyFeedback((prev) => ({ ...prev, [row.index]: "copied" }));
      setTimeout(
        () => setCopyFeedback((prev) => ({ ...prev, [row.index]: "" })),
        2000,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setCopyFeedback((prev) => ({ ...prev, [row.index]: `error: ${message}` }));
    }
  }

  async function handleExportCsv() {
    if (state.kind !== "ready") return;
    setExporting(true);
    try {
      // Fetch deposit timestamps lazily — N parallel getTransaction calls.
      // Pass maxSupportedTransactionVersion: 0 because our deposits are V0.
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
        // claim_signature isn't tracked client-side in v1.
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/send" className="text-xl font-semibold tracking-tight">
          Cove
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/send" className="text-sm text-zinc-500 hover:underline">
            Send
          </Link>
          <WalletMultiButton />
        </div>
      </header>

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto w-full max-w-4xl space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Your deposits</h1>
            {state.kind === "ready" && state.rows.length > 0 && (
              <button
                onClick={handleExportCsv}
                disabled={exporting}
                className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50"
              >
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
            )}
          </div>

          {state.kind === "loading" && (
            <p className="text-sm text-zinc-500">Reading local deposits...</p>
          )}

          {state.kind === "empty" && (
            <p className="text-sm text-zinc-500">
              No deposits found. Make one at{" "}
              <Link href="/send" className="underline">
                /send
              </Link>
              .
            </p>
          )}

          {state.kind === "error" && (
            <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300">
              {state.message}
            </div>
          )}

          {state.kind === "ready" && state.rows.length > 0 && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 font-medium">Mint</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">
                      Deposit tx
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.rows.map((row) => (
                    <tr
                      key={row.index}
                      className="border-t border-zinc-200 dark:border-zinc-800"
                    >
                      <td className="px-4 py-3 tabular-nums">
                        {lamportsToSol(row.amount)} SOL
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {row.mint.slice(0, 4)}…{row.mint.slice(-4)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://solscan.io/tx/${row.depositSignature}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs underline text-zinc-500"
                        >
                          {row.depositSignature.slice(0, 8)}…
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleCopyClaimLink(row)}
                          className="rounded-md border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        >
                          {copyFeedback[row.index] || "Copy claim link"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: Row["status"] }) {
  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
        <span className="inline-block w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
        Checking...
      </span>
    );
  }
  if (status === "claimed") {
    return (
      <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
        <span className="inline-block w-2 h-2 rounded-full bg-zinc-400" />
        Claimed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
      <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
      Pending claim
    </span>
  );
}
