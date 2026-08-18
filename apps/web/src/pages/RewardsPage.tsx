import { useQuery } from "@tanstack/react-query";
import { Award, Coins } from "lucide-react";
import { api } from "../lib/api";
import type { Reward } from "../types";
import { formatDate, statusStyle, weiToEth } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card, CardBody } from "../components/ui/Card";
import { EmptyState, ErrorState, Spinner } from "../components/ui/State";
import { TxHashLink } from "../components/wallet/TxHashLink";
import { PageHeader } from "../components/ui/PageHeader";

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
      <PageHeader
        eyebrow="Earnings"
        title="Rewards"
        subtitle={scope === "researcher" ? "Your earnings from approved reports" : "Reward distribution for your programs"}
      />

      <div className="flex items-center gap-5 rounded-lg border border-graphite bg-surface p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-acid-lime/25 bg-acid-lime/10 text-acid-lime">
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ash">Total paid on-chain</p>
          <p className="mt-0.5 font-mono text-2xl font-medium tracking-tight text-paper">{weiToEth(totalPaid)} ETH</p>
        </div>
      </div>

      <Card>
        <div className="border-b border-graphite px-5 py-3.5">
          <h2 className="text-sm font-medium tracking-tight text-paper">Reward history</h2>
          <p className="mt-0.5 text-[12px] text-fog">Released by the BountyEscrow contract</p>
        </div>
        <CardBody className="p-0">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message="Unable to load rewards. Please try again." />
          ) : rewards.length === 0 ? (
            <div className="p-10">
              <EmptyState
                icon={<Award className="h-5 w-5" />}
                title="No rewards yet"
                description="Approved, paid reports will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-graphite text-[11px] uppercase tracking-wider text-ash">
                    <th className="px-5 pb-3 pr-4 pt-3 font-medium">Report</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Bounty</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Amount</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Status</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Transaction</th>
                    <th className="pb-3 pr-4 pt-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite">
                  {rewards.map((r) => (
                    <tr key={r.id} className="transition-colors duration-150 hover:bg-obsidian/60">
                      <td className="px-5 py-3.5 pr-4">
                        <p className="font-medium tracking-tight text-paper">{r.report?.title ?? "Report"}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-ash">{r.report?.severity}</p>
                      </td>
                      <td className="py-3.5 pr-4 text-mist">{r.bounty?.title}</td>
                      <td className="py-3.5 pr-4 font-mono text-[13px] font-medium text-acid-lime">{weiToEth(r.amountWei)} ETH</td>
                      <td className="py-3.5 pr-4">
                        <Badge className={statusStyle(r.status)} dot>{r.status}</Badge>
                      </td>
                      <td className="py-3.5 pr-4">
                        {r.txHash ? <TxHashLink hash={r.txHash} /> : <span className="text-fog">—</span>}
                      </td>
                      <td className="py-3.5 pr-4 text-mist">{formatDate(r.createdAt)}</td>
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