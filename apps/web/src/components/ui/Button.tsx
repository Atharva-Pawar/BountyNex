import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-acid-lime text-void font-medium hover:bg-acid-lime-dim active:scale-[0.98] disabled:hover:bg-acid-lime",
  secondary:
    "bg-transparent text-mist border border-graphite hover:border-smoke hover:text-paper hover:bg-obsidian active:scale-[0.98]",
  ghost:
    "bg-transparent text-fog hover:text-paper hover:bg-obsidian active:scale-[0.98]",
  danger:
    "bg-coral-red text-white font-medium hover:opacity-90 active:scale-[0.98] disabled:hover:bg-coral-red",
  outline:
    "bg-transparent border border-graphite text-mist hover:border-smoke hover:text-paper hover:bg-obsidian active:scale-[0.98]",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[13px] rounded-sm gap-1.5",
  md: "px-4 py-2 text-sm rounded-sm gap-2",
  lg: "px-5 py-2.5 text-sm rounded-sm gap-2",
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
        "inline-flex items-center justify-center transition-all duration-150 ease-out select-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
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
