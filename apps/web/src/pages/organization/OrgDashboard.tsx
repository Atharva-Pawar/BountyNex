import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bug, DollarSign, FileText, Plus, Wallet2 } from "lucide-react";
import { api } from "../../lib/api";
import type { Bounty, Pagination, Wallet } from "../../types";
import { useAuth } from "../../providers/AuthProvider";
import { shortAddress, weiToEth } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState, Spinner } from "../../components/ui/State";
import { PageHeader } from "../../components/ui/PageHeader";
import { Metric, MetricCell, MetricStrip } from "../../components/ui/Metric";

interface BountyListResponse {
  items: Bounty[];
  pagination: Pagination;
}

export function OrgDashboard() {
  const { user } = useAuth();

  const { data: bounties, isLoading } = useQuery<BountyListResponse>({
    queryKey: ["org-dashboard-bounties"],
    queryFn: async () => (await api.get("/api/bounties?mine=true&limit=5")) as BountyListResponse,
  });

  const { data: walletData } = useQuery({
    queryKey: ["org-dashboard-wallet"],
    queryFn: async () => (await api.get("/api/wallet")) as { wallet: Wallet | null },
  });

  const { data: rewards } = useQuery({
    queryKey: ["org-dashboard-rewards"],
    queryFn: async () => (await api.get("/api/rewards/org")) as { items: { status: string; amountWei: string }[] },
  });

  const myBounties = bounties?.items ?? [];
  const activeCount = myBounties.filter((b) => b.status === "ACTIVE").length;
  const totalReports = myBounties.reduce((acc, b) => acc + (b._count?.bugReports ?? 0), 0);
  const fundedCount = myBounties.filter((b) => b.isFunded).length;

  const rewardItems = rewards?.items ?? [];
  const totalPaid = rewardItems
    .filter((r) => r.status === "PAID")
    .reduce((acc, r) => acc + BigInt(r.amountWei), 0n);

  return (
    <div className="space-y-10">
      {/* ── Identity + action ───────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ash">Organization workspace</p>
          <h1 className="text-2xl font-medium tracking-tight text-paper">
            {user?.organization?.name ?? user?.name}
          </h1>
          <p className="mt-1 font-mono text-[13px] text-fog">
            {walletData?.wallet?.address ? (
              <>wallet {shortAddress(walletData.wallet.address, 5)}</>
            ) : (
              <span className="text-coral-red">connect a wallet to fund bounties</span>
            )}
          </p>
        </div>
        <Link to="/organization/create">
          <Button>
            <Plus className="h-4 w-4" /> Create bounty
          </Button>
        </Link>
      </div>

      {/* ── Metrics ──────────────────────────────────────── */}
      <MetricStrip>
        <MetricCell>
          <Metric label="Active programs" value={String(activeCount)} icon={<Bug className="h-3.5 w-3.5" />} />
        </MetricCell>
        <MetricCell>
          <Metric label="Total submissions" value={String(totalReports)} icon={<FileText className="h-3.5 w-3.5" />} />
        </MetricCell>
        <MetricCell>
          <Metric label="Funded bounties" value={String(fundedCount)} icon={<DollarSign className="h-3.5 w-3.5" />} />
        </MetricCell>
        <MetricCell>
          <Metric label="Rewards paid" value={`${weiToEth(totalPaid)} ETH`} icon={<Wallet2 className="h-3.5 w-3.5" />} />
        </MetricCell>
      </MetricStrip>

      {/* ── Recent programs ──────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ash">Programs</p>
            <h2 className="text-lg font-medium tracking-tight text-paper">Recent bounty programs</h2>
          </div>
          <Link to="/organization/bounties" className="text-[13px] font-medium text-mist transition-colors duration-150 hover:text-paper">
            Manage all →
          </Link>
        </div>

        <div className="rounded-lg border border-graphite bg-surface">
          {isLoading ? (
            <Spinner />
          ) : myBounties.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Bug className="h-5 w-5" />}
                title="No bounty programs yet"
                description="Launch your first program to start receiving vulnerability reports."
                action={
                  <Link to="/organization/create">
                    <Button size="sm">Create bounty</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-graphite">
              {myBounties.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <Link
                      to={`/organization/bounties/${b.id}/reports`}
                      className="truncate text-sm font-medium text-paper transition-colors duration-150 hover:text-bone"
                    >
                      {b.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-[11px] text-ash">
                      BNX-{b.id.slice(0, 6)} · {b._count?.bugReports ?? 0} reports ·{" "}
                      {b.isFunded ? "funded" : "unfunded"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-[13px] font-medium text-paper">{weiToEth(b.rewardAmountWei)} ETH</span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}