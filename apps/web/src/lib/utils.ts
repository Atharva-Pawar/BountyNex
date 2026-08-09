import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function shortAddress(address: string | null | undefined, chars = 4): string {
  if (!address) return "Not connected";
  if (address.length <= 2 * chars + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function weiToEth(wei: string | bigint | null | undefined): string {
  if (wei === null || wei === undefined || wei === "") return "0";
  const weiBig = typeof wei === "bigint" ? wei : BigInt(wei);
  const eth = Number(weiBig) / 1e18;
  if (eth === 0) return "0";
  if (eth >= 1) return eth.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return eth.toFixed(6);
}

export function formatEth(value: string | bigint | null | undefined, decimals = 4): string {
  if (value === null || value === undefined) return "0.0000";
  const n = typeof value === "bigint" ? Number(value) / 1e18 : Number(BigInt(value)) / 1e18;
  return n.toFixed(decimals);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function daysLeft(deadline: string | Date): number {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000));
}

export function explorerTxUrl(hash: string): string {
  const base = (import.meta.env.VITE_EXPLORER_URL as string | undefined) || "https://sepolia.etherscan.io";
  return `${base}/tx/${hash}`;
}

export const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  DRAFT: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  PAUSED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CLOSED: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  SUBMITTED: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  UNDER_REVIEW: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  NEEDS_INFORMATION: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ACCEPTED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  REJECTED: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  REWARDED: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PAID: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  FAILED: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  CONFIRMED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CRITICAL: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  HIGH: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  LOW: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  INFORMATIONAL: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export function statusStyle(status: string): string {
  return STATUS_STYLES[status] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30";
}

export const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"] as const;
