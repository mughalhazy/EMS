Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Document Inventory

> Complete inventory of all 103 markdown files in the EMS repository
> (excluding `node_modules`). Generated 2026-06-15 as part of the
> Documentation Normalization and Authority Consolidation phase.
> Grouped by directory. The "Authority Layer" column uses the numbering
> in `docs/00_authority/` → `docs/08_reports/` (00 = highest, 08 = reports).

## Legend

| Col | Values |
|---|---|
| Class | Authority \| Supporting \| Report \| Historical \| Legacy \| Stub \| Scaffold |
| Layer | 00 = Critical Authority, 01 = Backend, 03 = Contracts, 06 = Decisions, 07 = Governance, 08 = Reports, Canon = legacy canon, Track = tracking |
| Status | Active \| Stale \| Stub \| Superseded |

---

## Governance Tier (docs/00_authority/, docs/06_decisions/, docs/07_governance/)

| # | File | Class | Layer | Status | Notes |
|---|---|---|---|---|---|
| 1 | `docs/00_authority/PROJECT_CHARTER.md` | Authority | 00 | Active | Primary project purpose/scope authority |
| 2 | `docs/00_authority/FEATURE_SCOPE.md` | Authority | 00 | Active | What is in/out of scope |
| 3 | `docs/00_authority/DOMAIN_MODEL.md` | Authority | 00 | Active | Entity ownership; code-verified (GAP-G9) |
| 4 | `docs/00_authority/PRODUCT_WORKFLOWS.md` | Authority | 00 | Active | All 10 workflows |
| 5 | `docs/00_authority/FULLSTACK_STITCHING_CONTRACT.md` | Supporting | 00 | Active | Cross-layer traceability (Phase 1 scope) |
| 6 | `docs/06_decisions/ADR-001_PROJECT_FOUNDATION.md` | Authority | 06 | Active | Foundational architectural decisions |
| 7 | `docs/07_governance/AI_OPERATING_CONTEXT.md` | Authority | 07 | Active | AI operating rules and constraints |
| 8 | `docs/07_governance/DECISION_ESCALATION_MATRIX.md` | Authority | 07 | Active | Decision autonomy/escalation rules |

---

## Backend Authority Tier (docs/01_backend/)

| # | File | Class | Layer | Status | Notes |
|---|---|---|---|---|---|
| 9 | `docs/01_backend/BACKEND_ARCHITECTURE.md` | Authority | 01 | Active | NestJS config, pipeline, infra services |
| 10 | `docs/01_backend/SERVICE_CATALOG.md` | Authority | 01 | Active | All 26 services; code-verified |
| 11 | `docs/01_backend/DATABASE_SCHEMA.md` | Authority | 01 | Active | All entities/tables; code-verified |
| 12 | `docs/01_backend/API_CONTRACT.md` | Authority | 01 | Active | All HTTP endpoints |
| 13 | `docs/01_backend/ERROR_CONTRACT.md` | Authority | 01 | Active | Error codes and response envelope |
| 14 | `docs/01_backend/VALIDATION_RULES.md` | Authority | 01 | Active | Global + per-service DTO validation |
| 15 | `docs/01_backend/INTEGRATION_CATALOG.md` | Authority | 01 | Active | Webhooks, SSO, AI, Redis, OpenSearch |
| 16 | `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md` | Authority | 01 | Active | 57 Kafka topics; code-verified |
| 17 | `docs/01_backend/README.md` | Stub | 01 | Active | Pointer to canon docs (Phase 1 stub) |

---

## Fullstack Contracts Tier (docs/03_fullstack_contracts/)

