import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Copy, ExternalLink, RefreshCw, Wallet } from "lucide-react";
import { api } from "../lib/api";
import type { Reward, BlockchainTransaction } from "../types";
import { useAuth } from "../providers/AuthProvider";
import { formatEth, shortAddress } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";
import { Spinner, EmptyState } from "../components/ui/State";
import { PageHeader } from "../components/ui/PageHeader";
import { Metric, MetricCell, MetricStrip } from "../components/ui/Metric";

interface WalletResponse {
  address: string;
  balance: { eth: string; wei: string };
  transactions: BlockchainTransaction[];
  rewards: Reward[];
}

export function WalletPage({ scope }: { scope: "researcher" | "organization" }) {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery<WalletResponse>({
    queryKey: ["wallet", scope],
    queryFn: async () => (await api.get(`/api/wallet/${scope}`)) as WalletResponse,
    enabled: !!user,
  });

  const explorerUrl = (hash: string) =>
    `https://sepolia.etherscan.io/tx/${hash}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          eyebrow="Wallet"
          title={scope === "researcher" ? "My Wallet" : "Organization Wallet"}
          subtitle="Ethereum Sepolia · on-chain activity"
        />
        <Button size="sm" variant="secondary" loading={isLoading} onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardBody className="p-6">
          {isLoading ? (
            <div className="py-4">
              <Spinner label="Loading balance..." />
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2">
                <p className="font-mono text-sm text-mist">{shortAddress(data?.address || "")}</p>
                <button
                  onClick={() => {
                    if (data?.address) navigator.clipboard.writeText(data.address);
                  }}
                  className="flex items-center gap-1.5 text-[12px] text-fog transition-colors duration-150 hover:text-paper"
                >
                  <Copy className="h-3 w-3" /> Copy address
                </button>
                {data?.address && (
                  <a
                    href={`https://sepolia.etherscan.io/address/${data.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[12px] text-fog transition-colors duration-150 hover:text-paper"
                  >
                    <ExternalLink className="h-3 w-3" /> View on explorer
                  </a>
                )}
              </div>
              <div className="text-right">
                <p className="font-mono text-3xl font-medium tracking-tight text-paper">
                  {formatEth(data?.balance.wei || 0n)} ETH
                </p>
                <p className="mt-0.5 font-mono text-[12px] text-fog">
                  {data?.balance.eth || "0"} ETH available
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <MetricStrip>
        <MetricCell>
          <Metric label="Transactions" value={String(data?.transactions.length ?? 0)} />
        </MetricCell>
        <MetricCell>
          <Metric label="Rewards" value={String(data?.rewards.length ?? 0)} />
        </MetricCell>
      </MetricStrip>

      <Card>
        <div className="border-b border-graphite px-5 py-3.5">
          <h2 className="text-sm font-medium tracking-tight text-paper">Transaction history</h2>
        </div>
        <CardBody className="p-0">
          {isLoading ? (
            <Spinner label="Loading transactions..." />
          ) : (data?.transactions.length ?? 0) === 0 ? (
            <div className="py-10">
              <EmptyState
                icon={<Wallet className="h-5 w-5" />}
                title="No transactions yet"
                description="Transactions will appear here once you start earning or spending."
              />
            </div>
          ) : (
            <div className="divide-y divide-graphite">
              {data?.transactions.map((tx) => (
                <Link
                  key={tx.id}
                  to={explorerUrl(tx.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-5 py-3.5 transition-colors duration-150 hover:bg-obsidian/60"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-mono text-[13px] text-mist">{tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}</p>
                      <p className="mt-0.5 text-[12px] text-fog">{tx.type.replace(/_/g, " ")}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-[13px] text-paper">
                        {tx.amountWei ? `${formatEth(tx.amountWei)} ETH` : "—"}
                      </span>
                      <StatusBadge status={tx.status} />
                      <ExternalLink className="h-3.5 w-3.5 text-ash" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}