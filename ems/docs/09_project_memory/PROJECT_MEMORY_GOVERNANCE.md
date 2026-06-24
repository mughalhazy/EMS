Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-20
Owner: AI

# Project Memory Governance

> Rules for maintaining the Project Memory Layer.
> Every contributor — human or AI — must follow these rules when reading
> from or writing to `docs/09_project_memory/`.

---

## Governance Principles

### Principle 1: One Source of Truth Per Item

Every classified item exists in exactly one place:
- The **master index** (`FINAL_CLASSIFIED_REGISTER.md`) has a one-line entry
- The **sub-register** has the full detailed entry
- No item appears in more than one sub-register
- No duplicate entries; update in place

### Principle 2: Classification Is Monotonic

Items move **down** the certainty ladder, not up:
- AUTO-CLOSED → cannot be reopened without contradicting evidence
- SAFE-DEFAULT → cannot become OWNER-REQUIRED without new constraints
- OUT-OF-SCOPE → can graduate to IN-SCOPE when prerequisites are met
- OWNER-DECISION → resolved items stay resolved unless owner reverses decision

### Principle 3: Memory Serves the Future

Every entry must make sense to an AI session that has never seen this conversation. Write complete context, not shorthand. Include the evidence path so claims can be verified.

### Principle 4: Authority Supersedes Memory

When memory conflicts with code or authority docs, trust the code. Update the memory — do not "correct" the code to match stale memory.

### Principle 5: No Accumulation

The memory layer does not grow unboundedly. When items are superseded, implemented, or invalidated:
- Mark them resolved or archived
- Do not append a new entry and leave the old one

---

## Register Responsibilities

| Register | Owner | Update Triggers |
|---|---|---|
| `FINAL_CLASSIFIED_REGISTER.md` | AI | Any new item classified; any status change |
| `AUTO_CLOSED_REGISTER.md` | AI | New AUTO-CLOSED item; contradicting evidence found |
| `SAFE_DEFAULT_REGISTER.md` | AI | New SAFE-DEFAULT; item implemented; spec refined |
| `OWNER_DECISION_REGISTER.md` | AI + Owner | New pending decision; decision resolved |
| `EXTERNAL_DEPENDENCY_REGISTER.md` | AI + Owner | Credential provisioned; vendor changed; dep added/resolved |
| `OUT_OF_SCOPE_REGISTER.md` | AI | New deferral; deferred item graduates to in-scope |
| `PROJECT_MEMORY_USAGE_GUIDE.md` | AI | Quick-reference state changes; new guidance needed |
| `PROJECT_MEMORY_GOVERNANCE.md` | AI | Governance rule change; new register added |

---

## Entry Required Fields

All sub-register entries must include:

| Field | Required | Purpose |
|---|---|---|
| Item ID | YES | Stable cross-reference key |
| Title | YES | Human-readable description |
| Classification | YES | AUTO-CLOSED / SAFE-DEFAULT / OUT-OF-SCOPE / OWNER-DECISION / EXTERNAL-DEPENDENCY |
| Evidence Source | YES (except OUT-OF-SCOPE) | What code, file, or doc proves this |
| Affected Components | YES | Which services/files/screens are impacted |
| Affected Routes | If applicable | API endpoints involved |
| Affected Workflows | YES | Which named workflow is affected |
| Affected Roles | YES | Which RBAC roles are affected |
| Related Register | YES | Cross-links to other register entries |

---

## When to Update Memory

### MUST update immediately:
- A new classified item is discovered
- An existing item changes classification
- An item is implemented (moves from SAFE-DEFAULT to done)
- An external dependency is provisioned or revoked
- An owner decision is made or reversed

### MUST NOT update:
- During implementation (memory is not a progress tracker — use tasks)
- To record code patterns, file paths, or architecture (read the code)
- To record who did what (use git log)
- To record ephemeral session state

---

## Classification Change Protocol

When an item changes classification:

1. **Update the sub-register entry** — change the Classification field; add resolution note and date
2. **Move the entry to the correct register** — if the item's register changes (e.g., SAFE-DEFAULT item becomes OUT-OF-SCOPE), move the full entry to the correct register file
3. **Update FINAL_CLASSIFIED_REGISTER.md** — change the classification column for that row
4. **Update the OLD register** — remove the entry or replace with a short redirect note pointing to the new register

---

## Graduated Items (OUT-OF-SCOPE → IN-SCOPE)

When an OUT-OF-SCOPE item becomes implementable (prerequisites met):

1. Move the entry from `OUT_OF_SCOPE_REGISTER.md` to `SAFE_DEFAULT_REGISTER.md`
2. Add an implementation spec to the entry
3. Update `FINAL_CLASSIFIED_REGISTER.md` row to SAFE-DEFAULT
4. Update `EXTERNAL_DEPENDENCY_REGISTER.md` if the prerequisite is now met
5. Leave a redirect note in `OUT_OF_SCOPE_REGISTER.md`: "See SAFE_DEFAULT_REGISTER.md#[id] — graduated [date]"

---

## Implemented Items (SAFE-DEFAULT → Done)

When a SAFE-DEFAULT item is implemented in code:

1. Change Status field in `SAFE_DEFAULT_REGISTER.md` entry to `IMPLEMENTED`
2. Add: `Implemented Date: [date]` and `Implementation Location: [service/file]`
3. Update `FINAL_CLASSIFIED_REGISTER.md` row Status column to `IMPLEMENTED`
4. Do NOT delete the entry — it becomes historical record of what was built and why

---

## Prohibited Actions

| Action | Why Prohibited |
|---|---|
| Deleting an IMPLEMENTED entry | Loses rationale and design intent |
| Reopening AUTO-CLOSED without evidence | Wastes future sessions chasing already-resolved items |
| Adding new OWNER-REQUIRED without compression attempt | Owner's time is finite — exhaust SAFE-DEFAULT first |
| Writing duplicate entries | Causes contradictions; confuses future sessions |
| Referencing code patterns in memory | Code is the authority; memory should point to code, not replace it |
| Overriding FROZEN_DECISIONS without ADR | Breaks governance contract |

---

## Version History

| Date | Author | Change |
|---|---|---|
| 2026-06-17 | AI (Claude Sonnet 4.6) | Initial creation; 8-file layer established; 68 items classified |
| 2026-06-20 | AI (Claude Sonnet 4.6) | Protocol re-run; FINAL_CLASSIFIED_REGISTER updated to 77 items (9 OOS items indexed); Phase 3.5 L0 Freeze recorded; SAFE_DEFAULT Phase E statuses refreshed; USAGE_GUIDE quick reference updated |

---

## Success Criterion

This memory layer is complete when:

> A future AI session with no prior context can reconstruct project history,
> classification state, and implementation priorities from this directory alone,
> without re-reading the full conversation history.

If a future session cannot answer these questions from the memory layer alone, update the memory:

1. What has already been audited?
2. What is already decided and should not be re-debated?
3. What still needs to be implemented?
4. What requires the owner?
5. What has been intentionally deferred?
6. What external credentials or infrastructure does the project need before production?
