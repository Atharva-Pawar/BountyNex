import { cn } from "../../lib/utils";

const baseField =
  "w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-all duration-150 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20";

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
        <label className="block text-xs font-medium text-ink-dim">
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
      className={cn(
        baseField,
        invalid && "border-danger focus:border-danger focus:ring-danger/20",
        className,
      )}
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
      className={cn(
        baseField,
        "min-h-[96px] resize-y",
        invalid && "border-danger focus:border-danger focus:ring-danger/20",
        className,
      )}
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
      className={cn(
        baseField,
        "appearance-none bg-no-repeat bg-[right_0.75rem_center] pr-8",
        invalid && "border-danger focus:border-danger focus:ring-danger/20",
        className,
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
      }}
      {...props}
    >
      {children}
    </select>
  );
}
