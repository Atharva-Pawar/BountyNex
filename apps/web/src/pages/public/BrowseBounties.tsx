import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "../../lib/api";
import type { Bounty, BountySeverity } from "../../types";
import { cn, daysLeft, severityColor, weiToEth } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/Badge";
import { Spinner, EmptyState } from "../../components/ui/State";

export function BrowseBounties() {
  const { data, isLoading, isError, refetch } = useQuery<{ items: Bounty[] }>({
    queryKey: ["bounties-browse"],
    queryFn: async () => (await api.get("/api/bounties?limit=50")) as { items: Bounty[] },
  });

  const bounties = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Loading bounties..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-ink-dim">Could not load bounties.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (bounties.length === 0) {
    return (
      <div className="py-16">
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No bounties found"
          description="There are currently no active bounty programs."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Bounties</h1>
        <p className="text-sm text-ink-dim">{bounties.length} active programs</p>
      </div>

      {/* List view */}
      <div className="divide-y divide-border rounded-lg border border-border bg-surface">
        {bounties.map((b, i) => (
          <Link
            key={b.id}
            to={`/bounties/${b.id}`}
            className="group block px-4 py-4 first:pt-4 last:pb-4 hover:bg-surface-2/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ink-faint">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-medium text-ink group-hover:text-accent">{b.title}</h3>
                </div>
                <p className="mt-1.5 max-w-2xl text-sm text-ink-dim line-clamp-2">
                  {b.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {b.severities && b.severities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {b.severities.slice(0, 3).map((s) => (
                        <SeverityPill key={s.level} severity={s} />
                      ))}
                      {b.severities.length > 3 && (
                        <span className="inline-flex items-center rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-faint">
                          +{b.severities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="text-xs text-ink-faint">
                    Pool:{" "}
                    <span className="font-mono font-medium text-ink">
                      {weiToEth(b.rewardAmountWei)} ETH
                    </span>
                  </span>
                  <span className="text-xs text-ink-faint">
                    Scope: {b.scope} endpoints
                  </span>
                  <span className="flex items-center gap-1 text-xs text-ink-faint">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4l2 2" />
                    </svg>
                    {daysLeft(b.deadline)}d left
                  </span>
                </div>
              </div>
              <StatusBadge status={b.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SeverityPill({ severity }: { severity: BountySeverity }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px]",
      )}
    >
      <span className={cn("font-medium", severityColor(severity.level))}>{severity.level.slice(0, 3)}</span>
      <span className="text-ink-faint">{weiToEth(severity.rewardWei)} ETH</span>
    </span>
  );
}
