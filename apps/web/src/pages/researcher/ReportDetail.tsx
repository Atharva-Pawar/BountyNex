import { FileText, Paperclip } from "lucide-react";
import type { BugReport } from "../../types";
import { formatDate, weiToEth } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";

export function ReportDetail({ report }: { report: BugReport }) {
  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={report.severity} />
        <StatusBadge status={report.status} />
        <span className="text-xs text-ink-faint">Submitted {formatDate(report.submittedAt)}</span>
      </div>

      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">Affected component</h4>
        <p className="text-ink">{report.affectedComponent}</p>
      </div>

      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">Description</h4>
        <p className="whitespace-pre-wrap leading-relaxed text-ink">{report.description}</p>
      </div>

      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">Steps to reproduce</h4>
        <p className="whitespace-pre-wrap leading-relaxed text-ink">{report.stepsToReproduce}</p>
      </div>

      {report.proofOfConcept && (
        <div>
          <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-faint">
            <FileText className="h-3.5 w-3.5" /> Proof of concept
          </h4>
          <pre className="whitespace-pre-wrap rounded-lg border border-border bg-surface-2 p-3 font-mono text-xs text-ink">
            {report.proofOfConcept}
          </pre>
        </div>
      )}

      {report.rewardWei && (
        <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
          <span className="text-sm font-medium text-ink">Reward</span>
          <span className="font-mono text-accent">{weiToEth(report.rewardWei)} ETH</span>
        </div>
      )}

      {report.reviewNote && (
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">Reviewer note</h4>
          <p className="whitespace-pre-wrap text-ink">{report.reviewNote}</p>
        </div>
      )}

      {report.evidence.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-faint">
            <Paperclip className="h-3.5 w-3.5" /> Evidence ({report.evidence.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {report.evidence.map((e) => (
              <a
                key={e.id}
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 truncate rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-ink-dim hover:border-accent/40 hover:text-accent"
              >
                {e.mimeType.startsWith("image/") ? (
                  <img src={e.url} alt={e.fileName} className="h-10 w-10 rounded object-cover" />
                ) : (
                  <Paperclip className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate">{e.fileName}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
