import { v4 as uuidv4 } from 'uuid';

export interface ApiMeta {
  requestId: string;
  timestamp: string;
  nextCursor?: string | null;
  total?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorDetail {
  field?: string;
  issue: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  meta: Pick<ApiMeta, 'requestId' | 'timestamp'>;
}

export function ok<T>(data: T, extras?: Partial<ApiMeta>): ApiResponse<T> {
  return {
    data,
    meta: {
      requestId: uuidv4(),
      timestamp: new Date().toISOString(),
      ...extras,
    },
  };
}

export function paginated<T>(
  data: T[],
  nextCursor: string | null,
  total?: number,
): ApiResponse<T[]> {
  return {
    data,
    meta: {
      requestId: uuidv4(),
      timestamp: new Date().toISOString(),
      nextCursor,
      ...(total !== undefined ? { total } : {}),
    },
  };
}
