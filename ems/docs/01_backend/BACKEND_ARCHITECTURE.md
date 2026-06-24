Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-15
Owner: AI

# Backend Architecture

> Extracted from `apps/api/src/main.ts`, `apps/api/src/app.module.ts`,
> `infra/common/src/`, `infra/event-bus/src/`, `infra/cache/src/`,
> `.github/workflows/ci.yml`, and all 26 service controller files.
> Source of truth is the implementation, not the design docs.

## 1. Architectural Style

**Modular monolith with event-driven integration.** All 26 service modules run
inside a single NestJS process (`apps/api`). Services communicate primarily
via Kafka events (published through an outbox pattern) and, within the same
process, via synchronous NestJS dependency injection. No cross-service network
calls; no separate microservice deployments.

## 2. Runtime Entrypoint — `apps/api/src/main.ts`

| Config | Value |
|---|---|
| Framework | NestJS 10 |
| Port | `APP_PORT` env or `3000` |
| API versioning | URI versioning, defaultVersion `'1'` — all routes at `/v1/<path>` |
| Global validation | `ValidationPipe` — `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`, `enableImplicitConversion: true` |
| Global exception filter | `GlobalExceptionFilter` (from `infra/common`) — catches all exceptions |
| CORS | Origins from `CORS_ORIGINS` env (comma-separated) or `['http://localhost:3001']`; `credentials: true` |
| Swagger | `/api/docs` — dev only; BearerAuth scheme enabled |
| Logger | `JsonLogger` (structured JSON to stdout) in production; NestJS default in dev |
| Request ID | `RequestLoggerMiddleware` reads/generates `x-request-id` header; echoes on response |

## 3. Module Load Order (`app.module.ts`)

```
ConfigModule.forRoot       global, validates env, reads .env + infra/docker/.env
TypeOrmModule.forRootAsync  Postgres via DATABASE_URL, autoLoadEntities, synchronize=true (non-prod only),
                             migrationsRun=true (prod only), logging in dev
EventBusModule.forRoot      Kafka brokers from KAFKA_BROKERS, clientId='ems-api'
CacheModule.forRoot         Redis host/port/password from REDIS_* env vars (global)

Batch 1 — Platform Core:       AuthModule, TenantModule, RbacModule, AuditModule
Batch 2 — Event Operations:    EventModule, AgendaModule, SpeakerModule, ExhibitorModule, AttendeeModule
Batch 3 — Participation:       RegistrationModule, OnsiteModule
Batch 4 — Commerce:            TicketingModule, PricingModule, InventoryModule, OrderModule,
                               PaymentModule, FulfillmentModule
Batch 5 — Engagement:          NotificationModule, EngagementModule (stub — no routes)
Batch 6 — Intelligence:        AnalyticsModule, SearchModule
Batch 8 — Social:              NetworkingModule
Batch 9 — Interactive:         InteractiveEngagementModule
Batch 10 — AI Layer:           AiModule
Cross-cutting:                  IntegrationModule
```

Note: Batch 7 (event-bus, cache) is infra, registered via `EventBusModule`/`CacheModule` above rather than as a batch. Comment in `app.module.ts` skips from Batch 6 to Batch 8 with no Batch 7 line.

**Middleware:** `RequestLoggerMiddleware` applied to all routes (`'*'`).

## 4. Request Pipeline (per HTTP request)

```
Incoming HTTP
  → RequestLoggerMiddleware (sets x-request-id)
  → NestJS Router (URI version prefix /v1/)
  → JwtAuthGuard  (validates Bearer JWT — most routes)
  → PermissionsGuard  (checks required permissions from @RequirePermissions — select routes)
  → ValidationPipe  (class-validator DTO transformation + validation)
  → Controller method
  → Service layer (business logic, TypeORM, Redis, EventBus)
  → ok() / paginated() response helper
  → GlobalExceptionFilter (on any thrown exception)
```

## 5. Cross-Cutting Concerns (from `infra/common/src/`)

