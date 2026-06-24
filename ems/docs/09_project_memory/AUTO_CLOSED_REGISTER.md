Status: Active
Authority Level: High
Last Reviewed: 2026-06-20
Owner: AI

# Auto-Closed Register

> Items resolved directly from source code, architecture, contracts, or authority docs.
> No assumptions. No inferences. Only proven facts.
> Purpose: Prevent rediscovery of already-proven facts.

---

## ROD-2 {#rod-2}

| Field | Value |
|---|---|
| Item ID | ROD-2 |
| Title | Phase E and testing may run in parallel |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | Residual Owner Decision Register |
| Evidence Source | Architecture analysis — no code dependency between frontend and test-writing |
| Resolution Source | Phase 2.95 Decision Collapse |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Phase E frontend implementation and backend test-writing are independent tracks; both can run simultaneously |
| Affected Components | None |
| Affected Routes | None |
| Affected APIs | None |
| Affected Workflows | Development workflow only |
| Affected Roles | None |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | Never — architectural fact |
| Related Documents | DECISION_COLLAPSE_REGISTER.md |
| Related Register Entries | — |

---

## ROD-4 {#rod-4}

| Field | Value |
|---|---|
| Item ID | ROD-4 |
| Title | Test priority order derivable from commerce chain criticality |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | Residual Owner Decision Register |
| Evidence Source | Commerce chain: order → payment → fulfillment → ticket; highest-value services identified |
| Resolution Source | Phase 2.95 Decision Collapse |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Test priority: auth → order → payment → fulfillment → ticketing → registration (commerce chain first) |
| Affected Components | Test suite |
| Affected Routes | None |
| Affected APIs | None |
| Affected Workflows | Testing workflow |
| Affected Roles | None |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW |
| Reopen Criteria | If commerce chain changes significantly |
| Related Documents | BACKEND_GAP_REGISTER.md GAP-B2 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#gap-b2 |

---

## ROD-5 {#rod-5}

| Field | Value |
|---|---|
| Item ID | ROD-5 |
| Title | DB-lookup for permissions is the correct approach (not JWT snapshot) |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | Residual Owner Decision Register |
| Evidence Source | `auth.service.ts` issues JWT with `permissions: []`; `PermissionsGuard` calls `RbacService.loadPermissions()` on every request |
| Resolution Source | Phase 2.95 Decision Collapse |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | DB-lookup model is correct and consistent across all 26 services. JWT permission snapshot would require revocation infrastructure; DB-lookup avoids this. No change needed. |
| Affected Components | `infra/common/src/guards/permissions.guard.ts`, `services/rbac/src/rbac.service.ts` |
| Affected Routes | All authenticated routes |
| Affected APIs | All protected APIs |
| Affected Workflows | All workflows requiring authorization |
| Affected Roles | All 8 roles |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW — OCR-2 (23 permissions) works with this model |
| Reopen Criteria | If performance of DB-lookup becomes measurable bottleneck at scale |
| Related Documents | AUTH_AND_TENANCY_CONTRACT.md §1, §3 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#rod-3 |

---

## ROD-8 {#rod-8}

| Field | Value |
|---|---|
| Item ID | ROD-8 |
| Title | TypeScript Kafka payload schemas |
| Classification | AUTO-CLOSED |
| Current Status | EXECUTED |
| Original Source | Residual Owner Decision Register |
| Evidence Source | 64 topic names in `infra/event-bus/src/topics.ts`; schema derived from service implementations |
| Resolution Source | Phase 3.25 Autonomous Gap Elimination |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | TypeScript payload interfaces created for all 64 Kafka topics at `infra/event-bus/src/schemas/index.ts`. Covers Platform Core, Event Operations, Commerce, Participation, Notifications, Intelligence, Networking/Interactive Engagement, Integration domains. |
| Affected Components | `infra/event-bus/src/schemas/index.ts` (created) |
| Affected Routes | None |
| Affected APIs | All Kafka-producing services |
| Affected Workflows | All event-driven workflows |
| Affected Roles | None |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW — schemas serve as contracts for future consumers |
| Reopen Criteria | If new Kafka topics are added (update schemas/index.ts accordingly) |
| Related Documents | EVENT_AND_QUEUE_ARCHITECTURE.md, INTEGRATION_CATALOG.md §4 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#gap-b7 |

