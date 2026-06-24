# EMS MASTER BUILD BLUEPRINT
### Unified V1 + V2 execution plan — no source `.docx` files modified or moved

This document reconciles **V1** (the original full-stack design: Foundation Packet 0 + 10 parallel build streams + Frontend + QC) with **V2** (the refined backend roadmap: restructured canon docs + 7 backend batches + leaner QC). It is meant to be the single ordered playbook for executing the prompts that already exist in `V1/` and `V2/`, in the correct sequence, with gaps and conflicts called out explicitly.

---

## 0. How V1 and V2 relate (read this first)

- **V1** is the original, complete plan. It covers foundation docs, all 10 backend streams, the full frontend build, infra/DevOps, and a QC framework scored per-stream and per-milestone.
- **V2** is a *later, narrower refinement* of the backend only. `V2/DOCS/Phase 1` literally instructs: *"restructure docs… do not modify content"* — i.e., V2 takes V1's foundation docs and reorganizes/extends them into a `docs/canon/` structure, then re-specifies the backend as 7 tighter batches (23 prompts) with more precise, CQRS-flavored entity names (e.g., `TicketProduct` / `InventoryReservation` / `OrderItem` instead of V1's flatter `ticket` / `order`).
- **V2 has no frontend, no design system, no AI layer, and does not cover V1's "Networking" or "Polls/Q&A/Survey" engagement features, nor V1's full Stream-10 DevOps scope (Docker/CI/Observability/Deployment).**

**Precedence rule for this blueprint:**
> Where V2 redefines something V1 already specified (domain model, service map, commerce entities, QC style) → **V2 wins**.
> Where V2 is silent (frontend, design system, AI layer, networking, interactive engagement, full DevOps, enterprise SSO) → **V1 fills the gap**.

---

## 1. Canonical Tech Stack (from V1 Foundation Prompt 3 — unchanged by V2)

| Layer | Choice |
|---|---|
| Backend | NestJS (modular monolith → event-driven services) |
| Frontend | Next.js + React + TypeScript |
| Database | PostgreSQL |
| Cache / locks / idempotency | Redis |
| Event streaming | Kafka (event bus + outbox pattern) |
| Search | OpenSearch |
| Architecture style | Multi-tenant SaaS, API-first, AI-compatible |

Repo root: `ems/` containing `apps/`, `services/`, `infra/`, `docs/`, `prompts/`.

---

## 2. PHASE A — Foundation & Canonical Documentation

Run V1 foundation prompts first (they create the initial docs), then apply V2's restructuring/extension on top.

### A1. V1 Packet 0 — Foundation Prompts (in order)
Source: `V1/BUILD/Packet 0 — Foundation Prompts/`

1. **Prompt 1 — Repository Bootstrap** → scaffolds `ems/{apps,services,infra,docs,prompts}` and `docs/{product,architecture,domain-model,api-standards,security}.md`
2. **Prompt 2 — Product Definition** → `docs/product.md` (users, event lifecycle, core modules, enterprise + AI capabilities)
3. **Prompt 3 — Architecture Design** → `docs/architecture.md` (stack table above, service boundaries, data flow, gateway, event bus, multi-tenant model)
4. **Prompt 4 — Domain Model** → `docs/domain-model.md` (initial entity list — see §3)
5. **Prompt 5 — API Standards** → `docs/api-standards.md` (REST conventions, versioning, error format, pagination, auth, rate limiting, idempotency)
6. **Prompt 6 — Security Model** → `docs/security.md` (authN, RBAC, SSO/SAML, API security, encryption, audit, tenant isolation)
7. **Prompt 7 — Service Map** → `docs/service-map.md` (initial 14-service list)
8. **Prompt 8 — AI Compatibility Layer** → `docs/ai-architecture.md` (vector storage, ai-service, semantic search, matchmaking, agent automation) — **flagged in §6 as a gap V2 never revisits**
9. **Design Prompt 1 — Design System Foundation** → `ems/design/{tokens,components,wireframes}` + `docs/design-system.md`
10. **Design Prompt 2 — UI Renderer Contract** → `ems/services/ui-renderer/spec.md`

