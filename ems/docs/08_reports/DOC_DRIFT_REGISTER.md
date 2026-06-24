Status: Active
Authority Level: Medium
Last Reviewed: 2026-06-17
Owner: AI

# Documentation Drift Register

> Produced by: Pre-Frontend Doc-to-Code Delta Audit, 2026-06-17.
> Documents areas where documentation has accumulated meaningful drift from
> code reality over time. Distinct from point-in-time deltas (DOC_TO_CODE_DELTA_MATRIX.md)
> — this register identifies systemic drift patterns and their root causes.

## DDR-1: Kafka Topic Naming Convention Drift

- **Pattern**: All topic names in `SERVICE_CATALOG.md` and prior `EVENT_AND_QUEUE_ARCHITECTURE.md`
  used sub-domain-prefixed naming (`agenda.session_created`, `networking.connection_requested`)
  while the actual `topics.ts` uses flat domain-prefix naming (`session.created`, `connection.requested`).
- **Root cause**: Documentation was authored by inference from domain names rather than
  read from `infra/event-bus/src/topics.ts`. The discrepancy grew as more services were
  added without a verification step.
- **Magnitude**: All 64 topic names were wrong or missing. Topic count was understated by 7.
- **Corrected**: 2026-06-17 — full rewrite of EVENT_AND_QUEUE_ARCHITECTURE.md §5;
  SERVICE_CATALOG.md all Kafka rows corrected.
- **Prevention**: Any future topic additions must be added to `topics.ts` FIRST, then
  documented by copying the exact string from that file.

---

## DDR-2: Entity Column Drift (Order, WebhookSubscription, VectorEmbedding, AIInteractionLog)

- **Pattern**: Several entity schemas in `DATABASE_SCHEMA.md` described columns that
  don't exist in the TypeORM entity, or used different names/types.
- **Root cause**: DATABASE_SCHEMA.md was authored during Phase 1 (design phase) and not
  updated when implementation diverged during Phase D.
- **Specific drifts found**:
  - `Order.attendeeId` → actually `userId`; `totalAmount`/`currency` → `subtotalCents`/`discountCents`/`totalCents`
  - `WebhookSubscription.url` → `targetUrl`; `events (varchar[])` → `eventTypes (jsonb)`
  - `VectorEmbedding.embedding (vector)` → `vector (jsonb)`; spurious `tenantId` column
  - `AIInteractionLog.model`, `tokensUsed` — columns that were never implemented
- **Corrected**: 2026-06-17 — targeted edits to DATABASE_SCHEMA.md.
- **Prevention**: Entity schema documentation must be extracted from TypeORM entity files
  directly, not authored from design docs.

---

## DDR-3: Phantom Entity Documentation (WebhookDelivery)

- **Pattern**: `WebhookDelivery` entity was documented in both `DATABASE_SCHEMA.md` and
  `SERVICE_CATALOG.md` but has never existed in the code.
- **Root cause**: Documentation was written ahead of implementation (aspirational), then
  never reconciled when the entity was not built.
- **Risk**: Any frontend developer building a webhook delivery history UI would build
  against a non-existent API.
- **Corrected**: 2026-06-17 — entity removed from DATABASE_SCHEMA.md and SERVICE_CATALOG.md.
- **Prevention**: Mark any speculative/planned entities clearly as `Status: PLANNED` rather
  than presenting them as implemented.

---

## DDR-4: Analytics Schema Documentation Deficit

- **Pattern**: The analytics service's entity schema was left as "TBD — REQUIRES VERIFICATION"
  across multiple documents for multiple governance passes.
- **Root cause**: Analytics entities were deprioritized in earlier passes due to their
  CQRS/read-model nature. The presence of TypeORM `@ViewEntity` was not anticipated.
- **Corrected**: 2026-06-17 — all 5 entities/views extracted and documented in
  DATABASE_SCHEMA.md and SERVICE_CATALOG.md.
- **Prevention**: Future passes must not leave TBD entries in authority documents.

---

## DDR-5: Technology Stack Drift (Search and Vector Storage)

- **Pattern**: Documentation consistently described `search` as using OpenSearch and
  AI embeddings as using `pgvector`, while the actual implementation uses Postgres ILIKE
  and JSONB respectively.
- **Root cause**: Documentation was written to the target architecture (OpenSearch + pgvector)
  before implementation, and not updated when interim implementations were chosen during
  the build phase.
- **Impact**:
  - Any infrastructure provisioning guided by prior docs would add OpenSearch as a hard
    dependency and pgvector extension when neither is currently needed.
  - An OpenSearch client is in `.env.development.example` (commented out) — potential confusion.
- **Corrected**: 2026-06-17 — DATABASE_SCHEMA.md, SERVICE_CATALOG.md, BACKEND_GAP_REGISTER.md
  (GAP-B9/B10 closed).
- **Prevention**: When implementation diverges from target architecture, document the
  divergence immediately in `delta-log.md` and update DATABASE_SCHEMA.md.

---

## DDR-6: Schema Name Drift (`order` vs. `ordering`)

- **Pattern**: All documentation used `order` as the Postgres schema name for the order
  service. The actual schema is `ordering` (SQL reserved word avoidance).
- **Root cause**: The rename was made during implementation but not propagated to docs.
  Compound impact: `postgres-init.sql` itself was also not updated (GAP-G11 — still creates
  `"order"` schema), making this both a doc drift AND a code defect.
- **Status**: Documentation corrected (DATABASE_SCHEMA.md, SERVICE_CATALOG.md). Code defect
  (postgres-init.sql) escalated as A-4 — owner approval required.
- **Corrected (docs only)**: 2026-06-17.

---

## DDR-7: Documentation Written Before Implementation

- **Pattern**: Multiple governance passes in Phase 1 (2026-06-15) wrote documentation
  describing what things "should" be without verifying what actually exists.
- **Root cause**: The Phase 1 governance passes operated on canon docs (themselves Phase A
  design documents) rather than on the codebase. The authority chain was: design docs →
  governance docs → gap reports, with code as a tertiary input.
- **Impact**: Every gap register, service catalog, and schema document from Phase 1/Phase 2
  required correction during this audit.
- **Prevention**: All future authority documents under `docs/01_backend/` and `docs/00_authority/`
  MUST be derived from code evidence. The Pre-Frontend Delta Audit (this pass) establishes
  the corrected baseline. Going forward, the rule is "repository and code are the source
  of truth."

---

## Drift Risk Assessment by Document

| Document | Drift Risk | Notes |
|---|---|---|
| `docs/01_backend/SERVICE_CATALOG.md` | Low (post-audit) | Fully corrected 2026-06-17 |
| `docs/01_backend/DATABASE_SCHEMA.md` | Low (post-audit) | Fully corrected 2026-06-17 |
| `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md` | Low (post-audit) | Fully corrected 2026-06-17 |
| `docs/01_backend/API_CONTRACT.md` | Medium | Endpoint listing not re-verified this pass |
| `docs/01_backend/BACKEND_ARCHITECTURE.md` | Low | Structural doc; less likely to drift |
| `docs/00_authority/FULLSTACK_STITCHING_CONTRACT.md` | Medium | Data shapes need frontend implementation to validate |
| `docs/legacy/*.md` | High (intentional) | Retired — expected to be out of date |
| `docs/tracking/progress.md` | Critical | Known stale since 2026-06-13 — do not use |
