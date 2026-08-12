import { cn, statusStyle } from "../../lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider leading-tight",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={statusStyle(status)}>{status.replace(/_/g, " ")}</Badge>;
}
