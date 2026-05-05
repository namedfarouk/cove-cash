"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Bird,
  Check,
  ChevronDown,
  CodeXml,
  CopyCheck,
  Globe,
  LockKeyhole,
  Moon,
  Send,
  Sparkles,
  Sun,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

const steps = [
  {
    icon: Wallet,
    title: "Deposit",
    copy: "Connect your wallet and lock SOL in the Cove smart contract.",
  },
  {
    icon: LockKeyhole,
    title: "Generate Link",
    copy: "Cove creates a single-use, cryptographic claim link.",
  },
  {
    icon: Send,
    title: "Drop it in the DM",
    copy: "Send it anywhere. The receiver connects their wallet and claims instantly.",
  },
];

const comparisonRows = [
  {
    label: "Setup Time",
    oldWay: "Ask for address -> Wait -> Verify -> Send",
    cove: "Instantly generate link",
  },
  {
    label: "Recipient Action",
    oldWay: "Must provide pubkey upfront",
    cove: "Just click and claim",
  },
  {
    label: "Friction",
    oldWay: "High",
    cove: "Zero",
  },
  {
    label: "Privacy",
    oldWay: "Publicly linked to your identity",
    cove: "Sender/Receiver remain detached",
  },
];

const languages = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
] as const;

type LanguageOption = (typeof languages)[number];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/8 dark:text-emerald-300">
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme !== "light" : true;

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </button>
  );
}

