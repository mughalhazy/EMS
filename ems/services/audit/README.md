# Audit Service

Audit service persists immutable security-relevant change events for:

- user actions (default category: `user_action`)
- entity changes (category: `entity_change`)
- security events (category: `security_event`)

Supported domains include `auth`, `role`, `tenant`, `event`, `commerce`, `registration`, and `onsite`.

## API

- `trackAuthChange(input)`
- `trackRoleChange(input)`
- `trackTenantChange(input)`
- `listByTenant({ tenantId, domain?, category? })`

Each event records actor/target user references plus optional `before`, `after`, and `metadata` JSON payloads.

Each event supports optional classification metadata: `category`, `severity`, `entityType`, and `entityId`.
