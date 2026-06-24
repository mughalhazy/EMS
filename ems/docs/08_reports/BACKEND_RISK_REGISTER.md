Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Backend Risk Register (Phase 2 Backend Authority Capture)

> Operational and architectural risks identified during Phase 2 (2026-06-15).
> Distinct from gap register (GAP-B*) — risks here describe probabilistic
> harm rather than known missing functionality.
>
> Risk rating = Likelihood × Impact, where:
> - Likelihood: Low (unlikely in normal ops) | Medium (plausible) | High (expected without change)
> - Impact: Low (minor degradation) | Medium (service disruption) | High (data loss / security breach) | Critical (platform compromise)
> - Rating: Low | Medium | High | Critical

## RISK-B1: Privilege Escalation via Missing Permission Gates

| Attribute | Value |
|---|---|
| Likelihood | High (any authenticated attendee can discover endpoints via Swagger) |
| Impact | High (attendee can modify orders, ticket products, campaign sends, webhook subscriptions) |
| Rating | **CRITICAL** |
| Root cause | 20+ service controllers rely on `JwtAuthGuard` only (see GAP-B1) |
| Scenario | A registered attendee calls `DELETE /v1/orders/:id` to cancel another user's order, or `POST /v1/campaigns/:id/send` to trigger mass email |
| Trigger | Must be authenticated (JWT required) — not exploitable anonymously |
| Mitigation | Add `@RequirePermissions` to all sensitive endpoints (GAP-B1 resolution) |
| Owner | REQUIRES APPROVAL — ADR needed for new permission codes |

---

## RISK-B2: Silent Event Loss — Commerce Workflow Integrity

| Attribute | Value |
|---|---|
| Likelihood | Low (Kafka is generally reliable; 10 retries cover transient failures) |
| Impact | High (payment confirmed but fulfillment never triggered, or notification never sent) |
| Rating | **HIGH** |
| Root cause | No DLQ — events permanently lost after 10 producer retries exhausted (GAP-B6) |
| Scenario | Kafka cluster brief unavailability during peak checkout → `payment.completed` events lost → orders confirmed but tickets never fulfilled |
| Mitigation | Outbox pattern provides some protection for initial write; implement DLQ or persistent retry (GAP-B6 resolution) |
| Owner | REQUIRES APPROVAL |

---

## RISK-B3: Auth Service CPU Exhaustion via Session Accumulation

| Attribute | Value |
|---|---|
| Likelihood | Medium (users accumulate sessions across devices over 7-day TTL windows) |
| Impact | Medium (auth service latency spike; potential timeout cascade) |
| Rating | **HIGH** |
| Root cause | `refresh()` O(n) bcrypt comparisons across all user sessions (GAP-B4) |
| Scenario | High-traffic event: thousands of concurrent attendees refreshing tokens; auth service CPU saturates; token refresh latency exceeds 30s; attendees get logged out |
| Trigger | Worsens with number of active sessions per user × concurrent refresh requests |
| Mitigation | Indexed refresh token lookup; max session cap per user (GAP-B4 resolution) |
| Owner | REQUIRES APPROVAL |

---

## RISK-B4: SSO Impersonation via Unsigned Assertion

| Attribute | Value |
|---|---|
| Likelihood | Low (requires attacker knowledge of SsoConnection structure and API access) |
| Impact | Critical (attacker can authenticate as any user in an SSO-enabled tenant) |
| Rating | **HIGH** |
| Root cause | SSO assertion signature not verified (GAP-G6 / SEC-007) |
| Scenario | Attacker knows the `connectionId` of a tenant's SSO connection, crafts a `SsoAssertionDto` with a victim's `externalId`, calls `/v1/auth/sso/callback` → receives valid JWT as victim |
| Mitigation | Implement assertion signature verification before any SSO production deployment (GAP-G6 resolution) |
| Owner | REQUIRES APPROVAL |

---

## RISK-B5: Database Tenant Isolation Bypass via Raw SQL

| Attribute | Value |
|---|---|
| Likelihood | Low (only internal developers with DB access can execute raw SQL) |
| Impact | Critical (all tenant data visible without tenant scoping) |
| Rating | **MEDIUM** |
| Root cause | Tenant isolation is application-layer only via `TenantScopedRepository`; no Postgres RLS |
| Scenario | Admin script, migration, or direct DB access bypasses application and reads/modifies records across all tenants |
| Mitigation | Implement Postgres RLS as defense-in-depth layer; restrict direct DB access to migration tooling only |
| Owner | REQUIRES APPROVAL |

---

