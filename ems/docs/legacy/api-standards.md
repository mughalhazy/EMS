> **Status: Retired (Partial).** §1–5, §7–9 superseded by
> `docs/01_backend/API_CONTRACT.md`, `ERROR_CONTRACT.md`, `VALIDATION_RULES.md`.
> §6 (rate limiting: 100/600 req/min Redis sliding window) and §10 (webhook
> HMAC signing + retry policy) remain **active design targets** — not yet
> implemented (see SEC-010, GAP-G6/GAP-B6). **Conflict**: §5 specifies
> cursor-based pagination (`?cursor=`); implemented API uses page-based
> pagination (`?page=`) — see DELTA-7 and `docs/08_reports/CONFLICT_ANALYSIS_REPORT.md` C-3.

# API Standards

> Source: V1 Packet 0 Prompt 5 — API Standards (initial conventions), refined by V2
> DOCS Phase 3 Prompt 8 — api standards (response envelope, idempotency headers,
> versioning rules — authoritative). Applies to every service under `services/`.

## 1. Versioning

- All routes are prefixed `/v1/...`. Breaking changes ship as `/v2/...` alongside
  the old version until deprecated (deprecation window: per tenant contract,
  minimum 90 days, announced via `notification`).
- Event payload versioning mirrors this: `order.paid` -> `order.paid.v2` (see
  `event-catalog.md` §10).

## 2. Routing Conventions

- Resource-oriented, plural nouns: `/v1/events/{eventId}/sessions`.
- Tenant scoping is implicit via JWT — never via URL path segment (no `/tenants/{id}/...`
  for tenant-scoped resources). Platform Admin cross-tenant routes live under
  `/v1/admin/...` and require the superuser guard (see `security-model.md`).
- Nesting is limited to 2 levels max; deeper relationships use query params
  (`/v1/sessions?eventId=...&trackId=...`).

## 3. Response Envelope

All responses use a consistent envelope:

```json
{
  "data": { },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-06-10T12:00:00Z"
  }
}
```

Errors:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": [
      { "field": "startAt", "issue": "must be before endAt" }
    ]
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-06-10T12:00:00Z"
  }
}
```

### Error Codes

| HTTP status | `error.code` | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | request payload failed schema validation |
| 401 | `UNAUTHENTICATED` | missing/invalid JWT |
| 403 | `FORBIDDEN` | RBAC denial or tenant isolation violation |
| 404 | `NOT_FOUND` | resource does not exist (or not visible to this tenant) |
| 409 | `CONFLICT` | state conflict (e.g., inventory oversold, duplicate registration) |
| 422 | `UNPROCESSABLE` | semantically invalid (e.g., event not in `published` state) |
| 429 | `RATE_LIMITED` | rate limit exceeded (see §6) |
| 500 | `INTERNAL_ERROR` | unhandled server error |

## 4. Pagination

- Cursor-based for all list endpoints: `?cursor=<opaque>&limit=50` (default 20, max 100).
- Response `meta` includes `nextCursor` (nullable) and, where cheap to compute, `total`.

```json
{
  "data": [ ],
  "meta": { "requestId": "...", "timestamp": "...", "nextCursor": "...", "total": 412 }
}
```

## 5. Authentication & Authorization

- Bearer JWT (`Authorization: Bearer <token>`) issued by `auth` (access token,
  short-lived) plus refresh token (httpOnly cookie or secure storage, see
  `services/auth/README.md`).
- JWT claims: `sub` (user id), `tenant_id`, `roles[]`.
- Every controller method declares required permission(s) via decorator; enforced
  by the `rbac` guard. See `security-model.md` for the permission catalog.

## 6. Rate Limiting

- Redis-backed (`infra/cache`), sliding window per `tenant_id` + route group.
- Default: 100 req/min per tenant per service for write endpoints, 600 req/min for
  read endpoints. Public endpoints (`/v1/events/public/*`) are limited per-IP as well.
- `429` responses include `Retry-After` header.

## 7. Idempotency

- All `POST`/`PATCH` endpoints that create or mutate financial or inventory state
  (orders, payments, registrations, inventory reservations) require an
  `Idempotency-Key` header.
- The owning service stores `(tenant_id, idempotency_key) -> response` in Redis
  (TTL 24h, `infra/cache`) and replays the original response for duplicate keys
  instead of re-executing the mutation.
- Kafka consumers apply the same principle using `event_id` (see `event-catalog.md`).

## 8. Filtering & Sorting

- Filtering: `?status=published&startAt[gte]=2026-01-01`.
- Sorting: `?sort=startAt:asc,name:desc`.
- Only fields explicitly documented per-endpoint are filterable/sortable
  (enforced via DTO whitelist, prevents accidental full-table scans).

## 9. Validation

- Request DTOs validated via `class-validator` at the controller boundary;
  validation failures return `400 VALIDATION_ERROR` with per-field `details`.
- Tenant-scoped uniqueness constraints (e.g., event slug) are validated at the
  service layer and return `409 CONFLICT` on violation.

## 10. Webhooks (Integration service)

- Outbound webhooks (per `services/integration`) sign payloads with HMAC-SHA256
  using a per-tenant secret (header `X-EMS-Signature`).
- Payload shape mirrors the internal event envelope (`event_type`, `tenant_id`,
  `occurred_at`, `payload`).
- Retries: exponential backoff, max 5 attempts, dead-letter after exhaustion
  (logged to `AuditLog`).
