Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Repository Determinability Review

> Phase 2.9 — Executed 2026-06-17 before Frontend Authority Capture.
> Reviews every open item from all prior passes and applies the Repository
> Determinability Test: if evidence exists to determine the answer, the AI
> must resolve it. Escalation is prohibited unless business/product/security
> intent is genuinely required.

## Evidence Sources Reviewed

| Source | Files Read |
|---|---|
| Entity files | 25+ `services/*/src/entities/*.entity.ts` files (all undocumented entity columns extracted) |
| Service files | All 26 `services/*/src/*.service.ts` files (subscriber topics and group IDs extracted) |
| Controller files | `services/agenda/src/agenda.controller.ts`, `services/speaker/src/speaker.controller.ts` (routing collision verified) |
| DTO files | `services/integration/src/dto/integration.dto.ts` |
| Infra files | `infra/docker/init/postgres-init.sql`, `infra/event-bus/src/topics.ts` |
| CI/CD | `.github/workflows/ci.yml` |
| Authority docs | All docs/00_authority/, docs/07_governance/, docs/08_reports/ |
| Gap registers | ARCHITECTURAL_GAP_REGISTER.md, BACKEND_GAP_REGISTER.md |
| Delta logs | docs/tracking/delta-log.md |
| Tracking | docs/tracking/progress.md |

## Determinability Findings by Item

### Open Items from OWNER_APPROVAL_ITEMS_BEFORE_PHASE3.md

| Item | Original Classification | Determinability Decision | Resolution |
|---|---|---|---|
| OA-1: postgres-init.sql `"order"` → `"ordering"` | REQUIRES_APPROVAL | **Repository Determinable** — entity says `ordering`, SQL says `order`. Single correct answer, no business intent needed. | ✅ Fixed: line 18 corrected 2026-06-17 |
| OA-2: Pagination strategy | REQUIRES_APPROVAL | **Documentation Correction** — `API_CONTRACT.md` already correctly documents page-based. `api-standards.md` is Retired. No owner decision needed to clarify what exists. | ✅ Resolved: page-based is documented as implemented standard |
| OA-3: Engagement module fate | REQUIRES_APPROVAL | **Remains: Product Policy Decision** — repository evidence shows zero routes, zero entities, comment says "moved." Removal is safe but the DECISION to remove a registered module is product scope, not code inference. | Documented with strong recommendation to remove |
| OA-4: progress.md deprecation | REQUIRES_APPROVAL | **SAFE_REPOSITORY_HYGIENE** — already has retirement header. Moving it to docs/legacy/ is purely organizational. | ✅ Executed: moved to docs/legacy/ 2026-06-17 |
| OA-5: Extractability constraint | REQUIRES_APPROVAL | **Repository Determinable** — the architectural patterns (schema-per-service, no cross-schema FKs, Kafka-only coupling, outbox pattern) already commit to extractability. This is readable from the code. | ✅ Resolved: patterns confirm extractable monolith; noted in FROZEN_DECISIONS |
| OA-6: E2E test baseline timing | REQUIRES_APPROVAL | **Remains: Product Policy Decision** — timeline/prioritization is genuinely owner-controlled | Carries to RESIDUAL_OWNER_DECISION_REGISTER |

### Open Items from BACKEND_GAP_REGISTER.md

| Item | Original Classification | Determinability Decision | Resolution |
|---|---|---|---|
| GAP-B1: @RequirePermissions coverage | Open | **Repository Determinable** — grep confirms exactly 4 controllers have `@RequirePermissions`. The gap is measurable and documented. Fix requires permission code design: **Security Policy Decision** for the permission scheme, but the gap's extent is fully determined. | Gap confirmed as 22 controllers; resolution requires security policy |
| GAP-B2: Test coverage 22/26 zero | Open | **Product Policy Decision** — no repository evidence can tell us which service to test first | Carries to RESIDUAL_OWNER_DECISION_REGISTER |
| GAP-B3: JWT empty permissions | Open | **Architecture Decision** — two valid approaches (JWT snapshot vs. DB lookup). Evidence shows current DB-lookup approach is consistent across codebase. | Carries; recommend DB-lookup as documented approach |
| GAP-B4: O(n) bcrypt refresh | Open | **Architecture Decision** — fix is repository-determinable (add hash index) but modifying auth behavior needs approval | Fix path clear; carries to RESIDUAL_OWNER_DECISION_REGISTER |
| GAP-B5: Controller routing collision | Open (Medium) | **Repository Determinable** — read both controllers. Routing does NOT actually collide due to path depth differentiation. | ✅ Downgraded to Low; no action required |
| GAP-B6: No Kafka DLQ | Open | **Architecture Decision** — design choice | Carries |
| GAP-B7: No Kafka schema registry | Open | **Architecture Decision** — design choice | Carries |
| GAP-B8: Webhook secret min length | Open | **Repository Determinable + Autonomous** — pure DTO validation fix, no behavior change | ✅ Fixed: @MinLength(16) added 2026-06-17 |
| GAP-B9: OpenSearch not verified | Open | **Repository Determinable** — read package.json and entity. No OpenSearch. | ✅ Closed (prior session) |
| GAP-B10: pgvector not verified | Open | **Repository Determinable** — entity uses JSONB. | ✅ Closed (prior session) |
| GAP-B11: EventSettings missing | Open | **Product Policy Decision** — whether to implement is scope decision | Carries |
| GAP-B12: Analytics schema TBD | Open | **Repository Determinable** — read entities | ✅ Closed (prior session) |
| GAP-B13: EngagementModule dead | Open | **Product Policy Decision** — removal is safe but scope change | Carries; strong evidence for removal |
| GAP-B14: AI embeddings placeholder | New (this pass) | **Repository Determinable** — code shows `vector: []`. Gap is documented. | Fix requires **API/Cost Decision** |
| GAP-B15: Integration 23 missing topics | New (this pass) | **Repository Determinable** — hardcoded list vs. topics.ts verified. Fix is AUTONOMOUS. | Documented; fix is a 2-line change |

