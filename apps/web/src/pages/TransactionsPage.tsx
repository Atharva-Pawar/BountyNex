import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BadgeDollarSign, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { api } from "../lib/api";
import type { BlockchainTransaction, Pagination } from "../types";
import { formatDateTime, statusStyle, weiToEth } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { EmptyState, ErrorState, Spinner } from "../components/ui/State";
import { PaginationBar } from "../components/ui/PaginationBar";
import { TxHashLink } from "../components/wallet/TxHashLink";

interface TxResponse {
  items: BlockchainTransaction[];
  pagination: Pagination;
}

function StatusWithIcon({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {status === "CONFIRMED" && <CheckCircle2 className="h-3.5 w-3.5 text-accent" />}
      {status === "FAILED" && <XCircle className="h-3.5 w-3.5 text-danger" />}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Blockchain transactions</h1>
          <p className="text-sm text-ink-dim">Ethereum Sepolia &middot; verified on-chain</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void refetch()}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader title="Transaction history" />
        <CardBody>
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message="Unable to load transactions. Please try again." retry={() => void refetch()} />
          ) : (data?.items.length ?? 0) === 0 ? (
            <EmptyState
              icon={<BadgeDollarSign className="h-6 w-6" />}
              title="No transactions yet"
              description="On-chain activity linked to your account appears here."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-faint">
                      <th className="pb-3 pr-4 font-medium">Tx Hash</th>
                      <th className="pb-3 pr-4 font-medium">Type</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 pr-4 font-medium">Amount</th>
                      <th className="pb-3 pr-4 font-medium">Block</th>
                      <th className="pb-3 pr-4 font-medium">When</th>
                      <th className="pb-3 font-medium">Verify</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.items.map((tx) => (
                      <tr key={tx.id} className="transition-colors hover:bg-surface-2/50">
                        <td className="py-3 pr-4"><TxHashLink hash={tx.txHash} /></td>
                        <td className="py-3 pr-4 text-ink">{tx.type.replace(/_/g, " ")}</td>
                        <td className="py-3 pr-4"><StatusWithIcon status={tx.status} /></td>
                        <td className="py-3 pr-4 font-mono text-ink-dim">
                          {tx.amountWei ? `${weiToEth(tx.amountWei)} ETH` : "—"}
                        </td>
                        <td className="py-3 pr-4 font-mono text-ink-dim">{tx.blockNumber ?? "—"}</td>
                        <td className="py-3 pr-4 text-ink-dim">{formatDateTime(tx.createdAt)}</td>
                        <td className="py-3">
                          <Button variant="ghost" size="sm" loading={verifying === tx.txHash} onClick={() => void verify(tx.txHash)}>
                            Verify
                          </Button>
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
