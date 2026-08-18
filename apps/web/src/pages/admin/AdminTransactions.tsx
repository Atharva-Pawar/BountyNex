import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import type { BlockchainTransaction } from "../../types";
import { formatDateTime, statusStyle, weiToEth } from "../../lib/utils";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { TxHashLink } from "../../components/wallet/TxHashLink";
import { PageHeader } from "../../components/ui/PageHeader";

export function AdminTransactions() {
  const { data, isLoading, isError, error, refetch } = useQuery<{ items: BlockchainTransaction[] }>({
    queryKey: ["admin-transactions"],
    queryFn: async () => (await api.get("/api/admin/transactions")) as { items: BlockchainTransaction[] },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          eyebrow="Console"
          title="Transactions"
          subtitle="Latest on-chain activity (up to 100)"
        />
        <Button variant="secondary" size="sm" onClick={() => void refetch()}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card>
        <div className="border-b border-graphite px-5 py-3.5">
          <h2 className="text-sm font-medium tracking-tight text-paper">Blockchain transactions</h2>
        </div>
        <CardBody className="p-0">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message={(error as Error).message} retry={() => void refetch()} />
          ) : (data?.items.length ?? 0) === 0 ? (
            <p className="py-10 text-center text-sm text-fog">No transactions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-graphite text-[11px] uppercase tracking-wider text-ash">
                    <th className="px-5 pb-3 pr-4 pt-3 font-medium">Hash</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Type</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Bounty</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Amount</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Status</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite">
                  {data?.items.map((tx) => (
                    <tr key={tx.id} className="transition-colors duration-150 hover:bg-obsidian/60">
                      <td className="px-5 py-3.5 pr-4"><TxHashLink hash={tx.txHash} /></td>
                      <td className="py-3.5 pr-4 text-mist">{tx.type.replace(/_/g, " ")}</td>
                      <td className="py-3.5 pr-4 text-mist">{tx.bounty?.title ?? "—"}</td>
                      <td className="py-3.5 pr-4 font-mono text-[13px] text-paper">
                        {tx.amountWei ? `${weiToEth(tx.amountWei)} ETH` : "—"}
                      </td>
                      <td className="py-3.5 pr-4"><Badge className={statusStyle(tx.status)} dot>{tx.status}</Badge></td>
                      <td className="py-3.5 pr-4 text-mist">{formatDateTime(tx.createdAt)}</td>
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