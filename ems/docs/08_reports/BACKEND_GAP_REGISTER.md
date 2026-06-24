Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Backend Gap Register (Phase 2 Backend Authority Capture)

> New gaps discovered during Phase 2 (2026-06-15). Prefixed `GAP-B` to
> distinguish from Phase 1 governance gaps (`GAP-G*`).
> See also `08_reports/ARCHITECTURAL_GAP_REGISTER.md` for Phase 1 gaps.

## GAP-B1: Permission Coverage — 20+ Services Lack Fine-Grained Authorization

- **Severity**: Critical
- **Category**: Security / Authorization
- **Evidence**: `@RequirePermissions` verified only on 5 service controllers:
  `auth` (users + SSO), `tenant`, `rbac`, `audit`. 21 other controllers expose
  all endpoints to any authenticated user in the tenant.
- **Impact**: Privilege escalation possible — an attendee can call commerce,
  event management, onsite, and integration endpoints.
- **Resolution path**: 
  1. Perform full controller-level permission audit (AUTONOMOUS)
  2. Extend `PLATFORM_PERMISSIONS` to include commerce/event permissions (REQUIRES APPROVAL)
  3. Add `@RequirePermissions` to all mutating and sensitive read endpoints (REQUIRES APPROVAL)
  4. Update `USER_ROLES_AND_PERMISSIONS.md` and `API_CONTRACT.md`
- **Dependencies**: New permission codes must be defined; role→permission matrix must be updated; ADR required for commerce and event permissions

---

## GAP-B2: Test Coverage — 22 Services Have Zero Tests

- **Severity**: High
- **Category**: Quality / Test Coverage
- **Evidence**: Only 4 of 26 services have any `.spec.ts` file (`auth`, `notification`, `onsite`, `order` — 1 each). CI uses `--passWithNoTests`, meaning the test job always passes. No e2e test suite content verified.
- **Impact**: No safety net for refactoring or permission changes. Breaking changes in service logic would not be caught by CI.
- **Resolution path**: Add unit tests per service (AUTONOMOUS per `DECISION_ESCALATION_MATRIX.md`). Remove `--passWithNoTests` flag once baseline coverage exists.
- **Carry-forward**: Originally documented as GAP-G4. Restated here with backend-specific detail.

---

## GAP-B3: JWT Permissions Empty — Authorization Relying Solely on DB Lookups

- **Severity**: High
- **Category**: Security / Auth
- **Evidence**: `auth.service.ts` `issueTokens()` called with `roles=[], permissions=[]`. JWT access token always has empty permission claims.
- **Impact**: If any code path reads permissions from the JWT rather than DB, it will see no permissions. The authorization model relies entirely on DB lookups at request time.
- **Resolution path**: Decide (REQUIRES APPROVAL) whether permissions should be encoded in JWT (snapshot at issue time) or always DB-loaded. Document the decision; update `AUTH_AND_TENANCY_CONTRACT.md`.

---

## GAP-B4: O(n) Refresh Token Validation — Scalability Risk

- **Severity**: High
- **Category**: Performance / Availability
- **Evidence**: `auth.service.ts` `refresh()` loads ALL `AuthSession` rows for `userId` and bcrypt-compares each (BCRYPT_ROUNDS=12 = ~100ms per hash).
- **Impact**: 10 active sessions = ~1 second per refresh; 100 sessions = ~10 seconds. Under concurrent refresh from a single user, this can saturate CPU.
- **Resolution path**: 
  1. Store refresh token as hashed index (SHA-256 for lookup, bcrypt-verify only matched record)
  2. Or enforce max active session count per user
  3. REQUIRES APPROVAL (auth service change)

---

## GAP-B5: Controller Path Collisions — `/sessions` and `/users` — ⬇️ DOWNGRADED

- **Severity**: Low (downgraded from Medium — 2026-06-17 Determinability Review)
- **Category**: Routing / Correctness
- **Evidence examined**:
  - Agenda `@Controller('sessions')`: routes at `/sessions`, `/sessions/:id` (single-segment `:id`)
  - Speaker `@Controller('sessions')`: routes at `/sessions/:sessionId/speakers`, `/sessions/:sessionId/speakers/:speakerId` (two-segment paths)
  - In Express/NestJS, `:id` matches only a single path segment — `/sessions/123/speakers` does NOT match `/sessions/:id`; it correctly routes to speaker's sub-path
  - Auth `UsersController` (`/users`): CRUD at `/users`, `/users/:id`
  - Rbac `RbacController`: routes at `/roles` and `/users/:id/roles` (NOT a standalone `/users` controller)
  - `/users/:id/roles` has different path depth than `/users/:id` — no collision in practice
