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

## Steps

1. **Submit registration**
   - API command: `POST /api/v1/tenants/{tenantId}/registrations`
2. **List and review registrations**
   - API command: `GET /api/v1/tenants/{tenantId}/registrations`
3. **Amend registration**
   - API command: `PATCH /api/v1/tenants/{tenantId}/registrations/{registrationId}`
4. **Optional cancellation**
   - API command: `POST /api/v1/tenants/{tenantId}/registrations/{registrationId}/cancel`
5. **Confirm registration**
   - System command: `ConfirmRegistration`

## Commands (Domain/API)

- `CreateRegistration`
- `UpdateRegistration`
- `CancelRegistration`
- `ConfirmRegistration` (internal/system driven)

## Emitted Events

- `RegistrationSubmitted`
- `RegistrationUpdated`
- `RegistrationApproved`
- `RegistrationCancelled`
- `RegistrationConfirmed`

## Primary Consumers

- Onsite Service
- Analytics Service
- Attendee profile/read-model consumers
