# EMS Architecture

## 1) Overview

EMS is designed as a **modular monolith first**, with clear boundaries that allow selective extraction into **event-driven services** as scale and team autonomy needs grow.

### Target stack
- **Backend**: NestJS
- **Frontend**: Next.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Event streaming**: Kafka
- **Search**: OpenSearch

### Architectural principles
1. **Single deployable at first** for speed and operational simplicity.
2. **Strong module boundaries** inside the monolith to reduce coupling.
3. **Asynchronous integration via domain events** from day one.
4. **Tenant isolation by design** across API, data access, events, and search.
5. **Read-model specialization** (PostgreSQL for transactions, OpenSearch for search, Redis for low-latency cache).

---

## 2) High-level system context

```text
[Next.js Web App]
        |
        v
[API Gateway / BFF Layer]
        |
        v
[NestJS Modular Monolith]
   |        |        |         |
   v        v        v         v
[PostgreSQL][Redis][Kafka Outbox][OpenSearch Indexing]
                    |
                    v
               [Kafka Event Bus]
                    |
                    v
         [Future Extracted Services]
```

---

## 3) Service boundaries (inside the modular monolith)

All domains live in a single NestJS runtime initially, each as an independent module with explicit APIs.

## 3.1 Core domain modules
- **Identity & Access Module**
  - User accounts, organizations/tenants, roles, permissions, auth sessions.
  - Issues tenant-scoped claims used by all downstream modules.

- **Tenant Management Module**
  - Tenant lifecycle (create, configure, suspend), feature flags, limits/plan.
  - Tenant metadata and governance configuration.

- **Catalog/Reference Module**
  - Shared reference data, templates, controlled vocabularies.

- **Operations Module**
  - Core business transactions/workflows (primary EMS workflows).
  - Owns transaction invariants and writes the system of record in PostgreSQL.

- **Workflow & Rules Module**
  - Rule evaluation and configurable process orchestration.
  - Emits process state-change events.

- **Notification Module**
  - Email/SMS/push/in-app notifications.
  - Consumes domain events; can be extracted early if traffic spikes.

- **Reporting & Analytics Module**
  - Aggregations, KPI snapshots, trend summaries.
  - Uses read-optimized models and asynchronous materialization.

- **Search Module**
  - Projection builders and OpenSearch indexing/query abstractions.
  - Keeps search concerns isolated from domain transaction logic.

- **Audit & Compliance Module**
  - Immutable audit trails and policy logs.
  - High-priority event consumer for compliance-grade traceability.

## 3.2 Supporting modules
- **API Module**: REST/GraphQL controllers, DTO validation, versioning.
- **Integration Module**: Adapters for external systems and webhooks.
- **Eventing Module**: Event contracts, outbox publisher, Kafka consumers.
- **Shared Kernel**: Cross-cutting primitives (tenant context, IDs, errors, base events), strictly minimal.

## 3.3 Boundary rules
- Module-to-module calls only through published interfaces (no direct repository sharing).
- Each module owns its tables/schemas logically, even in a shared PostgreSQL cluster.
- Cross-module updates occur via commands/events, not direct state mutation.

---

## 4) Data flow

## 4.1 Synchronous request flow (command path)
1. User acts in Next.js UI.
2. Request hits API Gateway/BFF.
3. Gateway authenticates, resolves tenant, forwards to NestJS API module.
4. Target domain module validates command and writes transactional state to PostgreSQL.
5. Domain event is stored in **Outbox table** in same DB transaction.
6. Response returns to client (fast path).

## 4.2 Asynchronous propagation (event path)
1. Outbox publisher reads committed outbox rows.
2. Publisher emits events to Kafka (tenant + aggregate metadata in headers).
3. Internal consumers update:
   - Redis caches/invalidation
   - OpenSearch projections
   - Reporting materialized views
   - Audit streams
4. External/future services subscribe to same Kafka topics.

## 4.3 Query/read flow
- UI query goes through API Gateway to read APIs.
- Read APIs fetch from:
  - PostgreSQL for canonical transactional reads
  - Redis for hot/session/derived cache
  - OpenSearch for full-text and faceted search
- Read model choice is endpoint-specific and explicit.

---

## 5) API Gateway / BFF design

The API Gateway is the frontend-facing entry point (can be implemented as NestJS edge module or Next.js BFF routes depending on deployment preference).

### Responsibilities
- Authentication and token validation.
- Tenant resolution (`tenant_id` from token/subdomain/header).
- Authorization pre-checks and policy hooks.
- Request shaping for client use-cases (BFF aggregation endpoints).
- Rate limiting and request throttling per tenant/plan.
- API version routing and deprecation control.
- Correlation ID propagation for tracing.

