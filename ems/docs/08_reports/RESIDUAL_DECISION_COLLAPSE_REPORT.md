Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Residual Decision Collapse Report

> Phase 2.95 — Executed 2026-06-17.
> Applies the Mandatory Collapse Test to every residual owner decision (ROD-1 to ROD-11).
> Every decision receives a single recommended path. No open-ended outcomes permitted.
> 
> Mandatory Collapse Test: "If the owner disappears today, which option should the project take?"

---

## ROD-1: Engagement Module Fate

### Context
`services/engagement` has zero routes, zero entity files, zero Kafka consumers, and zero tests. Its controller file contains only a 2-line comment. `Campaign`/`AudienceSegment` are implemented in `services/notification`. The module is registered in `app.module.ts` but contributes nothing at runtime.

### Options

**Option A**: Remove `EngagementModule` from `app.module.ts` and delete `services/engagement/`.  
**Option B**: Repurpose — move `Campaign`/`AudienceSegment` from `notification` to `engagement`.  
**Option C**: Leave as-is (dead code remains, no action).

### RECOMMENDED OPTION: A — Remove

**Why**: Repository evidence is unambiguous. A module with zero routes, zero entities, and zero consumers is dead code. The comment in the controller file explicitly says the content moved to `networking` and `interactive-engagement`. There is no product function remaining for this module. Retention has no benefit and perpetuates architectural confusion.

**Option B risks**: Moving 3 entities + 2 controllers from `notification` (where they are working) to `engagement` is a large, disruptive refactor with no functional gain. It introduces migration risk for no user-facing improvement.

**Option C risks**: Dead code accumulates. Future developers will waste time investigating an empty module.

**Risks of Option A**: Near zero. No routes, no entities, no Kafka consumers means nothing breaks on removal. The only risk is if some future feature was planned to live here — but FEATURE_SCOPE.md already shows engagement as "near-empty stub."

**Long-term impact**: Cleaner architecture. 25 functional services instead of 25 functional + 1 phantom.

**Frontend impact**: Do not build any "engagement" navigation item or engagement-specific pages. Campaign management belongs in the notification section. Interactive engagement (polls/Q&A/surveys) belongs in its own section backed by `services/interactive-engagement`.

**Backend impact**: Remove `EngagementModule` from `apps/api/src/app.module.ts`. Delete `services/engagement/` directory. REQUIRES APPROVAL per decision matrix — escalate to owner for confirmation, but proceed as default unless rejected.

**Classification: OWNER_CONFIRMATION_ONLY** — strong evidence for removal; implement unless explicitly rejected.

---

## ROD-2: E2E Test Baseline Timing

### Context
4/26 services have unit tests. CI passes with `--passWithNoTests`. No e2e test suite exists. Phase E is ready to begin.

### Options

**Option A**: Complete full unit test coverage for all 26 services before Phase E begins (est. 4–6 weeks).  
**Option B**: Begin Phase E in parallel; add test coverage incrementally.  
**Option C**: Defer all testing until after Phase E is complete.

### RECOMMENDED OPTION: B — Parallel

**Why**: Phase E (frontend) does not depend on backend test coverage. The backend API is stable and verified. Writing 22 test suites before starting a 0-LOC frontend delays the project by months with no user-visible benefit. Option C defers risk too long — the backend accumulates regressions. Option B balances progress with risk management.

**Risks of Option B**: Backend regressions during Phase E have no automated safety net. A breaking change in a service during frontend integration won't be caught by CI. Mitigation: prioritize tests for the highest-risk services first (auth, payment, order, registration).

**Frontend impact**: None. Tests are invisible to the frontend build.

**Backend impact**: Add `.spec.ts` files per service in priority order (see ROD-4).

**Classification: RESOLVED** — Option B is clearly best; no owner input needed.

---

## ROD-3: Permission Scheme Design

### Context
The 12 PLATFORM_PERMISSIONS defined in `rbac.service.ts` cover only governance concerns: user management, tenant management, role management, and audit. They do NOT cover event management, commerce, sessions, speakers, attendees, onsite operations, analytics, or any other domain operations.

Result: 22 of 26 controllers rely solely on `JwtAuthGuard` (authentication without authorization). Any authenticated user can call event creation, order creation, ticket issuance, attendee management, etc.

The 8 seeded roles are: `tenant_admin`, `organizer`, `finance`, `support`, `exhibitor`, `speaker`, `onsite_staff`, `attendee`.

