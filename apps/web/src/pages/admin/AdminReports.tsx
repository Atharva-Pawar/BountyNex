import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { BugReport, Pagination, ReportStatus } from "../../types";
import { formatDate } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Card, CardBody } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { PaginationBar } from "../../components/ui/PaginationBar";
import { PageHeader } from "../../components/ui/PageHeader";

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
      <PageHeader
        eyebrow="Console"
        title="Reports"
        subtitle="All vulnerability reports across the platform"
      />

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
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
        <CardBody className="p-0">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message={(error as Error).message} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-graphite text-[11px] uppercase tracking-wider text-ash">
                      <th className="px-5 pb-3 pr-4 pt-3 font-medium">Report</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Researcher</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Severity</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Status</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite">
                    {data?.items.map((r) => (
                      <tr key={r.id} className="transition-colors duration-150 hover:bg-obsidian/60">
                        <td className="px-5 py-3.5 pr-4">
                          <p className="font-medium tracking-tight text-paper">{r.title}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-ash">{r.bounty?.title}</p>
                        </td>
                        <td className="py-3.5 pr-4 text-mist">{r.researcher?.name}</td>
                        <td className="py-3.5 pr-4"><StatusBadge status={r.severity} /></td>
                        <td className="py-3.5 pr-4"><StatusBadge status={r.status} /></td>
                        <td className="py-3.5 pr-4 text-mist">{formatDate(r.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-graphite px-5 py-3">
                <PaginationBar pagination={data?.pagination} onPage={setPage} />
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}