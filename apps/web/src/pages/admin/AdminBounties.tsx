import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api } from "../../lib/api";
import type { Bounty, BountyStatus, Pagination } from "../../types";
import { formatDate, weiToEth } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { PaginationBar } from "../../components/ui/PaginationBar";
import { Input } from "../../components/ui/Field";
import { TxHashLink } from "../../components/wallet/TxHashLink";

const STATUSES: Array<BountyStatus | "ALL"> = ["ALL", "DRAFT", "ACTIVE", "PAUSED", "CLOSED"];

export function AdminBounties() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BountyStatus | "ALL">("ALL");
  const [q, setQ] = useState("");

  const { data, isLoading, isError, error } = useQuery<{ items: Bounty[]; pagination: Pagination }>({
    queryKey: ["admin-bounties", page, status, q],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (status !== "ALL") params.set("status", status);
      if (q) params.set("q", q);
      return (await api.get(`/api/admin/bounties?${params}`)) as { items: Bounty[]; pagination: Pagination };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Bounties</h1>
        <p className="text-sm text-ink-dim">All bounty programs on the platform</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input className="pl-9" placeholder="Search titles..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
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
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader title="All bounties" />
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
                      <th className="pb-3 pr-4 font-medium">Title</th>
                      <th className="pb-3 pr-4 font-medium">Organization</th>
                      <th className="pb-3 pr-4 font-medium">Reward</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 pr-4 font-medium">Reports</th>
                      <th className="pb-3 font-medium">Funded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.items.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-ink">{b.title}</p>
                          <p className="text-xs text-ink-faint">Deadline {formatDate(b.deadline)}</p>
                        </td>
                        <td className="py-3 pr-4 text-ink-dim">{b.organization?.name}</td>
                        <td className="py-3 pr-4 font-mono text-accent">{weiToEth(b.rewardAmountWei)} ETH</td>
                        <td className="py-3 pr-4"><StatusBadge status={b.status} /></td>
                        <td className="py-3 pr-4 text-ink-dim">{b._count?.bugReports ?? 0}</td>
                        <td className="py-3">
                          {b.fundingTxHash ? (
                            <TxHashLink hash={b.fundingTxHash} />
                          ) : (
                            <span className="text-xs text-ink-faint">Not funded</span>
                          )}
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
    </div>
  );
}
