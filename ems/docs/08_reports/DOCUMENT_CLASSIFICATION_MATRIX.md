Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Document Classification Matrix

> Classifies every document in `DOCUMENT_INVENTORY.md` into one of the
> 9 categories defined by `DOCUMENTATION NORMALIZATION AND AUTHORITY
> CONSOLIDATION.md`, with justification. This matrix feeds
> `AUTHORITY_MAPPING_MATRIX.md` and `DOCUMENT_RETIREMENT_PLAN.md`.

## Classification Categories

| Category | Definition |
|---|---|
| Authority Document | The single source of truth for an information domain |
| Supporting Reference | Adds detail/context to an authority document without competing for authority |
| Operational Artifact | Describes how to run/build/deploy — procedural, not architectural |
| Historical Record | Preserves rationale/decisions for traceability; not consulted for current state |
| Generated Report | Output of an analysis/audit pass; point-in-time findings |
| Working Draft | Incomplete/placeholder content awaiting future work |
| Retired Document | Formally superseded; kept only for historical reference |
| Duplicate Document | Re-states another document's authority without adding value |
| Obsolete Document | No longer relevant; content describes a state that never existed or no longer applies |

---

## docs/00_authority/ (Governance Tier)

| Document | Classification | Justification |
|---|---|---|
| `PROJECT_CHARTER.md` | Authority Document | Defines project purpose, personas, lifecycle, module batches — the canonical project definition, code-corrected during Phase 1 remediation |
| `FEATURE_SCOPE.md` | Authority Document | Defines what is in/out of scope for all 26 services — single source for scope boundaries |
| `DOMAIN_MODEL.md` | Authority Document | Entity ownership per service, code-verified (GAP-G9 corrections applied) — supersedes canon `domain-model.md` |
| `PRODUCT_WORKFLOWS.md` | Authority Document | All 10 cross-service workflows — supersedes canon `workflow-catalog.md` |
| `FULLSTACK_STITCHING_CONTRACT.md` | Supporting Reference | Provides Feature→Workflow→Entity→...→Deployment traceability; depends on and references the 4 authority docs above plus backend docs; does not itself define new facts |

## docs/06_decisions/ + docs/07_governance/

| Document | Classification | Justification |
|---|---|---|
| `ADR-001_PROJECT_FOUNDATION.md` | Authority Document | The architectural decision record establishing the 6 core principles; all other docs defer to it for "why" |
| `AI_OPERATING_CONTEXT.md` | Authority Document | Defines how AI agents must operate in this repo — frozen decisions, required validations |
| `DECISION_ESCALATION_MATRIX.md` | Authority Document | Defines AUTONOMOUS / REQUIRES APPROVAL / PROHIBITED — referenced by every other governance document |

## docs/01_backend/ (Backend Authority Tier)

| Document | Classification | Justification |
|---|---|---|
| `BACKEND_ARCHITECTURE.md` | Authority Document | Code-verified runtime configuration — supersedes `docs/architecture/system-architecture.md` |
| `SERVICE_CATALOG.md` | Authority Document | Code-verified service/entity/controller inventory — supersedes `docs/canon/service-map.md` |
| `DATABASE_SCHEMA.md` | Authority Document | Code-verified entity/table definitions — supersedes `docs/canon/domain-model.md` §database aspects and `docs/canon/data-architecture.md` §1 |
| `API_CONTRACT.md` | Authority Document | Code-verified endpoint catalog — no prior equivalent existed at this granularity |
| `ERROR_CONTRACT.md` | Authority Document | Code-verified error envelope — supersedes `docs/canon/api-standards.md` §3 error table |
| `VALIDATION_RULES.md` | Authority Document | Code-verified DTO validation patterns — supersedes `docs/canon/api-standards.md` §9 |
| `INTEGRATION_CATALOG.md` | Authority Document | Code-verified integration inventory — supersedes `docs/canon/api-standards.md` §10 (webhooks) |
| `EVENT_AND_QUEUE_ARCHITECTURE.md` | Authority Document | Code-verified 57-topic Kafka catalog — supersedes `docs/canon/event-catalog.md` |
| `README.md` (01_backend) | Working Draft | Phase 1 stub pointing to canon docs; now redundant given 8 authority docs exist in same directory — candidate for retirement/rewrite |

