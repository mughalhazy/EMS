# Auth RBAC Models

This directory contains the RBAC data model for EMS Auth.

## Tables

- `role`: tenant-scoped role definitions (e.g., `tenant_admin`, `operator`).
- `permission`: resource-action permissions (e.g., `event:read`, `user:invite`).
- `role_permission`: many-to-many relation between roles and permissions.
- `user_role_assignment`: assigns roles to users with optional scope bindings.

## Relations

- `role (1) -> (N) role_permission`
- `permission (1) -> (N) role_permission`
- `role (1) -> (N) user_role_assignment`

```text
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
