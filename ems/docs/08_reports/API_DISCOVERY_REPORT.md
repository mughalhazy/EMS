Status: Active
Authority Level: Medium
Last Reviewed: 2026-06-15
Owner: AI

# API Discovery Report (Phase 2 Backend Authority Capture)

> Comprehensive findings on the HTTP API layer from Phase 2 (2026-06-15).
> Source: all 26 `services/*/src/*.controller.ts` files, `apps/api/src/main.ts`.
>
> See `docs/01_backend/API_CONTRACT.md` for the definitive endpoint catalog.
> This report adds discovery context, counts, and anomalies.

## 1. API Layer Summary

| Attribute | Value |
|---|---|
| Framework | NestJS 10 with `@nestjs/common` routing |
| Versioning | URI versioning, `defaultVersion: '1'` — all routes `/v1/*` |
| Total HTTP controllers | ~27 across 26 services (some services have multiple controllers) |
| Total endpoints (estimated) | ~130+ across all services |
| Global validation | `ValidationPipe` (whitelist + forbidNonWhitelisted + transform) |
| Global error handling | `GlobalExceptionFilter` → `ApiResponse<T>` envelope |
| Authentication | `JwtAuthGuard` on ~99% of endpoints; 7 public endpoints |
| Authorization | `PermissionsGuard + @RequirePermissions` on ~5% of endpoints (5/26 services verified) |
| Documentation | Swagger UI at `/api/docs` (dev only) |
| Request logging | `RequestLoggerMiddleware` on all routes |

## 2. Controller Inventory

| Service | Controller(s) | Prefix(es) | Endpoints (est.) |
|---|---|---|---|
| auth | AuthController, UsersController, SsoController | `/auth`, `/users`, `/auth/sso` | ~13 |
| tenant | TenantController | `/tenants` | ~5 |
| rbac | RbacController | `/roles`, `/users/:id/roles` | ~7 |
| audit | AuditController | `/audit` | ~2 |
| event | EventController, VenueController | `/events`, `/venues` | ~13 |
| agenda | TrackController, SessionController | `/tracks`, `/sessions` | ~10 |
| speaker | SpeakerController, SessionController | `/speakers`, `/sessions` | ~7 |
| exhibitor | ExhibitorController, BoothController, LeadController | `/exhibitors`, `/booths`, `/leads` | ~11 |
| attendee | AttendeeController | `/attendees` | ~3 |
| registration | RegistrationController, RegistrationFieldController | `/registrations`, `/events/:id/registration-fields` | ~8 |
| onsite | CheckInController, BadgePrintController, DeviceSessionController | `/check-ins`, `/badge-prints`, `/device-sessions`, `/events/:id/check-in-stats` | ~9 |
| ticketing | TicketProductController, TicketController | `/ticket-products`, `/tickets` | ~7 |
| pricing | PricingController, PromoCodeController | `/pricing-rules`, `/promo-codes` | ~8 |
| inventory | InventoryController | `/inventory` | ~3 |
| order | OrderController | `/orders` | ~4 |
| payment | PaymentController | `/payments` | ~4 |
| fulfillment | FulfillmentController | `/fulfillments` | ~2 |
| notification | NotificationController, CampaignController | `/notifications`, `/campaigns` | ~6 |
| engagement | (stub) | — | 0 |
| analytics | AnalyticsController | `/analytics` | ~4+ |
| search | SearchController | `/search` | ~1 |
| networking | NetworkingController | `/networking` | ~4 |
| interactive-engagement | PollController, QaController, SurveyController | `/polls`, `/qa`, `/surveys` | ~9 |
| ai-service | AiController | `/ai` | ~3 |
| integration | IntegrationController | `/integrations/webhooks` | ~5 |
| ui-renderer | — | — | 0 (scaffold) |

## 3. Public Endpoints (No Authentication)

| Endpoint | Controller | Purpose |
|---|---|---|
| `POST /v1/auth/register` | AuthController | New user registration |
| `POST /v1/auth/login` | AuthController | Password-based login |
| `POST /v1/auth/refresh` | AuthController | Refresh access token |
| `GET /v1/auth/sso/discover` | SsoController | SSO config discovery |
| `POST /v1/auth/sso/callback` | SsoController | SSO assertion callback |
| `GET /v1/health` | HealthController | Liveness probe |
| `GET /v1/health/ready` | HealthController | Readiness probe |

