import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { http } from "wagmi";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const projectId =
  (import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID as string | undefined) || "bountynx-local";

const chain = sepolia;

export const wagmiConfig = getDefaultConfig({
  appName: "BountyNex",
  projectId,
  chains: [chain],
  transports: {
    [chain.id]: http(
      (import.meta.env.VITE_RPC_URL as string | undefined) || "https://sepolia.drpc.org",
    ),
  },
  ssr: false,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export { RainbowKitProvider, WagmiProvider, QueryClientProvider };
export const activeChain = chain;
export const CONTRACT_ADDRESS =
  (import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}` | undefined) || undefined;