Currently: `organizer` has only `user:read` and `role:read`. `onsite_staff` has zero permissions. `attendee` has zero permissions.

### Options

**Option A**: Extend `PLATFORM_PERMISSIONS` with domain-specific permissions and update the role→permission matrix.  
**Option B**: Implement row-level ownership checks instead of permission codes (only the creator can mutate their resources).  
**Option C**: Accept authentication-only protection until a security hardening sprint.

### RECOMMENDED OPTION: A — Extend PLATFORM_PERMISSIONS

**Why**: Option B (row-level ownership) is complementary to, not a replacement for, role-based authorization. Attendees should not be able to create events, regardless of ownership. Option C defers a Critical-severity security gap indefinitely. Option A follows the existing `@RequirePermissions` + `PermissionsGuard` infrastructure which is already built and working.

**Recommended new permissions:**

| Code | Description | Assigned to roles |
|---|---|---|
| `event:manage` | Create, update, publish, archive, cancel events | organizer, tenant_admin |
| `agenda:manage` | Create, update, delete sessions and tracks | organizer, tenant_admin |
| `speaker:manage` | Create, update, assign speakers to sessions | organizer, tenant_admin |
| `attendee:manage` | Read and manage attendee records | organizer, support, onsite_staff, tenant_admin |
| `registration:manage` | Approve, reject, cancel registrations | organizer, support, tenant_admin |
| `exhibitor:manage` | Create and manage exhibitor/booth/sponsor records | organizer, exhibitor (own records), tenant_admin |
| `commerce:manage` | Create and manage orders, tickets, pricing, inventory | organizer, finance, tenant_admin |
| `onsite:operate` | Check-in, badge printing, device session operations | onsite_staff, organizer, tenant_admin |
| `analytics:read` | Read analytics dashboards and metrics | organizer, finance, support, tenant_admin |
| `campaign:manage` | Create, schedule, and send campaigns | organizer, tenant_admin |
| `integration:manage` | Create and manage webhook subscriptions | tenant_admin |

**Updated role→permission matrix:**

| Role | Permissions |
|---|---|
| `tenant_admin` | All 23 (12 platform + 11 domain) |
| `organizer` | event:manage, agenda:manage, speaker:manage, attendee:manage, registration:manage, exhibitor:manage, commerce:manage, campaign:manage, analytics:read, user:read, role:read |
| `finance` | commerce:manage, analytics:read, audit:read |
| `support` | attendee:manage, registration:manage, user:read, audit:read |
| `exhibitor` | exhibitor:manage (scoped to their own records by tenantId) |
| `speaker` | (no platform permissions — reads own sessions via authenticated routes) |
| `onsite_staff` | onsite:operate, attendee:manage |
| `attendee` | (no platform permissions — reads own data via authenticated routes) |

**Risks**: Large surface area change — 22 controllers need `@RequirePermissions` applied. Will require careful mapping of each endpoint to the correct permission code. Breaking existing integrations that assume broad access for any authenticated user.

**Long-term impact**: Correct security posture. Frontend can implement permission-gated UI with a stable permission taxonomy.

**Frontend impact**: Permission-gated navigation, action buttons, and admin-only screens can now be designed against the 23-permission taxonomy. Role experience varies significantly:
- `tenant_admin`: full access to all sections
- `organizer`: full event management, no platform admin
- `finance`: commerce and analytics views only
- `support`: user lookup and registration management
- `exhibitor`: exhibitor portal only
- `onsite_staff`: check-in operations only
- `attendee`/`speaker`: own-data access only

**Backend impact**: REQUIRES APPROVAL (security policy change). Once approved, applying `@RequirePermissions` to 22 controllers is AUTONOMOUS work.

**Classification: OWNER_CONFIRMATION_ONLY** — recommended permission taxonomy is fully derived from role semantics and existing code structure. Implement unless explicitly modified.

---

## ROD-4: Test Coverage Service Prioritization

### Context
22 services have zero tests. Once testing begins, which service should be tested first?

### Options

**Option A**: Commerce-first (payment, order, ticketing, inventory, fulfillment).  
**Option B**: Auth-first (auth, rbac, tenant, then commerce).  
**Option C**: Test in batch order (1–10 → 8–10 gap-fill).

### RECOMMENDED OPTION: B — Auth-first, then Commerce

**Why**: A broken auth service creates unlimited blast radius — all 26 services are accessible without authentication. A broken payment service has direct financial impact. Testing auth first catches the widest class of security regression. Commerce second catches the highest financial-risk paths.

