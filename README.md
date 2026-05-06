# Cove

**Private payment receiving layer for Solana.**

Send SOL privately. No wallet address required. Generate a single-use claim link, drop it in a DM, and the recipient claims instantly — without exposing a public key.

Built for the Colosseum Frontier Hackathon (Cloak specialty track).

## Live Demo

[cove-cash.vercel.app](https://cove-cash.vercel.app)

## What It Does

Public Web3 builders face a real problem: every payment they receive is permanently indexed on chain. Hackathon prizes, sponsorships, grants, tips — all publicly linked to their identity wallet.

Cove solves this with a private payment receiving layer:

1. **Sender** connects wallet, deposits SOL into the Cloak shielded pool, gets a single-use claim link
2. **Link** encodes the spending key and cryptographic commitment — a bearer instrument, no addresses exchanged
3. **Recipient** opens the link, connects any wallet, and claims — the Cloak relay submits the withdrawal and pays the fee, so recipients need zero SOL to claim

The sender's wallet and recipient's wallet are never linked on chain.

## Architecture

Cove uses the [Cloak SDK](https://docs.cloak.ag) for ZK-proof generation and shielded pool management.

**Key design decisions:**

- ZK proof generation runs server-side (Next.js API routes) rather than in the browser. The Cloak SDK has Node-only assumptions; server-side execution eliminates browser polyfill complexity entirely.
- Deposit flow uses a trap pattern: the SDK signTransaction callback is intercepted to capture the unsigned VersionedTransaction before submission, returned to the browser for wallet signing.
- Withdrawal flow uses the Cloak relay by default — the relay submits and pays the fee. Recipients need no SOL.
- UTXO state including the blinding factor is persisted to localStorage before any network call. If a deposit confirms but the page crashes, the UTXO is recoverable via /api/recover.

**Routes:**
- `POST /api/deposit/prepare` — generates ZK proof, returns unsigned tx + UTXO state
- `POST /api/claim/prepare` — reconstructs input UTXO, runs withdrawal via relay
- `POST /api/recover` — extracts blinding from serialized UTXO for claim link recovery
- `POST /api/dashboard/status` — checks on-chain nullifier status for tracked deposits

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/send` | Deposit SOL and generate a claim link |
| `/claim/[blob]` | Recipient claims a payment |
| `/dashboard` | Deposit history, claim status, CSV export |

## Validated On-Chain

Deposit: [`3Hpe2HVx8qMFxHjefqswAqZfZkzuWpycxKkJ8oxzdQYEw69e1eDp8nWSo7MBGE8boB32KHiBUFRkR3kMimq1pEZW`](https://solscan.io/tx/3Hpe2HVx8qMFxHjefqswAqZfZkzuWpycxKkJ8oxzdQYEw69e1eDp8nWSo7MBGE8boB32KHiBUFRkR3kMimq1pEZW)

Claim: [`3mGX8ePX3xPB9mB3cJPBvVVfgfGMHsxExLdT7fN5oSzGKDJxVFxnBz4qNa3fxzZ4mDK8XBBfSmfEVN7PsPxC9uM`](https://solscan.io/tx/3mGX8ePX3xPB9mB3cJPBvVVfgfGMHsxExLdT7fN5oSzGKDJxVFxnBz4qNa3fxzZ4mDK8XBBfSmfEVN7PsPxC9uM)

## Running Locally

```bash
git clone https://github.com/namedfarouk/cove-cash
cd cove-cash
npm install
```

Create `.env.local`:

NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Cove runs on Solana mainnet. The Cloak program is mainnet-only. You need a funded wallet with at least 0.022 SOL to test deposits.

## Tech Stack

- **Framework:** Next.js 16 (Turbopack)
- **Privacy layer:** Cloak SDK (@cloak.dev/sdk)
- **Chain:** Solana mainnet
- **Wallet:** Solana wallet adapter (Phantom, Solflare, Backpack)
- **Deployment:** Vercel

## Roadmap

- USDC/USDT support via SPL token ATA handling
- Cross-device deposit history via Cloak viewing-key registration
- Multi-language support beyond English and French
- SDK browser compatibility (contribute upstream to @cloak.dev/sdk)

## Built By

[@NamedFarouk](https://x.com/NamedFarouk) 
---
