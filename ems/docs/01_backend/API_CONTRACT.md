Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-15
Owner: AI

# API Contract

> Extracted from all 26 `services/*/src/*.controller.ts` files.
> All routes are prefixed with `/v1/` (URI versioning, defaultVersion `'1'`).
> Guards column: `J` = `JwtAuthGuard`, `P` = `PermissionsGuard`,
> `None` = public endpoint (no authentication required).
> Permission column: only shown where `@RequirePermissions` was verified in code.

## Global Conventions

- **Base URL**: `/v1`
- **Content-Type**: `application/json`
- **Authentication**: `Authorization: Bearer <access_token>` on all guarded routes
- **Tenant context**: derived from JWT `tenantId` claim — no `tenantId` path param required
- **Idempotency**: `Idempotency-Key: <uuid>` header on write operations in `order`, `payment`
- **Response envelope**: see `docs/01_backend/ERROR_CONTRACT.md` for `ApiResponse<T>` shape
- **Pagination**: `?page=N&limit=N` query params on list endpoints; response includes `meta.total`. **Exceptions**: `GET /v1/orders` and `GET /v1/notifications` both use cursor pagination (`?cursor=&limit=N`; response includes `nextCursor` field instead of `total`). All other list endpoints use page-based pagination.

---

## Batch 1 — Platform Core

### `services/auth` — AuthController (`/auth`)

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/auth/register` | None | — | Register new user |
| `POST` | `/v1/auth/login` | None | — | Login with email+password, returns access+refresh tokens |
| `POST` | `/v1/auth/refresh` | None | — | Exchange refresh token for new access token |
| `POST` | `/v1/auth/logout` | J | — | Invalidate refresh token / destroy AuthSession |

### `services/auth` — UsersController (`/users`)

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `GET` | `/v1/users` | J | `user:read` | List users in tenant |
| `GET` | `/v1/users/:id` | J | `user:read` | Get user by ID |
| `PATCH` | `/v1/users/:id` | J | `user:write` | Update user |
| `DELETE` | `/v1/users/:id` | J | `user:delete` | Delete user |

### `services/auth` — SsoController (`/auth/sso`)

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `GET` | `/v1/auth/sso/discover` | None | — | SSO discovery (public) |
| `POST` | `/v1/auth/sso/callback` | None | — | SSO assertion callback (public) |
| `GET` | `/v1/auth/sso/connections` | J | `sso:manage` | List SSO connections |
| `POST` | `/v1/auth/sso/connections` | J | `sso:manage` | Create SSO connection |
| `PATCH` | `/v1/auth/sso/connections/:id` | J | `sso:manage` | Update SSO connection |
| `DELETE` | `/v1/auth/sso/connections/:id` | J | `sso:manage` | Delete SSO connection |

### `services/tenant` — TenantController (`/tenants`)

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/tenants` | J | `tenant:write` | Create tenant |
| `GET` | `/v1/tenants` | J | `tenant:read` | List tenants |
| `GET` | `/v1/tenants/:id` | J | `tenant:read` | Get tenant |
| `PATCH` | `/v1/tenants/:id` | J | `tenant:write` | Update tenant |
| `DELETE` | `/v1/tenants/:id` | J | `tenant:suspend` | Suspend tenant |

### `services/rbac` — RbacController (`/roles`, `/users`)

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/roles` | J | `role:write` | Create role |
| `GET` | `/v1/roles` | J | `role:read` | List roles |
| `GET` | `/v1/roles/:id` | J | `role:read` | Get role |
| `PATCH` | `/v1/roles/:id` | J | `role:write` | Update role |
| `DELETE` | `/v1/roles/:id` | J | `role:write` | Delete role |
| `POST` | `/v1/users/:id/roles` | J | `role:assign` | Assign role to user |
| `DELETE` | `/v1/users/:id/roles/:roleId` | J | `role:revoke` | Revoke role from user |

### `services/audit` — AuditController (`/audit`)

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `GET` | `/v1/audit` | J | `audit:read` | List audit log entries (paginated) |
| `GET` | `/v1/audit/:id` | J | `audit:read` | Get audit log entry |

---

## Batch 2 — Event Operations

### `services/event` — EventController (`/events`) + VenueController (`/venues`)

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/events` | J | TBD | Create event |
| `GET` | `/v1/events` | J | TBD | List events |
| `GET` | `/v1/events/:id` | J | TBD | Get event |
| `PATCH` | `/v1/events/:id` | J | TBD | Update event |
| `POST` | `/v1/events/:id/publish` | J | TBD | Publish event |
| `POST` | `/v1/events/:id/go-live` | J | TBD | Set event LIVE |
| `POST` | `/v1/events/:id/archive` | J | TBD | Archive event |
| `POST` | `/v1/events/:id/cancel` | J | TBD | Cancel event |
| `POST` | `/v1/venues` | J | TBD | Create venue |
| `GET` | `/v1/venues` | J | TBD | List venues |
| `GET` | `/v1/venues/:id` | J | TBD | Get venue |
| `PATCH` | `/v1/venues/:id` | J | TBD | Update venue |
| `DELETE` | `/v1/venues/:id` | J | TBD | Delete venue |

