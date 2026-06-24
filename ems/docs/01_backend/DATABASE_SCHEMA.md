Status: Active
Authority Level: High
Last Reviewed: 2026-06-17 (updated by Determinability Review)
Owner: AI

# Database Schema

> Extracted from all `services/*/src/entities/` directories.
> TypeORM 0.3 (`@nestjs/typeorm ^10.0.2`, `pg ^8.13.0`).
> Schema-per-service pattern: every service owns one Postgres schema named
> after the service. No cross-schema foreign keys in the application layer;
> cross-service references are by ID value only, with eventual consistency
> enforced via Kafka.
> Entity names are code-verified (corrected from canon in GAP-G9).

## Configuration

| Setting | Value |
|---|---|
| ORM | TypeORM 0.3 |
| Driver | `pg` (node-postgres) |
| Connection | `DATABASE_URL` env var |
| `synchronize` | `true` in non-production (auto-applies schema); `false` in production |
| `migrationsRun` | `true` in production (applies migration files) |
| `autoLoadEntities` | `true` — entities registered per module |
| `logging` | Enabled in development |

## Multi-Tenancy Pattern

Every entity that holds customer data inherits `tenant_id` (UUID column). At
the repository layer, `TenantScopedRepository<T extends { tenantId }>`
(in `infra/common/src/base.repository.ts`) automatically:

1. Injects `tenantId` on every `save()` call
2. Appends `WHERE tenant_id = $1` on every `find()`, `findOne()`, `count()`, `softDelete()` call
3. Exposes `buildOutboxEntry(event, payload)` — creates `{ aggregateType, eventType, payload, tenantId }` for transactional outbox writes

Platform/infrastructure entities (e.g., `Role`, `Permission`, `RolePermission`)
may not carry `tenant_id` — verified case-by-case.

## Soft Deletes

`TenantScopedRepository.softDelete()` sets `deletedAt` (TypeORM `@DeleteDateColumn`)
and excludes soft-deleted rows from all subsequent find queries. Hard deletes
are not used in service layer code.

---

## Schema: `auth`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `User` | `auth.users` | `id` (uuid PK), `tenantId`, `email`, `firstName`, `lastName`, `isActive`, `createdAt` | Core identity |
| `UserCredential` | `auth.user_credentials` | `id`, `userId` (FK → users), `passwordHash` | Separated for credential rotation |
| `AuthSession` | `auth.auth_sessions` | `id`, `userId`, `tokenHash`, `expiresAt`, `createdAt` | Refresh token store; bcrypt-compared on refresh |
| `SsoConnection` | `auth.sso_connections` | `id`, `tenantId`, `provider`, `issuer`, `certificate`, `metadataUrl` | One per tenant per SSO provider |
| `SsoIdentity` | `auth.sso_identities` | `id`, `userId`, `connectionId`, `externalId`, `attributes` (jsonb) | Links platform User to external IdP identity |

---

## Schema: `tenant`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `Tenant` | `tenant.tenants` | `id` (uuid PK), `name`, `slug`, `plan`, `isActive`, `createdAt` | Top-level tenant record |
| `TenantSettings` | `tenant.tenant_settings` | `id`, `tenantId`, `settings` (jsonb) | Created on first `PUT /v1/tenants/:id/settings` (upsert); NOT auto-created at `tenant.created` |
| `Organization` | `tenant.organizations` | `id`, `tenantId`, `name`, `billingInfo` (jsonb nullable), `createdAt`, `updatedAt`, `ManyToOne → Tenant` | Billing/business entity under a tenant; created via `POST /v1/tenants/:id/organizations` |

---

## Schema: `rbac`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `Role` | `rbac.roles` | `id`, `tenantId`, `name`, `description` | 8 default roles seeded on `tenant.created` |
| `Permission` | `rbac.permissions` | `id`, `code` (unique), `description` | 12 platform permission codes |
| `RolePermission` | `rbac.role_permissions` | `roleId`, `permissionId` | Many-to-many junction |
| `UserRole` | `rbac.user_roles` | `userId`, `roleId`, `tenantId` | Attendee role auto-assigned on `user.registered` |

---

## Schema: `audit`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `AuditLog` | `audit.audit_logs` | `id`, `tenantId`, `userId`, `action`, `entityType`, `entityId`, `changes` (jsonb), `createdAt` | Written by consuming platform Kafka events |

---

