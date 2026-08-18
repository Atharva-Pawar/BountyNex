import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Crosshair, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import type { Bounty } from "../../types";
import {
  cn,
  daysLeft,
  severityColor,
  timeAgo,
  weiToEth,
} from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/Badge";
import { Spinner, EmptyState } from "../../components/ui/State";
import { PageHeader } from "../../components/ui/PageHeader";
import {
  BountyFilters,
  type BountyFiltersState,
} from "../../components/bounty/BountyFilters";

export function BrowseBounties() {
  const [filters, setFilters] = useState<BountyFiltersState>({
    q: "",
    severity: "",
    sort: "newest",
    status: undefined,
    minReward: undefined,
  });

  const { data, isLoading, isError, refetch } = useQuery<{ items: Bounty[] }>({
    queryKey: ["bounties-browse"],
    queryFn: async () => (await api.get("/api/bounties?limit=50")) as { items: Bounty[] },
  });

  const bounties = useMemo(() => {
    const items = data?.items ?? [];

    const q = filters.q.trim().toLowerCase();
    const filtered = items.filter((b) => {
      if (q && !`${b.title} ${b.description} ${b.organization?.name ?? ""}`.toLowerCase().includes(q)) {
        return false;
      }
      if (filters.severity && !b.severities.some((s) => s.level === filters.severity)) {
        return false;
      }
      if (filters.minReward) {
        try {
          if (BigInt(b.rewardAmountWei) < BigInt(filters.minReward)) return false;
        } catch {
          /* ignore malformed reward */
        }
      }
      return true;
    });

    const sorted = [...filtered];
    switch (filters.sort) {
      case "reward_high":
        sorted.sort((a, b) => {
          try {
            return Number(BigInt(b.rewardAmountWei) - BigInt(a.rewardAmountWei));
          } catch {
            return 0;
          }
        });
        break;
      case "reward_low":
        sorted.sort((a, b) => {
          try {
            return Number(BigInt(a.rewardAmountWei) - BigInt(b.rewardAmountWei));
          } catch {
            return 0;
          }
        });
        break;
      case "deadline":
        sorted.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [data, filters]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh]">
        <Spinner label="Loading bounties..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-fog">Could not load bounties.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <PageHeader
        eyebrow="Marketplace"
        title="Bounty programs"
        subtitle={`${bounties.length} programs matching your criteria`}
      />

      <BountyFilters filters={filters} onChange={setFilters} />

      {bounties.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Crosshair className="h-5 w-5" />}
            title="No bounties found"
            description="Adjust your filters or check back later for new programs."
          />
        </div>
      ) : (
        <div className="divide-y divide-graphite">
          {bounties.map((b) => (
            <BountyRow key={b.id} bounty={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function BountyRow({ bounty: b }: { bounty: Bounty }) {
  return (
    <Link
      to={`/bounties/${b.id}`}
      className="group grid gap-3 py-5 transition-colors duration-150 sm:grid-cols-[1fr_auto] sm:items-start"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase text-ash">BNX-{b.id.slice(0, 6)}</span>
          <h3 className="text-[15px] font-medium text-paper transition-colors duration-150 group-hover:text-bone">
            {b.title}
          </h3>
          {b.severities && b.severities.length > 0 && (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 font-mono text-[10px] font-medium capitalize",
                severityColor(b.severities[0].level),
                "bg-obsidian",
              )}
            >
              {b.severities[0].level.toLowerCase()}
            </span>
          )}
        </div>

        <p className="mt-1.5 line-clamp-1 text-[13px] text-fog">{b.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-[11px] text-ash">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck
              className={cn("h-3 w-3", b.organization?.isVerified ? "text-pulse-green" : "text-ash")}
            />
            {b.organization?.name ?? "Organization"}
          </span>
          <span>{b.scope ? `${b.scope}` : "public scope"}</span>
          <span>sepolia</span>
          <span>{timeAgo(b.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end lg:flex-row lg:gap-6">
        <div className="text-right">
          <p className="font-mono text-[15px] font-medium text-paper">
            {weiToEth(b.rewardAmountWei)} <span className="text-[10px] text-ash">ETH</span>
          </p>
          <p className={cn("font-mono text-[10px]", daysLeft(b.deadline) === 0 ? "text-coral-red" : "text-ash")}>
            {daysLeft(b.deadline) === 0 ? "expired" : `${daysLeft(b.deadline)}d left`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={b.status} />
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-graphite text-fog opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:border-smoke group-hover:text-acid-lime">
            <Crosshair className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}