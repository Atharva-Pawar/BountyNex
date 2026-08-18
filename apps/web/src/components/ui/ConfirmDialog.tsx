import { useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";
import { lockScroll, unlockScroll } from "../../lib/scroll-lock";

type Variant = "default" | "danger" | "warning";

const TONES: Record<
  Variant,
  { icon: React.ReactNode | null; chip: string; title: string }
> = {
  default: { icon: null, chip: "", title: "text-ash" },
  danger: {
    icon: <AlertTriangle className="h-4 w-4" />,
    chip: "border-coral-red/25 bg-coral-red/10 text-coral-red",
    title: "text-coral-red",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    chip: "border-warn/25 bg-warn/10 text-warn",
    title: "text-warn",
  },
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setRendered(true);
      requestAnimationFrame(() => {
        setVisible(true);
        panelRef.current?.querySelector<HTMLElement>("[data-confirm-autofocus]")?.focus();
      });
    } else {
      setVisible(false);
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
      const timer = window.setTimeout(() => setRendered(false), 200);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!rendered || !open) return;
    lockScroll();
    return () => unlockScroll();
  }, [rendered, open]);

  useEffect(() => {
    if (!rendered || !open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (!loading) onCancel?.();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [rendered, open, loading, onCancel]);

  if (!rendered) return null;

  const tone = TONES[variant];

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200",
        visible ? "bg-black/60" : "bg-black/0",
      )}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel?.();
      }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        data-lenis-prevent
        tabIndex={-1}
        className={cn(
          "w-full max-w-md rounded-lg border border-graphite bg-surface outline-none shadow-elevated transition-all duration-200 ease-out",
          visible ? "scale-100 opacity-100 translate-y-0" : "scale-[0.97] opacity-0 translate-y-1",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-graphite px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {tone.icon && (
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border",
                  tone.chip,
                )}
              >
                {tone.icon}
              </span>
            )}
            <h3
              id="confirm-dialog-title"
              className={cn("text-sm font-medium text-paper", tone.title)}
            >
              {title}
            </h3>
          </div>
          <button
            onClick={() => !loading && onCancel?.()}
            disabled={loading}
            className="rounded-sm p-1.5 text-fog transition-colors duration-150 hover:bg-obsidian hover:text-paper disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          <p id="confirm-dialog-description" className="text-sm leading-relaxed text-mist">
            {description}
          </p>
        </div>

        <div className="flex flex-col-reverse justify-end gap-2 border-t border-graphite px-5 py-3.5 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            data-confirm-autofocus
            onClick={() => !loading && onCancel?.()}
          >
            {cancelLabel}
          </Button>
          {variant === "warning" ? (
            <Button
              type="button"
              loading={loading}
              disabled={loading}
              onClick={() => !loading && onConfirm()}
              className="border-warn/50 bg-transparent text-warn hover:border-warn hover:bg-warn/10"
            >
              {confirmLabel}
            </Button>
          ) : (
            <Button
              type="button"
              variant={variant === "danger" ? "danger" : "primary"}
              loading={loading}
              disabled={loading}
              onClick={() => !loading && onConfirm()}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}