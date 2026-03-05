# EMS Auth Service

NestJS auth module that provides:

- Tenant-scoped login using email/password.
- JWT access token issuance.
- Refresh token rotation + revocation persistence.
- RBAC resolution (roles + permissions) per user.
- Permission checks consumable by other services.

## Module API

- `AuthService.login()` authenticates a user and returns access/refresh token pair with resolved RBAC claims.
- `AuthService.refresh()` validates a refresh token, rotates it, and returns a new token pair.
- `AuthService.revokeRefreshToken()` explicitly revokes a refresh token.
- `AuthService.hasPermission()` checks tenant/user permission codes (e.g. `event:read`).

## Persistence

Auth module stores RBAC + session state in:

- `roles`
- `permissions`
- `role_permissions`
- `user_role_assignments`
- `refresh_tokens`

Migration: `src/migrations/1710000000001-CreateAuthTables.ts`

## User integration

`AuthModule` imports `UserModule` and uses `UserService` for tenant-scoped user lookup.
