import { Toaster } from "react-hot-toast";
import {
  QueryClientProvider,
  RainbowKitProvider,
  WagmiProvider,
  queryClient,
  wagmiConfig,
} from "../lib/wagmi";
import { AuthProvider } from "./AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          appInfo={{
            appName: "BountyNex",
            learnMoreUrl: "https://bountynx.example",
          }}
        >
          <AuthProvider>{children}</AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#0d1526",
                color: "#e2e8f0",
                border: "1px solid #1e2b45",
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
