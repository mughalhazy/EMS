Status: Active
Authority Level: Medium
Last Reviewed: 2026-06-15
Owner: AI

# Recommended ADR Roadmap

> Derived from architectural risks, open questions, and deferred-hardening
> items identified during GOVERNANCE IMPLEMENTATION PHASE 1.
> See `08_reports/ARCHITECTURAL_GAP_REGISTER.md` for gap-level detail.
> Each ADR below is a REQUIRES APPROVAL decision
> (`07_governance/DECISION_ESCALATION_MATRIX.md`).

## ADR-002 (Recommended next): Campaign / Engagement Service Ownership

- **Question**: Does `Campaign`/`AudienceSegment` belong under
  `services/notification` (where it is currently implemented) or
  `services/engagement` (where `docs/canon/domain-model.md` / `service-map.md`
  place it)?
- **Options**: (a) Update canon docs to make `notification` the owner and
  formally retire/repurpose `services/engagement`. (b) Migrate
  `Campaign`/`AudienceSegment` entities and `CampaignController` from
  `notification` to `engagement`. (c) Split: `notification` owns delivery
  mechanics, `engagement` owns campaign lifecycle — introduce an event-driven
  handoff.
- **Risk if unresolved**: Ongoing documentation/code divergence (GAP-G3);
  future sessions may implement duplicate campaign logic in the wrong service.
- **Priority**: High — should be resolved before adding any further campaign
  features.

## ADR-003: Security Hardening — SSO Assertion Verification

- **Question**: When and how will live OAuth2 token / SAML assertion signature
  verification be added to `services/auth` `SsoController.ssoCallback()`?
- **Current state**: `AuthService.ssoLogin()` accepts a pre-verified DTO
  without performing cryptographic verification against `SsoConnection.issuer`
  / `SsoConnection.certificate`.
- **Risk if unresolved**: Production SSO flow accepts unverified identity
  assertions — authentication bypass vector (GAP-G6 item 1).
- **Priority**: High — block before any production SSO deployment.

## ADR-004: Security Hardening — Webhook HMAC Signing

- **Question**: When and how will HMAC signing and retry/dead-letter delivery
  be added to `services/integration` (`WebhookSubscription` fan-out)?
- **Current state**: Outbound webhook HTTP POSTs carry no cryptographic
  signature; no retry on failure, no dead-letter queue (GAP-G6 item 2).
- **Risk if unresolved**: Webhook consumers cannot verify payload authenticity;
  transient failures silently drop events.
- **Priority**: Medium — block before production use of `integration` webhooks.

## ADR-005: Test Strategy

- **Question**: What is the testing strategy for the 22/26 services that
  currently have zero `.spec.ts` files? What minimum test coverage must exist
  before a service is considered "shippable"?
- **Options**: (a) Unit-test all services with Jest, mocking Postgres/Kafka/
  Redis. (b) Integration-test with a real Docker stack per `infra/docker/`
  (requires Docker on dev machine — currently absent). (c) Contract-test only
  critical service boundaries. (d) Combination.
- **Current state**: 4/26 services have 1 `.spec.ts` each (`auth`,
  `notification`, `onsite`, `order`); `test:e2e` script references
  `./test/jest-e2e.json` (existence unverified — GAP-G4).
- **Priority**: High — this is the single highest-risk finding from Phase 1
  (ADR-001 "Known Risks" §1).

## ADR-006: Deployment Architecture — Single Process vs. Split Services

- **Question**: Is the current single-process deployment of all 26 modules
  inside `apps/api` intentional for the long term, or is there a plan to split
  into separately deployable services (true microservices)?
- **Current state**: All 26 NestJS modules registered in one `AppModule`
  (`apps/api/src/app.module.ts`). `infra/docker/docker-compose.app.yml`
  provisions a single `api` container.
- **Implication**: A module-level bug or resource exhaustion (e.g. in
  `ai-service`) affects the entire API surface.
- **Priority**: Medium — becomes urgent at the point of horizontal scaling or
  reliability SLA commitment.

## ADR-007: Frontend Architecture Kickoff (Phase E)

- **Question**: Confirm Next.js version, Tailwind config, design token
  strategy, state management approach, and API client pattern for `apps/web`
  before Phase E starts.
- **Dependencies**: GAP-4 (design tokens in `design/tokens/` must be
  populated first); GAP-5 (`apps/web` Dockerfile); `docs/ui/design-system.md`
  (need full read — only referenced this phase, not verified in detail).
- **Priority**: Medium — Phase E entry gate.

## ADR-008: `docs/tracking/progress.md` Fate

- **Question**: Should `progress.md` be refreshed to reflect current reality,
  deprecated in favor of `gap-register.md` + `docs/00_authority/FEATURE_SCOPE.md`,
  or maintained as a historical artifact only?
- **Current state**: Last updated 2026-06-13; now stale on at least 5 items
  (GAP-G1).
- **Priority**: Low — misleading for AI sessions; human readers presumably
  know the real state. But cheap to resolve.

## Sequencing Recommendation

```
ADR-003 (SSO hardening)      ─┐
ADR-004 (webhook HMAC)        ├─ Hardening track — parallel, before any prod exposure
ADR-005 (test strategy)      ─┘

ADR-002 (campaign ownership)  ─ Canon reconciliation — before next feature
ADR-006 (deployment model)    ─ Architecture clarity — before scaling commitment
ADR-007 (Phase E kickoff)     ─ Requires ADR-002 resolved + GAP-4 design tokens done
ADR-008 (progress.md)         ─ Low priority, any time
```
