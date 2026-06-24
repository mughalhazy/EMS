Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Architectural Gap Register (Governance Phase 1)

> Findings from the GOVERNANCE IMPLEMENTATION PHASE 1 audit (2026-06-15).
> This register is separate from `docs/tracking/gap-register.md`, which
> tracks implementation gaps (GAP-1..GAP-7, all resolved as of 2026-06-14).
> This register tracks **governance/documentation/architecture** gaps
> discovered during this phase, prefixed `GAP-G`.

## GAP-G1: `docs/tracking/progress.md` is stale / conflicts with actual repo state

- **Severity**: Medium (misleading, not blocking)
- **Evidence**: `docs/tracking/progress.md` (last updated 2026-06-13) marks
  Batches 8–10 (`networking`, `interactive-engagement`, `ai-service`),
  Enterprise SSO, and `integration` as "Not started" / "Outstanding work."
  However:
  - `services/networking`, `services/interactive-engagement`,
    `services/ai-service`, `services/integration` all exist with source code,
    entities, controllers, and `Status: Implemented` READMEs.
  - `services/auth` includes the SSO extension (`SsoConnection`,
    `SsoIdentity`, `SsoController`), resolved as GAP-6 in
    `docs/tracking/gap-register.md` on 2026-06-14.
- **Conflicting documentation**: `progress.md` vs. `docs/tracking/gap-register.md`
  vs. actual filesystem/source state. `gap-register.md` and the filesystem are
  consistent with each other; `progress.md` is the outlier.
- **Recommendation**: Refresh `progress.md` to mark Batches 8–10, SSO, and
  `integration` as complete, OR deprecate `progress.md` in favor of
  `gap-register.md` + `docs/00_authority/FEATURE_SCOPE.md`. This is an
  AUTONOMOUS documentation task per `07_governance/DECISION_ESCALATION_MATRIX.md`
  but was **not performed** in this phase because Phase 1 instructions require
  preserving existing documentation and this phase is "governance, not
  implementation" — left for a follow-up pass or explicit user instruction.

## GAP-G2: Workflow Catalog Workflow 10 (Campaign Delivery) ownership mismatch — resolved by reclassification, see GAP-G3

- **Severity**: N/A — superseded
- **Note**: Initial analysis assumed Campaign Delivery was unimplemented
  (matching `docs/canon/workflow-catalog.md`'s implied ownership by
  `engagement`). Deeper verification (controller/entity grep) found it IS
  implemented, under `notification`. Reclassified as GAP-G3 (placement
  deviation) rather than a missing-feature gap. Retained here as a record of
  the correction made during this audit.

## GAP-G3: `Campaign`/`AudienceSegment` implemented under `notification`, not `engagement` as canon docs imply

