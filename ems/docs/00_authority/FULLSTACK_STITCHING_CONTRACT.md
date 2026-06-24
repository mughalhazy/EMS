Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: Shared

# Fullstack Stitching Contract (Initial Traceability)

> Per GOVERNANCE IMPLEMENTATION PHASE 1, this document establishes the initial
> traceability structure:
>
> `Feature → Workflow → Domain Entity → Backend Component → API Endpoint →
> Frontend Consumer → Permission Model → Validation Layer → Test Coverage →
> Deployment Dependency`
>
> Populated only from verified repository evidence as of 2026-06-15. All
> `Frontend Consumer` cells are `TBD – REQUIRES VERIFICATION` /
> "Not built (Phase E)" because `apps/web` contains only a `README.md`. This
> is an **initial** structure covering one representative feature per
> workflow (`docs/canon/workflow-catalog.md`); it is not yet exhaustive across
> all 26 services and is expected to grow incrementally as an AUTONOMOUS
> documentation task (see `07_governance/DECISION_ESCALATION_MATRIX.md`).

## Global columns (apply to every row unless noted)

- **Validation Layer**: `class-validator` DTOs per `docs/canon/api-standards.md`
  ("Validation" section) — every controller method verified to take a typed
  DTO parameter (e.g. `CreateSsoConnectionDto`).
- **Deployment Dependency**: all services run inside `apps/api` (single
  NestJS process, `apps/api/src/app.module.ts`), backed by Postgres, Redis,
  Kafka, OpenSearch per `infra/docker/docker-compose.yml`
  (`docs/canon/data-architecture.md`).

---

## Row 1 — Tenant Onboarding

| Field | Value |
|---|---|
| Feature | Tenant signup / provisioning |
| Workflow | Tenant Onboarding (`PRODUCT_WORKFLOWS.md` §1) |
| Domain Entity | `Tenant` (tenant schema), `Role`/`Permission`/`UserRole` (rbac schema), `User` (auth schema) |
| Backend Component | `services/tenant` (`TenantController` `/tenants`), `services/auth`, `services/rbac` (`RbacService` seeds `PLATFORM_PERMISSIONS` on `tenant.created`) |
| API Endpoint | `POST /v1/tenants` (verified controller path `tenants`; `/v1` prefix per `docs/canon/api-standards.md`) |
| Frontend Consumer | Not built (Phase E) |
| Permission Model | `tenant:write` (verified `services/tenant/src/tenant.controller.ts:25`) |
| Validation Layer | class-validator DTO (TBD – exact DTO name not enumerated this pass) |
| Test Coverage | No `.spec.ts` in `services/tenant` (verified — 0 spec files) |
| Deployment Dependency | Postgres (`tenant` schema), Kafka (`tenant.created` topic) |

---

## Row 2 — Event Lifecycle

| Field | Value |
|---|---|
| Feature | Event create/publish/go-live/archive/cancel |
| Workflow | Event Lifecycle (`PRODUCT_WORKFLOWS.md` §2) |
| Domain Entity | `Event`, `Venue`, `EventSettings` (event schema) |
| Backend Component | `services/event` — `EventController` (`/events`), `VenueController` (`/venues`) |
| API Endpoint | `/v1/events`, `/v1/venues` (verified controller paths `events`, `venues`) |
| Frontend Consumer | Not built (Phase E) |
| Permission Model | TBD – `services/event/src/event.controller.ts` does not show `@RequirePermissions` in this pass; verify against `docs/canon/security-model.md` |
| Validation Layer | class-validator DTOs (pattern verified project-wide) |
| Test Coverage | No `.spec.ts` in `services/event` (verified — 0 spec files) |
| Deployment Dependency | Postgres (`event` schema), Kafka topics `event.created`/`event.published`/`event.went_live`/`event.archived`/`event.cancelled` (`docs/canon/event-catalog.md`) |

---

## Row 2a — Agenda Management

