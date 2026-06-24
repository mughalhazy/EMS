Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Error Contract

> Extracted from `infra/common/src/filters/global-exception.filter.ts` and
> `infra/common/src/api-response/api-response.ts`.
> This contract is enforced globally — the filter is registered in `apps/api/src/main.ts`
> with `app.useGlobalFilters(new GlobalExceptionFilter())`.

## 1. Response Envelope

Every API response (success and error) uses the same outer envelope:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorResponse;
  meta?: PaginationMeta;
}

interface ApiErrorResponse {
  code: string;        // EMS error code (see §2)
  message: string;     // Human-readable description
  details?: unknown;   // Optional: validation errors, nested info
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

Helpers from `infra/common/src/api-response/api-response.ts`:

| Helper | Returns |
|---|---|
| `ok(data, meta?)` | `{ success: true, data, meta? }` |
| `paginated(data, meta)` | `{ success: true, data, meta }` |
| `error(code, message, details?)` | `{ success: false, error: { code, message, details? } }` |

## 2. EMS Error Codes

`GlobalExceptionFilter` maps HTTP status codes to EMS-specific error codes:

| HTTP Status | EMS Code | When thrown |
|---|---|---|
| 400 | `EMS_VALIDATION_ERROR` | `ValidationPipe` rejection, `BadRequestException` |
| 401 | `EMS_UNAUTHORIZED` | JWT missing/invalid, `UnauthorizedException` |
| 403 | `EMS_FORBIDDEN` | Permission check failed, `ForbiddenException` |
| 404 | `EMS_NOT_FOUND` | Entity not found, `NotFoundException` |
| 409 | `EMS_CONFLICT` | Duplicate key, idempotency replay, `ConflictException` |
| 422 | `EMS_UNPROCESSABLE` | Business rule violation (e.g. capacity exceeded) |
| 500 | `EMS_INTERNAL_ERROR` | Any unhandled exception |

All other HTTP status codes fall through to `EMS_INTERNAL_ERROR`.

## 3. Filter Behaviour

```
@Catch() — catches ALL exceptions (HTTP and non-HTTP)
  ↓
If exception is HttpException → extract status + message
If exception is anything else → status = 500, message = 'Internal server error'
  ↓
Build ApiErrorResponse { code: <EMS code from map>, message }
  ↓
If status === 400 and exception has response.message[] → set details = response.message[]
  (includes class-validator's per-field error array)
  ↓
res.status(status).json({ success: false, error: { code, message, details? } })
```

Logging: `GlobalExceptionFilter` logs every exception at `error` level via
`JsonLogger`, including `requestId` (from `x-request-id` header propagated by
`RequestLoggerMiddleware`).

## 4. Validation Errors (400 response body)

When `ValidationPipe` rejects a request, the 400 body includes the
`class-validator` error array in `error.details`:

```json
{
  "success": false,
  "error": {
    "code": "EMS_VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      "email must be an email",
      "name should not be empty"
    ]
  }
}
```

## 5. Health Endpoints (not error-filtered)

Health endpoints return plain status objects and are NOT wrapped in the
`ApiResponse` envelope (they bypass the filter by returning before any exception
is thrown):

| Endpoint | Status 200 | Status 503 |
|---|---|---|
| `GET /v1/health` | `{ status: 'ok' }` | — |
| `GET /v1/health/ready` | `{ status: 'ok', checks: { db: true, redis: true, kafka: true } }` | `{ status: 'error', checks: { db: bool, redis: bool, kafka: bool } }` |

## 6. Idempotency-Key Conflict (409)

When an `Idempotency-Key` header is re-used and a record for `idem:{tenantId}:{key}`
already exists in `IdempotencyStore` (TTL 24 h), the service returns:

```json
{
  "success": false,
  "error": {
    "code": "EMS_CONFLICT",
    "message": "Duplicate request — idempotency key already processed"
  }
}
```

## 7. Frontend Consumption Contract

Frontends (Phase E) MUST:

1. Check `response.success` before accessing `response.data`
2. Display `response.error.message` in the UI on failure
3. Use `response.error.code` for programmatic branching (e.g. redirect to login on `EMS_UNAUTHORIZED`)
4. Display `response.error.details[]` inline on forms when `code === 'EMS_VALIDATION_ERROR'`
5. Track `x-request-id` response header for support tracing
