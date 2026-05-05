"use client";

import { useMemo } from "react";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { ThemeProvider } from "next-themes";

const FALLBACK_RPC_URL = "https://api.mainnet-beta.solana.com";
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? FALLBACK_RPC_URL;
if (!process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
  console.warn(
    `[cove] NEXT_PUBLIC_SOLANA_RPC_URL is not set; falling back to ${FALLBACK_RPC_URL}. The public endpoint blocks browser requests with 403 — set a private RPC (e.g. Helius) in .env.local.`,
  );
}

// Backpack ships as a wallet-standard wallet and is auto-discovered by
// WalletProvider, so it doesn't need an explicit adapter entry here.
export function Providers({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ConnectionProvider endpoint={RPC_URL}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}
