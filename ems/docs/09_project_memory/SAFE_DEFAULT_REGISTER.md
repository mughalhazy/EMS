Status: Active
Authority Level: High
Last Reviewed: 2026-06-20
Owner: AI

# Safe-Default Register

> Items resolved through safe deterministic defaults.
> One path is overwhelmingly supported by repository evidence.
> Implementation can proceed safely without commercial or legal risk.
> Purpose: Track assumptions that were accepted because evidence strongly supported one path.
>
> All items have REQUIRES_APPROVAL, AUTONOMOUS, or SAFE_REPOSITORY_HYGIENE execution tiers.
> "Silence = Confirm" applies to all OCR items per OWNER_CONFIRMATION_REGISTER.md.

---

## ROD-1 / OCR-1 {#rod-1}

| Field | Value |
|---|---|
| Item ID | ROD-1 / OCR-1 |
| Title | Remove EngagementModule (dead code) |
| Classification | SAFE-DEFAULT |
| Current Status | QUEUED — REQUIRES_APPROVAL |
| Original Source | Residual Owner Decision Register |
| Evidence Source | `services/engagement/src/`: 2-line stub controller, 6-line service, 8-line module; 0 entities, 0 consumers, 0 routes |
| Resolution Source | Phase 2.95 / Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Remove `EngagementModule` from `app.module.ts` and delete `services/engagement/` directory. Dead code with no production impact. Campaign/AudienceSegment correctly live under `services/notification`. |
| Detailed Explanation | The engagement service stub explicitly states content moved to networking and interactive-engagement. No entity, no route, no consumer exists. Removal has near-zero risk. |
| Affected Components | `apps/api/src/app.module.ts`, `services/engagement/` |
| Affected Routes | None |
| Affected APIs | None |
| Affected Workflows | Campaign management (correctly under notification) |
| Affected Roles | None |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | Only if owner decides to repurpose engagement service with new functionality |
| Related Documents | OWNER_CONFIRMATION_REGISTER.md OCR-1, FRONTEND_GAP_REGISTER.md GAP-FE4 |
| Related Register Entries | AUTO_CLOSED_REGISTER.md#gap-fe4, SAFE_DEFAULT_REGISTER.md#gap-b13 |

---

## ROD-3 / OCR-2 {#rod-3}

| Field | Value |
|---|---|
| Item ID | ROD-3 / OCR-2 |
| Title | Apply 23-permission taxonomy to all 22 unguarded controllers |
| Classification | SAFE-DEFAULT |
| Current Status | QUEUED — REQUIRES_APPROVAL |
| Original Source | Residual Owner Decision Register |
| Evidence Source | Code audit: 4 of 26 controllers use `@RequirePermissions`; 22 rely on JwtAuthGuard only |
| Resolution Source | Phase 2.95 Decision Collapse |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Extend `PLATFORM_PERMISSIONS` in `rbac.service.ts` with 11 domain permission codes. Apply `@RequirePermissions` to 22 controllers. Update `DEFAULT_ROLES` permission assignments. Full spec in OWNER_CONFIRMATION_REGISTER.md OCR-2. |
| Detailed Explanation | 23-permission taxonomy: 12 existing governance permissions + 11 domain permissions (event:manage, agenda:manage, speaker:manage, attendee:manage, registration:manage, exhibitor:manage, commerce:manage, onsite:operate, analytics:read, campaign:manage, integration:manage). Role-permission matrix fully derived from role semantics. No production clients exist to break. |
| Affected Components | `services/rbac/src/rbac.service.ts`, all 22 unguarded controllers |
| Affected Routes | All 91 frontend routes |
| Affected APIs | All APIs |
| Affected Workflows | All workflows |
| Affected Roles | All 8 roles |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | HIGH — enables all permission-gated frontend navigation and action controls |
| Reopen Criteria | If permission taxonomy changes (add new services/routes) |
| Related Documents | OWNER_CONFIRMATION_REGISTER.md OCR-2, USER_ROLES_AND_PERMISSIONS.md |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#gap-b1, SAFE_DEFAULT_REGISTER.md#gap-g5 |

---

## ROD-6 / OCR-3 {#rod-6}

