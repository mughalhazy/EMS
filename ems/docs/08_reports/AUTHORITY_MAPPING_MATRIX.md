Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Authority Mapping Matrix

> For every information domain in the EMS repository, identifies the single
> Authoritative Document plus Supporting, Legacy, and Retired documents.
> Built from `DOCUMENT_INVENTORY.md` and `DOCUMENT_CLASSIFICATION_MATRIX.md`.
> After this phase, no domain should have more than one Authoritative Document.

| Domain | Authoritative Document | Supporting Documents | Legacy Documents | Retired Documents |
|---|---|---|---|---|
| **Project Purpose & Scope** | `docs/00_authority/PROJECT_CHARTER.md` | `docs/00_authority/FEATURE_SCOPE.md` | — | `docs/product/product-overview.md` (CA-002 Campaign/engagement error corrected in CHARTER) |
| **Architecture (overall)** | `docs/01_backend/BACKEND_ARCHITECTURE.md` | `docs/06_decisions/ADR-001_PROJECT_FOUNDATION.md` | `docs/architecture/ai-architecture.md` (AI subsystem detail, GAP-G7 not cross-checked) | `docs/architecture/system-architecture.md` (terminology conflicts: tenant isolation middleware, "evolving into microservices") |
| **Backend Service Inventory** | `docs/01_backend/SERVICE_CATALOG.md` | `services/*/README.md` (26 files — local orientation, V1/V2 source pointers) | — | `docs/canon/service-map.md` (Kafka producer/consumer design intent retained as input to future ADR) |
| **Database / Entities** | `docs/01_backend/DATABASE_SCHEMA.md` | `docs/00_authority/DOMAIN_MODEL.md` (ownership view) | `docs/canon/data-architecture.md` (§4 OpenSearch target, §5 object storage layout — not yet implemented) | `docs/canon/domain-model.md` (16 entity-naming deviations, GAP-G9 — pending ADR), `docs/canon/read-model-catalog.md` (10-model breakdown feeds GAP-B12) |
| **API Contracts (endpoints)** | `docs/01_backend/API_CONTRACT.md` | `docs/03_fullstack_contracts/DATA_SHAPE_REGISTRY.md`, `docs/03_fullstack_contracts/CONTRACT_VERSION_REGISTRY.md` | `docs/canon/api-standards.md` (§6 rate limiting, §10 webhooks — target design for GAP-B6/GAP-G6) | — |
| **Error Handling** | `docs/01_backend/ERROR_CONTRACT.md` | — | — | `docs/canon/api-standards.md` §3 (error table superseded) |
| **Validation Rules** | `docs/01_backend/VALIDATION_RULES.md` | `docs/03_fullstack_contracts/VALIDATION_PARITY.md` | — | `docs/canon/api-standards.md` §9 (superseded) |
| **Integrations (webhooks, SSO, AI, Redis, OpenSearch)** | `docs/01_backend/INTEGRATION_CATALOG.md` | `docs/architecture/ai-architecture.md` (AI integration detail) | `docs/canon/api-standards.md` §10 (webhook HMAC/retry — target design, GAP-G6) | — |
| **Events / Kafka Topics** | `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md` | `docs/workflows/*.md` (4 files — workflow-level event sequencing detail) | `docs/canon/event-catalog.md` (topic naming/versioning rationale §10 retained) | — |
| **Permissions & Roles (RBAC)** | `docs/03_fullstack_contracts/USER_ROLES_AND_PERMISSIONS.md` | — | `docs/canon/security-model.md` §4/§6/§8 (PII handling, abuse, secrets — target design) | `docs/canon/security-model.md` §2 (role table superseded — 9 roles vs 8 roles conflict, see CONFLICT_ANALYSIS_REPORT.md) |
| **Authentication & Tenancy** | `docs/03_fullstack_contracts/AUTH_AND_TENANCY_CONTRACT.md` | — | — | `docs/canon/security-model.md` §1-3 (superseded) |
| **Workflows (cross-service)** | `docs/00_authority/PRODUCT_WORKFLOWS.md` | `docs/workflows/event-lifecycle.md`, `checkout-flow.md`, `registration-flow.md`, `checkin-flow.md` (4 detail docs) | — | `docs/canon/workflow-catalog.md` (superseded, less detailed) |
| **Governance / AI Operating Rules** | `docs/07_governance/AI_OPERATING_CONTEXT.md` | `docs/07_governance/DECISION_ESCALATION_MATRIX.md`, `docs/00_authority/FULLSTACK_STITCHING_CONTRACT.md` | — | — |
| **Decision Records (ADRs)** | `docs/06_decisions/ADR-001_PROJECT_FOUNDATION.md` | `docs/08_reports/RECOMMENDED_ADR_ROADMAP.md` (roadmap for ADR-002..008) | — | — |
| **Risk Management** | `docs/08_reports/BACKEND_RISK_REGISTER.md` (RISK-B1..B10) | `docs/08_reports/SECURITY_DISCOVERY_REPORT.md` (SEC-001..010) | — | — |
| **Gap Registers** | `docs/08_reports/ARCHITECTURAL_GAP_REGISTER.md` (GAP-G1..G9) + `docs/08_reports/BACKEND_GAP_REGISTER.md` (GAP-B1..B13) | — | `docs/tracking/gap-register.md` (GAP-1..7, all resolved 2026-06-14) | — |
| **Documentation Inventory / Coverage** | `docs/08_reports/DOCUMENT_INVENTORY.md` (this phase) | `docs/08_reports/DOCUMENT_CLASSIFICATION_MATRIX.md` | — | `doc-catalogue.md` (57 of 103 docs, predates Phase 1/2), `docs/08_reports/DOCUMENTATION_COVERAGE_MATRIX.md` (Phase 1 only, see DOCUMENT_RETIREMENT_PLAN.md) |
| **Build/Implementation Status** | `docs/01_backend/SERVICE_CATALOG.md` | `docs/08_reports/BACKEND_AUTHORITY_CAPTURE_REPORT.md` | — | `docs/tracking/progress.md` (Batches 8-10/SSO/integration incorrectly marked "Not started" — GAP-G1), `prompts/README.md` (same issue) |
| **Architectural/Build Decision Rationale** | `docs/tracking/research-analysis.md` (RA-1..5) + `docs/tracking/delta-log.md` (DELTA-1..6) | — | — | — *(no Phase 1/2 equivalent exists; these remain authoritative for build-tooling and spec-deviation rationale)* |
| **Operations — Local Dev / Build / CI** | `docs/developer/README.md` | `infra/docker/README.md`, `infra/deployment/README.md`, `infra/deployment/secrets/README.md` | — | — |
| **Operations — Event Bus / Cache Infra** | `docs/01_backend/BACKEND_ARCHITECTURE.md` §6-7 | `infra/event-bus/README.md`, `infra/cache/README.md` (orientation only) | — | — |
| **Testing** | *(none — Phase not started)* | — | — | — *(docs/04_testing/README.md is a placeholder; test coverage gap tracked as RISK-B finding in BACKEND_RISK_REGISTER.md)* |
| **Deployment** | *(none — Phase not started)* | `infra/deployment/README.md`, `infra/deployment/secrets/README.md` (procedural only) | — | — *(docs/05_deployment/README.md is a placeholder)* |
| **Frontend / UI Surfaces** | *(none — Phase E not started)* | `docs/canon/ui-surface-map.md`, `docs/ui/design-system.md`, `services/ui-renderer/spec.md` | — | — *(docs/02_frontend/README.md is a placeholder; these three remain the only frontend design references until Phase E)* |
| **Capability Tiers / Delivery Phasing** | `docs/00_authority/FEATURE_SCOPE.md` | — | `docs/canon/capability-matrix.md` (T1-T4 delivery tier framing retained as historical planning context) | — |
| **Repository Layout / Skeleton** | `README.md` (root) | — | — | — *(still accurate, no supersession)* |

