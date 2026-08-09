import { useState } from "react";
import toast from "react-hot-toast";
import { Save, ShieldCheck, Star } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Field, Input, Textarea } from "../../components/ui/Field";
import { WalletPanel } from "../../components/wallet/WalletPanel";

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
                <div className="flex items-center gap-4 rounded-lg border border-border bg-surface-2 p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-2xl font-bold text-accent">
                    {(user?.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{user?.name}</p>
                    <p className="text-sm text-accent">{user?.researcherProfile?.handle ? `@${user.researcherProfile.handle}` : "no handle"}</p>
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
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
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
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 text-accent">
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

          <Card className="p-5 text-sm text-ink-dim">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">Email</h3>
            <p className="truncate text-ink">{user?.email}</p>
            <h3 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wider text-ink-faint">Member since</h3>
            <p className="text-ink">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
