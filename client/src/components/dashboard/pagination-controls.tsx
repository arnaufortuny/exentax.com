import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "@/components/icons";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, totalPages, total, pageSize, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border" data-testid="pagination-controls">
      <span className="text-xs text-muted-foreground" data-testid="text-pagination-info">
        {start}–{end} / {total}
      </span>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          data-testid="button-pagination-first"
        >
          1
        </Button>
        <Button
          size="icon"
          variant="ghost"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          data-testid="button-pagination-prev"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground px-2" data-testid="text-pagination-page">
          {page} / {totalPages}
        </span>
        <Button
          size="icon"
          variant="ghost"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          data-testid="button-pagination-next"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          data-testid="button-pagination-last"
        >
          {totalPages}
        </Button>
      </div>
    </div>
  );
}