| Field | Value |
|---|---|
| Item ID | ROD-6 / OCR-3 |
| Title | Prefix-ID refresh token — eliminates O(n) bcrypt scan |
| Classification | SAFE-DEFAULT |
| Current Status | QUEUED — REQUIRES_APPROVAL |
| Original Source | Residual Owner Decision Register |
| Evidence Source | `auth.service.ts` `refresh()` loads ALL AuthSession rows for userId and bcrypt-compares each |
| Resolution Source | Phase 2.95 Decision Collapse |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Change refresh token format to `{sessionId}.{randomBytes(32).hex}`. Extract `sessionId` prefix for O(1) DB lookup; bcrypt-verify only the single matched record. One-time forced re-auth for all existing sessions. |
| Detailed Explanation | Current O(n) pattern: 10 active sessions = ~1s refresh latency; 100 sessions = ~10s. Prefix-ID resolves this by encoding the session ID in the token itself. Existing sessions invalidated on deploy (acceptable — users re-login once). |
| Affected Components | `services/auth/src/auth.service.ts`, `services/auth/src/entities/auth-session.entity.ts` |
| Affected Routes | `POST /v1/auth/refresh` |
| Affected APIs | Auth API |
| Affected Workflows | Session management |
| Affected Roles | All |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW — transparent to frontend |
| Reopen Criteria | If alternative session management approach is adopted |
| Related Documents | OWNER_CONFIRMATION_REGISTER.md OCR-3, AUTH_AND_TENANCY_CONTRACT.md §1 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#gap-b4 |

---

## ROD-7 / OCR-4 {#rod-7}

| Field | Value |
|---|---|
| Item ID | ROD-7 / OCR-4 |
| Title | Postgres-backed Event Dead-Letter Queue |
| Classification | SAFE-DEFAULT |
| Current Status | QUEUED — REQUIRES_APPROVAL |
| Original Source | Residual Owner Decision Register |
| Evidence Source | `EventBusService.publish()` catches errors after retries and logs — no DLQ; `OutboxRelay` cron exists but is never populated |
| Resolution Source | Phase 2.95 Decision Collapse |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Create `EventDlq` entity in `infra/event-bus/entities/`. Modify `EventBusService.publish()` to write to DLQ on publish failure. Add retry poller with exponential backoff. Schema fully specified in OWNER_CONFIRMATION_REGISTER.md OCR-4. |
| Affected Components | `infra/event-bus/src/`, new `EventDlq` entity |
| Affected Routes | None |
| Affected APIs | None (internal) |
| Affected Workflows | All event-driven workflows (commerce, notification, fulfillment) |
| Affected Roles | None |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | HIGH — eliminates risk of permanent event loss in commerce/notification domains |
| Reopen Criteria | If DLQ strategy changes (e.g., adopt dedicated Kafka DLQ topic) |
| Related Documents | OWNER_CONFIRMATION_REGISTER.md OCR-4, EVENT_AND_QUEUE_ARCHITECTURE.md |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#gap-b6 |

---

## ROD-9 / OCR-5 {#rod-9}

| Field | Value |
|---|---|
| Item ID | ROD-9 / OCR-5 |
| Title | EventSettings entity — create additive entity and endpoints |
| Classification | SAFE-DEFAULT |
| Current Status | QUEUED — REQUIRES_APPROVAL |
| Original Source | Residual Owner Decision Register |
| Evidence Source | No `event-settings.entity.ts` in `services/event/src/entities/`; schema derivable from product requirements |
| Resolution Source | Phase 2.95 Decision Collapse |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Create EventSettings entity with 8-field schema. Add `GET /v1/events/:id/settings` and `PUT /v1/events/:id/settings` endpoints. Gate on `event:manage` permission. Full spec in OWNER_CONFIRMATION_REGISTER.md OCR-5. |
| Detailed Explanation | Schema: id, eventId (unique FK), registrationOpensAt, registrationClosesAt, maxCapacity (default 0=unlimited), requiresApproval (default false), brandingConfig (JSONB), createdAt, updatedAt. Additive — no migration risk to existing data. |
| Affected Components | `services/event/src/entities/event-settings.entity.ts` (new), `services/event/src/event.controller.ts` |
| Affected Routes | `GET /v1/events/:id/settings`, `PUT /v1/events/:id/settings` |
| Affected APIs | Event API |
| Affected Workflows | Event configuration workflow |
| Affected Roles | `organizer`, `tenant_admin` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | MEDIUM — enables Event Settings screen (S-11) |
| Reopen Criteria | If EventSettings schema requirements change significantly |
| Related Documents | OWNER_CONFIRMATION_REGISTER.md OCR-5, FRONTEND_GAP_REGISTER.md GAP-FE1 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#gap-b11, SAFE_DEFAULT_REGISTER.md#gap-fe1 |

---

## ROD-10 / GAP-B14 {#rod-10}

