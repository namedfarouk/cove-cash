"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { motion } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, ChevronDown, Copy, Wallet } from "lucide-react";
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
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/cove-ui";
import { buildClaimUrl } from "@/lib/cove/claim-link";
import { persistDeposit, type PersistedDeposit } from "@/lib/cove/storage";

type TokenTicker = "SOL" | "USDC" | "USDT";

const TOKEN_CONFIG: Record<
  TokenTicker,
  {
    mintAddress?: string;
    minimumAtomic: bigint;
    minimumDisplay: number;
    decimals: number;
    step: string;
  }
> = {
  SOL: {
    minimumAtomic: 20_000_000n,
    minimumDisplay: 0.02,
    decimals: 9,
    step: "0.001",
  },
  USDC: {
    mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    minimumAtomic: 1_000_000n,
    minimumDisplay: 1,
    decimals: 6,
    step: "0.01",
  },
  USDT: {
    mintAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    minimumAtomic: 1_000_000n,
    minimumDisplay: 1,
    decimals: 6,
    step: "0.01",
  },
};

const TOKEN_OPTIONS = Object.keys(TOKEN_CONFIG) as TokenTicker[];

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

function decimalToAtomicUnits(value: string, decimals: number): bigint | null {
  const trimmed = value.trim();
  if (!trimmed || !/^\d*\.?\d*$/.test(trimmed)) return null;

  const [whole = "0", fraction = ""] = trimmed.split(".");
  if (fraction.length > decimals) return null;

  const normalizedWhole = whole === "" ? "0" : whole;
  const atomicUnits = `${normalizedWhole}${fraction.padEnd(decimals, "0")}`
    .replace(/^0+(?=\d)/, "");

  return BigInt(atomicUnits || "0");
}

