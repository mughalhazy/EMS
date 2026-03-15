# Check-in Flow Workflow

This workflow describes onsite attendee check-in, session scans, and badge operations.

## Entities

- Tenant
- Event
- AttendeeProfile
- CheckInRecord
- CheckInDevice

## Owning Service

- Onsite Service

## Preconditions

- A valid `tenantId` and `eventId` exist.
- Attendee has valid registration/ticket status for onsite access.
- Scanning device is registered and active.

## Steps

1. **Register or activate scanning device**
   - API commands:
     - `POST /api/v1/tenants/{tenantId}/events/{eventId}/check-ins/devices`
     - `PATCH /api/v1/tenants/{tenantId}/events/{eventId}/check-ins/devices/{deviceId}/status`
2. **Monitor device status**
   - API command: `GET /api/v1/tenants/{tenantId}/events/{eventId}/check-ins/devices/monitoring`
3. **Check in attendee at venue entry**
   - API command: `POST /api/v1/tenants/{tenantId}/events/{eventId}/check-ins`
4. **Session-level scan check-in (optional)**
   - API command: `POST /api/v1/tenants/{tenantId}/events/{eventId}/check-ins/sessions/{sessionId}/scans`
5. **Validate badge eligibility (optional)**
   - API command: `POST /api/v1/tenants/{tenantId}/events/{eventId}/check-ins/badges/validate`
6. **Print badge (optional)**
   - API command: `POST /api/v1/tenants/{tenantId}/events/{eventId}/check-ins/badges/print`

## Commands (Domain/API)

- `RegisterScanningDevice`
- `UpdateScanningDeviceStatus`
- `CheckInAttendee`
- `ScanSessionCheckIn`
- `ValidateBadge`
- `PrintBadge`

## Emitted Events

- `OnsiteCheckinCompleted` (`onsite.checkin.completed`)
- `SessionAttendanceScanned` (`session.attendance_scanned`)
- `OnsiteAccessGranted` (`onsite.access.granted`)
- `OnsiteAccessDenied` (`onsite.access.denied`)
- `OnsiteBadgePrinted` (`onsite.badge.printed`)

## Primary Consumers

- Onsite dashboards
- Analytics Service
- Attendee profile/read-model consumers
