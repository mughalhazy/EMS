Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-17
Owner: AI

# Service Catalog

> Extracted from `apps/api/src/app.module.ts` (module load order),
> all 26 `services/*/src/*.controller.ts` files, and all
> `services/*/src/entities/` directory listings.
> Entity names are code-verified (see GAP-G9 in `08_reports/ARCHITECTURAL_GAP_REGISTER.md`
> for naming deviations from canon docs).

## Batch 1 — Platform Core

### 1. auth

| Field | Value |
|---|---|
| Postgres schema | `auth` |
| Entities | `User`, `UserCredential`, `AuthSession`, `SsoConnection`, `SsoIdentity` |
| Controllers | `AuthController` (`/auth`), `UsersController` (`/users`), `SsoController` (`/auth/sso`) |
| Kafka publishes | `user.registered`, `user.login_succeeded`, `user.login_failed`, `user.password_changed`, `user.status_changed`, `user.sso_login_succeeded` |
| Kafka subscribes | `tenant.created` (no-op bootstrap hook) |
| Consumer group | `auth-service` |
| Key constants | `BCRYPT_ROUNDS=12`, `ACCESS_TTL_SECONDS=900`, `REFRESH_TTL_DAYS=7` |
| Test coverage | 1 `.spec.ts` file |
| Notes | SSO deferred hardening: assertion signature verification not yet implemented (GAP-G6) |

### 2. tenant

| Field | Value |
|---|---|
| Postgres schema | `tenant` |
| Entities | `Tenant`, `TenantSettings`, `Organization` |
| Controllers | `TenantController` (`/tenants`) |
| Kafka publishes | `tenant.created` |
| Kafka subscribes | — |
| Key constants | — |
| Test coverage | 0 |
| Notes | `Organization` entity not previously documented in canon (discovered GAP-G9) |

### 3. rbac

| Field | Value |
|---|---|
| Postgres schema | `rbac` |
| Entities | `Role`, `Permission`, `UserRole` (+ `role_permissions` junction table managed via `@ManyToMany/@JoinTable` on `Role` — not a separate entity file) |
| Controllers | `RbacController` (`/roles`, `/users/:id/roles`) |
| Kafka publishes | — |
| Kafka subscribes | `tenant.created` (seeds 8 default roles), `user.registered` (assigns Attendee role) |
| Consumer group | `rbac-service` |
| Permissions used | `role:read`, `role:write`, `role:assign`, `role:revoke` |
| Test coverage | 0 |

### 4. audit

| Field | Value |
|---|---|
| Postgres schema | `audit` |
| Entities | `AuditLog` |
| Controllers | `AuditController` (`/audit`) |
| Kafka subscribes | ALL 64 topics (`Object.values(Topics)` from `infra/event-bus/src/topics.ts`) |
| Consumer group | `audit-service` |
| Permissions used | `audit:read` |
| Test coverage | 0 |

---

## Batch 2 — Event Operations

### 5. event

| Field | Value |
|---|---|
| Postgres schema | `event` |
| Entities | `Event`, `Venue`, `Room` |
| Controllers | `EventController` (`/events`), `VenueController` (`/venues`) |
| Kafka publishes | `event.created`, `event.published`, `event.went_live`, `event.archived`, `event.cancelled` |
| Test coverage | 0 |
| Notes | `Room` is in `event` schema (not `agenda` — corrected in GAP-G9); `EventSettings` entity not found in code |

### 6. agenda

| Field | Value |
|---|---|
| Postgres schema | `agenda` |
| Entities | `Session`, `Track` |
| Controllers | `TrackController` (`/tracks`), `SessionController` (`/sessions`) |
| Kafka publishes | `session.created`, `session.updated`, `session.cancelled` |
| Test coverage | 0 |
| Notes | `Room` is NOT in `agenda` — it is in `event` schema (corrected GAP-G9). Controller prefix `/sessions` is shared with `speaker` service. |

### 7. speaker

| Field | Value |
|---|---|
| Postgres schema | `speaker` |
| Entities | `Speaker`, `SpeakerProfile`, `SessionSpeaker` |
| Controllers | `SpeakerController` (`/speakers`), `SessionController` (`/sessions`) in speaker context |
| Kafka publishes | `speaker.created`, `speaker.updated`, `speaker.assigned_to_session` |
| Kafka subscribes | `session.created`, `session.cancelled` (cleans up SessionSpeaker assignments) |
| Consumer group | `speaker-service` |
| Test coverage | 0 |
| Notes | `SessionSpeaker` is a junction entity (undocumented in canon — GAP-G9). Controller `/sessions` prefix also exists in `agenda` — routing ambiguity risk. |

### 8. exhibitor