| Field | Value |
|---|---|
| Item ID | ROD-10 / GAP-B14 |
| Title | AI embedding implementation — use OpenAI text-embedding-3-small |
| Classification | SAFE-DEFAULT (promoted from OWNER-REQUIRED 2026-06-17) |
| Current Status | QUEUED — REQUIRES_APPROVAL |
| Original Source | Residual Owner Decision Register / Backend Gap Register |
| Evidence Source | `OPENAI_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY` confirmed in `HKCU\Environment`; `VectorEmbedding.vector` is JSONB |
| Resolution Source | Owner-Required Item Compression Pass |
| Resolution Date | 2026-06-17 |
| Resolved By | AI |
| Decision Summary | Use OpenAI `text-embedding-3-small` (1536-dim). OPENAI_API_KEY already provisioned in environment — vendor implicitly selected. Implementation: replace `vector: []` placeholder in `ai.service.ts` with OpenAI embeddings API call. Wrap in try/catch with full-text fallback. |
| Detailed Explanation | Three vendor keys exist; OpenAI is the industry standard for this use case with best quality/price ($0.02/1M tokens). JSONB column already accepts 1536-element number array — no migration. Owner can override to Gemini or DeepSeek by changing the implementation. |
| Affected Components | `services/ai-service/src/ai.service.ts` |
| Affected Routes | `POST /v1/ai/embed` |
| Affected APIs | AI API |
| Affected Workflows | Event indexing, attendee search |
| Affected Roles | All (search affects all authenticated users) |
| Owner Required | NO — API keys already provisioned |
| External Dependency | YES — OPENAI_API_KEY (already in environment) |
| Future Impact | HIGH — enables semantic search, AI-powered recommendations |
| Reopen Criteria | If owner selects a different embedding vendor; if OPENAI_API_KEY is revoked |
| Related Documents | OWNER_REQUIRED_COMPRESSION_REPORT.md, INTEGRATION_CATALOG.md §3 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#gap-fe2, EXTERNAL_DEPENDENCY_REGISTER.md#openai |

---

## GAP-B1 {#gap-b1}

| Field | Value |
|---|---|
| Item ID | GAP-B1 |
| Title | Permission coverage — 22 controllers lack @RequirePermissions |
| Classification | SAFE-DEFAULT |
| Current Status | PENDING OCR-2 implementation |
| Original Source | Backend Gap Register |
| Evidence Source | Grep: `@RequirePermissions` exists only in auth, tenant, rbac, audit controllers |
| Resolution Source | Phase 2 Backend Authority Capture |
| Resolution Date | 2026-06-17 (path determined) |
| Decision Summary | Apply 23-permission taxonomy per OCR-2 spec. No owner policy decision needed — permission mapping derivable from role semantics. |
| Affected Components | 22 service controllers |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | HIGH — security hardening |
| Reopen Criteria | Resolved when OCR-2 is implemented |
| Related Documents | OWNER_CONFIRMATION_REGISTER.md OCR-2 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#rod-3 |

---

## GAP-B2 {#gap-b2}

| Field | Value |
|---|---|
| Item ID | GAP-B2 |
| Title | Test coverage — 22 services have zero tests |
| Classification | SAFE-DEFAULT |
| Current Status | AUTONOMOUS — not started |
| Original Source | Backend Gap Register |
| Evidence Source | 4/26 services have `.spec.ts` (auth, notification, onsite, order — 1 each) |
| Resolution Source | Phase 2 Backend Authority Capture |
| Resolution Date | 2026-06-17 (path determined) |
| Decision Summary | Write unit tests per service — autonomous per DECISION_ESCALATION_MATRIX.md. Priority: commerce chain first (auth → order → payment → fulfillment → ticketing → registration). Remove `--passWithNoTests` flag once baseline exists. |
| Affected Components | All 26 services |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | HIGH — safety net for all future changes |
| Reopen Criteria | Remains open until coverage baseline exists |
| Related Documents | ARCHITECTURAL_GAP_REGISTER.md GAP-G4 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#gap-g4 |

---

## GAP-B3 {#gap-b3}

| Field | Value |
|---|---|
| Item ID | GAP-B3 |
| Title | JWT issued with empty permissions — DB-lookup model is intentional and correct |
| Classification | SAFE-DEFAULT |
| Current Status | DOCUMENTED — no code change needed |
| Original Source | Backend Gap Register |
| Evidence Source | `auth.service.ts` `issueTokens()` called with `roles=[], permissions=[]`; `PermissionsGuard` does DB lookup |
| Resolution Source | Phase 3.25 (confirmed as intentional) |
| Resolution Date | 2026-06-17 |
| Decision Summary | DB-lookup model is the correct architecture choice. Encoding permissions in the JWT would require revocation infrastructure. Current model: simple, correct, consistent across all 26 services. OCR-2 adds 23 permissions to DB — PermissionsGuard will check these automatically. |
| Affected Components | None (no change needed) |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | If JWT-embedded permissions are explicitly required (e.g., for edge/CDN auth) |
| Related Documents | AUTH_AND_TENANCY_CONTRACT.md §1, §3 |
| Related Register Entries | AUTO_CLOSED_REGISTER.md#rod-5 |