### A2. QC-01 (Foundation Gate)
Source: `V1/QC/QC-01 for Foundation_.docx`
Score the 7 docs from step A1 (product, architecture, domain model, API standards, security, service map, AI architecture) until all = 10/10. **Do not proceed to A3 until this passes.**

### A3. V2 Phase 1 — Restructure Docs (non-destructive)
Source: `V2/DOCS/Phase 1/Prompt 1 — restructure docs.docx`
Create `docs/{canon,architecture,workflows,product,developer,ui}/` and **move** (not rewrite):
- `architecture.md` → `architecture/system-architecture.md`
- `domain-model.md` → `canon/domain-model.md`
- `service-map.md` → `canon/service-map.md`
- `api-standards.md` → `canon/api-standards.md`
- `security.md` → `canon/security-model.md`
- `product.md` → `product/product-overview.md`

> Note: `ai-architecture.md` and `design-system.md` are **not** addressed by V2's restructure prompt. Recommend placing them in `docs/architecture/ai-architecture.md` and `docs/ui/design-system.md` respectively to keep the new structure complete (extension of A3, same non-destructive spirit).

### A4. V2 Phase 2 — Domain Model, Service Map, Event Catalog
Source: `V2/DOCS/Phase 2/`
1. **Prompt 2 — domain model** → rewrite `docs/canon/domain-model.md` with the refined entity set (§3, "V2 refined" column)
2. **Prompt 3 — service map** → rewrite `docs/canon/service-map.md` with 19 services (§4), each documenting purpose, owned entities, published events, consumed events
3. **Prompt 4 — event catalog** → new `docs/canon/event-catalog.md` (§5)

### A5. V2 Phase 3 — Workflows, Read Models, Data Architecture, API & Security
Source: `V2/DOCS/Phase 3/`
1. **Prompt 5 — workflow catalog** → `docs/canon/workflow-catalog.md` (10 workflows, §7)
2. **Prompt 6 — read model catalog** → `docs/canon/read-model-catalog.md` (10 read models, §8)
3. **Prompt 7 — data architecture** → `docs/canon/data-architecture.md` (storage roles: PostgreSQL, Redis, Kafka, OpenSearch, object storage)
4. **Prompt 8 — api standards** → update `docs/canon/api-standards.md` (REST conventions, pagination, error format, response envelope, idempotency headers, versioning)
5. **Prompt 9 — security model** → update `docs/canon/security-model.md` (authN, RBAC roles, tenant isolation, audit logging, rate limiting, PII handling)

### A6. V2 Phase 4 — UI Surface Map, Capability Matrix, Workflow Docs
Source: `V2/DOCS/Phase 4/`
1. **Prompt 10 — ui surface map** → `docs/canon/ui-surface-map.md` (8 personas: organizer, attendee, platform admin, onsite staff, finance, support, exhibitor, speaker)
2. **Prompt 11 — capability matrix** → `docs/canon/capability-matrix.md` (V1 foundation / V2 commerce / V3 operations / V4 enterprise tiers — used in §9)
3. **Prompt 12 — workflows** → `docs/workflows/{event-lifecycle, checkout-flow, registration-flow, checkin-flow}.md`

---

## 3. Unified Domain Model

