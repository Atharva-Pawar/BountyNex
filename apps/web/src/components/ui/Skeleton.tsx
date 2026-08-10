import { cn } from "../../lib/utils";

function SkeletonBase({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-surface-2",
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
    <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
      <SkeletonBase className="h-4 w-3/4" />
      <SkeletonBase className="h-3 w-full" />
      <SkeletonBase className="h-3 w-2/3" />
      <div className="flex gap-2 pt-2">
        <SkeletonBase className="h-6 w-16 rounded-full" />
        <SkeletonBase className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonBountyGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-4">
        <SkeletonBase className="h-11 w-11 rounded-lg" />
        <div className="space-y-2">
          <SkeletonBase className="h-3 w-20" />
          <SkeletonBase className="h-5 w-16" />
        </div>
      </div>
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
