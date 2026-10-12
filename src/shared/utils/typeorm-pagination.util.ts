import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Wrapper de paginación para `SelectQueryBuilder`.
 * Asume que el caller ya aplicó filtros / joins. Aplica `take` + `skip`
 * y devuelve `{ data, total, page, pageSize, totalPages }` consistente.
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export function normalizePagination(params: PaginationParams = {}): {
  page: number;
  pageSize: number;
} {
  const page = Math.max(1, params.page ?? DEFAULT_PAGE);
  const rawPageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(1, rawPageSize), MAX_PAGE_SIZE);
  return { page, pageSize };
}

export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  params: PaginationParams = {},
): Promise<Paginated<T>> {
  const { page, pageSize } = normalizePagination(params);
  const [data, total] = await qb
    .take(pageSize)
    .skip((page - 1) * pageSize)
    .getManyAndCount();
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
