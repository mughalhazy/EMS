> **Status: Retired.** Fully superseded by `docs/00_authority/PRODUCT_WORKFLOWS.md`.
> For detailed per-workflow step descriptions, see `docs/workflows/*.md` (4 files)
> which remain active Supporting References.

# Workflow Catalog

> Source: V2 DOCS Phase 3 Prompt 5 — workflow catalog. Each workflow lists the
> participating services, the trigger, the step sequence, and the events emitted
> (cross-reference `docs/canon/event-catalog.md`). Detailed step-by-step diagrams
> for the four highest-traffic workflows live in `docs/workflows/`.

## 1. Tenant Onboarding
- **Services**: tenant, auth, rbac
- **Trigger**: platform admin creates a new tenant (`/v1/admin/tenants`).
- **Steps**:
  1. `tenant` creates `Tenant`, `Organization`, default `TenantSettings` -> emits `tenant.created`.
  2. `rbac` consumes `tenant.created`, seeds default roles (§2 of `security-model.md`).
  3. `auth` creates the first admin `User` + `UserCredential`, sends invite -> emits `user.registered`.
  4. `rbac` consumes `user.registered`, assigns `tenant_admin` role -> emits `role.assigned`.
- **Events**: `tenant.created`, `user.registered`, `role.assigned`.

## 2. Event Lifecycle
- **Services**: event, agenda, exhibitor, registration, ticketing, payment, onsite, analytics
- **Trigger**: organizer creates an event.
- **Steps**: `draft -> published -> live -> archived` (or `cancelled` from `draft`/`published`).
  See `docs/workflows/event-lifecycle.md` for full diagram.
- **Events**: `event.created`, `event.published`, `event.unpublished`, `event.went_live`,
  `event.archived`, `event.cancelled`.

## 3. Agenda Management
- **Services**: agenda, speaker, search
- **Trigger**: organizer adds/edits tracks and sessions during `draft`/`published`.
- **Steps**:
  1. Organizer creates `Track`(s) under `Event`.
  2. Organizer creates `Session`(s) with `room_id`/`start_time`/`end_time`;
     `agenda` validates no room/time overlap within the event.
  3. `agenda` emits `session.created` / `session.updated`.
  4. `speaker` consumes to surface session on speaker profile;
     `search` consumes to index session.
- **Events**: `session.created`, `session.updated`, `session.cancelled`.

## 4. Speaker Management
- **Services**: speaker, agenda, notification
- **Trigger**: organizer invites a speaker and assigns them to session(s).
- **Steps**:
  1. `speaker` creates `Speaker` + `SpeakerProfile` -> emits `speaker.created`.
  2. Organizer assigns speaker to `Session` via `SessionSpeaker` ->
     `speaker` emits `speaker.assigned_to_session`.
  3. `notification` consumes to email the speaker their schedule.
- **Events**: `speaker.created`, `speaker.assigned_to_session`.

## 5. Ticket Setup
- **Services**: ticketing, pricing, inventory
- **Trigger**: organizer configures ticket products for a `draft` event.
- **Steps**:
  1. `ticketing` creates `TicketProduct` -> emits `ticket_product.created`.
  2. `pricing` consumes, allows organizer to attach `PriceRule`/`DiscountRule`/`PromoCode`.
  3. `inventory` consumes, creates `InventoryPool` with `total_capacity`.
- **Events**: `ticket_product.created`.

## 6. Checkout
- **Services**: order, inventory, pricing, payment, fulfillment, ticketing, notification
- **Trigger**: attendee adds ticket(s) to cart and submits checkout.
- **Steps**: see `docs/workflows/checkout-flow.md` for full diagram. Summary:
  1. `order` creates `Order`/`OrderItem` (status `created`) -> emits `order.created`.
  2. `inventory` reserves capacity (Redis TTL hold) -> emits `inventory.reserved`
     (or rejects with `409 CONFLICT` if `inventory.depleted`).
  3. `payment` creates a payment intent with the provider; on provider webhook,
     emits `payment.completed` or `payment.failed`.
  4. On `payment.completed`: `order` emits `order.paid`; `fulfillment` consumes
     `payment.completed`, issues tickets via `ticketing` (`ticket.issued`),
     marks order fulfilled -> `order.fulfilled`, emits `fulfillment.completed`.
  5. On `payment.failed`: `order` releases the inventory hold (`inventory.released`),
     order remains `pending_payment` for retry or expires.
  6. `notification` sends order confirmation on `fulfillment.completed`.
- **Events**: `order.created`, `inventory.reserved`/`released`/`depleted`,
  `payment.completed`/`failed`, `order.paid`, `ticket.issued`, `order.fulfilled`,
  `fulfillment.completed`.

## 7. Refund
- **Services**: payment, order, ticketing, registration, notification
- **Trigger**: finance user initiates a refund on a `Payment` (full or partial).
- **Steps**:
  1. `payment` processes provider refund, creates `Refund` -> emits `payment.refunded`.
  2. `order` consumes, updates `OrderStatus` to `refunded` (or partially).
  3. `ticketing` consumes, voids associated `Ticket`(s) -> `ticket.voided`.
  4. `registration` consumes, cancels linked `Registration` if fully refunded.
  5. `notification` sends refund confirmation.
- **Events**: `payment.refunded`, `ticket.voided`, `registration.cancelled`.

## 8. Registration
- **Services**: registration, attendee, notification
- **Trigger**: user submits registration form for a `published` event (free event,
  or paid event after `order.paid`).
- **Steps**: see `docs/workflows/registration-flow.md`. Summary:
  1. `registration` creates `Registration` (status `pending` or `confirmed` if no
     approval required) -> emits `registration.submitted`.
  2. If approval required: organizer approves/rejects -> `registration.approved`
     or stays `pending`/moves to `cancelled`.
  3. If event capacity reached: `registration.waitlisted`.
  4. On confirmation (`registration.confirmed`): `attendee` creates `Attendee` +
     `AttendeeProfile` -> emits `attendee.created`.
  5. `notification` sends confirmation email.
- **Events**: `registration.submitted`, `registration.approved`,
  `registration.confirmed`, `registration.cancelled`, `registration.waitlisted`,
  `attendee.created`.

## 9. Check-in
- **Services**: onsite, attendee, interactive-engagement, notification
- **Trigger**: onsite staff scans attendee QR code at a `live` event.
- **Steps**: see `docs/workflows/checkin-flow.md`. Summary:
  1. `onsite` validates `ScanningDevice` + attendee QR, creates `CheckinRecord`,
     generates `Badge` if first check-in -> emits `attendee.checked_in`.
  2. Per-session scans create `SessionAttendance` -> emit `session.attended`.
  3. `interactive-engagement` consumes `session.attended` to surface live
     polls/Q&A for that session to the attendee.
  4. `notification` may send a welcome message on first check-in.
- **Events**: `attendee.checked_in`, `session.attended`.

## 10. Campaign Delivery
- **Services**: engagement, notification, analytics
- **Trigger**: organizer schedules a campaign targeting an `AudienceSegment`.
- **Steps**:
  1. `engagement` creates `Campaign` + `AudienceSegment` -> emits `campaign.scheduled`.
  2. At scheduled time, `engagement` resolves segment membership (querying
     `Attendee`/`AttendeeTag`/`Registration`), dispatches messages via
     `notification` -> `notification.sent`/`failed` per recipient.
  3. `engagement` emits `campaign.sent`; `analytics` records delivery metrics.
- **Events**: `campaign.scheduled`, `notification.sent`/`failed`, `campaign.sent`.
