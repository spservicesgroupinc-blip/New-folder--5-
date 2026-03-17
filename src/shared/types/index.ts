export type ID = string;
export type Timestamp = string; // ISO 8601
export type Maybe<T> = T | null | undefined;
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
