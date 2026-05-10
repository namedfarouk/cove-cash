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
  "Cove is non-custodial. You sign your own transactions and retain control of your wallet and claim links.",
  "Cove relies on the Solana network, the Cloak SDK, and beta infrastructure that can fail, degrade, or change unexpectedly.",
  "Use of the interface is only permitted for lawful activity, and protocol interactions remain your responsibility.",
];

const sections = [
  {
    title: "1. Acceptance of Terms & Eligibility",
    points: [
      "By accessing or using Cove, you agree to these Terms of Service and represent that you are legally able to enter into a binding agreement.",
      "You are responsible for ensuring that use of a privacy-preserving settlement interface is lawful in your jurisdiction.",
      "If you do not agree to these terms, you should not use the Cove interface or interact with Cove-generated claim links.",
    ],
  },
  {
    title: "2. Use of Cove & The Solana Protocol",
    points: [
      "Cove is an application interface built for private settlement flows on Solana. It is not the Solana blockchain, a validator, or a wallet provider.",
      "Transactions depend on Solana consensus, RPC infrastructure, relay availability, browser compatibility, and smart-contract execution that Cove does not control.",
      "A transaction may fail, be delayed, or become more expensive if the underlying network is congested or if third-party infrastructure is degraded.",
    ],
  },
  {
    title: "3. Accounts & Authentication",
    points: [
      "Cove does not create custodial user accounts for normal product use. Access is mediated through cryptographic wallet authentication.",
      "Your wallet, device security, recovery phrase, and private signing environment remain your responsibility at all times.",
      "Anyone who obtains a valid private claim link may be able to redeem the underlying funds, so secure handling of links is essential.",
    ],
  },
  {
    title: "4. Payments, Escrow, & The Cloak SDK (Cove is Non-Custodial)",
    points: [
      "Cove is a non-custodial private settlement layer on Solana powered by the Cloak SDK. We do not hold customer balances, operate a bank account, or maintain off-chain custody over user funds.",
      "Private settlement is facilitated through smart-contract logic and zero-knowledge transaction flows. SOL and supported stablecoins remain subject to the rules of the deployed contracts and the Solana network.",
      "Network fees, validator behavior, token-account requirements, and on-chain execution conditions are outside Cove's control, even when the interface helps prepare the transaction.",
    ],
  },
  {
    title: "5. Prohibited Activities",
    points: [
      "You may not use Cove for unlawful conduct, sanctions evasion, fraud, market manipulation, money laundering, or abusive attempts to conceal criminal proceeds.",
      "You may not interfere with the interface, bypass rate limits, attack the product, scrape private infrastructure, or exploit vulnerabilities against Cove, Cloak, or other users.",
      "You may not impersonate another person, misrepresent affiliation, or use Cove in a way that harms the protocol, its operators, or the broader Solana ecosystem.",
    ],
  },
  {
    title: "6. Intellectual Property",
    points: [
      "The Cove brand, interface presentation, and original written materials are owned by Cove or its licensors unless otherwise noted.",
      "Open-source dependencies, including blockchain and wallet libraries, remain governed by their own licenses and terms.",
      "You may not reproduce Cove branding or proprietary interface elements in a misleading way without permission.",
    ],
  },
  {
    title: "7. Disclaimers & Assumption of Beta Risk",
    points: [
      "Cove is beta software. Features, transaction flows, supported assets, and privacy infrastructure may change without notice.",
      "You accept the risk of software bugs, proof-generation failures, relay outages, RPC inconsistencies, token-account issues, and other technical defects.",
      "No guarantee is made that the interface will be uninterrupted, error-free, or suitable for any specific use case.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    points: [
      "To the maximum extent permitted by law, Cove is provided on an 'as is' and 'as available' basis without warranties of merchantability, fitness for a particular purpose, or uninterrupted availability.",
      "Cove and its contributors are not liable for wallet compromise, link leakage, smart-contract bugs, failed claims, token depegs, network delays, or other blockchain-specific losses.",
      "You are responsible for evaluating risk before using Cove with meaningful value or production payment flows.",
    ],
  },
  {
    title: "9. Termination & Governing Law",
    points: [
      "We may restrict or discontinue access to the interface for abuse, security incidents, legal compliance, or operational reasons.",
      "These terms apply to your use of the interface even if network-level transactions remain permanently recorded on-chain after access ends.",
      "Governing law and dispute treatment will apply to the maximum extent enforceable under the circumstances of use.",
    ],
  },
  {
    title: "10. Changes to Terms & Contact",
    points: [
      "We may update these terms as Cove evolves, including changes to supported assets, infrastructure, or legal requirements.",
      "Your continued use of Cove after changes become effective constitutes acceptance of the revised terms.",
      "For questions about these terms, users should reach out through Cove's official public channels or project documentation.",
    ],
  },
];

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="mt-4 font-inter text-base leading-7 text-zinc-400">
              These terms describe the rules for using Cove as a non-custodial,
              privacy-preserving settlement interface on Solana.
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
              <Link href="/privacy" className={secondaryButtonClass}>
                View Privacy Policy
              </Link>
            </div>
          </div>
        </motion.section>
      </PageReveal>
    </CovePage>
  );
}
