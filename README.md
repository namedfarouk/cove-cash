# Cove: Private Settlement on Solana ✦

Public ledgers are a feature, but public spending shouldn't be mandatory. Cove is a non-custodial, private settlement layer built on Solana. It allows users to send SOL, USDC, and USDT completely privately via single-use, encrypted claim links.

No wallet addresses required upfront. Send money, not addresses.

**Live on Mainnet:** [https://cove-cash.vercel.app](https://cove-cash.vercel.app)  
**Official Documentation:** [https://cove-cash.mintlify.app/](https://cove-cash.mintlify.app/)

## 🏆 Colosseum Frontier Hackathon Submission

Cove is built specifically for the **Cloak Track** (Cross-border stablecoin payments & private B2B settlement).

If your users would walk away the moment their transaction amounts and counterparties went public, privacy isn't a feature - it's load-bearing. Cove uses the Cloak SDK to make privacy the default without sacrificing Solana's speed or the economic guarantees of stablecoins.

## ⚙️ Architecture & Decisions

To deliver a consumer-grade experience on complex cryptography, we made specific architectural choices:

* **The Cloak SDK (Shielded Pool):** We utilize Cloak's UTXO shielded pool. When a user deposits funds, it generates a ZK-proof witness, shielding the sender's address and the transaction amount from public block explorers.
* **Link-Based Claiming (UX):** The recipient does not need to understand ZK-cryptography or even know what Cloak is. The sender DMs an encrypted link, and the recipient claims it to a fresh wallet, breaking the on-chain link between counterparties.
* **Helius RPC Infrastructure:** Generating Groth16 proofs requires fetching heavy Merkle tree states from the blockchain. Standard public RPCs rate-limit or timeout these requests. We integrated dedicated Helius RPCs to handle the heavy data load, preventing 504 gateway timeouts and ensuring smooth execution on Mainnet.

## 🚀 Quick Start (Local Development)

### Prerequisites

* Node.js (v18+)
* A Solana wallet funded with Mainnet SOL, USDC, or USDT for testing
* A dedicated Helius RPC endpoint

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/namedfarouk/cove-cash.git
   cd cove-cash
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env.local` file in the root directory and add your Helius RPC:

   ```env
   NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

## 🛡️ Security & Legal

Cove is a non-custodial interface. We do not hold, manage, or control user funds. All transactions and escrows are handled directly via smart contracts on the Solana blockchain. See our [Terms of Service](https://cove-cash.vercel.app/terms) and [Privacy Policy](https://cove-cash.vercel.app/privacy) for more details on our zero-knowledge architecture.
