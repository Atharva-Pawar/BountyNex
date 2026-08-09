import { useCallback } from "react";
import { useReadContract, useSendTransaction, useWriteContract } from "wagmi";
import { encodeFunctionData, parseEther } from "viem";
import abi from "../lib/escrow-abi.json";
import { CONTRACT_ADDRESS } from "../lib/wagmi";

const ESCROW_ABI = abi as unknown as Parameters<typeof encodeFunctionData>[0]["abi"];

export interface OnChainBounty {
  creator: string;
  deadline: bigint;
  rewardBalance: bigint;
  totalDeposited: bigint;
  totalReleased: bigint;
  status: number;
}

export function useBountyOnChain(onChainId?: string | null) {
  const enabled = Boolean(CONTRACT_ADDRESS && onChainId && BigInt(onChainId) > 0n);

  const { data, isLoading, isError, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "getBounty",
    args: enabled ? [BigInt(onChainId!)] : undefined,
    query: { enabled },
  });

  return {
    onChain: data as OnChainBounty | undefined,
    isLoading,
    isError,
    isConfigured: Boolean(CONTRACT_ADDRESS),
    refetch,
  };
}

export function useFundBounty() {
  const { sendTransactionAsync, isPending, error } = useSendTransaction();
  const { data: receipt, isError } = useTransactionReceiptHelper();

  const fund = useCallback(
    async (onChainId: bigint, amountWei: bigint) => {
      if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
      const data = encodeFunctionData({
        abi: ESCROW_ABI,
        functionName: "fundBounty",
        args: [onChainId],
      });
      return sendTransactionAsync({
        to: CONTRACT_ADDRESS,
        data,
        value: amountWei,
      });
    },
    [sendTransactionAsync],
  );

  return { fund, isPending, error, receipt, isError };
}

export function useReleaseReward() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const release = useCallback(
    async (onChainId: bigint, researcher: string, amountWei: bigint) => {
      if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
      return writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "releaseReward",
        args: [onChainId, researcher, amountWei],
      });
    },
    [writeContractAsync],
  );

  return { release, isPending, error };
}

export function useCreateBountyOnChain() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const create = useCallback(
    async (onChainId: bigint, creator: string, deadline: bigint) => {
      if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
      return writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "createBounty",
        args: [onChainId, creator, deadline],
      });
    },
    [writeContractAsync],
  );

  return { create, isPending, error };
}

export function weiFromEth(eth: string): bigint {
  try {
    return parseEther(eth);
  } catch {
    return 0n;
  }
}

// Small helper to keep hook API stable (wagmi v2 exposes receipt via useSendTransaction tx).
function useTransactionReceiptHelper() {
  return { data: undefined, isError: false };
}
