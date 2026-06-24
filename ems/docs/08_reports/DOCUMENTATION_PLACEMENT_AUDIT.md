Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Documentation Placement Audit

> Verifies that all documentation is correctly placed within the docs/
> framework; identifies docs outside the framework that compete with or
> duplicate authority docs; identifies source files in doc folders; identifies
> reports in authority folders.

---

## 1. Are All Authority Docs in Correct Folders?

| Document | Current Location | Correct Folder? | Notes |
|---|---|---|---|
| `PROJECT_CHARTER.md` | `docs/00_authority/` | ✅ | |
| `FEATURE_SCOPE.md` | `docs/00_authority/` | ✅ | |
| `DOMAIN_MODEL.md` | `docs/00_authority/` | ✅ | |
| `PRODUCT_WORKFLOWS.md` | `docs/00_authority/` | ✅ | |
| `FULLSTACK_STITCHING_CONTRACT.md` | `docs/00_authority/` | ✅ | |
| `ADR-001_PROJECT_FOUNDATION.md` | `docs/06_decisions/` | ✅ | |
| `AI_OPERATING_CONTEXT.md` | `docs/07_governance/` | ✅ | |
| `DECISION_ESCALATION_MATRIX.md` | `docs/07_governance/` | ✅ | |
| `BACKEND_ARCHITECTURE.md` | `docs/01_backend/` | ✅ | |
| `SERVICE_CATALOG.md` | `docs/01_backend/` | ✅ | |
| `DATABASE_SCHEMA.md` | `docs/01_backend/` | ✅ | |
| `API_CONTRACT.md` | `docs/01_backend/` | ✅ | |
| `ERROR_CONTRACT.md` | `docs/01_backend/` | ✅ | |
| `VALIDATION_RULES.md` | `docs/01_backend/` | ✅ | |
| `INTEGRATION_CATALOG.md` | `docs/01_backend/` | ✅ | |
| `EVENT_AND_QUEUE_ARCHITECTURE.md` | `docs/01_backend/` | ✅ | |
| `AUTH_AND_TENANCY_CONTRACT.md` | `docs/03_fullstack_contracts/` | ✅ | |
| `USER_ROLES_AND_PERMISSIONS.md` | `docs/03_fullstack_contracts/` | ✅ | |
| `DATA_SHAPE_REGISTRY.md` | `docs/03_fullstack_contracts/` | ✅ | |
| `VALIDATION_PARITY.md` | `docs/03_fullstack_contracts/` | ✅ | |
| `CONTRACT_VERSION_REGISTRY.md` | `docs/03_fullstack_contracts/` | ✅ | |

**Verdict**: All 20 authority documents are in their correct numbered folders. ✅

---

## 2. Are All Reports in Reports Folders?

| Document | Current Location | Correct Folder? | Notes |
|---|---|---|---|
| All `GOVERNANCE_*`, `BACKEND_*`, `DOCUMENT_*`, `REPOSITORY_*`, etc. | `docs/08_reports/` | ✅ | 21 existing reports (+ 9 new from this audit) |
| `docs/tracking/gap-register.md` | `docs/tracking/` | ⚠️ | Historical record; its successor registers are in `docs/08_reports/`. The tracking folder pre-dates the numbered framework. Classified as Historical Record in normalization pass. |
| `docs/tracking/doc-tracker.md` | `docs/tracking/` | ⚠️ | Same pattern — obsolete health assessment. |
| `docs/tracking/progress.md` | `docs/tracking/` | ⚠️ | Same pattern — obsolete build progress tracker. |

**Verdict**: All current-generation reports are in `docs/08_reports/`. The Phase A `docs/tracking/` documents are historical records, not reports — keeping them in `tracking/` is acceptable but creates a dual-folder pattern for progress/gap tracking. No move required; see LEGACY_AND_ARCHIVE_PLAN.md for header-note updates.

---

## 3. Are All Decision Records in Decisions Folders?

| Document | Current Location | Correct Folder? | Notes |
|---|---|---|---|
| `ADR-001_PROJECT_FOUNDATION.md` | `docs/06_decisions/` | ✅ | |
| `docs/08_reports/RECOMMENDED_ADR_ROADMAP.md` | `docs/08_reports/` | ✅ | Planning artifact, not a decision record itself — correct in reports |
| No other ADRs exist yet | — | — | ADR-002..008 are recommended but not written |

**Verdict**: Decision records correctly placed. ✅

---

## 4. Are All Governance Docs in Governance Folders?

| Document | Current Location | Correct Folder? | Notes |
|---|---|---|---|
| `AI_OPERATING_CONTEXT.md` | `docs/07_governance/` | ✅ | |
| `DECISION_ESCALATION_MATRIX.md` | `docs/07_governance/` | ✅ | |

**Verdict**: Governance docs correctly placed. ✅

---

## 5. Are All Backend Docs in Backend Docs Folders?

| Document | Current Location | Correct Folder? | Notes |
|---|---|---|---|
| 8 backend authority docs | `docs/01_backend/` | ✅ | |
| `docs/architecture/system-architecture.md` | `docs/architecture/` | ⚠️ | Legacy — superseded by `BACKEND_ARCHITECTURE.md`; sits outside the numbered framework; not a competing authority (marked Retired) but creates confusion |
| `docs/architecture/ai-architecture.md` | `docs/architecture/` | ⚠️ | Supporting Reference — not yet superseded; no Phase E backend authority exists for AI; outside numbered framework |
| `docs/developer/README.md` | `docs/developer/` | ⚠️ | Operational artifact outside numbered framework; no direct numbered folder for operational guides |

