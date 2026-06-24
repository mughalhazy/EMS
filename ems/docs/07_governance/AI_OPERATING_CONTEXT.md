Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-17 (Compression Pass)
Owner: AI

# AI Operating Context

> This is the primary "load this first" document for any new AI session
> working in this repository. It is derived from verified repository state as
> of 2026-06-15 (see `00_authority/PROJECT_CHARTER.md` and
> `08_reports/GOVERNANCE_IMPLEMENTATION_REPORT.md` for provenance).

## CURRENT_PHASE

- Backend (Batches 1–10, including gap-fill batches 8–10, Enterprise SSO, and
  `integration`) is **implemented**. Verified: 26 service directories under
  `services/`, all registered in `apps/api/src/app.module.ts` (27 `Module,`
  registrations, 32 unique `*Module` symbols).
- **Phase E (Frontend)** is **not started**: `apps/web` contains only
  `README.md`; `design/tokens`, `design/components`, `design/wireframes`
  contain only 9-line `README.md` stubs; `services/ui-renderer` is a scaffold.
- **Governance complete as of 2026-06-17**: All governance passes completed —
  Phase 1 through Phase 3.25 (Autonomous Gap Elimination), Final Gap Closure,
  and Owner-Required Item Compression. All 68 items classified. OWNER-REQUIRED
  count = 0. See `docs/08_reports/FINAL_CLASSIFIED_REGISTER.md` and
  `docs/08_reports/OWNER_REQUIRED_COMPRESSION_REPORT.md`.
- **Next phase**: **Phase E (Frontend)** — fully authorized; 0 blockers.
  All implementation items are AUTO-CLOSED, SAFE-DEFAULT, or OUT-OF-SCOPE.
- **Hygiene actions executed 2026-06-17**: A-1/A-2/A-3/A-4/A-5A all complete.
  See `docs/08_reports/APPROVAL_RECLASSIFICATION_REPORT.md`.

## FROZEN_DECISIONS

The following are established and verified in the codebase — changing them
requires a new ADR under `06_decisions/` and falls under REQUIRES APPROVAL
(see `REVISED_DECISION_ESCALATION_MATRIX.md`):

1. **Service boundaries** — 26 services as enumerated in
   `docs/canon/service-map.md` and `00_authority/FEATURE_SCOPE.md` §2.
2. **Schema-per-service** Postgres convention (`00_authority/DOMAIN_MODEL.md` §1).
3. **No cross-service DB foreign keys** — cross-service references by ID +
   eventual consistency via Kafka (`00_authority/DOMAIN_MODEL.md` §1).
4. **Multi-tenancy model** — shared DB, shared schema, `tenant_id` row-level
   isolation enforced via manual `where: { tenantId }` filter in every service.
   Note: `TenantScopedRepository` base class exists in `infra/common` but is
   not extended by any service — all 26 services filter manually (verified 2026-06-17).
5. **API conventions** — `/v1/` prefix, `{data, meta}` / `{error:{code,message,details}, meta}`
   envelopes, `Idempotency-Key` header, RBAC via `@RequirePermissions` +
   `PermissionsGuard` (`docs/canon/api-standards.md`). Note: api-standards.md
   specifies cursor pagination but code uses page-based `?page=` pagination
   (DELTA-7 — open delta, doc update pending).
6. **Event bus** — Kafka via `infra/event-bus`, **direct publish** pattern
   (all 26 services call `eventBus.publish()` directly). Outbox relay
   infrastructure exists in `EventBusModule` but outbox table is always
   empty — no service uses it. Corrected 2026-06-17; `docs/canon/data-architecture.md`
   claim of "outbox pattern" reflects design intent, not actual implementation.
7. **Single deployable backend (modular monolith)** — all 26 services run
   inside one NestJS process (`apps/api`) as a modular monolith with
   event-driven integration, not as separate microservice deployments
   (verified: single `app.module.ts` registering all modules).
8. **Tech stack** — NestJS 10 + TypeORM 0.3 + Postgres + Redis (ioredis) +
   Kafka (kafkajs) + OpenSearch, TypeScript 5.6, Jest 29 (verified
   `package.json`).

## KNOWN_CONSTRAINTS

