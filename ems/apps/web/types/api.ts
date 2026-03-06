// ============================================================
// EMS API Response Types
// Mapped from ems/docs/api-standards.md
// ============================================================

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Array<{ field: string; reason: string }>
    requestId: string
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  page: {
    nextCursor: string | null
    hasMore: boolean
    limit: number
  }
}

export interface PaginationParams {
  limit?: number
  cursor?: string
}

export class ApiRequestError extends Error {
  code: string
  requestId: string
  details?: Array<{ field: string; reason: string }>

  constructor(error: ApiError['error']) {
    super(error.message)
    this.code = error.code
    this.requestId = error.requestId
    this.details = error.details
    this.name = 'ApiRequestError'
  }
}
