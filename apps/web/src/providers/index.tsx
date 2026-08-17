import { Toaster } from "react-hot-toast";
import {
  QueryClientProvider,
  RainbowKitProvider,
  WagmiProvider,
  queryClient,
  wagmiConfig,
} from "../lib/wagmi";
import { AuthProvider } from "./AuthProvider";
import { ThemeProvider } from "./ThemeProvider";
import { LenisProvider } from "./LenisProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LenisProvider>
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
                  duration: 4000,
                  className: "toast-themed",
                }}
              />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </LenisProvider>
    </ThemeProvider>
  );
}
