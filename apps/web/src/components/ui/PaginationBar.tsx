import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination } from "../../types";
import { Button } from "./Button";

export function PaginationBar({
  pagination,
  onPage,
}: {
  pagination?: Pagination;
  onPage: (page: number) => void;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-t border-graphite pt-4 text-sm text-fog">
      <span className="font-mono text-xs">
        Page {pagination.page} / {pagination.totalPages} · {pagination.total} total
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasPrevious}
          onClick={() => onPage(pagination.page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasNext}
          onClick={() => onPage(pagination.page + 1)}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}