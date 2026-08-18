import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Activity, Bug, Coins, FileText, Users } from "lucide-react";
import { api } from "../../lib/api";
import type { AdminStats } from "../../types";
import { weiToEth } from "../../lib/utils";
import { Card, CardBody } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { PageHeader } from "../../components/ui/PageHeader";
import { Metric, MetricCell, MetricStrip } from "../../components/ui/Metric";

export function AdminDashboard() {
  const { data, isLoading, isError, error } = useQuery<{ stats: AdminStats }>({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/api/admin/stats")) as { stats: AdminStats },
  });

  if (isLoading) return <Spinner label="Loading platform stats..." />;
  if (isError || !data) return <ErrorState message="Unable to load platform stats. Please try again." />;

  const s = data.stats;
  const roleTotal = Object.values(s.users.byRole).reduce((a, b) => a + b, 0) || s.users.total;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Console"
        title="Admin dashboard"
        subtitle="Platform-wide overview and moderation"
      />

      <div className="grid gap-px overflow-hidden rounded-lg border border-graphite bg-graphite sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/users" className="group bg-surface p-4 transition-colors duration-150 hover:bg-obsidian">
          <div className="flex items-center gap-2 text-fog">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs">Total users</span>
          </div>
          <p className="mt-1.5 font-mono text-lg font-medium text-paper">{String(s.users.total)}</p>
          <p className="mt-0.5 text-[11px] text-ash">{roleTotal} across roles</p>
        </Link>
        <Link to="/admin/bounties" className="group bg-surface p-4 transition-colors duration-150 hover:bg-obsidian">
          <div className="flex items-center gap-2 text-fog">
            <Bug className="h-3.5 w-3.5" />
            <span className="text-xs">Bounty programs</span>
          </div>
          <p className="mt-1.5 font-mono text-lg font-medium text-paper">{String(s.bounties.total)}</p>
          <p className="mt-0.5 text-[11px] text-ash">{s.bounties.funded} funded</p>
        </Link>
        <Link to="/admin/reports" className="group bg-surface p-4 transition-colors duration-150 hover:bg-obsidian">
          <div className="flex items-center gap-2 text-fog">
            <FileText className="h-3.5 w-3.5" />
            <span className="text-xs">Vulnerability reports</span>
          </div>
          <p className="mt-1.5 font-mono text-lg font-medium text-paper">{String(s.reports.total)}</p>
          <p className="mt-0.5 text-[11px] text-ash">all submissions</p>
        </Link>
        <Link to="/admin/analytics" className="group bg-surface p-4 transition-colors duration-150 hover:bg-obsidian">
          <div className="flex items-center gap-2 text-fog">
            <Coins className="h-3.5 w-3.5" />
            <span className="text-xs">Rewards paid</span>
          </div>
          <p className="mt-1.5 font-mono text-lg font-medium text-acid-lime">{`${weiToEth(s.rewards.paidWei)} ETH`}</p>
          <p className="mt-0.5 text-[11px] text-ash">{s.rewards.paidCount} payouts</p>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="border-b border-graphite px-5 py-3.5">
            <h2 className="text-sm font-medium tracking-tight text-paper">Bounty status distribution</h2>
          </div>
          <CardBody className="space-y-3.5 p-5">
            {Object.entries(s.bounties.byStatus).map(([status, count]) => (
              <div key={status}>
                <div className="mb-1.5 flex justify-between text-[13px]">
                  <span className="text-mist">{status}</span>
                  <span className="font-medium text-paper">{count}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-obsidian">
                  <div
                    className="h-full rounded-full bg-acid-lime transition-all duration-500"
                    style={{ width: s.bounties.total ? `${(count / s.bounties.total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <div className="border-b border-graphite px-5 py-3.5">
            <h2 className="text-sm font-medium tracking-tight text-paper">Report status distribution</h2>
          </div>
          <CardBody className="space-y-3.5 p-5">
            {Object.entries(s.reports.byStatus).map(([status, count]) => (
              <div key={status}>
                <div className="mb-1.5 flex justify-between text-[13px]">
                  <span className="text-mist">{status.replace(/_/g, " ")}</span>
                  <span className="font-medium text-paper">{count}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-obsidian">
                  <div
                    className="h-full rounded-full bg-signal-teal transition-all duration-500"
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
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-acid-lime/25 bg-acid-lime/10 text-acid-lime">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ash">Blockchain activity</p>
            <p className="font-mono text-[15px] font-medium text-paper">
              {s.transactions.total} transactions · {weiToEth(s.bounties.totalDepositedWei)} ETH escrowed
            </p>
          </div>
        </CardBody>
      </Card>

      <MetricStrip>
        <MetricCell>
          <Metric label="Active bounties" value={String(s.bounties.byStatus.ACTIVE ?? 0)} />
        </MetricCell>
        <MetricCell>
          <Metric label="Submitted reports" value={String(s.reports.byStatus.SUBMITTED ?? 0)} />
        </MetricCell>
        <MetricCell>
          <Metric label="Rewarded reports" value={String(s.reports.byStatus.REWARDED ?? 0)} />
        </MetricCell>
      </MetricStrip>
    </div>
  );
}