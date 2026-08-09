import { Link } from "react-router-dom";
import { CalendarClock, CircleDollarSign, FileText, Shield } from "lucide-react";
import type { Bounty } from "../../types";
import { cn, daysLeft, weiToEth } from "../../lib/utils";
import { Badge } from "../ui/Badge";

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const days = daysLeft(bounty.deadline);

  return (
    <Link
      to={`/bounties/${bounty.id}`}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-surface/70 p-5 transition-all hover:border-accent/40 hover:shadow-[0_0_24px_rgba(16,185,129,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-ink transition-colors group-hover:text-accent">
            {bounty.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-dim">
            <Shield className="h-3.5 w-3.5 text-accent-2" />
            {bounty.organization?.name ?? "Organization"}
            {bounty.organization?.isVerified && (
              <span className="text-accent">· Verified</span>
            )}
          </p>
        </div>
        <Badge className={cn(bounty.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-slate-500/15 text-slate-400 border-slate-500/30")}>
          {bounty.status}
        </Badge>
      </div>

      <p className="line-clamp-2 text-sm text-ink-dim">{bounty.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {bounty.severities?.slice(0, 4).map((s) => (
          <span
            key={s.level}
            className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-ink-dim"
          >
            {s.level}: {weiToEth(s.rewardWei)} ETH
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-ink-dim">
        <span className="flex items-center gap-1.5 font-semibold text-ink">
          <CircleDollarSign className="h-4 w-4 text-accent" />
          {weiToEth(bounty.rewardAmountWei)} ETH
        </span>
        <span className={cn("flex items-center gap-1.5", days === 0 ? "text-danger" : "text-ink-dim")}>
          <CalendarClock className="h-4 w-4" />
          {days === 0 ? "Expired" : `${days} days left`}
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="h-4 w-4" />
          {bounty._count?.bugReports ?? 0} reports
        </span>
      </div>
    </Link>
  );
}
