Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Product Decision Register

> Phase 2.95 — Executed 2026-06-17.
> Consolidated register of all residual decisions after applying the
> Mandatory Collapse Test. Each decision has a single recommended path.
> 
> Classification:
> - **RESOLVED**: Evidence determines the answer; implement immediately (AUTONOMOUS)
> - **OWNER_CONFIRMATION_ONLY**: Recommendation is clear; implement unless explicitly rejected
> - **TRUE_OWNER_DECISION**: Vendor/cost/business choice; owner must confirm before proceeding

## Decision Register

| ID | Decision | Classification | Recommended Path | Frontend Impact |
|---|---|---|---|---|
| ROD-1 | Engagement module fate | OWNER_CONFIRMATION_ONLY | Remove `EngagementModule` and `services/engagement/` | No engagement pages; campaign UI under notification |
| ROD-2 | E2E test baseline timing | RESOLVED | Start Phase E in parallel; test incrementally (auth → commerce first) | None |
| ROD-3 | Permission scheme design | OWNER_CONFIRMATION_ONLY | Extend to 23 permissions (12 existing + 11 domain); update role matrix | Permission-gated navigation and actions can be designed |
| ROD-4 | Test coverage prioritization | RESOLVED | auth → rbac → tenant → payment → order → registration → ticketing → others | None |
| ROD-5 | JWT empty permissions | RESOLVED | DB lookup per request (current PermissionsGuard is correct) | Do not read `permissions` from JWT in frontend |
| ROD-6 | O(n) bcrypt mitigation | OWNER_CONFIRMATION_ONLY | Prefix-ID refresh token (`{sessionId}.{randomBytes}`) | Transparent to frontend |
| ROD-7 | Kafka DLQ | OWNER_CONFIRMATION_ONLY | Postgres-backed retry table with exponential backoff | None |
| ROD-8 | Kafka schema registry | RESOLVED | TypeScript interfaces in `infra/event-bus/src/schemas/` (no external infra) | None |
| ROD-9 | EventSettings entity | OWNER_CONFIRMATION_ONLY | Minimal 5-field entity: registrationOpensAt, registrationClosesAt, maxCapacity, requiresApproval, brandingConfig | Event settings page buildable |
| ROD-10 | Real embedding API | TRUE_OWNER_DECISION | OpenAI text-embedding-3-small (recommended); requires owner authorization | Build with graceful degradation; full-text fallback works |
| ROD-11 | Role model conflict | OWNER_CONFIRMATION_ONLY | Code wins — 8 roles are authoritative; update legacy security-model.md | Role management UI uses 8 roles |

## Resolved Items — Implement Immediately (AUTONOMOUS)

| ID | Action |
|---|---|
| ROD-2 | Phase E may begin in parallel with testing |
| ROD-4 | Begin auth tests first |
| ROD-5 | No change to JWT issuance — current DB-lookup approach is correct |
| ROD-8 | Add TypeScript interface schemas to `infra/event-bus/src/schemas/` |

## Owner Confirmation Items — Implement Unless Rejected

These are queued for implementation. Owner should review and explicitly reject any item they wish to change. Silence = proceed with recommended path.

| ID | Recommended Action | Escalation Tier | Estimate |
|---|---|---|---|
| ROD-1 | Remove `EngagementModule`; delete `services/engagement/` | REQUIRES_APPROVAL | Low effort |
| ROD-3 | Add 11 domain permissions; apply `@RequirePermissions` to 22 controllers | REQUIRES_APPROVAL (security) | High effort |
| ROD-6 | Prefix-ID refresh token format | REQUIRES_APPROVAL (auth change) | Medium effort |
| ROD-7 | Postgres-backed event DLQ entity + retry poller | REQUIRES_APPROVAL (new entity) | Medium effort |
| ROD-9 | `EventSettings` entity + `GET/PUT /v1/events/:id/settings` controller | REQUIRES_APPROVAL (new entity) | Low effort |
| ROD-11 | Update `docs/legacy/security-model.md` to reflect 8 authoritative roles | SAFE_REPOSITORY_HYGIENE | Minimal effort |

## True Owner Decision — Awaiting Input

| ID | Decision | Options | Recommendation |
|---|---|---|---|
| ROD-10 | Real embedding API vendor and cost authorization | A: OpenAI text-embedding-3-small / B: Cohere Embed v3 / C: Self-hosted | **Option A** — lowest cost, simplest integration |

## Stabilized Outputs (Available Immediately for Frontend Authority Capture)

The following are now stable for use as frontend authority sources, regardless of owner decisions:

| Item | Stabilized Content |
|---|---|
| Role list | 8 roles: tenant_admin, organizer, finance, support, exhibitor, speaker, onsite_staff, attendee |
| Permission list | 12 existing (governance) + 11 recommended domain permissions = 23 total |
| Engagement scope | No engagement-specific frontend; campaign UI is under notification service |
| Role experience model | See FRONTEND_IMPACT_ANALYSIS.md for per-role screen access |
| Event settings API | `GET/PUT /v1/events/:id/settings` (pending ROD-9 backend implementation) |
| JWT auth model | Do not read permissions from JWT; use RBAC API |
| Navigation baseline | 8 primary sections (excludes engagement) — see FRONTEND_IMPACT_ANALYSIS.md |
