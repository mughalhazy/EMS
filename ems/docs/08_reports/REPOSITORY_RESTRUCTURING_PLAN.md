Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Repository Restructuring Plan

> Proposes a clean, practical repository structure based on the full audit.
> Separates safe-to-execute moves (documentation/archive only) from moves
> requiring owner approval (affect code, imports, build paths, CI/CD,
> or runtime).

---

## Current Structure vs. Target Structure

### Root Level — No Change Required

The root is clean after one documentation move (`doc-catalogue.md`).
All 11 config/build files are correctly placed. No root-level restructuring
is needed beyond what `ROOT_LEVEL_CLEANUP_PLAN.md` specifies.

---

### docs/ — The Primary Restructuring Need

**Current state:**
```
docs/
  00_authority/        ← Phase 1 governance (active, authoritative)
  01_backend/          ← Phase 2 backend authority (active, authoritative)
  02_frontend/         ← placeholder
  03_fullstack_contracts/ ← Phase 2 contracts (active, authoritative)
  04_testing/          ← placeholder
  05_deployment/       ← placeholder
  06_decisions/        ← ADR-001 (active, authoritative)
  07_governance/       ← operating rules (active, authoritative)
  08_reports/          ← all reports (active)
  architecture/        ← Phase A legacy (2 docs, mixed: 1 Retired, 1 Supporting)
  canon/               ← Phase A legacy (10 docs, all Retired/Partial)
  developer/           ← operational guide (1 doc, active)
  product/             ← Phase A legacy (1 doc, Retired)
  tracking/            ← historical records (5 docs, mixed)
  ui/                  ← Phase E placeholder (1 doc, Supporting)
  workflows/           ← supporting references (4 docs, active)
```

**Problem**: The unnumbered legacy folders (`architecture/`, `canon/`,
`developer/`, `product/`, `tracking/`, `ui/`, `workflows/`) coexist at the
same level as the numbered authority folders (`00_authority/` through
`08_reports/`). A reader browsing `docs/` cannot immediately distinguish
"this is where the authoritative documentation lives" from "this is legacy
material." The mix creates confusion about where truth lives.

**Target state (proposed):**
```
docs/
  00_authority/        ← unchanged
  01_backend/          ← unchanged
  02_frontend/         ← unchanged
  03_fullstack_contracts/ ← unchanged
  04_testing/          ← unchanged
  05_deployment/       ← unchanged
  06_decisions/        ← unchanged
  07_governance/       ← unchanged
  08_reports/          ← unchanged (all reports including this audit's outputs)
  legacy/              ← renamed from canon/ + absorbs architecture/ and product/
  tracking/            ← unchanged (delta-log and research-analysis are active)
  workflows/           ← unchanged (4 supporting workflow docs still active)
  developer/           ← unchanged (operational guide, no numbered home)
  ui/                  ← unchanged (Phase E placeholder, no numbered home)
```

**What changes**:
1. `docs/canon/` renamed to `docs/legacy/`
2. `docs/architecture/` contents moved into `docs/legacy/`
3. `docs/product/` contents moved into `docs/legacy/`

**What stays the same**: Everything else.

---

## Safe-to-Execute Restructuring Actions

These actions are documentation/archive file moves only. They do not affect
any source code, build paths, imports, CI/CD, or runtime behavior.

### Action S-1: Move `doc-catalogue.md` → `docs/tracking/doc-catalogue.md`

- **From**: `doc-catalogue.md` (root)
- **To**: `docs/tracking/doc-catalogue.md`
- **Why**: Documentation artifact at root; no source file references it
- **Risk**: None — no imports, no script references
- **Post-move addition**: Add to the top of the file: `> **Status: Obsolete.** This index covers 57 files as of 2026-06-13 and does not include the 46 governance/backend-authority/contracts/report documents created since. See \`docs/08_reports/DOCUMENT_INVENTORY.md\` for the current authoritative inventory.`

### Action S-2: Add `infra/common/README.md`

- **Action**: Create a new README.md in `infra/common/`
- **Why**: Most critical shared library in the repo (tenant isolation, auth guards, permissions, logger) has no orientation doc
- **Content**: List the 11 source files with a one-line description of each
- **Risk**: None — documentation addition only

### Action S-3: Add missing scripts to `docs/developer/README.md`

- **Action**: Add a "Scripts" section to `docs/developer/README.md` documenting `setup-env.ps1` (one-time machine setup) and `verify-build.ps1` (build verification), cross-referencing `scripts/register-paths.js` already documented in `delta-log.md`
- **Why**: 2 of 3 scripts are undocumented; developer onboarding gap
- **Risk**: None — documentation addition only

### Action S-4: Apply 19 pending header notes from `DOCUMENT_RETIREMENT_PLAN.md`

- **Action**: Add the retirement/status header notes to each of the 19 documents listed in the previous normalization pass (priority order in `LEGACY_AND_ARCHIVE_PLAN.md`)
- **Why**: These notes were recommended but never applied
- **Risk**: None — documentation additions only, no content removed

### Action S-5: Add GAP-G10 to `ARCHITECTURAL_GAP_REGISTER.md`

- **Action**: Add a new gap entry for the role model conflict (9-role canon vs. 8-role implemented) discovered in CONFLICT_ANALYSIS_REPORT.md C-2
- **Why**: The conflict is documented in reports but not formally tracked in the gap register
- **Risk**: None — documentation addition only

### Action S-6: Add GAP-G11 to `ARCHITECTURAL_GAP_REGISTER.md`

- **Action**: Add a new gap entry for the `postgres-init.sql` schema name conflict (`"order"` vs. `"ordering"`) discovered in CODEBASE_PLACEMENT_AUDIT.md §7
- **Why**: This is a latent infrastructure bug — schema creation SQL creates the wrong schema name
- **Risk**: None for the register entry itself; the fix to `postgres-init.sql` is under REQUIRES_OWNER_APPROVAL

