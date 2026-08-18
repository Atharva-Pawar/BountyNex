import { useState } from "react";
import toast from "react-hot-toast";
import { Building2, Globe, Save, ShieldCheck, Mail, Fingerprint } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Field, Input, Textarea } from "../../components/ui/Field";
import { AvatarUpload } from "../../components/profile/AvatarUpload";
import { WalletPanel } from "../../components/wallet/WalletPanel";
import { PageHeader } from "../../components/ui/PageHeader";

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
    <div className="space-y-8">
      <PageHeader
        eyebrow="Organization"
        title="Organization profile"
        subtitle="Manage how your organization appears on the platform"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Organization details" />
            <CardBody>
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="flex flex-col gap-4 border border-graphite bg-carbon p-4 sm:flex-row sm:items-center">
                  <AvatarUpload
                    name={user?.organization?.name ?? ""}
                    imageUrl={user?.imageUrl}
                    onUploaded={refresh}
                    rounded="rounded-lg"
                  />
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-paper">{user?.organization?.name}</p>
                    <p className="mt-0.5 font-mono text-[12px] text-fog">{user?.email}</p>
                  </div>
                </div>

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

        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-obsidian text-pulse-green">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ash">Verification</p>
                  <p className="text-[13px] font-medium text-paper">
                    {user?.organization?.isVerified ? "Verified organization" : "Pending verification"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-graphite pt-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-obsidian text-fog">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ash">Representative</p>
                  <p className="text-[13px] text-mist">{user?.name}</p>
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-obsidian text-ash">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ash">Role</p>
                  <p className="text-[13px] text-mist">Organization</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}