Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-15
Owner: Shared

# ADR-001: Project Foundation

## Status

Accepted (retroactively documented — reflects decisions already embodied in
the codebase as of 2026-06-15, not a proposal).

## Context

This is the first ADR for the EMS project, written as part of GOVERNANCE
IMPLEMENTATION PHASE 1. The codebase already implements a substantial backend
(26 services, Batches 1–10 + Enterprise SSO + `integration`) without prior
ADRs. This ADR records the foundational decisions as evidenced by the code and
canonical docs, so future ADRs have a baseline to reference and diff against.

## Project Purpose

EMS is a multi-tenant SaaS platform combining (1) Enterprise Event Management
and (2) Ticketing & Commerce, serving 8 personas (Platform Admin, Organizer,
Finance, Support, Exhibitor, Speaker, Onsite Staff, Attendee) across the full
event lifecycle (draft → published → live → archived, or cancelled).
Source: `docs/product/product-overview.md`, summarized in
`00_authority/PROJECT_CHARTER.md`.

## Current Architecture

- **Style**: modular monolith with event-driven integration. All 26 service
  modules run inside a single NestJS process (`apps/api`), but communicate
  asynchronously via Kafka events with an outbox pattern for transactional
  emission (`docs/architecture/system-architecture.md`).
- **Boundaries**: one NestJS module per business capability under
  `services/<name>/`, each owning a Postgres schema named after itself. No
  cross-schema foreign keys — cross-service references are by ID, with
  eventual consistency via events.
- **Multi-tenancy**: shared database, shared schema-per-service, row-level
  `tenant_id` isolation enforced by a shared base repository in
  `infra/common`.
- **Read models**: `analytics` and `search` services maintain CQRS-style
  projections built from the Kafka event stream (OpenSearch for `search`).
- **API surface**: single `/v1/`-prefixed REST API (via `apps/api`), uniform
  `{data, meta}` / error envelope, cursor pagination, `Idempotency-Key` header
  for writes, RBAC via `JwtAuthGuard` + `PermissionsGuard` +
  `@RequirePermissions`.

## Core Technology Choices

(Verified from `package.json`, 2026-06-15)

| Layer | Choice | Version |
|---|---|---|
| Framework | NestJS | ^10.4.0 |
| Language | TypeScript | ^5.6.0 |
| ORM | TypeORM | ^0.3.20 |
| Database | PostgreSQL (via `pg`) | ^8.13.0 |
| Cache | Redis (via `ioredis`) | ^5.4.1 |
| Event bus | Kafka (via `kafkajs`) | ^2.2.4 |
| Search | OpenSearch | (per `docs/canon/data-architecture.md`, client lib TBD – REQUIRES VERIFICATION) |
| Auth | `@nestjs/jwt` + `passport-jwt` | ^10.2.0 / ^4.0.1 |
| Validation | `class-validator` + `class-transformer` | ^0.14.0 / ^0.5.1 |
| Testing | Jest + ts-jest | ^29.7.0 / ^29.2.0 |
| Node engine | >=20.0.0 | |

Frontend stack (Phase E, not started): Next.js per `apps/web/README.md` and
`docs/ui/design-system.md` — TBD – REQUIRES VERIFICATION on exact version
since `apps/web` has no `package.json` yet.

## Known Constraints

1. Workspace fully redirected off `C:` for npm/pnpm/jest/cache/temp (audited
   2026-06-15; pre-existing global CLI installs under
   `C:\Users\Admin\AppData\Roaming\npm` are out of scope).
2. Default Node heap insufficient for `tsc --noEmit` / full `jest` runs —
   requires `--max-old-space-size` overrides (3072 / 2048 respectively).
3. Test coverage is minimal: only 4/26 services (`auth`, `notification`,
   `onsite`, `order`) have any `.spec.ts` file, 1 each.
4. No Docker available on the current dev machine — `docker:*` scripts
   unexercised locally.
5. `docs/tracking/progress.md` is stale relative to actual implementation
   status (Batches 8–10, SSO, `integration` all complete but marked
   "Not started").

## Major Assumptions

- The single-process deployment model (`apps/api` registering all 26 modules)
  is intentional for the current stage and not a temporary scaffold —
  TBD – REQUIRES VERIFICATION against `docs/architecture/system-architecture.md`
  "build sequencing" notes for any stated intent to split into separate
  deployables later.
- `services/engagement` being near-empty while `notification` owns
  `Campaign`/`AudienceSegment` is treated as an unresolved placement
  deviation (GAP-G3), not an intentional architecture decision — but this has
  not been confirmed with the project owner.
- The event catalog (`docs/canon/event-catalog.md`) is assumed complete and
  in sync with `infra/event-bus/src/topics.ts` except for the
  `user.sso_login_succeeded` addition made during GAP-6 (verified added to
  both).

## Known Risks

1. **Low test coverage** is the most significant risk to safe iteration —
   refactors or contract changes cannot be verified by an automated suite for
   22/26 services.
2. **Stale tracking docs** (`progress.md`) could mislead a future session into
   re-implementing already-complete batches, or assuming SSO/integration
   don't exist.
3. **Deferred security hardening**: OAuth2/SAML assertion signature
   verification (SSO) and webhook HMAC signing (`integration`) are both
   stubbed/deferred — any production deployment before these are completed
   would accept unverified identity assertions and unsigned outbound
   webhooks.
4. **Single-process deployment** means a bug or resource exhaustion in any
   one of 26 modules can affect the whole API process — no isolation between
   e.g. `ai-service` and `payment` at the process level.
5. **No Docker locally** means integration-level testing against real
   Postgres/Redis/Kafka/OpenSearch cannot currently be performed on this dev
   machine — CI environment behavior is therefore the only integration signal,
   and its actual test job content is TBD – REQUIRES VERIFICATION.

## Architectural Principles

(Extracted as implicit principles from consistent patterns across the
codebase — not previously written down)

1. **Schema-per-service, no cross-schema FKs** — services own their data;
   cross-service relationships are eventually-consistent via events.
2. **Everything tenant-scoped by default** — `tenant_id` is present on
   virtually every entity; isolation is enforced centrally, not per-service.
3. **Events as the integration contract** — Kafka topics + outbox pattern are
   the primary way services learn about each other's state changes; direct
   synchronous inter-service calls are avoided.
4. **Uniform API conventions** — every service's controller follows the same
   `/v1/` prefix, envelope, pagination, and auth/permission conventions
   (`docs/canon/api-standards.md`), making the API surface predictable across
   26 services.
5. **Documentation as architecture** — the `docs/canon/*` tree is treated as
   the design source of truth, with implementation expected to match it
   (deviations like GAP-G3 are treated as gaps to resolve, not as
   redefinitions of canon).
6. **Governance before features** — as of this ADR, the project has paused
   feature work to establish the `docs/00_authority` / `docs/06_decisions` /
   `docs/07_governance` / `docs/08_reports` governance framework
   (GOVERNANCE IMPLEMENTATION PHASE 1) before continuing.

## Consequences

- Future ADRs should reference this one for baseline architecture and should
  be added to `06_decisions/` whenever a FROZEN_DECISION (per
  `07_governance/AI_OPERATING_CONTEXT.md`) is changed.
- The risks above (especially low test coverage and deferred security
  hardening) should inform prioritization of the next phase — see
  `08_reports/RECOMMENDED_ADR_ROADMAP.md`.
