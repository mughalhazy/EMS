Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Data Shape Registry

> Describes the canonical data shapes (request and response) for key API
> operations. Extracted from DTO files and response patterns across services.
> Not exhaustive — covers core entities used in the fullstack stitching contract.
> Frontend (Phase E) must derive actual shapes from these records + the
> `@nestjs/swagger` decorators in source DTOs.

## Global Shape Conventions

- All responses wrapped in `ApiResponse<T>` envelope (see `docs/01_backend/ERROR_CONTRACT.md`)
- All UUIDs are lowercase hyphenated strings: `"3f8a2b1c-..."`
- All timestamps are ISO 8601 with UTC: `"2026-06-15T10:30:00.000Z"`
- Soft-deleted records excluded from all list/get responses
- Pagination: `?page=1&limit=20`; response `meta: { page, limit, total, totalPages }`

---

## Auth Shapes

### POST `/v1/auth/register` — Request

```json
{
  "email": "user@example.com",
  "password": "MinEightChars1",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

### POST `/v1/auth/login` — Request

```json
{
  "email": "user@example.com",
  "password": "MinEightChars1"
}
```

### Login / Register — Response `data`

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<opaque>",
  "expiresIn": 900,
  "user": {
    "id": "<uuid>",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "tenantId": "<uuid>"
  }
}
```

### GET `/v1/users/:id` — Response `data`

```json
{
  "id": "<uuid>",
  "tenantId": "<uuid>",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "isActive": true,
  "createdAt": "2026-06-15T10:00:00.000Z"
}
```

---

## Tenant Shapes

### POST `/v1/tenants` — Request

```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "plan": "enterprise"
}
```

### GET `/v1/tenants/:id` — Response `data`

```json
{
  "id": "<uuid>",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "plan": "enterprise",
  "isActive": true,
  "createdAt": "2026-06-15T09:00:00.000Z"
}
```

---

## Event Shapes

### POST `/v1/events` — Request

```json
{
  "title": "TechSummit 2026",
  "slug": "techsummit-2026",
  "startDate": "2026-09-15T09:00:00.000Z",
  "endDate": "2026-09-16T18:00:00.000Z",
  "venueId": "<uuid>"
}
```

### GET `/v1/events/:id` — Response `data`

```json
{
  "id": "<uuid>",
  "tenantId": "<uuid>",
  "title": "TechSummit 2026",
  "slug": "techsummit-2026",
  "status": "DRAFT",
  "startDate": "2026-09-15T09:00:00.000Z",
  "endDate": "2026-09-16T18:00:00.000Z",
  "venueId": "<uuid>",
  "createdAt": "2026-06-15T10:00:00.000Z"
}
```

Event `status` enum: `DRAFT | PUBLISHED | LIVE | ARCHIVED | CANCELLED`

---

## Ticket Product Shapes

### POST `/v1/ticket-products` — Request

```json
{
  "eventId": "<uuid>",
  "name": "General Admission",
  "description": "Standard access",
  "price": 299.00,
  "currency": "USD"
}
```

### GET `/v1/ticket-products/:id` — Response `data`

```json
{
  "id": "<uuid>",
  "tenantId": "<uuid>",
  "eventId": "<uuid>",
  "name": "General Admission",
  "description": "Standard access",
  "price": 299.00,
  "currency": "USD"
}
```

---

## Order Shapes

### POST `/v1/orders` — Request (Idempotency-Key header required)

```json
{
  "eventId": "<uuid>",
  "attendeeId": "<uuid>",
  "items": [
    {
      "ticketProductId": "<uuid>",
      "quantity": 2
    }
  ]
}
```

### GET `/v1/orders/:id` — Response `data`

```json
{
  "id": "<uuid>",
  "tenantId": "<uuid>",
  "attendeeId": "<uuid>",
  "eventId": "<uuid>",
  "status": "CONFIRMED",
  "totalAmount": 598.00,
  "currency": "USD",
  "createdAt": "2026-06-15T10:00:00.000Z",
  "items": [
    {
      "id": "<uuid>",
      "ticketProductId": "<uuid>",
      "quantity": 2,
      "unitPrice": 299.00
    }
  ]
}
```

Order `status` enum: `PENDING | CONFIRMED | CANCELLED`

---

## Registration Shapes

### POST `/v1/registrations` — Request

```json
{
  "eventId": "<uuid>",
  "attendeeId": "<uuid>",
  "fields": [
    { "fieldId": "<uuid>", "value": "Vegetarian" }
  ]
}
```

---

## Check-in Shapes

### POST `/v1/check-ins` — Request

```json
{
  "attendeeId": "<uuid>",
  "eventId": "<uuid>",
  "deviceId": "<uuid>"
}
```

### GET `/v1/events/:eventId/check-in-stats` — Response `data`

```json
{
  "eventId": "<uuid>",
  "totalRegistrations": 500,
  "checkedIn": 342,
  "pendingCheckin": 158,
  "checkInRate": 0.684
}
```

---

## Campaign Shapes

### POST `/v1/campaigns` — Request

```json
{
  "name": "Early Bird Reminder",
  "segmentId": "<uuid>",
  "templateId": "<uuid>",
  "scheduledAt": "2026-07-01T09:00:00.000Z"
}
```

### POST `/v1/campaigns/:id/send` — Request

```json
{}
```
(No body — triggers immediate send regardless of `scheduledAt`)

---

## RBAC Shapes

### POST `/v1/roles` — Request

```json
{
  "name": "Sponsor Manager",
  "description": "Can manage sponsors and exhibitors"
}
```

### POST `/v1/users/:id/roles` — Request

```json
{
  "roleId": "<uuid>"
}
```

---

## Webhook Shapes

### POST `/v1/integrations/webhooks` — Request

```json
{
  "url": "https://example.com/webhooks/ems",
  "secret": "my-signing-secret",
  "events": ["payment.completed", "registration.submitted"]
}
```

Note: `secret` has no minimum length constraint in current DTO (validation gap).

---

## Paginated List Response Pattern

All list endpoints (`GET /v1/{resource}`) return:

```json
{
  "success": true,
  "data": [ { "id": "...", ... }, ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 342,
    "totalPages": 18
  }
}
```

---

## Error Response Pattern

```json
{
  "success": false,
  "error": {
    "code": "EMS_VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      "email must be an email",
      "password must be longer than or equal to 8 characters"
    ]
  }
}
```

See `docs/01_backend/ERROR_CONTRACT.md` for full error code table.
