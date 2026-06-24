> **Status: Retired.** Superseded by `docs/01_backend/SERVICE_CATALOG.md`
> (code-verified). The Kafka producer/consumer matrix in this doc is retained
> as design intent — not yet cross-checked against
> `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md` (candidate: GAP-B14).

# Service Map

> Source: V1 Packet 0 Prompt 7 — Service Map (initial 14 services), refined by V2 DOCS
> Phase 2 Prompt 3 — service map (19 services, authoritative for naming/boundaries),
> amended with `search`, `ai-service`, `networking`, `interactive-engagement` per
> `BUILD_BLUEPRINT.md` §4. Entity ownership matches `docs/canon/domain-model.md`;
> event names match `docs/canon/event-catalog.md`.

Each service is a NestJS module under `services/<name>/` (Phase 1: in-process;
Phase 2+: independently deployable). "Publishes" = events written to its outbox.
"Consumes" = Kafka topics it subscribes to.

---

## Batch 1 — Platform Core

### auth
- **Purpose**: authentication, sessions, credentials, SSO.
- **Owns**: `User`, `UserCredential`, `AuthSession`.
- **Publishes**: `user.registered`, `user.login_succeeded`, `user.login_failed`, `user.password_changed`.
- **Consumes**: `tenant.created` (to allow first-admin bootstrap).

### tenant
- **Purpose**: tenant/organization lifecycle, settings, onboarding.
- **Owns**: `Tenant`, `Organization`, `TenantSettings`.
- **Publishes**: `tenant.created`, `tenant.updated`, `tenant.suspended`.
- **Consumes**: —

### rbac
- **Purpose**: roles, permissions, role assignment.
- **Owns**: `Role`, `Permission`, `UserRole`.
- **Publishes**: `role.assigned`, `role.revoked`.
- **Consumes**: `user.registered` (assign default role), `tenant.created` (seed default roles).

### audit
- **Purpose**: tenant-scoped audit trail across all services.
- **Owns**: `AuditLog`.
- **Publishes**: —
- **Consumes**: `*` (wildcard — subscribes to all domain events for audit projection).

---

## Batch 2 — Event Operations

### event
- **Purpose**: event lifecycle, venues, rooms.
- **Owns**: `Event`, `Venue`, `Room`.
- **Publishes**: `event.created`, `event.published`, `event.unpublished`, `event.went_live`,
  `event.archived`, `event.cancelled`.
- **Consumes**: —

### agenda
- **Purpose**: tracks and sessions, scheduling conflict checks.
- **Owns**: `Track`, `Session`.
- **Publishes**: `session.created`, `session.updated`, `session.cancelled`.
- **Consumes**: `event.created`, `event.cancelled`.

### speaker
- **Purpose**: speaker directory, profiles, session assignments.
- **Owns**: `Speaker`, `SpeakerProfile`, `SessionSpeaker`.
- **Publishes**: `speaker.created`, `speaker.assigned_to_session`.
- **Consumes**: `session.created`, `session.cancelled`.

### exhibitor
- **Purpose**: exhibitors, booths, sponsor packages, sponsors, lead capture.
- **Owns**: `Exhibitor`, `Booth`, `SponsorPackage`, `Sponsor`, `Lead`.
- **Publishes**: `exhibitor.created`, `sponsor.created`, `lead.captured`.
- **Consumes**: `event.created`, `attendee.created` (lead capture validation).

### attendee
- **Purpose**: attendee identity, profile, tags — created on registration confirmation.
- **Owns**: `Attendee`, `AttendeeProfile`, `AttendeeTag`.
- **Publishes**: `attendee.created`, `attendee.profile_updated`.
- **Consumes**: `registration.confirmed`.

---

## Batch 3 — Participation

### registration
- **Purpose**: registration workflow, approval, waitlisting, custom questions.
- **Owns**: `Registration`, `RegistrationStatus`, `RegistrantProfile`,
  `RegistrationQuestion`, `RegistrationAnswer`.
- **Publishes**: `registration.submitted`, `registration.approved`,
  `registration.confirmed`, `registration.cancelled`, `registration.waitlisted`.
- **Consumes**: `event.published` (open registration), `order.paid` (confirm
  registrations tied to paid orders), `payment.refunded` (cancel registration).

### onsite
- **Purpose**: check-in, badge printing, scanning devices, session attendance.
- **Owns**: `CheckinRecord`, `Badge`, `ScanningDevice`, `SessionAttendance`.
- **Publishes**: `attendee.checked_in`, `session.attended`.
- **Consumes**: `attendee.created`, `event.went_live`, `session.created`.

---

## Batch 4 — Commerce Core

### ticketing
- **Purpose**: ticket products, issued tickets, entitlements.
- **Owns**: `TicketProduct`, `Ticket`, `TicketEntitlement`.
- **Publishes**: `ticket_product.created`, `ticket.issued`, `ticket.redeemed`, `ticket.voided`.
- **Consumes**: `event.created`, `order.fulfilled` (issue tickets), `payment.refunded` (void tickets).

### pricing
- **Purpose**: price rules, discounts, promo codes.
- **Owns**: `PriceRule`, `DiscountRule`, `PromoCode`.
- **Publishes**: `promo_code.redeemed`.
- **Consumes**: `ticket_product.created`.

### inventory
- **Purpose**: capacity pools and reservation holds (Redis-backed TTL).
- **Owns**: `InventoryPool`, `InventoryReservation`.
- **Publishes**: `inventory.reserved`, `inventory.released`, `inventory.depleted`.
- **Consumes**: `ticket_product.created` (create pool), `order.created` (reserve),
  `order.cancelled` / reservation TTL expiry (release).

