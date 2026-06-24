# Shared Utilities (`@ems/common`)

Shared library used by all 26 NestJS service modules and `apps/api`.
Registered as `@ems/common` path alias in the root `tsconfig.json`.

## Contents

| File | Purpose |
|---|---|
| `base.repository.ts` | `TenantScopedRepository<T>` — TypeORM base repository that automatically scopes all queries to the current tenant's `tenantId`. This is the "shared base repository" pattern (CA-004) that enforces multi-tenant data isolation. |
| `tenant-context.ts` | `TenantContext` — extracts and validates `tenantId` from the JWT claim on every request. |
| `jwt-auth.guard.ts` | `JwtAuthGuard` — global guard that validates the Bearer JWT on every protected route. |
| `permissions.guard.ts` | `PermissionsGuard` — RBAC guard; reads required permissions from `@RequirePermissions()` decorator and compares against the JWT `permissions` claim. |
| `permissions.decorator.ts` | `@RequirePermissions(...permissions)` — decorator applied to controller methods to declare required RBAC permissions. |
| `current-user.decorator.ts` | `@CurrentUser()` — parameter decorator that extracts the authenticated user from the request object. |
| `http-exception.filter.ts` | `HttpExceptionFilter` — global exception filter that maps NestJS `HttpException` to the standard error response envelope (see `docs/01_backend/ERROR_CONTRACT.md`). |
| `json-logger.service.ts` | `JsonLoggerService` — structured JSON logger; replaces the default NestJS console logger with machine-readable output. |
| `request-logger.middleware.ts` | `RequestLoggerMiddleware` — logs every incoming HTTP request with method, path, status, and duration. |
| `api-response.ts` | `ApiResponse<T>` — standard response wrapper: `{ success, data, error, meta }`. |
| `jwt-payload.interface.ts` | `JwtPayload` — TypeScript interface for the decoded JWT payload shape (`sub`, `tenantId`, `permissions`). |
| `index.ts` | Re-exports all of the above for clean import via `@ems/common`. |

## Authority

For architectural documentation of these patterns see:
- `docs/01_backend/BACKEND_ARCHITECTURE.md` — NestJS pipeline and guard configuration
- `docs/03_fullstack_contracts/AUTH_AND_TENANCY_CONTRACT.md` — auth flow and tenant isolation
- `docs/03_fullstack_contracts/USER_ROLES_AND_PERMISSIONS.md` — permission definitions
- `docs/01_backend/ERROR_CONTRACT.md` — error response envelope
