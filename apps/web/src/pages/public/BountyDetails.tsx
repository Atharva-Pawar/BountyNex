import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
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
import { Metric, MetricCell, MetricStrip } from "../../components/ui/Metric";
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
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ash">
            Bounty · BNX-{bounty.id.slice(0, 8)}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-medium tracking-tight text-paper sm:text-4xl">
            {bounty.title}
          </h1>
          <Badge className={bounty.status === "ACTIVE" ? "bg-acid-lime/10 text-acid-lime border-acid-lime/25" : "bg-ash/10 text-ash border-ash/25"} dot>
            {bounty.status}
          </Badge>
          {bounty.isFunded && (
            <span className="inline-flex items-center gap-1.5 rounded border border-pulse-green/20 bg-pulse-green/5 px-2 py-0.5 font-mono text-[10px] text-pulse-green">
              <span className="h-1 w-1 rounded-full bg-pulse-green" /> funded
            </span>
          )}
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-fog">
          <ShieldCheck
            className={cn("h-4 w-4", bounty.organization?.isVerified ? "text-pulse-green" : "text-ash")}
          />
          {bounty.organization?.name}
          {bounty.organization?.isVerified && (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-pulse-green">
              <BadgeCheck className="h-3 w-3" /> verified
            </span>
          )}
        </p>
      </div>

      {/* ── Key facts ────────────────────────────────────── */}
      <MetricStrip className="mb-8">
        <MetricCell>
          <Metric label="Reward pool" value={`${weiToEth(bounty.rewardAmountWei)} ETH`} />
        </MetricCell>
        <MetricCell>
          <Metric
            label="Deadline"
            value={days === 0 ? "Expired" : `${days} days left`}
            sub={formatDate(bounty.deadline)}
          />
        </MetricCell>
        <MetricCell>
          <Metric label="Reports" value={String(bounty._count?.bugReports ?? 0)} />
        </MetricCell>
        <MetricCell>
          <Metric label="Network" value="Sepolia" sub={bounty.onChainId ? `on-chain ${bounty.onChainId} ` : "off-chain"} />
        </MetricCell>
      </MetricStrip>

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="mb-10 flex items-center gap-3">
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
            <Button variant="secondary">
              <Lock className="h-4 w-4" /> Log in to submit
            </Button>
          </Link>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Main column ────────────────────────────────── */}
        <div className="space-y-6 min-w-0">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ash">Description</p>
            <p className="whitespace-pre-line leading-relaxed text-mist">{bounty.description}</p>
          </div>

          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ash">Scope</p>
            <pre className="whitespace-pre-wrap rounded-sm border border-graphite bg-carbon p-4 font-mono text-[13px] leading-relaxed text-mist">
              {bounty.scope}
            </pre>
          </div>

          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ash">Rules</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-fog">{bounty.rules}</p>
          </div>
        </div>

        {/* ── Sidebar ────────────────────────────────────── */}
        <div className="space-y-6">
          {(bounty.onChainId || bounty.isFunded) && (
            <Card>
              <CardHeader
                title="On-chain escrow"
                subtitle="State from the BountyEscrow contract"
                mono
              />
              <CardBody className="space-y-3 font-mono text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-ash">bounty</span>
                  <span className="text-mist">{bounty.onChainId ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ash">escrow</span>
                  <span className="text-mist">{onChain ? `${weiToEth(onChain.rewardBalance)} ETH` : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ash">released</span>
                  <span className="text-mist">{onChain ? `${weiToEth(onChain.totalReleased)} ETH` : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ash">network</span>
                  <span className="text-pulse-green">sepolia</span>
                </div>
                {bounty.fundingTxHash && (
                  <div className="border-t border-graphite pt-3">
                    <p className="mb-1 text-[10px] uppercase tracking-wider text-ash">funding tx</p>
                    <TxHashLink hash={bounty.fundingTxHash} />
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Severity rewards" mono />
            <CardBody>
              <ul className="divide-y divide-graphite">
                {bounty.severities.map((s) => (
                  <li key={s.level} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <span className={cn("text-sm font-medium capitalize", severityColor(s.level))}>
                      {s.level.toLowerCase()}
                    </span>
                    <span className="font-mono text-sm text-paper">{weiToEth(s.rewardWei)} ETH</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {bounty.bugReports && bounty.bugReports.length > 0 && (
            <Card>
              <CardHeader title="Recent reports" />
              <CardBody>
                <ul className="divide-y divide-graphite">
                  {bounty.bugReports.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 text-[13px]">
                      <span className="truncate text-mist">{r.title}</span>
                      <span className={cn("shrink-0 font-mono text-[10px] font-medium capitalize", severityColor(r.severity))}>
                        {r.severity.toLowerCase()}
                      </span>
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