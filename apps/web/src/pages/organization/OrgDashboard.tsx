import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bug, DollarSign, FileText, Wallet2 } from "lucide-react";
import { api } from "../../lib/api";
import type { Bounty, Pagination, Wallet } from "../../types";
import { useAuth } from "../../providers/AuthProvider";
import { shortAddress, weiToEth } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { EmptyState, Spinner } from "../../components/ui/State";

interface BountyListResponse {
  items: Bounty[];
  pagination: Pagination;
}

export function OrgDashboard() {
  const { user } = useAuth();

  const { data: bounties, isLoading } = useQuery<BountyListResponse>({
    queryKey: ["org-dashboard-bounties"],
    queryFn: async () => (await api.get("/api/bounties?mine=true&limit=5")) as BountyListResponse,
  });

  const { data: walletData } = useQuery({
    queryKey: ["org-dashboard-wallet"],
    queryFn: async () => (await api.get("/api/wallet")) as { wallet: Wallet | null },
  });

  const { data: rewards } = useQuery({
    queryKey: ["org-dashboard-rewards"],
    queryFn: async () => (await api.get("/api/rewards/org")) as { items: { status: string; amountWei: string }[] },
  });

  const myBounties = bounties?.items ?? [];
  const activeCount = myBounties.filter((b) => b.status === "ACTIVE").length;
  const totalReports = myBounties.reduce((acc, b) => acc + (b._count?.bugReports ?? 0), 0);
  const fundedCount = myBounties.filter((b) => b.isFunded).length;

  const rewardItems = rewards?.items ?? [];
  const totalPaid = rewardItems
    .filter((r) => r.status === "PAID")
    .reduce((acc, r) => acc + BigInt(r.amountWei), 0n);

  const stats = [
    { label: "Active programs", value: String(activeCount), icon: <Bug className="h-4 w-4" /> },
    { label: "Total submissions", value: String(totalReports), icon: <FileText className="h-4 w-4" /> },
    { label: "Funded bounties", value: String(fundedCount), icon: <DollarSign className="h-4 w-4" /> },
    { label: "Rewards paid", value: `${weiToEth(totalPaid)} ETH`, icon: <Wallet2 className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {user?.organization?.name ?? user?.name}
          </h1>
          <p className="text-sm text-ink-dim">
            {walletData?.wallet?.address ? (
              <span className="font-mono">Wallet {shortAddress(walletData.wallet.address, 5)}</span>
            ) : (
              "Connect a wallet to fund bounties"
            )}
          </p>
        </div>
        <Link to="/organization/create">
          <Button>Create bounty</Button>
        </Link>
      </div>

      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface p-4">
            <div className="flex items-center gap-2 text-ink-dim mb-2">
              {s.icon}
              <span className="text-xs">{s.label}</span>
            </div>
            <p className="font-mono text-xl font-semibold text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Recent bounty programs"
          action={<Link to="/organization/bounties" className="text-sm font-medium text-accent hover:underline">Manage all</Link>}
        />
        <CardBody>
          {isLoading ? (
            <Spinner />
          ) : myBounties.length === 0 ? (
            <EmptyState
              icon={<Bug className="h-6 w-6" />}
              title="No bounty programs yet"
              description="Launch your first program to start receiving vulnerability reports."
              action={
                <Link to="/organization/create">
                  <Button size="sm">Create bounty</Button>
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {myBounties.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link to={`/organization/bounties/${b.id}/reports`} className="truncate text-sm font-medium text-ink hover:text-accent">
                      {b.title}
                    </Link>
                    <p className="text-xs text-ink-faint">
                      {b._count?.bugReports ?? 0} reports &middot; {b.isFunded ? "Funded" : "Not funded"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-sm font-medium text-accent">{weiToEth(b.rewardAmountWei)} ETH</span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
