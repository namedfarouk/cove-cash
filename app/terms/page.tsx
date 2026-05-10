"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { useCoveLanguage } from "@/components/cove-language";
import {
  CoveNavbar,
  CovePage,
  PageReveal,
  SectionEyebrow,
  fadeUp,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/cove-ui";

export default function TermsPage() {
  const { t } = useCoveLanguage();
  const terms = t.legal.terms;

  return (
    <CovePage
      navbar={<CoveNavbar cta={{ label: t.landing.launchCove, href: "/send" }} />}
      contentClassName="py-10 sm:py-14"
    >
      <PageReveal className="mx-auto w-full max-w-4xl">
        <motion.section
          variants={fadeUp}
          className="rounded-[32px] border border-zinc-200 bg-white px-6 py-10 text-center text-zinc-700 shadow-[0_20px_80px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:px-8 md:px-12"
        >
          <div className="mx-auto max-w-3xl">
            <SectionEyebrow>{t.legal.common.eyebrow}</SectionEyebrow>
            <h1 className="mt-6 font-syne text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white sm:text-5xl">
              {terms.title}
            </h1>
            <p className="mt-4 font-inter text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {terms.intro}
            </p>

            <div className="mt-10 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 text-left dark:border-zinc-800 dark:bg-zinc-900/80">
              <div className="flex flex-col items-center gap-3 text-center">
                <h2 className="font-syne text-2xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                  {t.legal.common.atAGlance}
                </h2>
                <span className="rounded-full border border-zinc-300 px-3 py-1 text-[11px] font-inter uppercase tracking-[0.24em] text-[#DA4022] dark:border-zinc-700">
                  {t.legal.common.quickSummary}
                </span>
              </div>
              <ul className="mt-5 space-y-3">
                {terms.takeaways.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 font-inter text-sm leading-6 text-zinc-700 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 space-y-10 text-center">
              {terms.sections.map((section) => (
                <section key={section.title} className="space-y-4">
                  <h2 className="font-syne text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white">
                    {section.title}
                  </h2>
                  <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
                    {section.points.map((point) => (
                      <li
                        key={point}
                        className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 font-inter text-sm leading-7 dark:border-zinc-900 dark:bg-black/20"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800 sm:flex-row">
              <Link href="/" className={primaryButtonClass}>
                {t.legal.common.openApp}
              </Link>
              <Link href="/privacy" className={secondaryButtonClass}>
                {terms.ctaPrivacy}
              </Link>
            </div>
          </div>
        </motion.section>
      </PageReveal>
    </CovePage>
  );
}
