Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Security Discovery Report (Phase 2 Backend Authority Capture)

> Security findings discovered during systematic backend authority capture
> (Phase 2, 2026-06-15). No code changes were made. All findings are
> documentation only — remediation requires REQUIRES APPROVAL decisions
> per `07_governance/DECISION_ESCALATION_MATRIX.md`.
>
> Sources: all 26 service controller files, `services/auth/src/auth.service.ts`,
> `services/rbac/src/rbac.service.ts`, `infra/common/src/`, `infra/cache/src/`.

---

## CRITICAL Findings

### SEC-001: Authorization Coverage Gap — 20 of 26 Services Have No `@RequirePermissions`

- **Severity**: Critical
- **Evidence**: `@RequirePermissions` was verified only on `services/auth` (users + SSO),
  `services/tenant`, `services/rbac`, and `services/audit` controllers.
  The remaining 22 service controllers rely on `JwtAuthGuard` only —
  any authenticated user in the tenant can call any endpoint on those services.
- **Affected services**: event, agenda, speaker, exhibitor, attendee, registration,
  onsite, ticketing, pricing, inventory, order, payment, fulfillment, notification,
  analytics, search, networking, interactive-engagement, ai-service, integration
  (plus engagement which is a stub with no routes)
- **Impact**: An authenticated event attendee can potentially:
  - Cancel other attendees' orders
  - Modify ticket products or pricing rules
  - Read all networking connections
  - Access AI interaction logs for other users
  - Create or delete webhook subscriptions
  - View all audit records
- **Recommendation**: Perform full controller-level `@RequirePermissions` audit.
  Add appropriate permissions to every mutating endpoint (POST/PATCH/PUT/DELETE).
  Add read permissions to sensitive data endpoints. This is the highest-priority
  security remediation in the codebase.
- **Governance gap**: Existing 12 permission codes do not cover commerce, event,
  or engagement operations — new permission codes must be defined (REQUIRES APPROVAL).

---

## HIGH Findings

### SEC-002: JWT Issued with Empty Permissions Claim

- **Severity**: High
- **Evidence**: `services/auth/src/auth.service.ts` line ~80 (approximately):
  `issueTokens(userId, tenantId, email, roles=[], permissions=[])` — the
  `roles` and `permissions` arrays passed to `issueTokens()` are hardcoded empty
  arrays regardless of the user's actual roles/permissions.
- **Impact**: The JWT access token's `roles[]` and `permissions[]` claims are
  always empty. Any code that reads permissions from the JWT token (rather than
  the DB) will see no permissions. `PermissionsGuard` appears to load permissions
  from DB at request time — verify this is the case and that JWT claims are not
  used as the authoritative permission source.
- **Recommendation**: Either (a) load and populate actual permissions into JWT
  at issue time (with careful consideration for stale-JWT risk if roles change),
  or (b) document explicitly that JWT carries no permissions and all authorization
  checks must hit the DB via `RbacService`. Clarify the contract in
  `AUTH_AND_TENANCY_CONTRACT.md`.

### SEC-003: O(n) Refresh Token Validation — DoS via Session Count

- **Severity**: High (performance/availability)
- **Evidence**: `services/auth/src/auth.service.ts` `refresh()` method:
  loads ALL `AuthSession` rows for `userId` then bcrypt-compares each one until
  a match is found. `bcrypt.compare()` takes ~100ms per hash at ROUNDS=12.
- **Impact**: A user with 100 active sessions would take 10 seconds worst-case
  to validate a refresh. Under concurrent refresh requests this becomes a
  CPU exhaustion vector. An attacker who can create many sessions (or observe
  logout failures) can degrade the auth service.
- **Recommendation**: Store a fast index on `AuthSession` — e.g., hash the
  refresh token with SHA-256 for lookup, then bcrypt-verify only the matching
  candidate. Or enforce a maximum active session count per user.

---

## MEDIUM Findings

### SEC-004: Webhook Secret Has No Minimum Length Constraint

- **Severity**: Medium
- **Evidence**: `CreateWebhookSubscriptionDto`:
  ```typescript
  @IsString()
  secret: string;
  ```
  No `@MinLength()` decorator — an empty string `""` is accepted.
- **Impact**: Webhook subscriptions can be created with trivially weak secrets,
  undermining any future HMAC signing implementation. Even when HMAC is
  implemented (GAP-G6), a subscriber using `""` as their secret would have
  no protection.
- **Recommendation**: Add `@MinLength(16)` to `secret` field. Document minimum
  entropy requirements in `VALIDATION_RULES.md` and `DATA_SHAPE_REGISTRY.md`.

### SEC-005: `CreateTenantDto.plan` Missing `@IsOptional()`

- **Severity**: Medium (minor)
- **Evidence**: `CreateTenantDto`:
  ```typescript
  @IsString()
  plan: string;  // no @IsOptional()
  ```
  This makes `plan` required by `class-validator` but the field may be intended
  as optional (plans may have a default).
- **Impact**: Requests omitting `plan` will receive a 400 error even if the
  intent was for it to default. May cause friction for internal tooling or tests.