### Unverified Claims (UNVERIFIED_CLAIMS_REGISTER.md)

| Item | Determinability Decision | Outcome |
|---|---|---|
| UC-1: Outbox pattern completeness | Partially determinable | Outbox pattern verified in base repository; full service coverage not checked; remains medium-risk |
| UC-2: Consumer group IDs | ✅ Repository Determinable | All group IDs extracted from service code. Documented in SERVICE_CATALOG.md |
| UC-3: @RequirePermissions coverage | ✅ Repository Determinable | Grep confirmed: 4 controllers (auth, audit, rbac, tenant). 22 without @RequirePermissions |
| UC-4: Session routing collision | ✅ Repository Determinable | Read both controllers. No actual collision — path depth differentiation works |
| UC-5: Kafka subscriber list | ✅ Repository Determinable | All service subscribers verified by reading onModuleInit(). Updated in SERVICE_CATALOG.md and EVENT_AND_QUEUE_ARCHITECTURE.md |
| UC-6: Fulfillment trigger topic | ✅ Repository Determinable | Fulfillment subscribes to `order.paid` (NOT `payment.completed`). Docs corrected. |
| UC-7: Registration status machine | ✅ Repository Determinable | 5-state enum confirmed: submitted\|approved\|confirmed\|waitlisted\|cancelled |
| UC-8: ai-architecture.md accuracy | ✅ Repository Determinable | Embedding is placeholder (`vector: []`). ai-architecture.md describes aspirational state, not current code. |
| UC-9: Multi-tenant base repo | Partially determinable | DATABASE_SCHEMA.md references TenantScopedRepository. Full service coverage not confirmed this pass. |

### Open TBDs (TBD_RESOLUTION_REGISTER.md)

| Item | Determinability Decision | Outcome |
|---|---|---|
| TBD-O1: progress.md | ✅ SAFE_REPOSITORY_HYGIENE | Moved to docs/legacy/ |
| TBD-O2: ai-architecture.md accuracy | ✅ Repository Determinable | Embedding is placeholder; ai-architecture.md describes target, not current. Note added to SERVICE_CATALOG.md. |
| TBD-O3: Column schemas for 9 entities | ✅ Repository Determinable | All 9 entities read; columns updated in DATABASE_SCHEMA.md |
| TBD-O4: Fullstack stitching contract | Repository Determinable | Updated fields: Fulfillment trigger, Registration userId, various column corrections |
| TBD-O5: DELTA-7 pagination | ✅ Documentation Correction | API_CONTRACT.md was already correct; api-standards.md is Retired. No decision needed. |

## New Findings This Pass (Not in Prior Registers)

| Finding | Classification | Action |
|---|---|---|
| Fulfillment triggers on `order.paid` (not `payment.completed`) | Documentation Delta | ✅ Fixed in SERVICE_CATALOG.md, EVENT_AND_QUEUE_ARCHITECTURE.md |
| Notification only subscribes to 3 events (not "multiple") | Documentation Delta | ✅ Fixed |
| Analytics subscribes to 11 specific events (not "all platform events") | Documentation Delta | ✅ Fixed |
| AI embeddings are placeholder (`vector: []`) | New Gap (GAP-B14) | Documented; requires API/cost decision |
| Integration service missing 23 of 64 topics | New Gap (GAP-B15) | Documented; AUTONOMOUS fix available |
| Speaker subscribes to `session.created`, `session.cancelled` | Documentation Gap | ✅ Fixed |
| Onsite subscribes to `attendee.created` | Documentation Gap | ✅ Fixed |
| Registration subscribes to `event.cancelled` | Documentation Gap | ✅ Fixed |
| Interactive-engagement subscribes to `event.cancelled` | Documentation Gap | ✅ Fixed |
| Exhibitor subscribes to `event.created`, `attendee.created` | Documentation Gap | ✅ Fixed |
| Inventory subscribes to `ticket_product.created`, `order.cancelled`, `fulfillment.completed` | Documentation Gap | ✅ Fixed |
| Ticketing subscribes to `fulfillment.completed` | Documentation Gap | ✅ Fixed |
| Order subscribes to `payment.completed`, `payment.failed`, `fulfillment.completed` | Documentation Gap | ✅ Fixed |
| Networking has no Kafka subscribers | Documentation Gap | ✅ Fixed |
| SponsorPackage has no tenantId, uses `tier` not `name` | Schema Correction | ✅ Fixed in DATABASE_SCHEMA.md |
| Lead has no tenantId | Schema Correction | ✅ Fixed in DATABASE_SCHEMA.md |
| Registration uses `userId` not `attendeeId` | Schema Correction | ✅ Fixed in DATABASE_SCHEMA.md |
| BadgePrint has `eventId`, `copies`, `deviceId` (not `badgeFormat`) | Schema Correction | ✅ Fixed in DATABASE_SCHEMA.md |
| Fulfillment uses `status`+`completedAt` (not `dispatchedAt`/`deliveredAt`) | Schema Correction | ✅ Fixed in DATABASE_SCHEMA.md |
| AttendeeConnection uses `requesteeId` (not `targetId`) | Schema Correction | ✅ Fixed in DATABASE_SCHEMA.md |
| AudienceSegment has `campaignId` (not `name`) | Schema Correction | ✅ Fixed in DATABASE_SCHEMA.md |
| PaymentTransaction has `amountCents`, `currency`, `status`, `providerRef` | Schema Correction | ✅ Fixed in DATABASE_SCHEMA.md |
