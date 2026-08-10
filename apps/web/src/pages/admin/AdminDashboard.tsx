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
    { label: "Total users", value: String(s.users.total), icon: <Users className="h-4 w-4" />, to: "/admin/users", detail: `${roleTotal} across roles` },
    { label: "Bounty programs", value: String(s.bounties.total), icon: <Bug className="h-4 w-4" />, to: "/admin/bounties", detail: `${s.bounties.funded} funded` },
    { label: "Vulnerability reports", value: String(s.reports.total), icon: <FileText className="h-4 w-4" />, to: "/admin/reports", detail: "all submissions" },
    { label: "Rewards paid", value: `${weiToEth(s.rewards.paidWei)} ETH`, icon: <Coins className="h-4 w-4" />, to: "/admin/analytics", detail: `${s.rewards.paidCount} payouts` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Admin dashboard</h1>
        <p className="text-sm text-ink-dim">Platform-wide overview and moderation</p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="bg-surface p-4 transition-colors hover:bg-surface-2">
            <div className="flex items-center gap-2 text-ink-dim mb-2">
              {c.icon}
              <span className="text-xs">{c.label}</span>
            </div>
            <p className="text-xl font-semibold text-ink">{c.value}</p>
            <p className="text-xs text-ink-faint mt-1">{c.detail}</p>
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
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
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
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
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

      <Card>
        <CardBody className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-faint">Blockchain activity</p>
            <p className="text-lg font-semibold text-ink">
              {s.transactions.total} transactions · {weiToEth(s.bounties.totalDepositedWei)} ETH escrowed
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
