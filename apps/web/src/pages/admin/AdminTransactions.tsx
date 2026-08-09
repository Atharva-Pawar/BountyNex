import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import type { BlockchainTransaction } from "../../types";
import { formatDateTime, statusStyle, weiToEth } from "../../lib/utils";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { TxHashLink } from "../../components/wallet/TxHashLink";

export function AdminTransactions() {
  const { data, isLoading, isError, error, refetch } = useQuery<{ items: BlockchainTransaction[] }>({
    queryKey: ["admin-transactions"],
    queryFn: async () => (await api.get("/api/admin/transactions")) as { items: BlockchainTransaction[] },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Transactions</h1>
          <p className="text-sm text-ink-dim">Latest on-chain activity (up to 100)</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void refetch()}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader title="Blockchain transactions" />
        <CardBody>
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message={(error as Error).message} retry={() => void refetch()} />
          ) : (data?.items.length ?? 0) === 0 ? (
            <p className="py-10 text-center text-sm text-ink-faint">No transactions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-faint">
                    <th className="pb-3 pr-4 font-medium">Hash</th>
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Bounty</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data?.items.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-3 pr-4"><TxHashLink hash={tx.txHash} /></td>
                      <td className="py-3 pr-4 text-ink">{tx.type.replace(/_/g, " ")}</td>
                      <td className="py-3 pr-4 text-ink-dim">{tx.bounty?.title ?? "—"}</td>
                      <td className="py-3 pr-4 font-mono text-ink-dim">
                        {tx.amountWei ? `${weiToEth(tx.amountWei)} ETH` : "—"}
                      </td>
                      <td className="py-3 pr-4"><Badge className={statusStyle(tx.status)}>{tx.status}</Badge></td>
                      <td className="py-3 text-ink-dim">{formatDateTime(tx.createdAt)}</td>
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
