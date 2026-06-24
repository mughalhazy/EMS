Status: Draft
Authority Level: Medium
Last Reviewed: 2026-06-15
Owner: AI

# Backend Documentation

This directory holds backend-specific governance and specification documents.

## Current State (Phase 1)

No dedicated backend specification documents have been created here yet.
The authoritative backend documentation already exists under `docs/canon/`:

- **Service boundaries & ownership**: `docs/canon/service-map.md` — all 26
  services, what each owns, what events each publishes/consumes.
- **Domain entities & schemas**: `docs/canon/domain-model.md` — entity fields,
  owning service, relationships. Summary in `docs/00_authority/DOMAIN_MODEL.md`.
- **API conventions**: `docs/canon/api-standards.md` — `/v1/` prefix,
  response/error envelopes, pagination, auth/authz, idempotency, rate limiting.
- **Data architecture**: `docs/legacy/data-architecture.md` (Retired — relocated 2026-06-17) — Postgres
  schema-per-service, Redis key patterns, Kafka partitioning/retention,
  OpenSearch indices, S3 layout. Current authority: `docs/01_backend/DATABASE_SCHEMA.md`.
- **System architecture**: `docs/legacy/system-architecture.md` (Retired — relocated 2026-06-17) — tech
  stack, service boundary diagram, sync/async data flow, multi-tenant model. Current authority: `docs/01_backend/BACKEND_ARCHITECTURE.md`.
- **Feature scope**: `docs/00_authority/FEATURE_SCOPE.md` — which services are
  built vs. unbuilt.

## Recommended Future Documents for This Directory

- `BACKEND_CODING_STANDARDS.md` — NestJS module structure conventions,
  entity annotation patterns, outbox usage rules, per-service test requirements.
- `SERVICE_DEPENDENCY_MAP.md` — which services consume which Kafka topics, with
  a full cross-service event graph (extractable from `infra/event-bus/src/topics.ts`
  + individual service event consumers).
- `MIGRATION_STRATEGY.md` — how TypeORM migrations are generated, run, and
  versioned (the `migration:generate`/`migration:run`/`migration:revert`
  scripts exist in `package.json` but the strategy is undocumented).
