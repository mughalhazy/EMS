Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Event and Queue Architecture

> Extracted from `infra/event-bus/src/topics.ts`,
> `infra/event-bus/src/event-bus.service.ts`,
> `infra/event-bus/src/event-bus.module.ts`,
> `apps/api/src/app.module.ts`, and service-level Kafka consumer annotations.
> Source of truth is the implementation.

## 1. Technology

| Component | Technology | Version / Config |
|---|---|---|
| Message broker | Apache Kafka | `kafkajs ^2.2.4` |
| Client library | `kafkajs` | Idempotent producer, `maxInFlightRequests: 5` |
| Consumer library | `@nestjs/microservices` Kafka transport | Via `EventBusModule` |
| Event metadata | Auto-added by `EventBusService.publish()` | `eventId` (uuid v4), `occurredAt` (ISO 8601) |
| Error handling | Catch and log | **No DLQ** — errors are caught and logged only; events are not retried after all producer retries exhaust |
| Kafka key | `tenantId` | Ensures ordered delivery per tenant on a given partition |

## 2. EventBusService (`infra/event-bus/src/event-bus.service.ts`)

```typescript
class EventBusService {
  publish(topic: string, payload: object): Promise<void>
  // Auto-adds: eventId (uuid v4), occurredAt (ISO timestamp)
  // Kafka key = tenantId (from payload)
  // Producer config: idempotent=true, maxInFlightRequests=5, retries=10
  // On error: logs error, does NOT throw (swallows — no DLQ)

  subscribe(topic: string, groupId: string, handler: (msg) => void): void
  // Creates per-subscriber Kafka consumer
  // Each consumer group maintains independent offset tracking
}
```

## 3. Outbox Pattern — INFRASTRUCTURE EXISTS, BYPASSED BY SERVICES (CORRECTION 2026-06-17)

> **CORRECTION (Phase 3.25 — 2026-06-17):** The outbox relay infrastructure
> IS implemented (`infra/event-bus/src/outbox.entity.ts`, `outbox.relay.ts`)
> and is registered in `EventBusModule`. The relay polls every 5 seconds for
> pending `OutboxEntity` records and publishes them to Kafka. HOWEVER: **all 26
> application services call `EventBusService.publish()` directly** rather than
> writing to the outbox table. No service extends `TenantScopedRepository` or
> calls `buildOutboxEntry()`. The outbox table is therefore always empty —
> the relay runs but finds no records. Event delivery is effectively direct
> (not via the transactional outbox) in the current implementation.

**Outbox relay (built, not used by services)**:
- `OutboxEntity` schema: `id`, `event_type`, `tenant_id`, `payload` (jsonb), `created_at`, `dispatched_at`
- `OutboxRelay`: `@Cron(EVERY_5_SECONDS)` polls for `dispatchedAt IS NULL` → calls `eventBus.publishBatch()` → marks dispatched
- Registered in `EventBusModule.forRoot()` globally

**Actual publish path (all 26 services)**: `eventBus.publish(topic, payload)` directly in service methods, outside of Postgres transactions. On Kafka error: caught and logged (no retry write to outbox). See GAP-B6 and OCR-4.

## 4. Module Registration

`EventBusModule.forRoot({ brokers: KAFKA_BROKERS, clientId: 'ems-api' })`
registered globally in `apps/api/src/app.module.ts`. Not required in development
if `KAFKA_BROKERS` is unset (readiness check will fail but app starts).

## 5. All 64 Kafka Topics

> **Corrected 2026-06-17** (Pre-Frontend Delta Audit): topic count corrected (57→64);
> all topic names corrected to match `infra/event-bus/src/topics.ts` exactly.
> **Subscriber lists verified 2026-06-17** (Determinability Review): all subscriber
> columns are now code-verified by reading each service's `onModuleInit` / `subscribe()`
> call. Group IDs are actual `groupId` arguments passed to `EventBusService.subscribe()`.

Topics are defined in `infra/event-bus/src/topics.ts`.

### Domain: Platform Core

