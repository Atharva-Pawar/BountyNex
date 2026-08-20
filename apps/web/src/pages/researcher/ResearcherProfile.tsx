import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Award, Bug, CheckCircle2, Clock, FileSearch, Fingerprint, Mail, Save, ShieldCheck, Star } from "lucide-react";
import { api } from "../../lib/api";
import type { BugReport } from "../../types";
import { useAuth } from "../../providers/AuthProvider";
import { formatDate, weiToEth } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Field, Input, Textarea } from "../../components/ui/Field";
import { AvatarUpload } from "../../components/profile/AvatarUpload";
import { DangerZone } from "../../components/profile/DangerZone";
import { WalletPanel } from "../../components/wallet/WalletPanel";
import { MetricStrip, MetricCell, Metric } from "../../components/ui/Metric";

interface ReportsResponse {
  items: BugReport[];
  pagination: { total: number };
}

export function ResearcherProfile() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: reports } = useQuery<ReportsResponse>({
    queryKey: ["researcher-profile-reports"],
    queryFn: async () => (await api.get("/api/reports/my?limit=5")) as ReportsResponse,
  });

  const { data: rewards } = useQuery({
    queryKey: ["researcher-profile-rewards"],
    queryFn: async () => (await api.get("/api/rewards/my")) as { items: { status: string; amountWei: string }[] },
  });

  const items = reports?.items ?? [];
  const rewardItems = rewards?.items ?? [];
  const totalEarned = rewardItems
    .filter((r) => r.status === "PAID")
    .reduce((acc, r) => acc + BigInt(r.amountWei), 0n);
  const reputation = user?.researcherProfile?.reputationScore ?? 0;
  const pendingCount = items.filter((r) => r.status === "SUBMITTED" || r.status === "UNDER_REVIEW").length;
  const acceptedCount = items.filter((r) => r.status === "ACCEPTED" || r.status === "REWARDED").length;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/profile", { name, bio: bio || undefined });
      toast.success("Profile updated");
      void refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const verified = user?.isVerified;

  return (
    <div className="space-y-8">
      {/* ── Identity header ───────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <AvatarUpload compact size="lg" name={user?.name ?? ""} imageUrl={user?.imageUrl} onUploaded={refresh} />
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ash">Researcher workspace</p>
            <h1 className="text-2xl font-medium tracking-tight text-paper">{user?.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[13px] text-fog">
              {user?.researcherProfile?.handle ? (
                <>@{user.researcherProfile.handle}</>
              ) : (
                <span className="text-coral-red">no handle set</span>
              )}
              <span className="inline-flex items-center gap-1 rounded-sm border border-graphite bg-obsidian px-2 py-0.5 font-mono text-[10px] text-fog">
                <Star className="h-3 w-3 text-acid-lime" />
                {reputation.toFixed(1)} rep
              </span>
              {verified ? (
                <span className="inline-flex items-center gap-1 rounded-sm border border-pulse-green/25 bg-pulse-green/10 px-2 py-0.5 font-mono text-[10px] text-pulse-green">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-sm border border-graphite px-2 py-0.5 font-mono text-[10px] text-ash">
                  <ShieldCheck className="h-3 w-3" /> Unverified
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat strip ────────────────────────────────────── */}
      <MetricStrip>
        <MetricCell>
          <Metric label="Reports submitted" value={String(reports?.pagination.total ?? 0)} icon={<FileSearch className="h-3.5 w-3.5" />} />
        </MetricCell>
        <MetricCell>
          <Metric label="Pending review" value={String(pendingCount)} icon={<Clock className="h-3.5 w-3.5" />} />
        </MetricCell>
        <MetricCell>
          <Metric label="Accepted" value={String(acceptedCount)} icon={<Bug className="h-3.5 w-3.5" />} />
        </MetricCell>
        <MetricCell>
          <Metric label="Total earned" value={`${weiToEth(totalEarned)} ETH`} icon={<Award className="h-3.5 w-3.5" />} sub="Lifetime rewards (Sepolia)" />
        </MetricCell>
      </MetricStrip>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Edit public profile ─────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Edit public profile" subtitle="Name and bio shown across your activity" />
            <CardBody>
              <form onSubmit={onSubmit} className="space-y-5">
                <Field label="Display name">
                  <Input required value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Bio" hint="Short summary of your research focus and experience">
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Security researcher focused on web3 and smart contract auditing..." />
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
              <Detail icon={<Star className="h-4 w-4" />} tone="text-acid-lime" label="Reputation" value={`${reputation.toFixed(1)}`} />
              <Detail icon={<CheckCircle2 className="h-4 w-4" />} tone="text-pulse-green" label="Verification" value={verified ? "Verified researcher" : "Not verified"} />
              <Detail icon={<Fingerprint className="h-4 w-4" />} tone="text-signal-teal" label="Email" value={user?.email ?? "—"} muted />
              <Detail icon={<Mail className="h-4 w-4" />} tone="text-ash" label="Member since" value={user?.createdAt ? formatDate(user.createdAt) : "—"} />
            </CardBody>
          </Card>
          <div className="flex items-center gap-3 border border-graphite bg-surface p-4">
            <Mail className="h-4 w-4 text-fog" />
            <p className="text-sm text-ash">Built for the Sepolia testnet. No real funds.</p>
          </div>
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