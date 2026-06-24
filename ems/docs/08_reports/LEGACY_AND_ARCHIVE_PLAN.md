Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Legacy and Archive Plan

> Dispositions for all legacy, historical, obsolete, and stale items found
> during this audit. Builds on `DOCUMENT_RETIREMENT_PLAN.md` (from the
> previous normalization pass) and adds new items discovered during this
> full repository audit.

## Disposition Categories

| Disposition | Meaning |
|---|---|
| Keep | No change — content remains current and useful |
| Keep + Header Note | Keep content, add a status note at the top of the file |
| Archive | Mark as historical; keep in place; no further updates needed |
| Retire | Mark as superseded; add cross-reference to successor; no deletion |
| Move + Header Note | Relocate to a more appropriate path and add a status note |
| Update | Make a minor factual correction to the file (documentation only) |

---

## Previously Identified Legacy Items (from DOCUMENT_RETIREMENT_PLAN.md)

The following 19 header-note edits were recommended in the previous
normalization pass but have **not yet been applied**. They are carried
forward here with no change to the recommendation:

| Document | Disposition | Priority |
|---|---|---|
| `docs/canon/domain-model.md` | Retire + Header Note | Medium |
| `docs/canon/service-map.md` | Retire + Header Note | Medium |
| `docs/canon/event-catalog.md` | Retire + Header Note | Medium |
| `docs/canon/api-standards.md` | Retire (Partial) + Header Note | Medium |
| `docs/canon/security-model.md` | Retire (Partial) + Header Note | Medium |
| `docs/canon/data-architecture.md` | Retire (Partial) + Header Note | Medium |
| `docs/canon/workflow-catalog.md` | Retire + Header Note | Medium |
| `docs/canon/capability-matrix.md` | Archive + Header Note | Low |
| `docs/canon/read-model-catalog.md` | Retire (Partial) + Header Note | Medium |
| `docs/architecture/system-architecture.md` | Retire + Header Note | **High** (contains active conflicts C-1, C-4) |
| `docs/product/product-overview.md` | Retire + Header Note | Medium |
| `docs/tracking/progress.md` | Retire + Header Note | **High** (actively misleading — marks implemented services as "not started") |
| `docs/tracking/gap-register.md` | Archive + Header Note | Low |
| `docs/tracking/doc-tracker.md` | Retire + Header Note | Medium |
| `infra/event-bus/README.md` | Update Status Line + Header Note | Low |
| `infra/cache/README.md` | Update Status Line + Header Note | Low |
| `doc-catalogue.md` | Move + Retire + Header Note | **High** (misplaced at root) |
| `prompts/README.md` | Retire + Header Note | Low |

These are **pending execution** as documentation-only edits — all safe to apply
without owner approval per the previous normalization pass assessment.

---

## New Legacy Items Discovered in This Audit

### L-1: `docs/tracking/doc-tracker.md` — Stale Coverage Assessment

**Status**: Obsolete. Contains health/currency assessments for 57 docs as of
2026-06-13. Repo now has ~80+ docs. The assessments for all Phase A canon docs
say "CURRENT" or "STALE-MINOR" — these are now superseded by the
`DOCUMENT_CLASSIFICATION_MATRIX.md` and `DOCUMENT_INVENTORY.md` from the
normalization pass. The new assessment makes `doc-tracker.md` redundant even
as a historical reference.

**Disposition**: Retire + Header Note (already in carry-forward list above —
no new action, just affirming the classification stands after this audit too).

---

### L-2: `prompts/` Directory

The `prompts/README.md` describes four gap-fill prompts (Enterprise SSO, Social,
Interactive Engagement, AI Layer) as work yet to be performed. All four are
implemented. The `prompts/` directory holds no prompt files — only the README.

**Disposition**: Keep folder (removing it would change repo structure), update
README with Retire + Header Note. Low priority since no one is actively using
this folder. Already in carry-forward list.

---

### L-3: `docs/canon/` — Structural Legacy Collection