export default function SendPage() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  const { language, t } = useCoveLanguage();
  const [amountInput, setAmountInput] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<TokenTicker>("SOL");
  const [tokenMenuOpen, setTokenMenuOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const tokenMenuRef = useRef<HTMLDivElement | null>(null);
  const tokenConfig = TOKEN_CONFIG[selectedToken];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!tokenMenuRef.current?.contains(event.target as Node)) {
        setTokenMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setTokenMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const amountLabel = useMemo(() => {
    if (t.send.amount.includes("(")) {
      return t.send.amount.replace(/\(([^)]+)\)/, `(${selectedToken})`);
    }
    return `${t.send.amount} (${selectedToken})`;
  }, [selectedToken, t.send.amount]);

  const minimumLabel = useMemo(() => {
    const minimum = tokenConfig.minimumDisplay.toFixed(2);
    const formattedMinimum =
      language === "fr" ? minimum.replace(".", ",") : minimum;
    return `Minimum ${formattedMinimum} ${selectedToken}`;
  }, [language, selectedToken, tokenConfig.minimumDisplay]);

  const amountAtomic = useMemo<bigint | null>(() => {
    const parsed = decimalToAtomicUnits(amountInput, tokenConfig.decimals);
    if (parsed === null || parsed < tokenConfig.minimumAtomic) return null;
    return parsed;
  }, [amountInput, tokenConfig.decimals, tokenConfig.minimumAtomic]);

  const canSubmit =
    connected &&
    publicKey &&
    signTransaction &&
    amountAtomic !== null &&
    status.kind !== "preparing" &&
    status.kind !== "signing" &&
    status.kind !== "submitting" &&
    status.kind !== "confirming";

  async function handleGenerate() {
    if (!publicKey || !signTransaction || amountAtomic === null) return;

    setStatus({ kind: "preparing" });
    try {
      const res = await fetch("/api/deposit/prepare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amountLamports: amountAtomic.toString(),
          depositorPublicKey: publicKey.toBase58(),
          mintAddress: tokenConfig.mintAddress,
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
          walletSlot={<WalletMultiButton startIcon={<Wallet className="h-4 w-4" />} />}
        />
      }
      contentClassName="flex items-center py-10 sm:py-14"
    >
      <PageReveal className="mx-auto w-full max-w-xl">
        <motion.section variants={fadeUp}>
          <PremiumCard>
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-inter text-sm text-zinc-500">
                    {t.send.liveTransferComposer}
                  </p>
                  <h2 className="mt-2 font-syne text-2xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                    {t.send.sendPrivatePayment}
                  </h2>
                </div>
                <span className="rounded-full border border-zinc-200 bg-black/[0.02] px-3 py-1 font-inter text-xs font-medium text-cove-accent dark:border-white/20 dark:bg-white/[0.04]">
                  Mainnet
                </span>
              </div>

              <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/20 dark:bg-black/40">
                <label className="block space-y-3">
                  <span className="font-syne text-sm font-semibold tracking-tight text-zinc-700 dark:text-zinc-300">
                    {amountLabel}
                  </span>
                  <div ref={tokenMenuRef} className="relative">
                    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition-colors duration-200 focus-within:border-cove-accent dark:border-white/20 dark:bg-[#070707]">
                      <input
                        type="number"
                        min={tokenConfig.minimumDisplay}
                        step={tokenConfig.step}
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder={tokenConfig.minimumDisplay.toFixed(2)}
                        className="min-w-0 flex-1 bg-transparent font-syne text-lg font-medium tracking-tight text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-white"
                      />
                      <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={tokenMenuOpen}
                        onClick={() => setTokenMenuOpen((current) => !current)}
                        className="flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                      >
                        <span>{selectedToken}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            tokenMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {tokenMenuOpen ? (
                      <div className="absolute right-0 top-full z-20 mt-3 w-40 rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-white shadow-2xl">
                        {TOKEN_OPTIONS.map((token) => (
                          <button
                            key={token}
                            type="button"
                            onClick={() => {
                              setSelectedToken(token);
                              setTokenMenuOpen(false);
                              setStatus({ kind: "idle" });
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors ${
                              token === selectedToken
                                ? "bg-zinc-800 text-[#DA4022]"
                                : "text-white hover:bg-zinc-800 hover:text-[#DA4022]"
                            }`}
                          >
                            <span>{token}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <span className="font-inter text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {minimumLabel}
                  </span>
                </label>

                <motion.button
                  whileHover={canSubmit ? { scale: 1.01 } : undefined}
                  whileTap={canSubmit ? { scale: 0.995 } : undefined}
                  onClick={handleGenerate}
                  disabled={!canSubmit}
                  className={`${primaryButtonClass} mt-6 w-full`}
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
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;

    const timeout = window.setTimeout(() => {
      setIsCopied(false);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
  }

  if (status.kind === "idle") {
    if (!connected) {
      return (
        <div className="w-full [&_.wallet-adapter-button]:flex [&_.wallet-adapter-button]:w-full [&_.wallet-adapter-button]:justify-center [&_.wallet-adapter-button]:items-center [&_.wallet-adapter-button]:rounded-xl [&_.wallet-adapter-button]:px-4 [&_.wallet-adapter-button]:py-3 [&_.wallet-adapter-button]:font-syne [&_.wallet-adapter-button]:font-bold [&_.wallet-adapter-button]:bg-zinc-900 [&_.wallet-adapter-button]:text-white [&_.wallet-adapter-button]:transition-colors hover:[&_.wallet-adapter-button]:bg-zinc-800 dark:[&_.wallet-adapter-button]:bg-white dark:[&_.wallet-adapter-button]:text-zinc-900 dark:hover:[&_.wallet-adapter-button]:bg-zinc-200 [&_.wallet-adapter-button-trigger]:flex [&_.wallet-adapter-button-trigger]:w-full [&_.wallet-adapter-button-trigger]:justify-center [&_.wallet-adapter-button-trigger]:items-center [&_.wallet-adapter-button-trigger]:rounded-xl [&_.wallet-adapter-button-trigger]:px-4 [&_.wallet-adapter-button-trigger]:py-3 [&_.wallet-adapter-button-trigger]:font-syne [&_.wallet-adapter-button-trigger]:font-bold [&_.wallet-adapter-button-trigger]:bg-zinc-900 [&_.wallet-adapter-button-trigger]:text-white [&_.wallet-adapter-button-trigger]:transition-colors hover:[&_.wallet-adapter-button-trigger]:bg-zinc-800 dark:[&_.wallet-adapter-button-trigger]:bg-white dark:[&_.wallet-adapter-button-trigger]:text-zinc-900 dark:hover:[&_.wallet-adapter-button-trigger]:bg-zinc-200">
          <WalletMultiButton startIcon={<Wallet className="h-4 w-4" />} />
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-inter text-sm text-zinc-600 dark:border-white/20 dark:bg-black/40 dark:text-zinc-400 text-center flex justify-center items-center w-full">
        {t.send.readyToPrepare}
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
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-inter text-sm text-zinc-900 dark:border-white/20 dark:bg-black/40 dark:text-white">
      <div className="flex items-center gap-2 font-medium">
        <CheckCircle2 className="h-4 w-4 text-cove-accent" />
        {t.send.depositConfirmed}
      </div>

      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          {t.send.claimLinkLabel}
        </span>
        <div className="flex gap-2">
          <input
            readOnly
            value={status.url}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-xs font-mono text-zinc-900 outline-none dark:border-white/20 dark:bg-[#070707] dark:text-zinc-100"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            type="button"
            onClick={() => handleCopy(status.url)}
            className={`${secondaryButtonClass} rounded-2xl px-3 transition-colors ${
              isCopied
                ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                : ""
            }`}
          >
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </motion.button>
        </div>
      </label>

      <p className="break-all text-xs text-zinc-600 dark:text-zinc-400">
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