---

## GAP-B4 {#gap-b4}

| Field | Value |
|---|---|
| Item ID | GAP-B4 |
| Title | O(n) bcrypt refresh token validation |
| Classification | SAFE-DEFAULT |
| Current Status | PENDING OCR-3 |
| Original Source | Backend Gap Register |
| Evidence Source | `auth.service.ts` `refresh()` — loads all AuthSession rows for userId; bcrypt-compares each |
| Resolution Source | Phase 2.95 |
| Resolution Date | 2026-06-17 (path determined) |
| Decision Summary | Resolved by OCR-3 (prefix-ID token). No separate fix needed. |
| Affected Components | `services/auth/src/auth.service.ts` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | HIGH at scale — mitigated by OCR-3 |
| Reopen Criteria | Resolved when OCR-3 implemented |
| Related Documents | OWNER_CONFIRMATION_REGISTER.md OCR-3 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#rod-6 |

---

## GAP-B5 {#gap-b5}

| Field | Value |
|---|---|
| Item ID | GAP-B5 |
| Title | Controller path collisions (/sessions and /users) — low risk |
| Classification | SAFE-DEFAULT |
| Current Status | MONITORED |
| Original Source | Backend Gap Register |
| Evidence Source | Agenda `/sessions/:id` (single segment) and Speaker `/sessions/:id/speakers` (two segments) coexist without collision due to path depth differentiation |
| Resolution Source | Phase 2.9 Determinability Review (downgraded) |
| Resolution Date | 2026-06-17 |
| Decision Summary | No collision exists currently. Risk: future route additions at same path depth could collide. Document route convention to prevent this. No immediate code change. |
| Affected Components | `services/agenda/src/`, `services/speaker/src/` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW (latent risk only) |
| Reopen Criteria | If a new route is added to /sessions at same depth as existing collision risk |
| Related Documents | API_CONTRACT.md Known Issues section |
| Related Register Entries | — |

---

## GAP-B6 {#gap-b6}

| Field | Value |
|---|---|
| Item ID | GAP-B6 |
| Title | No Kafka DLQ for event publish failures |
| Classification | SAFE-DEFAULT |
| Current Status | PENDING OCR-4 |
| Original Source | Backend Gap Register |
| Evidence Source | `EventBusService.publish()` catches errors after all retries and logs; no DLQ or retry queue |
| Resolution Source | Phase 2.95 |
| Resolution Date | 2026-06-17 (path determined) |
| Decision Summary | Resolved by OCR-4 (Postgres-backed EventDlq). Commerce domain (fulfillment) and notification domain are highest risk for event loss. |
| Affected Components | `infra/event-bus/src/event-bus.service.ts` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | HIGH — production reliability |
| Reopen Criteria | Resolved when OCR-4 implemented |
| Related Documents | OWNER_CONFIRMATION_REGISTER.md OCR-4 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#rod-7 |

---

## GAP-B7 {#gap-b7}

| Field | Value |
|---|---|
| Item ID | GAP-B7 |
| Title | No Kafka schema registry — TypeScript contracts are sufficient for Phase E |
| Classification | SAFE-DEFAULT |
| Current Status | DOCUMENTED — TypeScript schemas created |
| Original Source | Backend Gap Register |
| Evidence Source | TypeScript payload schemas created at `infra/event-bus/src/schemas/index.ts` (ROD-8) |
| Resolution Source | Phase 3.25 (ROD-8 executed) |
| Resolution Date | 2026-06-17 |
| Decision Summary | TypeScript interfaces in `schemas/index.ts` are sufficient for Phase E. Avro/Protobuf/JSON Schema registry is Phase E+ work, appropriate only when external consumers (webhook subscribers, third-party integrations) require schema validation. |
| Affected Components | `infra/event-bus/src/schemas/index.ts` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW — additive when needed |
| Reopen Criteria | When external consumers require formal schema validation |
| Related Documents | EVENT_AND_QUEUE_ARCHITECTURE.md |
| Related Register Entries | AUTO_CLOSED_REGISTER.md#rod-8 |

---

## GAP-B11 {#gap-b11}

