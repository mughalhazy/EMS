Status: Active
Authority Level: Medium
Last Reviewed: 2026-06-15
Owner: AI

# Database Discovery Report (Phase 2 Backend Authority Capture)

> Comprehensive database findings from Phase 2 (2026-06-15).
> Source: all `services/*/src/entities/` directories, `infra/common/src/base.repository.ts`,
> `apps/api/src/config/env.validation.ts`, `apps/api/src/app.module.ts`.
>
> See `docs/01_backend/DATABASE_SCHEMA.md` for the definitive entity catalog.
> This report adds discovery context and gaps.

## 1. Technology Stack

| Component | Technology | Version |
|---|---|---|
| ORM | TypeORM | 0.3.20 |
| Database | PostgreSQL | Version not pinned in package.json — TBD |
| Node driver | `pg` | `^8.13.0` |
| NestJS integration | `@nestjs/typeorm` | `^10.0.2` |
| Connection | `DATABASE_URL` environment variable | |

## 2. Schema-Per-Service Pattern

Every service owns one Postgres schema named identically to the service:

| Schema | Service | Pattern |
|---|---|---|
| `auth` | services/auth | entity decorator: `@Entity({ schema: 'auth', name: 'users' })` |
| `tenant` | services/tenant | `@Entity({ schema: 'tenant', ... })` |
| `rbac` | services/rbac | `@Entity({ schema: 'rbac', ... })` |
| `audit` | services/audit | `@Entity({ schema: 'audit', ... })` |
| `event` | services/event | `@Entity({ schema: 'event', ... })` |
| `agenda` | services/agenda | `@Entity({ schema: 'agenda', ... })` |
| `speaker` | services/speaker | `@Entity({ schema: 'speaker', ... })` |
| `exhibitor` | services/exhibitor | `@Entity({ schema: 'exhibitor', ... })` |
| `attendee` | services/attendee | `@Entity({ schema: 'attendee', ... })` |
| `registration` | services/registration | `@Entity({ schema: 'registration', ... })` |
| `onsite` | services/onsite | `@Entity({ schema: 'onsite', ... })` |
| `ticketing` | services/ticketing | `@Entity({ schema: 'ticketing', ... })` |
| `pricing` | services/pricing | `@Entity({ schema: 'pricing', ... })` |
| `inventory` | services/inventory | `@Entity({ schema: 'inventory', ... })` |
| `order` | services/order | `@Entity({ schema: 'order', ... })` |
| `payment` | services/payment | `@Entity({ schema: 'payment', ... })` |
| `fulfillment` | services/fulfillment | `@Entity({ schema: 'fulfillment', ... })` |
| `notification` | services/notification | `@Entity({ schema: 'notification', ... })` |
| `networking` | services/networking | `@Entity({ schema: 'networking', ... })` |
| `interactive_engagement` | services/interactive-engagement | `@Entity({ schema: 'interactive_engagement', ... })` |
| `ai_service` | services/ai-service | `@Entity({ schema: 'ai_service', ... })` |
| `integration` | services/integration | `@Entity({ schema: 'integration', ... })` |
| `analytics` | services/analytics | Projection tables (exact names TBD) |

`services/engagement` and `services/ui-renderer` are stubs with no entities.
`services/search` uses OpenSearch, not Postgres.

## 3. Cross-Schema Reference Policy

Per ADR-001 (Principle 2: "Domain isolation"):
- No TypeORM-level foreign keys across schemas
- Cross-service references are plain UUID string columns
- Referenced entities are not joined at the DB level
- Referential integrity is maintained at the application layer

Example: `agenda.sessions.roomId` references `event.rooms.id` by UUID value,
not via a database FK. If the room is deleted, the session retains the orphaned
UUID until the application handles the case.

**Risk**: No cascade deletes across schemas; orphaned cross-schema UUID references
may accumulate over time.

## 4. Multi-Tenancy Implementation

All tenant-scoped entities carry:
```typescript
@Column({ name: 'tenant_id' })
tenantId: string;
```

Enforced by `TenantScopedRepository<T>` in `infra/common/src/base.repository.ts`:
- Appends `WHERE tenant_id = $1` to every SELECT query
- Injects `tenantId` into every INSERT

