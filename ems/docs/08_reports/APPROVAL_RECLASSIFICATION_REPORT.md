Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Approval Reclassification Report

> Reviews all open REQUIRES_OWNER_APPROVAL items from the Full Repository
> Normalization and Reality Audit (documented in
> `REPOSITORY_RESTRUCTURING_PLAN.md`) and reclassifies each under the
> three-tier governance model introduced by `REVISED_DECISION_ESCALATION_MATRIX.md`.
>
> Executed per `GOVERNANCE REFINEMENT – SAFE REPOSITORY HYGIENE.md`.

---

## Items Reviewed

The following items were classified as REQUIRES_OWNER_APPROVAL during the
Full Repository Normalization and Reality Audit (2026-06-17). Each is
re-evaluated below against the `SAFE_REPOSITORY_HYGIENE_POLICY.md`
criteria.

---

## A-1: Rename `docs/canon/` → `docs/legacy/`

**Original classification**: REQUIRES_OWNER_APPROVAL  
**New classification**: **SAFE_REPOSITORY_HYGIENE**

**Analysis:**

| Criterion | Assessment |
|---|---|
| Modifies business logic? | No |
| Modifies APIs? | No |
| Modifies database structures? | No |
| Modifies runtime behavior? | No |
| Modifies infrastructure? | No |
| Modifies deployment? | No |
| Modifies security boundaries? | No |
| Modifies application functionality? | No |
| Affects source code imports? | No — `docs/canon/` contains only `.md` files; no TypeScript `import` or `require` references these paths |

**Why it was originally REQUIRES_APPROVAL**: The ~30 cross-link updates across
documentation files were flagged as requiring care. The volume of changes was
treated as a risk indicator.

**Why it is now SAFE_REPOSITORY_HYGIENE**: Volume is not the same as risk.
All 30 affected files are `.md` documentation files. No source code, build
configuration, CI/CD pipeline, or runtime behavior is affected. The
cross-link updates are mechanical and fully reversible by renaming back.
This is folder-level archive maintenance, which is explicitly listed as
SAFE_REPOSITORY_HYGIENE in the policy.

**Pre-execution requirement**: Before executing, update all internal
cross-references from `docs/canon/` to `docs/legacy/` in the same session.
Document all files modified in the session report.

---

## A-2: Move `docs/architecture/` contents → `docs/legacy/`

**Original classification**: REQUIRES_OWNER_APPROVAL  
**New classification**: **SAFE_REPOSITORY_HYGIENE**

**Depends on**: A-1 (must execute after `docs/legacy/` exists)

**Analysis:**

| Criterion | Assessment |
|---|---|
| Modifies business logic, APIs, DB, runtime, infra, deployment, security? | No to all |
| Affects source code imports? | No — `docs/architecture/system-architecture.md` and `docs/architecture/ai-architecture.md` are `.md` files only |
| Content changes? | No — files move, content unchanged |
| Cross-link updates required? | Yes — references to `docs/architecture/system-architecture.md` in authority docs need updating (~5–8 files) |

**Why it is SAFE_REPOSITORY_HYGIENE**: Same reasoning as A-1. Both files
are documentation artifacts with retirement headers already applied. Moving
them to `docs/legacy/` alongside the canon docs is archive consolidation,
explicitly listed as SAFE_REPOSITORY_HYGIENE.

---

## A-3: Move `docs/product/product-overview.md` → `docs/legacy/`

**Original classification**: REQUIRES_OWNER_APPROVAL  
**New classification**: **SAFE_REPOSITORY_HYGIENE**

**Depends on**: A-1

**Analysis:**

| Criterion | Assessment |
|---|---|
| Modifies business logic, APIs, DB, runtime, infra, deployment, security? | No to all |
| Affects source code imports? | No — `.md` file only |
| Cross-link updates required? | Minimal — 1–2 references in report documents |

**Why it is SAFE_REPOSITORY_HYGIENE**: Single-file documentation move to an
archive folder. The file already has a retirement header note applied. This
is the lowest-complexity action in the set — one file, minimal cross-links.

---

## A-4: Fix `infra/docker/init/postgres-init.sql` — `"order"` → `"ordering"`

**Original classification**: REQUIRES_OWNER_APPROVAL  
**New classification**: **REQUIRES_APPROVAL** *(classification unchanged)*

**Analysis:**

| Criterion | Assessment |
|---|---|
| Modifies business logic? | No |
| Modifies APIs? | No |
| Modifies database structures? | **Yes** — changes the schema name created on fresh database initialization |
| Modifies runtime behavior? | **Yes** — affects what schemas exist after `docker-compose up` |
| Modifies infrastructure? | **Yes** — `infra/docker/*` is explicitly listed as REQUIRES_APPROVAL in `REVISED_DECISION_ESCALATION_MATRIX.md` |
| Modifies deployment behavior? | No |
| Modifies security boundaries? | No |
| Is the fix a bug fix? | Yes (GAP-G11) — but that does not lower the approval tier |

