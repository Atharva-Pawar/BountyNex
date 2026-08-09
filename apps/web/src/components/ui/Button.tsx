import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-emerald-950 font-semibold hover:bg-accent-dim disabled:opacity-50 shadow-[0_0_18px_rgba(16,185,129,0.25)]",
  secondary:
    "bg-surface-2 text-ink border border-border hover:border-accent/50 hover:text-accent",
  ghost: "text-ink-dim hover:text-ink hover:bg-surface-2",
  danger: "bg-danger/90 text-white font-semibold hover:bg-danger disabled:opacity-50",
  outline: "border border-border-strong text-accent-2 hover:bg-surface-2",
};

const SIZES: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-5 py-3 text-base rounded-xl",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