## Schema: `event`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `Event` | `event.events` | `id`, `tenantId`, `title`, `slug`, `status` (state machine), `startDate`, `endDate`, `venueId`, `createdAt` | State machine: DRAFT→PUBLISHED→LIVE→ARCHIVED/CANCELLED |
| `Venue` | `event.venues` | `id`, `tenantId`, `name`, `address`, `capacity`, `timezone` | |
| `Room` | `event.rooms` | `id`, `tenantId`, `venueId`, `name`, `capacity` | In `event` schema, NOT `agenda` (corrected GAP-G9) |

Note: `EventSettings` entity (`event.event_settings`) is **confirmed missing from code** (verified Phase 3.25 — 2026-06-17). No `event-settings.entity.ts` in `services/event/src/entities/`. Pending OCR-5 implementation. Schema specified in `OWNER_CONFIRMATION_REGISTER.md`.

---

## Schema: `agenda`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `Session` | `agenda.sessions` | `id`, `tenantId`, `eventId`, `trackId`, `roomId` (ref by value → `event.rooms`), `title`, `startTime`, `endTime` | `roomId` is a value reference — no FK to `event.rooms` |
| `Track` | `agenda.tracks` | `id`, `tenantId`, `eventId`, `name`, `color` | |

---

## Schema: `speaker`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `Speaker` | `speaker.speakers` | `id`, `tenantId`, `userId` (ref → `auth.users`), `bio`, `avatarUrl` | |
| `SpeakerProfile` | `speaker.speaker_profiles` | `id`, `speakerId`, `socialLinks` (jsonb), `expertise` (array) | |
| `SessionSpeaker` | `speaker.session_speakers` | `id`, `sessionId` (ref → `agenda.sessions`), `speakerId` (ref → `speaker.speakers`), `role` (default: `'presenter'`), `assignedAt` | Junction; undocumented in canon (GAP-G9) |

---

## Schema: `exhibitor`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `Exhibitor` | `exhibitor.exhibitors` | `id`, `tenantId`, `name`, `description`, `logoUrl` | |
| `Booth` | `exhibitor.booths` | `id`, `tenantId`, `exhibitorId`, `eventId`, `location`, `size` | |
| `SponsorPackage` | `exhibitor.sponsor_packages` | `id`, `eventId`, `tier`, `price` (numeric 12,2), `benefits` (jsonb array, nullable), `createdAt` | No `tenantId`. `tier` is the tier name (e.g. 'Gold'); `price` is decimal. |
| `Sponsor` | `exhibitor.sponsors` | `id`, `tenantId`, `exhibitorId`, `eventId`, `packageId` | Undocumented in canon (GAP-G9) |
| `Lead` | `exhibitor.leads` | `id`, `exhibitorId`, `attendeeId`, `capturedByDeviceId` (nullable), `notes` (text, nullable), `capturedAt` | No `tenantId`. |

---

## Schema: `attendee`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `Attendee` | `attendee.attendees` | `id`, `tenantId`, `userId` (ref), `eventId` | |
| `AttendeeProfile` | `attendee.attendee_profiles` | `id`, `attendeeId`, `preferences` (jsonb), `dietaryRestrictions` | |
| `AttendeeTag` | `attendee.attendee_tags` | `id`, `tenantId`, `attendeeId`, `tag` | Undocumented in canon (GAP-G9) |

---

## Schema: `registration`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `Registration` | `registration.registrations` | `id`, `tenantId`, `eventId`, `userId` (not `attendeeId`), `status` (submitted\|approved\|confirmed\|waitlisted\|cancelled), `answers` (jsonb, nullable), `createdAt`, `updatedAt` | |
| `RegistrationField` | `registration.registration_fields` | `id`, `tenantId`, `eventId`, `label`, `fieldType`, `required`, `value` | Canon used `RegistrationForm`/`RegistrationAnswer` (GAP-G9) |

---

## Schema: `onsite`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `CheckIn` | `onsite.check_ins` | `id`, `tenantId`, `attendeeId`, `eventId`, `checkedInAt`, `deviceId` | |
| `BadgePrint` | `onsite.badge_prints` | `id`, `tenantId`, `eventId`, `attendeeId`, `copies` (int, default 1), `deviceId` (nullable), `printedAt` | Pre-created on `attendee.created` with `copies=0`. No `badgeFormat`. Canon used `Badge` (GAP-G9). |
| `DeviceSession` | `onsite.device_sessions` | `id`, `tenantId`, `eventId`, `deviceId`, `staffUserId` (nullable), `startedAt`, `endedAt` (timestamptz, nullable) | Canon used `SessionAttendance` (GAP-G9). |

---