- **Workspace isolation**: this project's npm/pnpm/jest/cache/temp directories
  are redirected to the `D:` drive via `HKCU\Environment` variables (audited
  this session — confirmed sealed except for pre-existing, out-of-scope global
  CLI tooling under `C:\Users\Admin\AppData\Roaming\npm` and
  `C:\Users\Admin\.cache`). Do not assume default `%APPDATA%`/`C:` paths for
  caches.
- **Memory limits**: default Node heap is insufficient for `tsc --noEmit` and
  full `jest` runs on this machine — use
  `node --max-old-space-size=3072 node_modules/typescript/bin/tsc --noEmit`
  and `node --max-old-space-size=2048 node_modules/jest/bin/jest.js --runInBand`.
- **Test coverage is critically low**: only 4/26 services have any
  `.spec.ts` (auth, notification, onsite, order — 1 each). See
  `08_reports/ARCHITECTURAL_GAP_REGISTER.md` GAP-G4.
- **No Docker on this machine** (verified this session) — `docker:up`/`docker:down`
  scripts cannot be exercised locally; this is a latent risk for local
  integration testing.
- **`docs/tracking/progress.md` is stale** (last updated 2026-06-13) — it
  incorrectly marks Batches 8–10, Enterprise SSO, and `integration` as not
  started. Do not trust it for current status; trust
  `docs/tracking/gap-register.md` and `00_authority/FEATURE_SCOPE.md` instead.

## ACTIVE_AUTHORITY_DOCS

In order of precedence (highest first):

1. `docs/00_authority/PROJECT_CHARTER.md`
2. `docs/00_authority/FEATURE_SCOPE.md`
3. `docs/00_authority/DOMAIN_MODEL.md` (summary) → `docs/canon/domain-model.md` (detail)
4. `docs/00_authority/PRODUCT_WORKFLOWS.md` (summary) → `docs/canon/workflow-catalog.md` (detail)
5. `docs/00_authority/FULLSTACK_STITCHING_CONTRACT.md`
6. `docs/legacy/service-map.md`, `docs/legacy/capability-matrix.md`,
   `docs/legacy/api-standards.md`, `docs/legacy/event-catalog.md`,
   `docs/legacy/security-model.md`, `docs/legacy/data-architecture.md`,
   `docs/legacy/ui-surface-map.md` — **Retired (full or partial) as of 2026-06-15.
   Relocated from `docs/canon/` to `docs/legacy/` on 2026-06-17 (A-1).
   Their Phase 2 successors in `docs/01_backend/` and `docs/03_fullstack_contracts/`
   take precedence for all implemented behavior. Some preserve active design
   targets for unimplemented features (see `docs/08_reports/DUPLICATION_ANALYSIS_REPORT.md`).**
7. `docs/legacy/system-architecture.md` (Retired; relocated from `docs/architecture/` — A-2),
   `docs/legacy/ai-architecture.md` (Supporting Reference; no Phase E AI authority doc yet — A-2)
8. `docs/tracking/gap-register.md` (historical — closed gaps GAP-1 through GAP-7;
   current gaps tracked in `docs/08_reports/ARCHITECTURAL_GAP_REGISTER.md` and
   `docs/08_reports/BACKEND_GAP_REGISTER.md`)
9. `06_decisions/ADR-001_PROJECT_FOUNDATION.md` and subsequent ADRs
10. `BUILD_BLUEPRINT.md` (workspace root, `D:\SaaS\EMS\BUILD_BLUEPRINT.md`)

**Governance documents (all active as of 2026-06-17):**
- `docs/07_governance/REVISED_DECISION_ESCALATION_MATRIX.md` — three-tier decision matrix (supersedes original)
- `docs/07_governance/SAFE_REPOSITORY_HYGIENE_POLICY.md` — repository hygiene tier definition
- `docs/07_governance/REPOSITORY_HYGIENE_EXECUTION_GUIDELINES.md` — hygiene execution process

