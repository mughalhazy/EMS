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
