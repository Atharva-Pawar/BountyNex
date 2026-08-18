import { cn } from "../../lib/utils";

export function Metric({
  label,
  value,
  sub,
  icon,
  mono = true,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="py-1">
      <p className="flex items-center gap-1.5 text-xs text-fog">
        {icon && <span className="text-ash">{icon}</span>}
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-xl font-medium tracking-tight text-paper",
          mono && "font-mono text-lg",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-ash">{sub}</p>}
    </div>
  );
}

export function MetricStrip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-lg border border-graphite bg-graphite sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MetricCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("bg-surface p-4", className)}>{children}</div>;
}