| Topic | Publisher | Subscribers (known) |
|---|---|---|
| `tenant.created` | `services/tenant` | `services/rbac` (seed roles), `services/auth` (no-op), `services/audit` |
| `tenant.updated` | `services/tenant` | `services/audit` |
| `tenant.suspended` | `services/tenant` | `services/audit` |
| `user.registered` | `services/auth` | `services/rbac` (assign attendee role), `services/audit` |
| `user.login_succeeded` | `services/auth` | `services/audit` |
| `user.login_failed` | `services/auth` | `services/audit` |
| `user.password_changed` | `services/auth` | `services/audit` |
| `user.status_changed` | `services/auth` | `services/audit`, `services/integration` |
| `user.sso_login_succeeded` | `services/auth` | `services/audit` |
| `role.assigned` | `services/rbac` | `services/audit` |
| `role.revoked` | `services/rbac` | `services/audit` |

### Domain: Event Operations

| Topic | Publisher | Subscribers (known) |
|---|---|---|
| `event.created` | `services/event` | `services/audit`, `services/analytics`¹, `services/search`, `services/ai-service`, `services/exhibitor` (no-op), `services/integration` |
| `event.updated` | `services/event` | `services/audit`, `services/ai-service`, `services/integration` |
| `event.published` | `services/event` | `services/audit`, `services/search`, `services/integration` |
| `event.unpublished` | `services/event` | `services/audit`, `services/integration` |
| `event.went_live` | `services/event` | `services/audit`, `services/search` |
| `event.archived` | `services/event` | `services/audit`, `services/search`, `services/integration` |
| `event.cancelled` | `services/event` | `services/audit`, `services/search`, `services/registration`, `services/interactive-engagement`, `services/integration` |
| `session.created` | `services/agenda` | `services/audit`, `services/search`, `services/speaker` (cleans assignments), `services/ai-service`, `services/integration` |
| `session.updated` | `services/agenda` | `services/audit`, `services/ai-service`, `services/integration` |
| `session.cancelled` | `services/agenda` | `services/audit`, `services/search`, `services/speaker` (deletes SessionSpeaker), `services/integration` |
| `speaker.created` | `services/speaker` | `services/audit`, `services/search`, `services/ai-service`, `services/integration` |
| `speaker.updated` | `services/speaker` | `services/audit`, `services/ai-service`, `services/integration` |
| `speaker.assigned_to_session` | `services/speaker` | `services/audit` |
| `exhibitor.created` | `services/exhibitor` | `services/audit`, `services/search` |
| `sponsor.created` | `services/exhibitor` | `services/audit` |
| `lead.captured` | `services/exhibitor` | `services/audit` |
| `attendee.created` | `services/attendee` | `services/audit`, `services/search`, `services/ai-service`, `services/onsite` (pre-creates BadgePrint), `services/exhibitor` (no-op), `services/integration` |
| `attendee.profile_updated` | `services/attendee` | `services/audit`, `services/search`, `services/ai-service`, `services/integration` |

### Domain: Participation

| Topic | Publisher | Subscribers (known) |
|---|---|---|
| `registration.submitted` | `services/registration` | `services/audit`, `services/analytics`, `services/integration` |
| `registration.approved` | `services/registration` | `services/audit`, `services/integration` |
| `registration.confirmed` | `services/registration` | `services/audit`, `services/attendee` (creates Attendee record), `services/notification`, `services/integration` |
| `registration.cancelled` | `services/registration` | `services/audit`, `services/analytics`, `services/integration` |
| `registration.waitlisted` | `services/registration` | `services/audit`, `services/integration` |
| `attendee.checked_in` | `services/onsite` | `services/audit`, `services/analytics`, `services/integration` |
| `session.attended` | `services/onsite` | `services/audit` |

### Domain: Commerce