| Concern | Implementation | File |
|---|---|---|
| Auth guard | `JwtAuthGuard extends AuthGuard('jwt')` | `jwt-auth.guard.ts` |
| Authorization guard | `PermissionsGuard` — AND logic on all `@RequirePermissions` codes | `permissions.guard.ts` |
| Current user | `@CurrentUser(field?)` — extracts `JwtPayload` from `request.user` | `current-user.decorator.ts` |
| Permission declaration | `@RequirePermissions(...codes)` — sets `PERMISSIONS_KEY` metadata | `permissions.decorator.ts` |
| Tenant context | `@GetTenant()` — extracts `{ tenantId, userId, roles }` from request | `tenant-context.ts` |
| Base repository | `TenantScopedRepository<T>` — auto-injects `tenantId` on all queries | `base.repository.ts` |
| Request logging | `RequestLoggerMiddleware` — logs method/URL/status/duration/requestId | `request-logger.middleware.ts` |
| JSON logging | `JsonLogger implements LoggerService` — stdout JSON, production only | `json-logger.service.ts` |

## 6. Data Stores

| Store | Technology | Version / Client | Use |
|---|---|---|---|
| Primary database | PostgreSQL | TypeORM 0.3 (`pg ^8.13.0`) | Schema-per-service, all persistent state |
| Cache / rate limiting | Redis | `ioredis ^5.4.1`, `lazyConnect: true` | Session idempotency, distributed locking, rate limiting |
| Event bus | Kafka | `kafkajs ^2.2.4`, retry 10×, idempotent producer | Async domain events, outbox relay |
| Search | OpenSearch | TBD – client library not verified in `package.json` | Full-text + semantic search |
| Object storage | S3 (MinIO in dev) | TBD – client not observed in controller/service files | File/asset storage |

## 7. Infra Services (always-on singletons)

| Service | Scope | Key behaviour |
|---|---|---|
| `RedisClient` | Global | `ioredis` wrapper; `get`/`set(ttl?)`/`del`/`exists`/`expire`/`ttl` |
| `IdempotencyStore` | Global | Key: `idem:{tenantId}:{idempotencyKey}` TTL 86400 s (24 h) |
| `RateLimiterService` | Global | Sliding window via sorted set `rl:{key}`; returns `{ allowed, remaining, resetInSeconds }` |
| `LockService` | Global | Redlock via `SET NX EX`; Lua atomic release; `withLock(resource, ttl, fn)` |
| `EventBusService` | Global | Kafka producer (idempotent, `maxInFlightRequests: 5`) + per-subscriber consumer; auto-adds `eventId`+`occurredAt`; Kafka key = `tenantId` |

## 8. Security Layers

See `docs/03_fullstack_contracts/AUTH_AND_TENANCY_CONTRACT.md` for detail.

- **Authentication**: JWT Bearer (`@nestjs/jwt`, `passport-jwt`) — access token TTL 15 min; refresh token TTL 7 days, stored as `AuthSession` in DB.
- **Authorization**: `PermissionsGuard` + `@RequirePermissions` on select controllers. 21 of 25 service controllers have no permission gate (JwtAuth only).
- **Tenant isolation**: `TenantScopedRepository` auto-scopes all DB queries to `tenantId`.
- **Input validation**: Global `ValidationPipe` with `whitelist`/`forbidNonWhitelisted`.

## 9. CI/CD

Source: `.github/workflows/ci.yml`

| Job | Runs on | What it does |
|---|---|---|
| `lint-typecheck` | ubuntu-latest / push+PR | `npm ci` → ESLint `--max-warnings=0` → `tsc --noEmit` |
| `test` | ubuntu-latest / push+PR | `npm ci` → `npm test -- --passWithNoTests` |
| `docker-build` | After lint+test pass | Buildx → `apps/api/Dockerfile` → push `api:{sha}` + `api:latest` to GHCR on main push |

Concurrency: `ci-{ref}`, cancel-in-progress. Node: 20.

## 10. Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | Always | — | Postgres connection string |
| `JWT_SECRET` | Always | — | JWT signing key |
| `KAFKA_BROKERS` | Production | — | Comma-separated broker addresses |
| `REDIS_HOST` | Production | — | Redis hostname |
| `REDIS_PASSWORD` | Production | — | Redis auth password |
| `REDIS_PORT` | No | `6379` | |
| `APP_PORT` | No | `3000` | HTTP listen port |
| `CORS_ORIGINS` | No | `http://localhost:3001` | Comma-separated allowed origins |
| `NODE_ENV` | No | — | `production` enables JSON logging, disables DB sync, enables migrations |