- **Recommendation**: Add `@IsOptional()` if `plan` should be optional, or
  document explicitly that it is required and set a default enum.

### SEC-006: Controller Path Collisions — Shared `/sessions` and `/users` Prefixes

- **Severity**: Medium
- **Evidence**: Two controllers declare `@Controller('sessions')`:
  - `services/agenda` `SessionController`
  - `services/speaker` `SessionController`
  Two controllers use `/users` as a base path:
  - `services/auth` `UsersController` — `/v1/users`
  - `services/rbac` `RbacController` — `/v1/users/:id/roles`
- **Impact**: In NestJS, when two modules register the same controller path,
  the last-registered module's controller takes precedence. The routing outcome
  depends on module load order in `app.module.ts`. The `agenda` + `speaker`
  `/sessions` conflict means one service's routes may shadow the other's,
  causing silent endpoint loss. The `/users` conflict in auth vs. rbac is less
  severe since rbac uses a nested path (`/users/:id/roles`), but exact path
  matching must be verified.
- **Recommendation**: Namespace conflicting prefixes — e.g., `agenda/sessions`
  vs. `speakers/sessions`, or use a unique prefix per service context. Verify
  in integration tests that both paths resolve correctly.

### SEC-007: SSO Assertion Signature Not Verified

- **Severity**: Medium (deferred hardening, already documented as GAP-G6)
- **Evidence**: `SsoController.ssoLogin()` accepts `SsoAssertionDto` and passes
  it to `AuthService.ssoLogin()`. The service reads `issuer` and `certificate`
  from `SsoConnection` but does not verify the assertion's cryptographic
  signature.
- **Impact**: A malicious actor who can craft a valid `SsoAssertionDto` structure
  (without a valid signature) could impersonate any user on an SSO-enabled tenant.
- **Recommendation**: Implement assertion signature verification before any
  production SSO deployment. Use `xmldom`/`xml-crypto` for SAML or the IdP's
  public key for OAuth2 JWT assertions.

### SEC-008: No Dead-Letter Queue for Kafka — Events Silently Lost on Failure

- **Severity**: Medium
- **Evidence**: `infra/event-bus/src/event-bus.service.ts` — on Kafka publish
  error: error is caught and logged; no DLQ, no retry queue.
- **Impact**: If Kafka is temporarily unavailable and all producer retries (10)
  are exhausted, the event is lost. This can cause:
  - Webhook fan-out skipped for a payment
  - Audit trail incomplete
  - Fulfillment not triggered after payment
- **Recommendation**: Implement a DLQ (dead-letter topic or Postgres-backed
  outbox with retry tracking). At minimum, increment a metric/alert on
  publish failure.

---

## LOW Findings

### SEC-009: `tenant:suspend` Permission Defined but Unused

- **Severity**: Low
- **Evidence**: `PLATFORM_PERMISSIONS` in `rbac.service.ts` includes
  `{ code: 'tenant:suspend', description: 'Suspend tenant' }`. No controller
  endpoint was found using `@RequirePermissions('tenant:suspend')`.
- **Impact**: The permission code exists, can be assigned to roles, but
  provides no actual gate. Either the endpoint that should use it is missing
  its guard, or the permission code is vestigial.
- **Recommendation**: Either add `@RequirePermissions('tenant:suspend')` to the
  tenant suspension/delete endpoint, or remove the permission code from
  `PLATFORM_PERMISSIONS`.

### SEC-010: No Rate Limiting on Auth Endpoints

- **Severity**: Low (infrastructure exists but application usage not verified)
- **Evidence**: `RateLimiterService` exists in `infra/cache` (sliding window
  via Redis). However, no `@UseInterceptors` or rate-limiting guard was observed
  applied to `POST /v1/auth/login`, `POST /v1/auth/register`, or
  `POST /v1/auth/refresh` in the auth controller code.
- **Impact**: Login endpoint is open to brute-force without rate limiting.
- **Recommendation**: Apply `RateLimiterService` to login + register endpoints.
  Use `rl:login:{email}` or `rl:login:{ip}` key patterns.

---

## Summary Table

| ID | Finding | Severity | Status |
|---|---|---|---|
| SEC-001 | 20/26 services lack `@RequirePermissions` | Critical | Open |
| SEC-002 | JWT issued with empty permissions/roles | High | Open |
| SEC-003 | O(n) bcrypt refresh token validation | High | Open |
| SEC-004 | Webhook secret has no minimum length | Medium | Open |
| SEC-005 | `CreateTenantDto.plan` missing `@IsOptional()` | Medium | Open |
| SEC-006 | Controller path collisions (`/sessions`, `/users`) | Medium | Open |
| SEC-007 | SSO assertion signature not verified | Medium | Open (GAP-G6) |
| SEC-008 | No DLQ — Kafka events silently lost on failure | Medium | Open |
| SEC-009 | `tenant:suspend` permission unused | Low | Open |
| SEC-010 | No rate limiting on auth endpoints | Low | Open |

**All findings are documentation only.** No code was modified.
All remediation requires REQUIRES APPROVAL per `07_governance/DECISION_ESCALATION_MATRIX.md`.
