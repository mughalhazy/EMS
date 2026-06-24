Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Integration Catalog

> Extracted from `services/integration/src/`, `services/auth/src/`
> (SSO), `services/ai-service/src/`, `infra/event-bus/src/`,
> and `infra/cache/src/`.
> Covers all external system integrations and internal cross-service
> integration patterns.

## 1. Outbound Webhooks (`services/integration`)

| Field | Detail |
|---|---|
| Service | `services/integration` |
| Schema | `integration` |
| Entities | `WebhookSubscription`, `WebhookDelivery` |
| Controller | `IntegrationController` (`/integrations`) |
| Pattern | Kafka consumer — subscribes to ALL platform topics, fans out to registered webhook endpoints |
| Delivery | HTTP POST to subscriber `url` with event payload |
| Authentication | `secret` from `WebhookSubscription` (HMAC signing **deferred** — GAP-G6) |
| Retry | **Not implemented** — no dead-letter delivery (GAP-G6) |
| Security gaps | `CreateWebhookSubscriptionDto.secret` has no `@MinLength()` constraint; HMAC signature header not yet added to outbound requests |

### Webhook API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/integrations/webhooks` | Register webhook subscription |
| `GET` | `/v1/integrations/webhooks` | List subscriptions for tenant |
| `GET` | `/v1/integrations/webhooks/:id` | Get subscription |
| `PATCH` | `/v1/integrations/webhooks/:id` | Update subscription |
| `DELETE` | `/v1/integrations/webhooks/:id` | Delete subscription |

---

## 2. Enterprise SSO (`services/auth`)

| Field | Detail |
|---|---|
| Service | `services/auth`, `SsoController` (`/auth/sso`) |
| Pattern | Per-tenant SSO connections (OAuth2 / SAML) |
| Entities | `SsoConnection` (tenant-level config), `SsoIdentity` (user-level binding) |
| Flow | Tenant admin registers an SSO connection → users login via `discover`+`callback` flow |
| Assertion handling | `ssoLogin()` receives pre-validated assertion via `SsoAssertionDto`; **signature verification against `issuer`/`certificate` is deferred** (GAP-G6) |
| Find-or-create | `ssoLogin()` finds existing `User` by `SsoIdentity.externalId`, or creates new user |
| Token issuance | Issues JWT access + refresh tokens same as password login path |

### SSO API Endpoints

| Method | Path | Guard | Description |
|---|---|---|---|
| `GET` | `/v1/auth/sso/discover` | None (public) | Returns SSO provider config for tenant |
| `POST` | `/v1/auth/sso/callback` | None (public) | Processes SSO assertion, returns tokens |
| `GET` | `/v1/auth/sso/connections` | `JwtAuthGuard` + `sso:manage` | List tenant SSO connections |
| `POST` | `/v1/auth/sso/connections` | `JwtAuthGuard` + `sso:manage` | Create SSO connection |
| `PATCH` | `/v1/auth/sso/connections/:id` | `JwtAuthGuard` + `sso:manage` | Update SSO connection |
| `DELETE` | `/v1/auth/sso/connections/:id` | `JwtAuthGuard` + `sso:manage` | Delete SSO connection |

---

## 3. AI Providers (`services/ai-service`)

| Provider | API Key Env Var | Usage |
|---|---|---|
| OpenAI | `OPENAI_API_KEY` | Embeddings, completions |
| Google Gemini | `GEMINI_API_KEY` | Multimodal AI |
| DeepSeek | `DEEPSEEK_API_KEY` | Alternative completions |

**Security note**: All three API keys are registered as environment variables.
They must be stored in secret management (not committed to source or echoed in
logs). See SECURITY note in prior governance audit.

Entities: `VectorEmbedding`, `AIInteractionLog` (in `ai_service` schema).
Detailed AI integration architecture in `docs/legacy/ai-architecture.md` (GAP-G7: not cross-checked this pass; file relocated 2026-06-17).

