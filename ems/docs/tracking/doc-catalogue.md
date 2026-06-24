> **Status: Obsolete.** This index covers 57 files as of 2026-06-13 and
> does not include the 46+ governance, backend authority, contracts, and
> report documents created since. It predates all Phase 1 and Phase 2
> normalization work. For the current authoritative document inventory see
> `docs/08_reports/DOCUMENT_INVENTORY.md` (2026-06-17). Relocated from
> repository root to `docs/tracking/` on 2026-06-17 (SAFE_REPOSITORY_HYGIENE).

# Documentation Catalogue

Index of every `.md` file in the workspace (excluding `node_modules`), with its
purpose/description and — for `services/*` and `infra/*` — its build batch and
current implementation status. Generated from a full line-by-line read of all
57 files as of 2026-06-13.

> Note on "Status" columns below: many `services/*/README.md` and
> `infra/*/README.md` files still say `Status: SCAFFOLD - not yet implemented`.
> These lines were written when the scaffolds were first created (Phase A/B) and
> have **not** been updated as Batches 1–6 and Phase D were completed. The
> "Actual status" column reflects real implementation state as verified by
> `tsc --noEmit` during this build. The README files themselves are left as-is
> (they still serve as pointers to source `.docx` prompts).

---

## Root

| File | Description |
|---|---|
| `README.md` | Top-level repo guide (37 lines). Explains the skeleton layout (`docs/`, `design/`, `apps/web/`, `services/`, `infra/`, `prompts/`), gives a 5-step "how to use this skeleton" sequence (Phase A docs → infra/docker → infra/event-bus+cache → services/* in batch order with QC after each → apps/web last), and notes that original `/V1`, `/V2`, and `/BUILD_BLUEPRINT.md` source material remain unmodified at the workspace root. |

---

## docs/canon — Canonical Reference Docs (Phase A)

These are the authoritative, cross-cutting reference docs that every service/batch implementation must conform to.

| File | Description |
|---|---|
| `docs/canon/domain-model.md` | (373 lines) Authoritative entity/field/ownership model for every service, organized by batch 1–10 plus a cross-cutting §10. Covers: Platform Core (Tenant, Organization, TenantSettings, User, UserCredential, AuthSession, Role, Permission, UserRole, AuditLog); Event Operations (Event, Venue, Room, Track, Session, Speaker/SpeakerProfile/SessionSpeaker, Exhibitor/Booth/SponsorPackage/Sponsor/Lead, Attendee/AttendeeProfile/AttendeeTag); Participation (Registration + status/profile/questions, CheckinRecord, Badge, ScanningDevice, SessionAttendance); Commerce Core's 11 entities across 6 modules (TicketProduct, Ticket, TicketEntitlement, PriceRule, DiscountRule, PromoCode, InventoryPool, InventoryReservation, Order, OrderItem, OrderStatus, Payment, PaymentTransaction, Refund, Fulfillment-as-process); Engagement (NotificationMessage, Campaign, AudienceSegment); Social Batch 8 (AttendeeConnection); Interactive Engagement Batch 9 (Poll, PollResponse, QAQuestion, Survey, SurveyResponse); Intelligence read models (EventDashboardView, TicketSalesSummary, AttendanceMetrics) + OpenSearch indices; AI Layer Batch 10 (VectorEmbedding, AIInteractionLog). §10 documents the V1/V2 "Sponsor vs SponsorPackage" reconciliation, tenant isolation rule (every table carries `tenant_id` except Tenant/Permission/OpenSearch), the generic per-service `outbox` table, and the "no cross-service FKs — IDs only, consistency via events" rule. |
| `docs/canon/service-map.md` | (252 lines) One section per service across Batches 1–10 plus Phase E and cross-cutting: for each of the 26 services/modules (auth, tenant, rbac, audit, event, agenda, speaker, exhibitor, attendee, registration, onsite, ticketing, pricing, inventory, order, payment, fulfillment, notification, engagement, analytics, search, networking, interactive-engagement, ai-service, ui-renderer, integration, plus infra/event-bus & infra/cache) it lists Purpose, Owns (entities), Publishes (topics), Consumes (topics). Ends with a "Service Count Summary" table grouping services by module/batch and confirming 26 services total (24 application services + 2 infra modules) matching the 26 `services/` folders. |
| `docs/canon/event-catalog.md` | (125 lines) Full Kafka topic catalogue across 8 numbered sections (Platform Core, Event Operations, Participation, Commerce Core, Engagement/Marketing, Social Batch 8, Interactive Engagement Batch 9, AI Layer Batch 10) — each topic with Producer, Consumers, payload highlights; marks V1-merged events with `(V1)`. §9 documents wildcard consumers (`audit` and `analytics` subscribe to everything; `integration` subscribes per-tenant to a configurable subset). §10 defines naming conventions: `<owning_domain>.<past_tense_event>`, one topic per event type, versioning via topic suffix (`order.paid.v2`). Every event envelope includes `event_id`, `event_type`, `tenant_id`, `occurred_at`, `payload`; consumers must dedupe on `event_id`. |
| `docs/canon/api-standards.md` | (128 lines) REST conventions across 10 sections: §1 versioning (`/v1/...`, 90-day deprecation window, event payload versioning mirrors API versioning); §2 routing (resource-oriented plural nouns, tenant scoping via JWT only, max 2-level nesting); §3 response envelope (`{data, meta}` success / `{error, meta}` failure shapes) plus a full error-code table (400 VALIDATION_ERROR … 500 INTERNAL_ERROR); §4 cursor-based pagination (`?cursor=&limit=`, `nextCursor`/`total` in `meta`); §5 auth (Bearer JWT, claims `sub`/`tenant_id`/`roles[]`, RBAC guard per controller method); §6 rate limiting (Redis sliding window, 100 req/min write / 600 req/min read per tenant, `429` + `Retry-After`); §7 idempotency (`Idempotency-Key` header for financial/inventory mutations, Redis-backed 24h replay store, Kafka consumers dedupe on `event_id`); §8 filtering/sorting (whitelisted fields only); §9 validation (`class-validator` DTOs, `409 CONFLICT` for tenant-scoped uniqueness); §10 webhooks (HMAC-SHA256 signed, `X-EMS-Signature`, exponential backoff, 5 retries, dead-letter to `AuditLog`). |
| `docs/canon/security-model.md` | (107 lines) Security model across 8 sections: §1 authentication (JWT access ~15min + rotated refresh tokens hashed in `AuthSession`, bcrypt/argon2 password hashes, optional TOTP MFA, OAuth2/SAML enterprise SSO as an `auth` module extension); §2 RBAC (tenant-scoped roles, global immutable permission codes, `UserRole` join, Redis-cached permission resolution invalidated on `role.assigned`/`role.revoked`) including a default-roles table seeded on `tenant.created` (`tenant_admin`, `organizer`, `finance`, `support`, `exhibitor`, `speaker`, `onsite_staff`, `attendee`) plus global `platform_admin`; §3 tenant isolation (base-repository `WHERE tenant_id` injection, lint rule against raw queries, `tenant_id` derived server-side from JWT only, `/v1/admin/*` superuser bypass is fully audited); §4 PII handling (column-level encryption for non-queryable PII, exclusion from search/AI payloads beyond attendee-public fields, GDPR-style export/erasure via `platform_admin`); §5 API security (TLS at infra layer, CORS per `TenantSettings`, output encoding against XSS, ORM-parameterized queries); §6 rate limiting & abuse (login lockout, CAPTCHA on public registration/ticket endpoints, TTL-bound inventory holds); §7 audit logging (`audit` consumes full event stream, append-only `AuditLog`, mandatory audit for auth/role/tenant/financial events); §8 secrets management (provider credentials in deployment secret store, never in DB/source control). |
| `docs/canon/data-architecture.md` | (85 lines) Storage role of each backing technology across 6 sections: §1 PostgreSQL (one schema per service, shared instance for Phase 1, no cross-schema FKs, per-service `outbox` table with `id/event_type/tenant_id/payload/created_at/dispatched_at`, independently versioned migrations); §2 Redis (key-pattern table for idempotency `idem:{tenant}:{key}` 24h TTL, inventory holds `inv:{pool}:{order}`, rate limiting `ratelimit:{tenant}:{route_group}` 1min window, RBAC permission cache, refresh-token denylist); §3 Kafka (topics partitioned by `tenant_id`, outbox relay publishes + marks `dispatched_at`, per-service consumer groups, 7–30 day retention); §4 OpenSearch (`events`/`sessions`/`speakers`/`attendees` indices owned by `search`, tenant-scoped filter on every query, vector fields populated via `embedding.updated`); §5 object storage (bucket/prefix table — `badges/`, `exports/`, `assets/`, `attachments/` — accessed only via signed URLs); §6 data lifecycle (archival on `event.archived`, tenant offboarding cascade, PostgreSQL PITR backups — Kafka/Redis are not durable system-of-record). |
| `docs/canon/read-model-catalog.md` | (90 lines) Catalogue of 10 numbered analytics read models — Event Dashboard, Agenda Planner, Ticket Sales Summary, Inventory Status, Order Detail, Payment Ledger, Attendee Profile (360 view), Registration Approvals Queue, Check-in Console, Analytics Dashboard (tenant-level) — each with Owner, "Built from" source events, Shape, and target UI Surface. Closing section documents the 4 `search`-owned OpenSearch indices (`events`, `sessions`, `speakers`, `attendees`) and notes they're augmented with `VectorEmbedding` data via `embedding.updated` for semantic search. |
| `docs/canon/ui-surface-map.md` | (86 lines) Full route map for `apps/web` (Next.js App Router) organized into 8 persona sections — Platform Admin, Organizer, Finance, Support, Exhibitor, Speaker, Onsite Staff, Attendee (public + account) — each route with Purpose and backing read model/services. Closing "Cross-Cutting UI Elements" section covers RBAC-driven global nav, notification center (sourced from `notification`), and tenant branding via design tokens. |
| `docs/canon/workflow-catalog.md` | (125 lines) High-level catalogue of 10 numbered cross-service workflows: Tenant Onboarding, Event Lifecycle, Agenda Management, Speaker Management, Ticket Setup, Checkout, Refund, Registration, Check-in, Campaign Delivery. Each lists participating services, trigger, step sequence, and emitted events; the four highest-traffic (Event Lifecycle, Checkout, Registration, Check-in) point to detailed diagrams in `docs/workflows/`. |
| `docs/canon/capability-matrix.md` | (89 lines) Maps delivery tiers T1–T4 to services and build batches. T1 Foundation (auth/tenant/rbac/audit, event, agenda, speaker, exhibitor, attendee, registration, onsite — Batches 1–3); T2 Commerce (ticketing, pricing, inventory, order, payment, fulfillment — Batch 4); T3 Operations & Intelligence (notification, engagement, analytics, search — Batches 5–6, plus infra/event-bus & infra/cache — Batch 7); T4 Enterprise & Engagement (networking — Batch 8, interactive-engagement — Batch 9, ai-service — Batch 10, enterprise SSO/integration/DevOps — Phase D, apps/web/design-system/ui-renderer — Phase E). Includes a "Tier-to-Persona Readiness" table and a "Build Order Rationale" explaining the strict T1→T2→T3→T4 dependency chain. |

---

## docs/architecture — System & AI Architecture (Phase A)

| File | Description |
|---|---|
| `docs/architecture/system-architecture.md` | (133 lines) §1 technology stack table (NestJS/TypeScript backend, Next.js+React frontend, PostgreSQL system-of-record, Redis cache/locks/idempotency, Kafka event streaming with outbox, OpenSearch, S3-compatible object storage); §2 architecture style — "modular monolith evolving into event-driven services," Phase 1 (Batches 1–6) deployed as in-process NestJS modules with hard module boundaries (separate schemas, no cross-module DB access), cross-module async communication only via Kafka+outbox, read-heavy UI served by `analytics`/`search` read models (the CQRS seam); §3 service boundaries ASCII diagram grouping all services by module (Platform Core → AI Layer → Infra); §4 data flow — §4.1 synchronous request path (client → API gateway → auth guard → tenant isolation middleware → RBAC guard → service), §4.2 asynchronous event-driven pattern (outbox → Kafka → consumer), §4.3 search & analytics consumption; §5 API gateway responsibilities (TLS, JWT validation, tenant resolution, rate limiting, envelope enforcement, versioning); §6 event bus (outbox pattern detail, `<domain>.<event>` topic naming, idempotent consumers); §7 multi-tenant model (shared DB/schema row-level `tenant_id` isolation, enforcement middleware, tenant onboarding entities, `platform_admin` cross-tenant bypass); §8 repository layout reference (ASCII tree of `apps/web`, `services/<name>/`, `infra/{docker,deployment,event-bus,cache}`, `design/`, `docs/`, `prompts/`); §9 build sequencing pointer to `BUILD_BLUEPRINT.md` §11 (Phase A → infra/docker → infra/event-bus+cache → Batches 1–10 → Phase D → Phase E). |
| `docs/architecture/ai-architecture.md` | (119 lines) Design for `services/ai-service` (Batch 10, gap-fill, not yet started) across 8 sections: §1 goals (semantic search, attendee matchmaking, AI assistants, agent automation); §2 service boundary (all AI features encapsulated in `ai-service`; other services expose data via events/read APIs and consume AI results via `search` or `ai-service` REST endpoints — never call an LLM directly themselves); §3 vector embedding pipeline (domain event → Kafka consumer → extract text fields → embedding model → upsert `VectorEmbedding` → publish `embedding.updated` → `search` syncs OpenSearch vector field) with an "Embeddable Entities" table (Attendee/AttendeeProfile, Session, Speaker/SpeakerProfile, Event — each with text fields and owning service); §4 semantic search (OpenSearch k-NN on the 4 indices, hybrid BM25+vector query path, `ai-service` `/v1/embeddings/query` endpoint); §5 attendee matchmaking (`/v1/match/attendees` — k-NN against same-event attendee embeddings, filters already-connected attendees, also powers session recommendations); §6 AI assistants — Organizer Assistant (`/v1/assistant/organizer`, context = Event/Agenda Planner/Campaign draft/TicketSalesSummary) and Attendee Assistant (`/v1/assistant/attendee`, context = public event/session/agenda/FAQ), with an implementation note that LLM calls are server-side only and logged to `AIInteractionLog`, with PII restrictions per `security-model.md` §4; §7 agent automation table (Campaign Segment Suggester, Survey Feedback Summariser, Embedding Refresh — triggers and outputs); §8 dependencies-on-earlier-batches table (attendee/session — Batch 2, search+OpenSearch — Batch 6, networking — Batch 8, interactive-engagement — Batch 9, Kafka/event bus — Batch 7). |

---

## docs/workflows — Detailed Flow Diagrams (Phase A)

Detailed step-by-step expansions of specific `workflow-catalog.md` sections, for the four highest-traffic workflows. Each includes ASCII sequence diagrams, an API endpoint table, and guard/failure-mode tables.

| File | Description |
|---|---|
| `docs/workflows/event-lifecycle.md` | (93 lines) Expansion of `workflow-catalog.md` §2, owning service `event`. ASCII state machine: `draft → published → live → archived`, with `cancelled` reachable from `draft` or `published` (terminal). Seven numbered steps (Create/Configure/Publish/Unpublish/Go-Live/Archive/Cancel) each with Actor, API (`PATCH /v1/events/{eventId}/status`), Guard conditions, emitted event, and downstream consumers (`agenda`/`exhibitor`/`ticketing`/`search` on create; `registration`/`search` on publish; `onsite`/`analytics` on go-live; `payment` refunds + `notification` cancellation emails on cancel). Closing "Error/Guard Summary" table maps each transition to its guard and HTTP error (`422`/`409`). |
| `docs/workflows/registration-flow.md` | (108 lines) Expansion of `workflow-catalog.md` §8, owning service `registration` (secondary `attendee`, `notification`). Variants table (free/open, free/gated, paid/no-approval, paid/gated, waitlisted) cross-referencing approval and commerce requirements. ASCII flow diagram from form submission through capacity/approval/payment branches to `registration.confirmed` → `attendee.created` → confirmation email. API endpoint table (submit, get status, approve, reject/cancel, list approvals, list waitlist). "Waitlist Promotion" section (FIFO promotion on cancellation, auto-confirm for free / payment window for paid). "Guards" table (event not published → 422, missing required answers → 400, duplicate registration → 409, cancel after check-in → 422). |
| `docs/workflows/checkout-flow.md` | (110 lines) Expansion of `workflow-catalog.md` §6, owning services `order`, `inventory`, `pricing`, `payment`, `fulfillment`, `ticketing`, `notification`. ASCII flow diagram: order creation → inventory reservation (Redis lock + TTL hold, `inventory.reserved`/`depleted`) → pricing/promo application → payment intent creation → provider webhook success/failure branch → `order.paid` → fulfillment issues tickets (`ticket.issued`) → `order.fulfilled` → notification with QR codes. API endpoint table (create order, apply promo, initiate payment, provider webhook, get order status, get tickets). "Concurrency & Safety" section (Redis `SET NX EX` atomic reserve, TTL-based auto-release, `Idempotency-Key` on order/payment POSTs, webhook idempotent on `provider_ref`). "Failure Modes" table (inventory depleted → 409, payment timeout → stays pending_payment, fulfillment partial failure → idempotent retry, missing webhook → reservation TTL expiry + reconciliation job). |
| `docs/workflows/checkin-flow.md` | (143 lines) Expansion of `workflow-catalog.md` §9, owning service `onsite` (secondary `attendee`, `interactive-engagement`, `notification`). Modes table (Event check-in / Session scan / Lead capture, each with trigger and device). Three ASCII flow diagrams: (1) Event Check-in — QR decode, validation checks (ticket status, registration confirmed, event live, duplicate-checkin prevention), `CheckinRecord`+`Badge` creation, `attendee.checked_in` emission, downstream `notification` welcome message and `analytics` dashboard increment, response includes session recommendations from `ai-service`/`agenda`; (2) Session Attendance Scan — validates checked-in + active session window + idempotent scan, creates `SessionAttendance`, emits `session.attended`, surfaces live polls/QA via `interactive-engagement`, updates `AttendanceMetrics`; (3) Lead Capture — RBAC-gated exhibitor scan, creates `Lead`, emits `lead.captured`, updates exhibitor lead count. "Device Registration" section (`POST /v1/events/{eventId}/devices`, organizer/onsite_staff only). API endpoints table (5 routes). "Offline / Resilience" section — devices cache QR→registration lookups locally, offline check-ins queued and deduped server-side by `(attendee_id, event_id)`, duplicate scans return `409 already_checked_in` with original timestamp. |

---

## docs/product, docs/ui, docs/developer

| File | Description |
|---|---|
| `docs/product/product-overview.md` | (92 lines) Canonical product definition across 7 sections: §1 vision — EMS combines Enterprise Event Management + High-Performance Ticketing & Commerce as one multi-tenant SaaS, a single tenant can run both against the same event; §2 personas table (Platform Admin, Organizer, Finance, Support, Exhibitor, Speaker, Onsite Staff, Attendee) with primary surfaces, pointing to `ui-surface-map.md`; §3 event lifecycle (`draft → published → live → archived`, `cancelled` from draft/published) with one-line descriptions of each state; §4 "Core Modules" table mapping module groups to services and batches (same grouping as service-map summary); §5 enterprise capabilities (multi-tenancy, RBAC, enterprise SSO, audit logging, analytics & reporting); §6 AI capabilities summary (semantic search, matchmaking, assistants, agent automation) pointing to `ai-architecture.md`; §7 capability tiers pointer to `capability-matrix.md`. |
| `docs/ui/design-system.md` | (146 lines) Design system spec implemented via Tailwind custom theme (`apps/web/tailwind.config.ts`), physical tokens in `design/tokens/`, primitives in `design/components/`. 10 sections: §1 colors — brand palette (`primary-50`…`primary-900` hex table), neutral palette, semantic colors (success/warning/error/info), and tenant-branding override via `TenantSettings.brand.primaryColor`/`logoUrl` injected as CSS custom properties by `ui-renderer`; §2 typography scale table (`display-lg` 48/56px down to `code` 14/20px monospace), font family Inter + system-ui, weights 400–700; §3 spacing scale (4px base unit, Tailwind extension `0–24`) with standard usage (card body `p-6`, section gap `gap-8`, etc.); §4 border radius token table (`rounded-sm` 4px … `rounded-full` 9999px); §5 shadow/elevation token table (`shadow-xs`…`shadow-xl`); §6 grid & layout (max-width 1280px, responsive gutters, 12-column grid, standard layout column-span patterns); §7 breakpoints table (`sm` 640px … `2xl` 1536px), mobile-first, onsite check-in UI targets tablet-landscape; §8 iconography (Lucide React, 16px inline / 20px standalone, inherits text color); §9 motion/transitions (default `transition-colors duration-150`, modal `duration-200`, `motion-reduce:` respect); §10 Tailwind config entry points mapping `design/tokens/{colors,typography,spacing,shadows,radius}.js` to `tailwind.config.ts` theme extensions — token files are the single source of truth, no hard-coded values allowed in components or `ui-renderer`. |
| `docs/developer/README.md` | (47 lines) Developer guide: Local setup (npm ci, copy env template, `npm run docker:up`, `npm run start:dev`); Building & running like production (`npm run build:all` = `tsc -p tsconfig.json` compiling all of `services/`/`infra/`/`apps/` preserving structure; `npm run start:prod` runs compiled output via `scripts/register-paths.js` for `@ems/*` alias resolution, no ts-node); Docker (`docker:up`/`down`/`logs`/`reset` for infra-only stack; `docker:app:build`/`docker:app:up` for API container + infra via `docker-compose.app.yml` overlay); CI (`.github/workflows/ci.yml` runs lint/typecheck/jest/docker-build on push+PR to main, pushes image to GHCR on main); Health checks (`GET /v1/health` liveness always 200, `GET /v1/health/ready` checks Postgres/Redis/Kafka, 503 on failure); Environments & secrets (points to `infra/deployment/env/` templates and `infra/deployment/secrets/README.md`). **Implemented** (Phase D). |

---

## design/ — Design System Foundation

| File | Description |
|---|---|
| `design/tokens/README.md` | (9 lines) Scaffold placeholder for design tokens (colors, spacing, typography — the physical files referenced by `docs/ui/design-system.md` §10). Source: Design Prompt 1 — Design System Foundation. Used by Phase E frontend tasks TASK 02/04/05. Status: **not yet populated**. |
| `design/components/README.md` | (9 lines) Scaffold placeholder for component primitives (the building blocks of `services/ui-renderer/spec.md`'s component hierarchy). Same source/usage as tokens. Status: **not yet populated**. |
| `design/wireframes/README.md` | (9 lines) Scaffold placeholder for wireframes driving the `ui-surface-map.md` routes. Same source/usage as tokens. Status: **not yet populated**. |

---

## apps/web — Frontend (Phase E)

| File | Description |
|---|---|
| `apps/web/README.md` | (10 lines) Scaffold for the Next.js + React + TypeScript frontend. Phase: E, TASK 03 — Create Frontend App. Structure: `app`, `components`, `layouts`, `services`, `styles` — to be populated by Phase E TASK 03–14 in order per `BUILD_BLUEPRINT.md` §9. Status: **not started**. |

---

## infra/ — Shared Infrastructure

| File | Batch / Phase | Description | Actual status |
|---|---|---|---|
| `infra/event-bus/README.md` | Batch 7 — Infra Layer, Prompt 22 | (17 lines) Kafka-based domain event bus: publish/subscribe, outbox pattern for reliable delivery. Cross-references `docs/canon/event-catalog.md` for the full topic list. Notes it is a PREREQUISITE for Batches 1–6 (every service publishes/consumes domain events) and should be implemented right after Phase A/infra-docker. README still says "SCAFFOLD - not yet implemented". | **Implemented** in Phase B (`EventBusService.publish`/`subscribe`, `Topics` registry) — used by every Batch 1–6 service. README is stale. |
| `infra/cache/README.md` | Batch 7 — Infra Layer, Prompt 23 | (15 lines) Redis cache layer: general cache, rate limiting, idempotency keys (cross-ref `api-standards.md`), inventory reservation TTL (used by `inventory`). Notes it's a PREREQUISITE for Batch 4 (Commerce Core), which hard-depends on Redis-backed inventory locking. README still says "SCAFFOLD - not yet implemented". | **Implemented** in Phase B (`@ems/cache` `RedisClient`) — used by `inventory`, health checks, etc. README is stale. |
| `infra/docker/README.md` | Phase D, Bundle 1 — Containerization | (23 lines) Local stack: `docker-compose.yml` (Postgres, Redis, Kafka/Zookeeper, Kafka UI, OpenSearch + Dashboards, MinIO) — Implemented; `apps/api/Dockerfile` multi-stage build (`npm run build:all`/`tsc -p tsconfig.json`, runs via tsconfig-paths against `dist/`) — Implemented; `docker-compose.app.yml` overlay (`npm run docker:app:up`) — Implemented; Dockerfile for `apps/web` (Next.js) — pending Phase E. Notes this should be stood up early per `BUILD_BLUEPRINT.md` §11 since Batch 7 (event-bus+cache) and Batch 4 (commerce) depend on Kafka/Redis locally. | **Implemented** (Phase D Bundle 1). README updated to reflect this — only the `apps/web` Dockerfile remains pending (Phase E). |
| `infra/deployment/README.md` | Phase D, Bundle 4 — Deployment Scaffolding | (14 lines) Per-environment config templates (`env/.env.{development,staging,production}.example`, staging/production using `${SECRET:<path>}` placeholders) and secrets-resolution convention (`secrets/README.md`). Cross-references Bundle 1/2 (`infra/docker/README.md`) for containerization/CI. | **Implemented** (Phase D Bundle 4). |
| `infra/deployment/secrets/README.md` | Phase D, Bundle 4 | (44 lines) Defines the `${SECRET:<path>}` placeholder convention (`ems/<environment>/<name>`, resolved by the deployment platform before container start — app only ever reads `process.env.*`). Documents 3 resolution strategies per target platform: Kubernetes (External Secrets Operator → `Secret` → `envFrom.secretRef`), AWS ECS/Fargate (Secrets Manager ARNs in task definition `secrets` block), Docker Compose self-hosted (entrypoint script reading Vault/Doppler/1Password CLI, `docker compose --env-file`). Secrets inventory table: `database_url`, `redis_password`, `opensearch_password`, `object_storage_access_key`/`_secret_key`, `jwt_secret` (with dual-secret rotation note). Local dev uses plain non-secret defaults — nothing to resolve. | **Implemented** as a convention doc — no cloud provider wired up (by design; documents the contract only). |

---

## services/ — Backend Services (one folder per NestJS module)

Every `services/<name>/README.md` is ~16 lines and follows the same template: title, Status line (stale — see "Actual status"), Batch, V1/V2 source `.docx` pointers, key entities/contents, and a closing line pointing to `BUILD_BLUEPRINT.md` for sequencing/dependencies/QC gates. Implementation status reflects this conversation's build work (Batches 1–6 + Phase D verified via `tsc --noEmit` exit 0).

### Batch 1 — Platform Core ✅ Implemented

| File | Key entities | Description |
|---|---|---|
| `services/auth/README.md` | `UserCredential`, `AuthSession` | Authentication, sessions, credentials, SSO. Source: V2 Batch 1 Prompt 1 — Auth; V1 Stream-1 Bundle 2 (Auth System) + Bundle 3 (Enterprise Identity, parallel). |
| `services/tenant/README.md` | `Tenant`, `Organization`, `TenantSettings` | Multi-tenant org management. Source: V2 Batch 1 Prompt 2 — Tenant; V1 Stream-1 Bundle 1 (Core Models). |
| `services/rbac/README.md` | `Role`, `Permission`, `UserRole` | Role-based access control. Source: V2 Batch 1 Prompt 3 — RBAC; V1 Stream-1 Bundle 1 (Core Models) + Bundle 4 (APIs, parallel). |
| `services/audit/README.md` | `AuditLog` | Cross-tenant audit logging. Source: V2 Batch 1 Prompt 4 — Audit; V1 Stream-1 Bundle 3 (Enterprise Identity, parallel). |

### Batch 2 — Event Operations ✅ Implemented

| File | Key entities | Description |
|---|---|---|
| `services/event/README.md` | `Event`, `Venue`, `Room` | Event creation & lifecycle. Source: V2 Batch 2 Prompt 5 — Event; V1 Stream-2 (Event Management, Bundles 1–4). |
| `services/agenda/README.md` | `Track`, `Session` | Agenda/sessions. Source: V2 Batch 2 Prompt 6 — Agenda; V1 Stream-5 (Agenda & Speakers, Bundles 1–4). |
| `services/speaker/README.md` | `Speaker`, `SpeakerProfile`, `SessionSpeaker` | Speaker management. Source: V2 Batch 2 Prompt 7 — Speaker; V1 Stream-5 (Agenda & Speakers, Bundles 1–4). |
| `services/exhibitor/README.md` | `Exhibitor`, `Booth`, `SponsorPackage`, `Lead` (+ V1-carryover `Sponsor`, reconciled in `domain-model.md` §2) | Exhibitor/booth/sponsor directory. Source: V2 Batch 2 Prompt 8 — Exhibitor; V1 Stream-6 (Exhibitors & Sponsors, Bundles 1–4). |
| `services/attendee/README.md` | `Attendee`, `AttendeeProfile`, `AttendeeTag` | Attendee directory. Source: V2 Batch 2 Prompt 9 — Attendee; V1 Stream-7 Bundle 1 (Core Models). |

### Batch 3 — Participation ✅ Implemented

| File | Key entities | Description |
|---|---|---|
| `services/registration/README.md` | `Registration`, `RegistrationStatus` (+ `RegistrantProfile`, `RegistrationQuestion`/`RegistrationAnswer` per `domain-model.md` §3) | Registration flows (free/paid/gated/waitlisted). Source: V2 Batch 3 Prompt 10 — Registration; V1 Stream-4 (Registration System, Bundles 1–4). |
| `services/onsite/README.md` | `CheckinRecord`, `Badge`, `ScanningDevice` (+ `SessionAttendance` per `domain-model.md` §3) | Onsite check-in operations. Source: V2 Batch 3 Prompt 11 — Check-in; V1 Stream-8 (Onsite Operations, Bundles 1–4). |

### Batch 4 — Commerce Core ✅ Implemented

| File | Key entities | Description |
|---|---|---|
| `services/ticketing/README.md` | `TicketProduct`, `Ticket`, `TicketEntitlement` | Ticket products & issuance. Source: V2 Batch 4 Prompt 12 — Ticketing; V1 Stream-3 (Ticketing & Commerce, Bundles 1–2). |
| `services/pricing/README.md` | `PriceRule`, `DiscountRule`, `PromoCode` | Dynamic pricing, discounts, promo codes. Source: V2 Batch 4 Prompt 13 — Pricing; V1 Stream-3 Bundle 2 (Inventory & Pricing). |
| `services/inventory/README.md` | `InventoryPool`, `InventoryReservation` | Redis-backed inventory locking to prevent overselling (TTL holds, `infra/cache`). Source: V2 Batch 4 Prompt 14 — Inventory; V1 Stream-3 Bundle 2 (Inventory & Pricing). |
| `services/order/README.md` | `Order`, `OrderItem`, `OrderStatus` | Order/checkout aggregate & orchestration. Source: V2 Batch 4 Prompt 15 — Order; V1 Stream-3 Bundle 3 (Checkout Flow). |
| `services/payment/README.md` | `Payment`, `PaymentTransaction`, `Refund` | Payment processing & refunds (provider integration). Source: V2 Batch 4 Prompt 16 — Payment; V1 Stream-3 Bundle 3 (Checkout Flow) + Bundle 4 (APIs & Events). |
| `services/fulfillment/README.md` | (no new entities — process service) | Post-payment ticket issuance, order completion, email confirmation. Source: V2 Batch 4 Prompt 17 — Fulfillment; V1 Stream-3 Bundle 3 (Checkout Flow). |

### Batch 5 — Engagement (Marketing) ✅ Implemented

| File | Key entities | Description |
|---|---|---|
| `services/notification/README.md` | `NotificationMessage` | Transactional messaging (email/SMS/push) across all services. Source: V2 Batch 5 Prompt 18 — Notification; new in V2 (traces to Foundation Prompt 4 domain entity "notification"). |
| `services/engagement/README.md` | `Campaign`, `AudienceSegment` | Marketing campaigns & audience segmentation. Source: V2 Batch 5 Prompt 19 — Campaign; new in V2 (distinct from `interactive-engagement`). |

### Batch 6 — Intelligence ✅ Implemented

| File | Key entities | Description |
|---|---|---|
| `services/analytics/README.md` | `EventDashboardView`, `TicketSalesSummary`, `AttendanceMetrics` (read models) | Read-model projections for dashboards/reporting, consumes the full event stream (wildcard). Source: V2 Batch 6 Prompt 20 — Analytics; V1 Stream-9 (Analytics & Reporting, Bundles 2–4). |
| `services/search/README.md` | OpenSearch-style indices: `events`, `sessions`, `speakers`, `attendees` (implemented here via Postgres ILIKE, schema `search`) | Full-text/semantic search across entities. Source: V2 Batch 6 Prompt 21 — Search; V1 Stream-2 Bundle 3 (Event Logic — OpenSearch indexing) & Stream-7 Bundle 2. |

### Batches 7–10 — Not yet started

| File | Batch | Key entities | Description |
|---|---|---|---|
| `services/integration/README.md` | Unscheduled (service-map only) | TBD | External integrations hub (calendar sync, CRM export, webhooks per `service-map.md` "Cross-Cutting" and `api-standards.md` §10). No V2 source spec — appears only in V2 Phase 2 Prompt 3 service list; V1 pointer is Packet 0 Prompt 7 (Service Map) itself. |
| `services/networking/README.md` | Batch 8 — Social (gap-fill, NEW) | `AttendeeConnection` | Attendee-to-attendee networking/connections (`connection.requested`/`accepted`/`declined`). Source: V1 Stream-7 Bundle 2 (Networking Logic); no V2 spec (gap-fill, see `BUILD_BLUEPRINT.md` §7/§12). |
| `services/interactive-engagement/README.md` | Batch 9 — Interactive Engagement (gap-fill, NEW) | `Poll`, `PollResponse`, `QAQuestion`, `Survey`, `SurveyResponse` | Live polls/Q&A/surveys (`poll.created`/`responded`, `qa.question_submitted`, `survey.completed`). Source: V1 Stream-7 Bundle 3 (Engagement); no V2 spec (gap-fill). **Note**: poll/QA/survey entities and the engagement module were actually implemented under `services/engagement` in Batch 5 of this build — see conversation history; this scaffold may be redundant or need reconciliation when Batch 9 starts. |
| `services/ai-service/README.md` | Batch 10 — AI Layer (gap-fill, NEW) | `VectorEmbedding`, `AIInteractionLog` | AI compatibility layer: vector storage, semantic search augmentation, matchmaking, AI assistants/agents. Source: V1 Packet 0 Prompt 8 (AI Compatibility Layer) — design detailed in `docs/architecture/ai-architecture.md`; no V2 spec (gap-fill). |

### Cross-cutting

| File | Batch / Phase | Description |
|---|---|---|
| `services/ui-renderer/README.md` | Phase A (Foundation) | (16 lines) Scaffold notes: "deterministic renderer: wireframes + tokens -> components -> pages". Source: V1 Packet 0 Design Prompt 2 (UI Renderer Contract). No V2 spec. Status: not yet implemented. |
| `services/ui-renderer/spec.md` | Phase A (Foundation) | (160 lines) **Contract spec** (distinct from README) — defines how `ui-renderer` bridges `docs/ui/design-system.md` tokens and `docs/canon/read-model-catalog.md` read-model data into the `apps/web` component library. 10 sections: §1 purpose (no DB tables, no events — pure SSR/component-mapping layer, reads `TenantSettings` for branding); §2 component hierarchy (Layout → Page → Section → Primitive); §3 component contract format (typed props mirror API/read-model shapes 1:1, e.g. `EventCardProps`, no in-component transformation, `onAction` is the only side-effect hook); §4 token consumption rules (Tailwind utility classes only, no hard-coded hex, tenant brand override via `--color-primary` CSS custom property injected by Next.js root layout, dark mode reserved/forbidden until explicitly in scope); §5 responsive behavior table per component class (nav, Event Card, Agenda Grid, Check-in Console, Order Table) across mobile/tablet/desktop; §6 read-model binding map — table of 10 read models → section component → route (e.g. EventDashboardView → `<EventDashboard />` → `/events/[id]/dashboard`); §7 mutation layer (typed command functions per page, e.g. `publishEvent`/`cancelEvent`, call REST endpoints with `Idempotency-Key`, never imported by section/primitive components); §8 error & loading states (skeleton/error/empty states built from `<Skeleton/>`/`<ErrorState/>`/`<EmptyState/>` primitives, `ErrorBoundary` per section); §9 accessibility baseline (focus rings, WCAG AA contrast, alt text, table captions, Radix UI modal focus trap); §10 Storybook (every primitive/section component requires a story covering default/loading/error/empty/key-variant states — acceptance gate for Phase E). |

---

## prompts/ — Gap-fill Prompt Drafts

| File | Description |
|---|---|
| `prompts/README.md` | (12 lines) Explains this folder holds NEW gap-fill prompts (written in V2's prompt style) for capabilities V2 never re-specified: Batch 1 extension — Enterprise SSO (OAuth2/SAML) for `services/auth`; Batch 8 — Social/Networking (`services/networking`); Batch 9 — Interactive Engagement: Polls/Q&A/Survey (`services/interactive-engagement`); Batch 10 — AI Layer (`services/ai-service`). Original V1/V2 prompt `.docx` files remain under `/V1` and `/V2` at the workspace root and are NOT duplicated here. |

---

## Summary by implementation status

| Status | Count | Files |
|---|---|---|
| Phase A docs (canon/architecture/workflows/product/ui) — complete | 19 | `docs/canon/*` (10), `docs/architecture/*` (2), `docs/workflows/*` (4), `docs/product/*`, `docs/ui/*`, `docs/developer/*` |
| Batches 1–6 backend services — implemented & tsc-verified | 21 service READMEs | auth, tenant, rbac, audit, event, agenda, speaker, exhibitor, attendee, registration, onsite, ticketing, pricing, inventory, order, payment, fulfillment, notification, engagement, analytics, search |
| Phase D infra — implemented | 4 | `infra/docker/README.md`, `infra/deployment/README.md`, `infra/deployment/secrets/README.md`, `docs/developer/README.md` |
| Infra scaffolds — implemented but README stale | 2 | `infra/event-bus/README.md`, `infra/cache/README.md` |
| Batches 7–10 + Phase E — not started | 6 | `services/integration`, `services/networking`, `services/interactive-engagement`, `services/ai-service`, `services/ui-renderer` (+ spec), `apps/web/README.md`, `design/*` (3) |

**Total `.md` files indexed: 57** (all read in full, line by line)
