# Developer Docs

## Local setup

1. Install dependencies: `npm ci`
2. Copy `infra/deployment/env/.env.development.example` to `infra/docker/.env`
   (or repo-root `.env`) and adjust as needed.
3. Start infra dependencies (Postgres, Redis, Kafka, OpenSearch, MinIO):
   `npm run docker:up`
4. Run the API: `npm run start:dev` (not yet defined — use `nest start --watch`
   from `apps/api` until added)

## Building & running like production

- `npm run build:all` compiles every service/infra/app via the root
  `tsconfig.json` into `dist/`, preserving the `services/`, `infra/`,
  `apps/` directory structure.
- `npm run start:prod` runs the compiled output
  (`dist/apps/api/src/main.js`), using `scripts/register-paths.js` to
  resolve `@ems/*` path aliases against `dist/` (no `ts-node` required).

## Docker

- `npm run docker:up` / `docker:down` / `docker:logs` / `docker:reset` —
  manage the infra-only stack (`infra/docker/docker-compose.yml`).
- `npm run docker:app:build` / `docker:app:up` — build and run the API
  container (`apps/api/Dockerfile`) alongside the infra stack, using the
  `infra/docker/docker-compose.app.yml` overlay.

## CI

`.github/workflows/ci.yml` runs on every push to `main` and on pull
requests: lint (`eslint --max-warnings=0`), typecheck (`tsc --noEmit`),
unit tests (`jest`), and a Docker build of the API image (pushed to GHCR on
`main`).

## Health checks

- `GET /v1/health` — liveness probe (always returns `200 ok`).
- `GET /v1/health/ready` — readiness probe; checks Postgres, Redis, and
  Kafka producer connectivity. Returns `503` if any check fails.

## Environments & secrets

See `infra/deployment/env/` for per-environment configuration templates and
`infra/deployment/secrets/README.md` for the secrets-resolution convention
used by staging/production.

## Scripts (`scripts/`)

| Script | Purpose |
|---|---|
| `scripts/register-paths.js` | Runtime `@ems/*` path-alias resolver; required by `start:prod` and the production Dockerfile CMD. See `docs/tracking/delta-log.md` DELTA-4/RA-1 for rationale. |
| `scripts/setup-env.ps1` | One-time machine setup on Windows — redirects npm cache, Jest cache, and other tool caches to `D:\` to avoid C: drive bloat; disables telemetry. Run once per machine or after a profile reset: `powershell -ExecutionPolicy Bypass -File .\scripts\setup-env.ps1` |
| `scripts/verify-build.ps1` | Quick build-health check: runs `tsc --noEmit` (TypeScript compile) + `npm audit --audit-level=high`. Run from repo root before submitting a PR. |
