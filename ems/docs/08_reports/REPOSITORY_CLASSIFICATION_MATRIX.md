Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Repository Classification Matrix

> Applies the 15 classifications from `FULL REPOSITORY NORMALIZATION AND
> REALITY AUDIT.md` to every meaningful folder in the repository.
> Feeds `REPOSITORY_RESTRUCTURING_PLAN.md` and `ROOT_LEVEL_CLEANUP_PLAN.md`.

## Classification Definitions

| Classification | Meaning |
|---|---|
| Active Source | Live application or library source code |
| Authority Documentation | Governance or backend authority documents |
| Supporting Documentation | Reference docs not yet superseded, or operational guides |
| Generated Report | Analysis/audit output (point-in-time) |
| Test Asset | Test specs, fixtures, test configs |
| Script / Tooling | Build scripts, tooling helpers |
| Configuration | Build/CI/lint/prettier/npm config files |
| Infrastructure | Docker, deployment env files, Kubernetes, IaC |
| Migration / Database | Database migration files, schema init SQL |
| Build Output | Compiled JS, tsbuildinfo, coverage — should not be committed |
| Temporary Artifact | Cache files, `.jest-cache` — should not be committed |
| Legacy | Superseded docs that have been retired but retained |
| Archive | Fully closed/resolved historical records |
| Unknown | Cannot determine purpose without further investigation |
| Misplaced | Correct content, wrong location |
| Duplicate Purpose | Folder whose purpose is already served by another folder |

---

## Root-Level Files

| Path | Classification | Correct Location? | Notes |
|---|---|---|---|
| `.dockerignore` | Configuration | ✅ Root | Required at repo root for Docker build context |
| `.gitignore` | Configuration | ✅ Root | Required at root |
| `.npmrc` | Configuration | ✅ Root | npm cache/registry redirects |
| `.prettierrc` | Configuration | ✅ Root | Prettier formatting config |
| `README.md` | Supporting Documentation | ✅ Root | Repo overview |
| `data-source.ts` | Active Source | ✅ Root | TypeORM CLI datasource; must be at root |
| `doc-catalogue.md` | **Misplaced** | ❌ Root | Documentation artifact (stale index of 57 docs); should be in `docs/tracking/` or `docs/08_reports/` — see ROOT_LEVEL_CLEANUP_PLAN.md |
| `eslint.config.mjs` | Configuration | ✅ Root | ESLint flat config |
| `nest-cli.json` | Configuration | ✅ Root | NestJS CLI monorepo project registry |
| `package-lock.json` | Configuration | ✅ Root | Lockfile |
| `package.json` | Configuration | ✅ Root | npm manifest + scripts |
| `tsconfig.json` | Configuration | ✅ Root | Root TS config with path aliases |

---

## Root-Level Folders

| Folder | Classification | Correct Location? | Notes |
|---|---|---|---|
| `.github/` | Configuration | ✅ Root | CI/CD config; standard GitHub location |
| `.jest-cache/` | **Temporary Artifact** | ⚠️ Root | Gitignored; 316 generated cache files — should not be committed; already excluded by `.gitignore` |
| `apps/` | Active Source | ✅ Root | NestJS application entry; standard NestJS monorepo layout |
| `design/` | Supporting Documentation | ✅ Root | Phase E design scaffolds; no content yet |
| `dist/` | **Build Output** | ⚠️ Root | Gitignored; only `tsconfig.tsbuildinfo` currently; not tracked |
| `docs/` | Authority Documentation | ✅ Root | Documentation framework; correct location |
| `infra/` | Active Source + Infrastructure | ✅ Root | Shared libraries + docker config; correct |
| `migrations/` | Migration / Database | ✅ Root | TypeORM migration home; correct but empty |
| `node_modules/` | Build Output | ✅ Root | npm packages; gitignored; excluded |
| `prompts/` | **Legacy** | ⚠️ Root | Phase A gap-fill prompts; all resolved; now obsolete — see LEGACY_AND_ARCHIVE_PLAN.md |
| `scripts/` | Script / Tooling | ✅ Root | Build and env scripts; correct |
| `services/` | Active Source | ✅ Root | NestJS service modules; correct |

---

## docs/ Subfolders

| Folder | Classification | Correct Location? | Notes |
|---|---|---|---|
| `docs/00_authority/` | Authority Documentation | ✅ | Phase 1 governance authority (5 docs) |
| `docs/01_backend/` | Authority Documentation | ✅ | Phase 2 backend authority (8 docs + README stub) |
| `docs/02_frontend/` | Working Draft | ✅ | Phase E placeholder; correct |
| `docs/03_fullstack_contracts/` | Authority Documentation | ✅ | Phase 2 contracts (5 docs + README stub) |
| `docs/04_testing/` | Working Draft | ✅ | Testing phase placeholder; correct |
| `docs/05_deployment/` | Working Draft | ✅ | Deployment phase placeholder; correct |
| `docs/06_decisions/` | Authority Documentation | ✅ | ADR-001; correct |
| `docs/07_governance/` | Authority Documentation | ✅ | Governance rules (2 docs); correct |
| `docs/08_reports/` | Generated Report | ✅ | All audit/analysis reports; correct |
| `docs/architecture/` | **Legacy** | ⚠️ | Phase A architecture docs; superseded; no equivalent numbered folder under new framework |
| `docs/canon/` | **Legacy** | ⚠️ | Phase A canonical design docs; superseded; no numbered equivalent |
| `docs/developer/` | Supporting Documentation | ⚠️ | Operational dev guide; not nested under numbered framework — minor structural gap |
| `docs/product/` | **Legacy** | ⚠️ | Phase A product overview; superseded; no numbered equivalent |
| `docs/tracking/` | Historical Record | ⚠️ | Build tracking history; not nested under numbered framework — but has no logical numbered home |
| `docs/ui/` | Supporting Documentation | ⚠️ | Design system guide; awaiting Phase E; no numbered equivalent |
| `docs/workflows/` | Supporting Documentation | ⚠️ | Detailed workflow docs; supporting `PRODUCT_WORKFLOWS.md` but not under numbered framework |

