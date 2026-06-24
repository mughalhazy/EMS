Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Duplication Analysis Report

> Identifies documents that define the same information domain more than
> once, classifies the nature of the duplication, and recommends a
> consolidation action. Per rule 11 of `DOCUMENTATION NORMALIZATION AND
> AUTHORITY CONSOLIDATION.md`, consolidation is achieved through
> status changes and cross-references — no document is deleted.

## Duplication Categories

| Category | Description |
|---|---|
| Full Duplicate | Two documents define the same facts with no material difference |
| Superseding Duplicate | A newer, code-verified document covers the same domain as an older design-intent document, with corrections |
| Partial Duplicate | Two documents overlap on part of their content but each also covers unique ground |
| Detail Duplicate | An older document provides more granular detail than its successor, on a subset of the domain |

---

## D-1: Entity / Domain Model

- **Documents**: `docs/canon/domain-model.md` (Phase A, design intent) vs. `docs/00_authority/DOMAIN_MODEL.md` (Phase 1, code-verified)
- **Category**: Superseding Duplicate
- **Overlap**: Both enumerate entities and which service owns each.
- **Difference**: `DOMAIN_MODEL.md` reflects actual code (post GAP-G9 corrections — 16 entities have different names than canon specified). `domain-model.md` reflects the original design intent before those naming decisions were made during implementation.
- **Recommendation**: Retain `DOMAIN_MODEL.md` as sole authority. Mark `docs/canon/domain-model.md` Retired with a header note: "Superseded by docs/00_authority/DOMAIN_MODEL.md. Retained as design-intent reference for GAP-G9 (entity naming reconciliation ADR)." Do not merge content — the naming divergence itself is the value of keeping both.

## D-2: Service Inventory / Service Map

- **Documents**: `docs/canon/service-map.md` (Phase A) vs. `docs/01_backend/SERVICE_CATALOG.md` (Phase 2, code-verified)
- **Category**: Superseding Duplicate
- **Overlap**: Both list all services, their responsibilities, and Kafka producer/consumer relationships.
- **Difference**: `SERVICE_CATALOG.md` is verified against actual controllers/entities/modules in code for all 26 services. `service-map.md` describes the originally planned 26-service topology including planned Kafka relationships that may not all be implemented yet.
- **Recommendation**: Retain `SERVICE_CATALOG.md` as sole authority for "what exists." Mark `docs/canon/service-map.md` Retired with a header note pointing to `SERVICE_CATALOG.md`, and flag its Kafka producer/consumer matrix as "design intent — cross-check against EVENT_AND_QUEUE_ARCHITECTURE.md for actual wiring" (this cross-check is a candidate for GAP-B14, not performed in this phase).

## D-3: Event / Kafka Topic Catalog

- **Documents**: `docs/canon/event-catalog.md` (Phase A, ~40 planned topics) vs. `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md` (Phase 2, 57 code-verified topics)
- **Category**: Superseding Duplicate
- **Overlap**: Both catalog Kafka topics, producers, and consumers.
- **Difference**: `EVENT_AND_QUEUE_ARCHITECTURE.md` is code-verified and larger (57 vs ~40 topics — more topics were added during implementation than canon anticipated). `event-catalog.md` §10 documents the `<domain>.<event>.<version>` naming convention and versioning policy (e.g., `order.paid.v2`), which is **not restated** in the Phase 2 doc.
- **Recommendation**: Retain `EVENT_AND_QUEUE_ARCHITECTURE.md` as sole authority for the topic list. Mark `docs/canon/event-catalog.md` Retired but add a cross-reference from `EVENT_AND_QUEUE_ARCHITECTURE.md` to `event-catalog.md` §10 for the naming/versioning convention, since that convention is still in effect and not duplicated elsewhere.

## D-4: API Standards / Conventions

- **Documents**: `docs/canon/api-standards.md` (Phase A) vs. `docs/01_backend/API_CONTRACT.md` + `ERROR_CONTRACT.md` + `VALIDATION_RULES.md` (Phase 2, code-verified, 3 documents)
- **Category**: Partial Duplicate (one Phase A doc split across three Phase 2 docs, with two sections un-superseded)
- **Overlap**: Endpoint conventions, error response shape, validation conventions.
- **Difference**: Phase 2 docs are code-verified and split by concern. `api-standards.md` §6 (rate limiting: 100/600 req/min Redis sliding window) and §10 (webhook HMAC signing + retry policy) describe target designs that are **not yet implemented** (per SEC-010 and GAP-G6/GAP-B6) — these sections have no Phase 2 equivalent.
- **Recommendation**: Mark `docs/canon/api-standards.md` Retired (Partial) for §1-5, §7-9 (superseded by the three Phase 2 docs). Explicitly flag §6 and §10 as "Active design target — not yet implemented, see GAP-B6/SEC-010 and GAP-G6" so they are not lost when the doc is otherwise retired. Note the pagination conflict separately in `CONFLICT_ANALYSIS_REPORT.md` C-3.

