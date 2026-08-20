import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Bug, Building2, CheckCircle2, DollarSign, Fingerprint, Globe, Mail, Save, ShieldCheck, Wallet2 } from "lucide-react";
import { api } from "../../lib/api";
import type { Bounty, Pagination, Wallet } from "../../types";
import { useAuth } from "../../providers/AuthProvider";
import { shortAddress, weiToEth } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Field, Input, Textarea } from "../../components/ui/Field";
import { AvatarUpload } from "../../components/profile/AvatarUpload";
import { DangerZone } from "../../components/profile/DangerZone";
import { WalletPanel } from "../../components/wallet/WalletPanel";
import { MetricStrip, MetricCell, Metric } from "../../components/ui/Metric";

interface BountyListResponse {
  items: Bounty[];
  pagination: Pagination;
}

export function OrgProfile() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [website, setWebsite] = useState(user?.organization?.website ?? "");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: bounties } = useQuery<BountyListResponse>({
    queryKey: ["org-profile-bounties"],
    queryFn: async () => (await api.get("/api/bounties?mine=true&limit=5")) as BountyListResponse,
  });

  const { data: walletData } = useQuery({
    queryKey: ["org-profile-wallet"],
    queryFn: async () => (await api.get("/api/wallet")) as { wallet: Wallet | null },
  });

  const { data: rewards } = useQuery({
    queryKey: ["org-profile-rewards"],
    queryFn: async () => (await api.get("/api/rewards/org")) as { items: { status: string; amountWei: string }[] },
  });

  const myBounties = bounties?.items ?? [];
  const activeCount = myBounties.filter((b) => b.status === "ACTIVE").length;
  const fundedCount = myBounties.filter((b) => b.isFunded).length;
  const totalReports = myBounties.reduce((acc, b) => acc + (b._count?.bugReports ?? 0), 0);
  const totalPaid = (rewards?.items ?? [])
    .filter((r) => r.status === "PAID")
    .reduce((acc, r) => acc + BigInt(r.amountWei), 0n);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/profile", {
        name,
        website: website || undefined,
        description: description || undefined,
      });
      toast.success("Organization updated");
      void refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const orgVerified = user?.organization?.isVerified;
  const orgAddress = user?.organization?.onChainAddress ?? walletData?.wallet?.address;

  return (
    <div className="space-y-8">
      {/* ── Identity header ───────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <AvatarUpload
            compact
            size="lg"
            rounded="rounded-lg"
            name={user?.organization?.name ?? ""}
            imageUrl={user?.imageUrl}
            onUploaded={refresh}
          />
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ash">Organization workspace</p>
            <h1 className="text-2xl font-medium tracking-tight text-paper">{user?.organization?.name ?? user?.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[13px] text-fog">
              {orgAddress ? (
                <span className="inline-flex items-center gap-1">
                  <Wallet2 className="h-3 w-3 text-ash" />
                  {shortAddress(orgAddress, 5)}
                </span>
              ) : (
                <span className="text-coral-red">connect a wallet to fund bounties</span>
              )}
              {orgVerified ? (
                <span className="inline-flex items-center gap-1 rounded-sm border border-pulse-green/25 bg-pulse-green/10 px-2 py-0.5 font-mono text-[10px] text-pulse-green">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-sm border border-graphite px-2 py-0.5 font-mono text-[10px] text-ash">
                  <ShieldCheck className="h-3 w-3" /> Pending verification
                </span>
              )}
              {user?.organization?.website && (
                <a
                  href={user.organization.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-fog transition-colors duration-150 hover:text-paper"
                >
                  <Globe className="h-3 w-3" />
                  {user.organization.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat strip ────────────────────────────────────── */}
      <MetricStrip>
        <MetricCell>
          <Metric label="Active programs" value={String(activeCount)} icon={<Bug className="h-3.5 w-3.5" />} />
        </MetricCell>
        <MetricCell>
          <Metric label="Total submissions" value={String(totalReports)} icon={<Mail className="h-3.5 w-3.5" />} />
        </MetricCell>
        <MetricCell>
          <Metric label="Funded bounties" value={String(fundedCount)} icon={<DollarSign className="h-3.5 w-3.5" />} />
        </MetricCell>
        <MetricCell>
          <Metric label="Rewards paid" value={`${weiToEth(totalPaid)} ETH`} icon={<Wallet2 className="h-3.5 w-3.5" />} sub="Lifetime (Sepolia)" />
        </MetricCell>
      </MetricStrip>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Edit organization details ───────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Edit organization details" subtitle="Contact and program information shown to researchers" />
            <CardBody>
              <form onSubmit={onSubmit} className="space-y-5">
                <Field label="Contact name">
                  <Input required value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Website">
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
                    <Input className="pl-9" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acme.com" />
                  </div>
                </Field>
                <Field label="Description" hint="What does your program cover?">
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your product, security focus, and what researchers should look for..." />
                </Field>
                <div className="flex justify-end">
                  <Button type="submit" loading={saving}>
                    <Save className="h-4 w-4" /> Save changes
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <WalletPanel />
        </div>

        {/* ── Details ─────────────────────────────────────── */}
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-4 [&>div+div]:border-t [&>div+div]:border-graphite [&>div+div]:pt-4">
              <Detail icon={<ShieldCheck className="h-4 w-4" />} tone="text-pulse-green" label="Verification" value={orgVerified ? "Verified organization" : "Pending verification"} />
              <Detail icon={<Building2 className="h-4 w-4" />} tone="text-ash" label="Representative" value={user?.name ?? "—"} />
              <Detail icon={<Fingerprint className="h-4 w-4" />} tone="text-signal-teal" label="Email" value={user?.email ?? "—"} muted />
              <Detail icon={<Mail className="h-4 w-4" />} tone="text-ash" label="Role" value="Organization" />
            </CardBody>
          </Card>
          {orgAddress && (
            <div className="flex items-center gap-3 border border-graphite bg-surface p-4">
              <Wallet2 className="h-4 w-4 text-ash" />
              <p className="font-mono text-[13px] text-mist">{shortAddress(orgAddress, 6)}</p>
            </div>
          )}
        </div>
      </div>

      <DangerZone />
    </div>
  );
}

function Detail({
  icon,
  tone,
  label,
  value,
  muted,
}: {
  icon: React.ReactNode;
  tone: string;
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-obsidian ${tone}`}>{icon}</div>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-wider text-ash">{label}</p>
        <p className={`truncate text-[13px] ${muted ? "text-mist" : "font-medium text-paper"}`}>{value}</p>
      </div>
    </div>
  );
}