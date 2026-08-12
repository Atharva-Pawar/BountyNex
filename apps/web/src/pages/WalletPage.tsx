import { useQuery } from "@tanstack/react-query";
import { Wallet2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { api } from "../lib/api";
import type { BlockchainTransaction, Wallet } from "../types";
import { formatDateTime, shortAddress, weiToEth } from "../lib/utils";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { WalletPanel } from "../components/wallet/WalletPanel";
import { TxHashLink } from "../components/wallet/TxHashLink";
import { EmptyState, Spinner } from "../components/ui/State";

function TxStatusIcon({ status }: { status: string }) {
  if (status === "CONFIRMED") return <CheckCircle2 className="h-4 w-4 text-accent" />;
  if (status === "FAILED") return <XCircle className="h-4 w-4 text-danger" />;
  return <Clock className="h-4 w-4 text-warn" />;
}

export function WalletPage({ scope }: { scope: "researcher" | "organization" }) {
  const { data: walletData } = useQuery({
    queryKey: ["server-wallet"],
    queryFn: async () => (await api.get("/api/wallet")) as { wallet: Wallet | null },
  });

  const { data: txData } = useQuery({
    queryKey: ["transactions", scope],
    queryFn: async () =>
      (await api.get("/api/transactions?limit=8")) as { items: BlockchainTransaction[] },
  });

  const wallet = walletData?.wallet;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Wallet</h1>
        <p className="text-sm text-ink-dim">
          {scope === "researcher"
            ? "Connect MetaMask to receive rewards"
            : "Connect MetaMask to fund bounties and release rewards"}
        </p>
      </div>

      <WalletPanel />

      <Card>
        <CardHeader title="Bound wallet" subtitle="Stored on your profile, verified by signature" />
        <CardBody className="space-y-3">
          {wallet ? (
            <>
              <div className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-4 py-3">
                <span className="flex items-center gap-2.5 text-sm text-ink">
                  <Wallet2 className="h-4 w-4 text-accent" />
                  <span className="font-mono">{shortAddress(wallet.address, 6)}</span>
                </span>
                <span className="font-mono text-xs text-ink-faint">chain {wallet.chainId}</span>
              </div>
              <p className="text-xs text-ink-faint">Connected {formatDateTime(wallet.connectedAt)}</p>
            </>
          ) : (
            <p className="text-sm text-ink-faint">No wallet bound yet. Connect and verify one above.</p>
          )}
        </CardBody>
      </Card>

      {txData && txData.items.length > 0 && (
        <Card>
          <CardHeader title="Recent transactions" />
          <CardBody>
            <div className="divide-y divide-border">
              {txData.items.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <TxStatusIcon status={tx.status} />
                    <div>
                      <p className="text-xs font-medium text-ink">{tx.type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-ink-faint">{formatDateTime(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {tx.amountWei && (
                      <span className="font-mono text-xs text-ink-dim">{weiToEth(tx.amountWei)} ETH</span>
                    )}
                    <TxHashLink hash={tx.txHash} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
