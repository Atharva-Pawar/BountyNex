import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-ink-dim">
      <Loader2 className="h-5 w-5 animate-spin text-accent" />
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
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink-faint">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-dim">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/5 py-14 text-center">
      <AlertTriangle className="h-8 w-8 text-danger" />
      <p className="text-sm text-ink">{message}</p>
      {retry && (
        <button onClick={retry} className="mt-2 text-sm text-accent hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}