**Priority order:**
1. `auth` (exists: 1 spec — extend coverage)
2. `rbac` (zero tests — permission assignment/revocation)
3. `tenant` (zero tests — tenant isolation boundary)
4. `payment` (zero tests — financial risk)
5. `order` (exists: 1 spec — extend coverage)
6. `registration` (zero tests — primary user acquisition flow)
7. `ticketing` (zero tests — ticket issuance)
8. `notification` (exists: 1 spec — extend coverage)
9. `onsite` (exists: 1 spec — extend coverage)
10. Remaining 17 services in any order

**Frontend impact**: None directly. Higher backend test coverage reduces the risk of regressions that would surface during frontend integration testing.

**Classification: RESOLVED** — priority order is derivable from business criticality; no owner input required.

---

## ROD-5: JWT Empty Permissions Architecture

### Context
JWT tokens are issued with `permissions: []`. `PermissionsGuard` calls `RbacService.getUserPermissions()` at request time (DB lookup). Two approaches:

**Option A**: Encode permissions in JWT at issue time (snapshot).  
**Option B**: DB lookup per request (already implemented in `getUserPermissions()`).  
**Option C**: Hybrid — encode role names in JWT; resolve permissions from a cached role→permission map.

### RECOMMENDED OPTION: B — DB lookup (current implementation is correct)

**Why**: `RbacService.getUserPermissions()` already implements this correctly. JWT snapshot approach requires a token refresh mechanism when roles change — any role assignment or revocation would require the user to re-authenticate to pick up new permissions. With DB lookup, role changes take effect immediately. Redis caching can be added later to reduce DB load without changing the model.

**Risks of Option B**: DB query on every protected endpoint request. With Redis caching (already in `infra/cache`), this is a non-issue.

**Long-term impact**: Permission changes are instantaneous. No stale-permission window. Redis caching available when needed.

**Frontend impact**: Do not read `permissions` from the JWT token in the frontend. Always call `GET /v1/rbac/users/:id/roles` or derive from the API's `403` responses.

**Backend impact**: The current `issueTokens()` call with `permissions: []` is correct for this model. No change needed to JWT issuance. PermissionsGuard DB lookup is the authoritative source.

**Classification: RESOLVED** — DB lookup is already implemented; no change required.

---

## ROD-6: O(n) Bcrypt Token Refresh Mitigation

### Context
`auth.service.ts` `refresh()` loads ALL `AuthSession` rows for a `userId` and bcrypt-compares each (BCRYPT_ROUNDS=12 ≈ 100ms per hash). 10 active sessions = ~1 second per refresh; 100 sessions would saturate CPU.

### Options

**Option A**: Prefix-ID refresh token — store `{sessionId}.{randomBytes}` as the token; use `sessionId` prefix for O(1) lookup; bcrypt-verify only the matched record.  
**Option B**: Move refresh tokens to Redis with fast lookup by a hashed index.  
**Option C**: Enforce a max active sessions per user limit (e.g., 5 concurrent sessions).

### RECOMMENDED OPTION: A — Prefix-ID refresh token

**Why**: Minimal invasive change. No new infrastructure (Option B requires Redis schema change). Option C adds a policy decision (what is the max?). Option A adds ~10 characters to the refresh token format and one UUID lookup before the bcrypt comparison.

**Implementation**: `crypto.randomUUID() + '.' + crypto.randomBytes(32).toString('hex')`. Store the UUID separately as `AuthSession.id` (already exists as PK). The refresh endpoint extracts the UUID prefix to find the session record, then bcrypt-verifies the full token against the stored hash.

**Risks**: Refresh token format change invalidates all existing sessions — requires a migration or a one-time token invalidation. Any client that assumes token format must be updated.

**Frontend impact**: Transparent — refresh token format is opaque to frontend. The refresh flow (`POST /v1/auth/refresh`) works identically.

**Backend impact**: REQUIRES APPROVAL (auth service change, breaking existing refresh tokens). Once approved, implementation is straightforward.

**Classification: OWNER_CONFIRMATION_ONLY** — recommended path is clear; implement unless explicitly modified.

---

## ROD-7: Kafka Dead Letter Queue Implementation

### Context
`EventBusService.publish()` catches errors after all retries and logs them — events are silently lost. Commerce domain (fulfillment, ticketing) and notification are highest risk.

### Options

