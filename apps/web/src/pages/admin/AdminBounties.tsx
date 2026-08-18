import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api } from "../../lib/api";
import type { Bounty, BountyStatus, Pagination } from "../../types";
import { formatDate, weiToEth } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Card, CardBody } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { PaginationBar } from "../../components/ui/PaginationBar";
import { Input } from "../../components/ui/Field";
import { TxHashLink } from "../../components/wallet/TxHashLink";
import { PageHeader } from "../../components/ui/PageHeader";

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
      <PageHeader
        eyebrow="Console"
        title="Bounties"
        subtitle="All bounty programs on the platform"
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
          <Input className="pl-9" placeholder="Search titles..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
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
              {s}
            </button>
          ))}
        </div>
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
                      <th className="px-5 pb-3 pr-4 pt-3 font-medium">Title</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Organization</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Reward</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Status</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Reports</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Funded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite">
                    {data?.items.map((b) => (
                      <tr key={b.id} className="transition-colors duration-150 hover:bg-obsidian/60">
                        <td className="px-5 py-3.5 pr-4">
                          <p className="font-medium tracking-tight text-paper">{b.title}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-ash">deadline {formatDate(b.deadline)}</p>
                        </td>
                        <td className="py-3.5 pr-4 text-mist">{b.organization?.name}</td>
                        <td className="py-3.5 pr-4 font-mono text-[13px] text-acid-lime">{weiToEth(b.rewardAmountWei)} ETH</td>
                        <td className="py-3.5 pr-4"><StatusBadge status={b.status} /></td>
                        <td className="py-3.5 pr-4 text-mist">{b._count?.bugReports ?? 0}</td>
                        <td className="py-3.5 pr-4">
                          {b.fundingTxHash ? (
                            <TxHashLink hash={b.fundingTxHash} />
                          ) : (
                            <span className="text-[12px] text-ash">Not funded</span>
                          )}
                        </td>
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