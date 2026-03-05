# API Standards

API design and governance standards for EMS services.

## Scope and goals

These standards apply to all externally and internally consumed HTTP APIs in EMS. They aim to:

- Keep APIs predictable and easy to integrate.
- Reduce breaking changes.
- Improve security, observability, and operability.

## REST conventions

### Resource-oriented URLs

- Use nouns for resources, not verbs.
  - Good: `GET /employees/{employeeId}/assignments`
  - Avoid: `GET /getEmployeeAssignments`
- Use plural resource names (`/employees`, `/events`, `/facilities`).
- Nest only when there is a clear ownership relationship; avoid deep nesting (max 2 levels preferred).

### HTTP methods

- `GET`: Retrieve resource(s); must be safe and read-only.
- `POST`: Create a resource or trigger non-idempotent action.
- `PUT`: Replace a full resource representation.
- `PATCH`: Partially update resource fields.
- `DELETE`: Remove/deactivate a resource.

### Status codes

- `200 OK`: Successful read/update.
- `201 Created`: Resource created (include `Location` header).
- `202 Accepted`: Asynchronous operation accepted.
- `204 No Content`: Successful operation with no response body.
- `400 Bad Request`: Validation or malformed request.
- `401 Unauthorized`: Missing/invalid authentication.
- `403 Forbidden`: Authenticated but not authorized.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Version conflict/business rule conflict.
- `422 Unprocessable Entity`: Semantically invalid request.
- `429 Too Many Requests`: Rate limit exceeded.
- `5xx`: Server-side error.

### Naming and payload conventions

- Use `camelCase` JSON field names.
- Use ISO 8601 UTC timestamps (e.g., `2026-03-05T13:45:00Z`).
- IDs must be opaque strings (`id`, `employeeId`, etc.).
- Booleans should be positively named (`isActive`, `hasAccess`).
- Include `createdAt`, `updatedAt` on persistent resources when applicable.

## Versioning strategy

- Use URI major versioning: `/api/v1/...`, `/api/v2/...`.
- Increment **major** version for breaking changes.
- Additive, backward-compatible changes remain within the same major version.
- Deprecation policy:
  - Mark deprecated fields/endpoints in docs with migration notes.
  - Return `Deprecation` and/or `Sunset` headers when retirement is scheduled.
  - Provide at least 6 months overlap before removing a public endpoint (unless security critical).

## Error format

All non-2xx responses (except empty 401/403 when required by gateway) should return:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": [
      {
        "field": "email",
        "reason": "must be a valid email address"
      }
    ],
    "requestId": "req_01HV8Q..."
  }
}
```

Standards:

- `code`: Stable machine-readable code (`SCREAMING_SNAKE_CASE`).
- `message`: Human-readable summary safe to show users.
- `details`: Optional array for field-level or domain-specific issues.
- `requestId`: Correlation ID for support and tracing.
- Never leak stack traces, SQL, secrets, or internal topology.

## Pagination

List endpoints must paginate unless explicitly documented as bounded small sets.

### Cursor-based pagination (default)

Request:

- `GET /employees?limit=50&cursor=eyJpZCI6IjEyMyJ9`

Response:

```json
{
  "data": [ ... ],
  "page": {
    "nextCursor": "eyJpZCI6IjQ1NiJ9",
    "hasMore": true,
    "limit": 50
  }
}
```

Rules:

- Default `limit`: 25.
- Max `limit`: 100.
- Sort order must be deterministic and documented.
- `nextCursor` is opaque; clients must not parse it.

### Offset pagination (exception only)

Allowed only for administrative/reporting endpoints requiring page-number UX:

- `GET /audit-logs?offset=0&limit=50`

## Authentication

- All non-public endpoints require OAuth 2.0 Bearer JWT access tokens.
- Validate token signature, expiration, issuer, and audience.
- Enforce scopes/roles per endpoint (least privilege).
- Propagate user/service identity for auditability.
- Use HTTPS only; reject plain HTTP in production.

Recommended headers:

- `Authorization: Bearer <token>`
- `X-Request-Id: <client-generated-id>` (optional; server generates if absent)

## Rate limiting

- Apply per-client and/or per-token limits at the API gateway.
- Return `429 Too Many Requests` when exceeded.
- Include headers:
  - `RateLimit-Limit`
  - `RateLimit-Remaining`
  - `RateLimit-Reset`
  - Optional `Retry-After` (seconds)
- Support burst + sustained policies (token bucket/leaky bucket).
- Document endpoint-specific limits where materially different.

## Idempotency

### Idempotent methods

- `GET`, `PUT`, and `DELETE` must be idempotent by design.

### POST idempotency for create/charge/trigger endpoints

- Require `Idempotency-Key` header for non-idempotent `POST` operations that can be retried.
- Server stores key + request fingerprint + response for a bounded window (recommended: 24 hours).
- Replayed requests with same key and same payload return original response.
- Same key with different payload returns `409 Conflict`.

## Governance and review

- New endpoints and changes must pass API design review before implementation.
- OpenAPI specs must be updated with every API change.
- Changes to auth, error contracts, or versioning require architecture sign-off.

## QC-01 clarity addendum

### Tenant and idempotency requirements
- Every request must carry tenant context from a validated token and/or trusted routing metadata; clients must never self-assert arbitrary tenant IDs.
- Mutating endpoints for `order`, `payment`, and `registration` must require `Idempotency-Key` and return the original successful response for key replays.

### Canonical resource coverage
At minimum, versioned APIs must exist for:
- `/tenants`, `/organizations`, `/users`, `/roles`
- `/events`, `/venues`, `/sessions`, `/tickets`
- `/registrations`, `/attendees`
- `/sponsors`, `/exhibitors`
- `/orders`, `/payments`
- `/notifications`

### Security and AI-specific API rules
- Webhooks must use signature verification with timestamp tolerance and replay protection.
- AI endpoints must return structured output with provenance metadata (`citations`, `modelVersion`, `policyVersion`) when applicable.
- Any endpoint returning AI-generated recommendations must provide a deterministic fallback behavior when AI is unavailable.