| # | File | Class | Layer | Status | Notes |
|---|---|---|---|---|---|
| 18 | `docs/03_fullstack_contracts/AUTH_AND_TENANCY_CONTRACT.md` | Authority | 03 | Active | Auth flows, JWT, tenant isolation |
| 19 | `docs/03_fullstack_contracts/USER_ROLES_AND_PERMISSIONS.md` | Authority | 03 | Active | 12 permissions, 8 roles; code-verified |
| 20 | `docs/03_fullstack_contracts/DATA_SHAPE_REGISTRY.md` | Authority | 03 | Active | Request/response data shapes |
| 21 | `docs/03_fullstack_contracts/VALIDATION_PARITY.md` | Authority | 03 | Active | Frontend-backend validation parity rules |
| 22 | `docs/03_fullstack_contracts/CONTRACT_VERSION_REGISTRY.md` | Authority | 03 | Active | API version and breaking change rules |
| 23 | `docs/03_fullstack_contracts/README.md` | Stub | 03 | Active | Pointer stub |

---

## Reports Tier (docs/08_reports/)

| # | File | Class | Layer | Status | Notes |
|---|---|---|---|---|---|
| 24 | `docs/08_reports/GOVERNANCE_IMPLEMENTATION_REPORT.md` | Report | 08 | Active | Phase 1 execution record |
| 25 | `docs/08_reports/DOCUMENTATION_COVERAGE_MATRIX.md` | Report | 08 | Stale | Created Phase 1; does not include Phase 2 docs |
| 26 | `docs/08_reports/ARCHITECTURAL_GAP_REGISTER.md` | Report | 08 | Active | GAP-G1 through GAP-G9 (Phase 1 gaps) |
| 27 | `docs/08_reports/RECOMMENDED_ADR_ROADMAP.md` | Report | 08 | Active | ADR-002 through ADR-008 roadmap |
| 28 | `docs/08_reports/GOVERNANCE_CONSISTENCY_AUDIT.md` | Report | 08 | Active | 22 CA findings (historical reference) |
| 29 | `docs/08_reports/REMEDIATION_REPORT.md` | Report | 08 | Active | All 22 CA findings resolved |
| 30 | `docs/08_reports/BACKEND_AUTHORITY_CAPTURE_REPORT.md` | Report | 08 | Active | Phase 2 execution record |
| 31 | `docs/08_reports/BACKEND_ARCHITECTURE_REPORT.md` | Report | 08 | Active | ADR-001 validation; architecture analysis |
| 32 | `docs/08_reports/DATABASE_DISCOVERY_REPORT.md` | Report | 08 | Active | DB technology and schema analysis |
| 33 | `docs/08_reports/API_DISCOVERY_REPORT.md` | Report | 08 | Active | Endpoint count and anomaly analysis |
| 34 | `docs/08_reports/SECURITY_DISCOVERY_REPORT.md` | Report | 08 | Active | 10 security findings (SEC-001..010) |
| 35 | `docs/08_reports/EVENT_DISCOVERY_REPORT.md` | Report | 08 | Active | Kafka event architecture analysis |
| 36 | `docs/08_reports/BACKEND_GAP_REGISTER.md` | Report | 08 | Active | GAP-B1 through GAP-B13 (Phase 2 gaps) |
| 37 | `docs/08_reports/BACKEND_RISK_REGISTER.md` | Report | 08 | Active | RISK-B1 through RISK-B10 |

---

## Phase A Legacy Canon (docs/canon/)

| # | File | Class | Layer | Status | Notes |
|---|---|---|---|---|---|
| 38 | `docs/canon/domain-model.md` | Legacy | Canon | Superseded | Superseded by DOMAIN_MODEL.md for entity authority; valuable as design intent; canon names differ from code (GAP-G9) |
| 39 | `docs/canon/service-map.md` | Legacy | Canon | Superseded | Superseded by SERVICE_CATALOG.md; valuable as Kafka consumer/producer intent |
| 40 | `docs/canon/event-catalog.md` | Legacy | Canon | Superseded | Superseded by EVENT_AND_QUEUE_ARCHITECTURE.md; design intent for topic naming |
| 41 | `docs/canon/api-standards.md` | Legacy | Canon | Stale | Partially superseded by API_CONTRACT.md, ERROR_CONTRACT.md, VALIDATION_RULES.md; conflicts on pagination model and role names |
| 42 | `docs/canon/security-model.md` | Legacy | Canon | Stale | Partially superseded by AUTH_AND_TENANCY_CONTRACT.md, USER_ROLES_AND_PERMISSIONS.md; role name conflicts with code |
| 43 | `docs/canon/data-architecture.md` | Legacy | Canon | Stale | Partially superseded by DATABASE_SCHEMA.md; DELTA-1 (order→ordering schema) and DELTA-2 (ILIKE not OpenSearch) deviate |
| 44 | `docs/canon/workflow-catalog.md` | Legacy | Canon | Superseded | Superseded by PRODUCT_WORKFLOWS.md; more detailed but not code-verified |
| 45 | `docs/canon/capability-matrix.md` | Legacy | Canon | Superseded | Superseded by FEATURE_SCOPE.md; delivery tier model still useful as historical context |
| 46 | `docs/canon/read-model-catalog.md` | Legacy | Canon | Stale | Partially superseded by SERVICE_CATALOG.md (analytics section); DELTA-3 (5th entity type) not applied |
| 47 | `docs/canon/ui-surface-map.md` | Supporting | Canon | Active | Not yet superseded; Phase E frontend authority (no Phase E docs exist yet) |

