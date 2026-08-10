import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { api } from "../../lib/api";
import type { BugReport, ReportStatus } from "../../types";
import { formatDate, weiToEth } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { EmptyState, ErrorState, Spinner } from "../../components/ui/State";

const STATUSES: Array<ReportStatus | "ALL"> = ["ALL", "SUBMITTED", "UNDER_REVIEW", "NEEDS_INFORMATION", "ACCEPTED", "REJECTED", "REWARDED"];

export function BountySubmissions({ all = false }: { all?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<ReportStatus | "ALL">("ALL");

  const endpoint = all
    ? `/api/reports/org${status !== "ALL" ? `?status=${status}` : ""}`
    : `/api/bounties/${id}/reports${status !== "ALL" ? `?status=${status}` : ""}`;

  const { data, isLoading, isError, error, refetch } = useQuery<{ items: BugReport[] }>({
    queryKey: ["org-reports", all ? "all" : id, status],
    queryFn: async () => (await api.get(endpoint)) as { items: BugReport[] },
    enabled: all ? true : Boolean(id),
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Submissions</h1>
        <p className="text-sm text-ink-dim">
          {all ? "Reports across all your bounty programs" : "Reports for a single program"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={
              status === s
                ? "rounded-md border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent transition-colors"
                : "rounded-md border border-border px-3 py-1 text-xs font-medium text-ink-dim transition-colors hover:border-border-strong hover:text-ink"
            }
          >
            {s === "ALL" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Reports"
          action={
            <button onClick={() => void refetch()} className="text-sm font-medium text-accent hover:underline">
              Refresh
            </button>
          }
        />
        <CardBody>
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message="Unable to load submissions. Please try again." retry={() => void refetch()} />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title="No submissions in this view"
              description="Reports from researchers will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-faint">
                    <th className="pb-3 pr-4 font-medium">Report</th>
                    <th className="pb-3 pr-4 font-medium">Researcher</th>
                    <th className="pb-3 pr-4 font-medium">Severity</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Submitted</th>
                    <th className="pb-3 font-medium">Reward</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-surface-2/50">
                      <td className="py-3 pr-4">
                        <Link to={`/organization/reports/${r.id}`} className="font-medium text-ink hover:text-accent">
                          {r.title}
                        </Link>
                        <p className="text-xs text-ink-faint">{r.bounty?.title}</p>
                      </td>
                      <td className="py-3 pr-4 text-ink-dim">
                        {r.researcher?.name}
                        {r.researcher?.researcherProfile?.handle && (
                          <span className="text-xs text-ink-faint"> · @{r.researcher.researcherProfile.handle}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4"><StatusBadge status={r.severity} /></td>
                      <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                      <td className="py-3 pr-4 text-ink-dim">{formatDate(r.submittedAt)}</td>
                      <td className="py-3 font-mono text-ink-dim">
                        {r.rewardWei ? `${weiToEth(r.rewardWei)} ETH` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