There is **no Postgres Row-Level Security (RLS)** — isolation is entirely
application-layer. A raw SQL query (e.g., in a migration or admin script)
bypasses this protection.

## 5. Soft Delete Pattern

`TenantScopedRepository.softDelete()` uses TypeORM's `@DeleteDateColumn`
(`deleted_at` column). All `find()` queries include `WHERE deleted_at IS NULL`
automatically via TypeORM's soft-delete filter.

Hard deletes are not used in any service layer examined this pass.

## 6. Entity Count by Service

| Service | Entity count | Entity names |
|---|---|---|
| auth | 5 | User, UserCredential, AuthSession, SsoConnection, SsoIdentity |
| tenant | 3 | Tenant, TenantSettings, Organization |
| rbac | 4 | Role, Permission, UserRole, RolePermission |
| audit | 1 | AuditLog |
| event | 3 | Event, Venue, Room |
| agenda | 2 | Session, Track |
| speaker | 3 | Speaker, SpeakerProfile, SessionSpeaker |
| exhibitor | 5 | Exhibitor, Booth, SponsorPackage, Sponsor, Lead |
| attendee | 3 | Attendee, AttendeeProfile, AttendeeTag |
| registration | 2 | Registration, RegistrationField |
| onsite | 3 | CheckIn, BadgePrint, DeviceSession |
| ticketing | 3 | TicketProduct, Ticket, TicketEntitlement |
| pricing | 3 | PriceRule, DiscountRule, PromoCode |
| inventory | 1 | InventoryItem |
| order | 2 | Order, OrderItem |
| payment | 3 | Payment, Refund, PaymentTransaction |
| fulfillment | 1 | Fulfillment |
| notification | 4 | Notification, NotificationTemplate, Campaign, AudienceSegment |
| networking | 1 | AttendeeConnection |
| interactive_engagement | 5 | Poll, PollResponse, QaQuestion, Survey, SurveyResponse |
| ai_service | 2 | VectorEmbedding, AIInteractionLog |
| integration | 2 | WebhookSubscription, WebhookDelivery |
| analytics | TBD | Projection tables not enumerated |
| **Total** | **~64+** | |

## 7. Entity Naming Deviations (GAP-G9 Summary)

16 entities in code have names that differ from canon docs. All have been
corrected in `docs/00_authority/DOMAIN_MODEL.md`. The underlying canon doc
(`docs/canon/domain-model.md`) was not modified — reconciliation requires ADR.

Key deviations:
- `TicketType` → `TicketProduct` (+ new `TicketEntitlement`)
- `Discount` → `DiscountRule`
- `InventoryPool`/`InventoryReservation` → `InventoryItem` (single entity)
- `FulfillmentRequest`/`DeliveryRecord` → `Fulfillment` (single entity)
- `RegistrationForm`/`RegistrationAnswer` → `RegistrationField`
- `Badge`/`SessionAttendance` → `BadgePrint`/`DeviceSession`
- `Connection` → `AttendeeConnection`
- `Room` moved from `agenda` → `event` schema

## 8. Unverified / Missing Entities

| Entity | Status | Notes |
|---|---|---|
| `EventSettings` | Not found in code | Canon doc references it; no `event-settings.entity.ts` found (TBD) |
| Analytics projection tables | Not extracted | CQRS read model — names not inspected this pass |
| Outbox table | Referenced in code pattern | No dedicated entity file found — may be inline TypeORM entity or Postgres table outside TypeORM |

## 9. Schema Management

| Environment | Strategy |
|---|---|
| Development | `synchronize: true` — TypeORM auto-applies entity changes to schema |
| Production | `synchronize: false`, `migrationsRun: true` — migration files in `src/migrations/` (existence not verified this pass) |

**Risk**: `synchronize: true` in development means accidental entity changes
can destructively alter the schema (e.g., dropping a column). Production is
safe via migrations only.

## 10. Vector Storage (`ai_service`)

`VectorEmbedding` entity stores embeddings in `ai_service.vector_embeddings`.
The column type for `embedding` is `vector` — this requires the `pgvector`
Postgres extension. Whether `pgvector` is included in the Docker Compose
Postgres image was not verified (TBD — REQUIRES VERIFICATION).
