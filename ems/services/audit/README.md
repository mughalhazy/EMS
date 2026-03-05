# Audit Service

Audit service persists immutable security-relevant change events for:

- authentication activity (`auth`)
- role and assignment changes (`role`)
- tenant-level configuration and state changes (`tenant`)

## API

- `trackAuthChange(input)`
- `trackRoleChange(input)`
- `trackTenantChange(input)`
- `listByTenant(tenantId, domain?)`

Each event records actor/target user references plus optional `before`, `after`, and `metadata` JSON payloads.
