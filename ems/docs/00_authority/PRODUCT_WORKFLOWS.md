Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: Shared

# Product Workflows (Authority Summary)

> Extracted from `docs/canon/workflow-catalog.md` (126 lines, full read
> 2026-06-15). That document is the field/event-level authority; this is a
> governance-level summary so a new AI session can identify the primary
> workflows without reading the full catalog.

## 1. Tenant Onboarding

- **Services**: tenant, auth, rbac, audit
- **Trigger**: new tenant signup
- **Steps**: create `Tenant` → create initial admin `User` → seed default
  `Role`/`Permission` set via `tenant.created` event → audit log entry.
- **Key event**: `tenant.created` (consumed by `rbac` to seed default roles
  per tenant — see `services/rbac/src/rbac.service.ts` `PLATFORM_PERMISSIONS`).

## 2. Event Lifecycle

- **Services**: event, agenda, notification, analytics, search
- **Trigger**: organizer creates/updates an `Event`
- **Steps**: `draft` → `published` (opens registration/ticketing) → `live`
  (enables onsite check-in + real-time analytics) → `archived`; or
  `cancelled` (from `draft`/`published`, triggers refund workflow).
- **Key events**: `event.created`, `event.published`, `event.went_live`,
  `event.archived`, `event.cancelled`.

## 3. Agenda Management

- **Services**: agenda, speaker, notification
- **Trigger**: organizer builds session schedule
- **Steps**: create `Track`/`Room` → create `Session` → assign `Speaker`(s) →
  publish agenda → notify registered attendees of schedule.

## 4. Speaker Management

- **Services**: speaker, agenda, notification
- **Trigger**: organizer invites/onboards a speaker
- **Steps**: create `Speaker` + `SpeakerProfile` → assign to `Session`(s) →
  speaker confirms → notification sent.

## 5. Ticket Setup

- **Services**: ticketing, pricing, inventory
- **Trigger**: organizer configures sellable tickets for an event
- **Steps**: create `TicketType` → define `PriceRule`/`Discount`/`PromoCode`
  → allocate `InventoryPool` capacity → publish for sale (tied to
  `event.published`).

## 6. Checkout

- **Services**: order, inventory, pricing, payment, ticketing, notification
- **Trigger**: attendee purchases ticket(s)
- **Steps**: create `Order`/`OrderItem` → reserve inventory
  (`InventoryReservation`) → apply pricing/discounts → process `Payment` →
  issue `Ticket`(s) → send confirmation notification. Idempotency-Key header
  required per `docs/canon/api-standards.md`.
- **Key event(s)**: order placed/paid events drive `fulfillment` and
  `analytics`.

## 7. Refund

- **Services**: payment, order, inventory, notification
- **Trigger**: cancellation (attendee-initiated or `event.cancelled`)
- **Steps**: create `Refund` against `Payment` → release `InventoryReservation`
  back to pool → update `Order`/`Ticket` status → notify attendee.

## 8. Registration

- **Services**: registration, attendee, notification
- **Trigger**: attendee registers for an event (free or paid-with-ticket flow)
- **Steps**: submit `RegistrationForm` → store `RegistrationAnswer`(s) →
  create/link `Attendee` record → confirmation notification.

## 9. Check-in

- **Services**: onsite, registration, attendee, analytics
- **Trigger**: attendee arrives onsite
- **Steps**: scan badge/QR → create `CheckIn` → optionally print `Badge` →
  record `SessionAttendance` per session entered → feeds real-time
  `analytics` during `live` event state.

## 10. Campaign Delivery

- **Services**: notification (not `engagement` as canon docs specify —
  see below), attendee
- **Trigger**: organizer creates and sends a marketing campaign to an
  audience segment
- **Status**: **Implemented**, but in a different service than
  `docs/canon/workflow-catalog.md`/`service-map.md` specify. Verified:
  `services/notification/src/entities/campaign.entity.ts`,
  `audience-segment.entity.ts`, `CampaignController` at `/campaigns`
  (`POST /campaigns`, `GET /campaigns`, `POST /campaigns/:id/send`),
  `NotificationService.scheduleCampaign`/`listCampaigns`. `services/engagement`
  is a near-empty stub and does not implement this workflow. Tracked as
  GAP-G3 (placement deviation, not a missing-feature gap) in
  `08_reports/ARCHITECTURAL_GAP_REGISTER.md`.

## 11. Notes for AI Sessions

- All 10 workflows above are documented in `docs/canon/workflow-catalog.md`
  with full service/trigger/step/event detail.
- **All 10 workflows are executable via direct API calls.** Workflow 10
  (Campaign Delivery) runs under `services/notification` (not
  `services/engagement`) — see §10 and GAP-G3 in
  `08_reports/ARCHITECTURAL_GAP_REGISTER.md`.
- Workflows 1–10 are backed by implemented services per
  `00_authority/FEATURE_SCOPE.md` §2, but **frontend surfaces for triggering
  them do not yet exist** (`apps/web` not started, Phase E) — these workflows
  are currently only reachable via direct API calls (`/v1/*` per
  `docs/canon/api-standards.md`).
- **Workflow 3/4 ordering dependency**: Workflow 4 (Speaker Management) depends
  on Workflow 3 (Agenda Management) having already created `Session` records
  before speakers can be assigned. Sessions must exist before speaker assignment
  (`SessionSpeaker` junction entity in `services/speaker`).
- **Checkout coordination model (Workflow 6)**: Since all 26 services run in
  one NestJS process (`apps/api`), the multi-service coordination in Checkout
  (order → inventory → pricing → payment → ticketing) is achieved via
  **synchronous NestJS service injection within the same process** — no network
  hops between services. This is consistent with ADR-001 Principle 3 ("direct
  synchronous inter-service **network** calls are avoided"), not a violation of
  it. `fulfillment` and `analytics` participate **asynchronously** as
  event-driven downstream consumers after payment completes.
