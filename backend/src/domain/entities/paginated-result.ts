export interface PaginatedResult<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