| Field | Value |
|---|---|
| Item ID | GAP-B11 |
| Title | EventSettings entity missing from code |
| Classification | SAFE-DEFAULT |
| Current Status | PENDING OCR-5 |
| Original Source | Backend Gap Register |
| Evidence Source | Grep for `event-settings.entity.ts` returns no result |
| Resolution Source | Phase 2.95 (OCR-5 spec created) |
| Resolution Date | 2026-06-17 (path determined) |
| Decision Summary | Create EventSettings entity per OCR-5 spec. Additive entity — no migration risk. Frontend shows graceful degradation until implemented. |
| Affected Components | `services/event/src/` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | MEDIUM — enables event settings screen |
| Reopen Criteria | Resolved when OCR-5 implemented |
| Related Documents | OWNER_CONFIRMATION_REGISTER.md OCR-5 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#rod-9, SAFE_DEFAULT_REGISTER.md#gap-fe1 |

---

## GAP-B13 {#gap-b13}

| Field | Value |
|---|---|
| Item ID | GAP-B13 |
| Title | EngagementModule dead code — removal candidate |
| Classification | SAFE-DEFAULT |
| Current Status | PENDING OCR-1 |
| Original Source | Backend Gap Register |
| Evidence Source | 2-line stub controller, 6-line service, 8-line module; 0 entities, 0 consumers, 0 routes |
| Resolution Source | Phase 2.9 |
| Resolution Date | 2026-06-17 (path determined) |
| Decision Summary | Remove per OCR-1. Zero runtime impact — nothing references EngagementModule at runtime. |
| Affected Components | `services/engagement/`, `apps/api/src/app.module.ts` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | Resolved when OCR-1 implemented |
| Related Documents | OWNER_CONFIRMATION_REGISTER.md OCR-1 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#rod-1 |

---

## GAP-G1 {#gap-g1}

| Field | Value |
|---|---|
| Item ID | GAP-G1 |
| Title | progress.md is stale — update or retire |
| Classification | SAFE-DEFAULT |
| Current Status | AUTONOMOUS (SAFE_REPOSITORY_HYGIENE) |
| Original Source | Architectural Gap Register |
| Evidence Source | `docs/tracking/progress.md` (last updated 2026-06-13) marks Batches 8–10, SSO, integration as "not started" — all are implemented |
| Resolution Source | Architectural Gap Register |
| Resolution Date | 2026-06-17 (path determined) |
| Decision Summary | Update progress.md to mark all implemented batches as complete, OR retire it in favour of the governance tree. SAFE_REPOSITORY_HYGIENE — autonomous documentation update. |
| Affected Components | `docs/tracking/progress.md` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | Never |
| Related Documents | ARCHITECTURAL_GAP_REGISTER.md GAP-G1 |
| Related Register Entries | — |

---

## GAP-G3 {#gap-g3}

| Field | Value |
|---|---|
| Item ID | GAP-G3 |
| Title | Campaign/AudienceSegment placement — update canon docs |
| Classification | SAFE-DEFAULT |
| Current Status | AUTONOMOUS (SAFE_REPOSITORY_HYGIENE) |
| Original Source | Architectural Gap Register |
| Evidence Source | Campaign and AudienceSegment entities exist in `services/notification/`; canon docs implied `services/engagement` ownership |
| Resolution Source | Phase 1 / Phase 3.25 |
| Resolution Date | 2026-06-17 (path determined) |
| Decision Summary | Code is correct — Campaign belongs under notification (co-located with delivery infrastructure). Update canon docs to reflect notification ownership. No code change. |
| Affected Components | `docs/canon/service-map.md`, `docs/canon/domain-model.md` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | Never |
| Related Documents | ARCHITECTURAL_GAP_REGISTER.md GAP-G3 |
| Related Register Entries | AUTO_CLOSED_REGISTER.md#gap-g2 |

---

## GAP-G4 {#gap-g4}

| Field | Value |
|---|---|
| Item ID | GAP-G4 |
| Title | Test coverage critically low |
| Classification | SAFE-DEFAULT |
| Current Status | AUTONOMOUS — not started |
| Original Source | Architectural Gap Register |
| Evidence Source | Only 4/26 services have `.spec.ts`; CI uses `--passWithNoTests` |
| Resolution Source | Phase 1 |
| Resolution Date | 2026-06-17 (path determined) |
| Decision Summary | Write unit tests per service. Autonomous per DECISION_ESCALATION_MATRIX.md. Priority order: commerce chain first. Remove `--passWithNoTests` when baseline exists. |
| Affected Components | All 26 services |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | HIGH — safety net for all future work |
| Reopen Criteria | N/A — remains open until coverage baseline established |
| Related Documents | ARCHITECTURAL_GAP_REGISTER.md GAP-G4 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#gap-b2 |

