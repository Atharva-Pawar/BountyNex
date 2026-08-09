import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { parseEther, formatEther } from "viem";
import { Plus, Rocket, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import type { Bounty, Severity } from "../../types";
import { SEVERITY_ORDER } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";

const SEVERITIES = SEVERITY_ORDER;

export function CreateBounty() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    scope: "",
    rules: "",
    deadline: "",
  });
  const [severities, setSeverities] = useState<Record<Severity, string>>({
    CRITICAL: "",
    HIGH: "",
    MEDIUM: "",
    LOW: "",
    INFORMATIONAL: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const severityList = SEVERITIES.filter((s) => severities[s]).map((s) => ({
    level: s,
    rewardWei: parseEther(severities[s]).toString(),
  }));

  const totalWei = severityList.reduce((acc, s) => acc + BigInt(s.rewardWei), 0n);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (severityList.length === 0) {
      setError("Set at least one severity reward.");
      return;
    }
    if (!form.deadline || new Date(form.deadline).getTime() <= Date.now()) {
      setError("Deadline must be in the future.");
      return;
    }

    setSubmitting(true);
    try {
      const res = (await api.post("/api/bounties", {
        ...form,
        deadline: new Date(form.deadline).toISOString(),
        rewardAmountWei: totalWei.toString(),
        severities: severityList,
      })) as { bounty: Bounty };
      toast.success("Bounty created as draft");
      navigate(`/organization/bounties/${res.bounty.id}/reports?justCreated=1`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Create a bounty program</h1>
        <p className="text-sm text-ink-dim">
          Define scope, rules, and severity-based rewards. Fund it on-chain to go live.
        </p>
      </div>

      <Card>
        <CardHeader title="Program details" />
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Title">
              <Input required minLength={5} value={form.title} onChange={set("title")} placeholder="e.g. Q3 Web App Security Program" />
            </Field>

            <Field label="Description">
              <Textarea required minLength={20} value={form.description} onChange={set("description")} placeholder="What is in scope, what are you looking for..." />
            </Field>

            <Field label="Scope">
              <Textarea required minLength={10} value={form.scope} onChange={set("scope")} placeholder="URLs, endpoints, contracts, and assets in scope..." />
            </Field>

            <Field label="Rules">
              <Textarea required minLength={10} value={form.rules} onChange={set("rules")} placeholder="Allowed testing, disclosure policy, out-of-scope items..." />
            </Field>

            <Field label="Submission deadline">
              <Input required type="datetime-local" value={form.deadline} onChange={set("deadline")} />
            </Field>

            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">Severity rewards</h3>
                <p className="font-mono text-xs text-ink-faint">Total {formatEther(totalWei)} ETH</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {SEVERITIES.map((s) => (
                  <Field key={s} label={s}>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="0.001"
                        value={severities[s]}
                        placeholder="0.0"
                        onChange={(e) => setSeverities((prev) => ({ ...prev, [s]: e.target.value }))}
                        className="pr-12"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint">ETH</span>
                    </div>
                  </Field>
                ))}
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" loading={submitting}>
                <Plus className="h-4 w-4" /> Create draft
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="border-accent/30">
        <CardHeader
          title="Next steps after creating"
          subtitle="Your program is created as a draft"
          action={<Rocket className="h-5 w-5 text-accent" />}
        />
        <CardBody>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-dim">
            <li>Fund the bounty on-chain with MetaMask (the contract escrows the total reward).</li>
            <li>Once the funding transaction confirms, the bounty is marked funded automatically.</li>
            <li>Activate the program so researchers can submit reports.</li>
            <li>Review submissions, accept valid reports, and release rewards on-chain.</li>
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}
