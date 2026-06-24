Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-15
Owner: Shared

# Domain Model (Authority Summary)

> Extracted from `docs/canon/domain-model.md` (374 lines, full read 2026-06-15).
> That document remains the **field-level authority**; this document is a
> navigable summary establishing entity ownership, schema-per-service
> boundaries, and cross-cutting invariants for governance purposes.

## 1. Cross-Cutting Invariants

- **Schema-per-service**: every entity lives in a Postgres schema named after
  its owning service (e.g. `auth.users`, `event.events`, `ticketing.tickets`).
- **Tenant isolation**: every tenant-scoped entity carries a `tenant_id`
  column; enforced at the repository layer by a shared base repository
  (`infra/common`). No entity may be queried without a tenant filter except
  platform-admin-scoped queries.
- **No cross-service foreign keys**: relationships between entities owned by
  different services are referenced by ID only (no DB-level FK constraints
  across schemas). Referential integrity across services is maintained via
  the event bus + eventual consistency, not transactions.
- **Outbox pattern**: state-changing writes that must emit a domain event
  write to an `outbox` table in the same transaction; `infra/event-bus`
  relays outbox rows to Kafka (`docs/canon/data-architecture.md`).

## 2. Entity Ownership by Service (Batch 1 — Platform Core)

| Service | Schema | Key Entities |
|---|---|---|
| auth | auth | `User`, `UserCredential`, `AuthSession`, `SsoConnection`, `SsoIdentity` (verified: `user.entity.ts`, `user-credential.entity.ts`, `auth-session.entity.ts`, `sso-connection.entity.ts`, `sso-identity.entity.ts`) |
| tenant | tenant | `Tenant`, `TenantSettings`, `Organization` (verified: `tenant.entity.ts`, `tenant-settings.entity.ts`, `organization.entity.ts` — `Organization` not previously documented, TBD – REQUIRES VERIFICATION on purpose/relationship to `Tenant`) |
| rbac | rbac | `Role`, `Permission`, `UserRole` (verified: `role.entity.ts`, `permission.entity.ts`, `user-role.entity.ts`) |
| audit | audit | `AuditLog` (append-only — verified: `audit-log.entity.ts`) |

## 3. Batch 2 — Event Operations

| Service | Schema | Key Entities |
|---|---|---|
| event | event | `Event` (lifecycle: draft/published/live/archived/cancelled), `Venue`, `Room` (verified: `event.entity.ts`, `venue.entity.ts`, `room.entity.ts` — note: `Room` is in `event` schema, not `agenda`) |
| agenda | agenda | `Session`, `Track` (verified: `session.entity.ts`, `track.entity.ts` — no `Room` entity here) |
| speaker | speaker | `Speaker`, `SpeakerProfile`, `SessionSpeaker` (junction entity for speaker-to-session assignment — verified: `speaker.entity.ts`, `speaker-profile.entity.ts`, `session-speaker.entity.ts`) |
| exhibitor | exhibitor | `Exhibitor`, `Booth`, `SponsorPackage`, `Sponsor`, `Lead` (verified: `exhibitor.entity.ts`, `booth.entity.ts`, `sponsor-package.entity.ts`, `sponsor.entity.ts`, `lead.entity.ts`) |
| attendee | attendee | `Attendee`, `AttendeeProfile`, `AttendeeTag` (verified: `attendee.entity.ts`, `attendee-profile.entity.ts`, `attendee-tag.entity.ts`) |

## 4. Batch 3 — Participation

| Service | Schema | Key Entities |
|---|---|---|
| registration | registration | `Registration`, `RegistrationField` (verified: `registration.entity.ts`, `registration-field.entity.ts` — canon doc names `RegistrationForm`/`RegistrationAnswer`; actual code uses `RegistrationField` — see GAP-G9) |
| onsite | onsite | `CheckIn`, `BadgePrint`, `DeviceSession` (verified: `check-in.entity.ts`, `badge-print.entity.ts`, `device-session.entity.ts` — canon doc names `Badge`/`SessionAttendance`; actual code differs — see GAP-G9) |