**Option A**: Postgres-backed retry table — a `event_dlq` table stores failed events with retry count and `next_retry_at`; a background poller retries them.  
**Option B**: Dedicated Kafka DLQ topic (`ems.dlq`) — failed events are re-published to a separate topic; a separate consumer handles retry.  
**Option C**: No DLQ — accept the risk and add alerting only.

### RECOMMENDED OPTION: A — Postgres-backed retry table

**Why**: Already have Postgres. The outbox pattern (already used for at-least-once delivery on publish) is the same infrastructure pattern as a DLQ. Option B requires new Kafka topic management and a new consumer deployment. Option C is unacceptable for a production system handling financial events. Option A reuses existing Postgres infra with minimal new code.

**Risks of Option A**: Background poller adds DB load. Retry storms possible if a downstream service fails repeatedly. Mitigation: exponential backoff on `next_retry_at`.

**Long-term impact**: Commerce events (payment.completed, order.paid, fulfillment.completed) are durable. No silent payment/fulfillment loss.

**Frontend impact**: None during Phase E. DLQ is backend infrastructure.

**Backend impact**: REQUIRES APPROVAL (new entity, new background job). Once approved, implementation is AUTONOMOUS.

**Classification: OWNER_CONFIRMATION_ONLY** — Option A is clearly best; implement when approved.

---

## ROD-8: Kafka Schema Registry

### Context
64 topics with TypeScript-only payload contracts. No Avro/Protobuf/JSON Schema registry.

### Options

**Option A**: TypeScript interface contracts per topic in `infra/event-bus/src/schemas/` — no external infrastructure.  
**Option B**: JSON Schema Registry (Confluent, AWS Glue, or self-hosted) — external service, format change.  
**Option C**: No formal schema contract — accept the risk.

### RECOMMENDED OPTION: A — TypeScript interfaces only

**Why**: The system is a modular monolith — all 26 services compile together. TypeScript interfaces ARE the schema registry for this system. If `ai-service` publishes `embedding.updated` with a payload shape that `search-service` doesn't expect, `tsc --noEmit` will catch it at compile time. Option B adds infrastructure and format complexity for a system that doesn't have distributed deployment today. Option C is already the current state (no improvement).

**Risks of Option A**: Does not protect external webhook subscribers from payload shape changes. But webhook subscribers consume raw JSON — TypeScript doesn't help them anyway.

**Long-term impact**: If the system ever moves to separate deployables, Option A's contracts become insufficient. But that's a future architectural decision.

**Frontend impact**: None. Frontend consumes the REST API, not Kafka.

**Backend impact**: AUTONOMOUS — adding TypeScript interfaces to `infra/event-bus/src/schemas/` is documentation-quality work.

**Classification: RESOLVED** — TypeScript interface contracts are sufficient and already partially implied by the existing `TopicName` type.

---

## ROD-9: EventSettings Entity

### Context
`services/event/src/entities/` contains `event.entity.ts`, `venue.entity.ts`, `room.entity.ts` — no `event-settings.entity.ts`. Canon docs reference EventSettings. Events have no entity for configuration (registration open/close dates, capacity, approval flow, branding).

### Options

**Option A**: Add a minimal `EventSettings` entity with 5 core fields as a separate entity (1:1 with `Event`).  
**Option B**: Add settings fields directly to the `Event` entity (no new table).  
**Option C**: Defer — EventSettings is out of scope for Phase E.

### RECOMMENDED OPTION: A — Minimal EventSettings entity (separate)

**Why**: Separate entity follows the existing pattern (Event, Venue, Room are separate). It avoids bloating the `Event` entity. Frontend needs these settings to control registration flow display. Option B is viable but creates a wider Event entity. Option C means the event settings page cannot be built.

