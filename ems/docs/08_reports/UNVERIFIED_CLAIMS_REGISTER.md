Status: Active
Authority Level: Medium
Last Reviewed: 2026-06-17
Owner: AI

# Unverified Claims Register

> Produced by: Pre-Frontend Doc-to-Code Delta Audit, 2026-06-17.
> **All 9 claims resolved by Phase 3.25 (2026-06-17).**
> Lists documentation claims that could not be fully verified against code
> during the prior audit pass. All are now resolved.

## UC-1: Outbox Pattern Implementation Completeness — ✅ RESOLVED (PARTIALLY INCORRECT CLAIM)

- **Claim**: Services use `TenantScopedRepository.buildOutboxEntry()` within a Postgres transaction.
- **Verification (Phase 3.25)**:
  - Outbox relay IS implemented: `infra/event-bus/src/outbox.entity.ts` (OutboxEntity) + `outbox.relay.ts` (OutboxRelay) registered in EventBusModule, polling every 5 seconds.
  - HOWEVER: **zero services write to the outbox table**. All 26 services call `eventBus.publish()` directly. Zero services extend `TenantScopedRepository`. `buildOutboxEntry()` exists in base class but is never called.
  - The outbox table is always empty — the relay finds no records to dispatch.
- **Accurate state**: Outbox infrastructure exists but is bypassed. Event delivery is direct (not transactional). The relay would work if services wrote to the outbox, but none do.
- **Resolution**: `EVENT_AND_QUEUE_ARCHITECTURE.md` §3 corrected 2026-06-17 with accurate description. DLQ risk documented in GAP-B6 / OCR-4.
- **Resolved**: 2026-06-17

---

## UC-2: Kafka Consumer Group IDs per Service — ✅ RESOLVED (VERIFIED)

- **Claim**: Services may share consumer group IDs, causing silent event loss.
- **Verification (Phase 3.25)**: Grepped all service `subscribe()` calls. Every subscribing service passes a unique group ID string:
  - `integration-service`, `ai-service`, `fulfillment-service`, `ticketing-service`, `onsite-service`, `audit-service`, `auth-service`, `registration-service`, `attendee-service`, `order-service`, `rbac-service`, `analytics-service`, `search-service`, `notification-service`, `interactive-engagement-service`, `exhibitor-service`, `speaker-service`, `agenda-service`, `networking-service`, `inventory-service`
- **Resolution**: No shared consumer groups. Fan-out is correct — every subscribing service gets its own copy of each event.
- **Resolved**: 2026-06-17

---

## UC-3: `@RequirePermissions` Coverage Beyond 4 Verified Services — ✅ RESOLVED (CONFIRMED)

- **Claim**: GAP-B1 may overstate the permission gap if other services were updated.
- **Verification (Phase 3.25)**: Grepped all `services/*/src/*.controller.ts` files. `@RequirePermissions` appears in exactly **4 files**: `auth.controller.ts`, `audit.controller.ts`, `rbac.controller.ts`, `tenant.controller.ts`. No additional services have been decorated since the Phase 2 audit.
- **Resolution**: GAP-B1 is accurate. 22 controllers rely on `JwtAuthGuard` only. `USER_ROLES_AND_PERMISSIONS.md` §6 updated to reflect this as verified.
- **Resolved**: 2026-06-17

---

## UC-4: Agenda/Speaker `/sessions` Controller Routing Collision — ✅ RESOLVED (GAP DOWNGRADED)

- **Claim**: Both `agenda` and `speaker` declare `@Controller('sessions')`, causing ambiguity.
- **Verification (Phase 3.25)**: Confirmed in Phase 2.9 (Determinability Review). Speaker routes under `/sessions` are all two-segment paths (e.g., `/sessions/:sessionId/speakers`). Agenda routes are single-segment (`/sessions/:id`). NestJS resolves these without collision due to path depth.
- **Resolution**: GAP-B5 downgraded to Low (latent risk). No unreachable routes in current code.
- **Resolved**: 2026-06-17

---

## UC-5: Kafka Subscriber List Completeness — ✅ RESOLVED (VERIFIED)

- **Claim**: Subscriber list in `EVENT_AND_QUEUE_ARCHITECTURE.md` may be incomplete.
- **Verification (Phase 3.25)**: All `subscribe()` call sites extracted from service files. Key findings:
  - `auth-service` subscribes to `['tenant.created']`
  - `registration-service` subscribes to `['event.cancelled']`
  - `attendee-service` subscribes to `['registration.confirmed']`
  - `fulfillment-service` subscribes to `['order.paid']`
  - `ticketing-service` subscribes to `['fulfillment.completed']`
  - `onsite-service` subscribes to `['attendee.created']`
  - `order-service` subscribes to `['payment.completed', 'payment.failed', 'fulfillment.completed']`
  - Other services subscribe to multiple topics (analytics, search, notification, integration cover broad topic sets)
- **Resolution**: Topic table in `EVENT_AND_QUEUE_ARCHITECTURE.md` §5 was already accurate for these key events; no mass correction needed.
- **Resolved**: 2026-06-17

---

