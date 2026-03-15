# Event Lifecycle Workflow

This workflow describes how an organizer creates, updates, publishes, and unpublishes an event.

## Preconditions

- A valid `tenantId` exists.
- Caller is authorized to manage events for the tenant.

## Steps

1. **Create event in draft**
   - API command:
     - `POST /api/v1/tenants/:tenantId/events`
   - Purpose:
     - Creates the event aggregate and initializes agenda/settings.
2. **Review and update event details**
   - API command:
     - `PATCH /api/v1/tenants/:tenantId/events/:eventId`
   - Purpose:
     - Applies operational updates before launch (time, description, agenda, status metadata).
3. **Publish event for discovery**
   - API command:
     - `POST /api/v1/tenants/:tenantId/events/:eventId/publish`
   - Purpose:
     - Moves the event to a published state.
4. **Optional: unpublish event**
   - API command:
     - `POST /api/v1/tenants/:tenantId/events/:eventId/unpublish`
   - Purpose:
     - Returns the event to a non-public state.
5. **Optional: clone event for next cycle**
   - API command:
     - `POST /api/v1/tenants/:tenantId/events/:eventId/clone`
   - Purpose:
     - Seeds a new event from a prior event template.

## Commands (Domain/API)

- `CreateEvent`
- `UpdateEvent`
- `PublishEvent`
- `UnpublishEvent`
- `CloneEvent`

> In implementation, these map to the event service endpoints above.

## Emitted Events

- Topic: `event.lifecycle`
- Common event types in this flow:
  - `event.created`
  - `event.updated`
  - `event.status_changed`

## Primary Consumers

- Analytics projections
- Event dashboard read model
- Audit logging and compliance trail

## Operational Notes

- Event code must be unique per tenant.
- Publish/unpublish operations should be auditable.
- If Kafka is unavailable, lifecycle publication may be skipped, but write-path operations still complete.