## 4. Endpoints With Verified `@RequirePermissions`

| Endpoint | Permission(s) |
|---|---|
| `GET /v1/users` | `user:read` |
| `GET /v1/users/:id` | `user:read` |
| `PATCH /v1/users/:id` | `user:write` |
| `DELETE /v1/users/:id` | `user:delete` |
| `GET /v1/auth/sso/connections` | `sso:manage` |
| `POST /v1/auth/sso/connections` | `sso:manage` |
| `PATCH /v1/auth/sso/connections/:id` | `sso:manage` |
| `DELETE /v1/auth/sso/connections/:id` | `sso:manage` |
| `POST /v1/tenants` | `tenant:write` |
| `GET /v1/tenants` | `tenant:read` |
| `GET /v1/tenants/:id` | `tenant:read` |
| `PATCH /v1/tenants/:id` | `tenant:write` |
| `DELETE /v1/tenants/:id` | `tenant:suspend` |
| `POST /v1/roles` | `role:write` |
| `GET /v1/roles` | `role:read` |
| `GET /v1/roles/:id` | `role:read` |
| `PATCH /v1/roles/:id` | `role:write` |
| `DELETE /v1/roles/:id` | `role:write` |
| `POST /v1/users/:id/roles` | `role:assign` |
| `DELETE /v1/users/:id/roles/:roleId` | `role:revoke` |
| `GET /v1/audit` | `audit:read` |
| `GET /v1/audit/:id` | `audit:read` |

**All other ~110+ endpoints**: `JwtAuthGuard` only — no `@RequirePermissions`.

## 5. Controller Path Anomalies

### `/sessions` — Dual Registration

Both `services/agenda` and `services/speaker` register `@Controller('sessions')`.
In NestJS with a single process:
- Both are registered in the route table
- Exact path matches may resolve to whichever was registered last
- Module load order in `app.module.ts`: `AgendaModule` (Batch 2) loads before
  `SpeakerModule` (Batch 2, later in the array) — SpeakerModule's `/sessions`
  routes may shadow AgendaModule's on exact path collision

Specific collision risk: `GET /v1/sessions` and `GET /v1/sessions/:id` exist
in both controllers. The resolution is undefined without testing.

### `/users` — Partial Overlap

`services/auth` UsersController: `/v1/users`, `/v1/users/:id`
`services/rbac` RbacController: `/v1/users/:id/roles`, `/v1/users/:id/roles/:roleId`

The RBAC routes use a more specific path (`/roles` sub-segment) so they should
not conflict with the auth `/users/:id` route. However, this sharing of the
`/users` prefix across two services is an architectural smell.

## 6. Idempotency Header Handling

`Idempotency-Key` header is used by:
- `services/order` — `POST /v1/orders`
- `services/payment` — `POST /v1/payments`

Implementation: service method reads `@Headers('idempotency-key')` parameter,
calls `IdempotencyStore.checkAndSet()` before processing. Returns 409
`EMS_CONFLICT` if key already exists.

TTL: 24 hours (`IdempotencyStore` TTL = 86400 seconds).
Key format: `idem:{tenantId}:{idempotencyKey}`.

## 7. Swagger / API Documentation

- Swagger UI: `/api/docs`
- Only enabled in non-production environments
- BearerAuth scheme configured
- Likely auto-generated from `@ApiProperty()` decorators in DTOs
- Not verified whether all endpoints have `@ApiOperation` or `@ApiResponse`
  decorators (TBD — REQUIRES VERIFICATION)

## 8. Response Time / Pagination

Default pagination limit observed in DTO patterns: `@Max(100)` on `limit` field.
No global default page size constant found — each service DTO declares its own.
Common values: `limit: 20` default, `max: 100`.

## 9. Gaps Requiring Follow-Up

| Gap | Detail |
|---|---|
| Exact endpoint paths for analytics | Controller methods not fully read; representative paths estimated |
| Exact endpoint paths for ai-service | Controller methods not fully read; representative paths estimated |
| Refund sub-path | `POST /v1/payments/:id/refund` — sub-path not confirmed from controller source |
| Permission audit for 22 services | Full `@RequirePermissions` search across all controller files needed |
| Swagger decorator coverage | Whether all endpoints have API documentation decorators not verified |
| Rate limiting on auth endpoints | `RateLimiterService` exists but not confirmed applied to login/register |