## D-5: Security Model / RBAC

- **Documents**: `docs/canon/security-model.md` (Phase A, 9 roles) vs. `docs/03_fullstack_contracts/AUTH_AND_TENANCY_CONTRACT.md` + `USER_ROLES_AND_PERMISSIONS.md` (Phase 2, code-verified, 8 roles)
- **Category**: Partial Duplicate (overlapping core RBAC content with a naming/count conflict, plus un-superseded sections)
- **Overlap**: Authentication mechanics, tenant isolation, role-based permission model.
- **Difference**: Phase 2 docs are code-verified (8 roles, 12 permissions, actual JWT claim shape). `security-model.md` §2 defines a different 9-role model that was never implemented as named. §4 (PII handling), §6 (rate limiting/abuse detection), §8 (secrets management/rotation) describe target designs without a Phase 2 equivalent.
- **Recommendation**: Mark `docs/canon/security-model.md` Retired (Partial) for §1-3, §5, §7 (superseded). Flag §2's role table as superseded with a conflict note (see `CONFLICT_ANALYSIS_REPORT.md` C-2 — `USER_ROLES_AND_PERMISSIONS.md` is authoritative). Flag §4/§6/§8 as "Active design target — not yet implemented."

## D-6: Data Architecture / Database Schema

- **Documents**: `docs/canon/data-architecture.md` (Phase A) vs. `docs/01_backend/DATABASE_SCHEMA.md` (Phase 2, code-verified)
- **Category**: Partial Duplicate
- **Overlap**: Per-service schema/table ownership, primary datastore choices.
- **Difference**: `DATABASE_SCHEMA.md` reflects actual Postgres schemas for all 21 implemented services (including the `order`→`ordering` rename, DELTA-1). `data-architecture.md` §4 (OpenSearch as the search datastore — actual implementation uses Postgres ILIKE per DELTA-2) and §5 (object storage bucket layout) are not yet implemented and have no Phase 2 equivalent.
- **Recommendation**: Mark `docs/canon/data-architecture.md` Retired (Partial) for schema-ownership content (superseded by `DATABASE_SCHEMA.md`). Flag §4 and §5 as "Active design target — see DELTA-2/RA-4 for search migration plan, and GAP-B-equivalent for object storage if not yet tracked."

## D-7: Workflow Catalog

- **Documents**: `docs/canon/workflow-catalog.md` (Phase A) vs. `docs/00_authority/PRODUCT_WORKFLOWS.md` (Phase 1)
- **Category**: Detail Duplicate
- **Overlap**: Both enumerate the same ~10 cross-service workflows (event lifecycle, registration, checkout, check-in, etc.).
- **Difference**: `PRODUCT_WORKFLOWS.md` is the corrected, governance-reviewed version (post CA-fixes). `workflow-catalog.md` predates those corrections but its per-step descriptions are not more detailed than `PRODUCT_WORKFLOWS.md` — the genuinely more-detailed step-by-step descriptions live in `docs/workflows/*.md` (4 files), which are separate documents not superseded by either.
- **Recommendation**: Mark `docs/canon/workflow-catalog.md` Retired — fully superseded by `PRODUCT_WORKFLOWS.md`, no unique content to preserve. `docs/workflows/*.md` (4 files) remain Supporting References to `PRODUCT_WORKFLOWS.md`, unaffected by this retirement.

## D-8: Capability / Scope Matrix

- **Documents**: `docs/canon/capability-matrix.md` (Phase A, T1-T4 delivery tiers) vs. `docs/00_authority/FEATURE_SCOPE.md` + `docs/00_authority/PROJECT_CHARTER.md` §4 (Phase 1)
- **Category**: Detail Duplicate
- **Overlap**: Both describe what capabilities exist and which release tier/batch they belong to.
- **Difference**: `FEATURE_SCOPE.md`/`PROJECT_CHARTER.md` are the corrected, code-aligned scope definitions. `capability-matrix.md`'s T1-T4 delivery-tier framing (a finer-grained planning construct than "batches") is not restated in Phase 1 docs but is purely historical planning context now that all batches are implemented.
- **Recommendation**: Mark `docs/canon/capability-matrix.md` Retired — historical planning context only, no longer needed for current-state understanding. No merge needed.

## D-9: Project Purpose / Product Overview

- **Documents**: `docs/product/product-overview.md` (Phase A) vs. `docs/00_authority/PROJECT_CHARTER.md` (Phase 1)
- **Category**: Superseding Duplicate
- **Overlap**: Vision, personas, lifecycle, module groupings.
- **Difference**: `PROJECT_CHARTER.md` corrected CA-002 (Campaign/AudienceSegment module placement, which `product-overview.md` §4 still attributes incorrectly).
- **Recommendation**: Mark `docs/product/product-overview.md` Retired — fully superseded, no unique content (its persona/lifecycle/module content is reproduced and corrected in `PROJECT_CHARTER.md`).