### order
- **Purpose**: shopping cart / order aggregate, checkout orchestration.
- **Owns**: `Order`, `OrderItem`, `OrderStatus`.
- **Publishes**: `order.created`, `order.paid`, `order.cancelled`, `order.fulfilled`.
- **Consumes**: `inventory.reserved`, `inventory.released`, `payment.completed`,
  `payment.failed`, `fulfillment.completed`.

### payment
- **Purpose**: payment processing, transactions, refunds (provider integration).
- **Owns**: `Payment`, `PaymentTransaction`, `Refund`.
- **Publishes**: `payment.completed`, `payment.failed`, `payment.refunded`.
- **Consumes**: `order.created` (initiate payment intent).

### fulfillment
- **Purpose**: post-payment ticket issuance and order completion orchestration.
- **Owns**: — (process service; writes via `ticketing`/`order` through commands, no own tables)
- **Publishes**: `fulfillment.completed`.
- **Consumes**: `payment.completed`.

---

## Batch 5 — Engagement / Marketing

### notification
- **Purpose**: transactional messaging (email/SMS/push) across all services.
- **Owns**: `NotificationMessage`.
- **Publishes**: `notification.sent`, `notification.failed`.
- **Consumes**: `user.registered`, `registration.confirmed`, `order.paid`,
  `fulfillment.completed`, `payment.refunded`, `attendee.checked_in`.

### engagement
- **Purpose**: marketing campaigns and audience segmentation.
- **Owns**: `Campaign`, `AudienceSegment`.
- **Publishes**: `campaign.scheduled`, `campaign.sent`.
- **Consumes**: `attendee.created`, `attendee.profile_updated`, `registration.confirmed`.

---

## Batch 6 — Intelligence

### analytics
- **Purpose**: read-model projections for dashboards and reporting.
- **Owns**: `EventDashboardView`, `TicketSalesSummary`, `AttendanceMetrics` (read models only).
- **Publishes**: —
- **Consumes**: `*` (wildcard — builds projections from the full event stream;
  primarily `order.*`, `payment.*`, `registration.*`, `attendee.checked_in`,
  `session.attended`).

### search
- **Purpose**: full-text/semantic search over events, sessions, speakers, attendees.
- **Owns**: OpenSearch indices `events`, `sessions`, `speakers`, `attendees` (no relational tables).
- **Publishes**: —
- **Consumes**: `event.*`, `session.*`, `speaker.*`, `attendee.*`.

---

## Batch 7 — Infra Layer
*(see `infra/event-bus/README.md` and `infra/cache/README.md` — not application services)*

---

## Batch 8 — Social (gap-fill)

### networking
- **Purpose**: attendee-to-attendee connection requests.
- **Owns**: `AttendeeConnection`.
- **Publishes**: `connection.requested`, `connection.accepted`, `connection.declined`.
- **Consumes**: `attendee.created`.

---

## Batch 9 — Interactive Engagement (gap-fill)

### interactive-engagement
- **Purpose**: live polls, Q&A, post-session surveys.
- **Owns**: `Poll`, `PollResponse`, `QAQuestion`, `Survey`, `SurveyResponse`.
- **Publishes**: `poll.created`, `poll.responded`, `qa.question_submitted`,
  `survey.completed`.
- **Consumes**: `session.created`, `session.attended`.

---

## Batch 10 — AI Layer (gap-fill)

### ai-service
- **Purpose**: vector embeddings, semantic search augmentation, matchmaking,
  AI assistant/agent automation.
- **Owns**: `VectorEmbedding`, `AIInteractionLog`.
- **Publishes**: `embedding.updated`.
- **Consumes**: `event.*`, `session.*`, `speaker.*`, `attendee.*`,
  `attendee.profile_updated` (re-embed on profile change).

---

## Phase E — Frontend / Rendering

### ui-renderer
- **Purpose**: shared rendering layer translating design tokens + read models into
  `apps/web` UI components. See `services/ui-renderer/spec.md`.
- **Owns**: — (no domain data; consumes read models and design tokens only)
- **Publishes**: —
- **Consumes**: read models from `analytics`/`search` via API, not Kafka.

---

## Cross-Cutting

### integration
- **Purpose**: outbound integrations (calendar sync, CRM export, webhooks) per V1
  Stream-9 (Networking & Integration).
- **Owns**: integration configs/webhook subscriptions (tenant-scoped).
- **Publishes**: —
- **Consumes**: `*` (filtered by tenant webhook subscription config).

---

## Service Count Summary

| Module group | Services | Batch |
|---|---|---|
| Platform Core | auth, tenant, rbac, audit | 1 |
| Event Operations | event, agenda, speaker, exhibitor, attendee | 2 |
| Participation | registration, onsite | 3 |
| Commerce Core | ticketing, pricing, inventory, order, payment, fulfillment | 4 |
| Engagement | notification, engagement | 5 |
| Intelligence | analytics, search | 6 |
| Infra | event-bus, cache | 7 |
| Social | networking | 8 |
| Interactive Engagement | interactive-engagement | 9 |
| AI Layer | ai-service | 10 |
| Frontend | ui-renderer | E |
| Cross-cutting | integration | (V1 Stream-9) |

26 services total (24 application services + 2 infra modules), matching the
26 `services/` folders scaffolded in `ems/services/`.