| Field | Value |
|---|---|
| Postgres schema | `exhibitor` |
| Entities | `Exhibitor`, `Booth`, `SponsorPackage`, `Sponsor`, `Lead` |
| Controllers | `ExhibitorController` (`/exhibitors`), `BoothController` (`/booths`), `LeadController` (`/leads`) |
| Kafka publishes | `exhibitor.created`, `sponsor.created`, `lead.captured` |
| Kafka subscribes | `event.created`, `attendee.created` (future validation hook — no-op currently) |
| Consumer group | `exhibitor-service` |
| Test coverage | 0 |
| Notes | `Sponsor` entity was undocumented in canon (GAP-G9) |

### 9. attendee

| Field | Value |
|---|---|
| Postgres schema | `attendee` |
| Entities | `Attendee`, `AttendeeProfile`, `AttendeeTag` |
| Controllers | `AttendeeController` (`/attendees`) |
| Kafka subscribes | `registration.confirmed` (creates Attendee record on confirmed registration) |
| Consumer group | `attendee-service` |
| Kafka publishes | `attendee.created`, `attendee.profile_updated` |
| Test coverage | 0 |
| Notes | `AttendeeTag` was undocumented in canon (GAP-G9) |

---

## Batch 3 — Participation

### 10. registration

| Field | Value |
|---|---|
| Postgres schema | `registration` |
| Entities | `Registration`, `RegistrationField` |
| Controllers | `RegistrationController` (`/registrations`), `RegistrationFieldController` (`/events/:eventId/registration-fields`) |
| Kafka publishes | `registration.submitted`, `registration.approved`, `registration.confirmed`, `registration.cancelled`, `registration.waitlisted` |
| Kafka subscribes | `event.cancelled` (auto-cancels pending registrations) |
| Consumer group | `registration-service` |
| Test coverage | 0 |
| Notes | Canon used `RegistrationForm`/`RegistrationAnswer` — code uses `Registration`/`RegistrationField` (GAP-G9) |

### 11. onsite

| Field | Value |
|---|---|
| Postgres schema | `onsite` |
| Entities | `CheckIn`, `BadgePrint`, `DeviceSession` |
| Controllers | `CheckInController` (`/check-ins`, `/events/:eventId/check-in-stats`), `BadgePrintController` (`/badge-prints`), `DeviceSessionController` (`/device-sessions`) |
| Kafka publishes | `attendee.checked_in`, `session.attended` |
| Kafka subscribes | `attendee.created` (pre-creates BadgePrint record with 0 copies for on-site staff) |
| Consumer group | `onsite-service` |
| Test coverage | 1 `.spec.ts` file |
| Notes | Canon used `Badge`/`SessionAttendance` — code uses `BadgePrint`/`DeviceSession` (GAP-G9) |

---

## Batch 4 — Commerce

### 12. ticketing

| Field | Value |
|---|---|
| Postgres schema | `ticketing` |
| Entities | `TicketProduct`, `Ticket`, `TicketEntitlement` |
| Controllers | `TicketProductController` (`/ticket-products`), `TicketController` (`/tickets`) |
| Kafka publishes | `ticket_product.created`, `ticket.issued`, `ticket.redeemed`, `ticket.voided` |
| Kafka subscribes | `fulfillment.completed` (issues tickets after fulfillment) |
| Consumer group | `ticketing-service` |
| Test coverage | 0 |
| Notes | Canon used `TicketType` — code uses `TicketProduct`; `TicketEntitlement` was missing from canon (GAP-G9) |

### 13. pricing

| Field | Value |
|---|---|
| Postgres schema | `pricing` |
| Entities | `PriceRule`, `DiscountRule`, `PromoCode` |
| Controllers | `PricingController` (`/pricing-rules`), `PromoCodeController` (`/promo-codes`) |
| Kafka publishes | `promo_code.redeemed` |
| Test coverage | 0 |
| Notes | Canon used `Discount` — code uses `DiscountRule` (GAP-G9) |

### 14. inventory

| Field | Value |
|---|---|
| Postgres schema | `inventory` |
| Entities | `InventoryItem` |
| Controllers | `InventoryController` (`/inventory`) |
| Kafka publishes | `inventory.reserved`, `inventory.released` |
| Kafka subscribes | `ticket_product.created` (creates inventory item), `order.cancelled` (releases reserved stock), `fulfillment.completed` (releases fulfilled items) |
| Consumer group | `inventory-service` |
| Test coverage | 0 |
| Notes | Canon used `InventoryPool`/`InventoryReservation` — code uses single `InventoryItem` (GAP-G9) |

### 15. order

