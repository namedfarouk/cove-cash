"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Globe,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

const languages = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
] as const;

type LanguageOption = (typeof languages)[number];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/8 dark:text-emerald-300">
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}

export function ThemeToggle() {
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
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </button>
  );
}

export function LanguageSelector() {
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
      if (event.key === "Escape") setOpen(false);
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
        className="inline-flex h-11 items-center gap-2.5 rounded-full border border-zinc-200 bg-white/80 px-4 text-sm font-medium text-zinc-700 shadow-sm transition-colors duration-200 hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:shadow-none dark:hover:border-white/15 dark:hover:bg-white/8"
      >
        <Globe className="h-4 w-4" />
        <span className="text-base leading-none">{selectedLanguage.flag}</span>
        <span className="hidden sm:inline">{selectedLanguage.label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
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
            className="absolute right-0 z-30 mt-3 w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-[0_20px_45px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.38)]"
          >
            {languages.map((language) => {
              const active = language.value === selectedLanguage.value;
              return (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  key={language.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setSelectedLanguage(language);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-200 ${
                    active
                      ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="text-base leading-none">{language.flag}</span>
                  <span>{language.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function CoveNavbar({
  appHref = "/send",
  appLabel = "Launch App",
  secondaryLink,
  walletSlot,
}: {
  appHref?: string;
  appLabel?: string;
  secondaryLink?: { href: string; label: string };
  walletSlot?: ReactNode;
}) {
  return (
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
        {secondaryLink ? (
          <Link
            href={secondaryLink.href}
            className="hidden rounded-full border border-zinc-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors duration-200 hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:shadow-none dark:hover:border-white/15 dark:hover:bg-white/8 sm:inline-flex"
          >
            {secondaryLink.label}
          </Link>
        ) : null}
        <LanguageSelector />
        <ThemeToggle />
        {walletSlot}
        <Link
          href={appHref}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition-colors duration-200 hover:border-emerald-500/35 hover:bg-emerald-500/15 hover:text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200 dark:shadow-[0_0_24px_rgba(16,185,129,0.18)] dark:hover:border-emerald-300/50 dark:hover:bg-emerald-400/15 dark:hover:text-white"
        >
          {appLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.header>
  );
}

export function PageReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function CovePage({
  navbar,
  children,
  contentClassName = "",
}: {
  navbar: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-white text-zinc-950 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      <AnimatePresence mode="wait">
        <motion.div
          key="theme-surface"
          initial={{ opacity: 0.92 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.92 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14),rgba(255,255,255,0)_60%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(20,241,149,0.18),rgba(10,10,10,0)_60%)]" />
            <div className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-fuchsia-500/8 blur-3xl dark:bg-fuchsia-500/10" />
            <div className="absolute -right-20 top-28 h-80 w-80 rounded-full bg-cyan-400/8 blur-3xl dark:bg-cyan-400/10" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.75),rgba(255,255,255,0.96)),linear-gradient(to_right,rgba(24,24,27,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.04)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px] dark:bg-[linear-gradient(to_bottom,rgba(24,24,27,0.1),rgba(24,24,27,0.85)),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]" />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 sm:px-6 lg:px-8">
        {navbar}
        <div className={`relative flex-1 ${contentClassName}`}>{children}</div>
      </div>
    </main>
  );
}

export function PremiumCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition-colors duration-300 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_30px_100px_rgba(0,0,0,0.35)] ${className}`}
    >
      <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
      {children}
    </div>
  );
}
