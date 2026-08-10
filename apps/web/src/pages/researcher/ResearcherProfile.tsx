import { useState } from "react";
import toast from "react-hot-toast";
import { Save, ShieldCheck, Star, Mail, CalendarDays } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Field, Input, Textarea } from "../../components/ui/Field";
import { AvatarUpload } from "../../components/profile/AvatarUpload";
import { WalletPanel } from "../../components/wallet/WalletPanel";
import { formatDate } from "../../lib/utils";

export function ResearcherProfile() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.researcherProfile?.handle ? "" : "");
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Profile</h1>
        <p className="text-sm text-ink-dim">Manage your researcher identity</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Public profile" />
            <CardBody>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-2 p-5 sm:flex-row sm:items-center">
                  <AvatarUpload name={user?.name ?? ""} imageUrl={user?.imageUrl} onUploaded={refresh} />
                  <div>
                    <p className="text-sm font-medium text-accent font-mono">
                      {user?.researcherProfile?.handle ? `@${user.researcherProfile.handle}` : "no handle"}
                    </p>
                    <p className="text-xs text-ink-faint mt-0.5">Researcher</p>
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

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-ink-faint">Reputation score</p>
                <p className="text-2xl font-bold text-ink">{user?.researcherProfile?.reputationScore ?? 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-ink-faint">Verification</p>
                <p className="text-sm font-medium text-ink">
                  {user?.isVerified ? "Verified researcher" : "Not verified"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm text-ink-dim">
              <Mail className="h-4 w-4 text-ink-faint" />
              <span className="truncate text-ink">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-dim">
              <CalendarDays className="h-4 w-4 text-ink-faint" />
              <span>Member since {user?.createdAt ? formatDate(user.createdAt) : "—"}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