---

## ROD-11 / OCR-6 {#rod-11}

| Field | Value |
|---|---|
| Item ID | ROD-11 / OCR-6 |
| Title | 8 roles are authoritative — legacy docs updated |
| Classification | AUTO-CLOSED |
| Current Status | EXECUTED |
| Original Source | Residual Owner Decision Register |
| Evidence Source | `rbac.service.ts` `DEFAULT_ROLES` array: `tenant_admin`, `organizer`, `finance`, `support`, `exhibitor`, `speaker`, `onsite_staff`, `attendee` |
| Resolution Source | Phase 3.25 Autonomous Gap Elimination |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Exactly 8 roles in code. No `platform_admin` role exists. `docs/legacy/security-model.md` updated with authoritative note. |
| Affected Components | `services/rbac/src/rbac.service.ts`, `docs/legacy/security-model.md` |
| Affected Routes | `/v1/roles` |
| Affected APIs | RBAC API |
| Affected Workflows | Role management, user onboarding |
| Affected Roles | All 8 |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | If owner explicitly adds a 9th role (requires REQUIRES_APPROVAL ADR) |
| Related Documents | USER_ROLES_AND_PERMISSIONS.md, security-model.md |
| Related Register Entries | — |

---

## GAP-B8 {#gap-b8}

| Field | Value |
|---|---|
| Item ID | GAP-B8 |
| Title | Webhook secret minimum length constraint |
| Classification | AUTO-CLOSED |
| Current Status | FIXED |
| Original Source | Backend Gap Register |
| Evidence Source | `CreateWebhookSubscriptionDto` had no `@MinLength()` on `secret` field |
| Resolution Source | Pre-Frontend Delta Audit |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | `@MinLength(16)` added to `secret` field in `services/integration/src/dto/integration.dto.ts` |
| Affected Components | `services/integration/src/dto/integration.dto.ts` |
| Affected Routes | `POST /v1/integrations/webhooks` |
| Affected APIs | Integration API |
| Affected Workflows | Webhook registration |
| Affected Roles | `tenant_admin`, `integration:manage` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | Never — validation fix is in code |
| Related Documents | INTEGRATION_CATALOG.md §1 |
| Related Register Entries | — |

---

## GAP-B9 {#gap-b9}

| Field | Value |
|---|---|
| Item ID | GAP-B9 |
| Title | OpenSearch not used — search uses Postgres ILIKE |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | Backend Gap Register |
| Evidence Source | `package.json` — no `@opensearch-project/opensearch`; `services/search/src/` uses TypeORM on `search.search_documents` table |
| Resolution Source | Pre-Frontend Delta Audit |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Search is Postgres ILIKE against `search.search_documents` entity. OpenSearch mentioned in legacy docs and `.env.development.example` (commented out) but never implemented. |
| Affected Components | `services/search/src/` |
| Affected Routes | `GET /v1/search` |
| Affected APIs | Search API |
| Affected Workflows | Event discovery, attendee search |
| Affected Roles | All authenticated roles |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW — semantic search (ROD-10) is additive; ILIKE remains as fallback |
| Reopen Criteria | If OpenSearch is explicitly introduced as a new dependency |
| Related Documents | INTEGRATION_CATALOG.md §6 (corrected), ai-architecture.md |
| Related Register Entries | UC-8 |

---

## GAP-B10 {#gap-b10}