### `services/agenda` — TrackController (`/tracks`) + SessionController (`/sessions`)

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/tracks` | J | TBD | Create track |
| `GET` | `/v1/tracks` | J | TBD | List tracks |
| `GET` | `/v1/tracks/:id` | J | TBD | Get track |
| `PATCH` | `/v1/tracks/:id` | J | TBD | Update track |
| `DELETE` | `/v1/tracks/:id` | J | TBD | Delete track |
| `POST` | `/v1/sessions` | J | TBD | Create session (agenda context) |
| `GET` | `/v1/sessions` | J | TBD | List sessions (agenda context) |
| `GET` | `/v1/sessions/:id` | J | TBD | Get session (agenda context) |
| `PATCH` | `/v1/sessions/:id` | J | TBD | Update session |
| `DELETE` | `/v1/sessions/:id` | J | TBD | Delete session |

Note: `/sessions` prefix also exists in `services/speaker`. Routing ambiguity risk — both are registered in the same NestJS process.

### `services/speaker` — SpeakerController (`/speakers`) + SessionController (`/sessions`)

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/speakers` | J | TBD | Create speaker profile |
| `GET` | `/v1/speakers` | J | TBD | List speakers |
| `GET` | `/v1/speakers/:id` | J | TBD | Get speaker |
| `PATCH` | `/v1/speakers/:id` | J | TBD | Update speaker |
| `DELETE` | `/v1/speakers/:id` | J | TBD | Delete speaker |
| `POST` | `/v1/sessions/:id/speakers` | J | TBD | Assign speaker to session |
| `DELETE` | `/v1/sessions/:id/speakers/:speakerId` | J | TBD | Remove speaker from session |

### `services/exhibitor` — ExhibitorController, BoothController, LeadController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/exhibitors` | J | TBD | Register exhibitor |
| `GET` | `/v1/exhibitors` | J | TBD | List exhibitors |
| `GET` | `/v1/exhibitors/:id` | J | TBD | Get exhibitor |
| `PATCH` | `/v1/exhibitors/:id` | J | TBD | Update exhibitor |
| `POST` | `/v1/booths` | J | TBD | Create booth |
| `GET` | `/v1/booths` | J | TBD | List booths |
| `GET` | `/v1/booths/:id` | J | TBD | Get booth |
| `PATCH` | `/v1/booths/:id` | J | TBD | Update booth |
| `POST` | `/v1/leads` | J | TBD | Capture lead |
| `GET` | `/v1/leads` | J | TBD | List leads |
| `GET` | `/v1/leads/:id` | J | TBD | Get lead |

### `services/attendee` — AttendeeController (`/attendees`)

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `GET` | `/v1/attendees` | J | TBD | List attendees |
| `GET` | `/v1/attendees/:id` | J | TBD | Get attendee |
| `PATCH` | `/v1/attendees/:id` | J | TBD | Update attendee profile |

---

## Batch 3 — Participation

### `services/registration` — RegistrationController, RegistrationFieldController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/registrations` | J | TBD | Submit registration |
| `GET` | `/v1/registrations` | J | TBD | List registrations |
| `GET` | `/v1/registrations/:id` | J | TBD | Get registration |
| `PATCH` | `/v1/registrations/:id` | J | TBD | Update registration |
| `GET` | `/v1/events/:eventId/registration-fields` | J | TBD | List registration fields for event |
| `POST` | `/v1/events/:eventId/registration-fields` | J | TBD | Create registration field |
| `PATCH` | `/v1/events/:eventId/registration-fields/:id` | J | TBD | Update registration field |
| `DELETE` | `/v1/events/:eventId/registration-fields/:id` | J | TBD | Delete registration field |

