Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-17
Owner: AI

# Safe Repository Hygiene Policy

> Defines the SAFE_REPOSITORY_HYGIENE execution tier, introduced by
> `GOVERNANCE REFINEMENT – SAFE REPOSITORY HYGIENE.md` to eliminate
> unnecessary owner escalations for low-risk repository maintenance.
> This tier sits between AUTONOMOUS and REQUIRES_APPROVAL in the
> `REVISED_DECISION_ESCALATION_MATRIX.md`.

---

## Purpose

Governance audit, normalization, and archival phases were generating
owner-approval requirements for activities that carry no meaningful risk
to runtime behavior, data integrity, security, or API contracts. Examples
flagged as REQUIRES_OWNER_APPROVAL that should not have been:

- renaming `docs/canon/` to `docs/legacy/`
- moving documentation files between `docs/` subfolders
- applying retirement header notes to legacy documents
- moving `doc-catalogue.md` from root to `docs/tracking/`

These are not the same risk class as database changes, infrastructure
modifications, or security boundary adjustments. This policy gives AI
sessions a defined tier for executing such work without blocking on owner
confirmation, while still requiring the work to be logged.

---

## Tier Definition

An action is SAFE_REPOSITORY_HYGIENE if it satisfies all of the
following negative conditions:

**Does NOT modify:**
- Business logic or service behavior
- API endpoint paths, request/response shapes, or HTTP behavior
- Database schemas, TypeORM entities, or migration files
- Runtime behavior of any running process
- Infrastructure configuration (`infra/docker/*`, `infra/deployment/*`, `.github/workflows/*`)
- Deployment scripts or CI/CD pipeline definitions
- Security boundaries, authentication flows, or guard implementations
- Permission codes, role definitions, or RBAC enforcement
- Application code (`.ts`, `.js`, `.json` config files that affect runtime)
- `package.json` dependencies or devDependencies

**AND does improve at least one of:**
- Repository organization or discoverability
- Documentation quality, accuracy, or completeness
- Archive structure and legacy material labeling
- Report generation or governance tracking
- Cross-reference accuracy (fixing stale doc links)
- Maintainability for future contributors

---

## Classified Action Types

### SAFE_REPOSITORY_HYGIENE — Proceed without owner confirmation

| Action Type | Examples |
|---|---|
| Documentation file relocation | Moving `.md` files between `docs/` subfolders |
| Documentation folder rename | `docs/canon/` → `docs/legacy/` |
| Documentation folder creation | Creating `docs/legacy/` to consolidate archive material |
| Archive maintenance | Moving retired docs to archive/legacy folders |
| Report relocation | Moving generated reports within `docs/08_reports/` |
| Retirement header note application | Adding `> **Status: Retired.**` blockquotes to legacy docs |
| Document status updates | Updating `Status:` / `Last Reviewed:` header fields |
| Governance metadata updates | Updating `Owner:` / `Authority Level:` header fields |
| Cross-reference fixes | Updating internal doc links after folder renames/moves |
| Authority reference fixes | Correcting superseded doc references in reports |
| Report document updates | Adding rows to gap registers, delta logs, risk registers |
| Inventory updates | Updating `DOCUMENT_INVENTORY.md`, classification matrices |
| README creation (new files only) | Creating `infra/common/README.md` for undocumented shared library |
| Root-level documentation cleanup | Moving misplaced `.md` files from repo root to `docs/` |
| Report consolidation | Merging or splitting report documents within `docs/08_reports/` |
| Generated artifact cleanup | Removing build outputs already listed in `.gitignore` |
| `.gitignore` pattern additions | Adding patterns for recognized, already-excluded artifact types |
| Dead npm script removal | Removing a `package.json` script entry that references a non-existent file and has no runtime use; explicitly NOT dependency/devDependency changes |

### REQUIRES_APPROVAL — Do not execute without owner confirmation

The following remain REQUIRES_APPROVAL regardless of how routine they appear:

| Action | Reason |
|---|---|
| Changes to `infra/docker/*` | Infrastructure; affects container and database init behavior |
| Changes to `.github/workflows/*` | CI/CD pipeline |
| Changes to `infra/deployment/*` | Deployment configuration |
| Changes to `package.json` dependencies or devDependencies | Runtime/build tooling |
| Changes to any `.ts` source file | Runtime behavior |
| Changes to `data-source.ts` | TypeORM CLI datasource; affects migration tooling |
| Database schema or migration changes | Data integrity |
| Changes to RBAC guards, auth guards, JWT handling | Security boundary |
| API contract changes (endpoints, response shapes, Kafka topics) | Service contracts |
| File moves that rename imported paths (`@ems/*` aliases, `require()`, `import`) | Build-path impact |
| Phase transitions (starting Phase E, new feature batch) | Scope change |

### PROHIBITED — Do not do under any circumstances

Same as in `REVISED_DECISION_ESCALATION_MATRIX.md`:
- Deleting production data
- Weakening tenant isolation or audit logging
- Committing secrets to repository
- Force-pushing or rewriting published history

---

## Authorization Requirements

SAFE_REPOSITORY_HYGIENE actions:

1. **Do not require** owner confirmation before execution.
2. **Must be documented** — list every action taken in the session's output
   report under a clearly labeled `SAFE_REPOSITORY_HYGIENE ACTIONS EXECUTED`
   section.
3. **Must be reversible** — no SAFE_REPOSITORY_HYGIENE action should
   permanently delete content. Move or archive; do not delete.
4. **May be batched** — multiple hygiene actions can be executed in a
   single session without separate confirmations per action.
5. **Must not silently modify content** — hygiene is about location and
   labeling, not rewriting document content. If content must be corrected,
   apply the Documentation Freshness Policy in `AI_OPERATING_CONTEXT.md`.

---

## Ambiguity Rule

If an action is not clearly listed above and you are uncertain whether it
is SAFE_REPOSITORY_HYGIENE or REQUIRES_APPROVAL, apply the more
restrictive classification and ask the user.

**Common ambiguous cases and their resolution:**

| Situation | Resolution |
|---|---|
| Editing a doc's content vs. adding a header note | Editing content = REQUIRES_APPROVAL; Adding a prepended retirement note only = SAFE_REPOSITORY_HYGIENE |
| Moving a `.ts` file to a different folder | REQUIRES_APPROVAL — import paths change |
| Moving a `.md` file to a different folder | SAFE_REPOSITORY_HYGIENE — no import paths affected |
| Removing a dead `package.json` script (not a dependency) | SAFE_REPOSITORY_HYGIENE — no runtime behavior changes |
| Removing a `package.json` dependency | REQUIRES_APPROVAL — always |
| Creating a new README.md in an existing folder | SAFE_REPOSITORY_HYGIENE — documentation addition |
| Updating cross-links after a folder rename | SAFE_REPOSITORY_HYGIENE — follow-on from the rename |

---

## Related Documents

- `REVISED_DECISION_ESCALATION_MATRIX.md` — full three-tier decision matrix incorporating this tier
- `REPOSITORY_HYGIENE_EXECUTION_GUIDELINES.md` — step-by-step execution process
- `APPROVAL_RECLASSIFICATION_REPORT.md` — initial reclassification of A-1 through A-5 under this policy