## 5. Batch 4 — Commerce Core

| Service | Schema | Key Entities |
|---|---|---|
| ticketing | ticketing | `TicketProduct`, `Ticket`, `TicketEntitlement` (verified: `ticket-product.entity.ts`, `ticket.entity.ts`, `ticket-entitlement.entity.ts` — canon doc calls it `TicketType`; actual code uses `TicketProduct` — see GAP-G9) |
| pricing | pricing | `PriceRule`, `DiscountRule`, `PromoCode` (verified: `price-rule.entity.ts`, `discount-rule.entity.ts`, `promo-code.entity.ts` — canon doc names `Discount`; actual code uses `DiscountRule`) |
| inventory | inventory | `InventoryItem` (verified: `inventory-item.entity.ts` — canon doc names `InventoryPool`/`InventoryReservation`; actual code uses single `InventoryItem` — see GAP-G9) |
| order | order | `Order`, `OrderItem` (verified: `order.entity.ts`, `order-item.entity.ts`) |
| payment | payment | `Payment`, `Refund`, `PaymentTransaction` (verified: `payment.entity.ts`, `refund.entity.ts`, `payment-transaction.entity.ts`) |
| fulfillment | fulfillment | `Fulfillment` (verified: `fulfillment.entity.ts` — canon doc names `FulfillmentRequest`/`DeliveryRecord`; actual code uses single `Fulfillment` — see GAP-G9) |

## 6. Batch 5 — Engagement (Marketing)

| Service | Schema | Key Entities |
|---|---|---|
| notification | notification | `NotificationTemplate`, `NotificationLog`, `Campaign`, `AudienceSegment` (Campaign features implemented here, not in `engagement` — see note below) |
| engagement | engagement | **Near-empty stub** — `Poll`/`PollResponse`/`QAQuestion`/`Survey`/`SurveyResponse`/`Connection` were originally specified here but migrated to `networking`/`interactive-engagement` per GAP-2 (2026-06-14). `Campaign`/`AudienceSegment` were specified here in canon domain-model but are implemented under `notification` instead (GAP-G3, placement deviation from canon). |

## 7. Batch 6 — Intelligence (CQRS read models)

> **CQRS** (Command Query Responsibility Segregation) as applied here: write-side
> services emit Kafka events; `analytics` and `search` consume those events and
> maintain separate read-optimised projections. No direct DB reads cross service
> boundaries.

| Service | Schema | Key Entities |
|---|---|---|
| analytics | analytics | read-model projections (event/ticket/revenue aggregates) built from Kafka stream |
| search | search | OpenSearch-indexed projections of events/sessions/speakers/attendees |

## 8. Gap-Fill Batches (8–10)

> **"Gap-fill" batches**: these were added to close gaps discovered after the
> original Batch 1–7 sequence — they were not part of the initial blueprint but
> are fully implemented as of 2026-06-14 (contradicts stale `progress.md` —
> see GAP-G1 in `08_reports/ARCHITECTURAL_GAP_REGISTER.md`).

| Service | Schema | Key Entities |
|---|---|---|
| networking (Batch 8) | networking | `AttendeeConnection` (attendee-to-attendee social graph — verified: `attendee-connection.entity.ts`; canon doc uses name `Connection`) |
| interactive-engagement (Batch 9) | interactive_engagement | `Poll`, `PollResponse`, `QAQuestion`, `Survey`, `SurveyResponse` (verified: all entity files present; these migrated from `engagement` per GAP-2) |
| ai-service (Batch 10) | ai_service | `VectorEmbedding`, `AIInteractionLog` (verified: `vector-embedding.entity.ts`, `ai-interaction-log.entity.ts` — no "agent-automation records" entity exists in code) |