| Field | Value |
|---|---|
| Feature | Build session schedule (tracks, sessions) |
| Workflow | Agenda Management (`PRODUCT_WORKFLOWS.md` §3) |
| Domain Entity | `Session`, `Track` (agenda schema — verified entity files); `Room` (event schema — verified `room.entity.ts` is in `services/event`, not `services/agenda`) |
| Backend Component | `services/agenda` — `TrackController` (`/tracks`), `SessionController` (`/sessions`); `services/notification` (event-driven — notifies registered attendees of schedule changes) |
| API Endpoint | `/v1/tracks`, `/v1/sessions` (verified controller paths in `services/agenda`) |
| Frontend Consumer | Not built (Phase E) |
| Permission Model | TBD – REQUIRES VERIFICATION |
| Validation Layer | class-validator DTOs (pattern verified project-wide) |
| Test Coverage | 0 `.spec.ts` in `services/agenda` (verified) |
| Deployment Dependency | Postgres (`agenda` schema), Kafka (session events → `notification`, `search`) |

---

## Row 2b — Speaker Management

| Field | Value |
|---|---|
| Feature | Onboard speaker, assign to sessions |
| Workflow | Speaker Management (`PRODUCT_WORKFLOWS.md` §4) |
| Domain Entity | `Speaker`, `SpeakerProfile`, `SessionSpeaker` (speaker schema — all verified: `speaker.entity.ts`, `speaker-profile.entity.ts`, `session-speaker.entity.ts`) |
| Backend Component | `services/speaker` — `SpeakerController` (`/speakers`), `SessionController` (`/sessions`) in speaker service; `services/agenda` (sessions must exist before assignment); `services/notification` (event-driven — notifies speaker of assignment) |
| API Endpoint | `/v1/speakers`, `/v1/sessions` (verified controller paths in `services/speaker` — note: `/sessions` exists in both `agenda` and `speaker` controllers) |
| Frontend Consumer | Not built (Phase E) |
| Permission Model | TBD – REQUIRES VERIFICATION |
| Validation Layer | class-validator DTOs (pattern verified project-wide) |
| Test Coverage | 0 `.spec.ts` in `services/speaker` (verified) |
| Deployment Dependency | Postgres (`speaker`, `agenda` schemas), Kafka (speaker events → `notification`, `search`) |
| Ordering Note | Workflow 4 depends on Workflow 3: `Session` records must exist (created in Agenda Management) before `SessionSpeaker` assignments can be created. |

---

## Row 3 — Ticket Setup & Checkout

| Field | Value |
|---|---|
| Feature | Configure ticket types, purchase tickets |
| Workflow | Ticket Setup + Checkout (`PRODUCT_WORKFLOWS.md` §5–6) |
| Domain Entity | `TicketProduct`/`Ticket`/`TicketEntitlement` (ticketing), `PriceRule`/`DiscountRule`/`PromoCode` (pricing), `InventoryItem` (inventory), `Order`/`OrderItem` (order), `Payment`/`PaymentTransaction` (payment) |
| Backend Component | `services/ticketing` (`/ticket-products`, `/tickets`), `services/pricing` (`/promo-codes`), `services/inventory` (`/inventory`), `services/order` (`/orders`), `services/payment` (`/payments`) — all coordinated via **synchronous NestJS service injection within the same process** (not network calls; see PRODUCT_WORKFLOWS §11 checkout note). `services/fulfillment` and `services/analytics` participate **asynchronously** as event-driven downstream consumers after payment completes. |
| API Endpoint | `/v1/ticket-products`, `/v1/tickets`, `/v1/promo-codes`, `/v1/inventory`, `/v1/orders`, `/v1/payments` (all verified controller paths) |
| Frontend Consumer | Not built (Phase E) |
| Permission Model | TBD – no `@RequirePermissions` found in these controllers this pass; verify |
| Validation Layer | class-validator DTOs (pattern verified project-wide); `Idempotency-Key` header required for order/payment writes per `docs/canon/api-standards.md` |
| Test Coverage | `services/order` has 1 `.spec.ts` (verified); ticketing/pricing/inventory/payment have 0 |
| Deployment Dependency | Postgres (ticketing/pricing/inventory/order/payment schemas), Redis (idempotency store, `infra/cache`), Kafka (order/payment events → fulfillment/analytics) |

