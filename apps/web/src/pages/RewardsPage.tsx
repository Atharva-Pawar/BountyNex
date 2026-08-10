import { useQuery } from "@tanstack/react-query";
import { Award, Coins } from "lucide-react";
import { api } from "../lib/api";
import type { Reward } from "../types";
import { formatDate, statusStyle, weiToEth } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { EmptyState, ErrorState, Spinner } from "../components/ui/State";
import { TxHashLink } from "../components/wallet/TxHashLink";

export function RewardsPage({ scope }: { scope: "researcher" | "organization" }) {
  const endpoint = scope === "researcher" ? "/api/rewards/my" : "/api/rewards/org";
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["rewards", scope],
    queryFn: async () => (await api.get(endpoint)) as { items: Reward[] },
  });

  const rewards = data?.items ?? [];
  const totalPaid = rewards
    .filter((r) => r.status === "PAID")
    .reduce((acc, r) => acc + BigInt(r.amountWei), 0n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Rewards</h1>
        <p className="text-sm text-ink-dim">
          {scope === "researcher" ? "Your earnings from approved reports" : "Reward distribution for your programs"}
        </p>
      </div>

      <Card className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Coins className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-faint">Total paid on-chain</p>
          <p className="text-2xl font-bold text-ink">{weiToEth(totalPaid)} ETH</p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Reward history" subtitle="Released by the BountyEscrow contract" />
        <CardBody>
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message="Unable to load rewards. Please try again." />
          ) : rewards.length === 0 ? (
            <EmptyState
              icon={<Award className="h-6 w-6" />}
              title="No rewards yet"
              description="Approved, paid reports will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-faint">
                    <th className="pb-3 pr-4 font-medium">Report</th>
                    <th className="pb-3 pr-4 font-medium">Bounty</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Transaction</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rewards.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-surface-2/50">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-ink">{r.report?.title ?? "Report"}</p>
                        <p className="text-xs text-ink-faint">{r.report?.severity}</p>
                      </td>
                      <td className="py-3 pr-4 text-ink-dim">{r.bounty?.title}</td>
                      <td className="py-3 pr-4 font-mono font-medium text-accent">{weiToEth(r.amountWei)} ETH</td>
                      <td className="py-3 pr-4">
                        <Badge className={statusStyle(r.status)}>{r.status}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        {r.txHash ? <TxHashLink hash={r.txHash} /> : <span className="text-ink-faint">—</span>}
                      </td>
                      <td className="py-3 text-ink-dim">{formatDate(r.createdAt)}</td>
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
