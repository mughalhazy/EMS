Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Root-Level Cleanup Plan

> Identifies every root-level file and folder, determines its correct
> location, and recommends a disposition. Per the instruction file, any
> move that affects application code, imports, build paths, tests,
> deployment, CI/CD, or runtime behavior is listed under REQUIRES_OWNER_APPROVAL
> and not executed.

---

## Root Files — Status Assessment

| File | Status | Action |
|---|---|---|
| `.dockerignore` | ✅ Correct location | Keep at root — Docker requires it here |
| `.gitignore` | ✅ Correct location | Keep at root |
| `.npmrc` | ✅ Correct location | Keep at root |
| `.prettierrc` | ✅ Correct location | Keep at root |
| `README.md` | ✅ Correct location | Keep at root |
| `data-source.ts` | ✅ Correct location | Keep at root — TypeORM CLI discovers it from `package.json` script references; moving it would break migration commands |
| `eslint.config.mjs` | ✅ Correct location | Keep at root |
| `nest-cli.json` | ✅ Correct location | Keep at root |
| `package-lock.json` | ✅ Correct location | Keep at root |
| `package.json` | ✅ Correct location | Keep at root |
| `tsconfig.json` | ✅ Correct location | Keep at root — all `@ems/*` path aliases defined here; moving breaks the build |
| `doc-catalogue.md` | ✅ **Moved** | Relocated to `docs/tracking/doc-catalogue.md` on 2026-06-17 (SAFE_REPOSITORY_HYGIENE S-1) |

---

## Root Folders — Status Assessment

| Folder | Status | Action |
|---|---|---|
| `.github/` | ✅ Correct | Keep — required at root for GitHub Actions |
| `.jest-cache/` | ✅ Correct (gitignored artifact) | Keep as-is — local cache, not committed |
| `apps/` | ✅ Correct | Keep — NestJS monorepo standard |
| `design/` | ✅ Correct | Keep — Phase E scaffold |
| `dist/` | ✅ Correct (gitignored artifact) | Keep as-is — local build output, not committed |
| `docs/` | ✅ Correct | Keep |
| `infra/` | ✅ Correct | Keep |
| `migrations/` | ✅ Correct | Keep |
| `node_modules/` | ✅ Correct | Keep |
| `prompts/` | ✅ Updated | 8 governance instruction files added 2026-06-17; README updated |
| `scripts/` | ✅ Correct | Keep |
| `services/` | ✅ Correct | Keep |

---

## Action: Move `doc-catalogue.md` → `docs/tracking/doc-catalogue.md`

**Reason**: `doc-catalogue.md` is a documentation index file — a `.md` tracking artifact. It does not belong at the repository root alongside source config files (`package.json`, `tsconfig.json`, `nest-cli.json`). It creates confusion for anyone browsing the root: documentation artifacts should live under `docs/`.

**Safe to execute**: Yes — this is a pure documentation file move. It has no imports, no references in `package.json` scripts, no CI/CD references, and no application-code references. It is already classified as Obsolete in the previous normalization pass.

**Execution**: Move `doc-catalogue.md` → `docs/tracking/doc-catalogue.md`

**Post-move**: Add a note at the top of the file: "This file has been moved from the repository root to `docs/tracking/`. It is classified as Obsolete — see `docs/08_reports/DOCUMENT_INVENTORY.md` for the current authoritative inventory."

**Impact on other files**:
- Root `README.md` does not reference `doc-catalogue.md`
- No `package.json` script references it
- No import in any source file references it
- The previous normalization reports reference it by name — those references remain valid regardless of location

---

## Root Clutter Assessment

**Before this audit:**
```
Root level:
  12 tracked files (11 config/build + 1 misplaced doc)
  12 folders
```

**After moving `doc-catalogue.md`:**
```
Root level:
  11 tracked files (all config/build/source)
  12 folders
```

The root level is clean after this one move. No further root cleanup is required.

---

## REQUIRES_OWNER_APPROVAL

The following root-level files were considered for relocation but require
owner approval before any action:

| Item | Reason for Escalation |
|---|---|
| `data-source.ts` | Affects TypeORM CLI commands (`typeorm migration:generate`, `migration:run`) via path references in `package.json` scripts — any move requires updating those scripts and re-verifying migrations workflow |
| `tsconfig.json` | All path aliases (`@ems/*`) resolve from this file's location — moving it would break all module resolution in the monorepo build |

Both are correctly at root. This note is included for completeness — the recommendation is **keep both at root**, not move them.