## Schema: `ticketing`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `TicketProduct` | `ticketing.ticket_products` | `id`, `tenantId`, `eventId`, `name`, `description`, `price`, `currency` | Canon used `TicketType` (GAP-G9) |
| `Ticket` | `ticketing.tickets` | `id`, `tenantId`, `ticketProductId`, `attendeeId`, `orderId`, `status` | |
| `TicketEntitlement` | `ticketing.ticket_entitlements` | `id`, `tenantId`, `ticketId`, `entitlementType` (session_access\|lounge_access\|swag_bag\|meal\|parking), `value` (text, nullable), `createdAt` | Undocumented in canon (GAP-G9) |

---

## Schema: `pricing`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `PriceRule` | `pricing.price_rules` | `id`, `tenantId`, `eventId`, `ticketProductId`, `type`, `amount`, `validFrom`, `validTo` | |
| `DiscountRule` | `pricing.discount_rules` | `id`, `tenantId`, `type`, `amount`, `maxUses` | Canon used `Discount` (GAP-G9) |
| `PromoCode` | `pricing.promo_codes` | `id`, `tenantId`, `code` (unique per tenant), `discountRuleId`, `usedCount` | |

---

## Schema: `inventory`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `InventoryItem` | `inventory.inventory_items` | `id`, `tenantId`, `ticketProductId`, `eventId`, `capacity`, `reserved`, `sold` | Canon used `InventoryPool`/`InventoryReservation` (GAP-G9) |

---

## Schema: `ordering`

> **Note**: The order service uses schema `ordering` (not `order`) — `order` is
> a SQL reserved word. This is DELTA-1 in `docs/tracking/delta-log.md`.
> **FIXED 2026-06-17**: `infra/docker/init/postgres-init.sql` line 18 corrected
> from `"order"` to `"ordering"`. GAP-G11 resolved. Run `docker:reset` before
> restarting to rebuild volumes with the correct schema name.

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `Order` | `ordering.orders` | `id`, `tenantId`, `userId`, `eventId`, `status` (created/paid/fulfilled/cancelled), `subtotalCents`, `discountCents`, `totalCents`, `promoCodeId`, `createdAt`, `updatedAt` | Idempotency-Key required on create. `userId` (not `attendeeId`). Amounts in integer cents. |
| `OrderItem` | `ordering.order_items` | `id`, `orderId`, `ticketProductId`, `quantity`, `unitPrice` | |

---

## Schema: `payment`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `Payment` | `payment.payments` | `id`, `tenantId`, `orderId`, `amount`, `currency`, `status`, `gateway`, `createdAt` | |
| `Refund` | `payment.refunds` | `id`, `tenantId`, `paymentId`, `amount`, `reason`, `status`, `createdAt` | |
| `PaymentTransaction` | `payment.payment_transactions` | `id`, `tenantId`, `paymentId`, `type` (authorize\|capture\|refund), `amountCents` (int), `currency` (default: 'USD'), `status` (pending\|completed\|failed), `providerRef` (nullable), `createdAt` | Undocumented in canon (GAP-G9). `providerRef` = gateway transaction ID. |

---

## Schema: `fulfillment`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `Fulfillment` | `fulfillment.fulfillments` | `id`, `tenantId`, `orderId`, `status` (pending\|completed\|failed), `completedAt` (nullable), `createdAt` | Canon used `FulfillmentRequest`/`DeliveryRecord` (GAP-G9). Created async on `order.paid` (NOT `payment.completed`). No `dispatchedAt`/`deliveredAt`. |

---

## Schema: `notification`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `Notification` | `notification.notifications` | `id`, `tenantId`, `recipientId`, `type`, `channel`, `status`, `sentAt` | |
| `NotificationTemplate` | `notification.notification_templates` | `id`, `tenantId`, `name`, `subject`, `body`, `channel` | |
| `Campaign` | `notification.campaigns` | `id`, `tenantId`, `name`, `segmentId`, `templateId`, `scheduledAt`, `status` | GAP-G3: placed in `notification`, not `engagement` |
| `AudienceSegment` | `notification.audience_segments` | `id`, `tenantId`, `campaignId`, `criteria` (jsonb), `createdAt` | GAP-G3 same. No `name` column — segment is linked to a specific campaign. |

---

## Schema: `networking`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `AttendeeConnection` | `networking.attendee_connections` | `id`, `tenantId`, `requesterId`, `requesteeId` (not `targetId`), `status` (pending\|accepted\|declined), `createdAt`, `updatedAt` | Canon used `Connection` (GAP-G9) |

---

