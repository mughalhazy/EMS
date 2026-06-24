Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-20
Owner: AI

# Project Memory Usage Guide

> This guide explains how every future AI session must use the Project Memory Layer.
> The memory layer is the institutional memory of the EMS project.
> It prevents rediscovery, duplicate decisions, and lost context.

---

## Rule 1: Load Memory First

**Every AI session that touches this repository MUST load:**

```
docs/09_project_memory/FINAL_CLASSIFIED_REGISTER.md
```

**Before:**
- Any gap analysis
- Any audit
- Any redesign or refactor
- Any frontend or backend implementation
- Any deployment or infrastructure work

**Then load the relevant sub-registers based on the task:**

| Task type | Load these registers |
|---|---|
| Finding a new gap | All registers — check if it already exists |
| Implementing a SAFE-DEFAULT item | SAFE_DEFAULT_REGISTER.md |
| Checking what's blocked | EXTERNAL_DEPENDENCY_REGISTER.md |
| Checking what's deferred | OUT_OF_SCOPE_REGISTER.md |
| Owner needs to make a decision | OWNER_DECISION_REGISTER.md |

---

## Rule 2: Check Before Creating

**BEFORE treating anything as a new gap, decision, or finding:**

1. Check `FINAL_CLASSIFIED_REGISTER.md` by ID and title
2. Check the relevant sub-register for detailed entry
3. If the item exists → update it, do not create a duplicate
4. If the item is new → classify it and add it to the correct register

**The most common mistake is rediscovering what is already known.**

---

## Rule 3: Classification Lookup

Use this table to classify any new item:

| Classification | Use when... |
|---|---|
| AUTO-CLOSED | Proven directly from code, contracts, or authority docs — no inference |
| SAFE-DEFAULT | One implementation path is overwhelmingly correct; no commercial/legal risk |
| OUT-OF-SCOPE | Intentionally deferred; future phase; optional capability; regional expansion |
| OWNER-DECISION | Only the owner can answer — commercial, legal, credentials, hardware, business policy |
| EXTERNAL-DEPENDENCY | Requires vendor account, credentials, registration, or external provisioning |

**When in doubt:**
- Technical discovery → AUTO-CLOSED or SAFE-DEFAULT
- Needs credentials or vendor → EXTERNAL-DEPENDENCY
- Genuinely a human policy choice → OWNER-DECISION
- Not current phase → OUT-OF-SCOPE

---

## Rule 4: Reopen Only With Evidence

Items may only be reopened when:
1. Evidence has changed (new code, new architecture)
2. Implementation changed what was previously true
3. Owner explicitly reverses a decision
4. External dependency becomes available (or becomes unavailable)

**Otherwise, resolved items remain resolved. Do not reopen without a reason.**

---

## Rule 5: Update, Don't Accumulate

When a resolved item changes state:
1. Update the existing entry in the sub-register
2. Update the status in `FINAL_CLASSIFIED_REGISTER.md`
3. Do NOT create a duplicate entry

When a new item is added:
1. Add to the correct sub-register with all required fields
2. Add an index entry to `FINAL_CLASSIFIED_REGISTER.md`

---

## Quick Reference: Current State (as of 2026-06-20)

| Question | Answer |
|---|---|
| How many classified items? | 77 (68 original + 9 OOS items catalogued in memory layer) |
| Owner decisions pending? | 0 |
| Phase E blockers? | 0 |
| Current phase? | Phase E — Frontend Implementation (L0 FROZEN 2026-06-20) |
| Claude Design authorization? | GRANTED — begin archetype work |
| L0 input pack location? | `docs/03_frontend_authority/L0_FRONTEND_AUTHORITY_INPUT_FREEZE.md` |
| What needs owner attention? | External dependency provisioning for production (EXT-1 through EXT-10) |
| Highest-value backend actions? | OCR-2 (23 permissions), GAP-B2 (test coverage), GAP-G6 (security hardening) |
| Highest-value frontend actions? | App shell archetype, S-07 dashboard variants, S-16 check-in station |

---

## Register File Map

```
docs/09_project_memory/
├── FINAL_CLASSIFIED_REGISTER.md     ← START HERE (master index; 77 items)
├── AUTO_CLOSED_REGISTER.md          ← 38 resolved facts
├── SAFE_DEFAULT_REGISTER.md         ← 29 items with implementation specs
├── OWNER_DECISION_REGISTER.md       ← 0 pending; historical + frozen decisions
├── EXTERNAL_DEPENDENCY_REGISTER.md  ← 10 external prerequisites for production
├── OUT_OF_SCOPE_REGISTER.md         ← 10 intentionally deferred items
├── PROJECT_MEMORY_USAGE_GUIDE.md    ← This file
└── PROJECT_MEMORY_GOVERNANCE.md     ← Rules for maintaining this layer

docs/03_frontend_authority/           ← L0 Input Pack (FROZEN 2026-06-20)
├── L0_FRONTEND_AUTHORITY_INPUT_FREEZE.md  ← Master frozen input pack
├── L0_ROUTE_SCREEN_WORKFLOW_MATRIX.md     ← 91-row route matrix
├── L0_DESIGN_CONSTRAINTS_FOR_CLAUDE_DESIGN.md  ← Binding design constraints
└── L0_CLAUDE_DESIGN_BRIEF.md              ← Claude Design brief
```

---

## Authority Layer vs. Memory Layer

| Layer | Purpose | Files |
|---|---|---|
| Authority Layer | Source of truth for current behavior | `docs/00_authority/`, `docs/01_backend/`, `docs/03_fullstack_contracts/` |
| Memory Layer | Source of historical context and decisions | `docs/09_project_memory/` |

**Authority layer = what is true NOW.**
**Memory layer = why decisions were made and what was already investigated.**

When they conflict, trust the authority layer (it reflects current code). Update the memory layer entry to match.