**Why it remains REQUIRES_APPROVAL**: `infra/docker/init/postgres-init.sql`
is an infrastructure file under `infra/docker/*`, which is explicitly listed
in the REQUIRES_APPROVAL tier. The fix also modifies database initialization
behavior — what schema is created when `docker-compose up` runs on a fresh
environment. Even though the fix is correct and critical, infrastructure and
database changes require owner confirmation regardless of whether they are bug
fixes.

**Recommended owner action**: Approve the one-line fix:
> Line 16: `CREATE SCHEMA IF NOT EXISTS "order";`  
> → `CREATE SCHEMA IF NOT EXISTS "ordering";`

This is tracked as GAP-G11 in `docs/08_reports/ARCHITECTURAL_GAP_REGISTER.md`.

---

## A-5: Resolve dead `test:e2e` script in `package.json`

**Original classification**: REQUIRES_OWNER_APPROVAL  
**New classification**: Split by option:

| Option | New Classification |
|---|---|
| Option A: Remove the dead `test:e2e` script entry from `package.json` | **SAFE_REPOSITORY_HYGIENE** |
| Option B: Create `test/jest-e2e.json` and implement the E2E framework | **REQUIRES_APPROVAL** |

**Analysis for Option A (remove dead script):**

| Criterion | Assessment |
|---|---|
| Modifies business logic, APIs, DB, runtime, infra, deployment, security? | No to all |
| Modifies `package.json` dependencies or devDependencies? | No — removing a `scripts` entry is not a dependency change |
| Changes runtime behavior? | No — the script is already broken; removing the entry does not change what the running API does |
| Improves repository maintainability? | Yes — removes a dead reference that creates false expectations |

The DECISION_ESCALATION_MATRIX.md REQUIRES_APPROVAL clause for `package.json`
specifies "dependency or devDependency" changes. Removing a `scripts` block
entry is not a dependency change. Removing a dead script that references a
non-existent config file is repository hygiene — it removes a broken developer
path without affecting any runtime or build behavior.

**Analysis for Option B (implement E2E framework):**

Creating `test/jest-e2e.json` starts the E2E testing infrastructure. This is
a phase of work (Testing Authority Capture / E2E setup) that requires owner
scoping, not repository hygiene. Remains REQUIRES_APPROVAL.

**Recommended owner action for Option A**: Confirm preference. If the owner
wants to defer E2E to a future phase, Option A (remove dead script) can be
executed immediately as SAFE_REPOSITORY_HYGIENE.

---

## Summary Table

| Item | Description | Original | New Classification | Rationale |
|---|---|---|---|---|
| A-1 | Rename `docs/canon/` → `docs/legacy/` | REQUIRES_APPROVAL | **SAFE_REPOSITORY_HYGIENE** | Pure `.md` folder rename; no source, build, or runtime impact |
| A-2 | Move `docs/architecture/` → `docs/legacy/` | REQUIRES_APPROVAL | **SAFE_REPOSITORY_HYGIENE** | Pure `.md` file moves; depends on A-1 |
| A-3 | Move `docs/product/` → `docs/legacy/` | REQUIRES_APPROVAL | **SAFE_REPOSITORY_HYGIENE** | Pure `.md` file move; depends on A-1 |
| A-4 | Fix `postgres-init.sql` schema name | REQUIRES_APPROVAL | **REQUIRES_APPROVAL** | Infrastructure + database init change; remains REQUIRES_APPROVAL |
| A-5 (Option A) | Remove dead `test:e2e` script entry | REQUIRES_APPROVAL | **SAFE_REPOSITORY_HYGIENE** | Removing a broken script entry is not a dependency change |
| A-5 (Option B) | Implement full E2E framework | REQUIRES_APPROVAL | **REQUIRES_APPROVAL** | Starts a new testing infrastructure phase |

---

## Effect of Reclassification

Before reclassification: **5 items blocked on owner approval**  
After reclassification: **1 item remains blocked** (A-4); 3 items (A-1, A-2, A-3) and 1 option (A-5A) are SAFE_REPOSITORY_HYGIENE

**✅ Executed 2026-06-17** (Pre-Frontend Delta Audit):
- A-1: `docs/canon/` files consolidated to `docs/legacy/`; MOVED.md placed; ~6 active authority docs cross-references updated
- A-2: `docs/architecture/` files consolidated to `docs/legacy/`; MOVED.md placed
- A-3: `docs/product/product-overview.md` consolidated to `docs/legacy/`; MOVED.md placed
- A-5A: `test:e2e` script removed from `package.json`

**Items that still require owner approval:**
- A-4: Fix `postgres-init.sql` schema name (`"order"` → `"ordering"`) — CRITICAL bug
- A-5B: Implement full E2E framework — REQUIRES_APPROVAL

---

## Execution Note

Per `GOVERNANCE REFINEMENT – SAFE REPOSITORY HYGIENE.md`, reclassified items
are **not executed in this session**. The reclassification establishes that
these actions may proceed in a subsequent session under SAFE_REPOSITORY_HYGIENE
authorization without additional owner confirmation. The owner should review
this report and confirm whether to proceed with A-1 through A-3 and A-5A,
and separately confirm A-4 (the postgres-init.sql fix).
