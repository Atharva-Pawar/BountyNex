import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Send, ShieldAlert, X } from "lucide-react";
import { api, uploadFile } from "../../lib/api";
import type { Bounty, BugReport } from "../../types";
import { SEVERITY_ORDER, weiToEth } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import { Badge } from "../../components/ui/Badge";
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
        <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ash">New report</p>
        <h1 className="text-2xl font-medium tracking-tight text-paper">Submit a report</h1>
        <p className="mt-1 text-sm text-mist">
          for{" "}
          <Link className="font-medium text-bone underline decoration-graphite underline-offset-4 hover:text-paper" to={`/bounties/${bounty.id}`}>
            {bounty.title}
          </Link>{" "}
          · <span className="font-mono text-[13px] text-acid-lime">{weiToEth(bounty.rewardAmountWei)} ETH</span>
          {bounty.organization && (
            <>
              <span className="mx-1.5 text-ash">·</span>
              <Link className="font-medium text-bone underline decoration-graphite underline-offset-4 hover:text-paper" to={`/organization/${bounty.organizationId}`}>
                {bounty.organization.name}
              </Link>
            </>
          )}
        </p>
      </div>

      {!user?.isVerified && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-graphite bg-carbon px-4 py-3.5">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
          <p className="text-[13px] leading-relaxed text-mist">
            Your account is not yet verified. Reports can still be submitted, but verification
            builds trust with organizations.
          </p>
        </div>
      )}

      <Card>
        <CardHeader title="Vulnerability details" subtitle="Provide a thorough, reproducible report" />
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-5">
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
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-dashed border-graphite bg-carbon px-3 py-2 text-[13px] text-mist transition-colors duration-150 hover:border-fog hover:text-paper">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                    className="sr-only"
                  />
                  <span className="text-[13px]">+ Attach files</span>
                </label>
                {files.map((f, i) => (
                  <span
                    key={`${f.name}-${i}`}
                    className="inline-flex items-center gap-2 rounded-sm border border-graphite bg-obsidian px-2.5 py-2 font-mono text-[12px] text-mist"
                  >
                    {f.name}
                    <button type="button" onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-ash transition-colors hover:text-coral-red">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </Field>

            {error && (
              <div className="rounded-md border border-coral-red/25 bg-coral-red/10 px-4 py-3 text-sm text-[#ff8d8d]">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Badge className="font-mono normal-case text-fog border-graphite">
                {files.length} file{files.length === 1 ? "" : "s"} attached
              </Badge>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" loading={submitting}>
                  <Send className="h-4 w-4" /> Submit report
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}