### `services/onsite` — CheckInController, BadgePrintController, DeviceSessionController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/check-ins` | J | TBD | Create check-in |
| `GET` | `/v1/check-ins` | J | TBD | List check-ins |
| `GET` | `/v1/events/:eventId/check-in-stats` | J | TBD | Get check-in statistics for event |
| `POST` | `/v1/badge-prints` | J | TBD | Record badge print |
| `GET` | `/v1/badge-prints` | J | TBD | List badge prints |
| `POST` | `/v1/device-sessions` | J | TBD | Register device session |
| `GET` | `/v1/device-sessions` | J | TBD | List device sessions |
| `PATCH` | `/v1/device-sessions/:id` | J | TBD | Update device session |
| `DELETE` | `/v1/device-sessions/:id` | J | TBD | End device session |

---

## Batch 4 — Commerce

### `services/ticketing` — TicketProductController, TicketController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/ticket-products` | J | TBD | Create ticket product |
| `GET` | `/v1/ticket-products` | J | TBD | List ticket products |
| `GET` | `/v1/ticket-products/:id` | J | TBD | Get ticket product |
| `PATCH` | `/v1/ticket-products/:id` | J | TBD | Update ticket product |
| `DELETE` | `/v1/ticket-products/:id` | J | TBD | Delete ticket product |
| `GET` | `/v1/tickets` | J | TBD | List tickets |
| `GET` | `/v1/tickets/:id` | J | TBD | Get ticket |

### `services/pricing` — PricingController, PromoCodeController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/pricing-rules` | J | TBD | Create price rule |
| `GET` | `/v1/pricing-rules` | J | TBD | List price rules |
| `PATCH` | `/v1/pricing-rules/:id` | J | TBD | Update price rule |
| `DELETE` | `/v1/pricing-rules/:id` | J | TBD | Delete price rule |
| `POST` | `/v1/promo-codes` | J | TBD | Create promo code |
| `GET` | `/v1/promo-codes` | J | TBD | List promo codes |
| `POST` | `/v1/promo-codes/validate` | J | TBD | Validate promo code |
| `DELETE` | `/v1/promo-codes/:id` | J | TBD | Delete promo code |

### `services/inventory` — InventoryController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `GET` | `/v1/inventory` | J | TBD | List inventory items |
| `GET` | `/v1/inventory/:id` | J | TBD | Get inventory item |
| `PATCH` | `/v1/inventory/:id` | J | TBD | Update inventory (capacity) |

### `services/order` — OrderController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/orders` | J | TBD | Create order (Idempotency-Key required) |
| `GET` | `/v1/orders` | J | TBD | List orders |
| `GET` | `/v1/orders/:id` | J | TBD | Get order |
| `POST` | `/v1/orders/:id/cancel` | J | TBD | Cancel order |

### `services/payment` — PaymentController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/payments` | J | TBD | Initiate payment (Idempotency-Key required) |
| `GET` | `/v1/payments` | J | TBD | List payments |
| `GET` | `/v1/payments/:id` | J | TBD | Get payment |
| `POST` | `/v1/payments/:id/refund` | J | TBD | Issue refund (body: `{ amountCents, reason }`) |

### `services/fulfillment` — FulfillmentController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `GET` | `/v1/fulfillments` | J | TBD | List fulfillments |
| `GET` | `/v1/fulfillments/:id` | J | TBD | Get fulfillment |

---

## Batch 5 — Engagement

### `services/notification` — NotificationController, CampaignController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `GET` | `/v1/notifications` | J | TBD | List notifications |
| `GET` | `/v1/notifications/:id` | J | TBD | Get notification |
| `PATCH` | `/v1/notifications/:id/read` | J | TBD | Mark notification read |
| `POST` | `/v1/campaigns` | J | TBD | Create campaign |
| `GET` | `/v1/campaigns` | J | TBD | List campaigns |
| `POST` | `/v1/campaigns/:id/send` | J | TBD | Trigger campaign send |

### `services/engagement`

