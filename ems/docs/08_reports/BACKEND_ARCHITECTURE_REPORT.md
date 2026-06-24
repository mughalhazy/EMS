Status: Active
Authority Level: Medium
Last Reviewed: 2026-06-15
Owner: AI

# Backend Architecture Report (Phase 2 Backend Authority Capture)

> Analytical findings on the backend architecture from Phase 2 (2026-06-15).
> See `docs/01_backend/BACKEND_ARCHITECTURE.md` for the definitive reference.
> This report adds context, validates architectural claims in ADR-001, and
> identifies divergences.

## 1. Architecture Validation vs. ADR-001

ADR-001 (`06_decisions/ADR-001_PROJECT_FOUNDATION.md`) defines 6 architectural
principles. This report validates each against the actual implementation.

| ADR-001 Principle | Claimed | Implementation Reality | Verdict |
|---|---|---|---|
| 1. Schema-per-service data isolation | Each service owns its schema; no cross-schema FKs | 22+ distinct Postgres schemas confirmed; no TypeORM FKs across schemas (cross-refs by UUID value) | **Confirmed** |
| 2. Kafka-mediated async integration | Async domain events via Kafka | 57 topics, `EventBusService`, outbox pattern confirmed | **Confirmed** |
| 3. JWT multi-tenancy | Row-level tenant scoping via JWT + repository | `TenantScopedRepository` auto-injects `tenantId`; JWT carries `tenantId` claim | **Confirmed** |
| 4. CQRS separation | `analytics`/`search` as read-only projections | `analytics` consumes Kafka, builds Postgres projections; `search` builds OpenSearch index; neither is queried by write-side services | **Confirmed** |
| 5. Synchronous inter-service calls avoided | In-process NestJS injection, not HTTP | All 26 services in one NestJS process; no HTTP client (`axios`/`fetch`) observed between services | **Confirmed** |
| 6. API versioning from day 1 | URI versioning v1 | `VersioningType.URI`, `defaultVersion: '1'`, all routes at `/v1/` | **Confirmed** |

**All 6 ADR-001 architectural principles are confirmed in the implementation.**

---

## 2. Modular Monolith Characteristics

This is the correct architectural label (per ADR-001 and `AI_OPERATING_CONTEXT`).
Key properties:

**Single deployable unit**: One Docker image (`apps/api/Dockerfile`), one NestJS
process, all 26 service modules imported in `app.module.ts`.

**Module boundaries**: Each service module encapsulates its own:
- Entity classes (schema-per-service)
- Controller(s)
- Service class(es)
- Repository class(es)
- DTO classes
- Kafka consumers (where applicable)

**No microservice network topology**: There is no service mesh, no gRPC, no
inter-service HTTP calls. The "service" abstraction is purely a code organization
unit within one process.

**Event-driven integration**: Despite being a monolith, services use Kafka events
for cross-domain communication. This provides loose coupling at the data level
even though the process is shared.

---

## 3. Request Pipeline Analysis

```
Client HTTP request
  → Koa-style Express adapter (NestJS default)
  → RequestLoggerMiddleware: x-request-id header inject/read, structured log entry
  → NestJS router: resolves to controller method via URI version prefix
  → Guard chain:
      JwtAuthGuard: validates Bearer JWT (passport-jwt strategy)
      PermissionsGuard: AND-checks @RequirePermissions codes (5 services only)
  → ValidationPipe: whitelist/transform/forbidNonWhitelisted
  → Controller method (thin — delegates to Service)
  → Service method (business logic, TypeORM, Redis, EventBus)
  → TenantScopedRepository: auto-injects tenantId on all DB ops
  → ok()/paginated() response helper: wraps in ApiResponse<T>
  → Response to client

On any unhandled exception:
  → GlobalExceptionFilter: maps to EMS error code, wraps in ApiResponse.error
```

The pipeline is clean and consistent. The main concern is the permission gap:
`PermissionsGuard` is only in the chain for 5 of 26 services.

---

## 4. Infra Module Design

`infra/` contains pure infrastructure modules with no domain logic:

