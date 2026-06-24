# Docker / Local Stack

Phase: D, Bundle 1 - Containerization
Source: V1/BUILD/Stream-10 - Infrastructure & DevOps/Bundle 1 - Containerization.docx

Status:
- `docker-compose.yml` — infra deps (Postgres, Redis, Kafka/Zookeeper, Kafka UI,
  OpenSearch + Dashboards, MinIO). Implemented.
- `apps/api/Dockerfile` — multi-stage build for the NestJS API (compiles the
  whole monorepo via `npm run build:all` / `tsc -p tsconfig.json`, then runs
  `node -r tsconfig-paths/register dist/apps/api/src/main.js` with
  `TS_NODE_BASEURL=./dist` so `@ems/*` path aliases resolve against compiled
  output). Implemented.
- `docker-compose.app.yml` — overlay that builds/runs the `api` container
  alongside the infra stack:
  `docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.app.yml up -d --build`
  (or `npm run docker:app:up`). Implemented.
- Dockerfile for Next.js frontend (`apps/web`) — pending Phase E (frontend not
  yet scaffolded).

Per BUILD_BLUEPRINT.md sec 11, this should be stood up EARLY (right after Phase A),
because Batch 7 (Event Bus + Cache) and Batch 4 (Commerce Core) depend on
Kafka and Redis being available locally.
