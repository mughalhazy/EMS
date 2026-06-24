Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-17
Owner: USER

# Owner Approval Items Before Phase E (Frontend)

> Produced by: Pre-Frontend Doc-to-Code Delta Audit, 2026-06-17.
> Lists all items requiring owner decision or approval before or during Phase E
> (frontend development). Items classified as REQUIRES_APPROVAL under the
> governance tier system — AI cannot execute these autonomously.
>
> See `docs/07_governance/REVISED_DECISION_ESCALATION_MATRIX.md` for tier definitions.

---

## OA-1 (CRITICAL): Fix `postgres-init.sql` Schema Name (GAP-G11 / A-4)

- **Tier**: REQUIRES_APPROVAL
- **File**: `infra/docker/init/postgres-init.sql`, line 18
- **Current**: `CREATE SCHEMA IF NOT EXISTS "order";`
- **Correct**: `CREATE SCHEMA IF NOT EXISTS "ordering";`
- **Why this requires approval**: This is an infrastructure file that initializes the
  production database schema on first run. Changing it affects:
  - All existing local Docker volumes (must be reset after change)
  - Production database migration plan (schema rename required for any existing deployment)
  - Any tooling or migrations referencing the `order` schema by name
- **Why it MUST be fixed**: `services/order/src/entities/order.entity.ts` uses
  `{ schema: 'ordering', name: 'orders' }`. The TypeORM entity and the SQL init
  script disagree. A fresh database initialization will create schema `"order"` but
  TypeORM will fail to find or create the `ordering.orders` table, causing
  runtime failure for all order, payment, fulfillment features.
- **Exact change**:
  ```sql
  -- line 18 in infra/docker/init/postgres-init.sql
  -- BEFORE:
  CREATE SCHEMA IF NOT EXISTS "order";
  -- AFTER:
  CREATE SCHEMA IF NOT EXISTS "ordering";
  ```
- **Post-fix action**: Run `docker:reset` (`docker-compose down -v`) to destroy
  existing volumes, then `docker:up` to re-initialize with the correct schema.
- **Governs**: GAP-G11 (from Full Repository Normalization Audit), A-4 (from
  APPROVAL_RECLASSIFICATION_REPORT.md)

---

## OA-2 (MEDIUM): Resolve Pagination Strategy (DELTA-7)

- **Tier**: REQUIRES_APPROVAL (strategic architectural decision)
- **Current state**: `docs/legacy/api-standards.md` specifies cursor-based pagination
  (`?cursor=<token>&limit=`). All 26 implemented services use page-based pagination
  (`?page=<number>&limit=`).
- **Decision needed**: Choose one:
  1. **Accept page-based** (match code): Update `api-standards.md` (now in `docs/legacy/`)
     to reflect page-based as the implemented standard. Create a new authority entry in
     `docs/01_backend/API_CONTRACT.md` explicitly documenting this as the standard.
  2. **Schedule cursor migration**: Commit to migrating all list endpoints to cursor
     pagination before or during Phase E, with a versioning plan (ADR required).
  3. **Defer**: Document the delta formally and let frontend build against page-based,
     acknowledging a future breaking change.
- **Impact on frontend**: Frontend must know which pagination style the API actually
  uses before building any list/table UI. Page-based is currently implemented — frontend
  building against cursor-based will not work.
- **AI recommendation**: Option 1 (accept page-based) for now. Cursor pagination adds
  significant complexity for marginal benefit at current scale. A future ADR can revisit
  when data volumes justify it. Page-based with `total`/`totalPages` is well-understood
  and sufficient for Phase E.

---

## OA-3 (MEDIUM): Resolve `engagement` Module Fate (GAP-G3, GAP-B13)

- **Tier**: REQUIRES_APPROVAL
- **Current state**: `services/engagement` is a stub module with a 2-line comment
  controller, zero entities, zero Kafka consumers, and zero HTTP routes. It is
  registered in `app.module.ts` but contributes nothing.
- **Background**: The `engagement` module was originally planned to host `Campaign`
  and `AudienceSegment`, but those entities were implemented in `notification` instead.
- **Decision needed**: Choose one:
  1. **Remove `EngagementModule`** from `app.module.ts` and delete `services/engagement/`.
     Close GAP-G3 and GAP-B13 explicitly.
  2. **Assign a new purpose** (e.g., gamification, badges, points system) and plan
     implementation for a later phase.
  3. **Leave as-is** and accept the dead module overhead.
