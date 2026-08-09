# BountyNex

A decentralized bug bounty platform. Organizations launch bounty programs, security
researchers submit vulnerability reports, and rewards are released on-chain from a
`BountyEscrow` smart contract on Ethereum **Sepolia testnet**.

## Architecture

| Package                | Role                                              | Port (dev) |
| ---------------------- | ------------------------------------------------- | ---------- |
| `apps/web`             | React + Vite + Tailwind frontend                  | 5173       |
| `apps/server`          | Express + Prisma + PostgreSQL (Neon) API          | 4000       |
| `packages/contracts`   | Hardhat + Solidity `BountyEscrow` contract        | —          |

```
Browser (5173)  -->  /api (Vite proxy)  -->  Express API (4000)  -->  PostgreSQL (Neon)
                        |                                 |
                        |                                 +---> Ethereum Sepolia RPC (viem)
                        +---> MetaMask (RainbowKit / wagmi)
```

## Quick start

Requires **Node.js ≥ 20** and a PostgreSQL database (e.g. [Neon](https://neon.tech)).

```bash
npm install
```

### 1. Backend

```bash
cp .env.example apps/server/.env       # then fill in DATABASE_URL, JWT_SECRET
npm run db:migrate --workspace @bountynx/server
npm run dev:server                     # http://localhost:4000
```

Required server vars: `DATABASE_URL`, `JWT_SECRET`. Optional: Cloudinary credentials
for report evidence uploads, Sepolia RPC + `BOUNTY_ESCROW_ADDRESS` for on-chain
verification. Backend runs on **port 4000** by default (`PORT` in `apps/server/.env`).

### 2. Frontend

```bash
cp apps/web/.env.example apps/web/.env  # placeholders are enough to start
npm run dev:web                         # http://localhost:5173
```

The frontend works immediately without any secrets. See `apps/web/.env.example` for
the full variable reference.

### 3. Smart contracts (optional, for live escrow)

```bash
npm run test:contracts                  # run Solidity tests
npm run deploy:local --workspace @bountynx/contracts
npm run deploy:sepolia --workspace @bountynx/contracts   # prints the address
```

After deploying, copy the address into both `apps/server/.env`
(`BOUNTY_ESCROW_ADDRESS`) and `apps/web/.env` (`VITE_CONTRACT_ADDRESS`).

## Frontend environment variables

Only non-secret values live in the frontend. Every `VITE_` value is inlined into the
browser bundle and is **publicly visible** — never put secrets there.

| Variable                          | Required?        | Purpose                                                            |
| --------------------------------- | ---------------- | ------------------------------------------------------------------ |
| `VITE_API_URL`                    | Recommended dev  | Backend base URL. Empty = use Vite dev proxy (`/api` → `:4000`).    |
| `VITE_WALLET_CONNECT_PROJECT_ID`  | Optional         | WalletConnect Cloud ID for RainbowKit (public, not a secret).       |
| `VITE_RPC_URL`                    | Optional         | Sepolia RPC used by wagmi. Defaults to `https://sepolia.drpc.org`.  |
| `VITE_CONTRACT_ADDRESS`           | After deployment | `BountyEscrow` address. Empty → escrow shows "not configured".      |
| `VITE_EXPLORER_URL`               | Optional         | Block explorer for tx links. Defaults to Sepolia Etherscan.         |

When `VITE_CONTRACT_ADDRESS` is empty the rest of the app still works — wallet
connect, bounties, reports, and admin all function; only on-chain escrow actions
show a "Blockchain configuration unavailable" state.

## Scripts

```bash
npm run dev            # server + web in parallel
npm run dev:server     # API only
npm run dev:web        # frontend only
npm run build          # build all workspaces
npm run typecheck      # TypeScript check across workspaces
npm run test:contracts # Hardhat test suite
```

## Security notes

- No private keys, `DATABASE_URL`, `JWT_SECRET`, or Cloudinary secrets ever reach the
  frontend (browser-visible `VITE_` scope only).
- Wallet addresses are verified via signature before binding to an account.
- Rewards are escrowed by the smart contract; the platform never holds funds.