**Pattern finding**: The numbered `docs/00_*` through `docs/08_*` framework
was established in Phase 1, but the Phase A legacy folders (`docs/canon/`,
`docs/architecture/`, `docs/workflows/`, `docs/product/`, `docs/ui/`,
`docs/developer/`, `docs/tracking/`) were never migrated into the numbered
structure. They coexist at the same level, which creates visual clutter and
makes it unclear what is authoritative vs. legacy when browsing the `docs/`
folder.

---

## infra/ Subfolders

| Folder | Classification | Correct Location? | Notes |
|---|---|---|---|
| `infra/cache/` | Active Source | ✅ | Redis library (`@ems/cache`); correctly placed |
| `infra/common/` | Active Source | ✅ | Shared utilities (`@ems/common`); correctly placed but **no README** |
| `infra/deployment/` | Infrastructure | ✅ | Env templates and secrets convention |
| `infra/docker/` | Infrastructure | ✅ | Docker Compose configs + postgres-init.sql |
| `infra/event-bus/` | Active Source | ✅ | Kafka event bus library (`@ems/event-bus`); correctly placed |

---

## apps/ Subfolders

| Folder | Classification | Correct Location? | Notes |
|---|---|---|---|
| `apps/api/` | Active Source | ✅ | NestJS API entrypoint; correct NestJS monorepo location |
| `apps/api/src/config/` | Active Source | ✅ | Env validation; correct |
| `apps/api/src/health/` | Active Source | ✅ | Health endpoints; correct |
| `apps/web/` | Working Draft | ✅ | Phase E placeholder; correct |

---

## services/ Subfolders

All 27 service folders follow a consistent structure:
`services/<name>/README.md` + `services/<name>/src/` + `services/<name>/src/entities/` + (most) `services/<name>/src/dto/`

| Pattern | Classification | Correct? | Notes |
|---|---|---|---|
| `services/*/README.md` | Operational Artifact | ✅ | Per-service orientation; correct location |
| `services/*/src/*.module.ts` | Active Source | ✅ | NestJS module definition |
| `services/*/src/*.controller.ts` | Active Source | ✅ | HTTP controllers |
| `services/*/src/*.service.ts` | Active Source | ✅ | Business logic |
| `services/*/src/entities/` | Active Source | ✅ | TypeORM entities |
| `services/*/src/dto/` | Active Source | ✅ | Request/response DTOs |
| `services/*/src/*.spec.ts` (4 only) | Test Asset | ✅ | Unit test specs; only 4/26 services covered |
| `services/ui-renderer/` | Working Draft | ✅ | Phase E placeholder with spec.md |

---

## scripts/ Files

| File | Classification | Correct Location? | Notes |
|---|---|---|---|
| `register-paths.js` | Script / Tooling | ✅ | Runtime path resolver; correctly in scripts/ |
| `setup-env.ps1` | Script / Tooling | ✅ | Machine setup; correctly in scripts/ but undocumented |
| `verify-build.ps1` | Script / Tooling | ✅ | Build verification; correctly in scripts/ but undocumented |

---

## Misplaced Files Summary

| File | Current Location | Should Be In | Priority |
|---|---|---|---|
| `doc-catalogue.md` | Root | `docs/tracking/` or archived in `docs/08_reports/` | Medium — causes confusion when browsing root |

## Duplicate Purpose Summary

| Folders | Overlap | Notes |
|---|---|---|
| `docs/canon/` + `docs/architecture/` + `docs/product/` | All are "Phase A legacy docs" with no clear separation logic | Could be consolidated under a single `docs/legacy/` or `docs/archive/` folder — see REPOSITORY_RESTRUCTURING_PLAN.md |
| `docs/tracking/` | Partially overlaps with `docs/08_reports/` (both contain progress/gap registers) | Old tracking folder should route to reports; see LEGACY_AND_ARCHIVE_PLAN.md |

## Generated Artifacts Summary

| Path | Type | Gitignored? | Action |
|---|---|---|---|
| `.jest-cache/` | Temporary Artifact | ✅ Yes | No action needed; correctly excluded from git |
| `dist/tsconfig.tsbuildinfo` | Build Output | ✅ Yes | No action needed; correctly excluded from git |