No HTTP routes — stub controller only.

---

## Batch 6 — Intelligence (CQRS Read Models)

### `services/analytics` — AnalyticsController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `GET` | `/v1/analytics/events/:id/summary` | J | TBD | Event summary dashboard |
| `GET` | `/v1/analytics/events/:id/registrations` | J | TBD | Registration analytics |
| `GET` | `/v1/analytics/events/:id/checkins` | J | TBD | Check-in analytics |
| `GET` | `/v1/analytics/events/:id/revenue` | J | TBD | Revenue analytics |

Note: exact endpoint paths not fully verified from controller source — above are representative. REQUIRES VERIFICATION.

### `services/search` — SearchController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `GET` | `/v1/search` | J | TBD | Full-text search across indexed entities |

---

## Batch 8 — Social

### `services/networking` — NetworkingController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/networking/connections` | J | TBD | Request connection |
| `GET` | `/v1/networking/connections` | J | TBD | List connections |
| `PATCH` | `/v1/networking/connections/:id` | J | TBD | Accept/decline connection |
| `DELETE` | `/v1/networking/connections/:id` | J | TBD | Remove connection |

---

## Batch 9 — Interactive

### `services/interactive-engagement` — PollController, QaController, SurveyController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/polls` | J | TBD | Create poll |
| `GET` | `/v1/polls/:id` | J | TBD | Get poll |
| `POST` | `/v1/polls/:id/respond` | J | TBD | Submit poll response |
| `POST` | `/v1/qa` | J | TBD | Submit Q&A question |
| `GET` | `/v1/qa` | J | TBD | List Q&A questions |
| `POST` | `/v1/qa/:id/upvote` | J | TBD | Upvote question |
| `POST` | `/v1/surveys` | J | TBD | Create survey |
| `GET` | `/v1/surveys/:id` | J | TBD | Get survey |
| `POST` | `/v1/surveys/:id/respond` | J | TBD | Submit survey response |

---

## Batch 10 — AI

### `services/ai-service` — AiController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/ai/embed` | J | TBD | Create vector embedding |
| `POST` | `/v1/ai/chat` | J | TBD | AI chat interaction |
| `GET` | `/v1/ai/interactions` | J | TBD | List AI interaction logs |

Note: exact endpoint paths not fully verified — representative based on entity and service structure. REQUIRES VERIFICATION.

---

## Cross-Cutting

### `services/integration` — IntegrationController

| Method | Path | Guards | Permission | Description |
|---|---|---|---|---|
| `POST` | `/v1/integrations/webhooks` | J | TBD | Register webhook |
| `GET` | `/v1/integrations/webhooks` | J | TBD | List webhooks |
| `GET` | `/v1/integrations/webhooks/:id` | J | TBD | Get webhook |
| `PATCH` | `/v1/integrations/webhooks/:id` | J | TBD | Update webhook |
| `DELETE` | `/v1/integrations/webhooks/:id` | J | TBD | Delete webhook |

---

## Health Endpoints (not versioned, not in ApiResponse envelope)

| Method | Path | Guards | Description |
|---|---|---|---|
| `GET` | `/v1/health` | None | Liveness probe — returns `{ status: 'ok' }` |
| `GET` | `/v1/health/ready` | None | Readiness probe — checks db + redis + kafka; 503 on failure |

---

## API Documentation

Swagger UI: `/api/docs` (available in development only; disabled in production).
BearerAuth scheme configured for interactive testing.

---

## Known Issues

| Issue | Detail |
|---|---|
| Shared `/sessions` controller prefix | Both `services/agenda` and `services/speaker` declare `@Controller('sessions')`. NestJS registers both; last registered wins for exact path matches. This may cause route collision. |
| Shared `/users` controller prefix | Both `services/auth` (UsersController) and `services/rbac` (user-role routes) use `/users` base. Verify no path collisions. |
| `tenant:suspend` permission unused | Permission code exists in `rbac.service.ts` but no endpoint uses `@RequirePermissions('tenant:suspend')` — the `DELETE /tenants/:id` route uses it in the table above per design intent but REQUIRES VERIFICATION. |
| Permission coverage gap | 21 of 26 service controllers show `TBD` in permission column — `@RequirePermissions` not verified beyond auth/tenant/rbac/audit. |
