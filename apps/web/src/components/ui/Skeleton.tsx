import { cn } from "../../lib/utils";

function SkeletonBase({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2",
        className,
      )}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
      <SkeletonBase className="h-4 w-3/4" />
      <SkeletonBase className="h-3 w-full" />
      <SkeletonBase className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonBountyGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <SkeletonBase className="h-8 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBase key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