| Module | Pattern | Scope |
|---|---|---|
| `infra/event-bus` | `EventBusModule.forRoot()` — Kafka producer/consumer factory | Global singleton |
| `infra/cache` | `CacheModule.forRoot()` — Redis client + 3 service wrappers | Global singleton |
| `infra/common` | Guards, decorators, filters, base repository, logging | Exported and used by all service modules |

This separation is architecturally sound — infra modules are pure implementations
with no knowledge of domain entities. They export services that service modules
inject via NestJS DI.

---

## 5. Environment Boundary Analysis

| Environment | Key behavioral differences |
|---|---|
| Development | `synchronize: true` (auto-schema), `logging: true` (SQL), NestJS default logger, KAFKA/REDIS optional (app starts without them, readiness fails) |
| Production | `synchronize: false`, `migrationsRun: true`, `JsonLogger` (stdout JSON), KAFKA_BROKERS + REDIS_HOST + REDIS_PASSWORD required |

The `env.validation.ts` class uses `@nestjs/config` + `class-validator` to
enforce required env vars at startup — prevents silent misconfiguration in
production.

---

## 6. CI/CD Architecture

Source: `.github/workflows/ci.yml`

The CI pipeline is minimal but functional:

```
Push or PR
  → lint-typecheck: ESLint (max-warnings=0) + TypeScript type check
  → test: Jest (passWithNoTests — 4/26 services have tests, rest pass vacuously)
  → docker-build: builds and pushes to GHCR on main branch

Published image: ghcr.io/{repo}/api:{sha} + api:latest
```

**Critical gap**: `--passWithNoTests` means the test job always passes regardless
of test coverage. This provides no safety net. See GAP-G4.

---

## 7. Health Check Architecture

```typescript
// GET /v1/health — liveness
// Returns: { status: 'ok' }  (always 200 if process is alive)

// GET /v1/health/ready — readiness
// Checks: db (TypeORM query), redis (ping), kafka (producer metadata)
// 200: { status: 'ok', checks: { db: true, redis: true, kafka: true } }
// 503: { status: 'error', checks: { db: bool, redis: bool, kafka: bool } }
```

These endpoints are not wrapped in the `ApiResponse<T>` envelope (they predate
or bypass the filter). Kubernetes/ECS deployment can use liveness probe on
`/v1/health` and readiness probe on `/v1/health/ready`.

---

## 8. Logging Architecture

| Environment | Logger | Format | Destination |
|---|---|---|---|
| Development | NestJS default (pretty print) | Human-readable | stdout |
| Production | `JsonLogger implements LoggerService` | JSON lines | stdout |

`JsonLogger` fields per log entry:
- `level`: `log`, `error`, `warn`, `debug`
- `context`: class/module name
- `message`: log message
- `timestamp`: ISO 8601
- `requestId`: from `x-request-id` header (propagated via `RequestLoggerMiddleware`)

Log aggregation (Datadog, CloudWatch, etc.) is not configured in source code —
would be handled at the deployment layer (sidecar or stdout capture).

---

## 9. Module Registration Count

From `app.module.ts`:
- 27 `Module,` occurrences
- 32 unique `*Module` symbols (including `AppModule` itself and infra modules)
- Confirms all 26 service modules + infra modules registered

---

## 10. Areas for Architectural Improvement

| Area | Current state | Recommended improvement |
|---|---|---|
| Permission coverage | 5/26 services have fine-grained auth | Full `@RequirePermissions` audit and implementation |
| Test coverage | 4/26 services have any tests; all pass via `--passWithNoTests` | Remove `--passWithNoTests`; add test files per service |
| DLQ | None — events silently lost on publish failure | Implement DLQ topic or Postgres retry table |
| Schema registry | None — event payloads are TypeScript-only contracts | Add JSON Schema definitions per Kafka topic |
| Session management | O(n) bcrypt on refresh | Indexed refresh token lookup |
| Controller namespacing | `/sessions` and `/users` used by multiple services | Unique prefixes per service context |
| Webhook security | No HMAC, no retry/DLQ | Implement HMAC signing + dead-letter retry |