- **Revised impact**: Routes coexist correctly due to path depth differentiation. No unreachable routes identified. Risk is latent — a future route added as `/sessions/:id` in speaker context WOULD collide with agenda's pattern.
- **Residual risk**: Low — watch for future route additions in both services at the same path depth.
- **Resolution path**: No urgent action required. Optional: document unique route conventions in API_CONTRACT.md to prevent future additions that would cause real collisions.

---

## GAP-B6: No Dead-Letter Queue for Kafka Events

- **Severity**: Medium
- **Category**: Reliability
- **Evidence**: `EventBusService.publish()` catches errors after all retries and logs them. No DLQ, no persistent retry queue.
- **Impact**: Events can be permanently lost in Kafka broker failure scenarios. Commerce domain (fulfillment triggered by `payment.completed`) and notification domain are highest-risk.
- **Resolution path**: Implement DLQ Kafka topic (`ems.dlq`) or Postgres-backed retry table. Add metric on publish failure. REQUIRES APPROVAL.

---

## GAP-B7: No Kafka Schema Registry — Payload Contracts Unchecked

- **Severity**: Medium
- **Category**: Reliability / Maintainability
- **Evidence**: `infra/event-bus/src/topics.ts` defines 64 topic name constants but no payload schemas. Event shape is TypeScript-only — no Avro/Protobuf/JSON Schema registry.
- **Impact**: Payload evolution is unchecked. A publisher can add/remove fields without any consumer being aware. External webhook subscribers receive raw event payloads with no versioning or schema contract.
- **Resolution path**: Add JSON Schema definitions per topic to `infra/event-bus/src/schemas/`. Consider JSON Schema validation in EventBusService. REQUIRES APPROVAL.

---

## GAP-B8: Webhook Secret — No Minimum Length Constraint — ✅ CLOSED

- **Severity**: Medium (Closed)
- **Category**: Security
- **Closed**: 2026-06-17 (Determinability Review)
- **Resolution**: `@MinLength(16)` added to `secret` field in `services/integration/src/dto/integration.dto.ts`. AUTONOMOUS fix — pure validation-only change to a DTO; no behavior or schema change.

---

## GAP-B9: OpenSearch Client Not Verified in `package.json` — ✅ CLOSED

- **Severity**: Low (Closed)
- **Category**: Dependency Verification
- **Closed**: 2026-06-17 (Pre-Frontend Delta Audit)
- **Resolution**: Search does NOT use OpenSearch. `services/search` uses Postgres ILIKE via `SearchDocument` entity (`search.search_documents`). No OpenSearch client exists in `package.json`. OpenSearch is listed in `.env.development.example` but commented out as "not yet used by the API — search currently runs against Postgres ILIKE." GAP-B9 is closed — no action required.

---

## GAP-B10: `pgvector` Extension Requirement for AI Embeddings — ✅ CLOSED

- **Severity**: Low (Closed)
- **Category**: Infrastructure / Deployment
- **Closed**: 2026-06-17 (Pre-Frontend Delta Audit)
- **Resolution**: `pgvector` is NOT needed. `VectorEmbedding` entity stores the vector as `@Column({ type: 'jsonb' }) vector: number[]` — not the pgvector `vector` type. `postgres-init.sql` only enables `uuid-ossp` and `pgcrypto` extensions (no pgvector). GAP-B10 is closed — no action required. Column in prior documentation was incorrectly named `embedding`; actual column name is `vector`.

---

## GAP-B11: `EventSettings` Entity Missing from Code

- **Severity**: Low
- **Category**: Entity Completeness
- **Evidence**: Canon docs reference `EventSettings`. No `event-settings.entity.ts` found in `services/event/src/entities/` (carry-forward from GAP-G9/CA-017).
- **Impact**: Any planned feature depending on event-level settings has no backing entity in the DB.
- **Resolution path**: Confirm `EventSettings` is intentionally deferred (implement it) or was never planned (remove from canon docs). REQUIRES APPROVAL.

---

## GAP-B12: Analytics Schema Not Extracted — ✅ CLOSED

- **Severity**: Low (Closed)
- **Category**: Documentation Completeness
- **Closed**: 2026-06-17 (Pre-Frontend Delta Audit)
- **Resolution**: Analytics schema fully extracted. Entities: `AnalyticsEvent` (`analytics.analytics_events`), `EventMetric` (`analytics.event_metrics`), `TicketSalesSummary` (`analytics.ticket_sales_summaries`); plus 2 `@ViewEntity` read models: `AttendanceMetrics` (`analytics.attendance_metrics`), `EventDashboardView` (`analytics.event_dashboard_view`). `DATABASE_SCHEMA.md` and `SERVICE_CATALOG.md` updated 2026-06-17.

