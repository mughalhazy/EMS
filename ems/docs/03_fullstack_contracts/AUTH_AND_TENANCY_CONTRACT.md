Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-17
Owner: AI

# Auth and Tenancy Contract

> Extracted from `services/auth/src/`, `infra/common/src/`,
> `services/rbac/src/`, and `services/tenant/src/`.
> This document is the single authoritative reference for how
> authentication, token handling, tenant context propagation,
> and row-level isolation work in the backend.

## 1. Authentication Flow

### Password Login

```
POST /v1/auth/login  { email, password }
  → AuthService.login()
  → Load User by email (auth.users)
  → Load UserCredential (auth.user_credentials)
  → bcrypt.compare(password, credential.passwordHash)  [BCRYPT_ROUNDS=12]
  → issueTokens(userId, tenantId, email, roles=[], permissions=[])
  → returns { accessToken, refreshToken, expiresIn: 900 }
```

**Security note**: `login()` passes `roles=[]` and `permissions=[]` to
`issueTokens()` — the JWT access token is issued with an empty permissions
claim. Actual permissions are stored in DB and checked by `PermissionsGuard`
on each request. This means the JWT itself does not enumerate permissions.

### JWT Access Token

| Field | Value |
|---|---|
| Algorithm | HS256 (via `@nestjs/jwt`) |
| Secret | `JWT_SECRET` env var |
| TTL | 900 seconds (15 minutes) |
| Payload | `JwtPayload { sub: string, tenantId: string, email: string, roles: string[], permissions: string[], iat?: number, exp?: number }` |

### Refresh Token

| Field | Value |
|---|---|
| Storage | `AuthSession` row in `auth.auth_sessions` (bcrypt-hashed `tokenHash`) |
| TTL | 7 days (`REFRESH_TTL_DAYS=7`) |
| Rotation | Each `POST /v1/auth/refresh` call issues a new access token; does NOT rotate the refresh token itself |
| Lookup | `refresh()` loads ALL `AuthSession` rows for the `userId` and bcrypt-compares each hash — O(n) performance risk on users with many sessions |

### SSO Login

```
POST /v1/auth/sso/callback  { connectionId, assertion, ... }
  → AuthService.ssoLogin()
  → Load SsoConnection by connectionId + tenantId
  → Validate assertion fields (signature verification NOT implemented — GAP-G6)
  → Find SsoIdentity by (connectionId, externalId) OR create new
  → Find-or-create User (auth.users)
  → issueTokens(...)
  → returns { accessToken, refreshToken }
```

---

## 2. JWT Payload Interface

```typescript
// infra/common/src/guards/jwt-auth.guard.ts
interface JwtPayload {
  sub: string;        // userId
  tenantId: string;   // tenant UUID
  email: string;
  roles: string[];    // role names (may be empty — see §1 security note)
  permissions: string[];  // permission codes (may be empty — see §1 security note)
  iat?: number;
  exp?: number;
}
```

The JWT is decoded by `JwtAuthGuard` (via `passport-jwt`) and attached to
`request.user` as the raw `JwtPayload` object.

---

## 3. Authentication Guards

### `JwtAuthGuard` (`infra/common/src/guards/jwt-auth.guard.ts`)

```typescript
class JwtAuthGuard extends AuthGuard('jwt')
```

- Validates Bearer token signature + expiry
- Sets `request.user = JwtPayload` on success
- Returns 401 on invalid/missing/expired token
- Applied at controller or method level with `@UseGuards(JwtAuthGuard)`
- Also applied globally in some controllers via class-level `@UseGuards(JwtAuthGuard)`

### `PermissionsGuard` (`infra/common/src/guards/permissions.guard.ts`)

```typescript
class PermissionsGuard implements CanActivate
```

- Reads `PERMISSIONS_KEY` metadata set by `@RequirePermissions(...codes)`
- Loads current user's permissions from DB (via `RbacService`) or from JWT
- Uses **AND logic** — all declared permission codes must be held
- Returns 403 if any required permission is missing
- Applied alongside `JwtAuthGuard` where fine-grained authorization is needed

---

## 4. Decorators

| Decorator | Source | Usage |
|---|---|---|
| `@CurrentUser(field?)` | `infra/common/src/decorators/current-user.decorator.ts` | Extracts `request.user` (full `JwtPayload`) or a specific field: `@CurrentUser('sub')` → userId |
| `@RequirePermissions(...codes)` | `infra/common/src/decorators/permissions.decorator.ts` | Sets metadata for `PermissionsGuard`; e.g. `@RequirePermissions('user:read', 'audit:read')` |
| `@GetTenant()` | `infra/common/src/decorators/tenant-context.ts` | Extracts `{ tenantId, userId, roles }` from request |

