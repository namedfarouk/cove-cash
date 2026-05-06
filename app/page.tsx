"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import {
  Bird,
  Check,
  CopyCheck,
  LockKeyhole,
  Menu,
  Send,
  X,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { useCoveLanguage } from "@/components/cove-language";
import {
  MobileMenuOverlay,
  LanguageSelector,
  SectionEyebrow,
  ThemeToggle,
  fadeUp,
  stagger,
  useLockBodyScroll,
} from "@/components/cove-ui";

export default function Home() {
  const { t } = useCoveLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useLockBodyScroll(isOpen);

  const steps = [
    {
      icon: Wallet,
      title: t.landing.stepDepositTitle,
      copy: t.landing.stepDepositBody,
    },
    {
      icon: LockKeyhole,
      title: t.landing.stepLinkTitle,
      copy: t.landing.stepLinkBody,
    },
    {
      icon: Send,
      title: t.landing.stepDmTitle,
      copy: t.landing.stepDmBody,
    },
  ];

  const comparisonRows = [
    {
      label: t.landing.setupTime,
      oldWay: t.landing.setupTimeOld,
      cove: t.landing.setupTimeCove,
    },
    {
      label: t.landing.recipientAction,
      oldWay: t.landing.recipientActionOld,
      cove: t.landing.recipientActionCove,
    },
    {
      label: t.landing.friction,
      oldWay: t.landing.frictionOld,
      cove: t.landing.frictionCove,
    },
    {
      label: t.landing.privacy,
      oldWay: t.landing.privacyOld,
      cove: t.landing.privacyCove,
    },
  ];

  const mobileLinks = [
    { label: t.nav.howItWorks, href: "#how-it-works" },
    { label: t.nav.compare, href: "#compare" },
    {
      label: t.nav.docs,
      href: "https://github.com/namedfarouk/cove-cash#readme",
      external: true,
    },
  ];

  return (
    <main className="relative isolate overflow-hidden bg-white text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14),rgba(255,255,255,0)_60%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(20,241,149,0.18),rgba(10,10,10,0)_60%)]" />
        <div className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-fuchsia-500/8 blur-3xl dark:bg-fuchsia-500/10" />
        <div className="absolute -right-20 top-28 h-80 w-80 rounded-full bg-cyan-400/8 blur-3xl dark:bg-cyan-400/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.75),rgba(255,255,255,0.96)),linear-gradient(to_right,rgba(24,24,27,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.04)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px] dark:bg-[linear-gradient(to_bottom,rgba(24,24,27,0.1),rgba(24,24,27,0.85)),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]" />
      </div>

      <div className="fixed left-0 top-0 z-50 w-full border-b border-zinc-200/70 bg-white/95 backdrop-blur-md dark:border-zinc-900 dark:bg-[#0B0F14]/95">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
          <motion.header
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex min-h-[72px] items-center gap-4"
          >
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-lg font-semibold text-zinc-950 shadow-[0_10px_35px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-[0_0_30px_rgba(34,197,94,0.16)]">
                C
              </span>
              <span className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
                Cove
              </span>
            </Link>

            <div className="min-w-0 flex-1 md:hidden" />

            <button
              type="button"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white/80 text-zinc-700 shadow-sm transition-colors duration-200 hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:shadow-none dark:hover:border-white/15 dark:hover:bg-white/8 md:hidden"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-6 md:flex">
              <a
                href="#how-it-works"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                {t.nav.howItWorks}
              </a>
              <a
                href="#compare"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                {t.nav.compare}
              </a>
              <a
                href="https://github.com/namedfarouk/cove-cash#readme"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                {t.nav.docs}
              </a>
            </nav>

            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <LanguageSelector />
              <ThemeToggle />
              <Link
                href="/send"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-emerald-400 dark:text-zinc-950 dark:hover:bg-emerald-300"
              >
                {t.landing.launchCove}
              </Link>
            </div>
          </motion.header>
        </div>

        <MobileMenuOverlay
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          links={mobileLinks}
          primaryAction={{ label: t.landing.launchCove, href: "/send" }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pt-24 sm:px-6 lg:px-8">
        <section className="relative pb-24 pt-10 sm:pb-28 sm:pt-14 lg:pb-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mx-auto flex max-w-5xl flex-col items-center text-center"
          >
            <motion.div variants={fadeUp}>
              <SectionEyebrow>{t.landing.eyebrow}</SectionEyebrow>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-8 max-w-4xl text-balance text-5xl font-semibold tracking-[-0.06em] text-zinc-950 sm:text-6xl dark:text-white lg:text-7xl"
            >
              {t.landing.heroTitle}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-pretty text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-400"
            >
              {t.landing.heroBody}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link
                href="/send"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 dark:bg-emerald-400 dark:text-zinc-950 dark:hover:bg-emerald-300"
              >
                {t.landing.startSending}
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:shadow-none dark:hover:border-white/20 dark:hover:bg-white/8 dark:hover:text-white"
              >
                {t.landing.viewDashboard}
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
                          {t.landing.privateTransfer}
                        </p>
                        <h2 className="mt-2 text-left text-2xl font-semibold text-zinc-950 dark:text-white sm:text-3xl">
                          {t.landing.sendPrivatePayment}
                        </h2>
                      </div>
                      <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
                        {t.landing.liveOnSolana}
                      </div>
                    </div>

                    <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5 dark:border-white/8 dark:bg-white/[0.03]">
                      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                        <span>{t.landing.amountSol}</span>
                        <span>{t.landing.privateOutput}</span>
                      </div>
                      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-left text-3xl font-semibold tracking-tight text-zinc-950 dark:border-white/10 dark:bg-black/40 dark:text-white">
                        2.40
                      </div>
                      <div className="mt-3 text-left text-xs uppercase tracking-[0.22em] text-zinc-500">
                        {t.landing.minimumSol}
                      </div>
                      <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
                        {t.landing.generateClaimLink}
                        <CopyCheck className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between rounded-[1.5rem] border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.92))] p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] sm:p-8 dark:border-emerald-400/15 dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.03))] dark:shadow-none">
                    <div>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        {t.landing.claimFlow}
                      </p>
                      <h3 className="mt-2 text-left text-2xl font-semibold text-zinc-950 dark:text-white">
                        {t.landing.noAddressTitle}
                      </h3>
                      <p className="mt-3 text-left text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        {t.landing.noAddressBody}
                      </p>
                    </div>

                    <div className="mt-8 space-y-3">
                      <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-left dark:border-white/10 dark:bg-black/25">
                        <div className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
                          <span>{t.landing.encryptedLink}</span>
                          <span className="text-emerald-700 dark:text-emerald-300">
                            {t.landing.singleUse}
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
                              {t.landing.receiverClaims}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              {t.landing.receiverClaimsBody}
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
          id="how-it-works"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="scroll-mt-24 pb-24 sm:pb-28"
        >
          <motion.div variants={fadeUp} className="max-w-3xl">
            <SectionEyebrow>{t.landing.howItWorksEyebrow}</SectionEyebrow>
            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-zinc-950 dark:text-white sm:text-4xl">
              {t.landing.howItWorksTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {t.landing.howItWorksBody}
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
          id="compare"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="scroll-mt-24 pb-24 sm:pb-28"
        >
          <motion.div variants={fadeUp} className="max-w-3xl">
            <SectionEyebrow>{t.landing.oldFlowEyebrow}</SectionEyebrow>
            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-zinc-950 dark:text-white sm:text-4xl">
              {t.landing.comparisonTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {t.landing.comparisonBody}
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-12 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none"
          >
            <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-zinc-200 bg-zinc-50 text-left text-sm font-medium text-zinc-600 dark:border-white/8 dark:bg-white/[0.02] dark:text-zinc-300">
              <div className="px-5 py-4 sm:px-6">{t.landing.category}</div>
              <div className="px-5 py-4 sm:px-6">{t.landing.oldWay}</div>
              <div className="bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(16,185,129,0.04))] px-5 py-4 text-zinc-950 dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(16,185,129,0.04))] dark:text-white sm:px-6">
                {t.landing.cove}
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
          id="get-started"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="scroll-mt-24 pb-16"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,244,245,0.92))] px-6 py-14 text-center shadow-[0_28px_80px_rgba(15,23,42,0.1)] sm:px-10 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] dark:shadow-none">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
            <SectionEyebrow>{t.landing.moveFasterEyebrow}</SectionEyebrow>
            <h2 className="mx-auto mt-6 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.04em] text-zinc-950 dark:text-white sm:text-5xl">
              {t.landing.finalTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {t.landing.finalBody}
            </p>
            <Link
              href="/send"
              className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-emerald-400 dark:text-zinc-950 dark:hover:bg-emerald-300"
            >
              {t.landing.launchCove}
            </Link>
          </div>
        </motion.section>

        <footer className="flex flex-col gap-5 border-t border-zinc-200 py-8 text-sm text-zinc-500 dark:border-white/8 dark:text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold tracking-tight text-zinc-950 dark:text-white">
              Cove
            </span>
            <span>— Private claim-link payments on Solana. © 2026 Cove.</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://x.com/cove_cash"
              target="_blank"
              rel="noreferrer"
              aria-label="Cove on X"
              title="Cove on X"
              className="inline-flex items-center transition hover:text-zinc-950 dark:hover:text-white"
            >
              <Bird className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/namedfarouk/cove-cash"
              target="_blank"
              rel="noreferrer"
              aria-label="Cove GitHub repository"
              title="Cove GitHub repository"
              className="inline-flex items-center transition hover:text-zinc-950 dark:hover:text-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
              >
                <path d="M12 0C5.37 0 0 5.5 0 12.28c0 5.42 3.44 10.01 8.2 11.64.6.11.82-.27.82-.6 0-.3-.01-1.08-.02-2.12-3.34.74-4.04-1.67-4.04-1.67-.55-1.42-1.33-1.8-1.33-1.8-1.09-.76.08-.75.08-.75 1.2.09 1.84 1.27 1.84 1.27 1.08 1.89 2.82 1.35 3.5 1.03.11-.8.42-1.35.76-1.66-2.66-.31-5.47-1.36-5.47-6.08 0-1.35.47-2.45 1.24-3.31-.13-.31-.54-1.56.12-3.25 0 0 1.01-.33 3.3 1.26a11.2 11.2 0 0 1 6 0c2.29-1.59 3.29-1.26 3.29-1.26.67 1.69.26 2.94.13 3.25.77.86 1.24 1.96 1.24 3.31 0 4.73-2.81 5.77-5.49 6.08.43.38.82 1.12.82 2.25 0 1.63-.02 2.94-.02 3.34 0 .33.21.72.83.6 4.75-1.63 8.18-6.22 8.18-11.64C24 5.5 18.63 0 12 0Z" />
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
