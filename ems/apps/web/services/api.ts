// ============================================================
// EMS Base API Client
// Standards: ems/docs/api-standards.md
//
// - Bearer JWT auth on every request
// - Tenant context resolved from token (never self-asserted)
// - Cursor-based pagination (default limit 25, max 100)
// - Standard error format: { error: { code, message, details, requestId } }
// - Idempotency-Key required for POST on order/payment/registration
// ============================================================

import { ApiError, ApiRequestError, PaginationParams, PaginatedResponse } from '@/types/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''
const API_VERSION = '/api/v1'

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('ems_token')
}

function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  requiresIdempotency?: boolean
  idempotencyKey?: string
  params?: Record<string, string | number | boolean | undefined>
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    body,
    requiresIdempotency = false,
    idempotencyKey,
    params,
    ...fetchOptions
  } = options

  const token = getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-Id': generateIdempotencyKey(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(requiresIdempotency
      ? { 'Idempotency-Key': idempotencyKey ?? generateIdempotencyKey() }
      : {}),
  }

  let url = `${API_BASE}${API_VERSION}${path}`

  if (params) {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    if (query) url = `${url}?${query}`
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return undefined as T

  const json = await response.json()

  if (!response.ok) {
    const err = json as ApiError
    throw new ApiRequestError(err.error)
  }

  return json as T
}

// ── HTTP verb helpers ────────────────────────────────────────

export const api = {
  get<T>(path: string, params?: RequestOptions['params']): Promise<T> {
    return request<T>(path, { method: 'GET', params })
  },

  post<T>(path: string, body: unknown, opts?: Partial<RequestOptions>): Promise<T> {
    return request<T>(path, { method: 'POST', body, ...opts })
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PUT', body })
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body })
  },

  delete<T = void>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' })
  },
}

// ── Pagination helper ────────────────────────────────────────

export function paginationParams(opts: PaginationParams): Record<string, string | number> {
  const p: Record<string, string | number> = {
    limit: Math.min(opts.limit ?? 25, 100),
  }
  if (opts.cursor) p.cursor = opts.cursor
  return p
}

export type { PaginatedResponse, PaginationParams }
export { generateIdempotencyKey }
