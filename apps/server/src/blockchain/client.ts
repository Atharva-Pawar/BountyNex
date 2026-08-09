import { createPublicClient, http, type Abi, type PublicClient } from "viem";
import { sepolia } from "viem/chains";
import { env, isTest } from "../config/env.js";

let client: PublicClient | null = null;

/**
 * Returns a viem public client for the configured testnet.
 * In tests (or when no RPC is configured) a client is still returned so the
 * rest of the app can import it, but chain reads will be unavailable.
 */
export function getPublicClient(): PublicClient {
  if (!client) {
    const rpcUrl = env.RPC_URL_SEPOLIA;
    client = createPublicClient({
      chain: sepolia,
      transport: rpcUrl ? http(rpcUrl) : http("https://sepolia.drpc.org"),
    });
  }
  return client;
}

export function getChainId(): number {
  return env.CHAIN_ID_SEPOLIA;
}

export function getContractAddress(): `0x${string}` {
  if (!env.BOUNTY_ESCROW_ADDRESS) {
    throw new Error("BOUNTY_ESCROW_ADDRESS is not configured");
  }
  return env.BOUNTY_ESCROW_ADDRESS as `0x${string}`;
}

export function isBlockchainConfigured(): boolean {
  return Boolean(env.BOUNTY_ESCROW_ADDRESS && env.RPC_URL_SEPOLIA) && !isTest;
}

export function getContractAbi(): Abi {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const artifact = require("../blockchain/abi.json") as { abi: Abi };
  return artifact.abi;
}

export function getExplorerTxUrl(txHash: string): string {
  return `${env.SEPOLIA_EXPLORER_URL}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${env.SEPOLIA_EXPLORER_URL}/address/${address}`;
}
