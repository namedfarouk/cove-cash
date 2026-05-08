"use client";

import { useMemo, useState } from "react";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { VersionedTransaction } from "@solana/web3.js";

import { useCoveLanguage } from "@/components/cove-language";
import {
  CoveNavbar,
  CovePage,
  PageReveal,
  PremiumCard,
  SectionEyebrow,
  fadeUp,
  primaryButtonClass,
} from "@/components/cove-ui";
import { decodeClaimBlob, type ClaimBlobV1 } from "@/lib/cove/claim-link";

const NATIVE_SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

type ClaimMetadata = {
  amount: string;
  mint: string;
  recipient: string;
  recentBlockhash: string;
  lastValidBlockHeight: number | null;
};

type ClaimPrepareResponse =
  | {
      mode: "user_sign";
      unsignedTransactionBase64: string;
      metadata: ClaimMetadata;
    }
  | {
      mode: "relay_submitted";
      signature: string;
      metadata: ClaimMetadata;
    };

type SubmissionMode = "user_sign" | "relay_submitted";

type Status =
  | { kind: "idle" }
  | { kind: "preparing" }
  | { kind: "signing" }
  | { kind: "submitting" }
  | { kind: "confirming"; signature: string }
  | { kind: "success"; signature: string; mode: SubmissionMode }
  | { kind: "error"; message: string };

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getTokenDisplayConfig(mint: string): {
  symbol: "SOL" | "USDC" | "USDT";
  decimals: number;
} {
  if (mint === USDC_MINT) return { symbol: "USDC", decimals: 6 };
  if (mint === USDT_MINT) return { symbol: "USDT", decimals: 6 };
  return { symbol: "SOL", decimals: 9 };
}

function formatTokenAmount(amountStr: string, decimals: number): string {
  const amount = BigInt(amountStr);
  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  const frac = amount % divisor;
  const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  return fracStr.length > 0 ? `${whole}.${fracStr}` : whole.toString();
}