| Entity | Source | Notes |
|---|---|---|
| Tenant, Organization, TenantSettings | V1 P4 + V2 B1 | V2 adds `TenantSettings` |
| User, UserCredential, AuthSession | V1 P4 + V2 B1 | V2 splits credentials/sessions out |
| Role, Permission, UserRole | V1 P4 + V2 B1 | RBAC triad |
| Event, Venue, Room | V1 P4 + V2 B2 | unchanged |
| Track, Session, SessionSpeaker | V1 Stream-5 + V2 B2 | V2 adds `Track` explicitly |
| Speaker, SpeakerProfile | V1 Stream-5 + V2 B2 | V2 splits profile out |
| Exhibitor, Booth, SponsorPackage | V1 Stream-6 + V2 B2 | **V2 folds Sponsor into `SponsorPackage` under Exhibitor module** (see §6 conflict) |
| Attendee, AttendeeProfile, AttendeeTag | V1 Stream-7 + V2 B2 | V2 adds tagging |
| Registration, RegistrationStatus | V1 Stream-4 + V2 B3 | unchanged in spirit |
| CheckinRecord, Badge | V1 Stream-8 + V2 B3 | V2's `CheckinRecord` = V1's check-in entity |
| TicketProduct, Ticket, TicketEntitlement | V1 Stream-3 (flat `ticket`) + V2 B4 | **V2 splits one entity into three** |
| PriceRule, DiscountRule, PromoCode | V1 Stream-3 (pricing rules) + V2 B4 | V2 splits into three |
| InventoryPool, InventoryReservation | V1 Stream-3 (inventory + Redis lock) + V2 B4 | V2 formalizes reservation entity |
| Order, OrderItem, OrderStatus | V1 Stream-3 (flat `order`) + V2 B4 | V2 splits into three |
| Payment, PaymentTransaction, Refund | V1 Stream-3 (flat `payment`) + V2 B4 | V2 splits into three |
| NotificationMessage | V1 P4 (`notification`) + V2 B5 | unchanged in spirit |
| Campaign, AudienceSegment | V2 B5 only | **new in V2, no V1 equivalent** |
| AuditLog | V1 Stream-1 Bundle-3 + V2 B1 | unchanged |
| AttendeeConnection (networking) | **V1 Stream-7 Bundle-2 only** | **V2 gap — see §6** |
| Poll, Q&A, Survey | **V1 Stream-7 Bundle-3 only** | **V2 gap — see §6** |
| ScanningDevice | **V1 Stream-8 Bundle-1 only** | folds into Onsite/Check-in module |
| Lead (exhibitor lead capture) | **V1 Stream-6 Bundle-2 only** | should live under Exhibitor module alongside `Booth`/`SponsorPackage` |
| EventDashboardView, TicketSalesSummary, AttendanceMetrics | V2 B6 (read models) | replaces V1 Stream-9's `EventAnalytics`/`SessionAnalytics`/`ExhibitorAnalytics` write-side entities |

---

## 4. Unified Service Map (19 services, from V2 Phase 2 Prompt 3, cross-referenced to V1 streams)

| # | Service | V1 origin | V2 batch |
|---|---|---|---|
| 1 | auth | Stream-1 | Batch 1 |
| 2 | tenant | Stream-1 | Batch 1 |
| 3 | audit | Stream-1 (Bundle-3) | Batch 1 |
| 4 | event | Stream-2 | Batch 2 |
| 5 | agenda | Stream-5 | Batch 2 |
| 6 | speaker | Stream-5 | Batch 2 |
| 7 | exhibitor | Stream-6 | Batch 2 |
| 8 | attendee | Stream-7 | Batch 2 |
| 9 | registration | Stream-4 | Batch 3 |
| 10 | onsite (check-in) | Stream-8 | Batch 3 |
| 11 | ticketing | Stream-3 | Batch 4 |
| 12 | pricing | Stream-3 | Batch 4 |
| 13 | inventory | Stream-3 | Batch 4 |
| 14 | order | Stream-3 | Batch 4 |
| 15 | payment | Stream-3 | Batch 4 |
| 16 | fulfillment | Stream-3 | Batch 4 |
| 17 | notification | (P4 entity only) | Batch 5 |
| 18 | analytics | Stream-9 | Batch 6 |
| 19 | integration | Service Map P7 only | not yet built (gap) |