### Non-responsibilities
- No domain business logic.
- No direct persistence.

---

## 6) Event bus design (Kafka)

Kafka is the backbone for decoupling modules and enabling extraction to services.

### Topic strategy
- Domain-oriented topics, e.g.:
  - `tenant.events`
  - `identity.events`
  - `operations.events`
  - `workflow.events`
  - `notifications.events`
- Optional split by criticality: `*.critical`, `*.standard`.

### Event envelope (minimum)
- `event_id`
- `event_type`
- `event_version`
- `occurred_at`
- `tenant_id`
- `aggregate_type`
- `aggregate_id`
- `correlation_id`
- `causation_id`
- `payload`

### Delivery and consistency
- **Transactional outbox** guarantees DB write + event publication consistency.
- Consumers are **idempotent** (dedupe by `event_id`).
- Use retry + dead-letter topics for poison messages.
- Schema versioning via backward-compatible evolution.

---

## 7) Multi-tenant model

Recommended default: **Shared database, shared schema, tenant discriminator (`tenant_id`) on all tenant-owned tables**.

## 7.1 Tenant isolation layers
- **Application layer**: Every command/query carries tenant context.
- **Persistence layer**:
  - Mandatory `tenant_id` column and composite unique keys (e.g., `tenant_id + business_key`).
  - Row-level filtering in repositories/ORM guards.
  - Optional PostgreSQL RLS for defense in depth.
- **Cache layer (Redis)**:
  - Key prefix convention: `t:{tenant_id}:{bounded_context}:{key}`.
- **Event layer (Kafka)**:
  - `tenant_id` in headers and payload metadata.
- **Search layer (OpenSearch)**:
  - Tenant-aware index strategy: shared index with filtered alias, or per-tenant index for high-scale tenants.

## 7.2 Tenant scalability path
- Start with shared schema.
- Promote large tenants to dedicated schema/database when needed.
- Keep routing abstraction in data-access layer to avoid app-level rewrites.

---

## 8) Evolution path: modular monolith -> event-driven services

## Phase 1: Modular monolith (now)
- Single NestJS deployment.
- Internal module boundaries.
- Outbox + Kafka already active.

## Phase 2: Carve-out candidates
First likely extractions:
1. Notification service
2. Search indexing/query service
3. Reporting/analytics service

These are naturally asynchronous and less transaction-coupled.

## Phase 3: Core domain extraction
- Extract selected high-change/high-load domains (e.g., Workflow or Operations subdomain).
- Keep event contracts stable; replace in-process calls with API/event integration.

## Phase 4: Platform hardening
- Service mesh/API federation if needed.
- Independent scaling, SLOs, and ownership by team.
- Multi-region and disaster recovery patterns.

---

## 9) Operational concerns

- **Observability**: OpenTelemetry tracing across Next.js, gateway, NestJS, Kafka consumers.
- **Security**: RBAC/ABAC, secrets management, encryption in transit and at rest.
- **Resilience**: Circuit breakers for external integrations, retry policies, DLQ monitoring.
- **Migrations**: Backward-compatible DB/event changes; zero-downtime rollout strategy.

---

## 10) Reference implementation structure (suggested)

```text
ems/
  apps/
    api-gateway/          # optional separate gateway runtime
    backend/              # NestJS modular monolith
    web/                  # Next.js frontend
  services/               # future extracted services
  infra/
    postgres/
    redis/
    kafka/
    opensearch/
  docs/
    architecture.md
```

This structure supports immediate productivity while preserving clear seams for service extraction.

## 11) QC-01 architecture consistency addendum

### Required architecture assertions
- EMS is a **multi-tenant SaaS** with tenant context required on all write/read/event interfaces.
- EMS is **API-first**: UI clients, automation, and partner integrations use the same versioned contracts.
- EMS is a **modular monolith evolving to event-driven services** through outbox + Kafka contracts.
- EMS is **AI compatible**: domain events and curated projections are designed for retrieval, assistant tools, and analytics models.

### Canonical domain ownership map
- **Identity & Access:** `tenant`, `organization`, `user`, `role`.
- **Event Operations:** `event`, `venue`, `session`, `sponsor`, `exhibitor`.
- **Commerce & Participation:** `ticket`, `registration`, `attendee`, `order`, `payment`.
- **Engagement:** `notification`.

### Consistency guardrails
1. Each canonical entity has exactly one write-owner module at any time.
2. Cross-module state changes occur via API command contracts or domain events, never shared mutable persistence.
3. Extracted services must preserve existing API/event schema compatibility for at least one deprecation window.
4. AI-facing pipelines must consume only governed projections (no direct cross-tenant table scans).