---

## Row 4 — Refund

| Field | Value |
|---|---|
| Feature | Issue refund for cancelled order/event |
| Workflow | Refund (`PRODUCT_WORKFLOWS.md` §7) |
| Domain Entity | `Refund`, `Payment`, `PaymentTransaction` (payment schema); `InventoryItem` (inventory); `Order`/`OrderItem` status update (order schema) |
| Backend Component | `services/payment` (`/payments`), `services/order` (`/orders`), `services/inventory` (`/inventory`), `services/notification` (event-driven — sends attendee notification on refund) |
| API Endpoint | TBD – REQUIRES VERIFICATION (refund-specific sub-route not enumerated this pass; `/v1/payments` controller exists, exact refund path unread) |
| Frontend Consumer | Not built (Phase E) |
| Permission Model | TBD – REQUIRES VERIFICATION |
| Validation Layer | class-validator DTOs (pattern verified project-wide) |
| Test Coverage | 0 `.spec.ts` in `services/payment` (verified) |
| Deployment Dependency | Postgres (`payment`, `inventory`, `order` schemas), Kafka (refund events feed `notification`, `analytics`) |

---

## Row 5 — Registration

| Field | Value |
|---|---|
| Feature | Attendee registration form submission |
| Workflow | Registration (`PRODUCT_WORKFLOWS.md` §8) |
| Domain Entity | `Registration`, `RegistrationForm`, `RegistrationAnswer` (registration schema); `Attendee` (attendee schema) |
| Backend Component | `services/registration` — `RegistrationController` (`/registrations`), second controller (`/events/:eventId/registration-fields`) |
| API Endpoint | `/v1/registrations`, `/v1/events/:eventId/registration-fields` (verified controller paths) |
| Frontend Consumer | Not built (Phase E) |
| Permission Model | TBD – REQUIRES VERIFICATION |
| Validation Layer | class-validator DTOs (pattern verified project-wide) |
| Test Coverage | 0 `.spec.ts` in `services/registration` (verified) |
| Deployment Dependency | Postgres (`registration`, `attendee` schemas), Kafka (registration events feed `notification`, `analytics`) |

---

## Row 6 — Check-in

| Field | Value |
|---|---|
| Feature | Onsite badge scan / check-in |
| Workflow | Check-in (`PRODUCT_WORKFLOWS.md` §9) |
| Domain Entity | `CheckIn`, `BadgePrint`, `DeviceSession` (onsite schema — verified entity names); `Registration` (registration schema, lookup); `Attendee`/`AttendeeProfile` (attendee schema, lookup) |
| Backend Component | `services/onsite` — `CheckInController` (`/check-ins`), check-in stats (`/events/:eventId/check-in-stats`), `BadgePrintController` (`/badge-prints`), `DeviceSessionController` (`/device-sessions`); `services/registration` and `services/attendee` participate as synchronous lookups during check-in validation; `services/analytics` participates as event-driven downstream (real-time live dashboard) |
| API Endpoint | `/v1/check-ins`, `/v1/events/:eventId/check-in-stats`, `/v1/badge-prints`, `/v1/device-sessions` (verified controller paths) |
| Frontend Consumer | Not built (Phase E) |
| Permission Model | TBD – REQUIRES VERIFICATION |
| Validation Layer | class-validator DTOs (pattern verified project-wide) |
| Test Coverage | 1 `.spec.ts` in `services/onsite` (verified) |
| Deployment Dependency | Postgres (`onsite`, `registration`, `attendee` schemas), Kafka (check-in events → `analytics` live dashboards) |

