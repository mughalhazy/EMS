Status: Draft
Authority Level: Medium
Last Reviewed: 2026-06-15
Owner: AI

# Deployment Documentation

This directory holds deployment architecture, environment configuration, and
operational runbook documents.

## Authoritative References

- **Data architecture**: `docs/canon/data-architecture.md` — Postgres
  schema-per-service layout, Redis key patterns/TTLs, Kafka partitioning/
  retention settings, OpenSearch indices, S3 bucket/prefix structure, data
  lifecycle (archival, offboarding, backup).
- **Infrastructure**: `infra/docker/docker-compose.yml` (local dev stack:
  Postgres, Redis, Kafka, OpenSearch, MinIO), `infra/docker/docker-compose.app.yml`
  (API container), `apps/api/Dockerfile` (multi-stage API image).
- **Deployment configs**: `infra/deployment/` — environment configs and
  secrets placeholders (TBD – REQUIRES VERIFICATION for exact file contents).
- **Package scripts** (from `package.json`):
  - `docker:up` / `docker:down` / `docker:logs` / `docker:reset`
  - `docker:app:build` / `docker:app:up`
  - `migration:generate` / `migration:run` / `migration:revert`
  - `start:prod`: `node -r ./scripts/register-paths.js dist/apps/api/src/main.js`

## Known Deployment Constraints (2026-06-15)

- **Docker not installed** on the current development machine — `docker:*`
  scripts cannot be executed locally. All container validation must go through CI.
- **Single-process API**: all 26 service modules run in one NestJS process
  (`apps/api`). The deployment unit is a single container per
  `docker-compose.app.yml`. See ADR-006 (single vs. split services question)
  in `08_reports/RECOMMENDED_ADR_ROADMAP.md`.
- **Frontend Dockerfile absent**: `apps/web` Dockerfile is deferred to Phase E
  (GAP-5 in `docs/tracking/gap-register.md`).
- **Workspace isolation**: npm/pnpm/cache/temp all redirected to `D:` drive
  via `HKCU\Environment` (audited 2026-06-15); see
  `07_governance/AI_OPERATING_CONTEXT.md` KNOWN_CONSTRAINTS.

## Recommended Future Documents for This Directory

- `ENVIRONMENT_VARIABLES.md` — complete list of required env vars per service
  (currently scattered in `infra/deployment/` and individual service
  `ConfigModule` usages). TBD – REQUIRES VERIFICATION against actual
  `env.validation.ts` and `infra/deployment/` file contents.
- `RUNBOOK.md` — operational procedures: startup sequence, health check
  endpoints (verified: `apps/api/src/health/health.controller.ts` exists),
  database migration procedure, rollback procedure.
- `SECRETS_MANAGEMENT.md` — where secrets live in production (not in the
  repo), rotation procedures, and a reminder that the plaintext API keys
  observed in `HKCU\Environment` during the 2026-06-15 workspace audit must
  never be committed to files.
