import { cn } from "../../lib/utils";

export function Card({
  className,
  children,
  hover,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-graphite bg-surface transition-colors duration-150",
        hover && "hover:border-smoke hover:bg-obsidian",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  mono,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-graphite px-5 py-3.5">
      <div className="min-w-0">
        <h3 className={cn("text-sm font-medium text-paper", mono && "font-mono text-[13px]")}>
          {title}
        </h3>
        {subtitle && <p className="mt-0.5 text-xs text-fog">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
