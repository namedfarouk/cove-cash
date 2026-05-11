"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  AnimatePresence,
  motion,
  type Variants,
} from "framer-motion";
import {
  ChevronDown,
  Globe,
  Menu,
  Moon,
  Sparkles,
  Sun,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

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

export const primaryButtonClass =
  "cove-primary-button";

export const secondaryButtonClass =
  "cove-secondary-button";

export const desktopNavLinkClass =
  "text-sm font-medium text-zinc-400 hover:text-white transition-colors";

export const navbarPrimaryButtonClass =
  "inline-flex h-9 items-center justify-center rounded-full bg-cove-accent px-5 font-inter text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#f14f44]";

export const navbarWalletButtonClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 font-inter text-sm font-semibold text-white transition-colors duration-200 hover:bg-zinc-800";

export const cardWalletButtonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 font-syne font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200";

export function CoveBrand() {
  return (
    <div className="flex items-center gap-0">
      <div className="relative w-32 h-32 md:w-72 md:h-72 flex-shrink-0">
        <Image
          src="/logo.png"
          alt="Cove Logo"
          fill
          className="object-contain object-left md:object-center"
          priority
        />
      </div>
      <span className="-ml-3 md:-ml-8 text-2xl md:text-3xl font-bold font-syne tracking-tighter text-[#DA4022]">
        Cove
      </span>
    </div>
  );
}

export function NavbarBrand() {
  return (
    <div className="flex items-center gap-0">
      <div className="relative w-16 h-16 flex-shrink-0 z-10">
        <Image
          src="/logo.png"
          alt="Cove Logo"
          fill
          className="object-contain object-center"
          quality={100}
          priority
        />
      </div>
      <span className="-ml-4 text-xl font-bold font-syne tracking-tighter text-[#DA4022]">
        Cove
      </span>
    </div>
  );
}

export function WalletModalTrigger({
  className,
}: {
  className: string;
}) {
  const { setVisible } = useWalletModal();
  const { connected, publicKey, wallet } = useWallet();

  const label =
    connected && publicKey
      ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
      : connected && wallet?.adapter?.name
        ? wallet.adapter.name
        : "Connect Wallet";

  return (
    <button
      type="button"
      onClick={() => setVisible(true)}
      className={className}
    >
      <Wallet className="h-[18px] w-[18px]" />
      <span>{label}</span>
    </button>
  );
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-black/[0.02] px-3 py-1 text-[11px] font-inter font-medium uppercase tracking-[0.24em] text-cove-accent dark:border-white/20 dark:bg-white/[0.04]">
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

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
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
      className={
        compact
          ? "inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors duration-200 hover:bg-zinc-800 hover:text-white"
          : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-colors duration-200 hover:bg-black/[0.04] hover:text-zinc-950 dark:border-white/20 dark:bg-[#070707] dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
      }
    >
      {isDark ? (
        <Sun className={compact ? "h-4 w-4" : "h-4.5 w-4.5"} />
      ) : (
        <Moon className={compact ? "h-4 w-4" : "h-4.5 w-4.5"} />
      )}
    </button>
  );
}

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
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
        className={
          compact
            ? "inline-flex h-9 items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 font-inter text-sm font-medium text-zinc-400 transition-colors duration-200 hover:bg-zinc-800 hover:text-white max-md:w-full max-md:justify-between"
            : "inline-flex h-11 items-center gap-2.5 rounded-full border border-zinc-200 bg-white px-4 font-inter text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-black/[0.04] hover:text-zinc-950 dark:border-white/20 dark:bg-[#070707] dark:text-zinc-300 dark:hover:bg-white/[0.06] dark:hover:text-white max-md:w-full max-md:justify-between"
        }
      >
        <Globe className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        <span className={`${compact ? "text-sm" : "text-base"} leading-none`}>
          {selectedLanguage.flag}
        </span>
        <span className="hidden sm:inline">{selectedLanguage.label}</span>
        <ChevronDown
          className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} transition-transform duration-200 ${
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
            className={`absolute md:absolute top-full left-0 z-50 mt-2 overflow-hidden rounded-2xl p-2 md:right-0 max-md:w-full ${
              compact
                ? "w-48 border border-zinc-800 bg-zinc-950 text-zinc-300"
                : "w-48 border border-zinc-200 bg-white text-zinc-700 dark:border-white/20 dark:bg-[#070707] dark:text-zinc-300"
            }`}
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
                      ? "bg-cove-accent/15 text-cove-accent"
                      : compact
                        ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
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
    <>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-white/20 dark:bg-black/95 md:hidden">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
          <motion.header
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="w-full py-4"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <Link href="/" className="flex items-center">
                  <CoveBrand />
                </Link>
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                  onClick={() => setIsOpen((current) => !current)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-colors duration-200 hover:bg-black/[0.04] dark:border-white/20 dark:bg-[#070707] dark:text-zinc-200 dark:hover:bg-white/[0.06]"
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </motion.header>
        </div>
      </div>

      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="fixed top-6 left-1/2 z-50 hidden h-14 w-[95%] max-w-4xl -translate-x-1/2 items-center justify-between rounded-full border border-zinc-800 bg-zinc-950/80 px-4 shadow-2xl backdrop-blur-md sm:px-6 md:flex"
      >
        <Link href="/" className="flex items-center">
          <NavbarBrand />
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-8" />

        <div className="flex items-center gap-3">
          <LanguageSelector compact />
          <ThemeToggle compact />
          {cta ? (
            <Link href={cta.href} className={navbarPrimaryButtonClass}>
              {cta.label}
            </Link>
          ) : null}
          {walletSlot}
        </div>
      </motion.header>

      <MobileMenuOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        links={mobileLinks}
        primaryAction={cta}
        walletSlot={walletSlot}
      />
    </>
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
          className="fixed inset-x-0 top-[72px] z-40 h-[calc(100vh-72px)] overflow-y-auto bg-white text-zinc-900 dark:bg-black dark:text-white md:hidden sm:top-[88px] sm:h-[calc(100vh-88px)]"
        >
          <div className="flex flex-col space-y-6 p-6">
            <div className="border-b border-zinc-200 pb-4 mb-4 dark:border-white/10">
              <div className="flex items-start gap-3 py-5">
                <LanguageSelector />
                <ThemeToggle />
              </div>
            </div>

            <div className="flex flex-col space-y-6">
              {links.map((link) =>
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="font-inter text-lg font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                ) : link.href.startsWith("#") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="font-inter text-lg font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="font-inter text-lg font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>

            <div className="mt-8 flex flex-col gap-4">
              {walletSlot ? (
                <div className="w-full [&_.wallet-adapter-button]:w-full [&_.wallet-adapter-button]:justify-center [&_.wallet-adapter-button-trigger]:w-full [&_.wallet-adapter-button-trigger]:justify-center">
                  {walletSlot}
                </div>
              ) : primaryAction ? (
                <Link href={primaryAction.href} onClick={onClose} className={`${primaryButtonClass} w-full`}>
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
    <main className="relative isolate min-h-screen overflow-hidden bg-white text-zinc-900 transition-colors duration-300 dark:bg-black dark:text-white">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 sm:px-6 lg:px-8">
        {navbar}
        <div className={`relative flex-1 pt-24 md:pt-48 ${contentClassName}`}>{children}</div>
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
    <div className={`rounded-2xl border border-zinc-200 bg-white transition-colors duration-300 dark:border-white/20 dark:bg-[#070707] ${className}`}>{children}</div>
  );
}
