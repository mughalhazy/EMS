Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Contract Version Registry

> Tracks the version state of all API contracts and cross-service
> integration contracts. This document is the single source of truth
> for what version is in effect, what is breaking vs. additive, and
> what migration plan exists for any pending changes.

## 1. Current API Version

| Attribute | Value |
|---|---|
| API Version | `v1` (all routes: `/v1/...`) |
| Versioning strategy | URI versioning (`@nestjs/common` `VersioningType.URI`, `defaultVersion: '1'`) |
| Current status | Single version in production — no `v2` routes exist |
| Governance | Version increment requires ADR approval (see `07_governance/DECISION_ESCALATION_MATRIX.md`) |

---

## 2. Contract Documents and Their Versions

| Document | Version | Status | Last Changed |
|---|---|---|---|
| `docs/01_backend/BACKEND_ARCHITECTURE.md` | 1.0 | Active | 2026-06-15 |
| `docs/01_backend/API_CONTRACT.md` | 1.0 | Active | 2026-06-15 |
| `docs/01_backend/DATABASE_SCHEMA.md` | 1.0 | Active | 2026-06-15 |
| `docs/01_backend/ERROR_CONTRACT.md` | 1.0 | Active | 2026-06-15 |
| `docs/01_backend/SERVICE_CATALOG.md` | 1.0 | Active | 2026-06-15 |
| `docs/01_backend/INTEGRATION_CATALOG.md` | 1.0 | Active | 2026-06-15 |
| `docs/01_backend/VALIDATION_RULES.md` | 1.0 | Active | 2026-06-15 |
| `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md` | 1.0 | Active | 2026-06-15 |
| `docs/03_fullstack_contracts/AUTH_AND_TENANCY_CONTRACT.md` | 1.0 | Active | 2026-06-15 |
| `docs/03_fullstack_contracts/USER_ROLES_AND_PERMISSIONS.md` | 1.0 | Active | 2026-06-15 |
| `docs/03_fullstack_contracts/DATA_SHAPE_REGISTRY.md` | 1.0 | Active | 2026-06-15 |
| `docs/03_fullstack_contracts/VALIDATION_PARITY.md` | 1.0 | Active | 2026-06-15 |
| `docs/03_fullstack_contracts/CONTRACT_VERSION_REGISTRY.md` | 1.0 | Active | 2026-06-15 |
| `docs/00_authority/FULLSTACK_STITCHING_CONTRACT.md` | 1.1 | Active | 2026-06-15 |

All Phase 1 and Phase 2 governance documents are first-pass captures as of
2026-06-15. They reflect the implementation state at this date.

---

## 3. Breaking vs. Additive Change Classification

Use this table when evaluating whether a proposed change requires a version bump:

| Change type | Breaking? | Action required |
|---|---|---|
| Add new optional field to response | No | Update DATA_SHAPE_REGISTRY; no version bump |
| Add new optional field to request DTO | No | Update VALIDATION_RULES; no version bump |
| Remove field from response | **Yes** | New API version required; ADR required |
| Remove field from request DTO | **Yes** | New API version required; ADR required |
| Rename field | **Yes** | New API version required; ADR required |
| Change field type | **Yes** | New API version required; ADR required |
| Add new required field to request | **Yes** | New API version required; ADR required |
| Add new endpoint | No | Update API_CONTRACT; no version bump |
| Remove or rename existing endpoint | **Yes** | New API version required; ADR required |
| Change HTTP status code for existing case | **Yes** | New API version required; ADR required |
| Add new EMS error code | No | Update ERROR_CONTRACT; no version bump |
| Change error code for existing case | **Yes** | New API version required; ADR required |
| Add new Kafka topic | No | Update EVENT_AND_QUEUE_ARCHITECTURE; no version bump |
| Remove or rename existing Kafka topic | **Yes** | Kafka contract change; ADR required |
| Change Kafka event payload shape | **Yes** | ADR required; coordinate subscriber updates |
| Add new permission code | No | Update USER_ROLES_AND_PERMISSIONS; no version bump |
| Change role→permission mapping | No (behavior change) | Update USER_ROLES_AND_PERMISSIONS; requires review |

---

## 4. Pending Contract Changes (Requires Resolution)

These are open items that may result in contract changes when resolved:

| Item | Impact | Requires |
|---|---|---|
| GAP-G3: Campaign placement (notification vs engagement) | May change entity schema or service ownership | ADR-002 |
| GAP-G5: Permission model for 22 services | May add `@RequirePermissions` to currently unprotected endpoints (breaking: 403 on previously allowed operations) | Permission audit + ADR |
| GAP-G6: SSO assertion signature verification | Changes SSO callback behavior (adds rejection of unsigned assertions) | ADR |
| GAP-G6: Webhook HMAC signing | Adds `X-EMS-Signature` header to outbound webhooks | Non-breaking for consumers unless they validate signature |
| SEC-002: JWT permissions empty | If tokens start carrying actual permission codes, frontend logic relying on token structure changes | ADR |
| GAP-G9: Entity name reconciliation | If canon names win, DB columns and API response fields change | ADR required before any rename |

---

## 5. Contract Change Process

1. Identify the change type (§3 above)
2. If breaking: draft ADR in `06_decisions/`, get REQUIRES APPROVAL sign-off
3. Update affected contract documents in this registry
4. Update `Last Changed` date and increment document version
5. If API version bump needed: add `/v2/` routes; maintain `/v1/` for deprecation period
6. Update `BACKEND_AUTHORITY_CAPTURE_REPORT.md` to note the change

---

## 6. External Consumer Notification

Current state (2026-06-15): no external consumers identified beyond the
planned `apps/web` frontend (not yet built). When `apps/web` is built or
third-party integrations are added via webhooks (`services/integration`),
breaking changes must be communicated to consumers before deployment.

Webhook subscribers receive the raw Kafka event payload — any breaking change
to event payload shapes (topic payload structure) is a breaking change for
external webhook consumers.
