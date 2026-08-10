import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FileSearch } from "lucide-react";
import { api } from "../../lib/api";
import type { BugReport, Pagination, ReportStatus } from "../../types";
import { formatDate } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { EmptyState, ErrorState, Spinner } from "../../components/ui/State";
import { Modal } from "../../components/ui/Modal";
import { PaginationBar } from "../../components/ui/PaginationBar";
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
      <div>
        <h1 className="text-2xl font-bold text-ink">My reports</h1>
        <p className="text-sm text-ink-dim">Every vulnerability report you've submitted</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={
              status === s
                ? "rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent transition-colors"
                : "rounded-full border border-border px-3 py-1 text-xs font-medium text-ink-dim transition-colors hover:border-border-strong hover:text-ink"
            }
          >
            {s === "ALL" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title="Reports" />
        <CardBody>
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message="Unable to load reports. Please try again." retry={() => void refetch()} />
          ) : (data?.items.length ?? 0) === 0 ? (
            <EmptyState
              icon={<FileSearch className="h-6 w-6" />}
              title="No reports in this view"
              description="Adjust the status filter or submit a new report."
              action={
                <Link to="/researcher/browse" className="text-sm font-medium text-accent hover:underline">
                  Browse bounties
                </Link>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-faint">
                      <th className="pb-3 pr-4 font-medium">Title</th>
                      <th className="pb-3 pr-4 font-medium">Bounty</th>
                      <th className="pb-3 pr-4 font-medium">Severity</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 pr-4 font-medium">Submitted</th>
                      <th className="pb-3 font-medium">Reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.items.map((r) => (
                      <tr
                        key={r.id}
                        className="cursor-pointer transition-colors hover:bg-surface-2/50"
                        onClick={() => setSelected(r)}
                      >
                        <td className="py-3 pr-4 font-medium text-ink hover:text-accent">{r.title}</td>
                        <td className="py-3 pr-4 text-ink-dim">{r.bounty?.title}</td>
                        <td className="py-3 pr-4"><StatusBadge status={r.severity} /></td>
                        <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                        <td className="py-3 pr-4 text-ink-dim">{formatDate(r.submittedAt)}</td>
                        <td className="py-3 font-mono text-ink-dim">
                          {r.rewardWei ? `${Number(BigInt(r.rewardWei)) / 1e18} ETH` : "—"}
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
