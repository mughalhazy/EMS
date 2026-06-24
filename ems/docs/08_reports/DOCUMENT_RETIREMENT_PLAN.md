Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Document Retirement Plan

> For every Legacy, Historical, Stale, or Obsolete document identified in
> `DOCUMENT_INVENTORY.md` / `DOCUMENT_CLASSIFICATION_MATRIX.md`, this plan
> specifies a disposition (Keep / Merge / Retire / Replace / Archive) with
> rationale, and the exact header note to add. Per rules 9-11 of
> `DOCUMENTATION NORMALIZATION AND AUTHORITY CONSOLIDATION.md`:
> **no document is deleted**; retirement is achieved by adding a status
> header and cross-reference to the superseding authority document.
>
> **This plan documents the recommended header notes; applying them (editing
> the 19 documents below) is a follow-up action and is listed as such in
> `DOCUMENT_NORMALIZATION_REPORT.md`. This report itself does not modify any
> of the target documents**, consistent with the instruction file's emphasis
> on producing "normalization analysis and recommendations."

## Disposition Definitions

| Disposition | Meaning |
|---|---|
| Keep | No change — document remains current and authoritative as-is |
| Merge | Unique content should be folded into another document (content-preserving) |
| Retire | Mark as superseded via header note + cross-reference; content remains in place |
| Replace | Document's role is fully taken over by a new document; header note points readers away entirely |
| Archive | Document describes a closed/resolved historical period; mark Historical, no action needed beyond labeling |

---

## docs/canon/ (10 documents)

| Document | Disposition | Header Note to Add | Rationale |
|---|---|---|---|
| `domain-model.md` | Retire | "**Status: Retired.** Superseded by `docs/00_authority/DOMAIN_MODEL.md` (code-verified). Retained as design-intent reference — see GAP-G9 (16 entity naming deviations, pending ADR) and DELTA-1 (`order`→`ordering`)." | D-1, C-6, C-7 |
| `service-map.md` | Retire | "**Status: Retired.** Superseded by `docs/01_backend/SERVICE_CATALOG.md` (code-verified). Kafka producer/consumer matrix retained as design intent — not yet cross-checked against `EVENT_AND_QUEUE_ARCHITECTURE.md` (candidate follow-up: GAP-B14)." | D-2 |
| `event-catalog.md` | Retire | "**Status: Retired.** Topic catalog superseded by `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md` (57 code-verified topics). §10 (topic naming convention and versioning policy, e.g. `order.paid.v2`) remains in effect and is not restated elsewhere." | D-3 |
| `api-standards.md` | Retire (Partial) | "**Status: Retired (Partial).** §1-5, §7-9 superseded by `docs/01_backend/API_CONTRACT.md`, `ERROR_CONTRACT.md`, `VALIDATION_RULES.md`. §6 (rate limiting) and §10 (webhooks) remain **active design targets** — see SEC-010 and GAP-G6/GAP-B6. **Conflict note**: this document specifies cursor-based pagination (`?cursor=`); implemented API uses page-based pagination (`?page=`) — see `API_CONTRACT.md` and recommended DELTA-7." | D-4, C-3, C-9 |
| `security-model.md` | Retire (Partial) | "**Status: Retired (Partial).** §1, §3, §5, §7 superseded by `docs/03_fullstack_contracts/AUTH_AND_TENANCY_CONTRACT.md`. §4, §6, §8 remain **active design targets** (PII handling, abuse detection, secrets rotation — not yet implemented). **Conflict note**: §2's 9-role table is superseded by `USER_ROLES_AND_PERMISSIONS.md`'s 8-role model (different names and coverage — see recommended GAP-G10). §3's 'tenant isolation middleware' is superseded by the shared base repository pattern (CA-004)." | D-5, C-1, C-2 |
| `data-architecture.md` | Retire (Partial) | "**Status: Retired (Partial).** Schema-ownership content superseded by `docs/01_backend/DATABASE_SCHEMA.md`. §4 (OpenSearch search backend) and §5 (object storage layout) remain **active design targets** — see DELTA-2/DELTA-3/RA-4 for the search migration plan." | D-6, C-8 |
| `workflow-catalog.md` | Replace | "**Status: Retired.** Fully superseded by `docs/00_authority/PRODUCT_WORKFLOWS.md`. No unique content retained — `docs/workflows/*.md` (event-lifecycle, checkout-flow, registration-flow, checkin-flow) provide additional step-level detail and remain active Supporting References to `PRODUCT_WORKFLOWS.md`." | D-7 |
| `capability-matrix.md` | Archive | "**Status: Retired (Historical).** Superseded by `docs/00_authority/FEATURE_SCOPE.md` and `PROJECT_CHARTER.md` §4. T1-T4 delivery-tier framing retained as historical planning context only — all batches are now implemented." | D-8 |
| `read-model-catalog.md` | Retire (Partial) | "**Status: Retired (Partial).** Analytics service inventory superseded by `docs/01_backend/SERVICE_CATALOG.md`. The 10-model breakdown is more granular than current authority docs and is **not yet reconciled** — see GAP-B12 (analytics entity names TBD). Retained as input for that reconciliation." | D-1 (analytics aspect) |
| `ui-surface-map.md` | Keep | *(no change — not yet superseded)* | Phase E frontend authority does not yet exist |

