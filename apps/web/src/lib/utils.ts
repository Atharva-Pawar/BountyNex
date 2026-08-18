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
  ACTIVE: "bg-acid-lime/10 text-acid-lime border-acid-lime/25",
  DRAFT: "bg-ash/10 text-ash border-ash/25",
  PAUSED: "bg-warn/10 text-warn border-warn/25",
  CLOSED: "bg-danger/10 text-danger border-danger/25",
  SUBMITTED: "bg-info/10 text-info border-info/25",
  UNDER_REVIEW: "bg-info/10 text-info border-info/25",
  NEEDS_INFORMATION: "bg-warn/10 text-warn border-warn/25",
  ACCEPTED: "bg-pulse-green/10 text-pulse-green border-pulse-green/25",
  REJECTED: "bg-danger/10 text-danger border-danger/25",
  REWARDED: "bg-pulse-green/10 text-pulse-green border-pulse-green/25",
  PENDING: "bg-warn/10 text-warn border-warn/25",
  PAID: "bg-pulse-green/10 text-pulse-green border-pulse-green/25",
  FAILED: "bg-danger/10 text-danger border-danger/25",
  CONFIRMED: "bg-pulse-green/10 text-pulse-green border-pulse-green/25",
  CRITICAL: "bg-danger/10 text-danger border-danger/25",
  HIGH: "bg-danger/10 text-danger border-danger/25",
  MEDIUM: "bg-warn/10 text-warn border-warn/25",
  LOW: "bg-info/10 text-info border-info/25",
  INFORMATIONAL: "bg-ash/10 text-ash border-ash/25",
  RESEARCHER: "bg-info/10 text-info border-info/25",
  ORGANIZATION: "bg-accent-2/10 text-accent-2 border-accent-2/25",
  ADMIN: "bg-lavender/10 text-lavender border-lavender/25",
  GUEST: "bg-ash/10 text-ash border-ash/25",
};

export function statusStyle(status: string): string {
  return STATUS_STYLES[status] ?? "bg-smoke/10 text-fog border-smoke/25";
}

export const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"] as const;

export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-coral-red",
  HIGH: "text-coral-red",
  MEDIUM: "text-warn",
  LOW: "text-signal-teal",
  INFORMATIONAL: "text-ash",
};

export function severityColor(severity: string): string {
  return SEVERITY_COLORS[severity] ?? "text-fog";
}