The `docs/canon/` directory contains 10 Phase A design-intent documents, all
of which are now Retired or Retired (Partial). From a repo-structure
perspective, having a `docs/canon/` folder alongside the numbered
`docs/00_*`–`docs/08_*` framework creates structural ambiguity (readers don't
know if "canon" means "authoritative" or "historical").

**Recommendation**: Rename `docs/canon/` → `docs/legacy/` to make the
non-authoritative nature of its contents self-evident. This is a documentation
folder rename that does not affect any source code, build paths, or imports.

**REQUIRES_OWNER_APPROVAL**: Although safe from a build/CI perspective, this
changes a folder name that may be referenced in:
- Internal cross-links within canon docs (e.g., `../canon/domain-model.md`)
- External bookmarks or references outside this repo

**If approved**: Update all internal cross-references in the 10 canon docs
and in any authority/governance doc that references them. This is mechanical.

---

### L-4: `docs/architecture/` — Orphaned Legacy Sub-Folder

`docs/architecture/` holds 2 docs: `system-architecture.md` (Retired) and
`ai-architecture.md` (Supporting Reference, not yet superseded). This folder
exists outside the numbered framework and has no clear successor folder.

- `system-architecture.md` logically belongs in `docs/legacy/` (or `docs/canon/` if renamed)
- `ai-architecture.md` logically belongs in `docs/01_backend/` or a future `docs/00_authority/` addition once Phase E AI work is verified

**Recommendation**: After `docs/canon/` → `docs/legacy/` rename (if approved):
- Move `docs/architecture/system-architecture.md` → `docs/legacy/system-architecture.md`
- Keep `docs/architecture/ai-architecture.md` in place until a Phase E authority doc supersedes it, then move to `docs/legacy/`

**REQUIRES_OWNER_APPROVAL**: Same caveat as L-3 — folder name change.

---

### L-5: `docs/tracking/` — Historical Tracking Folder

Contains 5 files: `progress.md` (Obsolete), `gap-register.md` (Historical),
`delta-log.md` (Active), `doc-tracker.md` (Obsolete), `research-analysis.md`
(Active). The folder name accurately describes content but sits outside the
numbered framework. `delta-log.md` and `research-analysis.md` have no Phase 1/2
successors and remain actively valuable.

**Recommendation**: Keep `docs/tracking/` as-is. The two active docs
(`delta-log.md`, `research-analysis.md`) have no better home under the numbered
framework. Apply header notes to the 3 obsolete/historical docs per the
carry-forward list. No structural change needed.

---

## Priority Order for Applying Legacy Dispositions

| Priority | Item | Reason |
|---|---|---|
| 1 — Highest | Move `doc-catalogue.md` root → `docs/tracking/` | Actively clutters root; misleads about current doc inventory |
| 2 — High | `docs/tracking/progress.md` header note | Actively misleads: marks implemented services as "Not started" |
| 3 — High | `docs/architecture/system-architecture.md` header note | Contains two active conflicts (C-1, C-4) that could mislead readers |
| 4 — Medium | All remaining `docs/canon/*.md` header notes (9 files) | Legacy docs without retirement markers; readers can't tell which docs are current |
| 5 — Medium | `docs/product/product-overview.md` header note | Contains uncorrected CA-002 error (Campaign/engagement) |
| 6 — Medium | `docs/tracking/doc-tracker.md` header note | Obsolete health assessment |
| 7 — Low | `infra/event-bus/README.md`, `infra/cache/README.md` status line updates | "SCAFFOLD" status lines are stale |
| 8 — Low | `prompts/README.md` header note | Obsolete prompt list |
| 9 — Low | `docs/tracking/gap-register.md` archive note | All items resolved; low risk of confusion |
| 10 — Low | `docs/canon/capability-matrix.md` archive note | Purely historical; low readership |

---

## REQUIRES_OWNER_APPROVAL (Legacy / Archive Actions)

| Action | Reason |
|---|---|
| Rename `docs/canon/` → `docs/legacy/` | Folder rename may break internal cross-links; needs coordinated update of all referencing docs |
| Move `docs/architecture/system-architecture.md` | Depends on `docs/canon/` rename decision |
| Move `docs/architecture/ai-architecture.md` | Depends on when Phase E AI authority doc is created |
