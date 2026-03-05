# Auth RBAC + Credential Security Models

This directory contains the RBAC model and core credential security flow for EMS Auth.

## RBAC Tables

- `role`: tenant-scoped role definitions (e.g., `tenant_admin`, `operator`).
- `permission`: resource-action permissions (e.g., `event:read`, `user:invite`).
- `role_permission`: many-to-many relation between roles and permissions.
- `user_role_assignment`: assigns roles to users with optional scope bindings.

## Credential Security Tables

- `auth_credentials`: stores bcrypt password hashes and password change timestamp.
- `auth_tokens`: stores one-time hashed tokens for password reset and email verification.
- `auth_user_state`: stores user-level auth state like email verification status.

## Flows

### Password security
1. `AuthService.upsertPassword` enforces minimum password length.
2. Passwords are hashed with bcrypt (`12` rounds).
3. Plaintext passwords are never stored.

### Reset flow
1. `AuthService.issuePasswordReset` creates a random reset token.
2. Only a SHA-256 hash of the token is persisted.
3. `AuthService.resetPassword` validates and consumes the one-time token, then updates bcrypt hash.

### Email verification
1. `AuthService.issueEmailVerification` creates a one-time verification token.
2. `AuthService.verifyEmail` validates the token and marks `email_verified=true`.
3. Verification timestamps are stored in `auth_user_state.email_verified_at`.

## Relations

```text
users (1) ─────< auth_credentials
users (1) ─────< auth_tokens
users (1) ─────< auth_user_state

role ─────< role_permission >───── permission
  │
  └────────< user_role_assignment
```

## Authorization guards

The schema defines SQL guard functions for RBAC checks:

- `auth_current_tenant_id()`: reads the request tenant from `app.current_tenant_id`.
- `auth_current_user_id()`: reads the request user from `app.current_user_id`.
- `auth_has_permission(permission_code, requested_scope_type, requested_scope_id)`: boolean permission check scoped to current tenant and user.
- `auth_require_permission(permission_code, requested_scope_type, requested_scope_id)`: raises `42501` when a permission check fails.

Applications should set these settings at transaction start:

```sql
SET LOCAL app.current_tenant_id = '<tenant-id>';
SET LOCAL app.current_user_id = '<user-id>';
```

## Tenant isolation

Row-level security policies are enabled for tenant-scoped tables:

- `role`
- `user_role_assignment`
- `role_permission` (through role ownership)

These policies enforce that reads/writes are limited to the current tenant.