- **Severity**: Medium (documentation/ownership clarity, not a functional bug)
- **Evidence**:
  - `services/notification/src/entities/campaign.entity.ts`,
    `audience-segment.entity.ts` exist (verified).
  - `services/notification/src/notification.controller.ts` exports
    `CampaignController` at `/campaigns` with `POST /campaigns`,
    `GET /campaigns`, `POST /campaigns/:id/send`, backed by
    `NotificationService.scheduleCampaign`/`listCampaigns` (verified).
  - `services/engagement/src/` contains only a stub controller (2-line file:
    "Controllers for connections, polls, Q&A, and surveys have moved to the
    `networking` and `interactive-engagement` services."), a 6-line service,
    and an 8-line module — no entities directory contents (verified).
  - `docs/canon/domain-model.md` and `docs/canon/service-map.md` (per Batch 5
    module grouping in `00_authority/PROJECT_CHARTER.md` §4) imply `engagement`
    owns campaign/audience-segment concerns.
- **Duplicate/conflicting documentation**: canon docs (service ownership) vs.
  actual code (notification owns it).
- **Recommendation**: REQUIRES APPROVAL decision — either (a) update
  `docs/canon/domain-model.md`/`service-map.md` to reflect `notification` as
  the owner of `Campaign`/`AudienceSegment` and formally retire/repurpose
  `services/engagement`, or (b) migrate the entities/controller from
  `notification` to `engagement` to match canon. Tracked as Open
  Architectural Question #1 in `07_governance/AI_OPERATING_CONTEXT.md`.

## GAP-G4: Test coverage is critically low across the platform

- **Severity**: High (risk to safe iteration, flagged in ADR-001 "Known Risks")
- **Evidence**: `find services/*/  -name "*.spec.ts" | wc -l` per service —
  only `auth` (1), `notification` (1), `onsite` (1), `order` (1) have any
  unit test file. The remaining 22 services (agenda, ai-service, analytics,
  attendee, audit, engagement, event, exhibitor, fulfillment, integration,
  interactive-engagement, inventory, networking, payment, pricing, rbac,
  registration, search, speaker, tenant, ticketing, ui-renderer) have **zero**
  `.spec.ts` files.
- **Missing testing coverage**: per-service unit tests for entities, services,
  controllers; no e2e suite content verified (`./test/jest-e2e.json`
  referenced by `package.json` `test:e2e` script but existence/content
  TBD – REQUIRES VERIFICATION).
- **Recommendation**: AUTONOMOUS task — adding `.spec.ts` files for existing
  services is explicitly AUTONOMOUS per `DECISION_ESCALATION_MATRIX.md`. This
  is the single highest-value follow-up identified by this audit, but is
  implementation work and therefore out of scope for Phase 1 (documentation
  only).

## GAP-G5: Permission Model (`@RequirePermissions`) coverage not fully verified

- **Severity**: Medium (security-relevant, unverified rather than confirmed-missing)
- **Evidence**: `@RequirePermissions(...)` usage was grep-verified only for
  `audit`, `rbac`, `tenant`, and `auth` (SSO) controllers (19 occurrences
  total). The remaining 22 services' controllers were not individually
  checked for permission decorators in this pass.
- **Missing permissions knowledge**: it is **TBD – REQUIRES VERIFICATION**
  whether every mutating endpoint across all 26 services is permission-gated,
  or whether some rely solely on `JwtAuthGuard` (authentication without
  fine-grained authorization).
- **Recommendation**: A full controller-by-controller permission audit should
  be performed (AUTONOMOUS — documentation/analysis only) and the results fed
  into `00_authority/FULLSTACK_STITCHING_CONTRACT.md`.

## GAP-G6: Deferred security hardening (carried forward from `gap-register.md`)

- **Severity**: Medium–High (pre-production blocker)
- **Items**:
  1. OAuth2/SAML assertion signature verification in `services/auth` SSO
     (`ssoLogin()` assumes pre-verified assertions) — from GAP-6 resolution.
  2. Webhook HMAC signing + retry/dead-letter in `services/integration` —
     from GAP-3 resolution.
- **Recommendation**: Both are REQUIRES APPROVAL (auth changes / infra-facing
  contract changes respectively per `DECISION_ESCALATION_MATRIX.md`). Should
  be scheduled before any production exposure of SSO login or outbound
  webhooks.

## GAP-G7: AI architecture detail not independently verified this pass

- **Severity**: Low
- **Evidence**: `00_authority/PROJECT_CHARTER.md` §6 summarizes AI
  capabilities by reference to `docs/architecture/ai-architecture.md`, which
  was **not read in full during this governance pass** (referenced by file
  name only, content not verified).
- **Recommendation**: Read and cross-check `docs/architecture/ai-architecture.md`
  against `services/ai-service` source in a follow-up pass; update
  `00_authority/DOMAIN_MODEL.md` §8 if discrepancies are found.

## GAP-G8: Frontend stack version unconfirmed

- **Severity**: Low (Phase E not started, low urgency)
- **Evidence**: `apps/web` contains only `README.md` — no `package.json`, so
  Next.js version and frontend dependency choices referenced in
  `docs/ui/design-system.md` / `apps/web/README.md` are unconfirmed against
  an actual lockfile.
- **Recommendation**: Verify at Phase E kickoff.

## GAP-G9: Entity naming deviations between governance DOMAIN_MODEL and actual code

- **Severity**: High (governance docs were using canon names that differ from code)
- **Evidence**: Direct filesystem inspection of all `services/*/src/entities/`
  directories during AUDIT REMEDIATION (2026-06-15) revealed the following
  deviations from names stated in `docs/canon/domain-model.md` and the
  original `docs/00_authority/DOMAIN_MODEL.md`:

  | Service | Code entity name(s) | Was documented as |
  |---|---|---|
  | ticketing | `TicketProduct`, `Ticket`, `TicketEntitlement` | `TicketType`, `Ticket` |
  | pricing | `PriceRule`, `DiscountRule`, `PromoCode` | `PriceRule`, `Discount`, `PromoCode` |
  | inventory | `InventoryItem` | `InventoryPool`, `InventoryReservation` |
  | fulfillment | `Fulfillment` | `FulfillmentRequest`, `DeliveryRecord` |
  | registration | `Registration`, `RegistrationField` | `Registration`, `RegistrationForm`, `RegistrationAnswer` |
  | onsite | `CheckIn`, `BadgePrint`, `DeviceSession` | `CheckIn`, `Badge`, `SessionAttendance` |
  | networking | `AttendeeConnection` | `Connection` |
  | event | `Event`, `Venue`, `Room` | `Event`, `Venue`, `EventSettings` (`Room` was attributed to `agenda`) |
  | agenda | `Session`, `Track` | `Session`, `Track`, `Room` |
  | auth | `User`, `UserCredential`, `AuthSession`, `SsoConnection`, `SsoIdentity` | `User`, `AuthSession`, `SsoConnection`, `SsoIdentity` (`UserCredential` missing) |
  | tenant | `Tenant`, `TenantSettings`, `Organization` | `Tenant`, `TenantSettings` (`Organization` missing) |
  | speaker | `Speaker`, `SpeakerProfile`, `SessionSpeaker` | `Speaker`, `SpeakerProfile` (`SessionSpeaker` junction missing) |
  | attendee | `Attendee`, `AttendeeProfile`, `AttendeeTag` | `Attendee`, `AttendeeProfile` (`AttendeeTag` missing) |
  | exhibitor | `Exhibitor`, `Booth`, `SponsorPackage`, `Sponsor`, `Lead` | `Exhibitor`, `Booth`, `SponsorPackage`, `Lead` (`Sponsor` missing) |
  | payment | `Payment`, `Refund`, `PaymentTransaction` | `Payment`, `Refund` (`PaymentTransaction` missing) |
  | ai-service | `VectorEmbedding`, `AIInteractionLog` | `VectorEmbedding`, `AIInteractionLog`, "agent-automation records" (no such entity in code) |

- **Status**: Partially resolved — `docs/00_authority/DOMAIN_MODEL.md` has
  been updated to use verified code entity names with deviation notes.
  `docs/canon/domain-model.md` remains at its pre-REMEDIATION state (preserved
  per existing policy). Reconciling canon doc vs. code is a REQUIRES APPROVAL
  decision (ADR needed: is canon ahead of code, or did code diverge?).
- **Recommendation**: Before any new entity work, resolve whether
  `docs/canon/domain-model.md` names are the intended target (code should be
  renamed) or whether the code names are correct (canon doc should be updated).

## Summary Table

| ID | Title | Severity | Type | Status |
|---|---|---|---|---|
| GAP-G1 | `progress.md` stale vs. actual state | Medium | Conflicting documentation | Open |
| GAP-G2 | (superseded by GAP-G3) | — | — | Closed (reclassified) |
| GAP-G3 | Campaign/AudienceSegment placement deviation | Medium | Conflicting documentation / missing contract | Open |
| GAP-G4 | Test coverage critically low | High | Missing testing coverage | Open |
| GAP-G5 | Permission model coverage unverified | Medium | Missing permissions knowledge | Open |
| GAP-G6 | Deferred SSO/webhook security hardening | Medium-High | Missing architecture (security) | Open (carried forward) |
| GAP-G7 | AI architecture doc not cross-checked | Low | Unverified assumption | Open |
| GAP-G8 | Frontend stack version unconfirmed | Low | Missing deployment knowledge | Open |
| GAP-G9 | Entity naming deviations between governance docs and code | High | Conflicting documentation | Partially resolved (DOMAIN_MODEL updated; canon doc reconciliation pending ADR) |
| GAP-G10 | Role model conflict: canon defines 9 roles, code implements 8 with different names/coverage | High | Conflicting documentation | Open — surfaced by Full Repository Normalization Audit 2026-06-17 |
| GAP-G11 | `postgres-init.sql` creates schema `"order"` but TypeORM entities expect `"ordering"` | Critical | Infrastructure bug | ✅ **FIXED 2026-06-17** — line 18 corrected from `"order"` to `"ordering"`. Run `docker:reset` to rebuild volumes. |
