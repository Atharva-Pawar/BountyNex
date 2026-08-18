import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Award, Bug, Clock, FileSearch, Plus, ShieldCheck, Star } from "lucide-react";
import { api } from "../../lib/api";
import type { BugReport } from "../../types";
import { useAuth } from "../../providers/AuthProvider";
import { weiToEth } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState, Spinner } from "../../components/ui/State";
import { PageHeader } from "../../components/ui/PageHeader";
import { Metric, MetricCell, MetricStrip } from "../../components/ui/Metric";

interface ReportsResponse {
  items: BugReport[];
  pagination: { total: number };
}

export function ResearcherDashboard() {
  const { user } = useAuth();

  const { data: reports, isLoading: reportsLoading } = useQuery<ReportsResponse>({
    queryKey: ["researcher-dashboard-reports"],
    queryFn: async () => (await api.get("/api/reports/my?limit=5")) as ReportsResponse,
  });

  const { data: rewards } = useQuery({
    queryKey: ["researcher-dashboard-rewards"],
    queryFn: async () => (await api.get("/api/rewards/my")) as { items: { status: string; amountWei: string }[] },
  });

  const items = reports?.items ?? [];
  const rewardItems = rewards?.items ?? [];
  const paid = rewardItems.filter((r) => r.status === "PAID");
  const totalEarned = paid.reduce((acc, r) => acc + BigInt(r.amountWei), 0n);
  const reputation = user?.researcherProfile?.reputationScore ?? 0;
  const pendingCount = items.filter((r) => r.status === "SUBMITTED" || r.status === "UNDER_REVIEW").length;
  const acceptedCount = items.filter((r) => r.status === "ACCEPTED" || r.status === "REWARDED").length;

  return (
    <div className="space-y-10">
      {/* ── Identity + quick action ─────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ash">Researcher workspace</p>
          <h1 className="text-2xl font-medium tracking-tight text-paper">
            {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 flex items-center gap-2 font-mono text-[13px] text-fog">
            {user?.researcherProfile?.handle ? (
              <>@{user.researcherProfile.handle}</>
            ) : (
              <span className="text-coral-red">complete your profile to start</span>
            )}
            <span className="inline-flex items-center gap-1 rounded-sm border border-graphite bg-obsidian px-2 py-0.5 font-mono text-[10px] text-fog">
              <Star className="h-3 w-3 text-acid-lime" />
              {reputation.toFixed(1)} rep
            </span>
          </p>
        </div>
        <Link to="/researcher/browse">
          <Button>
            <Plus className="h-4 w-4" /> Find bounties
          </Button>
        </Link>
      </div>

      {/* ── Metrics ──────────────────────────────────────── */}
      <MetricStrip>
        <MetricCell>
          <Metric label="Reports submitted" value={String(reports?.pagination.total ?? 0)} icon={<FileSearch className="h-3.5 w-3.5" />} />
        </MetricCell>
        <MetricCell>
          <Metric label="Pending review" value={String(pendingCount)} icon={<Clock className="h-3.5 w-3.5" />} />
        </MetricCell>
        <MetricCell>
          <Metric label="Accepted" value={String(acceptedCount)} icon={<Bug className="h-3.5 w-3.5" />} />
        </MetricCell>
        <MetricCell>
          <Metric label="Total earned" value={`${weiToEth(totalEarned)} ETH`} icon={<Award className="h-3.5 w-3.5" />} />
        </MetricCell>
      </MetricStrip>

      {/* ── Recent reports ───────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ash">Activity</p>
            <h2 className="text-lg font-medium tracking-tight text-paper">Recent reports</h2>
          </div>
          <Link to="/researcher/reports" className="text-[13px] font-medium text-mist transition-colors duration-150 hover:text-paper">
            View all →
          </Link>
        </div>

        <div className="rounded-lg border border-graphite bg-surface">
          {reportsLoading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<ShieldCheck className="h-5 w-5" />}
                title="No reports yet"
                description="Browse active bounties and submit your first vulnerability report."
                action={
                  <Link to="/researcher/browse">
                    <Button size="sm">Browse bounties</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-graphite">
              {items.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-4 px-5 py-3.5 first:pt-3.5 last:pb-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-paper">{r.title}</p>
                    <p className="truncate font-mono text-[11px] text-ash">BNX-{r.bounty?.title ?? "—"}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}