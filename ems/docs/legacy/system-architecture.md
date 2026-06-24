> **Status: Retired.** Superseded by `docs/01_backend/BACKEND_ARCHITECTURE.md`
> (code-verified 2026-06-15). **Conflict notes**: (1) §4.1 and §7 describe
> "tenant isolation middleware" — the implemented pattern is a shared base
> repository (`infra/common/src/base.repository.ts`), per CA-004. (2) §2
> frames the architecture as "modular monolith evolving toward independent
> deployables" — ADR-001 and `BACKEND_ARCHITECTURE.md` describe a stable
> modular monolith without this evolution framing; see C-4 in
> `docs/08_reports/CONFLICT_ANALYSIS_REPORT.md` for resolution status.

# System Architecture

> Source: V1 Packet 0 Prompt 3 — Architecture Design. Relocated (unmodified path) by V2 Phase 1.

## 1. Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Backend | NestJS (TypeScript) | one module per service under `services/` |
| Frontend | Next.js + React + TypeScript | `apps/web` |
| Database | PostgreSQL | system of record, one schema per service or shared DB with `tenant_id` row scoping (see `docs/canon/data-architecture.md`) |
| Cache / locks / idempotency | Redis | `infra/cache` |
| Event streaming | Kafka | `infra/event-bus`, outbox pattern |
| Search | OpenSearch | `services/search` |
| Object storage | S3-compatible | badges, exports, design assets |

## 2. Architecture Style

**Modular monolith evolving into event-driven services.**

- Phase 1 (Batches 1–6): all services deployed as NestJS modules within a single
  monorepo/deployable, communicating in-process where possible, but designed with
  hard module boundaries (separate schemas, no cross-module DB access) so each can
  be extracted into an independent deployable later.
- Cross-module communication for anything that isn't a synchronous read happens via
  the **event bus** (Kafka + outbox pattern, `infra/event-bus`) — never direct
  service-to-service DB calls.
- Read-heavy UI surfaces are served by **read models** (`docs/canon/read-model-catalog.md`)
  built by the `analytics`/`search` services consuming the event stream — this is
  the system's CQRS seam.

## 3. Service Boundaries

Full service-by-service responsibility, owned entities, and event
production/consumption is defined in `docs/canon/service-map.md`. At a high level:

```
Platform Core      -> auth, tenant, rbac, audit
Event Operations   -> event, agenda, speaker, exhibitor, attendee
Participation      -> registration, onsite
Commerce Core      -> ticketing, pricing, inventory, order, payment, fulfillment
Engagement         -> notification, engagement(campaigns)
Intelligence       -> analytics, search
Social             -> networking
Interactive Eng.   -> interactive-engagement (polls/Q&A/survey)
AI Layer           -> ai-service
Infra              -> event-bus, cache
```

## 4. Data Flow

### 4.1 Synchronous (request/response)
```
Client (apps/web)
  -> API Gateway / NestJS HTTP layer
    -> Auth guard (JWT validation, services/auth)
    -> Tenant isolation middleware (tenant_id from JWT claims, services/tenant)
    -> RBAC guard (services/rbac)
    -> Target service module (controller -> service -> repository -> PostgreSQL)
  <- Response (standard envelope, see docs/canon/api-standards.md)
```

### 4.2 Asynchronous (event-driven)
```
Service A writes to its own table + outbox table (single transaction)
  -> Outbox relay publishes to Kafka (infra/event-bus)
    -> Service B Kafka consumer
      -> updates Service B's own tables / read models
```

This pattern guarantees at-least-once delivery without distributed transactions.
All domain events are catalogued in `docs/canon/event-catalog.md`.

### 4.3 Search & Analytics
```
Kafka topics --(consumers)--> OpenSearch indices (services/search)
Kafka topics --(consumers)--> Analytics read-model tables (services/analytics)
```

## 5. API Gateway

- Single NestJS HTTP entrypoint (`apps/web` calls a unified API surface).
- Responsibilities: TLS termination (at infra layer), JWT validation, tenant
  resolution, rate limiting (Redis-backed, `infra/cache`), request/response
  envelope enforcement, API versioning (`/v1/...`).
- Detailed conventions: `docs/canon/api-standards.md`.

## 6. Event Bus

- Kafka-based domain event bus (`infra/event-bus`).
- **Outbox pattern**: every service writes domain events to a local `outbox` table
  in the same transaction as its state change; a relay process publishes these to
  Kafka and marks them dispatched.
- Topic naming: `<domain>.<event>` (e.g., `event.lifecycle`, `order.created`,
  `payment.completed`) — see `docs/canon/event-catalog.md` for the full list.
- Idempotent consumers: every consumer must be safe to re-process a message
  (dedupe via event id, see `docs/canon/api-standards.md` idempotency section and
  `infra/cache`).

## 7. Multi-Tenant Model

- **Isolation strategy**: shared database, shared schema, row-level isolation via
  `tenant_id` on every tenant-scoped table.
- **Enforcement**: tenant isolation middleware (services/tenant) injects
  `tenant_id` from the authenticated JWT into the request context; all repository
  queries are required to filter by it (enforced via base repository class /
  query interceptor — no raw queries bypassing the filter).
- **Tenant onboarding**: `Tenant`, `Organization`, `TenantSettings` entities
  (services/tenant) — workflow defined in `docs/canon/workflow-catalog.md`
  (`tenant-onboarding`).
- Platform Admin (`/admin/*`) operates cross-tenant and is the only role permitted
  to bypass tenant scoping, via an explicit superuser guard.

## 8. Repository Layout Reference

```
ems/
  apps/web/            Next.js frontend
  services/<name>/     one NestJS module per service (see docs/canon/service-map.md)
  infra/
    docker/            local dev stack (Postgres, Redis, Kafka, OpenSearch)
    deployment/        env configs, secrets placeholders
    event-bus/         Kafka client, outbox relay, topic definitions
    cache/             Redis client, rate limiter, idempotency store
  design/              design tokens, components, wireframes
  docs/                this canon
  prompts/             gap-fill build prompts
```

## 9. Build Sequencing

See `BUILD_BLUEPRINT.md` §11 for the full ordered build sequence
(Phase A → infra/docker → infra/event-bus + cache → Batches 1–10 → Phase D → Phase E).
