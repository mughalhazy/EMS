Status: Active
Authority Level: Medium
Last Reviewed: 2026-06-15
Owner: AI

# Documentation Coverage Matrix (Governance Phase 1)

Snapshot of documentation coverage as of 2026-06-15, after GOVERNANCE
IMPLEMENTATION PHASE 1 document creation.

## 1. Governance Tree (`docs/00_authority`, `06_decisions`, `07_governance`, `08_reports`)

| Document | Status | Authority | Created this phase | Core sections populated |
|---|---|---|---|---|
| `00_authority/PROJECT_CHARTER.md` | Active | Critical | Yes | Yes |
| `00_authority/FEATURE_SCOPE.md` | Active | Critical | Yes | Yes |
| `00_authority/DOMAIN_MODEL.md` | Active | Critical | Yes | Yes (summary; field detail deferred to canon) |
| `00_authority/PRODUCT_WORKFLOWS.md` | Active | High | Yes | Yes |
| `00_authority/FULLSTACK_STITCHING_CONTRACT.md` | Draft | High | Yes | Yes (8 representative rows; not exhaustive — see Open Items) |
| `07_governance/AI_OPERATING_CONTEXT.md` | Active | Critical | Yes | Yes (all required sections present) |
| `07_governance/DECISION_ESCALATION_MATRIX.md` | Active | Critical | Yes | Yes |
| `06_decisions/ADR-001_PROJECT_FOUNDATION.md` | Active | Critical | Yes | Yes |
| `08_reports/GOVERNANCE_IMPLEMENTATION_REPORT.md` | Active | High | Yes | Yes |
| `08_reports/DOCUMENTATION_COVERAGE_MATRIX.md` | Active | Medium | Yes | Yes (this document) |
| `08_reports/ARCHITECTURAL_GAP_REGISTER.md` | Active | High | Yes | Yes |
| `08_reports/RECOMMENDED_ADR_ROADMAP.md` | Active | Medium | Yes | Yes |

## 2. Stub Directories (`01_backend` .. `05_deployment`)

Phase 1 did not specify named documents for these directories beyond the
required structure. Each received a `README.md` (Status: Draft) pointing to
the relevant existing canon documentation, so the directory structure exists
and is navigable without being empty placeholders.

| Directory | README created | Points to |
|---|---|---|
| `01_backend/` | Yes | `docs/canon/service-map.md`, `docs/canon/domain-model.md`, `docs/canon/api-standards.md`, `00_authority/FEATURE_SCOPE.md` |
| `02_frontend/` | Yes | `docs/ui/design-system.md`, `docs/canon/ui-surface-map.md`, `apps/web/README.md` (Phase E not started) |
| `03_fullstack_contracts/` | Yes | `00_authority/FULLSTACK_STITCHING_CONTRACT.md` (canonical location) |
| `04_testing/` | Yes | `08_reports/ARCHITECTURAL_GAP_REGISTER.md` GAP-G4, `.github/workflows/ci.yml` |
| `05_deployment/` | Yes | `docs/canon/data-architecture.md`, `infra/docker/*`, `infra/deployment/*` |

## 3. Pre-Existing Documentation (`docs/canon`, `docs/architecture`, `docs/product`, `docs/tracking`, `docs/ui`, service READMEs)

| Area | Coverage | Notes |
|---|---|---|
| `docs/product/product-overview.md` | Full | Read in full this phase; source for PROJECT_CHARTER |
| `docs/canon/service-map.md` | Full | Read in full; all 26 services + 2 infra modules |
| `docs/canon/capability-matrix.md` | Full | Read in full |
| `docs/canon/domain-model.md` | Full | Read in full (374 lines); GAP-G3 deviation found |
| `docs/canon/workflow-catalog.md` | Full | Read in full (126 lines); GAP-G3 affects Workflow 10 |
| `docs/canon/api-standards.md` | Full | Read in full (129 lines) |
| `docs/canon/event-catalog.md` | Partial | Referenced; `user.sso_login_succeeded` row added in earlier session (GAP-6) |
| `docs/canon/security-model.md` | Partial | Lines 1-119 read across sessions; full coverage TBD |
| `docs/canon/ui-surface-map.md` | Partial | Lines 1-60 read; remainder TBD – REQUIRES VERIFICATION |
| `docs/canon/data-architecture.md` | Full | Read in full (86 lines) |
| `docs/architecture/system-architecture.md` | Full | Read in full (134 lines) |
| `docs/architecture/ai-architecture.md` | Not read this phase | GAP-G7 — referenced only |
| `docs/ui/design-system.md` | Not read this phase | Referenced via GAP-4 in `docs/tracking/gap-register.md` |
| `docs/tracking/progress.md` | Full | Read in full; found stale (GAP-G1) |
| `docs/tracking/gap-register.md` | Full | Read in full; authoritative for implementation gap status |
| `services/*/README.md` (26) | Status lines verified | All updated to `Implemented`/`SCAFFOLD` as of 2026-06-14 (GAP-1/GAP-7) |
| `infra/event-bus/README.md`, `infra/cache/README.md` | Status verified | Updated 2026-06-14 (GAP-1) |
| `BUILD_BLUEPRINT.md` (workspace root) | Not read this phase | Referenced as authority doc in `AI_OPERATING_CONTEXT.md`; content TBD – REQUIRES VERIFICATION for this phase |

## 4. Coverage Gaps Summary

See `08_reports/ARCHITECTURAL_GAP_REGISTER.md` for the full list (GAP-G1..G8).
Highest-priority gaps: GAP-G4 (test coverage), GAP-G3 (Campaign ownership),
GAP-G1 (stale progress.md).