## UC-6: Fulfillment Trigger Topic — ✅ RESOLVED (DOCUMENTATION ERROR CORRECTED)

- **Claim**: `EVENT_AND_QUEUE_ARCHITECTURE.md` showed fulfillment subscribing to `payment.completed`.
- **Verification (Phase 3.25)**: Read `services/fulfillment/src/fulfillment.service.ts`. Confirmed: `eventBus.subscribe('fulfillment-service', ['order.paid'], ...)`. Fulfillment subscribes to **`order.paid`**, not `payment.completed`.
- **Actual commerce chain (verified from code)**:
  1. `POST /v1/orders` → order created, inventory reserved, `order.created` published
  2. `POST /v1/payments` → payment record created (status: pending)
  3. `POST /v1/payments/:id/complete` → `payment.completed` published
  4. `order-service` subscribes to `payment.completed` → marks order `paid` → publishes `order.paid`
  5. `fulfillment-service` subscribes to `order.paid` → creates fulfillment → publishes `fulfillment.completed`
  6. `ticketing-service` subscribes to `fulfillment.completed` → issues tickets
  7. `order-service` also subscribes to `fulfillment.completed` → marks order `fulfilled` → publishes `order.fulfilled`
- **Resolution**: The topic table in `EVENT_AND_QUEUE_ARCHITECTURE.md` §5 was already correct (line 129 showed fulfillment as subscriber to `order.paid`). Potential confusion was in prose descriptions elsewhere. UC-6 is resolved — no table corrections required.
- **Resolved**: 2026-06-17

---

## UC-7: Registration Status Machine Completeness — ✅ RESOLVED (VERIFIED)

- **Claim**: Registration entity may not match the 5 documented status values.
- **Verification (Phase 3.25)**: Read `services/registration/src/entities/registration.entity.ts`. Confirmed `RegistrationStatus` type: `'submitted' | 'approved' | 'confirmed' | 'waitlisted' | 'cancelled'` — exactly 5 values matching `SERVICE_CATALOG.md`.
- **Resolution**: Registration status machine is accurately documented. No correction needed.
- **Resolved**: 2026-06-17

---

## UC-8: `docs/legacy/ai-architecture.md` Accuracy vs Current Code — ✅ RESOLVED (CORRECTIONS APPLIED)

- **Claim**: Legacy AI architecture doc may contain inaccurate claims about OpenSearch and agent automation.
- **Verification (Phase 3.25)**: Read `docs/legacy/ai-architecture.md` and compared to actual `services/ai-service` code. Contradictions found:
  - Doc claims embedding API is called → Code stores `vector: []` (placeholder)
  - Doc claims OpenSearch k-NN is used → Code uses Postgres ILIKE (no OpenSearch client)
  - Doc describes agent automation entities → No such entities exist in code
- **Resolution**: Correction notice added to `docs/legacy/ai-architecture.md` header (2026-06-17). Document flagged as historical design intent only; `SERVICE_CATALOG.md` is authoritative for actual AI service state.
- **Resolved**: 2026-06-17

---

## UC-9: Multi-Tenancy Row-Level Enforcement in All Services — ✅ RESOLVED (CLAIM PARTIALLY INCORRECT)

- **Claim**: All 26 services enforce tenant isolation via `TenantScopedRepository` base class.
- **Verification (Phase 3.25)**: Grepped all service files for `TenantScopedRepository`. Zero matches. All services inject `Repository<Entity>` directly from TypeORM. Services manually scope their queries by including `tenantId` in `where` conditions (e.g., `findOne({ where: { id, tenantId } })`).
- **Resolution**: Tenant isolation is enforced per-query manually, not through a shared base class. `AUTH_AND_TENANCY_CONTRACT.md` and `AI_OPERATING_CONTEXT.md` references to "base repository enforcement" are misleading — the base class exists but is unused. Risk: any service that omits `tenantId` from a query could expose cross-tenant data. This is a code review concern, not a documented feature. `FULLSTACK_STITCHING_CONTRACT.md` §3 reference updated.
- **Resolved**: 2026-06-17

---

## Summary — All Claims Resolved

| ID | Area | Finding | Action Taken |
|---|---|---|---|
| UC-1 | Outbox pattern | NOT in use — all services call publish() directly | `EVENT_AND_QUEUE_ARCHITECTURE.md` §3 corrected |
| UC-2 | Kafka consumer groups | Unique per service — verified | No doc change needed |
| UC-3 | @RequirePermissions coverage | Exactly 4 controllers — confirmed | `USER_ROLES_AND_PERMISSIONS.md` §6 updated |
| UC-4 | Controller routing collision | No real collision — path depths differ | GAP-B5 downgrade confirmed |
| UC-5 | Kafka subscriber list | Key subscribers verified from code | No correction needed |
| UC-6 | Fulfillment trigger | Subscribes to `order.paid` (not `payment.completed`) | Topic table was already correct |
| UC-7 | Registration status | 5 exact values confirmed | No correction needed |
| UC-8 | AI architecture doc | OpenSearch/agent claims incorrect | Correction header added to legacy doc |
| UC-9 | Multi-tenant base repo | Base class unused — manual tenantId filtering | Legacy doc headers corrected |
