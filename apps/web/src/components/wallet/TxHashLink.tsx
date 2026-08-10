import { ExternalLink } from "lucide-react";
import { explorerTxUrl, shortAddress } from "../../lib/utils";

export function TxHashLink({ hash, className }: { hash: string; className?: string }) {
  return (
    <a
      href={explorerTxUrl(hash)}
      target="_blank"
      rel="noreferrer"
      className={
        className ??
        "inline-flex items-center gap-1 font-mono text-xs text-accent hover:underline"
      }
      title="View on Sepolia block explorer"
    >
      {shortAddress(hash, 5)}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
