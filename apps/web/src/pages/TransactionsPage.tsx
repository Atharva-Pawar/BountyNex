import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BadgeDollarSign, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { api } from "../lib/api";
import type { BlockchainTransaction, Pagination } from "../types";
import { formatDateTime, statusStyle, weiToEth } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { EmptyState, ErrorState, Spinner } from "../components/ui/State";
import { PaginationBar } from "../components/ui/PaginationBar";
import { TxHashLink } from "../components/wallet/TxHashLink";
import { PageHeader } from "../components/ui/PageHeader";
import { Metric, MetricCell, MetricStrip } from "../components/ui/Metric";

interface TxResponse {
  items: BlockchainTransaction[];
  pagination: Pagination;
}

function StatusWithIcon({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {status === "CONFIRMED" && <CheckCircle2 className="h-3.5 w-3.5 text-pulse-green" />}
      {status === "FAILED" && <XCircle className="h-3.5 w-3.5 text-coral-red" />}
      {status === "PENDING" && <Clock className="h-3.5 w-3.5 text-warn" />}
      <Badge className={statusStyle(status)}>{status}</Badge>
    </span>
  );
}

export function TransactionsPage({ scope }: { scope: "researcher" | "organization" }) {
  const [page, setPage] = useState(1);
  const [verifying, setVerifying] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery<TxResponse>({
    queryKey: ["transactions", scope, page],
    queryFn: async () => (await api.get(`/api/transactions?page=${page}&limit=15`)) as TxResponse,
  });

  const items = data?.items ?? [];
  const confirmed = items.filter((t) => t.status === "CONFIRMED").length;

  async function verify(hash: string) {
    setVerifying(hash);
    try {
      const res = (await api.post(`/api/transactions/${hash}/verify`)) as { transaction: BlockchainTransaction };
      toast.success(`Transaction status: ${res.transaction.status}`);
      void refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setVerifying(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          eyebrow="On-chain"
          title="Blockchain transactions"
          subtitle="Ethereum Sepolia · verified on-chain"
        />
        <Button variant="secondary" size="sm" onClick={() => void refetch()}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <MetricStrip>
        <MetricCell>
          <Metric label="Total tracked" value={String(items.length)} />
        </MetricCell>
        <MetricCell>
          <Metric label="Confirmed" value={String(confirmed)} />
        </MetricCell>
        <MetricCell>
          <Metric label="Pending" value={String(items.filter((t) => t.status === "PENDING").length)} />
        </MetricCell>
      </MetricStrip>

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message="Unable to load transactions. Please try again." retry={() => void refetch()} />
          ) : items.length === 0 ? (
            <div className="p-10">
              <EmptyState
                icon={<BadgeDollarSign className="h-5 w-5" />}
                title="No transactions yet"
                description="On-chain activity linked to your account appears here."
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-graphite text-[11px] uppercase tracking-wider text-ash">
                      <th className="px-5 pb-3 pr-4 pt-3 font-medium">Tx Hash</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Type</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Status</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Amount</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Block</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">When</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Verify</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite">
                    {items.map((tx) => (
                      <tr key={tx.id} className="transition-colors duration-150 hover:bg-obsidian/60">
                        <td className="px-5 py-3.5 pr-4"><TxHashLink hash={tx.txHash} /></td>
                        <td className="py-3.5 pr-4 text-mist">{tx.type.replace(/_/g, " ")}</td>
                        <td className="py-3.5 pr-4"><StatusWithIcon status={tx.status} /></td>
                        <td className="py-3.5 pr-4 font-mono text-[13px] text-paper">
                          {tx.amountWei ? `${weiToEth(tx.amountWei)} ETH` : "—"}
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-[12px] text-mist">{tx.blockNumber ?? "—"}</td>
                        <td className="py-3.5 pr-4 text-mist">{formatDateTime(tx.createdAt)}</td>
                        <td className="py-3.5 pr-4">
                          <Button variant="ghost" size="sm" loading={verifying === tx.txHash} onClick={() => void verify(tx.txHash)}>
                            Verify
                          </Button>
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