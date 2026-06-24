Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Validation Rules

> Extracted from `apps/api/src/main.ts` (global pipe config) and
> representative DTO files across 10 services.
> All validation is enforced at the NestJS controller boundary via
> `class-validator` / `class-transformer`. Source of truth is the implementation.

## 1. Global ValidationPipe Configuration

```typescript
// apps/api/src/main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // strips unknown properties silently
  forbidNonWhitelisted: true,   // throws 400 if unknown props present (after whitelist)
  transform: true,              // transforms plain objects to DTO class instances
  enableImplicitConversion: true, // auto-coerces query param strings to declared types
}));
```

Consequence: any field not declared in a DTO class is **stripped and rejected**.
Frontends must send exactly the fields the DTO declares — no extras.

## 2. Library Versions

| Package | Version |
|---|---|
| `class-validator` | `^0.14.1` |
| `class-transformer` | `^0.5.1` |

## 3. Common Validation Decorators (observed in code)

| Decorator | Validated constraint | Observed in |
|---|---|---|
| `@IsEmail()` | Valid email format | `CreateUserDto`, `RegisterDto` |
| `@IsString()` | Type check | Universal — all string fields |
| `@IsNotEmpty()` | Non-empty string | Universal — all required string fields |
| `@IsUUID()` | UUID v4 format | ID reference fields (e.g. `eventId`, `attendeeId`) |
| `@IsOptional()` | Allows `undefined` — skips other validators | Optional fields |
| `@IsEnum(Enum)` | Must be a declared enum value | Status fields, type fields |
| `@IsNumber()` | Numeric type | `price`, `capacity`, `quantity` |
| `@Min(n)` | Minimum number | `price` (0), `quantity` (1), `capacity` (1) |
| `@Max(n)` | Maximum number | `limit` (100) |
| `@IsBoolean()` | Boolean type | Feature flags, `isActive` |
| `@IsArray()` | Array type | `events` (webhook subscriptions), bulk list fields |
| `@IsObject()` | Object/jsonb type | `billingInfo`, `criteria`, `settings` |
| `@IsUrl()` | Valid URL | `url` in webhook subscriptions |
| `@MinLength(n)` | Minimum string length | Password fields (currently NOT on webhook secret — see §5) |
| `@MaxLength(n)` | Maximum string length | `name` (255), `description` (2000) |
| `@IsDateString()` | ISO 8601 date string | `startDate`, `endDate`, `scheduledAt` |
| `@IsPositive()` | Number > 0 | Price amounts |
| `@ValidateNested()` | Nested DTO validation | `billingInfo` objects |
| `@Type(() => NestedDto)` | class-transformer for nested | With `@ValidateNested()` |

## 4. Per-Service DTO Patterns (Verified)

### auth

| DTO | Key validations |
|---|---|
| `RegisterDto` | `email: @IsEmail()`, `password: @IsString() @MinLength(8)`, `firstName: @IsString()`, `lastName: @IsString()` |
| `LoginDto` | `email: @IsEmail()`, `password: @IsString() @IsNotEmpty()` |
| `CreateSsoConnectionDto` | `provider: @IsString()`, `issuer: @IsString()`, `certificate: @IsString()`, `metadataUrl: @IsUrl()` |
| `SsoAssertionDto` | `connectionId: @IsUUID()`, `assertion: @IsString()` |
| `RefreshTokenDto` | `refreshToken: @IsString() @IsNotEmpty()` |

### tenant

| DTO | Key validations |
|---|---|
| `CreateTenantDto` | `name: @IsString() @IsNotEmpty()`, `slug: @IsString()`, `plan: @IsString()` — **note: `plan` is missing `@IsOptional()`** (security finding SEC-005) |

### ticketing

| DTO | Key validations |
|---|---|
| `CreateTicketProductDto` | `name: @IsString()`, `price: @IsNumber() @Min(0)`, `currency: @IsString()`, `eventId: @IsUUID()` |
| `CreateTicketDto` | `ticketProductId: @IsUUID()`, `attendeeId: @IsUUID()`, `orderId: @IsUUID()` |

### order

| DTO | Key validations |
|---|---|
| `CreateOrderDto` | `eventId: @IsUUID()`, `attendeeId: @IsUUID()`, `items: @IsArray() @ValidateNested({ each: true })`, `@Type(() => OrderItemDto)` |
| `OrderItemDto` | `ticketProductId: @IsUUID()`, `quantity: @IsNumber() @Min(1)` |

### payment

| DTO | Key validations |
|---|---|
| `CreatePaymentDto` | `orderId: @IsUUID()`, `amount: @IsNumber() @IsPositive()`, `currency: @IsString()`, `gateway: @IsString()` |

### pricing

| DTO | Key validations |
|---|---|
| `CreateDiscountRuleDto` | `type: @IsEnum(DiscountType)`, `amount: @IsNumber() @Min(0) @Max(100)`, `maxUses: @IsNumber() @Min(1)` |
| `CreatePromoCodeDto` | `code: @IsString() @IsNotEmpty()`, `discountRuleId: @IsUUID()` |

### registration

| DTO | Key validations |
|---|---|
| `CreateRegistrationDto` | `eventId: @IsUUID()`, `attendeeId: @IsUUID()`, `fields: @IsArray() @ValidateNested({ each: true })` |

### notification

| DTO | Key validations |
|---|---|
| `CreateCampaignDto` | `name: @IsString()`, `segmentId: @IsUUID()`, `templateId: @IsUUID()`, `scheduledAt: @IsDateString() @IsOptional()` |

### integration (webhook)

| DTO | Key validations |
|---|---|
| `CreateWebhookSubscriptionDto` | `url: @IsUrl()`, `secret: @IsString()`, `events: @IsArray()` — **`secret` has no `@MinLength()` constraint** (security finding SEC-004) |

### rbac

| DTO | Key validations |
|---|---|
| `CreateRoleDto` | `name: @IsString() @IsNotEmpty()`, `description: @IsString() @IsOptional()` |
| `AssignRoleDto` | `roleId: @IsUUID()` |

## 5. Known Validation Gaps

| Finding ID | Location | Issue |
|---|---|---|
| SEC-004 | `CreateWebhookSubscriptionDto.secret` | No `@MinLength()` — webhook secrets could be empty strings |
| SEC-005 | `CreateTenantDto.plan` | Missing `@IsOptional()` — may cause unexpected rejection/acceptance depending on call pattern |

## 6. Query Parameter Transformation

With `enableImplicitConversion: true`, query parameters are auto-coerced:

- `?page=2` → `page: number` (string `"2"` → `2`)
- `?limit=50` → `limit: number`
- `?isActive=true` → `isActive: boolean`

Pagination DTOs typically include:

```typescript
class PaginationDto {
  @IsOptional() @IsNumber() @Min(1) page?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(100) limit?: number;
}
```

## 7. Request Body Handling

`transform: true` means requests must include `Content-Type: application/json`.
`class-transformer` deserializes the JSON body into the typed DTO class before
validators run. Nested objects require `@Type(() => NestedClass)` from
`class-transformer` for proper instantiation.

## 8. Idempotency Header (Not a Validation Pipe Concern)

`Idempotency-Key` headers are read manually in service methods via
`@Headers('idempotency-key')` and stored in `IdempotencyStore`. They are not
validated by `ValidationPipe`. The application must check presence and
string-validity in the service layer.