| Field | Value |
|---|---|
| Item ID | GAP-B10 |
| Title | pgvector extension not required — JSONB used |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | Backend Gap Register |
| Evidence Source | `VectorEmbedding` entity: `@Column({ type: 'jsonb' }) vector: number[]`; `postgres-init.sql` enables only `uuid-ossp` and `pgcrypto` |
| Resolution Source | Pre-Frontend Delta Audit |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Vector storage uses JSONB, not the `pgvector` extension. No DB extension change needed for AI embeddings. |
| Affected Components | `services/ai-service/src/entities/vector-embedding.entity.ts` |
| Affected Routes | `POST /v1/ai/embed` |
| Affected APIs | AI API |
| Affected Workflows | AI embedding workflow |
| Affected Roles | All authenticated |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | If performance of JSONB vector storage becomes problematic and pgvector is adopted |
| Related Documents | DATABASE_SCHEMA.md |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#rod-10 |

---

## GAP-B12 {#gap-b12}

| Field | Value |
|---|---|
| Item ID | GAP-B12 |
| Title | Analytics schema extracted and documented |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | Backend Gap Register |
| Evidence Source | `services/analytics/src/entities/`: `AnalyticsEvent`, `EventMetric`, `TicketSalesSummary`, `AttendanceMetrics` (view), `EventDashboardView` (view) |
| Resolution Source | Pre-Frontend Delta Audit |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Analytics schema fully documented: 3 entities in `analytics` schema + 2 `@ViewEntity` read models |
| Affected Components | `services/analytics/src/` |
| Affected Routes | `GET /v1/analytics/events/:id/*` |
| Affected APIs | Analytics API |
| Affected Workflows | Event management, dashboard |
| Affected Roles | `organizer`, `finance`, `tenant_admin` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | If analytics entities change significantly |
| Related Documents | DATABASE_SCHEMA.md, SERVICE_CATALOG.md |
| Related Register Entries | — |

---

## GAP-B15 {#gap-b15}

| Field | Value |
|---|---|
| Item ID | GAP-B15 |
| Title | Integration webhook now covers all 64 Kafka topics |
| Classification | AUTO-CLOSED |
| Current Status | FIXED |
| Original Source | Backend Gap Register |
| Evidence Source | `services/integration/src/integration.service.ts` previously hardcoded 41 topics; fixed to `Object.values(Topics)` |
| Resolution Source | Phase 2.9 Determinability Review (autonomous fix) |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Integration service now fans out all 64 platform topics to registered webhook subscribers automatically via `Object.values(Topics)` from `@ems/event-bus`. |
| Affected Components | `services/integration/src/integration.service.ts` |
| Affected Routes | None |
| Affected APIs | Webhook delivery (internal) |
| Affected Workflows | Outbound webhook delivery for all events |
| Affected Roles | `tenant_admin` (webhook management) |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW — automatically includes future topics added to topics.ts |
| Reopen Criteria | If topic enumeration pattern changes |
| Related Documents | INTEGRATION_CATALOG.md §4, SERVICE_CATALOG.md |
| Related Register Entries | — |

---

## GAP-G2 {#gap-g2}

| Field | Value |
|---|---|
| Item ID | GAP-G2 |
| Title | Campaign ownership initially attributed to engagement — reclassified to notification |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED (superseded by GAP-G3) |
| Original Source | Architectural Gap Register |
| Evidence Source | `services/notification/src/entities/campaign.entity.ts` exists; `services/engagement` has only stub controller |
| Resolution Source | Phase 1 audit |
| Resolution Date | 2026-06-15 |
| Resolved By | AI |
| Decision Summary | Campaign/AudienceSegment are under `services/notification`, not `services/engagement`. Reclassified as a placement deviation (GAP-G3), not a missing feature. |
| Affected Components | `services/notification/src/`, `services/engagement/src/` |
| Affected Routes | `/v1/campaigns` |
| Affected APIs | Campaign API |
| Affected Workflows | Campaign delivery |
| Affected Roles | `organizer`, `tenant_admin` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | Never — reclassified |
| Related Documents | ARCHITECTURAL_GAP_REGISTER.md |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#gap-g3 |