---

## GAP-G5 {#gap-g5}

| Field | Value |
|---|---|
| Item ID | GAP-G5 |
| Title | Permission model coverage — unverified beyond 4 controllers |
| Classification | SAFE-DEFAULT |
| Current Status | PENDING OCR-2 |
| Original Source | Architectural Gap Register |
| Evidence Source | `@RequirePermissions` verified only on auth, tenant, rbac, audit controllers |
| Resolution Source | Phase 1 |
| Resolution Date | 2026-06-17 (path determined) |
| Decision Summary | Resolved by OCR-2. Full controller-by-controller audit embedded in OCR-2 spec. |
| Affected Components | 22 controllers |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | HIGH |
| Reopen Criteria | Resolved when OCR-2 implemented |
| Related Documents | OWNER_CONFIRMATION_REGISTER.md OCR-2 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#rod-3 |

---

## GAP-G6 {#gap-g6}

| Field | Value |
|---|---|
| Item ID | GAP-G6 |
| Title | SSO/webhook security hardening — single correct technical implementation |
| Classification | SAFE-DEFAULT |
| Current Status | REQUIRES_APPROVAL (pre-production requirement) |
| Original Source | Architectural Gap Register |
| Evidence Source | `SsoController.ssoLogin()` does not verify assertion signature; `WebhookDelivery` sends no HMAC signature header |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 (path determined) |
| Decision Summary | **SSO**: verify SAML/OAuth2 assertion against `SsoConnection.certificate` and `issuer` — cryptographic verification, single correct approach. **Webhooks**: add `X-Hub-Signature-256: sha256=HMAC(secret, payload)` header to all outbound HTTP POST deliveries. Both are pre-production requirements. |
| Affected Components | `services/auth/src/sso.service.ts`, `services/integration/src/integration.service.ts` |
| Affected Routes | `POST /v1/auth/sso/callback`, webhook delivery (internal) |
| Affected APIs | Auth API (SSO), Integration API |
| Affected Workflows | SSO login, webhook delivery |
| Affected Roles | All SSO users; `tenant_admin` (webhooks) |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | HIGH — required before production SSO/webhook exposure |
| Reopen Criteria | Resolved when security hardening sprint is completed |
| Related Documents | INTEGRATION_CATALOG.md §1, §2 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#gap-fe9 |

---

## GAP-G8 {#gap-g8}

| Field | Value |
|---|---|
| Item ID | GAP-G8 |
| Title | Frontend stack version unconfirmed |
| Classification | SAFE-DEFAULT |
| Current Status | PHASE E KICKOFF — verify Next.js version in apps/web/ before first implementation commit |
| Original Source | Architectural Gap Register |
| Evidence Source | `apps/web` contains only `README.md`; no `package.json` yet |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 (path determined) |
| Decision Summary | Verify Next.js version and frontend dependencies at Phase E kickoff. `apps/web/README.md` references Next.js 14 — confirm this is the target. Low urgency; not a current blocker. |
| Affected Components | `apps/web/` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW |
| Reopen Criteria | Resolved at Phase E kickoff |
| Related Documents | apps/web/README.md |
| Related Register Entries | — |

---

## GAP-G9 {#gap-g9}

| Field | Value |
|---|---|
| Item ID | GAP-G9 |
| Title | Entity naming deviations — update canon docs to match code |
| Classification | SAFE-DEFAULT |
| Current Status | AUTONOMOUS (SAFE_REPOSITORY_HYGIENE) |
| Original Source | Architectural Gap Register |
| Evidence Source | Code entity names differ from canon docs in 14+ services (e.g., TicketProduct vs TicketType, PriceRule vs Discount, InventoryItem vs InventoryPool) |
| Resolution Source | Audit Remediation pass |
| Resolution Date | 2026-06-17 (DOMAIN_MODEL.md partially updated) |
| Decision Summary | Code names are authoritative. Update `docs/canon/domain-model.md` to match. DOMAIN_MODEL.md already updated; `docs/canon/domain-model.md` still shows old names. |
| Affected Components | `docs/canon/domain-model.md` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW |
| Reopen Criteria | Never once canon doc updated |
| Related Documents | ARCHITECTURAL_GAP_REGISTER.md GAP-G9, DOMAIN_MODEL.md |
| Related Register Entries | — |

---

## GAP-FE1 {#gap-fe1}