---

## Domains With No Current Authority (Gaps)

These domains have **no authoritative document yet** because the relevant
phase has not started. This is expected and is **not** a normalization defect
— it is recorded here so Frontend/Testing/Deployment Authority Capture phases
know which domains they must establish authority for:

| Domain | Current State | Phase That Will Establish Authority |
|---|---|---|
| Testing strategy/coverage | `docs/04_testing/README.md` placeholder; RISK-B findings note 4/26 services have tests | Testing Authority Capture |
| Deployment / infra-as-code | `docs/05_deployment/README.md` placeholder; only env templates and Docker Compose exist | Deployment Authority Capture |
| Frontend architecture/routes/components | `docs/02_frontend/README.md` placeholder; `ui-surface-map.md`/`design-system.md`/`spec.md` are Phase A/E design intent only | Frontend Authority Capture |

---

## Domains Resolved by This Phase

All domains above have exactly **one** authoritative document except the
three gap domains (Testing, Deployment, Frontend), which correctly have none
because those phases have not run. Two domains required new resolution work
during this phase, documented in `CONFLICT_ANALYSIS_REPORT.md`:

1. **Permissions & Roles** — `docs/canon/security-model.md` §2 (9 roles) vs.
   `USER_ROLES_AND_PERMISSIONS.md` (8 roles) — resolved in favor of the
   code-verified document; canon role table marked Retired.
2. **Architecture framing** — `system-architecture.md`'s "modular monolith
   evolving into event-driven services" vs. `BACKEND_ARCHITECTURE.md`/ADR-001's
   stable modular-monolith framing — resolved in favor of ADR-001; canon doc
   marked Retired with conflict note.
