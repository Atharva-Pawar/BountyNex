import { cn } from "../../lib/utils";

const baseField =
  "w-full rounded-lg border border-border bg-surface-2/80 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium uppercase tracking-wider text-ink-dim">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink-faint">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      className={cn(baseField, invalid && "border-danger focus:border-danger focus:ring-danger/40", className)}
      {...props}
    />
  );
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(baseField, "min-h-[96px] resize-y", invalid && "border-danger", className)}
      {...props}
    />
  );
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ className, invalid, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(baseField, "appearance-none", invalid && "border-danger", className)}
      {...props}
    >
      {children}
    </select>
  );
}