| Field | Value |
|---|---|
| Postgres schema | `ordering` (SQL reserved word — entity uses `{ schema: 'ordering', name: 'orders' }`; GAP-G11: postgres-init.sql still creates `"order"` — CRITICAL, awaiting owner fix A-4) |
| Entities | `Order`, `OrderItem` |
| Controllers | `OrderController` (`/orders`) |
| Kafka publishes | `order.created`, `order.paid`, `order.cancelled`, `order.fulfilled` |
| Kafka subscribes | `payment.completed` (transitions order to paid, publishes `order.paid`), `payment.failed`, `fulfillment.completed` (transitions order to fulfilled, publishes `order.fulfilled`) |
| Consumer group | `order-service` |
| Test coverage | 1 `.spec.ts` file |

### 16. payment

| Field | Value |
|---|---|
| Postgres schema | `payment` |
| Entities | `Payment`, `Refund`, `PaymentTransaction` |
| Controllers | `PaymentController` (`/payments`) |
| Kafka publishes | `payment.completed`, `payment.failed`, `payment.refunded` |
| Test coverage | 0 |
| Notes | `PaymentTransaction` was undocumented in canon (GAP-G9) |

### 17. fulfillment

| Field | Value |
|---|---|
| Postgres schema | `fulfillment` |
| Entities | `Fulfillment` |
| Controllers | `FulfillmentController` (`/fulfillments`) |
| Kafka subscribes | `order.paid` (fulfillment is triggered by order.paid, NOT payment.completed — see Note) |
| Consumer group | `fulfillment-service` |
| Kafka publishes | `fulfillment.completed` |
| Test coverage | 0 |
| Notes | Canon used `FulfillmentRequest`/`DeliveryRecord` — code uses single `Fulfillment` entity (GAP-G9). Fulfillment is **async** — triggered by `order.paid` Kafka event. Commerce chain: `payment.completed` → order publishes `order.paid` → fulfillment subscribes → publishes `fulfillment.completed`. |

---

## Batch 5 — Engagement

### 18. notification

| Field | Value |
|---|---|
| Postgres schema | `notification` |
| Entities | `Notification`, `NotificationTemplate`, `Campaign`, `AudienceSegment` |
| Controllers | `NotificationController` (`/notifications`), `CampaignController` (`/campaigns`) |
| Kafka subscribes | `registration.confirmed`, `order.paid`, `ticket.issued` |
| Consumer group | `notification-service` |
| Kafka publishes | `notification.sent`, `notification.failed`, `campaign.scheduled`, `campaign.sent` |
| Scheduler | `@nestjs/schedule` — campaign scheduling |
| Test coverage | 1 `.spec.ts` file |
| Notes | `Campaign`/`AudienceSegment` placed here, not in `engagement` (GAP-G3) |

### 19. engagement

| Field | Value |
|---|---|
| Postgres schema | `engagement` |
| Entities | (none found) |
| Controllers | Stub controller (2-line comment, zero HTTP routes) |
| Test coverage | 0 |
| Notes | Near-empty module. Canon docs assigned Campaign here but code does not. Controller stub states connections/polls/Q&A/surveys moved to `networking`/`interactive-engagement`. Candidate for removal or repurposing (requires ADR). |

---

## Batch 6 — Intelligence

### 20. analytics

| Field | Value |
|---|---|
| Postgres schema | `analytics` |
| Entities | `AnalyticsEvent` (`analytics.analytics_events`), `EventMetric` (`analytics.event_metrics`), `TicketSalesSummary` (`analytics.ticket_sales_summaries`); plus 2 `@ViewEntity` read models: `AttendanceMetrics` (`analytics.attendance_metrics`), `EventDashboardView` (`analytics.event_dashboard_view`) |
| Controllers | `AnalyticsController` (`/analytics`) |
| Kafka subscribes | `registration.submitted`, `registration.cancelled`, `attendee.checked_in`, `order.paid`, `order.cancelled`, `ticket.issued`, `ticket.redeemed`, `connection.accepted`, `poll.responded`, `qa.question_submitted`, `survey.completed` |
| Consumer group | `analytics-service` |
| Test coverage | 0 |
| Notes | CQRS read model — write-side services do not query analytics; analytics does not write to primary schemas. GAP-B12 resolved. |

### 21. search

| Field | Value |
|---|---|
| Postgres schema | `search` |
| Entities | `SearchDocument` (`search.search_documents`) — indexed entity types: `event`, `session`, `speaker`, `exhibitor`, `attendee` |
| Controllers | `SearchController` (`/search`) |
| Kafka subscribes | `event.created`, `event.published`, `event.went_live`, `event.archived`, `event.cancelled`, `session.created`, `session.cancelled`, `speaker.created`, `exhibitor.created`, `attendee.created`, `attendee.profile_updated`, `embedding.updated` |
| Consumer group | `search-service` |
| Test coverage | 0 |
| Notes | CQRS read model using **Postgres ILIKE** — not OpenSearch. No OpenSearch client in `package.json`. GAP-B9 resolved: OpenSearch is provisioned in `.env.development.example` but commented out as "not yet used." |