**Final classification registers (load these for any Phase E session):**
- `docs/08_reports/FINAL_CLASSIFIED_REGISTER.md` — authoritative; 68 items (AUTO-CLOSED 38, SAFE-DEFAULT 29, OUT-OF-SCOPE 1, OWNER-REQUIRED 0)
- `docs/08_reports/OWNER_REQUIRED_COMPRESSION_REPORT.md` — compression pass analysis; ROD-10 and GAP-FE7 reclassification rationale
- `docs/08_reports/OWNER_CONFIRMATION_REGISTER.md` — OCR-1 through OCR-5 specs (all SAFE-DEFAULT; silence = confirm)
- `docs/03_frontend_authority/FRONTEND_AUTHORITY_MASTER.md` — 91 routes, 28 screens, 7 dashboards

Do **not** treat `docs/tracking/progress.md` as authoritative for current
implementation status (see KNOWN_CONSTRAINTS).

## REQUIRED_VALIDATIONS

Before considering any backend code change complete, run:

```
node --max-old-space-size=3072 node_modules/typescript/bin/tsc --noEmit
node --max-old-space-size=2048 node_modules/jest/bin/jest.js --passWithNoTests --runInBand
```

Lint (per `.github/workflows/ci.yml` lint-typecheck job, verified):

```
npx eslint "{src,apps,libs,test,services,infra}/**/*.ts" --max-warnings=0
npx tsc -p tsconfig.json --noEmit
```

A `test` job also exists in `.github/workflows/ci.yml` (Unit Tests,
ubuntu-latest) — runs `npm test -- --passWithNoTests`, meaning CI passes
even with zero spec files (verified 2026-06-17).

## SAFE_REPOSITORY_HYGIENE_TIER

As of 2026-06-17, a third execution tier exists between AUTONOMOUS and
REQUIRES_APPROVAL: **SAFE_REPOSITORY_HYGIENE**.

SAFE_REPOSITORY_HYGIENE covers documentation moves, folder renames within
`docs/`, archive maintenance, retirement header notes, cross-reference fixes,
new README creation, gap register updates, and other organizational work that
does not touch source code, infrastructure, APIs, databases, security, or
runtime behavior.

SAFE_REPOSITORY_HYGIENE actions do **not** require owner confirmation but
**must** be logged in the session report.

Authority: `docs/07_governance/SAFE_REPOSITORY_HYGIENE_POLICY.md`  
Full matrix: `docs/07_governance/REVISED_DECISION_ESCALATION_MATRIX.md`  
Execution process: `docs/07_governance/REPOSITORY_HYGIENE_EXECUTION_GUIDELINES.md`

---

## PROTECTED_AREAS

These areas encode frozen architectural decisions (FROZEN_DECISIONS above).
Modifying them requires an ADR and falls under REQUIRES APPROVAL:

- `infra/common/` — shared guards, decorators, response envelope, base
  repository (tenant isolation enforcement point).
- `infra/event-bus/src/topics.ts` and the event catalog
  (`docs/canon/event-catalog.md`) — changing/removing topics breaks
  cross-service contracts.
- `services/*/src/entities/*.entity.ts` — schema-per-service boundaries;
  adding fields is lower-risk than renaming/removing or adding cross-schema FKs.
- `apps/api/src/app.module.ts` — module registration for all 26 services.
- `docs/canon/*` — canonical architecture docs; edits should go through ADRs
  when they represent a decision change, or be flagged as corrections
  (Documentation Freshness Rule below) when they represent stale-doc fixes.

## DO_NOT_MODIFY_AREAS

- **`docs/canon/*` and `docs/architecture/*`** — do not silently rewrite;
  these are historical/canonical. If found stale or conflicting, document the
  conflict in `08_reports/ARCHITECTURAL_GAP_REGISTER.md` (or its successor)
  rather than editing in place, unless explicitly asked to reconcile.
- **`BUILD_BLUEPRINT.md`** (workspace root) — top-level build plan, treat as
  read-only reference unless the user explicitly requests changes.
- **Production data, audit logs, tenant isolation code** — see PROHIBITED in
  `REVISED_DECISION_ESCALATION_MATRIX.md`.
- **`HKCU\Environment` variables for workspace isolation** — do not change
  npm/pnpm/cache/temp redirection without re-running the sealing audit from
  this session.

## OPEN_ARCHITECTURAL_QUESTIONS

