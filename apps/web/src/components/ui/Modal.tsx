import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cn(
          "w-full rounded-2xl border border-border bg-surface shadow-2xl",
          wide ? "max-w-3xl" : "max-w-lg",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-dim hover:bg-surface-2 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  danger,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-ink-dim">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm text-ink-dim hover:text-ink"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={
            danger
              ? "rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/80"
              : "rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-accent-dim"
          }
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
