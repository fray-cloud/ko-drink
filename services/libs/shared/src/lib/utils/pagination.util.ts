import type { PaginationMeta } from '../types/pagination.types';

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  };
}

export function paginate<T>(
  data: T[],
  page: number,
  limit: number,
): { data: T[]; meta: PaginationMeta } {
  const total = data.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    meta: createPaginationMeta(total, page, limit),
  };
}

