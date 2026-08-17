import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Award, Bug, Clock, FileText, Plus, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import type { BugReport } from "../../types";
import { useAuth } from "../../providers/AuthProvider";
import { weiToEth } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState, Spinner } from "../../components/ui/State";

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

  const stats = [
    { label: "Reports submitted", value: String(reports?.pagination.total ?? 0), icon: <FileText className="h-4 w-4" /> },
    { label: "Pending review", value: String(items.filter((r) => r.status === "SUBMITTED" || r.status === "UNDER_REVIEW").length), icon: <Clock className="h-4 w-4" /> },
    { label: "Accepted", value: String(items.filter((r) => r.status === "ACCEPTED" || r.status === "REWARDED").length), icon: <Bug className="h-4 w-4" /> },
    { label: "Total earned", value: `${weiToEth(totalEarned)} ETH`, icon: <Award className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ink-dim">
            {user?.researcherProfile?.handle ? (
              <span className="font-mono">@{user.researcherProfile.handle}</span>
            ) : (
              "Complete your profile to get started"
            )}
          </p>
        </div>
        <Link to="/researcher/browse">
          <Button>
            <Plus className="h-4 w-4" /> Find bounties
          </Button>
        </Link>
      </div>

      {/* Stats - inline, not cards */}
      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface p-4">
            <div className="flex items-center gap-2 text-ink-dim mb-2">
              {s.icon}
              <span className="text-xs">{s.label}</span>
            </div>
            <p className="font-mono text-xl font-semibold text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent reports */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Recent reports</h2>
          <Link to="/researcher/reports" className="text-sm font-medium text-accent hover:underline">
            View all <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-surface">
          {reportsLoading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<ShieldCheck className="h-6 w-6" />}
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
            <div className="divide-y divide-border">
              {items.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-4 px-4 py-3 first:pt-3 last:pb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{r.title}</p>
                    <p className="truncate text-xs text-ink-faint">{r.bounty?.title}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
