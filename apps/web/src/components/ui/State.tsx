import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Button } from "./Button";

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-12 text-fog">
      <Loader2 className="h-4 w-4 animate-spin text-acid-lime" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-graphite bg-carbon/50 py-14 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-obsidian text-ash">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <h3 className="text-sm font-medium text-paper">{title}</h3>
      {description && <p className="max-w-xs text-sm leading-relaxed text-fog">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-coral-red/20 bg-coral-red/5 py-14 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-coral-red/10 text-coral-red">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <p className="max-w-sm text-sm leading-relaxed text-mist">{message}</p>
      {retry && (
        <Button variant="outline" size="sm" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