## docs/03_fullstack_contracts/ (Contracts Tier)

| Document | Classification | Justification |
|---|---|---|
| `AUTH_AND_TENANCY_CONTRACT.md` | Authority Document | Code-verified auth/tenancy mechanics — supersedes `docs/canon/security-model.md` §1-3 |
| `USER_ROLES_AND_PERMISSIONS.md` | Authority Document | Code-verified 12 permissions / 8 roles — supersedes `docs/canon/security-model.md` §2 default-roles table |
| `DATA_SHAPE_REGISTRY.md` | Authority Document | First documentation of request/response shapes — no prior equivalent |
| `VALIDATION_PARITY.md` | Authority Document | First documentation of frontend/backend validation parity rules — no prior equivalent |
| `CONTRACT_VERSION_REGISTRY.md` | Authority Document | First documentation of API versioning/change-classification policy — no prior equivalent |
| `README.md` (03_fullstack_contracts) | Working Draft | Phase 1 stub; now redundant given 5 authority docs exist in same directory |

## docs/08_reports/ (Reports Tier)

| Document | Classification | Justification |
|---|---|---|
| `GOVERNANCE_IMPLEMENTATION_REPORT.md` | Generated Report | Phase 1 execution record — point-in-time |
| `DOCUMENTATION_COVERAGE_MATRIX.md` | Generated Report (Stale) | Phase 1 coverage snapshot; does not include Phase 2 docs — needs refresh or retirement in favor of `DOCUMENT_INVENTORY.md` |
| `ARCHITECTURAL_GAP_REGISTER.md` | Generated Report | GAP-G1..G9 — active register, still referenced |
| `RECOMMENDED_ADR_ROADMAP.md` | Generated Report | ADR-002..008 roadmap — active planning reference |
| `GOVERNANCE_CONSISTENCY_AUDIT.md` | Historical Record | 22 CA findings, all resolved per `REMEDIATION_REPORT.md` — kept for audit trail |
| `REMEDIATION_REPORT.md` | Historical Record | Records how CA findings were fixed — audit trail, not consulted for current state |
| `BACKEND_AUTHORITY_CAPTURE_REPORT.md` | Generated Report | Phase 2 execution record |
| `BACKEND_ARCHITECTURE_REPORT.md` | Generated Report | ADR-001 validation analysis |
| `DATABASE_DISCOVERY_REPORT.md` | Generated Report | DB technology/schema analysis |
| `API_DISCOVERY_REPORT.md` | Generated Report | Endpoint/anomaly analysis |
| `SECURITY_DISCOVERY_REPORT.md` | Generated Report | SEC-001..010 — active register |
| `EVENT_DISCOVERY_REPORT.md` | Generated Report | Kafka architecture analysis |
| `BACKEND_GAP_REGISTER.md` | Generated Report | GAP-B1..B13 — active register |
| `BACKEND_RISK_REGISTER.md` | Generated Report | RISK-B1..B10 — active register |

## docs/canon/ (Phase A Legacy)