export default function ClaimPage() {
  const params = useParams<{ blob: string }>();
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  const { t } = useCoveLanguage();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const decoded = useMemo<
    | { ok: true; blob: ClaimBlobV1 }
    | { ok: false; reason: string }
  >(() => {
    const raw = params?.blob;
    if (!raw || typeof raw !== "string") {
      return { ok: false, reason: t.claim.noPayloadInUrl };
    }
    try {
      const blob = decodeClaimBlob(raw);
      if (!blob.r) {
        return { ok: false, reason: t.claim.missingBlinding };
      }
      return { ok: true, blob };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, reason: `${t.claim.failedToDecodePrefix}${msg}` };
    }
  }, [params?.blob, t]);

  const claimDisplay = useMemo(() => {
    if (!decoded.ok) return null;
    const { symbol, decimals } = getTokenDisplayConfig(decoded.blob.mint);
    return {
      symbol,
      formattedAmount: formatTokenAmount(decoded.blob.amt, decimals),
    };
  }, [decoded]);

  const canClaim =
    decoded.ok &&
    connected &&
    publicKey &&
    signTransaction &&
    status.kind !== "preparing" &&
    status.kind !== "signing" &&
    status.kind !== "submitting" &&
    status.kind !== "confirming";

  async function handleClaim() {
    if (!decoded.ok || !publicKey || !signTransaction) return;
    const blob = decoded.blob;

    setStatus({ kind: "preparing" });
    try {
      const res = await fetch("/api/claim/prepare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          utxoOwnerPrivateKeyHex: blob.sk,
          blindingHex: blob.r,
          amount: blob.amt,
          mint: blob.mint,
          commitmentIndex: blob.idx,
          expectedCommitment: blob.cm,
          expectedSiblingCommitment: blob.sib,
          recipientWalletPublicKey: publicKey.toBase58(),
        }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errBody.error ?? `prepare failed: ${res.status}`);
      }
      const prepared = (await res.json()) as ClaimPrepareResponse;

      let signature: string;
      let confirmBlockhash = prepared.metadata.recentBlockhash;
      let confirmLastValidBlockHeight =
        prepared.metadata.lastValidBlockHeight ?? 0;

      if (prepared.mode === "relay_submitted") {
        signature = prepared.signature;
      } else {
        const tx = VersionedTransaction.deserialize(
          base64ToBytes(prepared.unsignedTransactionBase64),
        );
        const refreshed = await connection.getLatestBlockhash("confirmed");
        tx.message.recentBlockhash = refreshed.blockhash;
        confirmBlockhash = refreshed.blockhash;
        confirmLastValidBlockHeight = refreshed.lastValidBlockHeight;

        setStatus({ kind: "signing" });
        const signed = await signTransaction(tx);

        setStatus({ kind: "submitting" });
        signature = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: false,
        });
      }

      setStatus({ kind: "confirming", signature });
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: confirmBlockhash,
          lastValidBlockHeight: confirmLastValidBlockHeight,
        },
        "confirmed",
      );
      if (confirmation.value.err) {
        throw new Error(
          `confirmation error: ${JSON.stringify(confirmation.value.err)}`,
        );
      }

      console.log(
        `[cove/claim] withdraw signature (${prepared.mode}):`,
        signature,
      );
      setStatus({ kind: "success", signature, mode: prepared.mode });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Claim Flow Error:", err);
      setStatus({
        kind: "error",
        message: err instanceof Error ? `Claim failed: ${err.message}` : `Claim failed: ${String(err)}`,
      });
    }
  }

  return (
    <CovePage
      navbar={
        <CoveNavbar
          cta={{ label: t.nav.sendPayment, href: "/send" }}
          walletSlot={<WalletMultiButton />}
        />
      }
      contentClassName="flex items-center py-10 sm:py-14"
    >
      <PageReveal className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.section variants={fadeUp} className="self-center">
          <SectionEyebrow>{t.claim.eyebrow}</SectionEyebrow>
          <h1 className="mt-6 max-w-xl font-syne text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-white sm:text-5xl">
            {t.claim.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl font-inter text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {t.claim.heroBody}
          </p>

          <div className="mt-8 space-y-3">
            {[t.claim.bullet1, t.claim.bullet2, t.claim.bullet3].map((copy) => (
              <div
                key={copy}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-inter text-sm text-zinc-600 dark:border-white/20 dark:bg-black/40 dark:text-zinc-400"
              >
                {copy}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={fadeUp}>
          <PremiumCard>
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-inter text-sm text-zinc-500">
                    {t.claim.redemptionModule}
                  </p>
                  <h2 className="mt-2 font-syne text-2xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                    {t.claim.claimAPrivatePayment}
                  </h2>
                </div>
                <span className="rounded-full border border-zinc-200 bg-black/[0.02] px-3 py-1 font-inter text-xs font-medium text-cove-accent dark:border-white/20 dark:bg-white/[0.04]">
                  {t.claim.privateSpend}
                </span>
              </div>

              {!decoded.ok ? (
                <Notice tone="error" className="mt-8">
                  {decoded.reason}
                </Notice>
              ) : (
                <>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/20 dark:bg-black/40">
                      <p className="font-inter text-xs uppercase tracking-[0.2em] text-zinc-500">
                        {t.claim.amountLabel}
                      </p>
                      <p className="mt-3 font-syne text-3xl font-semibold tracking-tighter tabular-nums text-zinc-900 dark:text-white">
                        {claimDisplay?.formattedAmount} {claimDisplay?.symbol}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/20 dark:bg-black/40">
                      <p className="font-inter text-xs uppercase tracking-[0.2em] text-zinc-500">
                        {t.claim.delivery}
                      </p>
                      <div className="mt-3 flex items-center gap-2 font-inter text-sm font-medium text-zinc-600 dark:text-zinc-300">
                        <ShieldCheck className="h-4 w-4 text-cove-accent" />
                        {t.claim.encryptedWitness}
                      </div>
                    </div>
                  </div>

                  {connected && publicKey ? (
                    <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-inter text-sm text-zinc-600 dark:border-white/20 dark:bg-black/40 dark:text-zinc-400">
                      <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-white">
                        <Wallet className="h-4 w-4" />
                        {t.claim.recipientWallet}
                      </div>
                      <p className="mt-2 break-all font-mono text-xs">
                        {publicKey.toBase58()}
                      </p>
                    </div>
                  ) : null}

                  <motion.button
                    whileHover={canClaim ? { scale: 1.01 } : undefined}
                    whileTap={canClaim ? { scale: 0.995 } : undefined}
                    onClick={handleClaim}
                    disabled={!canClaim}
                    className={`${primaryButtonClass} mt-6 w-full`}
                  >
                    {t.claim.claimToMyWallet}
                    <Sparkles className="h-4 w-4" />
                  </motion.button>

                  <div className="mt-6">
                    <ClaimStatusPanel status={status} connected={connected} />
                  </div>
                </>
              )}
            </div>
          </PremiumCard>
        </motion.section>
      </PageReveal>
    </CovePage>
  );
}

function ClaimStatusPanel({
  status,
  connected,
}: {
  status: Status;
  connected: boolean;
}) {
  const { t } = useCoveLanguage();
  if (status.kind === "idle") {
    return (
      <Notice tone="neutral">
        {connected ? t.claim.readyToClaim : t.claim.connectWalletToBegin}
      </Notice>
    );
  }
  if (status.kind === "preparing") {
    return <Notice tone="neutral">{t.claim.preparingClaim}</Notice>;
  }
  if (status.kind === "signing") {
    return <Notice tone="neutral">{t.claim.waitingForSignature}</Notice>;
  }
  if (status.kind === "submitting") {
    return <Notice tone="neutral">{t.claim.submittingTransaction}</Notice>;
  }
  if (status.kind === "confirming") {
    return (
      <Notice tone="neutral">
        {t.claim.confirmingOnChain}
        <span className="ml-1 font-mono text-xs">{status.signature.slice(0, 12)}…</span>
      </Notice>
    );
  }
  if (status.kind === "error") {
    return <Notice tone="error">{status.message}</Notice>;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-inter text-sm text-zinc-900 dark:border-white/20 dark:bg-black/40 dark:text-white">
      <div className="flex items-center gap-2 font-medium">
        <CheckCircle2 className="h-4 w-4 text-cove-accent" />
        {t.claim.claimConfirmed}
      </div>
      {status.mode === "relay_submitted" ? (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {t.claim.claimedViaRelay}
        </p>
      ) : null}
      <p className="break-all text-xs">
        {t.claim.signatureLabel} <span className="font-mono">{status.signature}</span>
      </p>
      <a
        className="inline-flex items-center gap-1 text-xs underline text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
        href={`https://solscan.io/tx/${status.signature}`}
        target="_blank"
        rel="noreferrer"
      >
        {t.claim.viewOnSolscan}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function Notice({
  children,
  tone,
  className = "",
}: {
  children: React.ReactNode;
  tone: "neutral" | "error";
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 font-inter text-sm ${
        tone === "error"
          ? "border-cove-accent/40 bg-cove-accent/10 text-cove-accent dark:text-red-400"
          : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-white/20 dark:bg-black/40 dark:text-zinc-400"
      } ${className}`}
    >
      {children}
    </div>
  );
}
