import { cn, statusStyle } from "../../lib/utils";

export function Badge({
  children,
  className,
  dot,
}: {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider leading-tight",
        className,
      )}
    >
      {dot && <span className="h-1 w-1 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn("border", statusStyle(status))} dot>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
