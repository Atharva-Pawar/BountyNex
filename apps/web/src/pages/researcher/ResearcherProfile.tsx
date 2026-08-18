import { useState } from "react";
import toast from "react-hot-toast";
import { Save, ShieldCheck, Star, Mail, CalendarDays, Fingerprint } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Field, Input, Textarea } from "../../components/ui/Field";
import { AvatarUpload } from "../../components/profile/AvatarUpload";
import { WalletPanel } from "../../components/wallet/WalletPanel";
import { PageHeader } from "../../components/ui/PageHeader";
import { formatDate } from "../../lib/utils";

export function ResearcherProfile() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Researcher"
        title="Profile"
        subtitle="Manage your public researcher identity"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Public profile" />
            <CardBody>
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="flex flex-col gap-4 border border-graphite bg-carbon p-4 sm:flex-row sm:items-center">
                  <AvatarUpload name={user?.name ?? ""} imageUrl={user?.imageUrl} onUploaded={refresh} />
                  <div className="min-w-0">
                    <p className="font-mono text-[13px] text-acid-lime">
                      {user?.researcherProfile?.handle ? `@${user.researcherProfile.handle}` : "no handle"}
                    </p>
                    <p className="mt-0.5 text-xs text-fog">Researcher</p>
                  </div>
                </div>

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

        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-obsidian text-acid-lime">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-ash">Reputation</p>
                  <p className="font-mono text-lg text-paper">{user?.researcherProfile?.reputationScore ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-graphite pt-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-obsidian text-pulse-green">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ash">Verification</p>
                  <p className="text-[13px] font-medium text-paper">
                    {user?.isVerified ? "Verified researcher" : "Not verified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-graphite pt-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-obsidian text-signal-teal">
                  <Fingerprint className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ash">Email</p>
                  <p className="truncate text-[13px] text-mist">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-graphite pt-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-obsidian text-fog">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ash">Member since</p>
                  <p className="text-[13px] text-mist">{user?.createdAt ? formatDate(user.createdAt) : "—"}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="prose prose-sm space-y-3">
            <div className="flex items-center gap-3 border border-graphite bg-surface p-4">
              <Mail className="h-4 w-4 text-fog" />
              <p className="text-sm text-ash">Built for the Sepolia testnet. No real funds.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}