### Action S-7: Add DELTA-7 to `docs/tracking/delta-log.md`

- **Action**: Add a DELTA-7 entry for the pagination model divergence (cursor-based in `api-standards.md` vs. page-based in implementation) discovered in CONFLICT_ANALYSIS_REPORT.md C-3
- **Why**: This was recommended in the normalization pass but never actioned
- **Risk**: None — documentation addition only

---

## REQUIRES_OWNER_APPROVAL

These restructuring actions are **not safe to execute without owner approval**
because they could affect source code references, build paths, CI/CD, or
require coordinated multi-file updates.

### A-1: Rename `docs/canon/` → `docs/legacy/`

- **Impact**: All 10 canon files move to a new path; all internal cross-links in canon docs (`../canon/...`), in authority docs that reference canon files, and in report docs (DOCUMENT_INVENTORY.md, DOCUMENT_CLASSIFICATION_MATRIX.md, AUTHORITY_MAPPING_MATRIX.md, etc.) would need path updates
- **Benefit**: Makes the non-authoritative nature of this folder self-evident to any developer browsing the repo
- **Estimated effort**: Medium — path updates in ~30+ documents; mechanical but requires care
- **Owner decision**: Yes/No; if Yes, approve path-update scope

### A-2: Move `docs/architecture/` contents → `docs/legacy/`

- **Depends on**: A-1 (rename `docs/canon/` to `docs/legacy/` first)
- **Impact**: `docs/architecture/system-architecture.md` and `docs/architecture/ai-architecture.md` move paths; cross-links in authority docs referencing these files need updates
- **Benefit**: Consolidates all Phase A legacy material under one folder; removes `docs/architecture/` as a confusing parallel to the numbered authority structure
- **Owner decision**: Conditional on A-1

### A-3: Move `docs/product/product-overview.md` → `docs/legacy/`

- **Depends on**: A-1
- **Impact**: One file moves; minimal cross-links
- **Benefit**: Consolidates legacy material
- **Owner decision**: Conditional on A-1

### A-4: Fix `infra/docker/init/postgres-init.sql` — `"order"` → `"ordering"`

- **Impact**: Infrastructure file change; affects Docker Compose fresh-start behavior; if any existing database was created with the `"order"` schema name (unlikely but possible), it would need to be dropped and recreated or manually renamed
- **Risk**: Breaking change on fresh database setups; no risk to existing databases if they were created with `synchronize: true` earlier in development (which would have used the entity's actual schema name)
- **Recommended fix**: Change line 16: `CREATE SCHEMA IF NOT EXISTS "order";` → `CREATE SCHEMA IF NOT EXISTS "ordering";`
- **Owner decision**: Approve fix; confirm whether any existing dev databases need schema rename

### A-5: Fix `package.json` `test:e2e` script — missing `test/jest-e2e.json`

- **Impact**: Either create `test/jest-e2e.json` (requires configuring E2E test framework) or remove the `test:e2e` script from `package.json`
- **Risk**: Removing the script removes a CI capability stub; creating the config starts the E2E testing infrastructure
- **Owner decision**: Keep and implement E2E, or remove the dead script

---

## Summary — Actions by Type

### Safe to Execute Now (documentation only, no approval needed)

| # | Action | Files Affected |
|---|---|---|
| S-1 | Move `doc-catalogue.md` to `docs/tracking/` + header note | 1 |
| S-2 | Create `infra/common/README.md` | 1 new |
| S-3 | Add scripts section to `docs/developer/README.md` | 1 |
| S-4 | Apply 19 pending header notes | 19 |
| S-5 | Add GAP-G10 to `ARCHITECTURAL_GAP_REGISTER.md` | 1 |
| S-6 | Add GAP-G11 to `ARCHITECTURAL_GAP_REGISTER.md` | 1 |
| S-7 | Add DELTA-7 to `docs/tracking/delta-log.md` | 1 |
| **Total** | | **25 file operations** |

### Requires Owner Approval Before Execution

| # | Action | Risk Level |
|---|---|---|
| A-1 | Rename `docs/canon/` → `docs/legacy/` | Low (doc-only, but ~30 cross-link updates) |
| A-2 | Move `docs/architecture/` → `docs/legacy/` | Low (depends on A-1) |
| A-3 | Move `docs/product/` → `docs/legacy/` | Low (depends on A-1) |
| A-4 | Fix `postgres-init.sql` schema name `"order"` → `"ordering"` | Medium (infra change, latent bug fix) |
| A-5 | Resolve `test:e2e` dead script in `package.json` | Low–Medium (choice: implement or remove) |

---

## Repository Health After Safe Actions Are Applied

If S-1 through S-7 are executed:
- Root is clean (11 config/build files only; no doc artifacts)
- `infra/common/` is documented
- `docs/developer/README.md` covers all 3 scripts
- 19 legacy docs have retirement markers (readers know not to trust them as current state)
- 3 new findings (GAP-G10, GAP-G11, DELTA-7) are formally tracked
- `docs/tracking/doc-catalogue.md` is in the correct location with a retirement note

If A-1 through A-3 are also approved:
- `docs/` presents a clean numbered authority framework (`00_*`–`08_*`) with a clearly-named `legacy/` folder alongside — no ambiguity about what is authoritative
- All Phase A material is consolidated under `docs/legacy/` (15 files) instead of spread across `docs/canon/`, `docs/architecture/`, `docs/product/`

**Recommendation**: Execute S-1 through S-7 now (safe, no approval needed). Present A-1 through A-5 to the owner as a decision batch before next phase begins.
