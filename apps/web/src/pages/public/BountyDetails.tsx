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
import { cn, daysLeft, formatDate, severityColor, weiToEth } from "../../lib/utils";
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{bounty.title}</h1>
          <Badge className={bounty.status === "ACTIVE" ? "bg-accent/10 text-accent border-accent/20" : "bg-ink-faint/10 text-ink-faint border-ink-faint/20"}>
            {bounty.status}
          </Badge>
          {bounty.isFunded && (
            <span className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent/5 px-2 py-0.5 font-mono text-[10px] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Funded
            </span>
          )}
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-ink-dim">
          <ShieldCheck className={cn("h-4 w-4", bounty.organization?.isVerified ? "text-accent" : "text-ink-faint")} />
          {bounty.organization?.name}
          {bounty.organization?.isVerified && (
            <span className="text-accent font-medium">Verified</span>
          )}
        </p>
      </div>

      {/* Key stats */}
      <div className="mb-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-surface p-4">
          <p className="flex items-center gap-2 text-xs text-ink-dim">
            <CircleDollarSign className="h-3.5 w-3.5 text-accent" /> Reward pool
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-ink">{weiToEth(bounty.rewardAmountWei)} ETH</p>
        </div>
        <div className="bg-surface p-4">
          <p className="flex items-center gap-2 text-xs text-ink-dim">
            <CalendarClock className="h-3.5 w-3.5 text-accent-2" /> Deadline
          </p>
          <p className="mt-1 text-lg font-semibold text-ink">{days} days left</p>
          <p className="text-xs text-ink-faint">{formatDate(bounty.deadline)}</p>
        </div>
        <div className="bg-surface p-4">
          <p className="flex items-center gap-2 text-xs text-ink-dim">
            <FileText className="h-3.5 w-3.5 text-info" /> Reports
          </p>
          <p className="mt-1 text-lg font-semibold text-ink">{bounty._count?.bugReports ?? 0}</p>
        </div>
        <div className="bg-surface p-4">
          <p className="flex items-center gap-2 text-xs text-ink-dim">
            <ShieldCheck className="h-3.5 w-3.5 text-warn" /> Funding
          </p>
          <p className="mt-1 text-lg font-semibold text-ink">{bounty.isFunded ? "Funded" : "Unfunded"}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8 flex items-center gap-3">
        {isOwner && (
          <Link to={`/organization/bounties/${bounty.id}/reports`}>
            <Button variant="secondary">Manage submissions</Button>
          </Link>
        )}
        {canSubmit ? (
          <Link to={`/bounties/${bounty.id}/submit`}>
            <Button>
              <Bug className="h-4 w-4" /> Submit a report
            </Button>
          </Link>
        ) : user?.role === "GUEST" || !user ? (
          <Link to={`/login?next=/bounties/${bounty.id}/submit`}>
            <Button variant="outline">
              <Lock className="h-4 w-4" /> Log in to submit
            </Button>
          </Link>
        ) : null}
      </div>

      {/* On-chain status */}
      {(bounty.onChainId || bounty.isFunded) && (
        <Card className="mb-8">
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
              <pre className="whitespace-pre-wrap rounded-md bg-surface-2 p-4 font-mono text-xs text-ink-dim leading-relaxed">
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
              <ul className="space-y-2">
                {bounty.severities.map((s) => (
                  <li
                    key={s.level}
                    className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2"
                  >
                    <span className={cn("text-sm font-medium", severityColor(s.level))}>{s.level}</span>
                    <span className="font-mono text-sm font-medium text-accent">{weiToEth(s.rewardWei)} ETH</span>
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
                      <Badge className={r.severity === "CRITICAL" ? "bg-danger/10 text-danger border-danger/20" : "bg-ink-faint/10 text-ink-faint border-ink-faint/20"}>
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