## docs/architecture/ (2 documents)

| Document | Disposition | Header Note to Add | Rationale |
|---|---|---|---|
| `system-architecture.md` | Retire | "**Status: Retired.** Superseded by `docs/01_backend/BACKEND_ARCHITECTURE.md` (code-verified). **Conflict notes**: (1) §4.1/§7 describe 'tenant isolation middleware' — implemented pattern is a shared base repository (CA-004). (2) §2 frames the architecture as 'evolving toward independently-deployable services' — ADR-001 and `BACKEND_ARCHITECTURE.md` describe a stable modular monolith without this framing; this strategic question is unresolved and escalated per `DECISION_ESCALATION_MATRIX.md` (see recommended follow-up). §3 service-boundary diagram may continue to serve as a visual aid." | D-11, C-1, C-4 |
| `ai-architecture.md` | Keep | *(no change — not yet superseded)* | GAP-G7 (not cross-checked against code) is a pre-existing tracked gap, not a normalization finding |

## docs/product/, docs/ui/, docs/developer/ (3 documents)

| Document | Disposition | Header Note to Add | Rationale |
|---|---|---|---|
| `product/product-overview.md` | Replace | "**Status: Retired.** Fully superseded by `docs/00_authority/PROJECT_CHARTER.md`, which corrects §4's Campaign/AudienceSegment module placement (see GAP-G3/CA-002 — these entities belong to `notification`, not `engagement`)." | D-9, C-5 |
| `ui/design-system.md` | Keep | *(no change — not yet superseded)* | Phase E design authority does not yet exist |
| `developer/README.md` | Keep | *(no change)* | Current and accurate |

## docs/tracking/ (5 documents)

| Document | Disposition | Header Note to Add | Rationale |
|---|---|---|---|
| `progress.md` | Retire | "**Status: Obsolete.** Batches 8-10 (networking, interactive-engagement, ai-service), Enterprise SSO, and `services/integration` are marked 'Not started' in this document but are **implemented** — see `docs/01_backend/SERVICE_CATALOG.md` and GAP-G1 in `ARCHITECTURAL_GAP_REGISTER.md`. Remaining accurate items: Phase E (frontend) and `apps/web` Dockerfile are genuinely not started." | C-10, D-10 |
| `gap-register.md` | Archive | "**Status: Historical.** GAP-1 through GAP-7 are all marked RESOLVED as of 2026-06-14. For currently-open gaps, see `docs/08_reports/ARCHITECTURAL_GAP_REGISTER.md` (GAP-G1..G9) and `docs/08_reports/BACKEND_GAP_REGISTER.md` (GAP-B1..B13)." | D-10 |
| `delta-log.md` | Keep | *(no change — add cross-reference only)* "Consider adding DELTA-7 (pagination model: cursor vs. page-based, see CONFLICT_ANALYSIS_REPORT.md C-3) as a follow-up." | C-3; otherwise unique, valuable content |
| `doc-tracker.md` | Retire | "**Status: Obsolete.** This health/accuracy assessment is from 2026-06-13 and predates 46 governance/backend-authority documents created in Phases 1-2. For current documentation health, see `docs/08_reports/DOCUMENT_INVENTORY.md` and `DOCUMENT_CLASSIFICATION_MATRIX.md` (2026-06-15)." | New finding — superseded by this phase's outputs |
| `research-analysis.md` | Keep | *(no change)* | Unique build-decision rationale, no newer equivalent |

## Root (1 document)

| Document | Disposition | Header Note to Add | Rationale |
|---|---|---|---|
| `doc-catalogue.md` | Retire | "**Status: Obsolete.** This index covers 57 files as of 2026-06-13 and does not include the 46 governance/backend-authority/contracts/report documents created in Phases 1-3. For a complete current inventory, see `docs/08_reports/DOCUMENT_INVENTORY.md` (2026-06-15)." | Superseded by this phase's primary output |

## infra/ (2 documents)

| Document | Disposition | Header Note to Add | Rationale |
|---|---|---|---|
| `infra/event-bus/README.md` | Retire (Partial) | "**Status: Supporting (orientation only).** For authoritative Kafka topic/event documentation, see `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md`. Update the 'SCAFFOLD' status line — this infra is implemented (GAP-1/GAP-7 resolved)." | GAP-1/GAP-7 already note this; formalizing cross-reference |
| `infra/cache/README.md` | Retire (Partial) | "**Status: Supporting (orientation only).** For authoritative Redis configuration, see `docs/01_backend/BACKEND_ARCHITECTURE.md` §7. Update the 'SCAFFOLD' status line — this infra is implemented." | Same pattern as event-bus |

