Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-17
Owner: AI

# User Roles and Permissions

> Extracted from `services/rbac/src/rbac.service.ts` (verified).
> This document is the authoritative source for all permission codes and
> default role definitions. Do not invent permissions or roles not listed here.

## 1. Permission Codes (12 total)

```typescript
const PLATFORM_PERMISSIONS = [
  { code: 'user:read',     description: 'View users' },
  { code: 'user:write',    description: 'Create/update users' },
  { code: 'user:delete',   description: 'Delete users' },
  { code: 'tenant:read',   description: 'View tenant details' },
  { code: 'tenant:write',  description: 'Create/update tenant' },
  { code: 'tenant:suspend', description: 'Suspend tenant' },
  { code: 'sso:manage',    description: 'Manage SSO connections' },
  { code: 'role:read',     description: 'View roles' },
  { code: 'role:write',    description: 'Create/update roles' },
  { code: 'role:assign',   description: 'Assign roles to users' },
  { code: 'role:revoke',   description: 'Revoke roles from users' },
  { code: 'audit:read',    description: 'View audit logs' },
];
```

**Important**: These 12 codes cover only the `auth`, `tenant`, `rbac`, and
`audit` service controllers. All other 22 service controllers have not been
verified to use `@RequirePermissions` — they may rely on `JwtAuthGuard` only
(see GAP-G5 and security finding SEC-001 in `08_reports/SECURITY_DISCOVERY_REPORT.md`).

---

## 2. Default Roles (8 per tenant)

> **CORRECTED (Phase 3.25 — 2026-06-17):** Role names and permission assignments
> updated to match actual `rbac.service.ts` `seedDefaultRoles()` implementation.
> Prior entries used design-phase names that never matched the code.

Seeded by `RbacService` upon consuming the `tenant.created` Kafka event
(consumer group: `rbac-service`).

| Role | Permissions Granted |
|---|---|
| `tenant_admin` | All 12 permissions |
| `organizer` | `user:read`, `role:read` |
| `finance` | `audit:read` |
| `support` | `user:read`, `audit:read` |
| `exhibitor` | (no platform permissions) |
| `speaker` | (no platform permissions) |
| `onsite_staff` | (no platform permissions) |
| `attendee` | (no platform permissions) |

Notes:
- `tenant_admin` is the per-tenant super-admin; has all 12 platform permissions.
- `organizer`, `finance`, `support` have only governance permissions (user/role/audit).
  Domain permissions (event:manage, commerce:manage, etc.) are recommended via OCR-2
  but not yet applied to controllers.
- `exhibitor`, `speaker`, `onsite_staff`, `attendee` have zero platform permission codes.
  Access to their own data is gated by `JwtAuthGuard` + tenant scoping only.
- `tenant:suspend` permission exists but is **not used by any endpoint** — undefined authority boundary.
- No `platform_admin` role exists in code — the 9th role referenced in legacy docs is not implemented.
  Cross-tenant administration is a future architectural decision.

---

## 3. Role Assignment Lifecycle

```
user.registered event published by services/auth
  → RbacService consumes user.registered
  → Assigns 'Attendee' role to new user automatically
  → User can later be granted additional roles via POST /v1/users/:id/roles
```

Role assignment requires `role:assign` permission (verified in
`services/rbac/src/rbac.controller.ts`).
Role revocation requires `role:revoke` permission.

---

## 4. RBAC API

| Method | Path | Permission | Description |
|---|---|---|---|
| `POST` | `/v1/roles` | `role:write` | Create custom role |
| `GET` | `/v1/roles` | `role:read` | List all roles for tenant |
| `GET` | `/v1/roles/:id` | `role:read` | Get role detail |
| `PATCH` | `/v1/roles/:id` | `role:write` | Update role |
| `DELETE` | `/v1/roles/:id` | `role:write` | Delete role |
| `POST` | `/v1/users/:id/roles` | `role:assign` | Assign role to user |
| `DELETE` | `/v1/users/:id/roles/:roleId` | `role:revoke` | Revoke role from user |

---

## 5. Authorization Check Flow

```
Request arrives with Bearer JWT
  → JwtAuthGuard validates token (signature, expiry)
  → If endpoint has @RequirePermissions(...codes):
      PermissionsGuard runs
      → Loads user's current permissions from DB (RbacService)
      → Checks ALL required codes are present (AND logic)
      → 403 if any code is missing
  → If endpoint has @UseGuards(JwtAuthGuard) only (no @RequirePermissions):
      Any authenticated user in the correct tenant can access the endpoint
      → This applies to 21 of 26 service controllers (unverified)
```

---

## 6. Permission Coverage Matrix

| Service | Endpoints Verified | `@RequirePermissions` Used | Permissions |
|---|---|---|---|
| auth (users) | Yes | Yes | `user:read`, `user:write`, `user:delete` |
| auth (SSO) | Yes | Yes | `sso:manage` |
| tenant | Yes | Yes | `tenant:read`, `tenant:write`, `tenant:suspend` |
| rbac | Yes | Yes | `role:read`, `role:write`, `role:assign`, `role:revoke` |
| audit | Yes | Yes | `audit:read` |
| event | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| agenda | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| speaker | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| exhibitor | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| attendee | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| registration | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| onsite | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| ticketing | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| pricing | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| inventory | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| order | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| payment | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| fulfillment | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| notification | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| engagement | Yes | Stub — no routes (dead code) | N/A — OCR-1 pending removal |
| analytics | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| search | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| networking | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| interactive-engagement | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| ai-service | Yes | No — `JwtAuthGuard` only | None (authentication only) |
| integration | Yes | No — `JwtAuthGuard` only | None (authentication only) |

See GAP-G5 in `08_reports/ARCHITECTURAL_GAP_REGISTER.md` and
SEC-001 in `08_reports/SECURITY_DISCOVERY_REPORT.md`.

---

## 7. Known Issues and Gaps

| ID | Issue | Severity |
|---|---|---|
| SEC-001 | 20 of 26 service controllers have no `@RequirePermissions` — any authenticated user can call them | Critical |
| SEC-002 | `issueTokens()` called with `roles=[]`, `permissions=[]` — JWT has empty permission claims | High |
| SEC-003 | `refresh()` loads ALL AuthSessions for user and bcrypt-compares each — O(n) on session count | Medium |
| GAP-G5 | Permission model for 22/26 services is unverified | Medium |
| Unused | `tenant:suspend` permission code defined but no endpoint uses it | Low |
