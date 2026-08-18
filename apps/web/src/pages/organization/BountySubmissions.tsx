import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Inbox, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import type { BugReport, ReportStatus } from "../../types";
import { formatDate, weiToEth } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Card, CardBody } from "../../components/ui/Card";
import { EmptyState, ErrorState, Spinner } from "../../components/ui/State";
import { PageHeader } from "../../components/ui/PageHeader";

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
      <PageHeader
        eyebrow="Submissions"
        title={all ? "All submissions" : "Submissions"}
        subtitle={all ? "Reports across all your bounty programs" : "Reports for a single program"}
      />

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={
              status === s
                ? "rounded-sm border border-acid-lime/30 bg-acid-lime/10 px-3 py-1.5 text-[12px] font-medium text-acid-lime transition-colors duration-150"
                : "rounded-sm border border-graphite px-3 py-1.5 text-[12px] font-medium text-fog transition-colors duration-150 hover:border-smoke hover:text-paper"
            }
          >
            {s === "ALL" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-graphite px-5 py-3.5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ash">
            {items.length} report{items.length === 1 ? "" : "s"}
          </p>
          <button onClick={() => void refetch()} className="flex items-center gap-1.5 text-[13px] font-medium text-mist transition-colors duration-150 hover:text-paper">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
        <CardBody className="p-0">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message="Unable to load submissions. Please try again." retry={() => void refetch()} />
          ) : items.length === 0 ? (
            <div className="p-10">
              <EmptyState
                icon={<Inbox className="h-5 w-5" />}
                title="No submissions in this view"
                description="Reports from researchers will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-graphite text-[11px] uppercase tracking-wider text-ash">
                    <th className="px-5 pb-3 pr-4 pt-3 font-medium">Report</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Researcher</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Severity</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Status</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Submitted</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Reward</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite">
                  {items.map((r) => (
                    <tr key={r.id} className="transition-colors duration-150 hover:bg-obsidian/60">
                      <td className="px-5 py-3.5 pr-4">
                        <Link to={`/organization/reports/${r.id}`} className="font-medium tracking-tight text-paper transition-colors duration-150 hover:text-bone">
                          {r.title}
                        </Link>
                        <p className="mt-0.5 font-mono text-[11px] text-ash">
                          BR-{r.id.slice(0, 6)} · {r.bounty?.title}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4 text-mist">
                        {r.researcher?.name}
                        {r.researcher?.researcherProfile?.handle && (
                          <span className="font-mono text-[11px] text-ash"> · @{r.researcher.researcherProfile.handle}</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4"><StatusBadge status={r.severity} /></td>
                      <td className="py-3.5 pr-4"><StatusBadge status={r.status} /></td>
                      <td className="py-3.5 pr-4 text-mist">{formatDate(r.submittedAt)}</td>
                      <td className="py-3.5 pr-4 font-mono text-[13px] text-mist">
                        {r.rewardWei ? `${weiToEth(r.rewardWei)} ETH` : <span className="text-ash">—</span>}
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
