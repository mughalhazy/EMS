Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Validation Parity

> This document defines the parity contract between backend validation
> (`class-validator` DTOs in NestJS) and any future frontend validation
> (Phase E). Ensures the frontend mirrors the backend — no frontend form
> should accept values the backend will reject, and vice versa.
>
> Backend is the source of truth. Frontend validation is a UX optimization;
> it does not replace backend validation.

## 1. Principle

The backend enforces **all** validation via the global `ValidationPipe`:
```
whitelist: true + forbidNonWhitelisted: true + transform: true
```

This means:
- Unknown fields are stripped and cause a 400 error
- Missing required fields cause a 400 error
- Type mismatches cause a 400 error (with `enableImplicitConversion: true` for primitives)

The frontend MUST replicate these constraints to provide inline form feedback
before submission. The backend MUST remain the ultimate authority.

---

## 2. Shared Validation Rules by Field Type

| Field pattern | Backend constraint | Frontend equivalent |
|---|---|---|
| `email` | `@IsEmail()` | HTML `type="email"` + regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `password` | `@IsString() @MinLength(8)` | Min length 8, UI strength indicator recommended |
| Any UUID reference | `@IsUUID()` | Controlled by select/picker — user should never type a UUID |
| Enum field | `@IsEnum(EnumType)` | Dropdown with exact enum values |
| Number ≥ 0 | `@IsNumber() @Min(0)` | `type="number" min="0"` |
| Positive integer | `@IsNumber() @IsPositive() @Min(1)` | `type="number" min="1"` |
| ISO date string | `@IsDateString()` | Date picker outputting ISO 8601 |
| URL | `@IsUrl()` | HTML `type="url"` |
| Optional field | `@IsOptional()` | Field may be omitted — do not send `null` unless backend accepts it |
| Array | `@IsArray()` | Send as JSON array, not comma-delimited string |

---

## 3. Per-Endpoint Parity Requirements

### Registration: `POST /v1/auth/register`

| Field | Backend | Frontend |
|---|---|---|
| `email` | `@IsEmail() @IsNotEmpty()` | Required, email format |
| `password` | `@IsString() @MinLength(8)` | Required, min 8 chars |
| `firstName` | `@IsString() @IsNotEmpty()` | Required |
| `lastName` | `@IsString() @IsNotEmpty()` | Required |

No extra fields allowed (`forbidNonWhitelisted: true`).

### Login: `POST /v1/auth/login`

| Field | Backend | Frontend |
|---|---|---|
| `email` | `@IsEmail() @IsNotEmpty()` | Required, email format |
| `password` | `@IsString() @IsNotEmpty()` | Required |

### Create Order: `POST /v1/orders`

| Field | Backend | Frontend |
|---|---|---|
| `eventId` | `@IsUUID()` | Auto-populated from context, not user-typed |
| `attendeeId` | `@IsUUID()` | Auto-populated from logged-in user context |
| `items` | `@IsArray() @ValidateNested({ each: true })` | One or more ticket product selections |
| `items[].ticketProductId` | `@IsUUID()` | Selected from product list |
| `items[].quantity` | `@IsNumber() @Min(1)` | Numeric input, minimum 1 |

Additionally: `Idempotency-Key` header must be sent (UUID v4 generated client-side).

### Create Ticket Product: `POST /v1/ticket-products`

| Field | Backend | Frontend |
|---|---|---|
| `eventId` | `@IsUUID()` | Auto-populated from context |
| `name` | `@IsString() @IsNotEmpty()` | Required text input |
| `description` | `@IsString() @IsOptional()` | Optional text area |
| `price` | `@IsNumber() @Min(0)` | Required, non-negative number |
| `currency` | `@IsString()` | 3-char ISO currency code selector |

### Create Promo Code: `POST /v1/promo-codes`

| Field | Backend | Frontend |
|---|---|---|
| `code` | `@IsString() @IsNotEmpty()` | Required, recommend uppercase alphanumeric |
| `discountRuleId` | `@IsUUID()` | Selected from discount rules list |

### Create Campaign: `POST /v1/campaigns`

| Field | Backend | Frontend |
|---|---|---|
| `name` | `@IsString()` | Required |
| `segmentId` | `@IsUUID()` | Selected from audience segments list |
| `templateId` | `@IsUUID()` | Selected from notification templates list |
| `scheduledAt` | `@IsDateString() @IsOptional()` | Optional date-time picker (ISO 8601) |

### Register Webhook: `POST /v1/integrations/webhooks`

| Field | Backend | Frontend |
|---|---|---|
| `url` | `@IsUrl()` | Required URL input (https preferred) |
| `secret` | `@IsString()` | Required — **recommend min 16 chars in frontend even though backend has no @MinLength** (backend gap SEC-004) |
| `events` | `@IsArray()` | Multi-select from event catalog |

---

## 4. Error Handling Parity

When backend returns `EMS_VALIDATION_ERROR` (400):

```json
{
  "success": false,
  "error": {
    "code": "EMS_VALIDATION_ERROR",
    "message": "Validation failed",
    "details": ["email must be an email", "password must be longer than or equal to 8 characters"]
  }
}
```

Frontend must:
1. Parse `error.details[]` — each string identifies a field + constraint
2. Map to form field errors (string parsing required — no structured field+message object is returned)
3. Display inline below affected fields

---

## 5. Fields That Must Not Be Sent from Frontend

The `whitelist: true + forbidNonWhitelisted: true` combination means the backend
rejects requests containing any field not declared in the DTO.

Frontend must NOT forward:
- Internal client-side state (e.g. `_formDirty`, `_uiSelected`)
- Server-assigned fields (e.g. `id`, `tenantId`, `createdAt`, `status`)
- Read-only computed values

---

## 6. Idempotency-Key Header

For write operations in `order` and `payment` services:

- Generate a UUID v4 client-side before each submission
- Send as `Idempotency-Key: <uuid>` header
- On success: clear/discard the key (each new submission needs a new key)
- On network error (timeout/5xx): retry with the **same** key — backend will detect replay and return the same response
- On 409 EMS_CONFLICT: the key was already processed — do NOT retry; show success state from the original response

---

## 7. Phase E Implementation Notes

When `apps/web` is built:

1. Derive field-level constraints from the DTO source files (not from this document alone)
2. Use the Swagger UI at `/api/docs` (in development) to verify accepted shapes
3. Implement Zod schemas (recommended) mirroring backend DTOs
4. All form submissions must include error boundary catching `EMS_*` codes
5. Access token (900s TTL) requires silent refresh before expiry — implement
   proactive refresh at ~840s, or reactive refresh on 401 response
