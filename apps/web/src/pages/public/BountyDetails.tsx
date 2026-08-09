import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bug,
  CalendarClock,
  CircleDollarSign,
  FileText,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../lib/api";
import type { Bounty } from "../../types";
import { daysLeft, formatDate, weiToEth } from "../../lib/utils";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { useAuth } from "../../providers/AuthProvider";
import { useBountyOnChain } from "../../hooks/useEscrow";
import { TxHashLink } from "../../components/wallet/TxHashLink";

export function BountyDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bounty", id],
    queryFn: async () =>
      (await api.get(`/api/bounties/${id}`)) as { bounty: Bounty; isOwner: boolean },
  });

  const bounty = data?.bounty;
  const isOwner = data?.isOwner;
  const { onChain } = useBountyOnChain(bounty?.onChainId);
  const days = bounty ? daysLeft(bounty.deadline) : 0;

  if (isLoading) return <Spinner label="Loading bounty..." />;
  if (isError || !bounty) return <ErrorState message={(error as Error)?.message ?? "Bounty not found"} />;

  const canSubmit = user?.role === "RESEARCHER" && bounty.status === "ACTIVE" && days > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{bounty.title}</h1>
            <Badge className={bounty.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-slate-500/15 text-slate-400 border-slate-500/30"}>
              {bounty.status}
            </Badge>
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink-dim">
            <ShieldCheck className="h-4 w-4 text-accent-2" />
            {bounty.organization?.name}
            {bounty.organization?.isVerified && (
              <span className="text-accent">· Verified organization</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isOwner && (
            <Link to={`/organization/bounties/${bounty.id}/reports`}>
              <Button variant="secondary">Manage submissions</Button>
            </Link>
          )}
          {canSubmit ? (
            <Link to={`/bounties/${bounty.id}/submit`}>
              <Button size="lg">
                <Bug className="h-4 w-4" /> Submit a report
              </Button>
            </Link>
          ) : user?.role === "GUEST" || !user ? (
            <Link to={`/login?next=/bounties/${bounty.id}/submit`}>
              <Button size="lg" variant="outline">
                <Lock className="h-4 w-4" /> Log in to submit
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Key stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="flex items-center gap-2 text-xs text-ink-dim">
            <CircleDollarSign className="h-4 w-4 text-accent" /> Reward pool
          </p>
          <p className="mt-1 text-xl font-bold text-ink">{weiToEth(bounty.rewardAmountWei)} ETH</p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-2 text-xs text-ink-dim">
            <CalendarClock className="h-4 w-4 text-accent-2" /> Deadline
          </p>
          <p className="mt-1 text-xl font-bold text-ink">{days} days left</p>
          <p className="text-xs text-ink-faint">{formatDate(bounty.deadline)}</p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-2 text-xs text-ink-dim">
            <FileText className="h-4 w-4 text-info" /> Reports
          </p>
          <p className="mt-1 text-xl font-bold text-ink">{bounty._count?.bugReports ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-2 text-xs text-ink-dim">
            <ShieldCheck className="h-4 w-4 text-violet-400" /> Funding
          </p>
          <p className="mt-1 text-xl font-bold text-ink">{bounty.isFunded ? "Funded" : "Unfunded"}</p>
        </Card>
      </div>

      {/* On-chain status */}
      {(bounty.onChainId || bounty.isFunded) && (
        <Card className="mb-6">
          <CardHeader title="On-chain escrow" subtitle="Live state from the BountyEscrow contract" />
          <CardBody className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-ink-faint">Bounty ID</p>
              <p className="font-mono text-sm text-ink">{bounty.onChainId ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-ink-faint">Escrow balance</p>
              <p className="font-mono text-sm text-ink">
                {onChain ? `${weiToEth(onChain.rewardBalance)} ETH` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-faint">Total released</p>
              <p className="font-mono text-sm text-ink">
                {onChain ? `${weiToEth(onChain.totalReleased)} ETH` : "—"}
              </p>
            </div>
            {bounty.fundingTxHash && (
              <div className="sm:col-span-3">
                <p className="mb-1 text-xs text-ink-faint">Funding transaction</p>
                <TxHashLink hash={bounty.fundingTxHash} />
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Description" />
            <CardBody>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{bounty.description}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Scope" />
            <CardBody>
              <pre className="whitespace-pre-wrap rounded-lg bg-surface-2 p-4 font-mono text-xs text-ink-dim">
                {bounty.scope}
              </pre>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Rules" />
            <CardBody>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-dim">{bounty.rules}</p>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Severity rewards" />
            <CardBody>
              <ul className="space-y-3">
                {bounty.severities.map((s) => (
                  <li
                    key={s.level}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5"
                  >
                    <span className="text-sm font-medium text-ink">{s.level}</span>
                    <span className="font-mono text-sm text-accent">{weiToEth(s.rewardWei)} ETH</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {bounty.bugReports && bounty.bugReports.length > 0 && (
            <Card>
              <CardHeader title="Recent reports" />
              <CardBody>
                <ul className="space-y-3">
                  {bounty.bugReports.map((r) => (
                    <li key={r.id} className="flex items-center justify-between text-sm">
                      <span className="truncate text-ink">{r.title}</span>
                      <Badge className={r.severity === "CRITICAL" ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-slate-500/15 text-slate-400 border-slate-500/30"}>
                        {r.severity}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
