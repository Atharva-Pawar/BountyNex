import { Link } from "react-router-dom";
import { CalendarClock, CircleDollarSign, FileText, Shield, TrendingUp } from "lucide-react";
import type { Bounty } from "../../types";
import { cn, daysLeft, severityColor, weiToEth } from "../../lib/utils";
import { StatusBadge } from "../ui/Badge";

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const days = daysLeft(bounty.deadline);
  const isActive = bounty.status === "ACTIVE";
  const topSeverity = bounty.severities?.[0];

  return (
    <Link
      to={`/bounties/${bounty.id}`}
      className="group relative flex flex-col rounded-xl border border-border bg-surface shadow-card transition-all duration-200 hover:border-accent/30 hover:shadow-elevated hover:-translate-y-0.5"
    >
      {/* Status indicator bar */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-0.5 rounded-t-xl",
          isActive ? "bg-emerald-500" : bounty.status === "PAUSED" ? "bg-amber-500" : "bg-slate-500",
        )}
      />

      <div className="flex flex-col gap-3 p-5 pt-5">
        {/* Header: status + reward */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={bounty.status} />
            {bounty.isFunded && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                Funded
              </span>
            )}
          </div>
          {isActive && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
              <TrendingUp className="h-3 w-3" /> Active
            </span>
          )}
        </div>

        {/* Title + org */}
        <div>
          <h3 className="line-clamp-2 text-sm font-semibold text-ink transition-colors group-hover:text-accent">
            {bounty.title}
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-dim">
            <Shield className={cn("h-3.5 w-3.5", bounty.organization?.isVerified ? "text-accent" : "text-ink-faint")} />
            {bounty.organization?.name ?? "Organization"}
            {bounty.organization?.isVerified && (
              <span className="text-accent font-medium">· Verified</span>
            )}
          </p>
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-xs leading-relaxed text-ink-faint">{bounty.description}</p>

        {/* Severity chips */}
        {bounty.severities && bounty.severities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {bounty.severities.slice(0, 3).map((s) => (
              <span
                key={s.level}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-medium"
              >
                <span className={cn("font-semibold", severityColor(s.level))}>{s.level.slice(0, 3)}</span>
                <span className="text-ink-faint">{weiToEth(s.rewardWei)}</span>
              </span>
            ))}
            {bounty.severities.length > 3 && (
              <span className="inline-flex items-center rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[10px] text-ink-faint">
                +{bounty.severities.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: reward + deadline + reports */}
      <div className="mt-auto flex items-center justify-between border-t border-border px-5 py-3 bg-surface-2/50 rounded-b-xl">
        <span className="flex items-center gap-1.5 font-semibold text-ink">
          <CircleDollarSign className="h-4 w-4 text-accent" />
          <span className="text-sm">{weiToEth(bounty.rewardAmountWei)}</span>
          <span className="text-xs font-normal text-ink-faint">ETH</span>
        </span>
        <span className={cn("flex items-center gap-1 text-xs", days === 0 ? "text-danger font-medium" : "text-ink-dim")}>
          <CalendarClock className="h-3.5 w-3.5" />
          {days === 0 ? "Expired" : `${days}d left`}
        </span>
        <span className="flex items-center gap-1 text-xs text-ink-dim">
          <FileText className="h-3.5 w-3.5" />
          {bounty._count?.bugReports ?? 0}
        </span>
      </div>
    </Link>
  );
}