---

## GAP-G7 {#gap-g7}

| Field | Value |
|---|---|
| Item ID | GAP-G7 |
| Title | AI architecture doc cross-checked and correction notice added |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | Architectural Gap Register |
| Evidence Source | `docs/legacy/ai-architecture.md` vs. actual `services/ai-service/src/` code |
| Resolution Source | Phase 3.25 Autonomous Gap Elimination |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Correction header added to `ai-architecture.md`: §3 (embedding API), §4 (OpenSearch k-NN), §7 (agent automation) all contradicted by actual code. Actual state: JSONB vectors, Postgres ILIKE search, no agent entities. |
| Affected Components | `docs/legacy/ai-architecture.md` |
| Affected Routes | None |
| Affected APIs | None |
| Affected Workflows | None |
| Affected Roles | None |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | If ai-architecture.md is formally updated to a new authoritative state |
| Related Documents | ai-architecture.md (legacy), SERVICE_CATALOG.md |
| Related Register Entries | UC-7, UC-8 |

---

## GAP-G10 {#gap-g10}

| Field | Value |
|---|---|
| Item ID | GAP-G10 |
| Title | Role model conflict — 8 roles in code are authoritative |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | Architectural Gap Register |
| Evidence Source | `rbac.service.ts` `DEFAULT_ROLES` — exactly 8 roles; no `platform_admin` |
| Resolution Source | Phase 3.25 (OCR-6 executed) |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Code has 8 roles. Canon docs referenced a 9th role (platform_admin). Code is authoritative. Legacy docs corrected. |
| Affected Components | `services/rbac/src/rbac.service.ts` |
| Affected Routes | `/v1/roles` |
| Affected APIs | RBAC API |
| Affected Workflows | Role management, user onboarding |
| Affected Roles | All 8 |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | If owner explicitly introduces a 9th role |
| Related Documents | USER_ROLES_AND_PERMISSIONS.md, security-model.md |
| Related Register Entries | ROD-11 |

---

## GAP-G11 {#gap-g11}

| Field | Value |
|---|---|
| Item ID | GAP-G11 |
| Title | postgres-init.sql schema name bug — "order" corrected to "ordering" |
| Classification | AUTO-CLOSED |
| Current Status | FIXED |
| Original Source | Repo Reality Audit |
| Evidence Source | `postgres-init.sql` line 18: `CREATE SCHEMA "order"` but TypeORM entities use schema `"ordering"` |
| Resolution Source | Repo Reality Audit / Hygiene Governance |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Critical infrastructure bug: init script created wrong schema name. Fixed: line 18 corrected to `CREATE SCHEMA "ordering"`. Run `docker:reset` to rebuild volumes. |
| Affected Components | `postgres-init.sql`, `services/order/src/` |
| Affected Routes | All `/v1/orders` routes |
| Affected APIs | Order API |
| Affected Workflows | Commerce workflow |
| Affected Roles | All roles that place orders |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE — fixed |
| Reopen Criteria | Never — schema name corrected |
| Related Documents | APPROVAL_RECLASSIFICATION_REPORT.md |
| Related Register Entries | — |

---

## GAP-FE4 {#gap-fe4}

