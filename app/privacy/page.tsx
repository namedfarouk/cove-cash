"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import {
  CoveNavbar,
  CovePage,
  PageReveal,
  SectionEyebrow,
  fadeUp,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/cove-ui";

const takeaways = [
  "Cove is built to shield payment details on-chain through zero-knowledge transaction flows rather than expose them publicly on Solana.",
  "Standard web infrastructure may still log operational metadata such as IP address, browser information, or request timing.",
  "We do not track, store, or sell the underlying financial data associated with private settlement activity.",
];

const sections = [
  {
    title: "1. Our Commitment to Privacy & Zero-Knowledge Architecture",
    points: [
      "Cove is designed around privacy-preserving settlement on Solana. Our product goal is to reduce public linkage between sender, recipient, and payment flow where the underlying protocol allows it.",
      "Privacy here refers primarily to on-chain settlement mechanics, not to the total elimination of all internet or hosting metadata generated when you use a website.",
      "Cove is non-custodial and built to avoid creating a conventional user database of balances, profiles, or financial histories.",
    ],
  },
  {
    title: "2. Information We Collect",
    points: [
      "The interface may process wallet public keys, token selections, transaction payloads, and claim-link data needed to prepare, recover, or complete a transaction flow.",
      "Local browser storage may be used to preserve in-progress deposit or claim state so a user can recover from a refresh or interruption.",
      "We do not require traditional account registration for normal use of the app interface.",
    ],
  },
  {
    title: "3. ZK-Proof Mechanics (How We Shield Your Data)",
    points: [
      "Cove uses the Cloak SDK and zero-knowledge proof mechanics to support private settlement on Solana.",
      "On-chain amounts, sender-recipient linkage, and claim execution details are designed to be shielded through ZK-proof flows rather than publicly exposed as plain transfers.",
      "We do not track, store, or sell the underlying financial data associated with those shielded transactions outside the transient technical handling required to submit or recover them.",
    ],
  },
  {
    title: "4. Data Handling by Third Parties (Vercel)",
    points: [
      "Cove uses standard web infrastructure and hosting, including Vercel. Like many hosts, such providers may log basic connection data such as IP addresses, browser details, request metadata, and error logs.",
      "Wallet providers, RPC endpoints, and relay infrastructure may also process operational information needed to deliver the product experience.",
      "Those third parties operate under their own terms and privacy policies, which users should review independently.",
    ],
  },
  {
    title: "5. Data Security & Retention",
    points: [
      "Cove aims to minimize retention and avoid unnecessary collection. Some data may live only in browser storage, network logs, or ephemeral request handling.",
      "Because Cove is non-custodial, many core transaction artifacts exist only in the user's wallet, device state, or on-chain execution path rather than in a centralized Cove account system.",
      "Users should treat claim links and wallet environments as sensitive because unauthorized access can compromise funds even if the app itself is privacy-focused.",
    ],
  },
  {
    title: "6. Data Rights & International Transfers",
    points: [
      "Users may have local legal rights relating to personal data depending on jurisdiction, including rights to request information or object to certain processing.",
      "Because third-party infrastructure may operate across regions, some limited operational metadata could be processed internationally.",
      "Requests relating to Cove-controlled data will be evaluated in light of the non-custodial architecture and the limited categories of data we intentionally retain.",
    ],
  },
  {
    title: "7. Contact",
    points: [
      "Questions about this Privacy Policy or Cove's data-handling model should be directed through Cove's official public channels or documentation.",
      "Users should also review the privacy policies of wallets, RPC providers, and hosting vendors that participate in the experience.",
      "Continued use of the interface after policy changes constitutes acceptance of the updated policy.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <CovePage
      navbar={<CoveNavbar cta={{ label: "Launch Cove", href: "/send" }} />}
      contentClassName="py-10 sm:py-14"
    >
      <PageReveal className="mx-auto w-full max-w-4xl">
        <motion.section
          variants={fadeUp}
          className="rounded-[32px] border border-zinc-800 bg-zinc-950 px-6 py-10 text-center text-zinc-300 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:px-8 md:px-12"
        >
          <div className="max-w-3xl mx-auto">
            <SectionEyebrow>Legal</SectionEyebrow>
            <h1 className="mt-6 font-syne text-4xl font-bold tracking-tighter text-white sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 font-inter text-base leading-7 text-zinc-400">
              This policy explains how Cove approaches privacy, what standard web
              infrastructure may still observe, and how the product handles
              data around private settlement flows.
            </p>

            <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 text-left">
              <div className="flex flex-col items-center gap-3 text-center">
                <h2 className="font-syne text-2xl font-semibold tracking-tighter text-white">
                  At a Glance
                </h2>
                <span className="rounded-full border border-zinc-700 px-3 py-1 text-[11px] font-inter uppercase tracking-[0.24em] text-[#DA4022]">
                  Quick Summary
                </span>
              </div>
              <ul className="mt-5 space-y-3">
                {takeaways.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-zinc-800 bg-black/30 px-4 py-4 font-inter text-sm leading-6 text-zinc-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 space-y-10 text-center">
              {sections.map((section) => (
                <section key={section.title} className="space-y-4">
                  <h2 className="font-syne text-2xl font-bold tracking-tighter text-white">
                    {section.title}
                  </h2>
                  <ul className="space-y-3 text-zinc-300">
                    {section.points.map((point) => (
                      <li
                        key={point}
                        className="rounded-2xl border border-zinc-900 bg-black/20 px-4 py-4 font-inter text-sm leading-7"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
              <Link href="/" className={primaryButtonClass}>
                Open App
              </Link>
              <Link href="/terms" className={secondaryButtonClass}>
                View Terms of Service
              </Link>
            </div>
          </div>
        </motion.section>
      </PageReveal>
    </CovePage>
  );
}
