import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FileSearch, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import type { BugReport, Pagination, ReportStatus } from "../../types";
import { cn, formatDate, severityColor, weiToEth } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { EmptyState, ErrorState, Spinner } from "../../components/ui/State";
import { Modal } from "../../components/ui/Modal";
import { PaginationBar } from "../../components/ui/PaginationBar";
import { PageHeader } from "../../components/ui/PageHeader";
import { ReportDetail } from "./ReportDetail";

const STATUSES: Array<ReportStatus | "ALL"> = ["ALL", "SUBMITTED", "UNDER_REVIEW", "NEEDS_INFORMATION", "ACCEPTED", "REJECTED", "REWARDED"];

export function MyReports() {
  const [status, setStatus] = useState<ReportStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<BugReport | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery<{ items: BugReport[]; pagination: Pagination }>({
    queryKey: ["my-reports", status, page],
    queryFn: async () =>
      (await api.get(`/api/reports/my?limit=10&page=${page}${status !== "ALL" ? `&status=${status}` : ""}`)) as {
        items: BugReport[];
        pagination: Pagination;
      },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Researcher"
        title="My reports"
        subtitle="Every vulnerability report you've submitted"
      />

      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={cn(
              "rounded-sm border px-2.5 py-1 font-mono text-[11px] transition-colors duration-150",
              status === s
                ? "border-acid-lime/30 bg-acid-lime/5 text-acid-lime"
                : "border-graphite text-fog hover:border-smoke hover:text-paper",
            )}
          >
            {s === "ALL" ? "all" : s.replace(/_/g, " ").toLowerCase()}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title="Reports" subtitle={`${data?.pagination.total ?? 0} total`} />
        <CardBody>
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message="Unable to load reports. Please try again." retry={() => void refetch()} />
          ) : (data?.items.length ?? 0) === 0 ? (
            <EmptyState
              icon={<FileSearch className="h-5 w-5" />}
              title="No reports in this view"
              description="Adjust the status filter or submit a new report."
              action={
                <Link to="/researcher/browse" className="text-[13px] font-medium text-mist hover:text-paper">
                  Browse bounties <ArrowRight className="inline h-3.5 w-3.5" />
                </Link>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-graphite font-mono text-[10px] uppercase tracking-wider text-ash">
                      <th className="pb-2.5 pr-4 font-medium">Report</th>
                      <th className="pb-2.5 pr-4 font-medium">Bounty</th>
                      <th className="pb-2.5 pr-4 font-medium">Severity</th>
                      <th className="pb-2.5 pr-4 font-medium">Status</th>
                      <th className="pb-2.5 pr-4 font-medium">Submitted</th>
                      <th className="pb-2.5 font-medium">Reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite">
                    {data?.items.map((r) => (
                      <tr
                        key={r.id}
                        className="cursor-pointer transition-colors duration-150 hover:bg-obsidian"
                        onClick={() => setSelected(r)}
                      >
                        <td className="py-3 pr-4 text-sm font-medium text-paper">{r.title}</td>
                        <td className="py-3 pr-4 font-mono text-[12px] text-fog">{r.bounty?.title ?? "—"}</td>
                        <td className="py-3 pr-4">
                          <span className={cn("font-mono text-[11px] font-medium capitalize", severityColor(r.severity))}>
                            {r.severity.toLowerCase()}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="py-3 pr-4 text-[13px] text-fog">{formatDate(r.submittedAt)}</td>
                        <td className="py-3 font-mono text-[13px] text-mist">
                          {r.rewardWei ? `${weiToEth(r.rewardWei)} ETH` : "—"}
                        </td>
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

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? "Report"} wide>
        {selected && <ReportDetail report={selected} />}
      </Modal>
    </div>
  );
}