- **Impact**: Option 1 is low-risk (stub only), cleans the module list, and removes
  a confusing presence in the codebase. Option 2 requires scope expansion discussion.
- **AI recommendation**: Option 1, unless the owner has a planned use for the slot.

---

## OA-4 (LOW): Resolve `docs/tracking/progress.md` Fate

- **Tier**: REQUIRES_APPROVAL (doc deprecation decision)
- **Current state**: `progress.md` was last updated 2026-06-13 and incorrectly marks
  Batches 8–10, Enterprise SSO, and `integration` as not started (all are implemented).
- **Decision needed**: Choose one:
  1. **Deprecate**: Add a retirement header to `progress.md`, move to `docs/legacy/`,
     direct readers to `docs/00_authority/FEATURE_SCOPE.md` and `docs/08_reports/`
     as the current status source.
  2. **Refresh**: Update `progress.md` to reflect current implementation state (would
     be a significant rewrite effort).
  3. **Leave as-is**: Accept stale progress doc with a warning header only.
- **Risk if left stale**: Any new session or developer reading `progress.md` will have
  a fundamentally wrong picture of what is built.
- **AI recommendation**: Option 1 (deprecate). The gap registers and service catalog
  are more reliable progress indicators.

---

## OA-5 (LOW): Strategic Question — Modular Monolith Extractability (C-4)

- **Tier**: REQUIRES_APPROVAL (architectural direction question)
- **From**: `docs/08_reports/CONFLICT_ANALYSIS_REPORT.md` C-4
- **Question**: `docs/legacy/system-architecture.md` §2 states the system is "designed
  to be extractable into independent deployables later." Is this still a live
  architectural constraint, or was it an abandoned Phase A aspiration?
- **Decision needed**: Choose one:
  1. **Live constraint**: The modular monolith is intended to be split into microservices
     at some future scale point. This means: no cross-module synchronous calls, Kafka
     remains the only cross-service coupling, and module boundaries must be maintained.
  2. **Abandoned aspiration**: The system will remain a modular monolith indefinitely.
     Some coupling shortcuts (direct service injection, shared memory) are acceptable.
- **Impact**: This decision affects architectural review criteria for Phase E (which
  will introduce a new `ui-renderer` module and web app) and any future infra decisions.
- **AI recommendation**: Treat as a live constraint (Option 1) unless explicitly abandoned.
  The Kafka/outbox pattern and schema-per-service are already in place and make extraction
  viable at low additional cost.

---

## OA-6 (LOW): Resolve `A-5B` — E2E Test Baseline (APPROVAL_RECLASSIFICATION_REPORT.md)

- **Tier**: REQUIRES_APPROVAL
- **Background**: A-5B was split from A-5A (dead script removal) because implementing
  a real e2e test suite requires scope and infrastructure decisions beyond doc hygiene.
- **Decision needed**: Is writing an e2e baseline a priority for this phase, or deferred?
  An e2e suite against a test database would need:
  - A real test DB (Docker) or a dedicated test environment
  - Decision on which critical paths to cover first (auth, registration, checkout, etc.)
  - Removal of `--passWithNoTests` flag from CI once baseline exists
- **Impact**: Without e2e tests, CI never fails on broken API behavior — only TypeScript
  type errors and lint failures are caught.
- **AI recommendation**: Defer to post-Phase E. The unit test gap (GAP-B2) is more
  urgent — 22 services with zero spec files before adding e2e overhead.

---

## Summary

| Item | Severity | Type | AI Recommendation |
|---|---|---|---|
| OA-1: postgres-init.sql schema fix | CRITICAL | Infrastructure code change | Fix immediately before any local testing |
| OA-2: Pagination strategy | MEDIUM | Architectural decision + doc update | Accept page-based; update API_CONTRACT.md |
| OA-3: Engagement module fate | MEDIUM | Module removal or assignment | Remove stub module (Option 1) |
| OA-4: progress.md deprecation | LOW | Documentation decision | Deprecate and move to docs/legacy/ |
| OA-5: Extractability constraint | LOW | Strategic architecture question | Treat as live constraint |
| OA-6: E2E test baseline | LOW | Test infrastructure decision | Defer to post-Phase E |
