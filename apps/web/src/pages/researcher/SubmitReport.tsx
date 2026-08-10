import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Send, ShieldAlert } from "lucide-react";
import { api, uploadFile } from "../../lib/api";
import type { Bounty, BugReport } from "../../types";
import { SEVERITY_ORDER, weiToEth } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import { ErrorState, Spinner } from "../../components/ui/State";
import { useAuth } from "../../providers/AuthProvider";

export function SubmitReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["submit-bounty", id],
    queryFn: async () => (await api.get(`/api/bounties/${id}`)) as { bounty: Bounty },
    enabled: Boolean(id),
  });

  const bounty = data?.bounty;

  const [form, setForm] = useState({
    title: "",
    severity: "HIGH",
    affectedComponent: "",
    description: "",
    stepsToReproduce: "",
    proofOfConcept: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !user?.wallet) {
      setError("Connect and bind a wallet to your profile before submitting reports.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = (await api.post("/api/reports", { ...form, bountyId: id })) as { report: BugReport };
      for (const file of files) {
        await uploadFile(`/api/reports/${res.report.id}/evidence`, file);
      }
      toast.success("Report submitted");
      navigate("/researcher/reports");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <Spinner />;
  if (isError || !bounty) return <ErrorState message="Bounty not found or unavailable" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Submit a report</h1>
        <p className="text-sm text-ink-dim">
          for <span className="font-medium text-accent">{bounty.title}</span> ·{" "}
          <span className="font-mono">{weiToEth(bounty.rewardAmountWei)} ETH</span>
        </p>
      </div>

      {!user?.isVerified && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-500">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          Your account is not yet verified. Reports can still be submitted, but verification
          builds trust with organizations.
        </div>
      )}

      <Card>
        <CardHeader title="Vulnerability details" subtitle="Provide a thorough, reproducible report" />
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Title">
              <Input required minLength={5} value={form.title} onChange={set("title")} placeholder="e.g. Stored XSS in profile bio" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Severity">
                <Select required value={form.severity} onChange={set("severity")}>
                  {SEVERITY_ORDER.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Affected component">
                <Input required value={form.affectedComponent} onChange={set("affectedComponent")} placeholder="e.g. /api/v1/users (POST)" />
              </Field>
            </div>

            <Field label="Description">
              <Textarea required minLength={30} value={form.description} onChange={set("description")} placeholder="Describe the vulnerability, its impact, and who is affected..." />
            </Field>

            <Field label="Steps to reproduce">
              <Textarea required minLength={20} value={form.stepsToReproduce} onChange={set("stepsToReproduce")} placeholder={"1. Navigate to...\n2. Inject...\n3. Observe..."} />
            </Field>

            <Field label="Proof of concept (optional)">
              <Textarea value={form.proofOfConcept} onChange={set("proofOfConcept")} placeholder="Code snippets, payloads, or PoC write-up..." />
            </Field>

            <Field label="Evidence files (optional)" hint="Screenshots, logs, or PoC files. Max 15 MB each.">
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="w-full text-sm text-ink-dim file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent file:cursor-pointer hover:file:bg-accent/10"
              />
              {files.length > 0 && (
                <p className="text-xs text-ink-faint mt-1">{files.length} file(s) attached</p>
              )}
            </Field>

            {error && (
              <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" loading={submitting}>
                <Send className="h-4 w-4" /> Submit report
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
