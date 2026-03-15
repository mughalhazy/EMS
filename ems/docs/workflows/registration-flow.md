# Registration Flow Workflow

This workflow describes attendee registration lifecycle after direct intake or commerce handoff.

## Entities

- Tenant
- Event
- Registration
- AttendeeProfile

## Owning Service

- Registration Service

## Preconditions

- A valid `tenantId` and `eventId` exist.
- User and ticket context are known.
- Caller sends an `Idempotency-Key` header for mutating requests.

## Steps

1. **Submit registration**
   - API command: `POST /api/v1/tenants/{tenantId}/registrations`
2. **List and review registrations**
   - API command: `GET /api/v1/tenants/{tenantId}/registrations`
3. **Amend registration ticket assignment**
   - API command: `PATCH /api/v1/tenants/{tenantId}/registrations/{registrationId}`
4. **Optional approval (when status is pending/waitlisted)**
   - API command: `POST /api/v1/tenants/{tenantId}/registrations/{registrationId}/approve`
5. **Optional cancellation**
   - API command: `POST /api/v1/tenants/{tenantId}/registrations/{registrationId}/cancel`

## Commands (Domain/API)

- `CreateRegistration`
- `UpdateRegistration`
- `ApproveRegistration`
- `CancelRegistration`

## Emitted Events

- `RegistrationStarted` (`registration.started`)
- `RegistrationConfirmed` (`registration.confirmed`)
- `RegistrationCancelled` (`registration.cancelled`)

## Primary Consumers

- Onsite Service
- Analytics Service
- Attendee profile/read-model consumers
