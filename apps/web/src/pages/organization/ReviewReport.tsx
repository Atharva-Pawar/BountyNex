import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, Send, XCircle } from "lucide-react";
import { api } from "../../lib/api";
import type { BugReport, ReportStatus } from "../../types";
import { weiToEth } from "../../lib/utils";
import { useReleaseReward } from "../../hooks/useEscrow";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { Field, Textarea } from "../../components/ui/Field";
import { ReportDetail } from "../researcher/ReportDetail";

export function ReviewReport() {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);
  const [action, setAction] = useState<ReportStatus | "RELEASE" | "">("");
  const { release, isPending: releasing } = useReleaseReward();

  const { data, isLoading, isError, error, refetch } = useQuery<{ report: BugReport }>({
    queryKey: ["org-report", id],
    queryFn: async () => (await api.get(`/api/reports/${id}`)) as { report: BugReport },
    enabled: Boolean(id),
  });

  const report = data?.report;

  async function setStatus(status: ReportStatus) {
    if (!report) return;
    setActing(true);
    setAction(status);
    try {
      await api.patch(`/api/reports/${report.id}/status`, { status, reviewNote: note || undefined });
      toast.success(`Report marked ${status.replace(/_/g, " ")}`);
      setNote("");
      void refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setActing(false);
      setAction("");
    }
  }

  async function releaseReward() {
    if (!report || !report.bounty || !report.bounty.onChainId) {
      toast.error("This bounty is not deployed on-chain");
      return;
    }
    const researcherWallet = report.researcher?.wallet?.address;
    if (!researcherWallet) {
      toast.error("Researcher has not connected a wallet");
      return;
    }
    if (!report.rewardWei) {
      toast.error("No reward amount assigned to this report");
      return;
    }
    setActing(true);
    setAction("RELEASE");
    try {
      const hash = await release(
        BigInt(report.bounty.onChainId),
        researcherWallet as `0x${string}`,
        BigInt(report.rewardWei),
      );
      await api.post("/api/transactions/record", {
        txHash: hash,
        type: "REWARD_RELEASE",
        reportId: report.id,
        amountWei: report.rewardWei,
      });
      toast.success("Reward transaction submitted for verification");
      void refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setActing(false);
      setAction("");
    }
  }

  if (isLoading) return <Spinner />;
  if (isError || !report) return <ErrorState message={(error as Error).message} />;

  const isAccepted = report.status === "ACCEPTED";
  const isTerminal = report.status === "REWARDED" || report.status === "REJECTED";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm text-ink-dim hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <StatusBadge status={report.severity} />
          <StatusBadge status={report.status} />
        </div>
      </div>

      <Card>
        <CardHeader
          title={report.title}
          subtitle={`by ${report.researcher?.name ?? "Researcher"} · ${report.bounty?.title}`}
        />
        <CardBody>
          <ReportDetail report={report} />
        </CardBody>
      </Card>

      {!isTerminal && (
        <Card>
          <CardHeader title="Review actions" subtitle="Provide a note to the researcher (optional)" />
          <CardBody className="space-y-4">
            <Field label="Note to researcher">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Feedback, clarification requests, or rejection reason..." />
            </Field>

            <div className="flex flex-wrap gap-3">
              {report.status !== "UNDER_REVIEW" && report.status !== "NEEDS_INFORMATION" && report.status === "SUBMITTED" && (
                <Button variant="secondary" loading={acting && action === "UNDER_REVIEW"} onClick={() => void setStatus("UNDER_REVIEW")}>
                  Mark under review
                </Button>
              )}
              {report.status !== "NEEDS_INFORMATION" && (
                <Button variant="secondary" loading={acting && action === "NEEDS_INFORMATION"} onClick={() => void setStatus("NEEDS_INFORMATION")}>
                  Request information
                </Button>
              )}
              {!isAccepted && (
                <Button variant="danger" loading={acting && action === "REJECTED"} onClick={() => void setStatus("REJECTED")}>
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              )}
            </div>

            {!isAccepted && (
              <Button
                variant="primary"
                size="lg"
                loading={acting && action === "ACCEPTED"}
                onClick={() => void setStatus("ACCEPTED")}
              >
                <CheckCircle2 className="h-4 w-4" /> Accept & assign reward
              </Button>
            )}

            {isAccepted && (
              <div className="rounded-xl border border-accent/30 bg-accent/10 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">Reward assigned</p>
                  <p className="font-mono text-accent">{weiToEth(report.rewardWei)} ETH</p>
                </div>
                <Button size="lg" loading={releasing || (acting && action === "RELEASE")} onClick={() => void releaseReward()}>
                  <Send className="h-4 w-4" /> Release reward on-chain
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
