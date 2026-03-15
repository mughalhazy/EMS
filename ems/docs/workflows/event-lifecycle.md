# Event Lifecycle Workflow

This workflow describes how organizers create, update, publish, unpublish, and clone an event.

## Entities

- Tenant
- Event

## Owning Service

- Event Service

## Preconditions

- A valid `tenantId` exists.
- Caller is authorized to manage events for the tenant.

## Steps

1. **Create event in draft**
   - API command: `POST /api/v1/tenants/{tenantId}/events`
2. **Update event details**
   - API command: `PATCH /api/v1/tenants/{tenantId}/events/{eventId}`
3. **Publish event for discovery**
   - API command: `POST /api/v1/tenants/{tenantId}/events/{eventId}/publish`
4. **Optional: unpublish event**
   - API command: `POST /api/v1/tenants/{tenantId}/events/{eventId}/unpublish`
5. **Optional: clone event**
   - API command: `POST /api/v1/tenants/{tenantId}/events/{eventId}/clone`

## Commands (Domain/API)

- `CreateEvent`
- `UpdateEvent`
- `PublishEvent`
- `UnpublishEvent`
- `CloneEvent`

## Emitted Events

- `EventLifecycleChanged` (`event.lifecycle`) with `event_type` values: `event.created`, `event.updated`, `event.status_changed`
- `SessionLifecycleChanged` (`session.lifecycle`) for session create/update operations attached to events

## Primary Consumers

- Analytics Service
- Read model projections
- Audit/compliance systems