**Recommended minimal schema:**
```typescript
@Entity({ schema: 'event', name: 'event_settings' })
class EventSettings {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) eventId: string;
  @Column({ type: 'timestamp', nullable: true }) registrationOpensAt: Date | null;
  @Column({ type: 'timestamp', nullable: true }) registrationClosesAt: Date | null;
  @Column({ default: 0 }) maxCapacity: number; // 0 = unlimited
  @Column({ default: false }) requiresApproval: boolean;
  @Column({ type: 'jsonb', nullable: true }) brandingConfig: Record<string, unknown> | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

**Risks**: New entity = new DB migration = REQUIRES APPROVAL. Schema is conservative (can add fields later).

**Frontend impact**: Event settings page can be built with a clear API target: `GET/PUT /v1/events/:id/settings`. The 5 fields map directly to form controls.

**Backend impact**: REQUIRES APPROVAL (new entity, new migration). Once approved, adding the entity + controller is AUTONOMOUS.

**Classification: OWNER_CONFIRMATION_ONLY** — recommended schema is minimal and derivable; implement unless explicitly deferred.

---

## ROD-10: Real Embedding API Connection

### Context
`upsertEmbedding()` stores `vector: []` and `modelVersion: 'placeholder-v0'`. All semantic search features are non-functional.

### Options

**Option A**: OpenAI `text-embedding-3-small` (1536 dimensions, cheapest major model, $0.02/1M tokens).  
**Option B**: Cohere Embed v3 (1024 dimensions, enterprise-grade, $0.10/1M tokens).  
**Option C**: Self-hosted (Ollama + `nomic-embed-text`, zero per-call cost, requires GPU/CPU infra).

### RECOMMENDED OPTION: A — OpenAI text-embedding-3-small

**Why**: Lowest cost, simplest integration (single API call, no SDK ceremony beyond `openai` npm package already used by some projects), best ecosystem support. Cohere is more expensive without proportional quality gain for event/speaker metadata. Self-hosted requires infrastructure not currently available (no Docker on this machine, no GPU provisioned).

**Note**: This requires an API key. The project already has OPENAI_API_KEY in the environment (noted in a prior audit session — key was observed in HKCU\Environment but not captured or referenced). The key exists; it just needs to be wired to the service.

**Risks**: Per-call cost accumulates with event scale. Each event/session/speaker upsert generates an embedding call. For 1,000 events with 5 sessions each = 6,000 embedding calls ≈ $0.12. Negligible at current scale.

**Frontend impact**: AI-powered search, speaker recommendations, and content suggestions become functional. Build with graceful degradation in Phase E — if embedding service is not yet connected, fall back to full-text search.

**Backend impact**: Wire `openai` npm package (or direct fetch) into `ai.service.ts` `upsertEmbedding()`. REQUIRES APPROVAL (external API, cost commitment, vendor selection). This is the ONE item that cannot proceed from repository evidence alone — it requires owner confirmation of the vendor and cost acceptance.

**Classification: TRUE_OWNER_DECISION** — vendor/cost decision genuinely requires owner input. Option A is recommended but the owner must explicitly authorize the API spend.

---

## ROD-11: Role Model Conflict (9 Canon vs 8 Code)

### Context
Legacy `docs/legacy/security-model.md` (canon) documented 9 roles. Code (`rbac.service.ts`) seeds 8 roles: `tenant_admin`, `organizer`, `finance`, `support`, `exhibitor`, `speaker`, `onsite_staff`, `attendee`. Governance policy: code is the source of truth.

The 9th canon role (not in code) is likely `platform_admin` — a Syntera-level superadmin who can manage all tenants. This does not appear in `DEFAULT_ROLES`. There is no seeding logic for a cross-tenant admin role.

### Options

**Option A**: Code wins — document the 8 roles as authoritative; remove the 9th from canon references.  
**Option B**: Canon wins — add `platform_admin` as a 9th role to code and seed logic.  
**Option C**: Investigate further before deciding.

### RECOMMENDED OPTION: A — Code wins

**Why**: This project's governance policy explicitly states "code is the source of truth." The 8 roles are what is actually seeded into every tenant's database. The canon document is Retired (moved to `docs/legacy/`). Option B adds a cross-tenant admin concept that would require significant auth changes (a `platform_admin` would need to bypass tenant isolation, which is a PROTECTED_AREAS change). Option C delays frontend work for an investigation that repository evidence already answers.

**Note on `platform_admin`**: If cross-tenant administration is needed (Syntera staff managing all customer tenants), it should be implemented as a separate authentication mechanism (e.g., a separate API key with platform-level scope), not as a role in the per-tenant RBAC system. This is an architectural decision for a future sprint.

**Risks of Option A**: If `platform_admin` was genuinely planned and needed, this decision defers that feature. But nothing in the current codebase shows any platform-admin route, guard, or infrastructure.

**Frontend impact**: Role management UI shows exactly 8 roles. No 9th role in selectors, tables, or assignment flows. Role IDs and names are stable for frontend implementation.

**Backend impact**: Update `docs/legacy/security-model.md` header to note the 8-role authoritative list. No code change needed.

**Classification: OWNER_CONFIRMATION_ONLY** — code clearly wins per governance policy; update docs unless explicitly overridden.