---

## Batch 8 — Social (gap-fill)

### 22. networking

| Field | Value |
|---|---|
| Postgres schema | `networking` |
| Entities | `AttendeeConnection` |
| Controllers | `NetworkingController` (`/networking`) |
| Kafka publishes | `connection.requested`, `connection.accepted`, `connection.declined` |
| Kafka subscribes | — (no subscribers; fully HTTP-driven) |
| Test coverage | 0 |
| Notes | Canon used `Connection` — code uses `AttendeeConnection` (GAP-G9). No Poll/PollResponse here — those are in `interactive-engagement`. |

---

## Batch 9 — Interactive (gap-fill)

### 23. interactive-engagement

| Field | Value |
|---|---|
| Postgres schema | `interactive_engagement` |
| Entities | `Poll`, `PollResponse`, `QaQuestion`, `Survey`, `SurveyResponse` |
| Controllers | `PollController` (`/polls`), `QaController` (`/qa`), `SurveyController` (`/surveys`) |
| Kafka publishes | `poll.created`, `poll.responded`, `qa.question_submitted`, `survey.completed` |
| Kafka subscribes | `event.cancelled` (deactivates polls and surveys for cancelled events) |
| Consumer group | `interactive-engagement-service` |
| Test coverage | 0 |

---

## Batch 10 — AI Layer (gap-fill)

### 24. ai-service

| Field | Value |
|---|---|
| Postgres schema | `ai_service` |
| Entities | `VectorEmbedding`, `AIInteractionLog` |
| Controllers | `AiController` (`/ai`) |
| Kafka subscribes | `attendee.created`, `attendee.profile_updated`, `session.created`, `session.updated`, `speaker.created`, `speaker.updated`, `event.created`, `event.updated` (generates embeddings, publishes `embedding.updated`) |
| Consumer group | `ai-service` |
| Integrations | OpenAI, Gemini, DeepSeek (API keys required) |
| Test coverage | 0 |
| Notes | **Embedding is a placeholder** — `upsertEmbedding()` stores `vector: []` and `modelVersion: 'placeholder-v0'`. No real embedding API is called. "agent-automation records" mentioned in canon — no such entity in code (GAP-G9, CA-022). See `docs/legacy/ai-architecture.md` for AI architecture detail (GAP-G7; file relocated 2026-06-17). |

---

## Cross-Cutting

### 25. integration

| Field | Value |
|---|---|
| Postgres schema | `integration` |
| Entities | `WebhookSubscription` (columns: `id`, `tenantId`, `name`, `targetUrl`, `eventTypes` jsonb, `secret` nullable, `active`, `createdAt`, `updatedAt`) |
| Controllers | `IntegrationController` (`/integrations`) |
| Kafka subscribes | All 64 topics via `Object.values(Topics)` — fixed 2026-06-17 (GAP-B15 CLOSED); previously hardcoded 41-topic list |
| Consumer group | `integration-service` |
| Test coverage | 0 |
| Notes | `WebhookDelivery` entity does NOT exist in code — was premature documentation; removed. HMAC signing and retry/dead-letter deferred (GAP-G6). `CreateWebhookSubscriptionDto.secret` has no minimum length constraint (security finding). |

### 26. ui-renderer

| Field | Value |
|---|---|
| Postgres schema | — |
| Entities | — |
| Controllers | — |
| Test coverage | 0 |
| Notes | Scaffold only (`Status: SCAFFOLD`). Phase E. No implementation. |

---

## Summary

| Batch | Services | Entities (approx) | Test files |
|---|---|---|---|
| 1 — Platform Core | auth, tenant, rbac, audit | 12 | 1 |
| 2 — Event Operations | event, agenda, speaker, exhibitor, attendee | 13 | 0 |
| 3 — Participation | registration, onsite | 5 | 1 |
| 4 — Commerce | ticketing, pricing, inventory, order, payment, fulfillment | 9 | 1 |
| 5 — Engagement | notification, engagement | 4 + stub | 1 |
| 6 — Intelligence | analytics, search | TBD projections | 0 |
| 8 — Social | networking | 1 | 0 |
| 9 — Interactive | interactive-engagement | 5 | 0 |
| 10 — AI | ai-service | 2 | 0 |
| Cross-cutting | integration, ui-renderer | 2 + scaffold | 0 |
| **Total** | **26** | **~50+** | **4** |
