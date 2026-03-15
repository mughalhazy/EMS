# Auth RBAC + Credential Security Models

This directory contains the RBAC model and core credential security flow for EMS Auth.

## RBAC Tables

## Module API

### `RbacService`
- `createPermission(input)`: creates a permission code (`resource.action` style supported).
- `listPermissions()`: returns all permission definitions.
- `createRole(input)`: creates a tenant role and optionally binds permissions.
- `listRoles(tenantId)`: lists tenant roles with attached permissions.
- `setRolePermissions(tenantId, roleId, permissionIds)`: replaces a role's permission set.
- `assignRoleToUser(input)`: creates/updates an active role assignment for a user.
- `revokeRoleAssignment(tenantId, assignmentId)`: revokes an assignment without deleting history.
- `getUserRbac(tenantId, userId)`: resolves effective roles and permissions.
- `userHasPermission(tenantId, userId, permissionCode)`: convenience permission check.
- `upsertTenantAnalyticsAccessPolicy(input)`: configures tenant-level analytics controls (enablement, cross-event access, PII access).
- `getTenantAnalyticsAccessPolicy(tenantId)`: returns effective analytics policy for a tenant.

## Credential Security Tables

- `auth_credentials`: stores bcrypt password hashes and password change timestamp.
- `auth_tokens`: stores one-time hashed tokens for password reset and email verification.
- `auth_user_state`: stores user-level auth state like email verification status.

## SSO Tables

- `auth_sso_providers`: tenant-scoped SSO provider configuration for OAuth2 and SAML.
- `auth_federated_identities`: mapping between external IdP subject and EMS users.

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

### SSO sign-in (OAuth2 and SAML)
1. `AuthService.upsertSsoProvider` stores per-tenant provider settings (type, slug, configuration).
2. `AuthService.signInWithFederatedIdentity` resolves provider + subject mapping.
3. Existing federated identities are reused and user `last_login_at` is updated.
4. New identities can link to an existing tenant user by email, or JIT provision a user when enabled.

## Relations

```text
users (1) ─────< auth_credentials
users (1) ─────< auth_tokens
users (1) ─────< auth_user_state

roles ─────< role_permissions >───── permissions
   │
   └────────< user_role_assignments
```

## Authorization guards

The schema defines SQL guard functions for RBAC checks:

- `auth_current_tenant_id()`: reads the request tenant from `app.current_tenant_id`.
- `auth_current_user_id()`: reads the request user from `app.current_user_id`.
- `auth_has_permission(permission_code, requested_scope_type, requested_scope_id)`: boolean permission check scoped to current tenant and user.
- `auth_require_permission(permission_code, requested_scope_type, requested_scope_id)`: raises `42501` when a permission check fails.
- `auth_has_tenant_analytics_access(requested_scope_type, requested_scope_id, requires_pii, requires_cross_event)`: tenant-aware analytics gate that combines RBAC with tenant policy.
- `auth_require_tenant_analytics_access(requested_scope_type, requested_scope_id, requires_pii, requires_cross_event)`: raises `42501` when analytics access is not allowed.

Applications should set these settings at transaction start:

```sql
SET LOCAL app.current_tenant_id = '<tenant-id>';
SET LOCAL app.current_user_id = '<user-id>';
```

## Tenant isolation

Row-level security policies are enabled for tenant-scoped tables:

- `roles`
- `user_role_assignments`
- `role_permissions` (through role ownership)
- `tenant_analytics_access_policies`

These policies enforce that reads/writes are limited to the current tenant.

## Tenant-level analytics controls

`tenant_analytics_access_policies` adds a second authorization layer for analytics workloads:

- `analytics_enabled` is the tenant master switch for analytics access.
- `allow_cross_event_reporting` controls whether a tenant can run portfolio-style reporting across events.
- `allow_pii_access` controls whether analytics queries that require PII are permitted.

Analytics endpoints should call `auth_require_tenant_analytics_access(...)` to enforce tenant policy + RBAC in one guard.


## Secrets management integration placeholder

`JwtTokenService` now reads signing material through `SecretsProviderService`, which currently resolves from environment variables and provides a stub interface for a managed secret-store backend.

### Placeholder environment flags
- `SECRETS_BACKEND`: currently supports `env` only. Non-`env` values log a warning and fall back to env resolution.
- `JWT_SECRET`: JWT signing secret (still required until a managed backend is implemented).

### Next integration step
- Replace `SecretsProviderService.getSecret(...)` with provider-specific lookups (AWS Secrets Manager / Vault / GCP Secret Manager) while keeping the same call site contract.

## Auth module capabilities

- JWT access token issuance and validation via `JwtTokenService`.
- Login/logout flows with revocable refresh-token-backed sessions.
- Password reset token issuance and confirmation.
- Refresh-token rotation via `/auth/refresh`.

## Auth entities

- `UserCredentialEntity` (legacy export alias: `AuthCredentialEntity`) for credential storage.
- `AuthSessionEntity` (legacy export alias: `RefreshTokenEntity`) for refresh-token-backed auth sessions.

## Auth endpoints

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/password-reset/request`
- `POST /auth/password-reset/confirm`
