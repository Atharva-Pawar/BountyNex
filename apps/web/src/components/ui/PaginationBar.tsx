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
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <button
          disabled={!pagination.hasNext}
          onClick={() => onPage(pagination.page + 1)}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