---

## 4. Kafka (Internal Event Bus)

See `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md` for complete topic list.

| Field | Detail |
|---|---|
| Client | `kafkajs ^2.2.4` |
| Config | Brokers: `KAFKA_BROKERS` env; clientId: `ems-api` |
| Producer | Idempotent, `maxInFlightRequests: 5`, `retries: 10` |
| Consumer | Per-service consumer groups |
| Pattern | **Direct publish** — all 26 services call `eventBus.publish()` directly. Outbox relay infrastructure exists in `EventBusModule` (polls every 5 seconds) but the outbox table is always empty because no service writes to it. |
| DLQ | None — errors logged only (GAP-B6 / OCR-4: Postgres DLQ spec queued) |

> Corrected 2026-06-17: Prior claim "Outbox → Kafka relay for durability" was incorrect. See EVENT_AND_QUEUE_ARCHITECTURE.md §3.

---

## 5. Redis (Cache, Locking, Rate Limiting)

| Service | Pattern | Key Format | TTL |
|---|---|---|---|
| `IdempotencyStore` | Idempotency replay detection | `idem:{tenantId}:{idempotencyKey}` | 86400 s (24 h) |
| `RateLimiterService` | Sliding window rate limiter | `rl:{resource}:{identifier}` | Per-window |
| `LockService` | Distributed Redlock | `lock:{resource}` | Configured per call |

Connection: `REDIS_HOST` + `REDIS_PORT` (default 6379) + `REDIS_PASSWORD`. `lazyConnect: true` — no crash on startup if Redis is down, but operations will fail at runtime.

---

## 6. Search (`services/search`)

> **CORRECTED 2026-06-17** (GAP-B9 CLOSED): OpenSearch is NOT used. The claim that search uses an OpenSearch CQRS read model was incorrect.

| Field | Detail |
|---|---|
| Pattern | Postgres full-text search using TypeORM ILIKE queries directly against primary schemas |
| Client | None — uses existing `pg ^8.13.0` TypeORM connection; no OpenSearch client installed |
| Query | `SearchController` at `/GET /v1/search` — queries multiple schemas via ILIKE |
| Index updates | N/A — queries primary tables directly; no separate index |

---

## 7. PostgreSQL (Primary Database)

| Field | Detail |
|---|---|
| Client | `pg ^8.13.0` via TypeORM 0.3 |
| Connection | `DATABASE_URL` env var |
| Schema pattern | One Postgres schema per service |
| Migrations | Auto-sync in dev; migration files run in production |

---

## 8. Email / SMS / Push (Notification Channels)

> **RESOLVED 2026-06-17**: Inspected `services/notification/src/transports/`.

| Channel | Implementation | Library |
|---|---|---|
| Email | `SmtpTransport` (`services/notification/src/transports/smtp.transport.ts`) | `nodemailer ^6.10.1` |
| SMS | Not implemented — `SmtpTransport.send()` returns error for non-email channels | N/A |
| Push | Not implemented — same; no push provider in codebase | N/A |

**Config**: `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` (default `no-reply@ems.local`).

**Architecture**: The notification service uses a `NOTIFICATION_TRANSPORT` injection token (`NotificationTransport` interface). Any transport implementation can be registered — SMS/push are additive extensions that do not require changing `notification.service.ts`. `LogTransport` (`log.transport.ts`) is the dev/test fallback.

`NotificationTemplate` and `Notification` entities exist in `notification` schema. Notification channel is stored on `Notification.channel` (`'email'` | `'sms'` | `'push'`).

---

## 9. Object Storage (S3 / MinIO)

> **RESOLVED 2026-06-17**: No application-level S3/MinIO client exists in the codebase.

MinIO is referenced in `infra/docker/` for local development infrastructure only. No service, controller, or repository in `services/` or `infra/` imports an S3 or MinIO SDK. Object storage is not currently used by any application code — file/blob handling is not yet implemented.
