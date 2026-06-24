> **Status: Obsolete.** This health/accuracy assessment is from 2026-06-13
> and predates 46 governance/backend-authority documents created in Phase 1
> and Phase 2. Its "CURRENT"/"STALE" tags for canon docs are superseded by
> `docs/08_reports/DOCUMENT_CLASSIFICATION_MATRIX.md` (2026-06-15).

# Doc Tracker

Health and currency status of every documentation file in the repo. Companion
to `doc-catalogue.md` (which records *what* each file contains) — this file
records *how accurate* each file is right now and what action (if any) it needs.

Last updated: 2026-06-13

Cross-references: `gap-register.md` (GAP-1, GAP-7 cover the largest staleness
buckets), `delta-log.md` (DELTA-1 through DELTA-6 each have a doc-action noted).

---

## Status legend

| Tag | Meaning |
|---|---|
| `CURRENT` | Accurate as of last verification (2026-06-13) |
| `STALE-MINOR` | Out of date in a low-impact way; the doc is still usable |
| `STALE-MAJOR` | Actively misleading; must be fixed before onboarding or using the doc for decisions |
| `STUB` | Scaffolded but not yet populated; expected state for future phases |
| `ACTION` | A concrete edit has been identified — see the Action column |

---

## Root docs

| File | Status | Action |
|---|---|---|
| `README.md` | `CURRENT` | None |
| `BUILD_BLUEPRINT.md` | `CURRENT` | None |
| `doc-catalogue.md` | `CURRENT` | Update after each new batch/phase to add new `.md` files |

---

## docs/tracking (this folder)

| File | Status | Action |
|---|---|---|
| `progress.md` | `CURRENT` | Update batch/phase rows as Batches 7–10 and Phase E complete |
| `gap-register.md` | `CURRENT` | Close GAP-2 after Batch 8/9 scope decision; close GAP-1/GAP-7 after README batch-edit |
| `delta-log.md` | `CURRENT` | Add DELTA-7+ as future batches introduce new divergences |
| `research-analysis.md` | `CURRENT` | Add RA-6+ as new architectural decisions are made in Batches 7–10 |
| `doc-tracker.md` | `CURRENT` | This file — update alongside every doc change |

---

## docs/canon (10 files)

| File | Status | Action |
|---|---|---|
| `domain-model.md` | `STALE-MINOR` | §8 lists 4 search entity types; add `exhibitor` as 5th (DELTA-3). §2 Sponsor/SponsorPackage V1/V2 reconciliation already noted in the doc itself — no new action |
| `service-map.md` | `CURRENT` | Accurate for Batches 1–6; `interactive-engagement` / `networking` rows will need updating after GAP-2 is resolved |
| `event-catalog.md` | `CURRENT` | All topics verified against implemented service consumers |
| `api-standards.md` | `CURRENT` | None |
| `security-model.md` | `CURRENT` | Enterprise SSO section correctly marked as Tier 4 scope (GAP-6); no change needed until that batch |
| `data-architecture.md` | `STALE-MINOR` | §1 says `order.*` schema; actual schema is `ordering.*` — add footnote (DELTA-1). §4 OpenSearch section remains target architecture; ILIKE interim state covered in DELTA-2 |
| `read-model-catalog.md` | `STALE-MINOR` | "Search Indices" table lists 4 indices; add `exhibitors` as 5th (DELTA-3 action) |
| `ui-surface-map.md` | `CURRENT` | None — Phase E routes not yet implemented, correctly shown as planned |
| `workflow-catalog.md` | `CURRENT` | None |
| `capability-matrix.md` | `CURRENT` | Tier 1–3 complete; Tier 4 items correctly shown as pending |

---

## docs/architecture (2 files)

| File | Status | Action |
|---|---|---|
| `system-architecture.md` | `STALE-MINOR` | §8/§9 does not document the `tsc -p tsconfig.json` + `register-paths.js` production build pattern — add a short subsection (DELTA-4 action) |
| `ai-architecture.md` | `CURRENT` | Describes target state correctly; no conflict with current implementation |

---

## docs/workflows (4 files)

| File | Status | Action |
|---|---|---|
| `event-lifecycle.md` | `CURRENT` | None |
| `registration-flow.md` | `CURRENT` | None |
| `checkout-flow.md` | `CURRENT` | None |
| `checkin-flow.md` | `CURRENT` | None |

---

## docs/product/ui/developer (3 files)

| File | Status | Action |
|---|---|---|
| `docs/product/requirements.md` | `CURRENT` | None |
| `docs/ui/design-system.md` | `CURRENT` | Token file paths (§10) are correct targets; `design/tokens/*.js` files don't exist yet — that's GAP-4, expected state |
| `docs/developer/README.md` | `CURRENT` | Health endpoints and `JsonLogger` added during Phase D Bundle 3; file is up to date |

---

## design/ (3 scaffolds)

