# Check-in Flow Workflow

This workflow describes onsite attendee check-in, session scan check-ins, and badge operations.

## Preconditions

- A valid `tenantId` and `eventId` exist.
- Attendee has valid registration/ticket status for onsite access.
- Scanning device is registered and active.

## Steps

1. **Register or activate scanning device**
   - API commands:
     - `POST /api/v1/tenants/:tenantId/events/:eventId/check-ins/devices`
     - `PATCH /api/v1/tenants/:tenantId/events/:eventId/check-ins/devices/:deviceId/status`
   - Purpose:
     - Ensures onsite hardware is recognized and in service.
2. **Monitor device status**
   - API command:
     - `GET /api/v1/tenants/:tenantId/events/:eventId/check-ins/devices/monitoring`
   - Purpose:
     - Provides health/operational visibility for check-in stations.
3. **Check in attendee at venue entry**
   - API command:
     - `POST /api/v1/tenants/:tenantId/events/:eventId/check-ins`
   - Purpose:
     - Records attendee entry and operational metadata (device, timestamp).
4. **Session-level scan check-in (optional)**
   - API command:
     - `POST /api/v1/tenants/:tenantId/events/:eventId/check-ins/sessions/:sessionId/scans`
   - Purpose:
     - Records attendance for a specific session.
5. **Print badge (optional)**
   - API command:
     - `POST /api/v1/tenants/:tenantId/events/:eventId/check-ins/badges/print`
   - Purpose:
     - Produces badge artifact tied to attendee/event.

## Commands (Domain/API)

- `RegisterScanningDevice`
- `UpdateScanningDeviceStatus`
- `CheckInAttendee`
- `ScanSessionCheckIn`
- `PrintBadge`

## Emitted Events

- Topic: `attendee.checked_in`
- Topic: `session.attended`

## Primary Consumers

- Onsite operations dashboards
- Analytics metrics service
- Attendee profile/check-in read models

## Operational Notes

- Check-ins should be idempotent or duplicate-protected at the service layer.
- Device telemetry is critical for incident response during peak entry windows.
