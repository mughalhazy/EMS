Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Pre-Frontend Doc-to-Code Delta Audit

> Executed 2026-06-17 as the final backend governance pass before Phase E
> (frontend) begins. Covers all 26 service modules. Source of truth: repository
> code. Documentation corrected to match code; code defects requiring owner
> action escalated separately.

## Scope

All files under:
- `docs/01_backend/` — service catalog, database schema, event/queue architecture, API contract, backend architecture, integration catalog
- `docs/00_authority/` — feature scope, domain model, product workflows, fullstack stitching contract
- `docs/07_governance/` — AI operating context, decision matrices, hygiene policies
- `infra/event-bus/src/topics.ts` — Kafka topic source of truth
- `services/*/src/entities/*.entity.ts` — all 64 entity files
- `services/*/src/*.controller.ts` — all controller files
- `.github/workflows/ci.yml` — CI pipeline
- `package.json` — dependencies and scripts

## Audit Method

1. Read each entity file via PowerShell `Get-ChildItem -Recurse -Filter "*.entity.ts"` (64 files found)
2. Read `infra/event-bus/src/topics.ts` — 64 topics verified
3. Read `apps/api/src/app.module.ts` — 26 service modules confirmed
4. Read `.github/workflows/ci.yml` — CI structure verified
5. Read `package.json` — dependencies verified
6. Compare all documentation against code evidence
7. Apply all corrections immediately (doc/code delta, cross-reference, inventory, archive)
8. Escalate true code defects to OWNER_APPROVAL_ITEMS_BEFORE_PHASE3.md

## Findings Summary

| Category | Count | Disposition |
|---|---|---|
| Kafka topic name/count corrections | 8 services, 64→57 count corrected | Fixed in SERVICE_CATALOG.md and EVENT_AND_QUEUE_ARCHITECTURE.md |
| Entity column corrections | 5 entities (Order, WebhookSubscription, VectorEmbedding, AIInteractionLog) | Fixed in DATABASE_SCHEMA.md |
| Phantom entity removed | WebhookDelivery (never existed in code) | Removed from DATABASE_SCHEMA.md, SERVICE_CATALOG.md |
| Schema name correction | `order` → `ordering` | Fixed in DATABASE_SCHEMA.md, SERVICE_CATALOG.md |
| Analytics schema TBD resolved | 3 entities + 2 views identified and documented | Fixed in DATABASE_SCHEMA.md, SERVICE_CATALOG.md, BACKEND_GAP_REGISTER.md |
| Search technology correction | OpenSearch → Postgres ILIKE | Fixed in DATABASE_SCHEMA.md, SERVICE_CATALOG.md, BACKEND_GAP_REGISTER.md (GAP-B9 closed) |
| pgvector correction | Not used — JSONB used instead | Fixed in DATABASE_SCHEMA.md, BACKEND_GAP_REGISTER.md (GAP-B10 closed) |
| CI test job resolved | `--passWithNoTests` verified | Fixed in AI_OPERATING_CONTEXT.md (question 3 closed) |
| Filename typos fixed | `REVISED_REVISED_` → `REVISED_` (2 occurrences) | Fixed in AI_OPERATING_CONTEXT.md |
| DELTA-7 noted in FROZEN_DECISIONS | Cursor pagination (spec) vs page-based (code) | Note added to AI_OPERATING_CONTEXT.md |
| DELTA-8 added to delta-log | Kafka topic naming/count discrepancy | Added to docs/tracking/delta-log.md |
| GAP-B7 topic count corrected | 57 → 64 | Fixed in BACKEND_GAP_REGISTER.md |
| SAFE_REPOSITORY_HYGIENE A-1 | docs/canon/ → docs/legacy/ | Executed — 10 files copied, MOVED.md placed, cross-refs updated |
| SAFE_REPOSITORY_HYGIENE A-2 | docs/architecture/ → docs/legacy/ | Executed — 2 files copied, MOVED.md placed, cross-refs updated |
| SAFE_REPOSITORY_HYGIENE A-3 | docs/product/product-overview.md → docs/legacy/ | Executed — 1 file copied, MOVED.md placed |
| SAFE_REPOSITORY_HYGIENE A-5A | Removed dead `test:e2e` script from package.json | Executed |
| Cross-reference updates (docs/legacy/) | 6 active authority docs updated | PROJECT_CHARTER.md, FEATURE_SCOPE.md, README.md, SERVICE_CATALOG.md, INTEGRATION_CATALOG.md, AI_OPERATING_CONTEXT.md |

## Escalated Items (Owner Required)

| Item | Description |
|---|---|
| GAP-G11 / A-4 | `postgres-init.sql` line 18: `"order"` schema must be renamed to `"ordering"` — CRITICAL infrastructure defect |
| C-4 | Modular monolith extractability question — strategic architectural decision |
| DELTA-7 | Pagination model: decide whether to update api-standards.md to match code (page-based) or schedule cursor migration |

See `docs/08_reports/OWNER_APPROVAL_ITEMS_BEFORE_PHASE3.md` for full detail.

## Files Modified This Session

| File | Change Type |
|---|---|
| `docs/01_backend/SERVICE_CATALOG.md` | Major — 12 Kafka topic corrections, 4 entity corrections, schema name fix, analytics/search/integration corrections |
| `docs/01_backend/DATABASE_SCHEMA.md` | Major — 7 entity corrections (Order, WebhookSubscription/Delivery, VectorEmbedding, AIInteractionLog, analytics TBD, search correction) |
| `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md` | Major — Section 5 rewritten; 57 → 64 topics; all names corrected |
| `docs/07_governance/AI_OPERATING_CONTEXT.md` | Multiple — CI TBD resolved, DELTA-7 noted, SAFE_REPOSITORY_HYGIENE items marked complete, cross-refs updated, filename typos fixed |
| `docs/08_reports/BACKEND_GAP_REGISTER.md` | GAP-B9/B10 closed, GAP-B12 closed, GAP-B7 topic count corrected |
| `docs/tracking/delta-log.md` | DELTA-8 added; Last Updated corrected |
| `docs/00_authority/PROJECT_CHARTER.md` | Cross-ref: docs/architecture → docs/legacy |
| `docs/00_authority/FEATURE_SCOPE.md` | Cross-ref: docs/architecture → docs/legacy |
| `docs/01_backend/README.md` | Cross-ref: docs/canon + docs/architecture → docs/legacy |
| `docs/01_backend/INTEGRATION_CATALOG.md` | Cross-ref: docs/architecture → docs/legacy |
| `package.json` | Removed dead `test:e2e` script (A-5A) |
| `docs/legacy/` | NEW — 13 files consolidated from docs/canon/, docs/architecture/, docs/product/ |
| `docs/canon/MOVED.md` | NEW — forwarding note |
| `docs/architecture/MOVED.md` | NEW — forwarding note |
| `docs/product/MOVED.md` | NEW — forwarding note |

## No-Change Confirmation

The following were verified as correct and required no changes:
- All 26 service module registrations in `app.module.ts`
- Auth Kafka topics (`user.registered`, `user.login_succeeded`, `user.sso_login_succeeded`)
- All commerce topic names (verified against topics.ts after correction)
- `VectorEmbedding` schema name `ai_service` (correct)
- `EventBusService.publish()` outbox pattern description
- CI lint-typecheck job structure
- Redis and Kafka connection checks in health endpoint