function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(
    languages[0],
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 items-center gap-2.5 rounded-full border border-zinc-200 bg-white/80 px-4 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:shadow-none dark:hover:border-white/15 dark:hover:bg-white/8"
      >
        <Globe className="h-4 w-4" />
        <span className="text-base leading-none">{selectedLanguage.flag}</span>
        <span>{selectedLanguage.label}</span>
        <ChevronDown
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            role="menu"
            className="absolute right-0 z-20 mt-3 w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-[0_20px_45px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.38)]"
          >
            {languages.map((language) => {
              const active = language.value === selectedLanguage.value;
              return (
                <button
                  key={language.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setSelectedLanguage(language);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="text-base leading-none">{language.flag}</span>
                  <span>{language.label}</span>
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden bg-white text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14),rgba(255,255,255,0)_60%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(20,241,149,0.18),rgba(10,10,10,0)_60%)]" />
        <div className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-fuchsia-500/8 blur-3xl dark:bg-fuchsia-500/10" />
        <div className="absolute -right-20 top-28 h-80 w-80 rounded-full bg-cyan-400/8 blur-3xl dark:bg-cyan-400/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.75),rgba(255,255,255,0.96)),linear-gradient(to_right,rgba(24,24,27,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.04)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px] dark:bg-[linear-gradient(to_bottom,rgba(24,24,27,0.1),rgba(24,24,27,0.85)),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 sm:px-6 lg:px-8">
        <motion.header
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center justify-between py-6"
        >
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-lg font-semibold text-zinc-950 shadow-[0_10px_35px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-[0_0_30px_rgba(34,197,94,0.16)]">
              C
            </span>
            <span className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
              Cove
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <Link
              href="/send"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:border-emerald-500/35 hover:bg-emerald-500/15 hover:text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200 dark:shadow-[0_0_24px_rgba(16,185,129,0.18)] dark:hover:border-emerald-300/50 dark:hover:bg-emerald-400/15 dark:hover:text-white"
            >
              Launch App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.header>

        <section className="relative pb-24 pt-10 sm:pb-28 sm:pt-14 lg:pb-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mx-auto flex max-w-5xl flex-col items-center text-center"
          >
            <motion.div variants={fadeUp}>
              <SectionEyebrow>Private settlement for Solana</SectionEyebrow>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-8 max-w-4xl text-balance text-5xl font-semibold tracking-[-0.06em] text-zinc-950 sm:text-6xl dark:text-white lg:text-7xl"
            >
              Send SOL privately. No wallet address required.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-pretty text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-400"
            >
              Deposit funds. Generate a private link. DM it to anyone. Stop
              asking for public keys and start settling instantly.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link
                href="/send"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 dark:bg-emerald-400 dark:text-zinc-950 dark:hover:bg-emerald-300"
              >
                Start Sending
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:shadow-none dark:hover:border-white/20 dark:hover:bg-white/8 dark:hover:text-white"
              >
                View Dashboard
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-16 w-full max-w-4xl">
              <div className="relative mx-auto overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/90 p-3 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] sm:p-8 dark:border-white/8 dark:bg-zinc-950/85 dark:shadow-none">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-500">
                          Private transfer
                        </p>
                        <h2 className="mt-2 text-left text-2xl font-semibold text-zinc-950 dark:text-white sm:text-3xl">
                          Send a private payment
                        </h2>
                      </div>
                      <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
                        Live on Solana
                      </div>
                    </div>

                    <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5 dark:border-white/8 dark:bg-white/[0.03]">
                      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                        <span>Amount (SOL)</span>
                        <span>Private output</span>
                      </div>
                      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-left text-3xl font-semibold tracking-tight text-zinc-950 dark:border-white/10 dark:bg-black/40 dark:text-white">
                        2.40
                      </div>
                      <div className="mt-3 text-left text-xs uppercase tracking-[0.22em] text-zinc-500">
                        Minimum 0.02 SOL
                      </div>
                      <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
                        Generate claim link
                        <CopyCheck className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between rounded-[1.5rem] border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.92))] p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] sm:p-8 dark:border-emerald-400/15 dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.03))] dark:shadow-none">
                    <div>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        Claim flow
                      </p>
                      <h3 className="mt-2 text-left text-2xl font-semibold text-zinc-950 dark:text-white">
                        No address. No back-and-forth.
                      </h3>
                      <p className="mt-3 text-left text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        Generate the link. Drop it in the DM. The receiver
                        clicks, connects, and claims.
                      </p>
                    </div>

                    <div className="mt-8 space-y-3">
                      <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-left dark:border-white/10 dark:bg-black/25">
                        <div className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
                          <span>Encrypted link</span>
                          <span className="text-emerald-700 dark:text-emerald-300">
                            Single-use
                          </span>
                        </div>
                        <div className="mt-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                          cove.cash/claim/eyJ2IjoxLCJza...
                        </div>
                      </div>
                      <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-left dark:border-white/10 dark:bg-black/25">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                            <Check className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-zinc-950 dark:text-white">
                              Receiver claims instantly
                            </p>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              Funds settle without exposing a public key in
                              chat.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="pb-24 sm:pb-28"
        >
          <motion.div variants={fadeUp} className="max-w-3xl">
            <SectionEyebrow>How it works</SectionEyebrow>
            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-zinc-950 dark:text-white sm:text-4xl">
              Three moves. That&apos;s it.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Built for people who already move fast on Solana and do not want
              another settlement ritual in the middle of a chat.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-12 grid gap-5 md:grid-cols-3"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.title}
                  variants={fadeUp}
                  className="rounded-[1.75rem] border border-zinc-200 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:border-emerald-500/25 hover:bg-white dark:border-white/8 dark:bg-white/[0.03] dark:shadow-none dark:hover:border-emerald-400/25 dark:hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold text-zinc-950 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {step.copy}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="pb-24 sm:pb-28"
        >
          <motion.div variants={fadeUp} className="max-w-3xl">
            <SectionEyebrow>The old flow is broken</SectionEyebrow>
            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-zinc-950 dark:text-white sm:text-4xl">
              Cove vs. the old way
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Wallet-address choreography kills momentum. Cove compresses the
              entire interaction into one private link.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-12 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none"
          >
            <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-zinc-200 bg-zinc-50 text-left text-sm font-medium text-zinc-600 dark:border-white/8 dark:bg-white/[0.02] dark:text-zinc-300">
              <div className="px-5 py-4 sm:px-6">Category</div>
              <div className="px-5 py-4 sm:px-6">The Old Way</div>
              <div className="bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(16,185,129,0.04))] px-5 py-4 text-zinc-950 dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(16,185,129,0.04))] dark:text-white sm:px-6">
                Cove
              </div>
            </div>

            {comparisonRows.map((row, index) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1.1fr_1fr_1fr] text-left ${
                  index !== comparisonRows.length - 1
                    ? "border-b border-zinc-200 dark:border-white/8"
                    : ""
                }`}
              >
                <div className="px-5 py-5 text-sm font-medium text-zinc-950 dark:text-white sm:px-6">
                  {row.label}
                </div>
                <div className="px-5 py-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:px-6">
                  {row.oldWay}
                </div>
                <div className="bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(16,185,129,0.03))] px-5 py-5 text-sm leading-6 text-emerald-800 dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(16,185,129,0.03))] dark:text-emerald-100 sm:px-6">
                  {row.cove}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="pb-16"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,244,245,0.92))] px-6 py-14 text-center shadow-[0_28px_80px_rgba(15,23,42,0.1)] sm:px-10 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] dark:shadow-none">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
            <SectionEyebrow>Move faster</SectionEyebrow>
            <h2 className="mx-auto mt-6 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.04em] text-zinc-950 dark:text-white sm:text-5xl">
              Frictionless peer-to-peer liquidity.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Private by default. Native to chat. Built for how Solana users
              actually move money.
            </p>
            <Link
              href="/send"
              className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-emerald-400 dark:text-zinc-950 dark:hover:bg-emerald-300"
            >
              Launch Cove
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.section>

        <footer className="flex flex-col gap-5 border-t border-zinc-200 py-8 text-sm text-zinc-500 dark:border-white/8 dark:text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold tracking-tight text-zinc-950 dark:text-white">
              Cove
            </span>
            <span>Private claim-link payments on Solana.</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://x.com/cove_cash"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition hover:text-zinc-950 dark:hover:text-white"
            >
              <Bird className="h-4 w-4" />
              Twitter/X
            </a>
            <a
              href="https://github.com/namedfarouk/cove-cash"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition hover:text-zinc-950 dark:hover:text-white"
            >
              <CodeXml className="h-4 w-4" />
              Github
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
