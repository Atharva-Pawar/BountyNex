import { useState } from "react";
import toast from "react-hot-toast";
import { Building2, Globe, Save, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Field, Input, Textarea } from "../../components/ui/Field";
import { AvatarUpload } from "../../components/profile/AvatarUpload";
import { WalletPanel } from "../../components/wallet/WalletPanel";

export function OrgProfile() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [website, setWebsite] = useState(user?.organization?.website ?? "");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Organization profile</h1>
        <p className="text-sm text-ink-dim">Manage how your organization appears on the platform</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Organization details" />
            <CardBody>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-2 p-4">
                  <AvatarUpload
                    name={user?.organization?.name ?? ""}
                    imageUrl={user?.imageUrl}
                    onUploaded={refresh}
                    rounded="rounded-xl"
                  />
                  <p className="text-sm text-ink-dim">{user?.email}</p>
                </div>

                <Field label="Contact name">
                  <Input required value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Website">
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
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

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-ink-faint">Verification</p>
                <p className="text-sm font-medium text-ink">
                  {user?.organization?.isVerified ? "Verified organization" : "Pending verification"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 text-sm text-ink-dim">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              <Building2 className="h-3.5 w-3.5" /> Account
            </h3>
            <p className="text-ink">{user?.name}</p>
            <p className="truncate">{user?.email}</p>
            <p className="mt-3 text-xs text-ink-faint">Role: {user?.role}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
