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
  ACTIVE: "bg-accent/10 text-accent border-accent/20",
  DRAFT: "bg-ink-faint/10 text-ink-faint border-ink-faint/20",
  PAUSED: "bg-warn/10 text-warn border-warn/20",
  CLOSED: "bg-danger/10 text-danger border-danger/20",
  SUBMITTED: "bg-info/10 text-info border-info/20",
  UNDER_REVIEW: "bg-info/10 text-info border-info/20",
  NEEDS_INFORMATION: "bg-warn/10 text-warn border-warn/20",
  ACCEPTED: "bg-accent/10 text-accent border-accent/20",
  REJECTED: "bg-danger/10 text-danger border-danger/20",
  REWARDED: "bg-accent-2/10 text-accent-2 border-accent-2/20",
  PENDING: "bg-warn/10 text-warn border-warn/20",
  PAID: "bg-accent/10 text-accent border-accent/20",
  FAILED: "bg-danger/10 text-danger border-danger/20",
  CONFIRMED: "bg-accent/10 text-accent border-accent/20",
  CRITICAL: "bg-danger/10 text-danger border-danger/20",
  HIGH: "bg-danger/10 text-danger border-danger/20",
  MEDIUM: "bg-warn/10 text-warn border-warn/20",
  LOW: "bg-info/10 text-info border-info/20",
  INFORMATIONAL: "bg-ink-faint/10 text-ink-faint border-ink-faint/20",
  RESEARCHER: "bg-info/10 text-info border-info/20",
  ORGANIZATION: "bg-accent-2/10 text-accent-2 border-accent-2/20",
  ADMIN: "bg-danger/10 text-danger border-danger/20",
  GUEST: "bg-ink-faint/10 text-ink-faint border-ink-faint/20",
};

export function statusStyle(status: string): string {
  return STATUS_STYLES[status] ?? "bg-slate-500/15 text-slate-500 border-slate-500/30";
}

export const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"] as const;

export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-danger",
  HIGH: "text-danger",
  MEDIUM: "text-warn",
  LOW: "text-info",
  INFORMATIONAL: "text-ink-faint",
};

export function severityColor(severity: string): string {
  return SEVERITY_COLORS[severity] ?? "text-slate-500";
}