## D-10: Gap Tracking Registers

- **Documents**: `docs/tracking/gap-register.md` (GAP-1..7, Phase A-era tracking) vs. `docs/08_reports/ARCHITECTURAL_GAP_REGISTER.md` (GAP-G1..G9, Phase 1) + `docs/08_reports/BACKEND_GAP_REGISTER.md` (GAP-B1..B13, Phase 2)
- **Category**: Partial Duplicate (different gap sets, one fully resolved)
- **Overlap**: All three are "register of known gaps with resolution status" documents for the same codebase.
- **Difference**: `gap-register.md`'s GAP-1..7 are **all marked RESOLVED** as of 2026-06-14 — they describe gaps that existed before Batches 8-10 were built and have since been closed (e.g., GAP-2's Poll/QA/Survey/Connection entity overlap was resolved via the `networking`/`interactive-engagement` migration). `ARCHITECTURAL_GAP_REGISTER.md` (GAP-G1..G9) and `BACKEND_GAP_REGISTER.md` (GAP-B1..B13) are the **current, open** gap registers from Phase 1/2.
- **Recommendation**: Retain both Phase 1/2 registers as the active gap-tracking authority (combined, per `AUTHORITY_MAPPING_MATRIX.md`). Mark `docs/tracking/gap-register.md` Historical — it is not a duplicate in the "competing authority" sense (all its items are closed) but should be explicitly marked as closed-history so a reader does not mistake GAP-1..7 for open items. No merge needed since no GAP-1..7 item is open.

## D-11: Architecture Overview

- **Documents**: `docs/architecture/system-architecture.md` (Phase A) vs. `docs/01_backend/BACKEND_ARCHITECTURE.md` (Phase 2, code-verified)
- **Category**: Superseding Duplicate
- **Overlap**: Technology stack, service boundaries, data flow, multi-tenancy model, repository layout.
- **Difference**: `BACKEND_ARCHITECTURE.md` is code-verified (actual NestJS pipeline, actual base-repository tenant isolation pattern). `system-architecture.md` contains two specific terminology/framing conflicts addressed in `CONFLICT_ANALYSIS_REPORT.md` C-1 and C-4. Its §3 service-boundary ASCII diagram and §8 repository-layout reference remain broadly accurate as a visual aid.
- **Recommendation**: Mark `docs/canon/system-architecture.md` (i.e. `docs/architecture/system-architecture.md`) Retired with conflict notes for §4.1/§7 (terminology) and §2 (framing). Its §3 diagram may continue to serve as a quick visual reference, cross-referenced from `BACKEND_ARCHITECTURE.md`.

---

## Duplication Summary

| ID | Domain | Documents | Category | Action |
|---|---|---|---|---|
| D-1 | Entity/Domain Model | canon/domain-model.md ↔ 00_authority/DOMAIN_MODEL.md | Superseding | Retire canon, keep both for GAP-G9 |
| D-2 | Service Inventory | canon/service-map.md ↔ 01_backend/SERVICE_CATALOG.md | Superseding | Retire canon, flag Kafka matrix for GAP-B14 |
| D-3 | Event Catalog | canon/event-catalog.md ↔ 01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md | Superseding | Retire canon, cross-ref §10 naming convention |
| D-4 | API Standards | canon/api-standards.md ↔ API_CONTRACT/ERROR_CONTRACT/VALIDATION_RULES | Partial | Retire canon except §6/§10 (active targets) |
| D-5 | Security Model/RBAC | canon/security-model.md ↔ AUTH_AND_TENANCY_CONTRACT/USER_ROLES_AND_PERMISSIONS | Partial | Retire canon except §4/§6/§8 (active targets); §2 superseded with conflict note |
| D-6 | Data Architecture | canon/data-architecture.md ↔ DATABASE_SCHEMA.md | Partial | Retire canon except §4/§5 (active targets) |
| D-7 | Workflow Catalog | canon/workflow-catalog.md ↔ 00_authority/PRODUCT_WORKFLOWS.md | Detail | Retire canon, no unique content |
| D-8 | Capability Matrix | canon/capability-matrix.md ↔ FEATURE_SCOPE/PROJECT_CHARTER §4 | Detail | Retire canon, historical only |
| D-9 | Product Overview | product/product-overview.md ↔ PROJECT_CHARTER.md | Superseding | Retire, no unique content |
| D-10 | Gap Registers | tracking/gap-register.md ↔ ARCHITECTURAL_GAP_REGISTER + BACKEND_GAP_REGISTER | Partial | Mark Historical, no merge (all closed) |
| D-11 | Architecture Overview | architecture/system-architecture.md ↔ BACKEND_ARCHITECTURE.md | Superseding | Retire with conflict notes, §3 diagram retained as visual aid |

**Total duplications identified: 11.** All resolved via retirement + cross-reference, per Phase 3 rule 11 (no deletions). Detailed retirement actions are formalized in `DOCUMENT_RETIREMENT_PLAN.md`.