| Document | Classification | Justification |
|---|---|---|
| `domain-model.md` | Retired Document | Entity authority moved to `00_authority/DOMAIN_MODEL.md` (code-verified, 16 naming corrections applied per GAP-G9). Canon doc retains value as **original design intent** for entity naming — should be marked Retired with a forward reference, not deleted, since GAP-G9 reconciliation (canon vs. code) is still an open ADR decision |
| `service-map.md` | Retired Document | Service authority moved to `01_backend/SERVICE_CATALOG.md` (code-verified). Canon doc retains value for Kafka producer/consumer **design intent** vs. `EVENT_AND_QUEUE_ARCHITECTURE.md`'s **verified** relationships |
| `event-catalog.md` | Retired Document | Topic authority moved to `01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md` (57 topics, code-verified). Canon doc retains value for topic naming convention rationale (§10) and versioning policy (`order.paid.v2`) not restated elsewhere |
| `api-standards.md` | Retired Document (Partial) | API conventions superseded by `API_CONTRACT.md`/`ERROR_CONTRACT.md`/`VALIDATION_RULES.md`. However §6 (rate limiting 100/600 req/min) and §10 (webhook HMAC/retry policy) describe **target design not yet implemented** — these sections have ongoing value as a design target for GAP-B6/GAP-G6 remediation |
| `security-model.md` | Retired Document (Partial) | RBAC/auth superseded by `AUTH_AND_TENANCY_CONTRACT.md`/`USER_ROLES_AND_PERMISSIONS.md`. §4 (PII handling), §6 (rate limiting/abuse), §8 (secrets management) describe target design not yet fully implemented — ongoing value as design target |
| `data-architecture.md` | Retired Document (Partial) | DB schema superseded by `DATABASE_SCHEMA.md`. §4 (OpenSearch target architecture) and §5 (object storage bucket layout) describe target design not yet fully implemented |
| `workflow-catalog.md` | Retired Document | Workflow authority moved to `00_authority/PRODUCT_WORKFLOWS.md` |
| `capability-matrix.md` | Retired Document | Scope/tier authority moved to `00_authority/FEATURE_SCOPE.md` + `PROJECT_CHARTER.md` §4; delivery-tier framing (T1-T4) retained as historical planning context |
| `read-model-catalog.md` | Retired Document (Partial) | Analytics read-model authority moved to `01_backend/SERVICE_CATALOG.md` (though analytics entity names are TBD per GAP-B12). Read-model catalog's 10-model breakdown is more detailed than current authority docs and should inform GAP-B12 resolution |
| `ui-surface-map.md` | Supporting Reference | Not yet superseded — no Phase E frontend authority docs exist. Remains the only UI route map; will become Supporting Reference to a future `02_frontend` authority doc |

## docs/architecture/ (Phase A Legacy)

| Document | Classification | Justification |
|---|---|---|
| `system-architecture.md` | Retired Document | Superseded by `01_backend/BACKEND_ARCHITECTURE.md` (code-verified). Contains 2 conflicts with current state: "tenant isolation middleware" (should be "base repository" per CA-004) and "modular monolith evolving into event-driven services" framing (current ADR-001 treats modular monolith as the stable architecture, not a transitional state) |
| `ai-architecture.md` | Supporting Reference | Not yet superseded — `01_backend/SERVICE_CATALOG.md` and `INTEGRATION_CATALOG.md` only summarize `ai-service`; this remains the detailed AI design authority (GAP-G7: not cross-checked against code) |

## docs/workflows/ (Phase A Legacy)

| Document | Classification | Justification |
|---|---|---|
| `event-lifecycle.md` | Supporting Reference | Detailed expansion of `PRODUCT_WORKFLOWS.md` §2; no code-verified equivalent exists at this detail level; not superseded |
| `checkout-flow.md` | Supporting Reference | Detailed expansion of `PRODUCT_WORKFLOWS.md` §5-6; not superseded |
| `registration-flow.md` | Supporting Reference | Detailed expansion of `PRODUCT_WORKFLOWS.md` §8; not superseded |
| `checkin-flow.md` | Supporting Reference | Detailed expansion of `PRODUCT_WORKFLOWS.md` §9; not superseded |

## docs/product/, docs/ui/, docs/developer/

| Document | Classification | Justification |
|---|---|---|
| `product/product-overview.md` | Retired Document | Superseded by `00_authority/PROJECT_CHARTER.md` (which corrected the Campaign/engagement placement error CA-002 that this doc still contains) |
| `ui/design-system.md` | Supporting Reference | Not yet superseded — Phase E design authority; `design/tokens/` etc. are not yet populated (GAP-4) |
| `developer/README.md` | Operational Artifact | Build/run/CI/health-check procedures — procedural, not architectural; remains accurate |

## docs/tracking/ (Phase A Legacy)

