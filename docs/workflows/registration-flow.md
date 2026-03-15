# Registration Flow Workflow

This workflow describes attendee registration lifecycle after intake or commerce handoff.

## Preconditions

- A valid `tenantId` and `eventId` exist.
- User and ticket context are known.

## Steps

1. **Submit registration**
   - API command:
     - `POST /api/v1/tenants/:tenantId/registrations`
   - Purpose:
     - Creates a registration record for attendee + ticket context.
2. **List and review registrations**
   - API command:
     - `GET /api/v1/tenants/:tenantId/registrations`
   - Purpose:
     - Retrieves registrations by event, user, or status.
3. **Amend registration**
   - API command:
     - `PATCH /api/v1/tenants/:tenantId/registrations/:registrationId`
   - Purpose:
     - Applies valid changes (for example ticket reassignment).
4. **Optional cancellation**
   - API command:
     - `POST /api/v1/tenants/:tenantId/registrations/:registrationId/cancel`
   - Purpose:
     - Cancels a registration no longer valid for attendance.
5. **Confirm registration**
   - System command:
     - `ConfirmRegistration`
   - Purpose:
     - Marks registration as confirmed, often after successful payment.

## Commands (Domain/API)

- `CreateRegistration`
- `UpdateRegistration`
- `CancelRegistration`
- `ConfirmRegistration` (internal/system driven)

## Emitted Events

- Topic: `registration.created`
- Topic: `registration.confirmed`

## Primary Consumers

- Onsite check-in console
- Attendee profile projection
- Analytics registration metrics

## Operational Notes

- Registration writes are tenant-scoped and must enforce tenant isolation.
- Registration confirmation can be produced asynchronously from commerce payment completion.
