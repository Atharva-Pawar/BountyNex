import { useQuery } from "@tanstack/react-query";
import { Coins, ShieldCheck, Trophy, Users } from "lucide-react";
import { api } from "../../lib/api";
import type { AdminStats } from "../../types";
import { weiToEth } from "../../lib/utils";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";

export function AdminAnalytics() {
  const { data, isLoading, isError, error } = useQuery<{ stats: AdminStats }>({
    queryKey: ["admin-analytics"],
    queryFn: async () => (await api.get("/api/admin/stats")) as { stats: AdminStats },
  });

  if (isLoading) return <Spinner label="Loading analytics..." />;
  if (isError || !data) return <ErrorState message="Unable to load analytics. Please try again." />;

  const s = data.stats;

  const highlights = [
    { label: "Total users", value: String(s.users.total), icon: <Users className="h-5 w-5" />, color: "text-cyan-500 bg-cyan-500/10" },
    { label: "Rewards paid", value: String(s.rewards.paidCount), icon: <Trophy className="h-5 w-5" />, color: "text-amber-500 bg-amber-500/10" },
    { label: "Escrowed ETH", value: `${weiToEth(s.bounties.totalDepositedWei)} ETH`, icon: <Coins className="h-5 w-5" />, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Verified orgs", value: String(s.users.byRole.ORGANIZATION ?? 0), icon: <ShieldCheck className="h-5 w-5" />, color: "text-violet-500 bg-violet-500/10" },
  ];

  const usersTotal = Math.max(Object.values(s.users.byRole).reduce((a, b) => a + b, 0), 1);
  const txTotal = Math.max(Object.values(s.transactions.byStatus).reduce((a, b) => a + b, 0), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Analytics</h1>
        <p className="text-sm text-ink-dim">Key metrics and platform health</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((h) => (
          <Card key={h.label} className="flex items-center gap-4 p-5">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${h.color}`}>
              {h.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink-faint truncate">{h.label}</p>
              <p className="text-lg font-bold text-ink truncate">{h.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Users by role" />
          <CardBody className="space-y-3">
            {Object.entries(s.users.byRole).map(([role, count]) => (
              <div key={role}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-ink-dim">{role}</span>
                  <span className="font-medium text-ink">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-cyan-500 transition-all duration-500" style={{ width: `${(count / usersTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Transaction status" />
          <CardBody className="space-y-3">
            {Object.entries(s.transactions.byStatus).map(([status, count]) => (
              <div key={status}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-ink-dim">{status}</span>
                  <span className="font-medium text-ink">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${(count / txTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Bounty & reward summary" />
        <CardBody className="grid gap-4 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <p className="text-xs text-ink-faint">Bounties</p>
            <p className="mt-1 text-lg font-bold text-ink">{s.bounties.total}</p>
            <p className="text-xs text-ink-faint">{s.bounties.funded} funded</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <p className="text-xs text-ink-faint">Reports</p>
            <p className="mt-1 text-lg font-bold text-ink">{s.reports.total}</p>
            <p className="text-xs text-ink-faint">across all programs</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <p className="text-xs text-ink-faint">Transactions</p>
            <p className="mt-1 text-lg font-bold text-ink">{s.transactions.total}</p>
            <p className="text-xs text-ink-faint">on Sepolia</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
