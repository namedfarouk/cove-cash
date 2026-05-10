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
} from "@/components/cove-ui";

const takeaways = [
  "Cove is a non-custodial interface for private settlement on Solana, not a bank or broker.",
  "Every transaction depends on wallet signatures, smart contracts, and third-party networks that can fail or become congested.",
  "Use of the beta interface is at your own risk, and prohibited or unlawful use is not allowed.",
];

const sections = [
  {
    title: "1. The Cove Interface vs. The Solana Protocol",
    body: [
      "Cove provides a web interface for generating private claim-link payments and interacting with privacy-preserving settlement infrastructure on Solana. The interface helps users prepare and submit transactions, but it does not operate the Solana blockchain itself.",
      "Your use of Cove is also subject to the rules, finality guarantees, outages, and validator behavior of the underlying Solana network and any supporting privacy infrastructure. If the network is delayed, reorganized, or unavailable, Cove cannot independently complete or reverse transactions.",
    ],
  },
  {
    title: "2. User Eligibility & Wallet Authentication",
    body: [
      "You are responsible for ensuring that your access to Cove is lawful where you are located and that you have authority to use any connected wallet. Wallet authentication proves control over a wallet at the time of signing, but it does not create a custodial relationship with Cove.",
      "You are solely responsible for safeguarding your wallet, device, recovery phrase, and any claim links generated through the interface. Anyone with access to a valid claim link may be able to redeem the associated funds.",
    ],
  },
  {
    title: "3. Non-Custodial Smart Contract Escrow",
    body: [
      "Cove facilitates private settlement using the Cloak SDK on Solana. We never take custody of funds; all SOL and stablecoins are secured via smart contracts, and network fees are out of our control.",
      "When you deposit assets through Cove, they move according to the logic of the relevant smart contracts, wallet signatures, and relay systems. Cove cannot freeze, reclaim, or unilaterally redirect assets once a valid transaction has been signed and accepted by the network.",
    ],
  },
  {
    title: "4. Assumption of Beta & Network Risks",
    body: [
      "Cove is offered as beta software. Features may change, be interrupted, or contain defects, including UI bugs, proof-generation failures, relay downtime, RPC inconsistency, and incompatibilities with wallets or browsers.",
      "You acknowledge the risks of smart contract execution, zero-knowledge proving systems, token integrations, claim-link handling, and blockchain settlement generally. You should test carefully and avoid using funds you cannot afford to lose.",
    ],
  },
  {
    title: "5. Prohibited Use Cases",
    body: [
      "You may not use Cove for unlawful conduct, sanctions evasion, fraud, money laundering, market manipulation, or any activity that would cause harm to other users, service providers, or the broader ecosystem.",
      "You may not attempt to interfere with the interface, abuse rate limits, reverse engineer private infrastructure beyond what law permits, exploit vulnerabilities, or use Cove in a manner designed to conceal criminal proceeds or unauthorized access.",
    ],
  },
  {
    title: "6. Intellectual Property",
    body: [
      "The Cove interface, brand assets, written content, and original product presentation are owned by Cove or its licensors. Open-source dependencies remain governed by their respective licenses.",
      "You may not copy, misrepresent, or redistribute Cove branding or proprietary interface content in a way that suggests affiliation, endorsement, or authorship without permission.",
    ],
  },
  {
    title: "7. Limitation of Protocol Liability",
    body: [
      "To the maximum extent permitted by law, Cove is provided on an “as is” and “as available” basis without warranties of uptime, merchantability, fitness for a particular purpose, or uninterrupted private settlement.",
      "Cove and its contributors will not be liable for losses arising from wallet compromise, claim-link disclosure, smart contract bugs, token depegs, relay or RPC failures, transaction delays, failed proofs, mistaken user input, or other blockchain-specific risks.",
    ],
  },
];

export default function TermsPage() {
  return (
    <CovePage
      navbar={<CoveNavbar cta={{ label: "Launch Cove", href: "/send" }} />}
      contentClassName="py-10 sm:py-14"
    >
      <PageReveal className="mx-auto w-full max-w-5xl">
        <motion.section variants={fadeUp} className="rounded-[32px] border border-zinc-800 bg-zinc-950 px-6 py-10 text-zinc-100 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:px-8 md:px-12">
          <SectionEyebrow>Legal</SectionEyebrow>
          <h1 className="mt-6 max-w-3xl font-syne text-4xl font-bold tracking-tighter text-white sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 max-w-2xl font-inter text-base leading-7 text-zinc-400">
            These terms govern use of the Cove interface for private settlement on Solana.
            They are written to clarify what Cove does, what it does not do, and where
            responsibility remains with the user.
          </p>

          <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-syne text-2xl font-semibold tracking-tighter text-white">
                At a Glance
              </h2>
              <span className="rounded-full border border-zinc-700 px-3 py-1 text-[11px] font-inter uppercase tracking-[0.24em] text-[#DA4022]">
                Quick Summary
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {takeaways.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-zinc-800 bg-black/30 px-4 py-4 font-inter text-sm leading-6 text-zinc-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-prose space-y-10 font-inter text-[15px] leading-8 text-zinc-300">
            {sections.map((section) => (
              <section key={section.title} className="space-y-4">
                <h2 className="font-syne text-2xl font-semibold tracking-tighter text-white">
                  {section.title}
                </h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-zinc-800 pt-8 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl font-inter">
              Questions about these terms can be directed through Cove&apos;s official
              channels. Continued use of the interface constitutes acceptance of these terms.
            </p>
            <Link href="/send" className={`${primaryButtonClass} shrink-0`}>
              Open App
            </Link>
          </div>
        </motion.section>
      </PageReveal>
    </CovePage>
  );
}
