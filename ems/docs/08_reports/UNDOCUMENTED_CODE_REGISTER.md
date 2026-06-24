Status: Active
Authority Level: Medium
Last Reviewed: 2026-06-17
Owner: AI

# Undocumented Code Register

> Produced by: Pre-Frontend Doc-to-Code Delta Audit, 2026-06-17.
> Lists code elements discovered in the repository that were absent from all
> prior documentation passes. These are real, implemented things that the
> frontend or future AI sessions need to know about.

## UCR-1: Analytics ViewEntities (2 views)

- **What**: Two `@ViewEntity` TypeORM classes in `services/analytics/src/entities/`:
  - `AttendanceMetrics` — view over `analytics.attendance_metrics`
  - `EventDashboardView` — view over `analytics.event_dashboard_view`
- **Prior documentation**: Prior docs had analytics schema marked TBD with no entities listed.
- **Impact**: Frontend analytics dashboard must query view-backed endpoints, not raw table endpoints.
- **Fixed in**: `DATABASE_SCHEMA.md`, `SERVICE_CATALOG.md` (2026-06-17)

---

## UCR-2: `Organization` Entity in `tenant` Service

- **What**: `services/tenant/src/entities/organization.entity.ts` — `Organization` entity
  in the `tenant` schema, not documented in any canon or authority doc.
- **Prior documentation**: Only `Tenant` and `TenantSettings` were documented.
- **Impact**: `Organization` may represent a billing entity, a parent org for multi-tenant
  hierarchies, or a company profile. Frontend organization management UI needs this.
- **Resolution**: Entity name added to `SERVICE_CATALOG.md`. Column details not yet
  extracted — see UC recommendation.
- **Recommended action**: Read `services/tenant/src/entities/organization.entity.ts` to
  extract column schema.

---

## UCR-3: `SessionSpeaker` Junction Entity

- **What**: `services/speaker/src/entities/session-speaker.entity.ts` — explicit junction
  entity (not just @ManyToMany) for speaker-to-session assignment.
- **Prior documentation**: Canon docs assumed TypeORM junction table; separate entity not mentioned.
- **Impact**: Frontend speaker-session assignment API may need to POST to a separate
  `/session-speakers` endpoint rather than patching the session or speaker directly.
- **Recommended action**: Read the entity and `SpeakerController` to confirm whether there's
  a dedicated assignment endpoint.

---

## UCR-4: `AttendeeTag` Entity

- **What**: `services/attendee/src/entities/attendee-tag.entity.ts` — tagging entity
  for attendees; not in any canon doc.
- **Prior documentation**: Only `Attendee` and `AttendeeProfile` documented.
- **Impact**: Frontend attendee management UI may need tag assignment controls. Tags may
  also be used for audience segmentation in `notification`/`Campaign`.
- **Recommended action**: Read entity to confirm columns and whether tags are user-managed
  or system-assigned.

---

## UCR-5: `Lead` Entity in `exhibitor` Service

- **What**: `services/exhibitor/src/entities/lead.entity.ts` — lead capture entity;
  not in canon docs.
- **Prior documentation**: Only `Exhibitor`, `Booth`, `SponsorPackage`, `Sponsor` documented.
- **Impact**: Frontend exhibitor portal needs a lead list view. `LeadController (/leads)`
  is implemented and publishes `lead.captured` events.
- **Recommended action**: Read entity to extract columns for DATA_SHAPE_REGISTRY.md update.

---

## UCR-6: `SponsorPackage` Entity in `exhibitor` Service

- **What**: `services/exhibitor/src/entities/sponsor-package.entity.ts` — sponsor tier
  packages (e.g., Gold, Platinum); not in canon docs.
- **Prior documentation**: `Sponsor` entity noted but `SponsorPackage` not documented.
- **Impact**: Frontend sponsorship management UI needs package tier configuration.
- **Recommended action**: Read entity for column schema.

---

## UCR-7: `TicketEntitlement` Entity in `ticketing` Service

- **What**: `services/ticketing/src/entities/ticket-entitlement.entity.ts` — entitlement
  grants from a ticket (e.g., session access, meal plan). Not in canon docs.
- **Prior documentation**: Only `TicketProduct` and `Ticket` documented.
- **Impact**: Frontend session capacity management and access control depend on entitlements.
- **Recommended action**: Read entity and check whether `RegistrationController` uses entitlements
  for access control or just session capacity.

---

## UCR-8: `PaymentTransaction` Entity in `payment` Service

- **What**: `services/payment/src/entities/payment-transaction.entity.ts` — low-level
  transaction record (likely stripe charge ID, gateway response). Not in canon docs.
- **Prior documentation**: Only `Payment` and `Refund` documented.
- **Impact**: Frontend payment history and refund UI may need to show transaction-level detail.
- **Recommended action**: Read entity for column schema.

---

## UCR-9: `AudienceSegment` Entity in `notification` Service

- **What**: `services/notification/src/entities/audience-segment.entity.ts` — audience
  definition for campaigns.
- **Prior documentation**: Mentioned as belonging to `engagement` in GAP-G3 but actually
  implemented in `notification`.
- **Impact**: Frontend campaign builder needs segment creation UI. `AudienceSegment`
  defines which attendees receive a given campaign.
- **Recommended action**: Read entity to confirm segmentation criteria schema (likely
  jsonb filter criteria).

---

## UCR-10: `DeviceSession` Entity in `onsite` Service

- **What**: `services/onsite/src/entities/device-session.entity.ts` — tracks onsite
  scanner/kiosk device sessions.
- **Prior documentation**: Canon used `Badge`/`SessionAttendance`; `DeviceSession` was
  noted in GAP-G9 but never extracted.
- **Impact**: Frontend onsite device management UI needs this entity.
- **Recommended action**: Read entity for columns.

---

## UCR-11: `scripts/register-paths.js` (documented in DELTA-4 but not in backend authority)

- **What**: Build-critical path alias resolution script — required for production boot.
- **Status**: Documented in `delta-log.md` DELTA-4 and `docs/developer/README.md` but
  absent from `docs/01_backend/BACKEND_ARCHITECTURE.md`.
- **Impact**: Any session that reads BACKEND_ARCHITECTURE.md without DELTA-4 would miss
  this runtime dependency.
- **Recommended action**: Add a short note to `BACKEND_ARCHITECTURE.md` §build referencing
  this script.

---

## Summary

| ID | Entity/Code | Service | Frontend Impact |
|---|---|---|---|
| UCR-1 | `AttendanceMetrics`, `EventDashboardView` (views) | analytics | Dashboard queries |
| UCR-2 | `Organization` | tenant | Org management UI |
| UCR-3 | `SessionSpeaker` (junction) | speaker | Speaker assignment API |
| UCR-4 | `AttendeeTag` | attendee | Tag UI, segmentation |
| UCR-5 | `Lead` | exhibitor | Exhibitor portal lead list |
| UCR-6 | `SponsorPackage` | exhibitor | Sponsorship tiers |
| UCR-7 | `TicketEntitlement` | ticketing | Access control, capacity |
| UCR-8 | `PaymentTransaction` | payment | Payment history |
| UCR-9 | `AudienceSegment` | notification | Campaign builder |
| UCR-10 | `DeviceSession` | onsite | Device management |
| UCR-11 | `scripts/register-paths.js` | infra/build | Developer docs only |