---

## Phase A Legacy Architecture (docs/architecture/)

| # | File | Class | Layer | Status | Notes |
|---|---|---|---|---|---|
| 48 | `docs/architecture/system-architecture.md` | Legacy | Canon | Superseded | Superseded by BACKEND_ARCHITECTURE.md; contains conflicts (tenant isolation middleware vs base repository; "evolving into microservices" framing vs modular monolith) |
| 49 | `docs/architecture/ai-architecture.md` | Supporting | Canon | Active | Not yet superseded; AI capability design authority; GAP-G7 (not cross-checked against code) |

---

## Phase A Workflow Details (docs/workflows/)

| # | File | Class | Layer | Status | Notes |
|---|---|---|---|---|---|
| 50 | `docs/workflows/event-lifecycle.md` | Supporting | Canon | Active | Detailed expansion of PRODUCT_WORKFLOWS §2; not superseded |
| 51 | `docs/workflows/checkout-flow.md` | Supporting | Canon | Active | Detailed expansion of PRODUCT_WORKFLOWS §5-6; not superseded |
| 52 | `docs/workflows/registration-flow.md` | Supporting | Canon | Active | Detailed expansion of PRODUCT_WORKFLOWS §8; not superseded |
| 53 | `docs/workflows/checkin-flow.md` | Supporting | Canon | Active | Detailed expansion of PRODUCT_WORKFLOWS §9; not superseded |

---

## Phase A Product/UI/Developer

| # | File | Class | Layer | Status | Notes |
|---|---|---|---|---|---|
| 54 | `docs/product/product-overview.md` | Legacy | Canon | Superseded | Superseded by PROJECT_CHARTER.md; valuable historical context |
| 55 | `docs/ui/design-system.md` | Supporting | Canon | Active | Not yet superseded; Phase E design authority |
| 56 | `docs/developer/README.md` | Supporting | Ops | Active | Local setup, build, CI, health checks; current |

---

## Phase A Tracking Docs (docs/tracking/)

| # | File | Class | Layer | Status | Notes |
|---|---|---|---|---|---|
| 57 | `docs/tracking/progress.md` | Historical | Track | Stale | Last updated 2026-06-13; marks Batches 8-10 as not started (they are implemented); stale (GAP-G1) |
| 58 | `docs/tracking/gap-register.md` | Historical | Track | Stale | GAP-1 through GAP-7; all marked RESOLVED as of 2026-06-14; largely superseded by ARCHITECTURAL_GAP_REGISTER.md + BACKEND_GAP_REGISTER.md |
| 59 | `docs/tracking/delta-log.md` | Historical | Track | Active | DELTA-1 through DELTA-6; valuable architectural decision history; no newer equivalent |
| 60 | `docs/tracking/doc-tracker.md` | Historical | Track | Stale | Last updated 2026-06-13; does not reflect Phase 1/2 governance docs; accuracy assessment is now outdated |
| 61 | `docs/tracking/research-analysis.md` | Historical | Track | Active | RA-1 through RA-5; valuable build rationale; no newer equivalent |

---

## Doc Catalogue (root)

