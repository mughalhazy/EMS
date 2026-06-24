Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-15
Owner: AI

# Conflict Analysis Report

> Identifies cases where two or more documents make **incompatible** claims
> about the same fact (as opposed to duplication, where documents simply
> overlap). For each conflict: the conflicting documents, the nature of the
> conflict, the authoritative resolution, and the action required to surface
> that resolution to readers of the non-authoritative document.

---

## C-1: "Tenant Isolation Middleware" vs. "Shared Base Repository"

- **Conflicting documents**:
  - `docs/architecture/system-architecture.md` §4.1, §7 — describes a "tenant isolation middleware" that injects `tenantId` into every request
  - `docs/canon/security-model.md` §3 — same "middleware" framing
  - `docs/01_backend/BACKEND_ARCHITECTURE.md` and Phase 1/2 governance docs — describe a "shared base repository" pattern (`TenantScopedRepository`/equivalent) where tenant scoping is enforced at the repository layer, not via middleware
- **Nature**: Architectural mechanism conflict — these are two different implementation patterns, not just terminology. A reader following `system-architecture.md` would look for tenant-scoping middleware in the request pipeline and not find it.
- **Authoritative resolution**: "Shared base repository" is correct — this was already established as **CA-004** during Phase 1 governance remediation and corrected in all Phase 1/2 docs (`BACKEND_ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `AUTH_AND_TENANCY_CONTRACT.md`). Only the Phase A canon/architecture docs were never updated.
- **Action**: Add a conflict header note to `docs/architecture/system-architecture.md` §4.1 and §7, and `docs/canon/security-model.md` §3: "Note: this section describes 'tenant isolation middleware'; the implemented pattern is a shared base repository (see CA-004, `docs/01_backend/BACKEND_ARCHITECTURE.md` §X, `docs/03_fullstack_contracts/AUTH_AND_TENANCY_CONTRACT.md`)." Both docs marked Retired per `DOCUMENT_RETIREMENT_PLAN.md`.

---

## C-2: Role/Permission Model — 9 Roles vs. 8 Roles

- **Conflicting documents**:
  - `docs/canon/security-model.md` §2 — defines 9 roles: `tenant_admin`, `organizer`, `finance`, `support`, `exhibitor`, `speaker`, `onsite_staff`, `attendee`, `platform_admin` (snake_case)
  - `docs/03_fullstack_contracts/USER_ROLES_AND_PERMISSIONS.md` — defines 8 roles: `Platform Admin`, `Tenant Admin`, `Event Manager`, `Content Manager`, `Finance Manager`, `Onsite Staff`, `Exhibitor`, `Attendee` (Title Case)
- **Nature**: Both a **naming** conflict (snake_case enum values vs. Title Case display names — though this part may be a presentation difference rather than a true conflict) and a **count/coverage** conflict:
  - canon's `organizer`, `support`, `speaker` have no direct equivalent in the 8-role list
  - the 8-role list's `Event Manager` and `Content Manager` have no direct equivalent in canon's 9-role list
  - This suggests a genuine remapping occurred during implementation, not just a renaming.
- **Authoritative resolution**: `USER_ROLES_AND_PERMISSIONS.md` is code-verified (Phase 2) and authoritative. The canon 9-role model represents original design intent that was restructured during implementation.
- **Action**: Add a conflict header note to `docs/canon/security-model.md` §2: "Note: this role table (9 roles) is superseded. The implemented role model has 8 roles with different names and a different role-to-responsibility mapping — see `docs/03_fullstack_contracts/USER_ROLES_AND_PERMISSIONS.md`. The mapping between this table and the implemented roles has not been formally documented — candidate for a future ADR if historical role-mapping rationale is needed." This is a **new finding** from this normalization phase — recommend adding to `ARCHITECTURAL_GAP_REGISTER.md` as a follow-up gap (suggested ID: GAP-G10) since it was not previously tracked.

---

## C-3: Pagination Model — Cursor-Based vs. Page-Based

- **Conflicting documents**:
  - `docs/canon/api-standards.md` — specifies cursor-based pagination (`?cursor=&limit=`, opaque cursor tokens) as the standard for all list endpoints
  - `docs/01_backend/API_CONTRACT.md` and `docs/03_fullstack_contracts/DATA_SHAPE_REGISTRY.md` — describe page-based pagination (`?page=&limit=`) as implemented across endpoints
- **Nature**: API contract conflict — a frontend client built against `api-standards.md` would send `cursor=` params that the actual API does not accept.
- **Authoritative resolution**: `API_CONTRACT.md` and `DATA_SHAPE_REGISTRY.md` are code-verified (Phase 2) and authoritative — page-based pagination is what is implemented.
- **Action**: Add a conflict header note to `docs/canon/api-standards.md` at its pagination section: "Note: this document specifies cursor-based pagination (`?cursor=&limit=`); the implemented API uses page-based pagination (`?page=&limit=`) — see `docs/01_backend/API_CONTRACT.md`. This is a code/spec divergence not previously captured in `delta-log.md` — recommend adding as DELTA-7." This is a **new finding** from this normalization phase.

---

## C-4: Architecture Framing — "Evolving into Microservices" vs. Stable Modular Monolith

- **Conflicting documents**:
  - `docs/architecture/system-architecture.md` §2 — "Modular monolith evolving into event-driven services... Phase 1 Batches 1-6 [are] designed to be extractable into independent deployables later"
  - `docs/06_decisions/ADR-001_PROJECT_FOUNDATION.md` and `docs/01_backend/BACKEND_ARCHITECTURE.md` — describe the modular monolith as the architecture, full stop, without an "evolving toward microservices" framing
- **Nature**: Strategic/architectural-direction conflict. This affects how future contributors interpret module boundaries — "designed for extraction later" implies stricter inter-module coupling discipline than a framing where the monolith is the intended end-state.
- **Authoritative resolution**: ADR-001 (the foundational decision record) does not describe a microservices migration path. Whether "designed to be extractable later" is (a) an abandoned aspiration, (b) an implicit ongoing constraint that just isn't restated, or (c) a misstatement, is **not resolvable from documentation alone** — it depends on intent that may only exist in the original author's/user's head.
- **Action**: Add a conflict header note to `docs/architecture/system-architecture.md` §2: "Note: this section frames the architecture as 'evolving toward independent deployables.' ADR-001 and BACKEND_ARCHITECTURE.md describe the modular monolith without this framing. Whether extraction-readiness remains a design constraint is unresolved — recommend escalation per `DECISION_ESCALATION_MATRIX.md` (architecture-direction questions are typically REQUIRES APPROVAL)." Flag as a question for the user/product owner rather than resolving unilaterally, since this is a forward-looking strategic question, not a code-vs-doc factual question.

---

## C-5: Campaign / AudienceSegment Module Ownership (GAP-G3)

- **Conflicting documents**:
  - `docs/canon/domain-model.md` and `docs/product/product-overview.md` §4 — place `Campaign`/`AudienceSegment` entities in the `engagement` service
  - Actual code and `docs/01_backend/SERVICE_CATALOG.md`/`DOMAIN_MODEL.md` — `Campaign`/`AudienceSegment` are implemented in `notification`
- **Nature**: Entity-ownership conflict — already identified as **GAP-G3** and **CA-002** during Phase 1 remediation; `PROJECT_CHARTER.md` and `DOMAIN_MODEL.md` already reflect the corrected (code-verified) ownership.
- **Authoritative resolution**: `notification` service owns `Campaign`/`AudienceSegment` (per code, `DOMAIN_MODEL.md`, `SERVICE_CATALOG.md`). This is already resolved in Phase 1/2 docs — the conflict only persists in the two Phase A documents listed above.
- **Action**: Both `docs/canon/domain-model.md` and `docs/product/product-overview.md` are already marked Retired per the duplication analysis (D-1, D-9). Add a specific conflict note to each pointing to GAP-G3/CA-002 resolution in `DOMAIN_MODEL.md`. No new action required beyond the retirement header notes.

---

## C-6: Entity Naming Deviations (GAP-G9, 16 entities)

- **Conflicting documents**:
  - `docs/canon/domain-model.md` — original entity names (design intent)
  - `docs/01_backend/DATABASE_SCHEMA.md` / `docs/00_authority/DOMAIN_MODEL.md` — actual entity names in code (16 entities renamed during implementation)
- **Nature**: Naming conflict across 16 entities — already cataloged as **GAP-G9** in `ARCHITECTURAL_GAP_REGISTER.md`, which recommends an ADR to formally reconcile/ratify the naming deviations.
- **Authoritative resolution**: Code-verified names in `DATABASE_SCHEMA.md`/`DOMAIN_MODEL.md` (00_authority) are authoritative for current state. The reconciliation ADR (tracked in `RECOMMENDED_ADR_ROADMAP.md`) is the mechanism for formally retiring the canon names — not yet written.
- **Action**: No new action — GAP-G9 already tracks this and an ADR is already on the roadmap. `docs/canon/domain-model.md` retirement note (D-1) should reference GAP-G9 explicitly so the connection between "why is this doc not deleted" and "what ADR will close this out" is discoverable.

---

## C-7: Schema Naming — `order` vs. `ordering` (DELTA-1)

- **Conflicting documents**:
  - `docs/canon/domain-model.md` / `docs/canon/data-architecture.md` — refer to an `order` schema/entity
  - `docs/01_backend/DATABASE_SCHEMA.md` and actual code — schema is named `ordering` (SQL reserved word collision)
- **Nature**: Naming conflict — already documented as **DELTA-1** in `delta-log.md` and **RA-5** in `research-analysis.md`.
- **Authoritative resolution**: `ordering` (code-verified). Already correctly resolved and explained in `delta-log.md`/`research-analysis.md`.
- **Action**: No new action — already documented with rationale. Retirement notes for `domain-model.md`/`data-architecture.md` (D-1, D-6) should cross-reference DELTA-1 alongside GAP-G9.

---

## C-8: Search Implementation — OpenSearch (4 indices) vs. Postgres ILIKE (5 entity types) (DELTA-2/DELTA-3)

- **Conflicting documents**:
  - `docs/canon/data-architecture.md` §4, `docs/canon/event-catalog.md` — describe OpenSearch with 4 indices as the search backend
  - Actual code, `docs/01_backend/SERVICE_CATALOG.md`, `docs/01_backend/DATABASE_SCHEMA.md` — `search` service implemented via Postgres ILIKE across 5 entity types
- **Nature**: Technology/implementation conflict — already documented as **DELTA-2** (ILIKE not OpenSearch) and **DELTA-3** (5th entity type, `exhibitor`) in `delta-log.md`, with migration rationale in **RA-4**.
- **Authoritative resolution**: Postgres ILIKE, 5 entity types (code-verified, current). OpenSearch remains a planned future migration per RA-4 ("swap-the-adapter, not a contract change").
- **Action**: No new action — already documented with rationale and forward-looking migration note. Retirement note for `data-architecture.md` §4 (D-6) should cross-reference DELTA-2/DELTA-3/RA-4.

---

## C-9: Rate Limiting — Specified vs. Unverified

- **Conflicting documents**:
  - `docs/canon/api-standards.md` §6 — specifies 100 req/min (authenticated) / 600 req/min Redis sliding-window rate limiting
  - `docs/08_reports/SECURITY_DISCOVERY_REPORT.md` (SEC-010) — notes rate limiting is **not verified** as implemented on auth endpoints
- **Nature**: This is not strictly a factual conflict (one document specifies a target, the other notes the target's implementation status is unverified) but is flagged because a reader could mistakenly treat `api-standards.md` §6 as describing current behavior.
- **Authoritative resolution**: `api-standards.md` §6 describes a **target design**, not verified current behavior. SEC-010 (Phase 2, `BACKEND_RISK_REGISTER.md`/`SECURITY_DISCOVERY_REPORT.md`) is the authoritative statement of current verification status.
- **Action**: Per D-4, `api-standards.md` §6 is retained as an "active design target" (not retired) but gets a header note: "Status: target design, not verified as implemented — see SEC-010 in `docs/08_reports/SECURITY_DISCOVERY_REPORT.md`." This closes the loop between the target spec and its implementation-status tracking.

---

## C-10: progress.md vs. Actual Implementation State (GAP-G1)

- **Conflicting documents**:
  - `docs/tracking/progress.md` — Phase C batch table marks Batches 8 (networking), 9 (interactive-engagement), 10 (ai-service) as "⬜ Not started"; "Outstanding work" section lists SSO, `services/integration`, and `apps/web` Dockerfile as not yet built
  - `docs/01_backend/SERVICE_CATALOG.md` and the 26 service READMEs (GAP-7) — all of the above except `apps/web` Dockerfile and Phase E are implemented
- **Nature**: Stale-status conflict — already identified as **GAP-G1** in `ARCHITECTURAL_GAP_REGISTER.md`.
- **Authoritative resolution**: `SERVICE_CATALOG.md` (code-verified, current state). `progress.md` reflects a snapshot from before Batches 8-10/SSO/integration were built.
- **Action**: No new action — GAP-G1 already tracks this. `progress.md` is marked Obsolete in `DOCUMENT_CLASSIFICATION_MATRIX.md`; `DOCUMENT_RETIREMENT_PLAN.md` formalizes the header note pointing to `SERVICE_CATALOG.md` and GAP-G1.

---

## Conflict Summary

| ID | Conflict | Authoritative Resolution | New Finding? | Action |
|---|---|---|---|---|
| C-1 | Tenant isolation middleware vs. base repository | Base repository (CA-004) | No — already resolved, canon docs not updated | Header note + retire |
| C-2 | 9 roles (canon) vs. 8 roles (code) | 8 roles, `USER_ROLES_AND_PERMISSIONS.md` | **Yes** — recommend GAP-G10 | Header note; recommend gap register entry |
| C-3 | Cursor pagination (canon) vs. page pagination (code) | Page-based, `API_CONTRACT.md` | **Yes** — recommend DELTA-7 | Header note; recommend delta-log entry |
| C-4 | "Evolving into microservices" framing vs. stable modular monolith | Unresolved — escalate | **Yes** | Header note; escalate per Decision Escalation Matrix |
| C-5 | Campaign/AudienceSegment ownership (engagement vs. notification) | `notification` (GAP-G3/CA-002) | No — already resolved | Header note only |
| C-6 | 16 entity naming deviations | Code-verified names (GAP-G9) | No — already tracked, ADR pending | Cross-reference only |
| C-7 | `order` vs `ordering` schema | `ordering` (DELTA-1/RA-5) | No — already documented | Cross-reference only |
| C-8 | OpenSearch (4 idx) vs Postgres ILIKE (5 types) | ILIKE, current; OpenSearch planned (DELTA-2/3, RA-4) | No — already documented | Cross-reference only |
| C-9 | Rate limiting spec vs. unverified | Target design, unverified (SEC-010) | No — already tracked | Header note linking to SEC-010 |
| C-10 | progress.md stale status (Batches 8-10/SSO/integration) | `SERVICE_CATALOG.md` (GAP-G1) | No — already tracked | Header note + obsolete marking |

**Total conflicts identified: 10.** Of these, 7 were already tracked by existing gap/delta registers (GAP-G1, GAP-G3, GAP-G9, DELTA-1, DELTA-2/3, SEC-010, CA-004/CA-002) and require only cross-reference header notes. **3 are new findings from this phase** (C-2, C-3, C-4) — recommended for addition to `ARCHITECTURAL_GAP_REGISTER.md` (as GAP-G10 and a new DELTA-7) and escalation (C-4) per `DECISION_ESCALATION_MATRIX.md`. No conflict requires modifying application code or the authoritative Phase 1/2 documents themselves — all resolutions favor the existing Phase 1/2 authority docs.