| Field | Value |
|---|---|
| Item ID | GAP-FE4 |
| Title | EngagementModule removal — frontend routing unaffected |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | Frontend Gap Register |
| Evidence Source | `services/engagement` has 0 routes, 0 entities, 0 consumers; Campaign is under `/v1/campaigns` (notification service) |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Whether EngagementModule is removed (OCR-1) or not, frontend MUST NOT build `/engagement/*` routes. Campaign management is deterministically at `/v1/campaigns`. |
| Affected Components | Frontend routing |
| Affected Routes | None (/engagement/* does not exist) |
| Affected APIs | None |
| Affected Workflows | Campaign management |
| Affected Roles | `organizer`, `tenant_admin` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | Never |
| Related Documents | FRONTEND_GAP_REGISTER.md |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#rod-1 |

---

## GAP-FE5 {#gap-fe5}

| Field | Value |
|---|---|
| Item ID | GAP-FE5 |
| Title | JWT permissions empty — auth pattern clarified |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | Frontend Gap Register |
| Evidence Source | `auth.service.ts`: `issueTokens(userId, tenantId, email, roles=[], permissions=[])`; `PermissionsGuard` does DB lookup |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | JWT `permissions: []` is intentional. Frontend MUST call `GET /v1/rbac/users/me/roles` after login to get actual permissions. Do NOT read permissions from JWT. |
| Affected Components | Frontend auth store |
| Affected Routes | All authenticated routes |
| Affected APIs | Auth API, RBAC API |
| Affected Workflows | Login, session management |
| Affected Roles | All |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE — stable pattern |
| Reopen Criteria | If OCR-2 changes permission model (JWT payload remains the same; only DB changes) |
| Related Documents | AUTH_AND_TENANCY_CONTRACT.md §1, §2 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#rod-3 |

---

## GAP-FE6 {#gap-fe6}

| Field | Value |
|---|---|
| Item ID | GAP-FE6 |
| Title | Interactive entity names — no frontend impact |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | Frontend Gap Register |
| Evidence Source | API endpoints (`/v1/polls`, `/v1/qa`, `/v1/surveys`) verified in SERVICE_CATALOG.md; entity names are backend-internal |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Entity names do not affect frontend API consumption. Frontend uses endpoint paths and response shapes, not entity class names. |
| Affected Components | None |
| Affected Routes | `/v1/polls`, `/v1/qa`, `/v1/surveys` |
| Affected APIs | Interactive Engagement API |
| Affected Workflows | Live session Q&A, polls, surveys |
| Affected Roles | `attendee`, `speaker`, `organizer` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | Never |
| Related Documents | SERVICE_CATALOG.md |
| Related Register Entries | — |

---

## GAP-FE8 {#gap-fe8}

| Field | Value |
|---|---|
| Item ID | GAP-FE8 |
| Title | No WebSocket/real-time — polling accepted for Phase E |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | Frontend Gap Register |
| Evidence Source | Architecture — single NestJS process has no WebSocket gateway; no `@nestjs/websockets` in dependencies |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | HTTP polling at 30-second intervals is the accepted Phase E pattern for real-time-like updates (live session stats, check-in counts). WebSocket is a Phase E+ enhancement. |
| Affected Components | Frontend polling logic |
| Affected Routes | Analytics endpoints, notification endpoints |
| Affected APIs | Analytics API, Notification API |
| Affected Workflows | Live event dashboard, onsite check-in monitoring |
| Affected Roles | `organizer`, `onsite_staff` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW — WebSocket is additive when needed |
| Reopen Criteria | When WebSocket gateway is added to backend |
| Related Documents | FRONTEND_AUTHORITY_MASTER.md |
| Related Register Entries | — |

---

## GAP-FE10 {#gap-fe10}

| Field | Value |
|---|---|
| Item ID | GAP-FE10 |
| Title | System roles read-only — isSystem field confirmed |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | Frontend Gap Register |
| Evidence Source | `rbac.service.ts` `DEFAULT_ROLES` sets `isSystem: true` on all 8 default roles; `Role` entity has `isSystem: boolean` column |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | `GET /v1/roles` returns `isSystem` field. Frontend checks `role.isSystem` and renders edit/delete as disabled for system roles. Custom roles (isSystem=false) are fully editable. |
| Affected Components | Role management UI (S-29) |
| Affected Routes | `GET /v1/roles`, `PATCH /v1/roles/:id`, `DELETE /v1/roles/:id` |
| Affected APIs | RBAC API |
| Affected Workflows | Role management |
| Affected Roles | `tenant_admin` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | If isSystem semantics change |
| Related Documents | USER_ROLES_AND_PERMISSIONS.md |
| Related Register Entries | — |

---

## TBD-O1 {#tbd-o1}

| Field | Value |
|---|---|
| Item ID | TBD-O1 |
| Title | Organization entity purpose |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | TBD Resolution Register |
| Evidence Source | `tenant.organization` entity; FK from `Tenant` to `Organization`; stores legal/company info |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | `Organization` stores the company/legal entity information for billing and branding at the platform level. Referenced by `Tenant`; not accessible per-event. |
| Affected Components | `services/tenant/src/entities/` |
| Affected Routes | `/v1/tenants` |
| Affected APIs | Tenant API |
| Affected Workflows | Tenant onboarding |
| Affected Roles | `tenant_admin` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | Never |
| Related Documents | DATABASE_SCHEMA.md |
| Related Register Entries | — |

---

## TBD-O2 {#tbd-o2}

| Field | Value |
|---|---|
| Item ID | TBD-O2 |
| Title | TenantSettings creation timing |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | TBD Resolution Register |
| Evidence Source | `tenant.service.ts` `create()` — creates only `Tenant`; `upsertSettings()` creates `TenantSettings` on first call |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | TenantSettings is NOT created at tenant creation. It is created lazily on the first `PUT /v1/tenants/:id/settings` call (upsert). Frontend must handle 404 on `GET /v1/tenants/:id/settings` until settings have been saved at least once. |
| Affected Components | `services/tenant/src/tenant.service.ts`, frontend settings UI |
| Affected Routes | `GET /v1/tenants/:id/settings`, `PUT /v1/tenants/:id/settings` |
| Affected APIs | Tenant API |
| Affected Workflows | Tenant setup |
| Affected Roles | `tenant_admin` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW — frontend must handle 404 gracefully |
| Reopen Criteria | If TenantSettings creation is moved to tenant.created event handler |
| Related Documents | AUTH_AND_TENANCY_CONTRACT.md §7 |
| Related Register Entries | — |

---

## TBD-O3 {#tbd-o3}

| Field | Value |
|---|---|
| Item ID | TBD-O3 |
| Title | EventSettings entity confirmed missing |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | TBD Resolution Register |
| Evidence Source | `services/event/src/entities/` — no `event-settings.entity.ts`; grep for EventSettings returns no entity definition |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | EventSettings entity does NOT exist in code. OCR-5 queues its creation. Frontend shows graceful degradation ("not yet configured") until OCR-5 is implemented. |
| Affected Components | `services/event/src/` (missing entity) |
| Affected Routes | None (endpoints don't exist yet) |
| Affected APIs | None yet |
| Affected Workflows | Event configuration |
| Affected Roles | `organizer`, `tenant_admin` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | MEDIUM — EventSettings screen is deferred until OCR-5 |
| Reopen Criteria | Auto-reopens when OCR-5 is implemented |
| Related Documents | BACKEND_GAP_REGISTER.md GAP-B11, OWNER_CONFIRMATION_REGISTER.md OCR-5 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#gap-b11, SAFE_DEFAULT_REGISTER.md#rod-9 |

---

## TBD-O4 {#tbd-o4}

| Field | Value |
|---|---|
| Item ID | TBD-O4 |
| Title | Commerce event chain verified |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | TBD Resolution Register |
| Evidence Source | `fulfillment.service.ts` subscribes to `order.paid`; `payment.service.ts` publishes `payment.completed` then `order.paid`; code trace complete |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Commerce chain: `order.created` → `payment.completed` → `order.paid` → `fulfillment.completed` → `ticket.issued`. Fulfillment subscribes to `order.paid` (NOT `payment.completed`). |
| Affected Components | `services/payment`, `services/fulfillment`, `services/ticketing` |
| Affected Routes | `/v1/orders`, `/v1/payments` |
| Affected APIs | Commerce APIs |
| Affected Workflows | Order/payment/fulfillment workflow |
| Affected Roles | `attendee`, `finance`, `organizer` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | If commerce event chain changes |
| Related Documents | EVENT_AND_QUEUE_ARCHITECTURE.md, API_CONTRACT.md |
| Related Register Entries | UC-5 |

---

## TBD-O5 {#tbd-o5}

| Field | Value |
|---|---|
| Item ID | TBD-O5 |
| Title | Integration topic coverage — all 64 topics confirmed |
| Classification | AUTO-CLOSED |
| Current Status | CLOSED |
| Original Source | TBD Resolution Register |
| Evidence Source | `services/integration/src/integration.service.ts` — uses `Object.values(Topics)` after GAP-B15 fix |
| Resolution Source | Phase 3.25 / Phase 2.9 |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Integration webhook fan-out covers all 64 platform topics via `Object.values(Topics)`. Any new topic added to topics.ts is automatically included. |
| Affected Components | `services/integration/src/integration.service.ts` |
| Affected Routes | None (internal) |
| Affected APIs | Webhook delivery |
| Affected Workflows | Outbound webhook delivery |
| Affected Roles | `tenant_admin` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | Never |
| Related Documents | GAP-B15, INTEGRATION_CATALOG.md |
| Related Register Entries | GAP-B15 |

---

## UC-1 through UC-9 {#uc-1}

*Unverified Claims resolved in Phase 3.25. Full details in `docs/08_reports/UNVERIFIED_CLAIMS_REGISTER.md`.*

| ID | Claim | Verdict | Key Fact |
|---|---|---|---|
| UC-1 | Outbox relay is used for publishing | FALSE | All 26 services call `eventBus.publish()` directly |
| UC-2 | TenantScopedRepository enforces isolation | PARTIALLY FALSE | Base class exists; 0 services extend it; all use manual `where: { tenantId }` |
| UC-3 | All 64 Kafka topics covered by integration | TRUE (after fix) | Fixed from 41 hardcoded to `Object.values(Topics)` |
| UC-4 | Payment service knows the gateway | FALSE | `Payment.provider` is a free-text string; backend is gateway-agnostic |
| UC-5 | Fulfillment subscribes to `payment.completed` | FALSE | Subscribes to `order.paid` |
| UC-6 | USER_ROLES doc has correct role names | FALSE | Had design-phase names; corrected to actual code names |
| UC-7 | AI embeddings are functional | FALSE | `vector: []` placeholder; `modelVersion: 'placeholder-v0'` |
| UC-8 | OpenSearch is used for search | FALSE | Postgres ILIKE on `search.search_documents` |
| UC-9 | Cursor pagination is exceptions-only (orders) | PARTIALLY FALSE | Orders AND notifications both use cursor; all others use page-based |

---

## ITBD-1 through ITBD-5 {#itbd-1}

*Inline TBDs corrected in Final Gap Closure Pass (2026-06-17). Full details in corrected source documents.*

| ID | Location | TBD | Resolution |
|---|---|---|---|
| ITBD-1 | INTEGRATION_CATALOG §4 | "Outbox → Kafka relay for durability" | Corrected: direct publish; outbox relay unused |
| ITBD-2 | INTEGRATION_CATALOG §6 | "OpenSearch TBD" | Corrected: Postgres ILIKE confirmed |
| ITBD-3 | INTEGRATION_CATALOG §8 | "Email/SMS TBD" | Resolved: SmtpTransport (nodemailer); SMTP env vars; SMS/push not implemented |
| ITBD-4 | INTEGRATION_CATALOG §9 | "Object Storage TBD" | Resolved: No app-level S3/MinIO client exists |
| ITBD-5 | AUTH_AND_TENANCY_CONTRACT §7 | "TenantSettings timing TBD" | Corrected: NOT created at tenant creation; created on first settings upsert |