| # | File | Class | Layer | Status | Notes |
|---|---|---|---|---|---|
| 62 | `doc-catalogue.md` | Historical | Track | Stale | Indexed 57 docs as of 2026-06-13; repo now has 103 docs; does not include any Phase 1/2 governance docs |

---

## Infra READMEs

| # | File | Class | Layer | Status | Notes |
|---|---|---|---|---|---|
| 63 | `infra/event-bus/README.md` | Supporting | Infra | Stale | README says "SCAFFOLD"; partially updated per GAP-1/GAP-7; superseded by EVENT_AND_QUEUE_ARCHITECTURE.md for event authority |
| 64 | `infra/cache/README.md` | Supporting | Infra | Stale | README says "SCAFFOLD"; partially updated; superseded by BACKEND_ARCHITECTURE.md §7 for Redis details |
| 65 | `infra/docker/README.md` | Supporting | Infra | Active | Docker compose setup; current |
| 66 | `infra/deployment/README.md` | Supporting | Infra | Active | Env config templates; current |
| 67 | `infra/deployment/secrets/README.md` | Supporting | Infra | Active | Secrets convention; current |

---

## Misc READMEs

| # | File | Class | Layer | Status | Notes |
|---|---|---|---|---|---|
| 68 | `README.md` (root) | Supporting | Root | Active | Repo structure guide; still accurate |
| 69 | `migrations/README.md` | Stub | Infra | Active | Migration placeholder |
| 70 | `prompts/README.md` | Historical | Track | Stale | Lists gap-fill prompts; gaps now resolved (Batches 8-10 implemented) |
| 71 | `apps/web/README.md` | Scaffold | Phase E | Active | Phase E frontend scope; correctly aspirational |
| 72 | `design/tokens/README.md` | Scaffold | Phase E | Stub | Phase E TASK 02 |
| 73 | `design/components/README.md` | Scaffold | Phase E | Stub | Phase E TASK 04 |
| 74 | `design/wireframes/README.md` | Scaffold | Phase E | Stub | Phase E TASK 05 |
| 75 | `docs/02_frontend/README.md` | Stub | 02 | Active | Phase E placeholder |
| 76 | `docs/04_testing/README.md` | Stub | 04 | Active | Testing phase placeholder |
| 77 | `docs/05_deployment/README.md` | Stub | 05 | Active | Deployment phase placeholder |
| 78 | `services/ui-renderer/spec.md` | Supporting | Phase E | Active | UI renderer contract spec; Phase E authority |

---

## Service READMEs (26 services + ui-renderer)

All service READMEs follow the same template: Status line, Batch, V1/V2 source pointers, key entities.

| # | File | Class | Status | Notes |
|---|---|---|---|---|
| 79–104 | `services/*/README.md` (26 files) | Scaffold | Mixed | See table below |

| Batch | Services | README Status |
|---|---|---|
| 1 | auth, tenant, rbac, audit | Implemented (Batch 1) per GAP-7 |
| 2 | event, agenda, speaker, exhibitor, attendee | Implemented (Batch 2) per GAP-7 |
| 3 | registration, onsite | Implemented (Batch 3) per GAP-7 |
| 4 | ticketing, pricing, inventory, order, payment, fulfillment | Implemented (Batch 4) per GAP-7 |
| 5 | notification, engagement | Implemented (Batch 5) per GAP-7; engagement is near-empty stub |
| 6 | analytics, search | Implemented (Batch 6) per GAP-7 |
| 8 | networking | Implemented (gap-fill) per GAP-7 |
| 9 | interactive-engagement | Implemented (gap-fill) per GAP-7 |
| 10 | ai-service | Implemented (gap-fill) per GAP-7 |
| Cross | integration | Implemented per GAP-3/GAP-7 |
| Phase E | ui-renderer | SCAFFOLD — Phase E, not started |

---

## Summary Counts

| Class | Count |
|---|---|
| Authority Documents | 20 |
| Supporting References | 17 |
| Generated Reports | 14 |
| Legacy Documents | 11 |
| Historical Records | 7 |
| Scaffold/Stub | 34 |
| **Total** | **103** |