## prompts/ (1 document)

| Document | Disposition | Header Note to Add | Rationale |
|---|---|---|---|
| `prompts/README.md` | Retire | "**Status: Obsolete.** Lists gap-fill prompts for Enterprise SSO, Social (networking), Interactive Engagement, and AI Layer as pending work — all are now implemented. See `docs/01_backend/SERVICE_CATALOG.md` for current state." | Same root cause as progress.md (GAP-G1) |

---

## Documents Requiring No Retirement Action (Keep As-Is)

The following are explicitly **not** retired by this plan — they remain
either current, not-yet-superseded, or correctly represent unstarted future
work:

- All 20 Authority Documents (`docs/00_authority/*`, `docs/01_backend/*` authority docs, `docs/03_fullstack_contracts/*` authority docs, `docs/06_decisions/*`, `docs/07_governance/*`)
- All 14 Generated Reports in `docs/08_reports/` (including the 7 new normalization outputs)
- `docs/canon/ui-surface-map.md`, `docs/architecture/ai-architecture.md`, `docs/ui/design-system.md`, `docs/workflows/*.md` (4 files), `services/ui-renderer/spec.md` — Supporting References not yet superseded
- `docs/developer/README.md`, `infra/docker/README.md`, `infra/deployment/README.md`, `infra/deployment/secrets/README.md`, root `README.md` — accurate Operational Artifacts
- `docs/tracking/delta-log.md`, `docs/tracking/research-analysis.md` — unique Historical Records with no successor
- All 26 service READMEs + `services/ui-renderer/README.md` — Operational Artifacts (local orientation), redundant with but not contradicting `SERVICE_CATALOG.md`
- All Phase E / Phase 2-frontend / Phase 4-testing / Phase 5-deployment placeholders (`apps/web/README.md`, `design/*/README.md`, `docs/02_frontend/README.md`, `docs/04_testing/README.md`, `docs/05_deployment/README.md`, `migrations/README.md`) — correctly represent not-yet-started work

---

## Recommended Follow-Up Items (New Findings, Not Yet Actioned)

These were surfaced during this normalization pass but fall outside the
"normalization analysis and recommendations" scope (the instruction file
explicitly prohibits implementation). They are recorded here for the user's
awareness and for a future phase/ADR to action:

1. **GAP-G10 (recommended)**: Reconcile canon's 9-role security model
   (`docs/canon/security-model.md` §2) with the code-verified 8-role model
   in `USER_ROLES_AND_PERMISSIONS.md` — different names and different
   role/responsibility coverage (C-2). Add to `ARCHITECTURAL_GAP_REGISTER.md`.
2. **DELTA-7 (recommended)**: Document the pagination model divergence —
   `docs/canon/api-standards.md` specifies cursor-based pagination;
   implemented API is page-based (C-3). Add to `docs/tracking/delta-log.md`.
3. **Architecture-direction escalation (C-4)**: Whether "designed to be
   extractable into independent deployables later" remains a live
   constraint, or was an abandoned Phase A aspiration, is a strategic
   question for the user — recommend raising per
   `docs/07_governance/DECISION_ESCALATION_MATRIX.md`.
4. **19 header-note edits**: This plan specifies the exact header note text
   for 19 documents (10 canon + 2 architecture + 1 product + 5 tracking + 1
   root doc-catalogue + 2 infra... note: prompts/README.md included = 19
   total across all sections above). Applying these edits is a small,
   mechanical follow-up task — each is a 1-3 line header addition with no
   content removal, consistent with rule 11 of `DOCUMENTATION
   NORMALIZATION AND AUTHORITY CONSOLIDATION.md`.

---

## Retirement Summary

| Disposition | Count | Documents |
|---|---|---|
| Retire | 11 | domain-model, service-map, event-catalog, api-standards, security-model, data-architecture, system-architecture, progress.md, doc-tracker.md, doc-catalogue.md, prompts/README.md |
| Retire (Partial) | 4 | api-standards (counted above), security-model (counted above), data-architecture (counted above), event-bus/cache READMEs (2) — *see note below* |
| Replace | 2 | workflow-catalog.md, product-overview.md |
| Archive | 2 | capability-matrix.md, gap-register.md |
| Keep | remainder | All authority docs, reports, not-yet-superseded supporting refs, operational artifacts |

Note: some documents appear in both "Retire" and "Retire (Partial)" framing
in the per-section tables above (e.g. `api-standards.md` is "Retire (Partial)"
— it is counted once in the 19-document total, not twice). Total documents
receiving a header-note edit under this plan: **19**.