## 9. Cross-Cutting Services

| Service | Schema | Key Entities |
|---|---|---|
| integration | integration | `WebhookSubscription` |
| ui-renderer | — | not implemented (Phase E scaffold) |

## 10. Enterprise SSO Extension (additive to `auth`, GAP-6, 2026-06-14)

- `SsoConnection` (`auth.sso_connections`) — per-tenant IdP config: `id`,
  `tenantId`, `name`, `provider` (`oauth2`|`saml`), `domain`, `issuer`,
  `clientId?`, `clientSecret?`, `ssoUrl?`, `certificate?`,
  `attributeMapping` (jsonb), `enabled`, timestamps. Unique on
  `(tenantId, domain)`.
- `SsoIdentity` (`auth.sso_identities`) — links platform `User` to external
  IdP subject: `id`, `userId`, `connectionId`, `externalId`, `createdAt`.
  Unique on `(connectionId, externalId)`.
- Source: `services/auth/src/entities/sso-connection.entity.ts`,
  `services/auth/src/entities/sso-identity.entity.ts`.

## 11. Open Items / TBD

- **TBD – REQUIRES VERIFICATION**: exact field-level schema for every entity
  listed above — see `docs/canon/domain-model.md` for full field definitions;
  this summary intentionally omits field-by-field detail to avoid duplication
  drift (see Documentation Freshness Rule in
  `07_governance/AI_OPERATING_CONTEXT.md`).
- **TBD – REQUIRES VERIFICATION**: whether `notification.Campaign`/`AudienceSegment`
  (implemented) should be reassigned to `engagement` to match
  `docs/canon/domain-model.md`/`service-map.md`, or whether canon docs should
  be updated to reflect `notification` as the owner — tracked as GAP-G3 in
  `08_reports/ARCHITECTURAL_GAP_REGISTER.md`.
- **TBD – REQUIRES VERIFICATION**: future purpose of `services/engagement` —
  it currently has no entities and a stub controller/service. Candidates:
  remove entirely, or repurpose for a future feature.
- **TBD – REQUIRES VERIFICATION**: `tenant.Organization` entity purpose and
  relationship to `Tenant` — entity file exists (`organization.entity.ts`)
  but was not documented in any prior canon doc. Likely a multi-org / workspace
  model for enterprise tenants, but unconfirmed.
- **TBD – REQUIRES VERIFICATION**: `TenantSettings` creation timing — whether
  it is created as part of Tenant Onboarding (Workflow 1) with defaults, or
  configured separately post-onboarding. Workflow 1 in `PRODUCT_WORKFLOWS.md`
  does not mention it.
- **TBD – REQUIRES VERIFICATION**: `event.EventSettings` — referenced in
  `docs/canon/domain-model.md` but **no `event-settings.entity.ts` found** in
  `services/event/src/entities/`. The entity may not be implemented; lifecycle
  and purpose are undocumented. Canon doc may be ahead of implementation.
- **GAP-G9** (entity naming deviations between code and canon):
  Multiple entity names in this document differ from `docs/canon/domain-model.md`
  because the code (repository evidence) was used as the source of truth per
  AUDIT REMEDIATION rules. The affected entities are: `TicketProduct` (not
  `TicketType`), `DiscountRule` (not `Discount`), `InventoryItem` (not
  `InventoryPool`/`InventoryReservation`), `Fulfillment` (not
  `FulfillmentRequest`/`DeliveryRecord`), `RegistrationField` (not
  `RegistrationForm`/`RegistrationAnswer`), `BadgePrint`/`DeviceSession`
  (not `Badge`/`SessionAttendance`), `AttendeeConnection` (not `Connection`),
  and `Room` in `event` schema (not `agenda`). See
  `08_reports/ARCHITECTURAL_GAP_REGISTER.md` GAP-G9 for full detail and the
  decision on whether code or canon should be corrected.