| Topic | Publisher | Subscribers (known) |
|---|---|---|
| `ticket_product.created` | `services/ticketing` | `services/audit`, `services/inventory` (creates InventoryItem) |
| `ticket.issued` | `services/ticketing` | `services/audit`, `services/analytics`, `services/notification`, `services/integration` |
| `ticket.redeemed` | `services/ticketing` | `services/audit`, `services/analytics`, `services/integration` |
| `ticket.voided` | `services/ticketing` | `services/audit` |
| `inventory.reserved` | `services/inventory` | `services/audit`, `services/integration` |
| `inventory.released` | `services/inventory` | `services/audit`, `services/integration` |
| `inventory.depleted` | `services/inventory` | `services/audit`, `services/integration` |
| `order.created` | `services/order` | `services/audit`, `services/integration` |
| `order.paid` | `services/order` | `services/audit`, `services/analytics`, `services/notification`, `services/fulfillment`, `services/integration` |
| `order.cancelled` | `services/order` | `services/audit`, `services/inventory` (releases stock), `services/analytics`, `services/integration` |
| `order.fulfilled` | `services/order` | `services/audit`, `services/integration` |
| `payment.completed` | `services/payment` | `services/audit`, `services/order` (transitions to paid, publishes order.paid), `services/integration` |
| `payment.failed` | `services/payment` | `services/audit`, `services/order`, `services/integration` |
| `payment.refunded` | `services/payment` | `services/audit`, `services/order`, `services/integration` |
| `promo_code.redeemed` | `services/pricing` | `services/audit` |
| `fulfillment.completed` | `services/fulfillment` | `services/audit`, `services/order` (transitions to fulfilled), `services/ticketing` (issues tickets), `services/inventory` (releases items), `services/integration` |

### Domain: Engagement

| Topic | Publisher | Subscribers (known) |
|---|---|---|
| `notification.sent` | `services/notification` | `services/audit`, `services/integration` |
| `notification.failed` | `services/notification` | `services/audit`, `services/integration` |
| `campaign.scheduled` | `services/notification` | `services/audit` |
| `campaign.sent` | `services/notification` | `services/audit` |

### Domain: Social

| Topic | Publisher | Subscribers (known) |
|---|---|---|
| `connection.requested` | `services/networking` | `services/audit`, `services/integration` |
| `connection.accepted` | `services/networking` | `services/audit`, `services/analytics`, `services/integration` |
| `connection.declined` | `services/networking` | `services/audit`, `services/integration` |

### Domain: Interactive Engagement

| Topic | Publisher | Subscribers (known) |
|---|---|---|
| `poll.created` | `services/interactive-engagement` | `services/audit`, `services/integration` |
| `poll.responded` | `services/interactive-engagement` | `services/audit`, `services/analytics`, `services/integration` |
| `qa.question_submitted` | `services/interactive-engagement` | `services/audit`, `services/analytics`, `services/integration` |
| `survey.completed` | `services/interactive-engagement` | `services/audit`, `services/analytics`, `services/integration` |

### Domain: AI

| Topic | Publisher | Subscribers (known) |
|---|---|---|
| `embedding.updated` | `services/ai-service` | `services/audit`, `services/search`, `services/integration` |

Note: `services/audit` subscribes to ALL 64 topics (`Object.values(Topics)` from `topics.ts`).
`services/integration` subscribes to a hardcoded list of 41 topics (not all 64 — see GAP-B15).

¹ Analytics subscribes only to: `registration.submitted`, `registration.cancelled`,
`attendee.checked_in`, `order.paid`, `order.cancelled`, `ticket.issued`, `ticket.redeemed`,
`connection.accepted`, `poll.responded`, `qa.question_submitted`, `survey.completed`.

---

Total topic count: **64** (verified against `infra/event-bus/src/topics.ts` on 2026-06-17)

## 6. Known Gaps and Risks

| ID | Finding | Severity |
|---|---|---|
| No DLQ | Failed events are logged only — no retry mechanism after Kafka producer exhausts retries | High |
| No schema registry | Event payload shape is TypeScript-only contract; no Avro/Protobuf schema registry | Medium |
| Subscriber documentation incomplete | The "Subscribers (known)" column above is derived from code inspection but may miss some consumers | Low |
| No ordering guarantee across services | Kafka key=tenantId gives per-tenant ordering on a partition, but partition count and rebalancing can cause gaps | Low |