| Document | Classification | Justification |
|---|---|---|
| `progress.md` | Obsolete Document | Marks Batches 8-10, SSO, integration as "Not started" — these are all implemented. Actively misleading (GAP-G1). Superseded by `01_backend/SERVICE_CATALOG.md` for current state |
| `gap-register.md` | Historical Record | GAP-1..7 all marked RESOLVED 2026-06-14 — valuable resolution history, not consulted for open items (superseded by `ARCHITECTURAL_GAP_REGISTER.md` + `BACKEND_GAP_REGISTER.md` for open items) |
| `delta-log.md` | Historical Record | DELTA-1..6 — unique content (schema rename rationale, search ILIKE-vs-OpenSearch rationale, build tooling rationale) not restated anywhere else; valuable |
| `doc-tracker.md` | Obsolete Document | Doc health assessment as of 2026-06-13 — predates 46 new governance/backend-authority docs created since; its "CURRENT"/"STALE" tags for canon docs are now superseded by this normalization pass |
| `research-analysis.md` | Historical Record | RA-1..5 — unique build-decision rationale (monorepo build strategy, memory constraints, schema naming) not restated anywhere else; valuable |

## Root

| Document | Classification | Justification |
|---|---|---|
| `README.md` | Operational Artifact | Repo structure + "how to use this skeleton" — still accurate, describes physical layout |
| `doc-catalogue.md` | Obsolete Document | Indexed 57 docs as of 2026-06-13; repo now has 103 docs including 41 governance/backend-authority docs not indexed here. Superseded by `DOCUMENT_INVENTORY.md` |

## infra/

| Document | Classification | Justification |
|---|---|---|
| `infra/event-bus/README.md` | Retired Document (Partial) | "SCAFFOLD" status line is stale (GAP-1, partially resolved); event authority now in `EVENT_AND_QUEUE_ARCHITECTURE.md`. Retains value as a quick orientation pointer for developers browsing `infra/event-bus/` |
| `infra/cache/README.md` | Retired Document (Partial) | Same pattern — Redis authority now in `BACKEND_ARCHITECTURE.md` §7; retains orientation value |
| `infra/docker/README.md` | Operational Artifact | Docker Compose setup instructions — procedural, accurate |
| `infra/deployment/README.md` | Operational Artifact | Env config template instructions — procedural, accurate |
| `infra/deployment/secrets/README.md` | Operational Artifact | Secrets resolution convention — procedural, accurate, and is the **only** documentation of this convention (no authority doc supersedes it) |

## Misc

| Document | Classification | Justification |
|---|---|---|
| `migrations/README.md` | Working Draft | Placeholder for migration documentation |
| `prompts/README.md` | Obsolete Document | Lists "gap-fill prompts" for Batches 8-10/SSO/integration as pending — all are implemented. No longer describes future work |
| `apps/web/README.md` | Working Draft | Phase E scaffold — correctly aspirational, not yet started |
| `design/tokens/README.md`, `design/components/README.md`, `design/wireframes/README.md` | Working Draft | Phase E scaffolds — correctly unpopulated |
| `docs/02_frontend/README.md`, `docs/04_testing/README.md`, `docs/05_deployment/README.md` | Working Draft | Phase 1 placeholders for future phases — correctly empty |
| `services/ui-renderer/README.md` | Working Draft | Phase E scaffold — correctly unbuilt |
| `services/ui-renderer/spec.md` | Supporting Reference | Detailed UI renderer contract — Phase E authority, not yet superseded |

## services/*/README.md (26 files)

| Document | Classification | Justification |
|---|---|---|
| All 26 service READMEs | Operational Artifact | Each is a per-service orientation pointer (batch, source prompts, key entities) for developers browsing that service folder. Now redundant with `01_backend/SERVICE_CATALOG.md` for entity/status facts, but retain value as **local orientation** (V1/V2 source prompt references not captured elsewhere). Classified as Operational Artifact rather than Retired because they serve a different purpose (in-folder developer orientation vs. cross-service authority) |

---

## Classification Summary

| Classification | Count |
|---|---|
| Authority Document | 20 |
| Supporting Reference | 9 |
| Operational Artifact | 31 (5 infra + 26 service READMEs) |
| Historical Record | 4 |
| Generated Report | 12 |
| Working Draft | 9 |
| Retired Document | 8 |
| Obsolete Document | 3 |
| Duplicate Document | 0 (none found — see DUPLICATION_ANALYSIS_REPORT.md for near-duplicates resolved via retirement instead) |
| **Total** | **96*** |

\* Total differs slightly from the 103-file inventory because the 26 service
READMEs and 5 infra READMEs are each counted once as categories above but
listed individually in `DOCUMENT_INVENTORY.md`; counts here represent
distinct classification line-items, not a recount discrepancy.