## RISK-B6: `synchronize: true` Schema Destruction in Development

| Attribute | Value |
|---|---|
| Likelihood | Medium (developers routinely change entity files) |
| Impact | Medium (column drops in dev DB; data loss in dev environment) |
| Rating | **MEDIUM** |
| Root cause | TypeORM `synchronize: true` in non-production environments auto-applies entity changes including column drops |
| Scenario | Developer removes an entity column during refactor → TypeORM drops the column from dev DB → development data is lost / team coordination disrupted |
| Mitigation | Switch to migration-based workflow for all environments; only use `synchronize: true` for brand-new schemas in isolated dev |
| Owner | AUTONOMOUS (docs/config change) |

---

## RISK-B7: Route Collision Breaking Agenda or Speaker Sessions

| Attribute | Value |
|---|---|
| Likelihood | High (collision exists in current codebase — not a hypothetical) |
| Impact | Medium (one service's `/sessions` endpoints unreachable) |
| Rating | **MEDIUM** |
| Root cause | Duplicate `@Controller('sessions')` in `agenda` and `speaker` (GAP-B5) |
| Scenario | Module registration order determines winner; one service's CRUD operations silently fail with 404 or return wrong data |
| Mitigation | Rename prefixes; add integration tests verifying both paths resolve (GAP-B5 resolution) |
| Owner | REQUIRES APPROVAL (breaking API change) |

---

## RISK-B8: Webhook Spam / Abuse

| Attribute | Value |
|---|---|
| Likelihood | Medium (any authenticated user can register webhook subscriptions) |
| Impact | Medium (unauthorized external endpoint receives all platform events; DoS on target servers) |
| Rating | **MEDIUM** |
| Root cause | No `@RequirePermissions` on `POST /v1/integrations/webhooks` (GAP-B1); no rate limit on webhook subscriptions |
| Scenario | Authenticated attendee registers 100 webhooks pointing to attack infrastructure; every platform event is delivered to attacker |
| Mitigation | Add permission gate to webhook management; add rate limit on registrations |
| Owner | REQUIRES APPROVAL |

---

## RISK-B9: Weak Webhook Secrets Enable Spoofed Deliveries

| Attribute | Value |
|---|---|
| Likelihood | Low (current state: no HMAC signing at all — impact is future-dated) |
| Impact | Medium (when HMAC is implemented, weak secrets defeat it) |
| Rating | **LOW** |
| Root cause | No minimum length on webhook `secret` field (GAP-B8) |
| Scenario | Developer creates webhook subscription with empty string secret; when HMAC signing is added, all deliveries appear valid to any attacker who knows secret="" |
| Mitigation | Add `@MinLength(16)` before implementing HMAC; audit existing subscriptions |
| Owner | AUTONOMOUS (DTO validation change) |

---

## RISK-B10: OpenSearch Unavailability Blocks Search

| Attribute | Value |
|---|---|
| Likelihood | Low (OpenSearch is a managed service in production) |
| Impact | Low (search degraded; core event/commerce workflows unaffected) |
| Rating | **LOW** |
| Root cause | `SearchModule` is a required module in `app.module.ts`; if OpenSearch connection fails at startup, module initialization may fail |
| Scenario | OpenSearch cluster maintenance → API process fails to start → full platform outage instead of partial search degradation |
| Mitigation | Make `SearchModule` initialization non-fatal; add health check degradation (not hard fail) for OpenSearch |
| Owner | REQUIRES APPROVAL |

---

## Risk Summary Matrix

| Risk | Likelihood | Impact | Rating |
|---|---|---|---|
| RISK-B1: Privilege escalation | High | High | **CRITICAL** |
| RISK-B2: Silent event loss | Low | High | **HIGH** |
| RISK-B3: Auth CPU exhaustion | Medium | Medium | **HIGH** |
| RISK-B4: SSO impersonation | Low | Critical | **HIGH** |
| RISK-B5: DB isolation bypass (raw SQL) | Low | Critical | **MEDIUM** |
| RISK-B6: `synchronize: true` schema drops | Medium | Medium | **MEDIUM** |
| RISK-B7: Route collision | High | Medium | **MEDIUM** |
| RISK-B8: Webhook abuse | Medium | Medium | **MEDIUM** |
| RISK-B9: Weak webhook secrets | Low | Medium | **LOW** |
| RISK-B10: OpenSearch startup failure | Low | Low | **LOW** |

**Immediate action recommended**: RISK-B1 (privilege escalation) — critical
severity, high likelihood. All other risks are medium or lower priority and
can be addressed in planned sprints.