| Field | Value |
|---|---|
| Item ID | GAP-FE1 |
| Title | EventSettings UI — build with graceful degradation |
| Classification | SAFE-DEFAULT |
| Current Status | PHASE E — build "Settings not yet configured" empty state; OCR-5 pending |
| Original Source | Frontend Gap Register |
| Evidence Source | OCR-5 spec defines EventSettings schema; GET endpoint returns 404 until OCR-5 implemented |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Decision Summary | Build S-11 Event Settings screen with graceful degradation: show "Settings not yet configured" empty state with configure CTA. Wire to real API when OCR-5 is implemented — component-level swap only. |
| Affected Components | S-11 Event Settings screen |
| Affected Routes | `GET /events/:id/settings` (frontend route) |
| Affected APIs | `GET /v1/events/:id/settings`, `PUT /v1/events/:id/settings` |
| Affected Workflows | Event configuration |
| Affected Roles | `organizer`, `tenant_admin` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | MEDIUM |
| Reopen Criteria | Resolved when OCR-5 implemented |
| Related Documents | FRONTEND_GAP_REGISTER.md GAP-FE1 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#rod-9 |

---

## GAP-FE2 {#gap-fe2}

| Field | Value |
|---|---|
| Item ID | GAP-FE2 |
| Title | AI search UI — build with full-text fallback, no "AI-powered" copy |
| Classification | SAFE-DEFAULT |
| Current Status | PHASE E — build with full-text results; no "AI-powered" copy until ROD-10 ships |
| Original Source | Frontend Gap Register |
| Evidence Source | `services/search/` uses Postgres ILIKE — functional; ROD-10 implementation will add semantic ranking |
| Resolution Source | Phase 3.25 / Compression Pass |
| Resolution Date | 2026-06-17 |
| Decision Summary | Build S-26 search with full-text results. Do NOT include "AI-powered" or "semantic" UI copy until ROD-10 backend implementation lands. Search is functional without embeddings. |
| Affected Components | S-26 Search screen |
| Affected Routes | `GET /search` (frontend route) |
| Affected APIs | `GET /v1/search` |
| Affected Workflows | Event discovery, attendee lookup |
| Affected Roles | All authenticated |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | MEDIUM — semantic ranking improves UX |
| Reopen Criteria | Resolved when ROD-10 implemented |
| Related Documents | FRONTEND_GAP_REGISTER.md GAP-FE2 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#rod-10 |

---

## GAP-FE3 {#gap-fe3}

| Field | Value |
|---|---|
| Item ID | GAP-FE3 |
| Title | Permission guards — use RoleGuard now; switch to PermissionGate when OCR-2 lands |
| Classification | SAFE-DEFAULT |
| Current Status | PHASE E — RoleGuard active; L0 frozen; PermissionGate switchover when OCR-2 lands |
| Original Source | Frontend Gap Register |
| Evidence Source | 8 stable roles confirmed from code; 23 permissions pending OCR-2 |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Decision Summary | Implement `RoleGuard` using the 8 stable roles for Phase E. When OCR-2 is implemented (23 permissions added to backend), refactor to `PermissionGate` — component-level change only, not screen-level. |
| Affected Components | All screens with role-gated navigation/actions |
| Affected Routes | All authenticated frontend routes |
| Affected APIs | All protected APIs |
| Affected Workflows | All role-gated workflows |
| Affected Roles | All 8 |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | HIGH — enables fine-grained access control |
| Reopen Criteria | Resolved when OCR-2 implemented |
| Related Documents | FRONTEND_AUTHORITY_MASTER.md, USER_ROLES_AND_PERMISSIONS.md |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#rod-3 |

---

## GAP-FE7-A {#gap-fe7a}

| Field | Value |
|---|---|
| Item ID | GAP-FE7-A |
| Title | S-06 Checkout scaffold — build with placeholder payment form |
| Classification | SAFE-DEFAULT |
| Current Status | PHASE E — buildable; Steps 1/2/4 functional; Step 3 = placeholder form |
| Original Source | Frontend Gap Register (split from GAP-FE7) |
| Evidence Source | Payment API contract fully documented; backend is gateway-agnostic |
| Resolution Source | Owner-Required Compression Pass |
| Resolution Date | 2026-06-17 |
| Decision Summary | Build S-06 checkout screen with all deterministic steps: (1) order summary from `GET /v1/orders/:id`; (2) `POST /v1/payments { orderId, amountCents, currency, provider: 'placeholder' }`; (3) disabled placeholder payment fields + "Payment gateway integration pending" notice; (4) `POST /v1/payments/:id/complete` wired but not callable until gateway live. |
| Affected Components | S-06 Order/Checkout screen |
| Affected Routes | `GET /orders/:id/checkout` (frontend) |
| Affected APIs | `POST /v1/orders`, `POST /v1/payments`, `POST /v1/payments/:id/complete` |
| Affected Workflows | Order and payment workflow |
| Affected Roles | `attendee`, `organizer` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | HIGH — core commerce user journey |
| Reopen Criteria | Resolved when GAP-FE7-B (gateway SDK) implemented |
| Related Documents | FRONTEND_GAP_REGISTER.md GAP-FE7 |
| Related Register Entries | OUT_OF_SCOPE_REGISTER.md#gap-fe7b, EXTERNAL_DEPENDENCY_REGISTER.md#payment-gateway |