| File | Status | Action |
|---|---|---|
| `design/tokens/README.md` | `STUB` | Populate in Phase E TASK 02 (GAP-4) |
| `design/components/README.md` | `STUB` | Populate in Phase E TASK 04 (GAP-4) |
| `design/wireframes/README.md` | `STUB` | Populate in Phase E TASK 05 (GAP-4) |

---

## apps/web (1 file)

| File | Status | Action |
|---|---|---|
| `apps/web/README.md` | `CURRENT` | TASK 01–14 task list is intentionally aspirational; accurate for Phase E planning |

---

## infra/ (5 files)

| File | Status | Action |
|---|---|---|
| `infra/event-bus/README.md` | `STALE-MAJOR` | Says "SCAFFOLD - not yet implemented"; `EventBusService` is fully implemented and in use by all 21 services — update `Status:` to `Implemented` (GAP-1, GAP-7) |
| `infra/cache/README.md` | `STALE-MAJOR` | Same issue as above — `RedisClient` (`@ems/cache`) fully implemented (GAP-1, GAP-7) |
| `infra/docker/README.md` | `CURRENT` | Correctly notes `apps/web` Dockerfile is pending (GAP-5) |
| `infra/deployment/README.md` | `CURRENT` | env example files and secrets README in place (Phase D Bundle 4) |
| `infra/common/README.md` | `CURRENT` | None |

---

## services/ — Batch 1–6 (21 READMEs, all implemented)

All 21 implemented-service READMEs share the same staleness: `Status: SCAFFOLD - not yet implemented` at the top. This is a bulk edit (GAP-7).

| Batch | Services | README Status | Bulk action |
|---|---|---|---|
| 1 | auth, tenant, rbac, audit | `STALE-MINOR` | Change `Status:` to `Implemented (Batch 1)` |
| 2 | event, agenda, speaker, exhibitor, attendee | `STALE-MINOR` | `Implemented (Batch 2)` |
| 3 | registration, onsite | `STALE-MINOR` | `Implemented (Batch 3)` |
| 4 | ticketing, pricing, inventory, order, payment, fulfillment | `STALE-MINOR` | `Implemented (Batch 4)` — `order` service README should note schema is named `ordering` |
| 5 | notification, engagement | `STALE-MINOR` | `Implemented (Batch 5)` — `engagement` README should note it also owns Poll/QA/Survey/Connection entities (GAP-2) |
| 6 | analytics, search | `STALE-MINOR` | `Implemented (Batch 6)` — `search` README should note Postgres ILIKE interim state (DELTA-2) |

---

## services/ — Batches 7–10 (not yet started)

| Service | README Status | Action |
|---|---|---|
| `networking` | `STUB` | Build in Batch 8 — resolve GAP-2 first |
| `interactive-engagement` | `STUB` | Build in Batch 9 — resolve GAP-2 first |
| `ai-service` | `STUB` | Build in Batch 10 — depends on Batches 2, 6, 8, 9 |
| `integration` | `STUB` | No batch assigned yet — write build prompt first (GAP-3) |
| `ui-renderer` | `STUB` | Phase E — depends on `design/components/` (GAP-4) |

---

## prompts/ (1 file)

| File | Status | Action |
|---|---|---|
| `prompts/README.md` | `CURRENT` | Enterprise SSO gap-fill prompt noted; `services/integration` prompt still needs writing (GAP-3) |

---

## Prioritised action list

Actions below are sequenced by impact — `STALE-MAJOR` first, then `STALE-MINOR`
items that unblock work.

| Priority | File(s) | Action | Blocks |
|---|---|---|---|
| 1 | `infra/event-bus/README.md`, `infra/cache/README.md` | Update `Status:` to `Implemented`, add source-file pointers (GAP-1) | New contributor clarity |
| 2 | All 21 `services/*/README.md` | Batch-update `Status:` lines to `Implemented (Batch N)` (GAP-7) | New contributor clarity |
| 3 | `docs/canon/domain-model.md` §8 | Add `exhibitor` as 5th search entity type (DELTA-3) | Batch 10 / OpenSearch migration planning |
| 4 | `docs/canon/read-model-catalog.md` | Add `exhibitors` to Search Indices table (DELTA-3) | Same |
| 5 | `docs/canon/data-architecture.md` §1 | Add footnote: `order` schema is named `ordering` (DELTA-1) | Prevents confusion during future schema work |
| 6 | `docs/architecture/system-architecture.md` | Add §8/§9 subsection on `tsc -p tsconfig.json` + `register-paths.js` build (DELTA-4) | Onboarding new backend devs |
| 7 | `services/engagement/README.md` | Note that it also owns Poll/QA/Survey/Connection entities pending GAP-2 resolution | Batch 8/9 planning |
| 8 | `services/search/README.md` | Note Postgres ILIKE interim state and planned OpenSearch migration | Batch 10 planning |
| 9 | `prompts/README.md` | Add `services/integration` build prompt (GAP-3) | Tier 4 / `integration` service start |