**Not in this 19-service list but required by V1 — must be added to `docs/canon/service-map.md`:**
- `search` (V2 Batch 6 Prompt 21 exists as a build prompt but the service itself is missing from the Phase 2 service-map prompt's list — add it)
- `networking` (V1 Stream-7 Bundle-2)
- `engagement` (V1 Stream-7 Bundle-3 — polls/Q&A/surveys; **distinct from V2's "Campaign" engagement in Batch 5**)
- `ai-service` (V1 Foundation Prompt 8)

---

## 5. Event Catalog (V2 Phase 2 Prompt 4 baseline + V1 stream events folded in)

**V2 baseline events:**
`EventCreated`, `EventPublished`, `EventCancelled`, `OrderCreated`, `PaymentAuthorized`, `PaymentCaptured`, `RefundIssued`, `TicketIssued`, `RegistrationSubmitted`, `RegistrationApproved`, `AttendeeCheckedIn`

**V1 events to merge in (not in V2 list — add during A4 step 3):**
- `event.lifecycle` (Stream-2: created/published/unpublished/archived — partially covered by `EventCreated`/`EventPublished`/`EventCancelled`, but **missing `EventArchived`/`EventUnpublished`**)
- `session.created`, `session.updated` (Stream-5)
- `exhibitor.created`, `lead.captured` (Stream-6)
- `attendee.connected`, `poll.submitted`, `survey.completed` (Stream-7 — depends on Phase C gap-fill, §6)
- `attendee.checked_in` (≈ `AttendeeCheckedIn`, dedupe), `session.attended` (Stream-8)
- `payment.completed` (≈ `PaymentCaptured`, dedupe), `registration.created`, `registration.confirmed` (≈ `RegistrationApproved`, dedupe)

---

## 6. PHASE B — Backend Build (V2 batches as primary spec; V1 bundles as implementation detail)

For each batch below, run the V2 prompt(s) first to establish entities/endpoints, then pull in the relevant V1 bundle(s) for implementation-level logic V2 doesn't spell out (Kafka topics, audit hooks, validation rules, Redis locking, etc.).

### Batch 1 — Platform Core
Source: `V2/BACKEND BUILD(REMAINING)/Batch 1 — Platform Core/` (Prompts 1–4: Auth, Tenant, RBAC, Audit)
V1 supplements: `Stream-1_ Core Platform/` Bundles 1, 2, 4 (core models, JWT auth + bcrypt + email verification, REST controllers)
**⚠ Conflict/gap:** V1 `Bundle 3 — Enterprise Identity` (OAuth2/SAML SSO, tenant isolation middleware) has **no V2 prompt**. Carry it forward as an extension of the Auth module — execute after Prompt 1, before QC.

### Batch 2 — Event Operations
Source: `V2/BACKEND BUILD(REMAINING)/Batch 2 — Event Operations/` (Prompts 5–9: Event, Agenda, Speaker, Exhibitor, Attendee)
V1 supplements:
- `Stream-2 — Event Management/` Bundles 1–4 (lifecycle states, CRUD APIs, cloning, OpenSearch indexing, Kafka emission, audit, tenant validation)
- `Stream-5 — Agenda & Speakers/` Bundles 1–4 (scheduling conflict prevention, capacity tracking, speaker assignment workflow)
- `Stream-6 — Exhibitors & Sponsors/` Bundles 1–4 (booth assignment, sponsor tiers, **Lead capture entity/API — fold into Exhibitor module**)
- `Stream-7 — Attendee Experience/` Bundle 1 only (attendee profile + schedule entity — Bundles 2/3 deferred to Phase C)

**⚠ Conflict:** V1 treats Sponsor as its own entity (`Stream-6 Bundle-1`); V2 only has `SponsorPackage` under Exhibitor. Resolution: model `Sponsor` as a tenant-event relationship that *holds* a `SponsorPackage` (tier), keeping V2's module boundary but preserving V1's tier/lead-capture business logic.

### Batch 3 — Participation
Source: `V2/BACKEND BUILD(REMAINING)/Batch 3 — Participation/` (Prompts 10–11: Registration, Check-in)
V1 supplements:
- `Stream-4 — Registration System/` Bundles 1–4 (workflow states, group registration, waitlist, commerce linkage, attendee generation)
- `Stream-8 — Onsite Operations/` Bundles 1–4 (badge entity + printing, ScanningDevice entity, QR validation, session attendance, device APIs)

### Batch 4 — Commerce Core
Source: `V2/BACKEND BUILD(REMAINING)/Batch 4 — Commerce Core/` (Prompts 12–17: Ticketing, Pricing, Inventory, Order, Payment, Fulfillment)
V1 supplements: `Stream-3 — Ticketing & Commerce/` Bundles 1–4 (Redis-backed inventory locking to prevent overselling, pricing tiers/early-bird/promo codes, Stripe-compatible checkout, QR ticket fulfillment, Kafka commerce events, audit on purchases/refunds)
This is the most heavily *re-architected* area — V2 splits V1's 3 flat entities (ticket/order/payment) into 11 entities across 6 modules. Build in the V2 module order (Ticketing → Pricing → Inventory → Order → Payment → Fulfillment) since each depends on the prior.

### Batch 5 — Engagement (Marketing)
Source: `V2/BACKEND BUILD(REMAINING)/Batch 5 — Engagement/` (Prompts 18–19: Notification, Campaign)
No direct V1 bundle equivalent — `NotificationMessage` traces to V1 Foundation Prompt 4's domain entity list only. Build as specified in V2.
**Do not confuse with Phase C's "Interactive Engagement" (polls/Q&A/surveys) — these are two different services.**

### Batch 6 — Intelligence
Source: `V2/BACKEND BUILD(REMAINING)/Batch 6 — Intelligence/` (Prompts 20–21: Analytics, Search)
V1 supplements: `Stream-9 — Analytics & Reporting/` Bundles 2–4 (Kafka-consumer aggregation pipeline feeding the V2 read models, revenue/engagement/sponsor-ROI reporting logic, CSV/JSON export APIs, tenant-scoped analytics access control)
V2's `EventDashboardView` / `TicketSalesSummary` / `AttendanceMetrics` read models replace V1's `EventAnalytics`/`SessionAnalytics`/`ExhibitorAnalytics` write-side tables — implement as projections fed by Batch 7's event bus.

### Batch 7 — Infra Layer (logical infrastructure)
Source: `V2/BACKEND BUILD(REMAINING)/Batch 7 — Infra Layer/` (Prompts 22–23: Event Bus, Cache & Idempotency)
- Event Bus: Kafka pattern, domain events, publishers/subscribers, **outbox pattern**
- Cache & Idempotency: Redis cache layer, rate limiting, idempotency keys, inventory reservation TTL

This batch is a **prerequisite dependency for Batches 1–6** in practice (every batch emits/consumes Kafka events and several use Redis locking/TTL). Recommend running Batch 7 prompts **first**, immediately after Phase A, even though V2 numbers it last — or at minimum stub the event bus + Redis cache before Batch 4 (Commerce Core), which hard-depends on Redis locking for inventory.

---

## 7. PHASE C — Gap-Fill Modules (V1-only capabilities with no V2 prompt)

These exist in V1's design but were dropped/not-yet-revisited in V2. To keep the merged system coherent, treat them as **new batches appended to the V2 numbering** (Batch 8+), written in V2's prompt style and validated with V2's Batch QC process.

| New Batch | Covers | V1 source |
|---|---|---|
| **Batch 8 — Social** | `networking` service: `AttendeeConnection` entity, connection request/accept, attendee directory search (OpenSearch) | `Stream-7 Bundle-2 — Networking Logic` |
| **Batch 9 — Interactive Engagement** | `engagement` service: `Poll`, `Q&A`, `Survey` entities + APIs, events `poll.submitted`/`survey.completed` | `Stream-7 Bundle-3 — Engagement` |
| **Batch 10 — AI Layer** | `ai-service`: vector storage, semantic search, attendee matchmaking, event analytics AI, agent automation hooks | `Foundation Prompt 8 — AI Compatibility Layer` |

Each of these should get a corresponding entry added to `docs/canon/service-map.md` (§4), `docs/canon/event-catalog.md` (§5), and a Batch QC pass (§9).

---

## 8. PHASE D — Infrastructure & DevOps (V1 Stream-10, full scope — V2 covers only a subset)

Source: `V1/BUILD/Stream-10 — Infrastructure & DevOps/`

1. **Bundle 1 — Containerization**: Dockerfiles for NestJS services and Next.js frontend (`ems/infra/docker`), docker-compose for local dev (PostgreSQL, Redis, Kafka, OpenSearch)
2. **Bundle 2 — CI Pipeline**: GitHub Actions (`ems/.github/workflows`) — build/test, lint/type-check, automated unit tests
3. **Bundle 3 — Observability**: structured JSON logging, metrics collection (latency/errors), distributed tracing hooks
4. **Bundle 4 — Deployment Scaffolding**: `ems/infra/deployment`, env config for dev/staging/production, secrets management placeholders

V2's Batch 7 (Event Bus + Cache) is a **logical/application-layer subset** of this phase's infrastructure — Bundle 1's docker-compose must provision Kafka and Redis for Batch 7 to function. Sequencing: **Bundle 1 → Batch 7 → remaining batches → Bundles 2–4**.

---

## 9. PHASE E — Frontend Build (V1 only — 14 sequential tasks, unchanged)

Source: `V1/BUILD/FRONTEND-CLAUDE/`

1. TASK 01 — Anchor Docs (read `ems/docs/{product,architecture,domain-model,api-standards,service-map}.md` — **update these paths to the new `docs/canon/...` locations from Phase A**)
2. TASK 02 — Load Design Language (`ems/design-language/design-language.html`)
3. TASK 03 — Create Frontend App (`ems/apps/web`, Next.js + React + TS)
4. TASK 04 — Map Design Tokens (`styles/tokens.css`, `tailwind.config.js`)
5. TASK 05 — Load Wireframes (`ems/design-language/wireframes/`)
6. TASK 06 — Create Renderer (`ems/apps/web/renderer`)
7. TASK 07 — Generate Layouts (AppLayout, DashboardLayout, EventLayout, AdminLayout)
8. TASK 08 — Generate UI Components (Button, Card, Input, Table, Modal, Badge, Avatar)
9. TASK 09 — API Service Layer (`auth.ts`, `events.ts`, `tickets.ts`, `registration.ts`, `attendees.ts`, `analytics.ts` — **extend with services for Batches 5/6/8/9/10 once built**)
10. TASK 10 — Organizer Dashboard (`/dashboard`, `/events`, `/tickets`, `/registrations`, `/analytics`)
11. TASK 11 — Attendee Portal (`/events`, `/event/[id]`, `/schedule`, `/networking`, `/profile`)
12. TASK 12 — Admin Console (`/admin/users`, `/admin/tenants`, `/admin/events`, `/admin/system`)
13. TASK 13 — Dummy Data (seed events, tickets, registrations, attendees, sessions, analytics)
14. TASK 14 — Deployment Prep (Next.js build, Dockerfile, Render config, env-configurable API endpoints)

The two **Page Structure references** (`V1/Event Management System (Complete Structure).docx` and `V1/Ticketing System (Complete Structure).docx`) define the full route maps for the Organizer/Attendee EMS UI and the Ticketing/Commerce UI respectively — both should be treated as binding inputs to TASK 07/10/11/12.

---

## 10. Unified QC Framework

V1's QC is *per-stream + per-milestone + final*; V2's QC is *per-batch + repo + integration + hardening*. Merge as follows:

| Stage | When | Source | Notes |
|---|---|---|---|
| QC-01 | After Phase A1 | V1 `QC-01 for Foundation_` | Gate before V2 doc restructure |
| Repo QC | After Phase A (full, incl. V2 restructure) | V2 `Repo QC` | Validates new `docs/canon` structure & module folders |
| Batch QC | After **every** Batch in Phases B/C (1–10) | V2 `Batch QC (after every batch)` | Replaces V1's per-stream QC-02…QC-11 for batches with V2 equivalents |
| Stream QC (legacy) | For Phase D (infra) only | V1 `QC-11 — Stream-10` | No V2 equivalent for full DevOps scope |
| Milestone QC | After Batch groups (see grouping below) | V1 `QC-M1…QC-M4` | Re-purposed as cross-batch checkpoints |
| Integration QC | After all Batches (B+C+D) | V2 `Integration QC (after all batches)` | Producer/consumer alignment, workflow/read-model consistency |
| QC-FINAL | After Phase E (frontend) | V1 `QC-FINAL — Full Platform Validation` | End-to-end platform validation, sets `READY_FOR_TESTING = TRUE` |
| Final Hardening | Last step | Merge of V1 `QC-HARDEN` + V2 `Final Hardening QC` | Combine both checklists (dependency security, container security, transactional boundaries, idempotency, outbox reliability, observability, load readiness) → `PRODUCTION_READY = TRUE` |

**Milestone grouping (re-mapped from V1 QC-M1…M4 onto the new batch numbering):**
- **QC-M1** (Core Platform): Batch 1
- **QC-M2** (Commerce Layer): Batch 4 + Batch 3 (registration ties to commerce)
- **QC-M3** (Event Operations): Batch 2 + Batch 8 + Batch 9
- **QC-M4** (Live Event Systems): Batch 3 (check-in portion) + Batch 6 + Phase D (infra)

---

## 11. Recommended End-to-End Execution Order

```
PHASE A   Foundation & Canon Docs        (A1 → QC-01 → A3 → A4 → A5 → A6)
PHASE D.1 Containerization (docker-compose: Postgres/Redis/Kafka/OpenSearch)
BATCH 7   Event Bus + Cache/Idempotency   (logical infra prerequisite)
BATCH 1   Platform Core (+ SSO carryover) → Batch QC → QC-M1
BATCH 4   Commerce Core (Ticketing→Pricing→Inventory→Order→Payment→Fulfillment) → Batch QC
BATCH 3   Participation (Registration, Check-in) → Batch QC → QC-M2
BATCH 2   Event Operations (Event, Agenda, Speaker, Exhibitor, Attendee) → Batch QC
BATCH 8   Social / Networking → Batch QC
BATCH 9   Interactive Engagement (Polls/Q&A/Survey) → Batch QC → QC-M3
BATCH 5   Engagement (Notification, Campaign) → Batch QC
BATCH 6   Intelligence (Analytics, Search) → Batch QC
BATCH 10  AI Layer → Batch QC
PHASE D.2-4 CI Pipeline, Observability, Deployment Scaffolding → QC-11 → QC-M4
          Repo QC + Integration QC
PHASE E   Frontend (TASK 01 → TASK 14)
QC-FINAL  Full Platform Validation
HARDENING Merged QC-HARDEN + Final Hardening QC → PRODUCTION_READY
```

---

## 12. Summary of Gaps Requiring New Prompts (none of these exist yet in either V1 or V2)

1. **Enterprise SSO extension prompt** for Batch 1 (OAuth2/SAML, tenant isolation middleware) — content exists in V1 `Stream-1 Bundle-3` but needs to be reformatted as a V2-style prompt.
2. **Batch 8 — Social (Networking)** prompt — derive from V1 `Stream-7 Bundle-2`.
3. **Batch 9 — Interactive Engagement (Polls/Q&A/Survey)** prompt — derive from V1 `Stream-7 Bundle-3`.
4. **Batch 10 — AI Layer** prompt — derive from V1 Foundation `Prompt 8`.
5. **`search` and `ai-service` entries** missing from V2's 19-service map (Phase 2 Prompt 3) — needs amendment when A4 runs.
6. **`EventArchived` / `EventUnpublished`** events missing from V2 event catalog — needs amendment when A4 runs.
7. **Sponsor vs. SponsorPackage** entity reconciliation (§6, Batch 2 conflict) — needs a short design note in `docs/canon/domain-model.md`.

---

*This blueprint is additive only — all 125 source `.docx` files remain in their original `V1/`/`V2/` locations and folder structure. This file (`BUILD_BLUEPRINT.md`) is the only new artifact, placed at the EMS workspace root.*