---

## GAP-FE9 {#gap-fe9}

| Field | Value |
|---|---|
| Item ID | GAP-FE9 |
| Title | SSO warning banner — add to S-28 SSO Configuration screen |
| Classification | SAFE-DEFAULT |
| Current Status | PHASE E — buildable; amber banner, dismissible per session, text frozen in L0 |
| Original Source | Frontend Gap Register |
| Evidence Source | SSO assertion signature verification not implemented (GAP-G6); SSO login works functionally |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Decision Summary | Build S-04 SSO Callback and S-28 SSO Configuration screens normally. Add visible warning in S-28: "SSO signature verification is pending — not recommended for production use." Remove warning banner when GAP-G6 security hardening is complete. |
| Affected Components | S-04 SSO Callback, S-28 SSO Configuration |
| Affected Routes | Frontend SSO routes |
| Affected APIs | `GET /v1/auth/sso/discover`, `POST /v1/auth/sso/callback`, SSO connection endpoints |
| Affected Workflows | SSO login, SSO configuration |
| Affected Roles | `tenant_admin` (SSO config), all SSO users |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW — warning banner; production concern only |
| Reopen Criteria | Resolved when GAP-G6 implemented |
| Related Documents | FRONTEND_GAP_REGISTER.md GAP-FE9, INTEGRATION_CATALOG.md §2 |
| Related Register Entries | SAFE_DEFAULT_REGISTER.md#gap-g6 |

---

## NF-3 {#nf-3}

| Field | Value |
|---|---|
| Item ID | NF-3 |
| Title | SponsorPackage no tenantId — scoped through eventId |
| Classification | SAFE-DEFAULT (monitoring) |
| Current Status | MONITORING — audit during Phase E exhibitor implementation |
| Original Source | Phase 3.25 (new finding) |
| Evidence Source | `exhibitor.sponsor_packages` table has no `tenantId` column; all other exhibitor entities have `tenantId` |
| Resolution Source | Phase 3.25 |
| Resolution Date | 2026-06-17 |
| Decision Summary | SponsorPackage is scoped through `eventId` (events have `tenantId`). No cross-tenant data exposure is possible if event-level tenant isolation holds. During Phase E exhibitor implementation: verify all SponsorPackage queries join through eventId; consider adding `tenantId` for defense-in-depth. |
| Affected Components | `services/exhibitor/src/entities/sponsor-package.entity.ts` |
| Affected Routes | Exhibitor/sponsor routes |
| Affected APIs | Exhibitor API |
| Affected Workflows | Sponsorship management |
| Affected Roles | `exhibitor`, `organizer`, `tenant_admin` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | LOW (latent risk only) |
| Reopen Criteria | If a query path is found that does not filter by eventId |
| Related Documents | UNRESOLVABLE_ITEMS_REGISTER.md NF-3 |
| Related Register Entries | — |

---

## DELTA-7 {#delta-7}

| Field | Value |
|---|---|
| Item ID | DELTA-7 |
| Title | api-standards.md specifies cursor pagination; code uses page-based (mostly) |
| Classification | SAFE-DEFAULT |
| Current Status | AUTONOMOUS (SAFE_REPOSITORY_HYGIENE) |
| Original Source | Pre-Frontend Delta Audit |
| Evidence Source | `docs/legacy/api-standards.md` specifies cursor; actual code uses `?page=&limit=` page-based (except orders and notifications which use cursor) |
| Resolution Source | Pre-Frontend Delta Audit |
| Resolution Date | 2026-06-17 (path determined) |
| Decision Summary | Update api-standards.md to reflect actual pattern: page-based as default; cursor as exception for orders and notifications. SAFE_REPOSITORY_HYGIENE documentation update. |
| Affected Components | `docs/legacy/api-standards.md` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | NONE |
| Reopen Criteria | Never |
| Related Documents | AI_OPERATING_CONTEXT.md, API_CONTRACT.md |
| Related Register Entries | — |
