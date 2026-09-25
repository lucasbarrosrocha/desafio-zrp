import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  search?: string;
}

function buildHref(page: number, search?: string): string {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  params.set("page", String(page));
  return `/?${params.toString()}`;
}

export function PaginationControls({ page, totalPages, search }: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4">
      {hasPrevious ? (
        <Button variant="outline" render={<Link href={buildHref(page - 1, search)} />}>
          Previous
        </Button>
      ) : (
        <Button variant="outline" disabled>
          Previous
        </Button>
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {hasNext ? (
        <Button variant="outline" render={<Link href={buildHref(page + 1, search)} />}>
          Next
        </Button>
      ) : (
        <Button variant="outline" disabled>
          Next
        </Button>
      )}
    </nav>
  );
}