---

## 5. Tenant Isolation

> **CORRECTED 2026-06-17**: `TenantScopedRepository` exists in the codebase but is NOT used by any service. The description below reflects the intended design. Actual implementation uses manual `where: { tenantId }` filtering in each service.

### Actual Implementation (Code-Verified)

Every tenant-scoped entity has a `tenantId: string` column. All 26 services enforce tenant isolation by passing `tenantId` from the JWT into every query manually:

```typescript
// Typical pattern in every service — verified across payment, order, event, etc.
this.repository.findOne({ where: { id, tenantId } });
this.repository.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
```

There is **no shared base class** enforcing this — each service is responsible for including `tenantId` in every query. This is a **defense-in-depth gap** (missing the automatic enforcement the base class was designed to provide), but not currently exploitable since all inspected services include the filter manually.

### `TenantScopedRepository` (Unused Design Artifact)

```typescript
// infra/common/src/repositories/base.repository.ts
class TenantScopedRepository<T extends { tenantId: string }> extends Repository<T>
```

The class exists with `buildOutboxEntry()` helper. Zero services extend it. OCR-2 implementation could migrate services to use this base class as a defense-in-depth measure.

This is a **repository-layer** intended mechanism — not a Postgres RLS policy and not a middleware. Any path that bypasses `JwtAuthGuard` must handle tenant context manually (e.g. Kafka consumers operating on behalf of a tenant).

---

## 6. Multi-Tenant Data Isolation Model

| Layer | Mechanism | Enforced by |
|---|---|---|
| Network | None (single process) | N/A |
| HTTP | JWT `tenantId` claim | `JwtAuthGuard` |
| Database | `WHERE tenant_id = $1` on every query | Manual filter in each service (see §5 correction) |
| Kafka | `tenantId` in every event payload; Kafka key = `tenantId` | `EventBusService` |
| Redis | Key namespace includes `tenantId` (e.g. `idem:{tenantId}:{key}`) | `IdempotencyStore` |

There is **no Postgres RLS** (Row-Level Security) at the database level — all
isolation is application-layer.

---

## 7. Tenant Lifecycle

```
POST /v1/tenants  (tenant:write permission)
  → TenantService.create()
  → Creates Tenant only (NO TenantSettings created here)
  → Publishes tenant.created to Kafka
    → RbacService consumes tenant.created → seeds 8 default roles + 12 permissions

PUT /v1/tenants/:id/settings  (tenant:write permission)
  → TenantService.upsertSettings()
  → Creates TenantSettings on first call (upsert — idempotent)
  → Updates existing TenantSettings on subsequent calls
```

> **CORRECTED 2026-06-17**: TenantSettings is NOT created at tenant creation time. `TenantService.create()` creates only the `Tenant` row. `TenantSettings` is created lazily on the first `PUT /v1/tenants/:id/settings` call. Frontend must handle `GET /v1/tenants/:id/settings` returning 404 until settings have been saved at least once.

See `docs/03_fullstack_contracts/USER_ROLES_AND_PERMISSIONS.md` for the
seeded roles and permission matrix.

---

## 8. Session Management

| Operation | Mechanism |
|---|---|
| Create session | `AuthService.login()` / `AuthService.ssoLogin()` — stores `AuthSession` row |
| Validate session | `AuthService.refresh()` — loads all sessions for user, bcrypt-compares token hash |
| Destroy session | `AuthService.logout()` — deletes `AuthSession` row matching token |
| Session TTL | 7 days (`REFRESH_TTL_DAYS=7`), stored as `expiresAt` on `AuthSession` |

**Known risk**: `refresh()` does O(n) bcrypt comparisons across all sessions for
a user. High session count = high latency on token refresh.

---

## 9. Public Endpoints (no authentication)

| Endpoint | Reason |
|---|---|
| `POST /v1/auth/register` | New user registration |
| `POST /v1/auth/login` | Credential-based login |
| `POST /v1/auth/refresh` | Token refresh (validated by refresh token, not JWT) |
| `GET /v1/auth/sso/discover` | SSO config discovery for tenant |
| `POST /v1/auth/sso/callback` | SSO callback (assertion contains identity) |
| `GET /v1/health` | Liveness probe |
| `GET /v1/health/ready` | Readiness probe |

All other endpoints require a valid Bearer JWT.
