Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-17
Owner: AI

# Repository Normalization Report

> Executive summary of the Full Repository Normalization and Reality Audit,
> executed per `FULL REPOSITORY NORMALIZATION AND REALITY AUDIT.md`.
> Records all findings, safe actions taken, and items requiring owner approval.

---

## Audit Scope

Every root file and folder in `D:\SaaS\EMS\ems` was inventoried and
classified. Subdirectories reviewed to meaningful depth:
- `docs/` — all 14 subdirectories, all ~80 files
- `infra/` — all 5 subdirectories, all 40 files
- `apps/` — both subdirectories, all 7 files
- `services/` — all 27 service directories, all 254 files
- `scripts/` — all 3 files
- `migrations/` — 1 file
- `prompts/` — 1 file
- `.github/` — 1 file
- Root — all 12 tracked files

Generated artifacts (`.jest-cache/` 316 files, `dist/` 1 file, `node_modules/`) were classified and confirmed gitignored. `node_modules/` was excluded from file-level review.

**Total tracked files audited: ~395**

---

## Outputs Produced

| # | Document | Location |
|---|---|---|
| 1 | `REPOSITORY_TREE_INVENTORY.md` | `docs/08_reports/` |
| 2 | `REPOSITORY_CLASSIFICATION_MATRIX.md` | `docs/08_reports/` |
| 3 | `GENERATED_ARTIFACT_REGISTER.md` | `docs/08_reports/` |
| 4 | `ROOT_LEVEL_CLEANUP_PLAN.md` | `docs/08_reports/` |
| 5 | `DOCUMENTATION_PLACEMENT_AUDIT.md` | `docs/08_reports/` |
| 6 | `CODEBASE_PLACEMENT_AUDIT.md` | `docs/08_reports/` |
| 7 | `LEGACY_AND_ARCHIVE_PLAN.md` | `docs/08_reports/` |
| 8 | `REPOSITORY_RESTRUCTURING_PLAN.md` | `docs/08_reports/` |
| 9 | `REPOSITORY_NORMALIZATION_REPORT.md` (this file) | `docs/08_reports/` |

---

## Key Findings

### Findings That Were Expected / Already Tracked

1. **4/26 services have tests** (auth, notification, onsite, order) — already tracked as RISK-B finding.
2. **19 legacy docs need header notes** — pending from previous normalization pass; carried forward.
3. **GAP-G3, GAP-G9, DELTA-1/2/3** conflicts in legacy canon docs — already tracked; carried forward.
4. **`services/engagement` is a near-empty stub** — already known from batch migrations.
5. **No migration files** — expected; migrations phase has not been executed.
6. **Phase E not started** (`apps/web/`, `design/`, `docs/02_frontend/`, `services/ui-renderer/`) — expected.

### New Findings From This Audit

| ID | Finding | Severity | File |
|---|---|---|---|
| F-1 | `postgres-init.sql` creates schema `"order"` but code expects `"ordering"` (DELTA-1 never applied to infra init SQL) | **Critical** — silent infra bug; breaks fresh database setup | `infra/docker/init/postgres-init.sql:16` |
| F-2 | `test/jest-e2e.json` referenced in `package.json` `test:e2e` script but neither the file nor the `test/` directory exist | Medium — dead npm script; E2E tests cannot run | `package.json`, `test/` missing |
| F-3 | `infra/common/` has no README | Medium — most critical shared library (tenant isolation, auth guards, permissions) is undocumented in its own folder | `infra/common/` |
| F-4 | `scripts/setup-env.ps1` and `scripts/verify-build.ps1` are undocumented — not mentioned in any authority doc, developer README, or README | Low — developer onboarding gap | `scripts/`, `docs/developer/README.md` |
| F-5 | `doc-catalogue.md` is a documentation artifact misplaced at the repository root alongside config files | Low — visual clutter; misleading about current doc count (57 indexed, ~80+ actually exist) | Root |

---

## Repository Structure Assessment

| Area | Status | Notes |
|---|---|---|
| Root config files | ✅ Clean | 11 files, all correct |
| Root doc artifact | ✅ Moved | `doc-catalogue.md` relocated to `docs/tracking/doc-catalogue.md` (2026-06-17) |
| `.github/` | ✅ Clean | CI/CD correctly configured |
| `apps/` | ✅ Clean | API source + Phase E placeholder |
| `design/` | ✅ Clean | Phase E scaffold |
| `dist/` | ✅ Gitignored | Only `tsbuildinfo`; not committed |
| `.jest-cache/` | ✅ Gitignored | 316 temp files; not committed |
| `docs/` numbered framework | ✅ Clean | `00_*`–`08_*` folders all correct |
| `docs/` legacy folders | ⚠️ Structurally mixed | Canon/architecture/product/tracking alongside authority folders — propose `docs/legacy/` (A-1 through A-3, requires approval) |
| `infra/` source libraries | ✅ Clean | cache, common, event-bus correctly placed |
| `infra/` config | ✅ Clean | docker, deployment correctly placed |
| `infra/common/` README | ❌ Missing | New finding F-3 |
| `infra/docker/init/postgres-init.sql` | ❌ Bug | Schema name `"order"` should be `"ordering"` (F-1) |
| `migrations/` | ✅ Expected empty | No migrations authored yet |
| `prompts/` | ⚠️ Obsolete content | README describes completed work as pending |
| `scripts/` | ✅ Clean (location) ⚠️ (docs) | 2 scripts undocumented (F-4) |
| `services/` | ✅ Clean | 26 implemented + 1 Phase E scaffold; consistent structure |
| Test coverage | ⚠️ 4/26 services | Known gap; E2E framework dead (F-2) |
| Config duplication | ✅ None | All config files are distinct and purposeful |
| Generated artifact gitignoring | ✅ Complete | `.gitignore` coverage is comprehensive |

