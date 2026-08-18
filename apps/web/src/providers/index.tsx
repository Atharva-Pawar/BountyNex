import { Toaster } from "react-hot-toast";
import { darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import {
  QueryClientProvider,
  RainbowKitProvider,
  WagmiProvider,
  queryClient,
  wagmiConfig,
} from "../lib/wagmi";
import { AuthProvider } from "./AuthProvider";
import { ThemeProvider, useTheme } from "./ThemeProvider";
import { LenisProvider } from "./LenisProvider";

function ThemedRainbowKit({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  return (
    <RainbowKitProvider
      modalSize="compact"
      appInfo={{
        appName: "BountyNex",
        learnMoreUrl: "https://bountynx.example",
      }}
      theme={
        isDark
          ? darkTheme({ accentColor: "#e4f222", accentColorForeground: "#0c0d0e" })
          : lightTheme({ accentColor: "#7a8900", accentColorForeground: "#ffffff" })
      }
    >
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LenisProvider>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <ThemedRainbowKit>
              <AuthProvider>{children}</AuthProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  className: "toast-themed",
                }}
              />
            </ThemedRainbowKit>
          </QueryClientProvider>
        </WagmiProvider>
      </LenisProvider>
    </ThemeProvider>
  );
}