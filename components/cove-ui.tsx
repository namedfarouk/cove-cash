"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ChevronDown,
  Globe,
  Menu,
  Moon,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

import {
  type LanguageValue,
  supportedLanguages,
  useCoveLanguage,
} from "@/components/cove-language";

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

export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
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
  const { language, setLanguage, t } = useCoveLanguage();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedLanguage =
    supportedLanguages.find((item) => item.value === language) ??
    supportedLanguages[0];

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
    <div ref={wrapperRef} className="relative max-md:w-full">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 items-center gap-2.5 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition-colors duration-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#0B0F14] dark:text-zinc-300 dark:shadow-none dark:hover:border-zinc-700 dark:hover:bg-zinc-900 max-md:w-full max-md:justify-between"
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
            className="absolute top-full left-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 text-zinc-700 shadow-[0_20px_45px_rgba(0,0,0,0.12)] md:right-0 dark:border-zinc-800 dark:bg-[#0B0F14] dark:text-zinc-300 dark:shadow-[0_24px_60px_rgba(0,0,0,0.38)] max-md:relative max-md:top-0 max-md:mt-2 max-md:w-full"
          >
            {supportedLanguages.map((language) => {
              const active = language.value === selectedLanguage.value;
              const disabled =
                "disabled" in language && language.disabled === true;
              return (
                <motion.button
                  whileHover={disabled ? undefined : { scale: 1.01 }}
                  key={language.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    setLanguage(language.value as LanguageValue);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-200 ${
                    disabled
                      ? "cursor-not-allowed text-zinc-400 opacity-65 dark:text-zinc-500"
                      : ""
                  } ${
                    active
                      ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                  }`}
                >
                  <span className="text-base leading-none">{language.flag}</span>
                  <span>{language.label}</span>
                  {disabled ? (
                    <span className="ml-auto text-[11px] uppercase tracking-[0.18em]">
                      {t.nav.comingSoon}
                    </span>
                  ) : null}
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
  cta,
  walletSlot,
}: {
  cta?: { label: string; href: string };
  walletSlot?: ReactNode;
}) {
  const { t } = useCoveLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useLockBodyScroll(isOpen);

  const mobileLinks = [
    { label: t.nav.dashboard, href: "/dashboard" },
    { label: t.nav.sendPayment, href: "/send" },
  ];

  return (
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

          <div className="min-w-0 flex-1" />

          <button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white/80 text-zinc-700 shadow-sm transition-colors duration-200 hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:shadow-none dark:hover:border-white/15 dark:hover:bg-white/8 md:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <ThemeToggle />
            <LanguageSelector />
            {cta ? (
              <Link
                href={cta.href}
                className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-700 shadow-sm transition-colors duration-200 hover:border-emerald-500/35 hover:bg-emerald-500/15 hover:text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200 dark:shadow-[0_0_24px_rgba(16,185,129,0.18)] dark:hover:border-emerald-300/50 dark:hover:bg-emerald-400/15 dark:hover:text-white"
              >
                {cta.label}
              </Link>
            ) : null}
            {walletSlot}
          </div>
        </motion.header>
      </div>

      <MobileMenuOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        links={mobileLinks}
        primaryAction={cta}
        walletSlot={walletSlot}
      />
    </div>
  );
}

export function MobileMenuOverlay({
  isOpen,
  onClose,
  links,
  primaryAction,
  walletSlot,
}: {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{ label: string; href: string; external?: boolean }>;
  primaryAction?: { label: string; href: string };
  walletSlot?: ReactNode;
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleResize() {
      if (window.innerWidth >= 768) onClose();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute left-0 top-full h-[calc(100vh-100%)] w-full overflow-y-auto bg-white text-zinc-900 dark:bg-[#0B0F14] dark:text-white md:hidden"
        >
          <div className="flex flex-col space-y-6 p-6">
            <div className="flex flex-col space-y-6">
              {links.map((link) =>
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={onClose}
                    className="text-lg font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                ) : link.href.startsWith("#") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="text-lg font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="text-lg font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>

            <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <LanguageSelector />
                <ThemeToggle />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              {walletSlot ? <div className="w-full">{walletSlot}</div> : null}
              {primaryAction ? (
                <Link
                  href={primaryAction.href}
                  onClick={onClose}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#22C55E] px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors duration-200 hover:bg-[#16a34a]"
                >
                  {primaryAction.label}
                </Link>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
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
    <main className="relative isolate min-h-screen overflow-hidden bg-white text-zinc-950 transition-colors duration-300 dark:bg-[#0B0F14] dark:text-zinc-50">
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
            <div className="absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12),rgba(255,255,255,0)_60%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(20,241,149,0.10),rgba(11,15,20,0)_62%)]" />
            <div className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-fuchsia-500/7 blur-3xl dark:bg-fuchsia-500/8" />
            <div className="absolute -right-20 top-28 h-80 w-80 rounded-full bg-cyan-400/7 blur-3xl dark:bg-cyan-400/8" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.78),rgba(255,255,255,0.97))] dark:bg-[linear-gradient(to_bottom,rgba(11,15,20,0.92),rgba(11,15,20,1))]" />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 sm:px-6 lg:px-8">
        {navbar}
        <div className={`relative flex-1 pt-24 ${contentClassName}`}>{children}</div>
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
