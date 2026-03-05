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
