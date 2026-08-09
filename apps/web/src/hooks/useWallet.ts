import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { api } from "../lib/api";
import { buildVerificationMessage } from "../lib/wallet-message";
import type { Wallet } from "../types";

export function useWalletBinding() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [serverWallet, setServerWallet] = useState<Wallet | null>(null);
  const [binding, setBinding] = useState(false);

  const loadServerWallet = useCallback(async () => {
    try {
      const data = (await api.get("/api/wallet")) as { wallet: Wallet | null };
      setServerWallet(data.wallet);
    } catch {
      setServerWallet(null);
    }
  }, []);

  const bindWallet = useCallback(async () => {
    if (!address || !isConnected) {
      toast.error("Connect your wallet first");
      return null;
    }
    setBinding(true);
    try {
      const message = buildVerificationMessage(address);
      const signature = await signMessageAsync({ message });
      const data = (await api.post("/api/wallet/connect", {
        address,
        signature,
      })) as { wallet: Wallet };
      setServerWallet(data.wallet);
      toast.success("Wallet connected and verified");
      return data.wallet;
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || "Failed to bind wallet");
      return null;
    } finally {
      setBinding(false);
    }
  }, [address, isConnected, signMessageAsync]);

  return {
    address,
    isConnected,
    bindWallet,
    binding,
    serverWallet,
    loadServerWallet,
  };
}

export function useChainIdSafe() {
  return useChainId();
}
