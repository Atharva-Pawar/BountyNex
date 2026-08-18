import { useQuery } from "@tanstack/react-query";
import { Coins, ShieldCheck, Trophy, Users } from "lucide-react";
import { api } from "../../lib/api";
import type { AdminStats } from "../../types";
import { weiToEth } from "../../lib/utils";
import { Card, CardBody } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { PageHeader } from "../../components/ui/PageHeader";

export function AdminAnalytics() {
  const { data, isLoading, isError, error } = useQuery<{ stats: AdminStats }>({
    queryKey: ["admin-analytics"],
    queryFn: async () => (await api.get("/api/admin/stats")) as { stats: AdminStats },
  });

  if (isLoading) return <Spinner label="Loading analytics..." />;
  if (isError || !data) return <ErrorState message="Unable to load analytics. Please try again." />;

  const s = data.stats;

  const highlights = [
    { label: "Total users", value: String(s.users.total), icon: <Users className="h-4 w-4" /> },
    { label: "Rewards paid", value: String(s.rewards.paidCount), icon: <Trophy className="h-4 w-4" /> },
    { label: "Escrowed ETH", value: `${weiToEth(s.bounties.totalDepositedWei)} ETH`, icon: <Coins className="h-4 w-4" /> },
    { label: "Verified orgs", value: String(s.users.byRole.ORGANIZATION ?? 0), icon: <ShieldCheck className="h-4 w-4" /> },
  ];

  const usersTotal = Math.max(Object.values(s.users.byRole).reduce((a, b) => a + b, 0), 1);
  const txTotal = Math.max(Object.values(s.transactions.byStatus).reduce((a, b) => a + b, 0), 1);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Console"
        title="Analytics"
        subtitle="Key metrics and platform health"
      />

      <div className="grid gap-px overflow-hidden rounded-lg border border-graphite bg-graphite sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((h) => (
          <div key={h.label} className="bg-surface p-4">
            <div className="flex items-center gap-2 text-fog">
              {h.icon}
              <span className="text-xs">{h.label}</span>
            </div>
            <p className="font-mono text-xl font-medium tracking-tight text-paper">{h.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="border-b border-graphite px-5 py-3.5">
            <h2 className="text-sm font-medium tracking-tight text-paper">Users by role</h2>
          </div>
          <CardBody className="space-y-3.5 p-5">
            {Object.entries(s.users.byRole).map(([role, count]) => (
              <div key={role}>
                <div className="mb-1.5 flex justify-between text-[13px]">
                  <span className="text-mist">{role}</span>
                  <span className="font-medium text-paper">{count}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-obsidian">
                  <div className="h-full rounded-full bg-signal-teal transition-all duration-500" style={{ width: `${(count / usersTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <div className="border-b border-graphite px-5 py-3.5">
            <h2 className="text-sm font-medium tracking-tight text-paper">Transaction status</h2>
          </div>
          <CardBody className="space-y-3.5 p-5">
            {Object.entries(s.transactions.byStatus).map(([status, count]) => (
              <div key={status}>
                <div className="mb-1.5 flex justify-between text-[13px]">
                  <span className="text-mist">{status}</span>
                  <span className="font-medium text-paper">{count}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-obsidian">
                  <div className="h-full rounded-full bg-acid-lime transition-all duration-500" style={{ width: `${(count / txTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card>
        <div className="border-b border-graphite px-5 py-3.5">
          <h2 className="text-sm font-medium tracking-tight text-paper">Bounty & reward summary</h2>
        </div>
        <CardBody className="grid gap-px overflow-hidden rounded-b-lg border border-t-0 border-graphite bg-graphite text-sm sm:grid-cols-3">
          <div className="bg-surface p-4">
            <p className="text-[11px] text-ash">Bounties</p>
            <p className="mt-1 font-mono text-lg font-medium text-paper">{s.bounties.total}</p>
            <p className="text-[11px] text-fog">{s.bounties.funded} funded</p>
          </div>
          <div className="bg-surface p-4">
            <p className="text-[11px] text-ash">Reports</p>
            <p className="mt-1 font-mono text-lg font-medium text-paper">{s.reports.total}</p>
            <p className="text-[11px] text-fog">across all programs</p>
          </div>
          <div className="bg-surface p-4">
            <p className="text-[11px] text-ash">Transactions</p>
            <p className="mt-1 font-mono text-lg font-medium text-paper">{s.transactions.total}</p>
            <p className="text-[11px] text-fog">on Sepolia</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}