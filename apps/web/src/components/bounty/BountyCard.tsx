import { Link } from "react-router-dom";
import { CalendarClock, CircleDollarSign, FileText, Shield } from "lucide-react";
import type { Bounty } from "../../types";
import { cn, daysLeft, severityColor, weiToEth } from "../../lib/utils";
import { StatusBadge } from "../ui/Badge";

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const days = daysLeft(bounty.deadline);
  const isActive = bounty.status === "ACTIVE";

  return (
    <Link
      to={`/bounties/${bounty.id}`}
      className="group block rounded-lg border border-border bg-surface p-4 transition-all duration-150 hover:border-border-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-ink transition-colors group-hover:text-accent">
            {bounty.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
            <Shield className={cn("h-3 w-3", bounty.organization?.isVerified ? "text-accent" : "text-ink-faint")} />
            {bounty.organization?.name ?? "Organization"}
            {bounty.organization?.isVerified && (
              <span className="text-accent">· Verified</span>
            )}
          </p>
        </div>
        <StatusBadge status={bounty.status} />
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-faint">{bounty.description}</p>

      {bounty.severities && bounty.severities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {bounty.severities.slice(0, 3).map((s) => (
            <span
              key={s.level}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px]"
            >
              <span className={cn("font-medium", severityColor(s.level))}>{s.level.slice(0, 3)}</span>
              <span className="text-ink-faint">{weiToEth(s.rewardWei)}</span>
            </span>
          ))}
          {bounty.severities.length > 3 && (
            <span className="inline-flex items-center rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-faint">
              +{bounty.severities.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1.5 font-mono text-sm font-medium text-ink">
          <CircleDollarSign className="h-3.5 w-3.5 text-accent" />
          {weiToEth(bounty.rewardAmountWei)} <span className="text-xs font-normal text-ink-faint">ETH</span>
        </span>
        <span className={cn("flex items-center gap-1 text-xs", days === 0 ? "text-danger" : "text-ink-faint")}>
          <CalendarClock className="h-3 w-3" />
          {days === 0 ? "Expired" : `${days}d left`}
        </span>
        <span className="flex items-center gap-1 text-xs text-ink-faint">
          <FileText className="h-3 w-3" />
          {bounty._count?.bugReports ?? 0}
        </span>
      </div>
    </Link>
  );
}