1. ~~Should `services/engagement` be removed/repurposed?~~
   **RESOLVED 2026-06-17** (SAFE-DEFAULT / OCR-1): Remove `EngagementModule` —
   zero routes, zero consumers, zero entities. Campaign/AudienceSegment correctly
   owned by `services/notification`. Spec complete in OWNER_CONFIRMATION_REGISTER.md.

2. ~~Is Phase E or platform hardening the next priority?~~
   **RESOLVED 2026-06-17**: Phase E is authorized. OWNER-REQUIRED count = 0.
   Platform hardening (test coverage, OAuth/SAML, webhook HMAC) is parallel
   work — SAFE-DEFAULT items all have specs; can begin alongside Phase E.

3. ~~What is the actual content of the `test` job in `.github/workflows/ci.yml`?~~
   **Resolved 2026-06-17**: runs `npm test -- --passWithNoTests`; CI passes
   with zero spec files. Low test coverage is GAP-G4 (SAFE-DEFAULT).

4. ~~Should `docs/tracking/progress.md` be refreshed or deprecated?~~
   **RESOLVED 2026-06-17** (SAFE-DEFAULT / GAP-G1): Update to mark Batches
   8–10, SSO, integration as complete — or retire the file. SAFE_REPOSITORY_HYGIENE
   action; can be executed autonomously.

5. ~~OAuth2/SAML assertion verification and webhook HMAC signing — when scheduled?~~
   **RESOLVED 2026-06-17** (SAFE-DEFAULT / GAP-G6): Both have single correct
   technical implementations. SSO: verify assertion against `SsoConnection.certificate`
   + `issuer`. Webhooks: add `X-Hub-Signature-256` HMAC-SHA256 header. Pre-production
   requirement; REQUIRES_APPROVAL tier; can begin alongside Phase E.

6. **C-4**: Is modular monolith "extractable to microservices" still a live constraint?
   **OUT-OF-SCOPE for Phase E** — does not affect frontend implementation. Revisit
   before any infrastructure/deployment planning phase. See CONFLICT_ANALYSIS_REPORT.md.

## DOCUMENT_FRESHNESS_POLICY

- Every document under `docs/00_authority/`, `docs/06_decisions/`,
  `docs/07_governance/`, and `docs/08_reports/` must carry the metadata
  header (`Status`, `Authority Level`, `Last Reviewed`, `Owner`).
- When a session discovers that a canonical doc (`docs/canon/*`,
  `docs/architecture/*`, `docs/tracking/*`) is stale or conflicts with the
  current codebase, it must NOT silently rewrite history. Instead:
  1. Record the discrepancy in `08_reports/ARCHITECTURAL_GAP_REGISTER.md` (or
     successor report).
  2. Correct the summary in `docs/00_authority/*` (these are "living"
     documents, `Status: Active`, expected to track reality).
  3. Only edit the stale canonical doc directly if the user explicitly asks
     for reconciliation, or if the edit is a pure `Status:`/date metadata
     correction (as done for GAP-1/GAP-7 in this project's history).
- `docs/00_authority/*` documents should be re-reviewed (update
  `Last Reviewed`) whenever a governance-relevant change lands (new service,
  schema change, workflow change, ADR).

## CONTRACT_COMPATIBILITY_POLICY

- Any change to an entity in `services/*/src/entities/`, a topic in
  `infra/event-bus/src/topics.ts`, or an endpoint path/response shape defined
  by `docs/canon/api-standards.md` is a **contract change**.
- Contract changes must:
  1. Be reflected in `00_authority/FULLSTACK_STITCHING_CONTRACT.md` for the
     affected feature row(s).
  2. Be reflected in `docs/canon/domain-model.md` / `event-catalog.md` /
     `api-standards.md` as applicable.
  3. Follow REQUIRES APPROVAL classification in `REVISED_DECISION_ESCALATION_MATRIX.md`
     if the change is breaking (field removal/rename, topic removal, response
     shape change) — additive changes (new optional field, new event, new
     endpoint) are AUTONOMOUS.
  4. Pass `REQUIRED_VALIDATIONS` above before being considered complete.
- Backward compatibility: since all 26 services run in one process with no
  versioned inter-service contracts beyond Kafka event shapes, **Kafka event
  payload shape changes are the highest-risk contract changes** — they affect
  every consumer of that topic across services and read models (`analytics`,
  `search`).
