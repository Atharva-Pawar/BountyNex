import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Award, Bug, Clock, FileText, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import type { BugReport } from "../../types";
import { useAuth } from "../../providers/AuthProvider";
import { weiToEth } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { EmptyState, Spinner } from "../../components/ui/State";

interface ReportsResponse {
  items: BugReport[];
  pagination: { total: number };
}

export function ResearcherDashboard() {
  const { user } = useAuth();

  const { data: reports, isLoading } = useQuery<ReportsResponse>({
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
    { label: "Reports submitted", value: reports?.pagination.total ?? 0, icon: <FileText className="h-5 w-5" /> },
    { label: "Pending review", value: items.filter((r) => r.status === "SUBMITTED" || r.status === "UNDER_REVIEW").length, icon: <Clock className="h-5 w-5" /> },
    { label: "Accepted", value: items.filter((r) => r.status === "ACCEPTED" || r.status === "REWARDED").length, icon: <Bug className="h-5 w-5" /> },
    { label: "Total earned", value: `${weiToEth(totalEarned)} ETH`, icon: <Award className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Welcome back, {user?.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-ink-dim">
            {user?.researcherProfile?.handle ? `@${user.researcherProfile.handle}` : "Complete your profile to get started"}
          </p>
        </div>
        <Link to="/researcher/browse">
          <Button>Find bounties</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-ink-faint">{s.label}</p>
              <p className="text-xl font-bold text-ink">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Recent reports"
          subtitle="Track the status of your latest submissions"
          action={<Link to="/researcher/reports" className="text-sm text-accent hover:underline">View all</Link>}
        />
        <CardBody>
          {isLoading ? (
            <Spinner />
          ) : items.length === 0 ? (
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
          ) : (
            <ul className="divide-y divide-border">
              {items.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{r.title}</p>
                    <p className="truncate text-xs text-ink-faint">{r.bounty?.title}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