---

## Row 7 — Campaign Delivery

| Field | Value |
|---|---|
| Feature | Create and send marketing campaign |
| Workflow | Campaign Delivery (`PRODUCT_WORKFLOWS.md` §10) |
| Domain Entity | `Campaign`, `AudienceSegment` (implemented under **notification** schema, not `engagement` — GAP-G3) |
| Backend Component | `services/notification` — `CampaignController` (`/campaigns`), `NotificationService.scheduleCampaign`/`listCampaigns` |
| API Endpoint | `POST /v1/campaigns`, `GET /v1/campaigns`, `POST /v1/campaigns/:id/send` (verified) |
| Frontend Consumer | Not built (Phase E) |
| Permission Model | TBD – REQUIRES VERIFICATION |
| Validation Layer | `CreateCampaignDto` (verified import in `notification.controller.ts`) |
| Test Coverage | 1 `.spec.ts` in `services/notification` (verified) |
| Deployment Dependency | Postgres (`notification` schema), Kafka (campaign-send triggers), `@nestjs/schedule` for scheduled sends (project dependency, verified in `package.json`) |

---

## Row 8 — Enterprise SSO Login

| Field | Value |
|---|---|
| Feature | SSO discovery, callback login, connection management |
| Workflow | Tenant Onboarding extension / Auth (not a numbered workflow in `workflow-catalog.md`; cross-cutting auth capability) |
| Domain Entity | `SsoConnection`, `SsoIdentity`, `AuthSession`, `User` (auth schema — SSO login finds-or-creates `User` and creates `AuthSession`) |
| Backend Component | `services/auth` — `SsoController` (`/auth/sso`) |
| API Endpoint | `GET /v1/auth/sso/discover` (public), `POST /v1/auth/sso/callback` (public), `/v1/auth/sso/connections` CRUD (verified controller paths) |
| Frontend Consumer | Not built (Phase E) |
| Permission Model | `sso:manage` for `/connections` CRUD (verified `auth.controller.ts:121,130,139,148,161`); `discover`/`callback` are public (no guard) |
| Validation Layer | `CreateSsoConnectionDto`, `UpdateSsoConnectionDto`, `SsoAssertionDto` (verified in `services/auth/src/dto/`) |
| Test Coverage | 1 `.spec.ts` in `services/auth` (verified — covers `AuthService`, includes SSO repo injection per GAP-6 fix) |
| Deployment Dependency | Postgres (`auth` schema, tables `sso_connections`/`sso_identities`), Kafka (`user.sso_login_succeeded` topic, `infra/event-bus/src/topics.ts`) |

---

## Open Items

- **TBD – REQUIRES VERIFICATION**: Permission Model for the majority of
  controllers — only `audit`, `rbac`, `tenant`, and `auth`(SSO) verified to
  use `@RequirePermissions` in this pass. Full audit of all 26 services'
  controllers is recommended as an AUTONOMOUS follow-up task.
- **Test Coverage** is critically low across the platform: only 4 of 26
  services have any `.spec.ts` file (`auth`, `notification`, `onsite`,
  `order` — 1 each), and there is **no e2e test suite present** beyond the
  `test:e2e` script reference (`./test/jest-e2e.json` — existence not verified
  this pass). This is flagged as a major finding in
  `08_reports/ARCHITECTURAL_GAP_REGISTER.md` (GAP-G4).
- **Frontend Consumer** column is uniformly "Not built (Phase E)" — once
  `apps/web` exists, this contract must be extended with route paths from
  `docs/canon/ui-surface-map.md`.
- This contract should be extended to cover all 26 services as an
  AUTONOMOUS documentation task (see `06_decisions/ADR-001_PROJECT_FOUNDATION.md`
  and `07_governance/DECISION_ESCALATION_MATRIX.md`).
