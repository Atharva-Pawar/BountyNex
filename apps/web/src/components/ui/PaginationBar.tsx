import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination } from "../../types";

export function PaginationBar({
  pagination,
  onPage,
}: {
  pagination?: Pagination;
  onPage: (page: number) => void;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 pt-4 text-sm text-ink-dim">
      <span>
        Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={!pagination.hasPrevious}
          onClick={() => onPage(pagination.page - 1)}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 transition-colors hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <button
          disabled={!pagination.hasNext}
          onClick={() => onPage(pagination.page + 1)}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 transition-colors hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