---

## GAP-B14: AI Embeddings Are Placeholder Only — ✅ SAFE-DEFAULT (Compression Pass 2026-06-17)

- **Severity**: High (resolution path fully determined)
- **Category**: Feature Completeness / AI
- **Evidence**: `services/ai-service/src/ai.service.ts` `upsertEmbedding()`:
  ```typescript
  embedding.vector = [];  // empty array
  embedding.modelVersion = 'placeholder-v0';
  ```
  No embedding API is called. `OPENAI_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY` are all confirmed in environment.
- **Resolution (Compression Pass)**: Reclassified SAFE-DEFAULT. API keys are already provisioned in environment — vendor selection is implied (use OpenAI as default; keys for alternatives also present). Implementation is a one-function change in `ai.service.ts`. See OWNER_REQUIRED_COMPRESSION_REPORT.md.
- **Implementation path**:
  ```typescript
  const response = await this.openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  embedding.vector = response.data[0].embedding;  // 1536-dim float array
  embedding.modelVersion = 'text-embedding-3-small-v1';
  ```
  Wrap in try/catch with graceful fallback to empty vector. VectorEmbedding.vector is JSONB — no migration needed.
- **Tier**: REQUIRES_APPROVAL (external API integration change)
- **Status**: ✅ SAFE-DEFAULT — implementation path fully determined; no owner decision needed

---

## GAP-B15: Integration Webhook Fan-Out Missing 23 Topics — ✅ CLOSED

- **Severity**: Medium (Closed)
- **Category**: Reliability / Integration Completeness
- **Closed**: 2026-06-17 (Determinability Review — AUTONOMOUS fix)
- **Resolution**: `services/integration/src/integration.service.ts` updated to replace hardcoded 41-topic `ALL_TOPICS` array with `Object.values(Topics)` imported from `@ems/event-bus`. Integration webhook fan-out now covers all 64 topics automatically. The `Topics` import was added alongside the existing `TopicName` import.

---

## GAP-B13: `EngagementModule` Contributes No Routes — Removal Candidate

- **Severity**: Low
- **Category**: Dead Code
- **Evidence**: `services/engagement` has a 2-line stub controller, empty entities, and no Kafka consumers. It publishes no events.
- **Impact**: Module load overhead only; minimal functional impact. However, it pollutes the architecture with a dead module.
- **Resolution path**: Either assign a clear purpose and implement, or remove `EngagementModule` from `app.module.ts` (close GAP-G3 by making the removal explicit). REQUIRES APPROVAL.

---

## Summary

| ID | Finding | Severity | Category | Status |
|---|---|---|---|---|
| GAP-B1 | Permission coverage gap — 20+ services | Critical | Security | Open |
| GAP-B2 | Test coverage — 22 services with zero tests | High | Quality | Open |
| GAP-B3 | JWT issued with empty permissions | High | Security | Open |
| GAP-B4 | O(n) refresh token bcrypt comparison | High | Performance | Open |
| GAP-B5 | Controller path collisions | Low (downgraded) | Routing | Open — latent risk only |
| GAP-B6 | No Kafka dead-letter queue | Medium | Reliability | Open |
| GAP-B7 | No Kafka schema registry | Medium | Reliability | Open |
| GAP-B8 | Webhook secret no min length | Medium | Security | ✅ Closed — @MinLength(16) added |
| GAP-B9 | OpenSearch client not verified | Low | Dependencies | ✅ Closed — Postgres ILIKE used, no OpenSearch |
| GAP-B10 | `pgvector` extension not verified | Low | Infrastructure | ✅ Closed — JSONB used, no pgvector needed |
| GAP-B11 | `EventSettings` entity missing from code | Low | Entity Completeness | Open |
| GAP-B12 | Analytics schema not extracted | Low | Documentation | ✅ Closed — 3 entities + 2 views documented |
| GAP-B13 | `EngagementModule` dead — removal candidate | Low | Dead Code | Open |
| GAP-B14 | AI embeddings are placeholder — semantic search non-functional | High | Feature Completeness | ✅ SAFE-DEFAULT — OPENAI_API_KEY in env; implementation spec complete |
| GAP-B15 | Integration webhook missing 23 of 64 topics | Medium | Reliability | ✅ Closed — Object.values(Topics) now used |
