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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