**Verdict**: All active backend authority docs are in `docs/01_backend/`. The Phase A legacy and operational docs outside the numbered framework are correctly non-authoritative but create structural ambiguity. See REPOSITORY_RESTRUCTURING_PLAN.md.

---

## 6. Are All Legacy Docs Archived or Cross-Referenced?

Per the previous normalization pass (`DOCUMENT_RETIREMENT_PLAN.md`), 19 documents were identified for header-note updates. **These header notes have not yet been applied** — that was identified as a pending follow-up task.

| Status | Documents |
|---|---|
| Header notes needed but not yet applied | `docs/canon/*.md` (10), `docs/architecture/system-architecture.md` (1), `docs/product/product-overview.md` (1), `docs/tracking/progress.md`, `doc-tracker.md` (2), `doc-catalogue.md` (1), `infra/event-bus/README.md`, `infra/cache/README.md` (2), `prompts/README.md` (1) — **19 total** |

**Verdict**: Legacy docs are classified but cross-reference header notes are pending. This is the primary outstanding normalization task from the previous pass.

---

## 7. Do Any Docs Outside the docs/ Framework Compete with Active Authority Docs?

| External Doc | Location | Competes With | Status |
|---|---|---|---|
| Service `README.md` files (26) | `services/*/README.md` | `SERVICE_CATALOG.md` (entity/status facts) | No competition — serve a different purpose (local orientation) |
| `infra/*/README.md` files (4) | `infra/*/README.md` | `BACKEND_ARCHITECTURE.md` §6-7 | Minor overlap; READMEs are orientation only, not authoritative |
| `doc-catalogue.md` | Root | `DOCUMENT_INVENTORY.md` | ⚠️ Competing for "what docs exist" — `DOCUMENT_INVENTORY.md` is authoritative; `doc-catalogue.md` is obsolete. Moving to `docs/tracking/` + header note resolves this. |

**Verdict**: No competing authority docs exist outside the `docs/` framework — the only borderline case is `doc-catalogue.md`, which is already classified as Obsolete and targeted for relocation.

---

## 8. Are There Source Files in Documentation/Report Folders?

Checked `docs/00_authority/` through `docs/08_reports/`, `docs/canon/`, `docs/architecture/`, `docs/workflows/`, `docs/product/`, `docs/ui/`, `docs/developer/`, `docs/tracking/`:

| Finding | Details |
|---|---|
| All files in all `docs/` subdirectories are `.md` files | ✅ No source files found |
| No `.ts`, `.js`, `.json`, `.yaml` files in any `docs/` subfolder | ✅ Clean |

**Verdict**: No source files are misplaced in documentation folders. ✅

---

## 9. New Finding — `infra/common/` Has No Documentation

`infra/common/src/` contains the most critical shared source in the entire
repository:
- `base.repository.ts` — tenant-scoping base repository (the "shared base repository" pattern, CA-004)
- `tenant-context.ts` — tenant ID extraction from JWT
- `jwt-auth.guard.ts` — JWT authentication guard
- `permissions.guard.ts` — RBAC permissions guard
- `permissions.decorator.ts` — `@RequirePermissions()` decorator
- `current-user.decorator.ts` — `@CurrentUser()` decorator
- `http-exception.filter.ts` — global error filter
- `json-logger.service.ts` — structured JSON logger
- `request-logger.middleware.ts` — request logging middleware
- `api-response.ts` — standard response wrapper
- `jwt-payload.interface.ts` — JWT payload type

None of this is documented in a README within `infra/common/`. `BACKEND_ARCHITECTURE.md` references `@ems/common` but a developer browsing `infra/common/` has no orientation doc.

**Recommendation**: Add `infra/common/README.md` documenting the shared library's contents. This is a safe documentation-only addition — see REPOSITORY_RESTRUCTURING_PLAN.md.

---

## 10. New Finding — `postgres-init.sql` Still References `"order"` Schema (Not `ordering`)

`infra/docker/init/postgres-init.sql` line: `CREATE SCHEMA IF NOT EXISTS "order";`

The actual implemented schema name is `ordering` (DELTA-1 — SQL reserved word rename). The init SQL still uses the old name. This means:

- A fresh `docker-compose up` with this init SQL creates a schema named `order`, but TypeORM entities expect a schema named `ordering`.
- This is a **latent infrastructure conflict** that would cause a runtime failure on a fresh database setup.

**Classification**: Active infrastructure bug — not a documentation misplacement but a source/infra discrepancy. Falls under `REQUIRES_OWNER_APPROVAL` since fixing it touches `infra/docker/init/postgres-init.sql` (infrastructure file). Recommend adding to `ARCHITECTURAL_GAP_REGISTER.md` as a new gap.

---

## Documentation Placement Summary

| Check | Status | Action Required |
|---|---|---|
| Authority docs in correct folders | ✅ Pass | None |
| Reports in reports folders | ✅ Pass | None |
| Decision records in decisions folders | ✅ Pass | None |
| Governance docs in governance folders | ✅ Pass | None |
| Backend docs in backend folders | ✅ Pass (active docs) | Legacy docs: header notes pending |
| Legacy docs archived/cross-referenced | ⚠️ Pending | Apply 19 header notes from DOCUMENT_RETIREMENT_PLAN.md |
| No competing external docs | ✅ Pass (after doc-catalogue.md move) | Move doc-catalogue.md to docs/tracking/ |
| No source files in doc folders | ✅ Pass | None |
| `infra/common/` README missing | ⚠️ Gap | Add README — safe doc addition |
| `postgres-init.sql` schema name conflict | ❌ **Bug** | REQUIRES_OWNER_APPROVAL — see note above |
