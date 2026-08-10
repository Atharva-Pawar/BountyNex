import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Activity, Bug, Coins, FileText, Users } from "lucide-react";
import { api } from "../../lib/api";
import type { AdminStats } from "../../types";
import { weiToEth } from "../../lib/utils";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";

export function AdminDashboard() {
  const { data, isLoading, isError, error } = useQuery<{ stats: AdminStats }>({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/api/admin/stats")) as { stats: AdminStats },
  });

  if (isLoading) return <Spinner label="Loading platform stats..." />;
  if (isError || !data) return <ErrorState message="Unable to load platform stats. Please try again." />;

  const s = data.stats;
  const roleTotal = Object.values(s.users.byRole).reduce((a, b) => a + b, 0) || s.users.total;

  const cards = [
    { label: "Total users", value: String(s.users.total), icon: <Users className="h-5 w-5" />, to: "/admin/users", detail: `${roleTotal} across roles`, color: "text-cyan-500 bg-cyan-500/10" },
    { label: "Bounty programs", value: String(s.bounties.total), icon: <Bug className="h-5 w-5" />, to: "/admin/bounties", detail: `${s.bounties.funded} funded`, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Vulnerability reports", value: String(s.reports.total), icon: <FileText className="h-5 w-5" />, to: "/admin/reports", detail: "all submissions", color: "text-violet-500 bg-violet-500/10" },
    { label: "Rewards paid", value: `${weiToEth(s.rewards.paidWei)} ETH`, icon: <Coins className="h-5 w-5" />, to: "/admin/analytics", detail: `${s.rewards.paidCount} payouts`, color: "text-amber-500 bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Admin dashboard</h1>
        <p className="text-sm text-ink-dim">Platform-wide overview and moderation</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}>
            <Card hover className="flex items-center gap-4 p-5 h-full">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${c.color}`}>
                {c.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-ink-faint truncate">{c.label}</p>
                <p className="text-lg font-bold text-ink truncate">{c.value}</p>
                <p className="text-xs text-ink-faint truncate">{c.detail}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Bounty status distribution" />
          <CardBody className="space-y-3">
            {Object.entries(s.bounties.byStatus).map(([status, count]) => (
              <div key={status}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-ink-dim">{status}</span>
                  <span className="font-medium text-ink">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: s.bounties.total ? `${(count / s.bounties.total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Report status distribution" />
          <CardBody className="space-y-3">
            {Object.entries(s.reports.byStatus).map(([status, count]) => (
              <div key={status}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-ink-dim">{status.replace(/_/g, " ")}</span>
                  <span className="font-medium text-ink">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                    style={{ width: s.reports.total ? `${(count / s.reports.total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card className="border-accent/20">
        <CardBody className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-faint">Blockchain activity</p>
            <p className="text-lg font-bold text-ink">
              {s.transactions.total} transactions · {weiToEth(s.bounties.totalDepositedWei)} ETH escrowed
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
