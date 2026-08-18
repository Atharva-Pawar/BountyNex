import { FileText, Paperclip } from "lucide-react";
import type { BugReport } from "../../types";
import { cn, formatDate, severityColor, weiToEth } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-ash">{label}</h4>
      {children}
    </div>
  );
}

export function ReportDetail({ report }: { report: BugReport }) {
  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={report.severity} />
        <StatusBadge status={report.status} />
        <span className="font-mono text-[11px] text-ash">submitted {formatDate(report.submittedAt)}</span>
      </div>

      <DetailBlock label="Affected component">
        <p className="font-mono text-[13px] text-paper">{report.affectedComponent}</p>
      </DetailBlock>

      <DetailBlock label="Description">
        <p className="whitespace-pre-wrap leading-relaxed text-mist">{report.description}</p>
      </DetailBlock>

      <DetailBlock label="Steps to reproduce">
        <p className="whitespace-pre-wrap leading-relaxed text-mist">{report.stepsToReproduce}</p>
      </DetailBlock>

      {report.proofOfConcept && (
        <DetailBlock label="Proof of concept">
          <pre className="whitespace-pre-wrap rounded-sm border border-graphite bg-carbon p-3 font-mono text-xs leading-relaxed text-mist">
            {report.proofOfConcept}
          </pre>
        </DetailBlock>
      )}

      {report.rewardWei && (
        <div className="flex items-center justify-between rounded-sm border border-acid-lime/20 bg-acid-lime/5 px-4 py-3">
          <span className="text-sm font-medium text-mist">Reward</span>
          <span className="font-mono font-medium text-acid-lime">{weiToEth(report.rewardWei)} ETH</span>
        </div>
      )}

      {report.reviewNote && (
        <div className="rounded-sm border border-graphite bg-obsidian p-4">
          <h4 className="mb-1 font-mono text-[10px] uppercase tracking-wider text-ash">Reviewer note</h4>
          <p className="whitespace-pre-wrap text-mist">{report.reviewNote}</p>
        </div>
      )}

      {report.evidence.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ash">
            <Paperclip className="h-3.5 w-3.5" /> Evidence ({report.evidence.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {report.evidence.map((e) => (
              <a
                key={e.id}
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex items-center gap-2 truncate rounded-sm border border-graphite bg-obsidian px-3 py-2 text-xs text-mist transition-colors duration-150 hover:border-smoke",
                )}
              >
                {e.mimeType.startsWith("image/") ? (
                  <img src={e.url} alt={e.fileName} className="h-10 w-10 rounded object-cover" />
                ) : (
                  <Paperclip className="h-4 w-4 shrink-0 text-fog" />
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