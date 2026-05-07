"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import {
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
  CoveBrand,
  MobileMenuOverlay,
  LanguageSelector,
  SectionEyebrow,
  ThemeToggle,
  fadeUp,
  primaryButtonClass,
  secondaryButtonClass,
  stagger,
  useFloatingNavbarState,
  useLockBodyScroll,
} from "@/components/cove-ui";

export default function Home() {
  const { t } = useCoveLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const scrolled = useFloatingNavbarState();

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
    <main className="relative isolate overflow-hidden bg-white text-zinc-900 transition-colors dark:bg-black dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.05)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]" />
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(237,42,0,0.10),transparent_62%)] dark:bg-[radial-gradient(circle_at_top,rgba(237,42,0,0.18),transparent_62%)]" />
      </div>

      <div className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-white/20 dark:bg-black/90 md:hidden">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
          <motion.header
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex items-center gap-4 py-4"
          >
            <Link href="/" className="flex shrink-0 items-center">
              <CoveBrand />
            </Link>

            <div className="min-w-0 flex-1 md:hidden" />

            <button
              type="button"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-colors duration-200 hover:bg-black/[0.04] dark:border-white/20 dark:bg-[#070707] dark:text-zinc-200 dark:hover:bg-white/[0.06]"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </motion.header>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden md:block">
        <div className="mx-auto w-full max-w-7xl px-6 pt-4">
          <motion.div
            layout
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`pointer-events-auto transition-all duration-300 ${
              scrolled
                ? "mx-auto w-fit rounded-full border border-zinc-200 bg-white/80 px-6 py-3 backdrop-blur-md dark:border-white/20 dark:bg-[#070707]/80"
                : "w-full"
            }`}
          >
            <motion.header
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex items-center gap-6"
            >
              <Link href="/" className="flex shrink-0 items-center">
                <CoveBrand />
              </Link>

              <nav className="flex min-w-0 flex-1 items-center justify-center gap-6">
                <a
                  href="#how-it-works"
                  className="font-inter text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  {t.nav.howItWorks}
                </a>
                <a
                  href="#compare"
                  className="font-inter text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  {t.nav.compare}
                </a>
                <a
                  href="https://github.com/namedfarouk/cove-cash#readme"
                  target="_blank"
                  rel="noreferrer"
                  className="font-inter text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  {t.nav.docs}
                </a>
              </nav>

              <div className="hidden shrink-0 items-center gap-2 md:flex">
                <LanguageSelector />
                <ThemeToggle />
                <Link href="/send" className={primaryButtonClass}>
                  {t.landing.launchCove}
                </Link>
              </div>
            </motion.header>
          </motion.div>
        </div>
      </div>

      <MobileMenuOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        links={mobileLinks}
        primaryAction={{ label: t.landing.launchCove, href: "/send" }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pt-24 sm:px-6 lg:px-8">
        <section className="relative pb-24 pt-32 md:pt-40 sm:pb-28 lg:pb-32">
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
              className="mt-8 max-w-4xl text-balance font-syne text-5xl font-semibold tracking-tighter text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl"
            >
              {t.landing.heroTitle}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-pretty font-inter text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg"
            >
              {t.landing.heroBody}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link
                href="/send"
                className={`${primaryButtonClass} px-6`}
              >
                {t.landing.startSending}
              </Link>
              <Link
                href="/dashboard"
                className={`${secondaryButtonClass} px-6`}
              >
                {t.landing.viewDashboard}
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-16 w-full max-w-4xl">
              <div className="cove-card mx-auto overflow-hidden p-3">
                <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/20 dark:bg-[#070707] sm:p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-inter text-sm text-zinc-500">
                          {t.landing.privateTransfer}
                        </p>
                        <h2 className="mt-2 text-left font-syne text-2xl font-semibold tracking-tighter text-zinc-900 dark:text-white sm:text-3xl">
                          {t.landing.sendPrivatePayment}
                        </h2>
                      </div>
                      <div className="rounded-full border border-zinc-200 bg-black/[0.02] px-3 py-1 font-inter text-xs font-medium text-cove-accent dark:border-white/20 dark:bg-white/[0.04]">
                        {t.landing.liveOnSolana}
                      </div>
                    </div>

                    <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/20 dark:bg-black/40 sm:p-5">
                      <div className="flex items-center justify-between font-inter text-sm text-zinc-500">
                        <span>{t.landing.amountSol}</span>
                        <span>{t.landing.privateOutput}</span>
                      </div>
                      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-left font-syne text-3xl font-semibold tracking-tighter text-zinc-900 dark:border-white/20 dark:bg-[#070707] dark:text-white">
                        2.40
                      </div>
                      <div className="mt-3 text-left font-inter text-xs uppercase tracking-[0.22em] text-zinc-500">
                        {t.landing.minimumSol}
                      </div>
                      <button className={`${primaryButtonClass} mt-6 w-full rounded-full`}>
                        {t.landing.generateClaimLink}
                        <CopyCheck className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/20 dark:bg-[#070707] sm:p-8">
                    <div>
                      <p className="font-inter text-sm text-cove-accent">
                        {t.landing.claimFlow}
                      </p>
                      <h3 className="mt-2 text-left font-syne text-2xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                        {t.landing.noAddressTitle}
                      </h3>
                      <p className="mt-3 text-left font-inter text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {t.landing.noAddressBody}
                      </p>
                    </div>

                    <div className="mt-8 space-y-3">
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left dark:border-white/20 dark:bg-black/40">
                        <div className="flex items-center justify-between font-inter text-sm text-zinc-700 dark:text-zinc-300">
                          <span>{t.landing.encryptedLink}</span>
                          <span className="text-cove-accent">
                            {t.landing.singleUse}
                          </span>
                        </div>
                        <div className="mt-3 font-mono text-xs text-zinc-500">
                          cove.cash/claim/eyJ2IjoxLCJza...
                        </div>
                      </div>
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left dark:border-white/20 dark:bg-black/40">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cove-accent/15 text-cove-accent">
                            <Check className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-inter text-sm font-medium text-zinc-900 dark:text-white">
                              {t.landing.receiverClaims}
                            </p>
                            <p className="mt-1 font-inter text-xs text-zinc-500 dark:text-zinc-400">
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
            <h2 className="mt-6 font-syne text-3xl font-semibold tracking-tighter text-zinc-900 dark:text-white sm:text-4xl">
              {t.landing.howItWorksTitle}
            </h2>
            <p className="mt-4 max-w-2xl font-inter text-base leading-7 text-zinc-600 dark:text-zinc-400">
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
                  className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 dark:border-white/20 dark:bg-[#070707] dark:hover:border-white/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-black/[0.02] text-cove-accent dark:border-white/20 dark:bg-white/[0.04]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-syne text-sm font-medium tracking-tight text-zinc-500">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-8 font-syne text-2xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 font-inter text-sm leading-6 text-zinc-600 dark:text-zinc-400">
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
            <h2 className="mt-6 font-syne text-3xl font-semibold tracking-tighter text-zinc-900 dark:text-white sm:text-4xl">
              {t.landing.comparisonTitle}
            </h2>
            <p className="mt-4 max-w-2xl font-inter text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {t.landing.comparisonBody}
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-12 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/20 dark:bg-[#070707]"
          >
            <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-zinc-200 bg-zinc-50 text-left font-inter text-sm font-medium text-zinc-500 dark:border-white/20 dark:bg-white/[0.03] dark:text-zinc-400">
              <div className="px-5 py-4 sm:px-6">{t.landing.category}</div>
              <div className="px-5 py-4 sm:px-6">{t.landing.oldWay}</div>
              <div className="border-l border-zinc-200 bg-cove-accent/10 px-5 py-4 text-zinc-900 dark:border-white/20 dark:text-white sm:px-6">
                {t.landing.cove}
              </div>
            </div>

            {comparisonRows.map((row, index) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1.1fr_1fr_1fr] text-left ${
                  index !== comparisonRows.length - 1
                    ? "border-b border-zinc-200 dark:border-white/20"
                    : ""
                }`}
              >
                <div className="px-5 py-5 font-inter text-sm font-medium text-zinc-900 dark:text-white sm:px-6">
                  {row.label}
                </div>
                <div className="px-5 py-5 font-inter text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:px-6">
                  {row.oldWay}
                </div>
                <div className="border-l border-zinc-200 bg-cove-accent/10 px-5 py-5 font-inter text-sm leading-6 text-zinc-900 dark:border-white/20 dark:text-white sm:px-6">
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
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-14 text-center dark:border-white/20 dark:bg-[#070707] sm:px-10">
            <SectionEyebrow>{t.landing.moveFasterEyebrow}</SectionEyebrow>
            <h2 className="mx-auto mt-6 max-w-3xl text-balance font-syne text-3xl font-semibold tracking-tighter text-zinc-900 dark:text-white sm:text-5xl">
              {t.landing.finalTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-inter text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {t.landing.finalBody}
            </p>
            <Link href="/send" className={`${primaryButtonClass} mt-10 px-6`}>
              {t.landing.launchCove}
            </Link>
          </div>
        </motion.section>

        <footer className="flex flex-col items-center gap-4 border-t border-zinc-200 py-6 text-center font-inter text-sm text-zinc-500 dark:border-white/20 dark:text-zinc-400 md:flex-row md:justify-between md:text-left">
          <div className="flex flex-col items-center gap-2 md:flex-row md:items-center">
            <span className="font-syne text-base font-semibold tracking-tighter text-zinc-900 dark:text-white">
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
              className="inline-flex items-center transition hover:text-zinc-900 dark:hover:text-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current"
              >
                <path d="M18.244 2H21.5l-7.11 8.128L22.75 22h-6.547l-5.126-6.71L5.21 22H1.95l7.604-8.69L1.5 2h6.713l4.634 6.118L18.244 2Zm-1.142 18h1.804L7.227 3.895H5.29L17.102 20Z" />
              </svg>
            </a>
            <a
              href="https://github.com/namedfarouk/cove-cash"
              target="_blank"
              rel="noreferrer"
              aria-label="Cove GitHub repository"
              title="Cove GitHub repository"
              className="inline-flex items-center transition hover:text-zinc-900 dark:hover:text-white"
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