## Schema: `interactive_engagement`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `Poll` | `interactive_engagement.polls` | `id`, `tenantId`, `sessionId`, `question`, `options` (jsonb) | |
| `PollResponse` | `interactive_engagement.poll_responses` | `id`, `pollId`, `attendeeId`, `selectedOption` | |
| `QaQuestion` | `interactive_engagement.qa_questions` | `id`, `tenantId`, `sessionId`, `attendeeId`, `question`, `upvotes` | |
| `Survey` | `interactive_engagement.surveys` | `id`, `tenantId`, `eventId`, `title`, `questions` (jsonb) | |
| `SurveyResponse` | `interactive_engagement.survey_responses` | `id`, `surveyId`, `attendeeId`, `answers` (jsonb) | |

---

## Schema: `ai_service`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `VectorEmbedding` | `ai_service.vector_embeddings` | `id`, `entityType`, `entityId`, `vector` (jsonb, `number[]`), `modelVersion`, `updatedAt` | Column is `vector` (not `embedding`); type is `jsonb` (not pgvector). No `tenantId`. `@Unique(['entityType','entityId'])`. No pgvector extension required. |
| `AIInteractionLog` | `ai_service.ai_interaction_logs` | `id`, `tenantId`, `userId` (nullable), `prompt` (text), `response` (text, nullable), `context` (jsonb, nullable), `createdAt` | No `model` or `tokensUsed` columns — those were documented prematurely. `context` is a flexible JSONB field. |

---

## Schema: `integration`

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `WebhookSubscription` | `integration.webhook_subscriptions` | `id`, `tenantId`, `name`, `targetUrl`, `eventTypes` (jsonb array), `secret` (nullable, `@MinLength(16)` enforced since 2026-06-17), `active`, `createdAt`, `updatedAt` | Column is `targetUrl` (not `url`), `eventTypes` (not `events`). GAP-B8 closed. |

> **Corrected 2026-06-17**: `WebhookDelivery` entity does not exist in the
> codebase — no `webhook-delivery.entity.ts` found in
> `services/integration/src/entities/`. The delivery tracking table
> (`integration.webhook_deliveries`) is not yet implemented. This was a
> premature documentation of a planned entity. Track as undocumented gap
> if delivery logging is required before frontend work.

---

## Schema: `analytics`

> **Resolved 2026-06-17**: Analytics uses Postgres projections (not OpenSearch).
> Two view entities computed from `event_metrics` table.

| Entity | Table/View | Type | Key Columns | Notes |
|---|---|---|---|---|
| `AnalyticsEvent` | `analytics.analytics_events` | Table | `id`, `tenantId`, `eventId` (nullable), `eventType`, `payload` (jsonb), `occurredAt` | Raw event ingestion log |
| `EventMetric` | `analytics.event_metrics` | Table | `id`, `tenantId`, `eventId`, `registrationsCount`, `checkInsCount`, `ticketsIssuedCount`, `ticketsRedeemedCount`, `ordersCount`, `revenueCents`, `surveyResponsesCount`, `updatedAt` | `@Unique(['tenantId','eventId'])`. Aggregate counters per event. |
| `TicketSalesSummary` | `analytics.ticket_sales_summaries` | Table | `id`, `tenantId`, `eventId`, `ticketProductId`, `quantitySold`, `ordersCount`, `updatedAt` | `@Unique(['tenantId','eventId','ticketProductId'])` |
| `AttendanceMetrics` | `analytics.attendance_metrics` | View | `id`, `tenantId`, `eventId`, `registrationsCount`, `checkInsCount`, `ticketsRedeemedCount`, `checkInRate`, `updatedAt` | TypeORM `@ViewEntity` computed from `analytics.event_metrics` |
| `EventDashboardView` | `analytics.event_dashboard_view` | View | All `EventMetric` columns plus `checkInRate` (computed) | TypeORM `@ViewEntity` — full dashboard projection |

## Schema: `search`

> **Corrected 2026-06-17**: Search uses Postgres (ILIKE), not OpenSearch.
> See DELTA-2 in `docs/tracking/delta-log.md`.

| Entity | Table | Key Columns | Notes |
|---|---|---|---|
| `SearchDocument` | `search.search_documents` | `id`, `tenantId`, `entityType` (event/session/speaker/exhibitor/attendee), `entityId`, `eventId` (nullable), `title`, `content` (text, nullable), `active`, `updatedAt` | `@Unique(['tenantId','entityType','entityId'])`. ILIKE queries on `title`/`content`. OpenSearch is provisioned in docker-compose but not yet used by the search service. |

---

## Cross-Schema Reference Policy

Per ADR-001 Architectural Principle 2: no TypeORM-level foreign keys between
service schemas. All cross-service references are stored as plain UUID columns
and resolved by ID value at the application layer (or asynchronously via Kafka).