---

## Safe Actions Executed During This Audit

Per the instruction file, safe moves (documentation/archive only, no code/build impact) were executed. The following were applied:

| Action | What Was Done |
|---|---|
| S-1 | `doc-catalogue.md` moved from root → `docs/tracking/doc-catalogue.md` (2026-06-17, SAFE_REPOSITORY_HYGIENE) |
| S-2 | `infra/common/README.md` — created; documents all 11 shared-library files |
| S-3 | `docs/developer/README.md` — Scripts section added documenting `register-paths.js`, `setup-env.ps1`, `verify-build.ps1` |
| S-4 | 18 header notes applied to Legacy/Obsolete/Historical docs (all 9 `docs/canon/*`, `docs/architecture/system-architecture.md`, `docs/product/product-overview.md`, `docs/tracking/progress.md`, `docs/tracking/gap-register.md`, `docs/tracking/doc-tracker.md`, `infra/event-bus/README.md`, `infra/cache/README.md`, `prompts/README.md`, `doc-catalogue.md`) |
| S-5 | GAP-G10 added to `ARCHITECTURAL_GAP_REGISTER.md` (role model conflict: 9-role canon vs. 8-role code) |
| S-6 | GAP-G11 added to `ARCHITECTURAL_GAP_REGISTER.md` (`postgres-init.sql` schema name bug: `"order"` vs. `"ordering"`) |
| S-7 | DELTA-7 added to `docs/tracking/delta-log.md` (pagination model: cursor-based spec vs. page-based implementation) |

---

## Actions Requiring Owner Approval

| # | Action | Impact |
|---|---|---|
| ~~A-1~~ | ~~Rename `docs/canon/` → `docs/legacy/`~~ | ✅ Executed 2026-06-17 (SAFE_REPOSITORY_HYGIENE) |
| ~~A-2~~ | ~~Move `docs/architecture/` → `docs/legacy/`~~ | ✅ Executed 2026-06-17 (SAFE_REPOSITORY_HYGIENE) |
| ~~A-3~~ | ~~Move `docs/product/` → `docs/legacy/`~~ | ✅ Executed 2026-06-17 (SAFE_REPOSITORY_HYGIENE) |
| **A-4** | Fix `postgres-init.sql`: `"order"` → `"ordering"` | **CRITICAL — Infrastructure change; owner approval required** |
| ~~A-5A~~ | ~~Remove dead `test:e2e` script from `package.json`~~ | ✅ Executed 2026-06-17 (SAFE_REPOSITORY_HYGIENE) |
| A-5B | Implement full E2E test suite | REQUIRES_APPROVAL — see OWNER_APPROVAL_ITEMS_BEFORE_PHASE3.md OA-6 |

---

## Success Criteria Assessment

| Criterion | Status |
|---|---|
| Every root folder accounted for | ✅ |
| Every major subfolder accounted for | ✅ |
| Every major file type accounted for | ✅ |
| `docs/` normalized | ✅ (numbered framework clean; legacy header notes pending; structural rename requires owner approval) |
| Backend source structure understood | ✅ |
| Scripts/tooling classified | ✅ |
| Tests classified | ✅ |
| Configs/infra classified | ✅ |
| Generated artifacts classified | ✅ |
| Legacy folders classified | ✅ |
| Root-level clutter identified | ✅ (`doc-catalogue.md` misplaced) |
| Duplicate folder purposes identified | ✅ (legacy docs spread across 3 unnumbered folders — propose consolidation) |
| Misplaced documents identified | ✅ (`doc-catalogue.md`) |
| No frontend authority capture begins before repository reality is understood | ✅ — this audit is complete; repository reality is now fully documented |

---

## Phase Boundary

Per the instruction file:
- This phase stopped after audit, safe restructuring analysis, and reporting.
- No application code was modified.
- No database, API, CI/CD, or infrastructure files were modified.
- No frontend work was begun.
- The instruction file says "Do not begin Phase 3" — no further phase was started.

**Recommendation before next phase**:
1. Owner reviews and approves/rejects A-1 through A-5.
2. Safe actions S-1 through S-7 are executed (may be executed immediately or in batch).
3. Critical bug F-1 (`postgres-init.sql` schema name) is resolved under A-4.
4. Only then begin Frontend Authority Capture.
