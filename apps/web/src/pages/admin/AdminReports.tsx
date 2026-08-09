import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { BugReport, Pagination, ReportStatus } from "../../types";
import { formatDate } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { PaginationBar } from "../../components/ui/PaginationBar";

const STATUSES: Array<ReportStatus | "ALL"> = ["ALL", "SUBMITTED", "UNDER_REVIEW", "NEEDS_INFORMATION", "ACCEPTED", "REJECTED", "REWARDED"];

export function AdminReports() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ReportStatus | "ALL">("ALL");

  const { data, isLoading, isError, error } = useQuery<{ items: BugReport[]; pagination: Pagination }>({
    queryKey: ["admin-reports", page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (status !== "ALL") params.set("status", status);
      return (await api.get(`/api/admin/reports?${params}`)) as { items: BugReport[]; pagination: Pagination };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Reports</h1>
        <p className="text-sm text-ink-dim">All vulnerability reports across the platform</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={
              status === s
                ? "rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                : "rounded-full border border-border px-3 py-1 text-xs font-medium text-ink-dim hover:border-border-strong hover:text-ink"
            }
          >
            {s === "ALL" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title="All reports" />
        <CardBody>
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message={(error as Error).message} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-faint">
                      <th className="pb-3 pr-4 font-medium">Report</th>
                      <th className="pb-3 pr-4 font-medium">Researcher</th>
                      <th className="pb-3 pr-4 font-medium">Severity</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 font-medium">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.items.map((r) => (
                      <tr key={r.id}>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-ink">{r.title}</p>
                          <p className="text-xs text-ink-faint">{r.bounty?.title}</p>
                        </td>
                        <td className="py-3 pr-4 text-ink-dim">{r.researcher?.name}</td>
                        <td className="py-3 pr-4"><StatusBadge status={r.severity} /></td>
                        <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                        <td className="py-3 text-ink-dim">{formatDate(r.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationBar pagination={data?.pagination} onPage={setPage} />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
