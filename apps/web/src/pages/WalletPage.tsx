import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Copy, ExternalLink, QrCode, RefreshCw, Wallet } from "lucide-react";
import { api } from "../lib/api";
import type { Reward, BlockchainTransaction } from "../types";
import { useAuth } from "../providers/AuthProvider";
import { formatEth, shortAddress } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";
import { Spinner, EmptyState } from "../components/ui/State";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {scope === "researcher" ? "My Wallet" : "Organization Wallet"}
        </h1>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Balance card */}
      <Card>
        <CardHeader
          title="Connected wallet"
          subtitle="Ethereum Sepolia"
          action={
            data?.address ? (
              <a
                href={`https://sepolia.etherscan.io/address/${data.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-dim hover:text-accent"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null
          }
        />
        <CardBody className="space-y-3">
          {isLoading ? (
            <div className="py-4">
              <Spinner label="Loading balance..." />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-mono text-sm text-ink">
                  {shortAddress(data?.address || "")}
                </p>
                <div className="flex items-center gap-2 text-xs text-ink-faint">
                  <Copy
                    className="h-3 w-3 cursor-pointer text-ink-dim hover:text-accent"
                    onClick={() => {
                      if (data?.address) navigator.clipboard.writeText(data.address);
                    }}
                  />
                  <span>Copy address</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-semibold text-ink">
                  {formatEth(data?.balance.wei || 0n)} ETH
                </p>
                <p className="text-xs text-ink-faint">
                  {data?.balance.eth || "0"} ETH
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader title="Transaction history" />
        <CardBody>
          {isLoading ? (
            <Spinner label="Loading transactions..." />
          ) : data?.transactions.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={<Wallet className="h-6 w-6" />}
                title="No transactions yet"
                description="Transactions will appear here once you start earning or spending."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data?.transactions.map((tx) => (
                <Link
                  key={tx.id}
                  to={explorerUrl(tx.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-2 py-3 first:pt-0 last:pb-0 hover:bg-surface-2/50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-ink-dim">
                        {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                      </p>
                      <p className="mt-1 text-xs text-ink-faint">
                        {tx.type.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-ink-dim">
                        {tx.amountWei ? `${formatEth(tx.amountWei)} ETH` : "—"}
                      </span>
                      <StatusBadge status={tx.status} />
                      <ExternalLink className="h-3.5 w-3.5 text-ink-dim" />
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
