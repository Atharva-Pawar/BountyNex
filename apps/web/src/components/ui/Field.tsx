import { cn } from "../../lib/utils";

const baseField =
  "w-full rounded-sm border border-graphite bg-carbon px-3 py-2 text-sm text-paper placeholder:text-ash transition-colors duration-150 focus:border-acid-lime/60 focus:outline-none focus:ring-2 focus:ring-acid-lime/15";

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
        <label className="block text-xs font-medium text-mist">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ash">{hint}</p>}
      {error && <p className="text-xs text-coral-red">{error}</p>}
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
        invalid && "border-coral-red focus:border-coral-red focus:ring-coral-red/15",
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
        "min-h-[96px] resize-y leading-relaxed",
        invalid && "border-coral-red focus:border-coral-red focus:ring-coral-red/15",
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
        invalid && "border-coral-red focus:border-coral-red focus:ring-coral-red/15",
        className,
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8f98' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
      }}
      {...props}
    >
      {children}
    </select>
  );
}
