Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-15
Owner: Shared

# Feature Scope

> Extracted from `docs/canon/service-map.md`, `docs/canon/capability-matrix.md`,
> `docs/tracking/gap-register.md`, and direct filesystem inspection of `services/`,
> `apps/`, and `design/` (26 service directories confirmed under `services/`).
> This document is the authoritative statement of **what is in scope, what is
> built, and what is explicitly out of scope** for the current phase.

## 1. In-Scope Product Lines

1. Enterprise Event Management (agenda, speakers, exhibitors, attendees, onsite,
   networking, interactive engagement).
2. Ticketing & Commerce (ticketing, pricing, inventory, order, payment, fulfillment).

Both share platform core (auth, tenant, rbac, audit) and intelligence/infra
layers (analytics, search, notification, event-bus, cache, ai-service,
integration).

## 2. All Services (26 total — built and scaffold)

| # | Service | Batch | Schema | Notes |
|---|---|---|---|---|
| 1 | auth | 1 | auth | incl. Enterprise SSO extension (`SsoConnection`, `SsoIdentity`, `/auth/sso/*`) |
| 2 | tenant | 1 | tenant | |
| 3 | rbac | 1 | rbac | |
| 4 | audit | 1 | audit | |
| 5 | event | 2 | event | lifecycle state machine |
| 6 | agenda | 2 | agenda | |
| 7 | speaker | 2 | speaker | |
| 8 | exhibitor | 2 | exhibitor | |
| 9 | attendee | 2 | attendee | |
| 10 | registration | 3 | registration | |
| 11 | onsite | 3 | onsite | |
| 12 | ticketing | 4 | ticketing | |
| 13 | pricing | 4 | pricing | |
| 14 | inventory | 4 | inventory | |
| 15 | order | 4 | order | |
| 16 | payment | 4 | payment | |
| 17 | fulfillment | 4 | fulfillment | |
| 18 | notification | 5 | notification | incl. `Campaign`/`AudienceSegment`/`CampaignController` (`/campaigns`) — see §3 |
| 19 | engagement | 5 | engagement | **near-empty stub** — see §3 |
| 20 | analytics | 6 | analytics | CQRS read model |
| 21 | search | 6 | search | CQRS read model (OpenSearch) |
| 22 | networking | 8 (gap-fill) | networking | Connection/social graph |
| 23 | interactive-engagement | 9 (gap-fill) | interactive_engagement | Poll/Q&A/Survey |
| 24 | ai-service | 10 (gap-fill) | ai_service | embeddings, AI assistant, agent automation |
| 25 | integration | cross-cutting | integration | webhook fan-out |
| 26 | ui-renderer | Phase E | — | **scaffold only**, not built |

Plus 2 infra modules: `infra/event-bus` (Kafka client + outbox relay),
`infra/cache` (Redis client, rate limiter, idempotency store) — both
`Status: Implemented`.

`apps/api` is the single NestJS HTTP entrypoint registering all 26 service
modules (`apps/api/src/app.module.ts` — verified 27 `Module,` registrations,
32 unique `*Module` symbols including `AppModule` and infra modules).

## 3. Explicitly Out of Scope / Unbuilt (do not assume these exist)

- **`apps/web`** — Next.js frontend. Directory contains only `README.md`.
  Phase E, not started.
- **`design/tokens`, `design/components`, `design/wireframes`** — each
  contains only a 9-line `README.md` stub. Required before `apps/web` and
  `services/ui-renderer` can be built (GAP-4).
- **`services/ui-renderer`** — scaffold only (`Status: SCAFFOLD`), Phase E.
- **`services/engagement`** — currently a near-empty module: `engagement.controller.ts`
  is a 2-line comment stating that connection/poll/Q&A/survey controllers moved
  to `networking`/`interactive-engagement` (GAP-2, resolved 2026-06-14); no
  entities directory contents. `Campaign`/`AudienceSegment` entities (originally
  specified under `engagement` in `docs/canon/domain-model.md`) were instead
  implemented under **`services/notification`**
  (`services/notification/src/entities/campaign.entity.ts`,
  `audience-segment.entity.ts`, `CampaignController` at `/campaigns`,
  `notification.service.ts: scheduleCampaign/listCampaigns`). This placement
  differs from `docs/canon/domain-model.md` / `docs/canon/service-map.md` and
  is tracked as GAP-G3 in `08_reports/ARCHITECTURAL_GAP_REGISTER.md`. `engagement`
  itself should likely be removed or repurposed — open question, see
  `07_governance/AI_OPERATING_CONTEXT.md` Open Architectural Questions.
- **`apps/web` Dockerfile** — deferred to Phase E (GAP-5).
- **Webhook HMAC signing / retry & dead-letter delivery** in `integration` —
  deferred hardening, not yet implemented (GAP-3 resolution note).
- **Live OAuth2/SAML assertion signature verification** in `auth` SSO —
  `ssoLogin()` assumes the assertion was already verified upstream; signature
  verification against `issuer`/`certificate` is deferred hardening (GAP-6
  resolution note).
- **AI architecture detail beyond summary** — `docs/legacy/ai-architecture.md`
  (relocated 2026-06-17) is the source of truth for `ai-service`; this charter only summarizes it.

## 4. Frozen vs Open Scope

- **Frozen for current phase**: all 26 service module boundaries
  (`docs/canon/service-map.md`), domain entity ownership
  (`docs/canon/domain-model.md`), event catalog
  (`docs/canon/event-catalog.md`), API conventions
  (`docs/canon/api-standards.md`). Changing these requires an ADR (see
  `06_decisions/` and `07_governance/DECISION_ESCALATION_MATRIX.md`).
  **Exception**: the placement of `Campaign`/`AudienceSegment` under
  `notification` vs `engagement` (GAP-G3) is a known pending exception to the
  "frozen boundaries" rule — it is treated as a REQUIRES APPROVAL decision
  (ADR-002 in `08_reports/RECOMMENDED_ADR_ROADMAP.md`) rather than being
  fully frozen. Until ADR-002 is resolved, the current implementation
  (`notification` owns these) is authoritative.
- **Open**: Phase E (frontend) scope — design tokens, `apps/web`, `ui-renderer`,
  `apps/web` Dockerfile. These are scoped in `docs/ui/design-system.md` and
  `apps/web/README.md` but not yet started; their detailed task breakdown
  (TASK 02–05) is **TBD – REQUIRES VERIFICATION** against current `prompts/`
  directory contents at the time Phase E begins.

## 5. Known Documentation Staleness Affecting Scope Understanding

`docs/tracking/progress.md` (last updated 2026-06-13) marks Batches 8–10
(networking, interactive-engagement, ai-service), Enterprise SSO, and
`integration` as "Not started" / "Outstanding work." This is **incorrect** as
of 2026-06-15 — all five are implemented per `docs/tracking/gap-register.md`
(GAP-3 and GAP-6 resolved 2026-06-14, and Batches 8–10 confirmed present as
`services/networking`, `services/interactive-engagement`,
`services/ai-service`). See `08_reports/ARCHITECTURAL_GAP_REGISTER.md` item
GAP-G1 for the full conflicting-documentation finding. `progress.md` itself
has been left unmodified per execution rule "Preserve existing documentation";
this scope document is the corrective authority until `progress.md` is
refreshed.
