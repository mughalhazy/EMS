Status: Active
Authority Level: Medium
Last Reviewed: 2026-06-15
Owner: AI

# Event Discovery Report (Phase 2 Backend Authority Capture)

> Comprehensive findings on the Kafka event architecture discovered during
> Phase 2 (2026-06-15). Source: `infra/event-bus/src/topics.ts`,
> `infra/event-bus/src/event-bus.service.ts`,
> `services/rbac/src/rbac.service.ts` (subscriber example),
> `apps/api/src/app.module.ts`.
>
> See `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md` for the definitive
> topic catalog. This report adds analytical context.

## 1. Infrastructure Summary

| Attribute | Value |
|---|---|
| Message broker | Apache Kafka |
| Client library | `kafkajs ^2.2.4` |
| Total topics | **57** |
| Domains | 8 (Platform Core, Event Operations, Participation, Commerce, Engagement, Social, Interactive, AI) + Integration/Audit |
| Producer config | Idempotent, `maxInFlightRequests: 5`, `retries: 10` |
| Consumer pattern | Per-service consumer groups (e.g., `rbac-service`) |
| Event augmentation | `EventBusService` auto-adds `eventId` (UUID v4) and `occurredAt` (ISO 8601) to every published event |
| Kafka key | `tenantId` — enables per-tenant partition ordering |
| DLQ | None |
| Schema registry | None (TypeScript-only payload contracts) |

## 2. Outbox Pattern

Domain events are written to an outbox table in the same Postgres transaction
as the triggering business write. `TenantScopedRepository.buildOutboxEntry()`
returns the outbox record. `infra/event-bus` relays outbox records to Kafka
asynchronously, ensuring at-least-once delivery.

**Guarantee**: An event will not be lost if Kafka is temporarily down at the
time of the business write — the outbox record survives in Postgres until
relayed successfully.

**Risk**: If the outbox relay process itself fails (process crash between DB
write and Kafka publish), the outbox record may be replayed, causing
at-least-once (not exactly-once) delivery. Consumers must handle idempotent
receipt.

## 3. Topic Distribution by Domain

| Domain | Topic count | Primary publisher |
|---|---|---|
| Platform Core | 4 | auth, tenant |
| Event Operations | 11 | event, agenda, speaker, exhibitor |
| Participation | 5 | registration, attendee, onsite |
| Commerce | 15 | ticketing, pricing, inventory, order, payment, fulfillment |
| Engagement | 2 | notification |
| Social | 2 | networking |
| Interactive Engagement | 5 | interactive-engagement |
| AI | 4 | ai-service |
| Integration/Audit/RBAC | 9 | integration, rbac, audit |
| **Total** | **57** | |

Commerce domain (15 topics) is the most event-rich, reflecting the complex
transactional flow: inventory → ticketing → order → payment → fulfillment.

## 4. Known Consumer Relationships

Verified consumer subscriptions (not exhaustive — subscriber list is partial):

| Service | Consumer Group | Subscribed Topics |
|---|---|---|
| `rbac` | `rbac-service` | `tenant.created`, `user.registered` |
| `notification` | (TBD) | `event.published`, `event.went_live`, `event.cancelled`, `registration.submitted`, `order.confirmed`, `order.cancelled`, `payment.completed`, `payment.failed`, `payment.refund_completed`, `networking.connection_accepted`, `lead.captured`, `fulfillment.dispatched`, `fulfillment.delivered` |
| `analytics` | (TBD) | Broad subscription — most platform events |
| `search` | (TBD) | Entity-creation and update events (`speaker.profile_updated`, `attendee.profile_updated`, `event.created`, `agenda.session_created`, etc.) |
| `audit` | (TBD) | All events (writes audit trail) |
| `integration` | (TBD) | All events (fans out to webhook subscribers) |
| `fulfillment` | (TBD) | `payment.completed` |
| `attendee` | (TBD) | `user.registered` |

Note: Consumer groups other than `rbac-service` were not extracted from code
this pass — marked TBD — REQUIRES VERIFICATION.

## 5. Critical Gap: No Dead-Letter Queue

When `EventBusService.publish()` exhausts all 10 retries:
- The exception is caught and logged
- The event is **permanently lost**
- No DLQ, no persistence, no alerting

This affects:
- **Fulfillment**: if `payment.completed` is lost, order fulfillment never triggers
- **Notification**: if `registration.submitted` is lost, confirmation email is never sent
- **Audit**: if any event is lost, the audit trail has gaps

**Recommendation**: Implement a Kafka DLQ topic (`ems.dlq`) or a Postgres-backed
retry table. At minimum, increment a metric (`kafka_publish_failures_total`)
and alert.

## 6. No Kafka Schema Registry

Event payloads are TypeScript interfaces — no Avro, Protobuf, or JSON Schema
registry exists. This means:
- No compile-time enforcement that publishers and subscribers agree on field names
- Payload evolution is unchecked — a publisher can add/remove fields silently
- TypeScript's structural typing provides some protection within the same codebase

**Recommendation**: For future cross-team or external webhook consumers,
consider adding a JSON Schema registry or at minimum documenting event shapes
in `EVENT_AND_QUEUE_ARCHITECTURE.md`.

## 7. Event Payload Contract (Representative Sample)

All events include (auto-added by `EventBusService`):

```typescript
{
  eventId: string;       // uuid v4
  occurredAt: string;    // ISO 8601 UTC timestamp
  tenantId: string;      // from event payload (used as Kafka key)
  // ...domain-specific fields
}
```

Example `payment.completed`:
```typescript
{
  eventId: "...",
  occurredAt: "2026-06-15T10:30:00.000Z",
  tenantId: "<uuid>",
  paymentId: "<uuid>",
  orderId: "<uuid>",
  amount: 598.00,
  currency: "USD"
}
```

Exact payload shapes are not enumerated in `topics.ts` — they are defined in
the publishing service's entity/DTO at time of `EventBusService.publish()` call.
TBD — REQUIRES VERIFICATION for each topic's full payload shape.

## 8. Engagement Module — Zero Topics

`services/engagement` publishes zero Kafka topics and subscribes to zero. The
stub module contributes no events to the bus. This reinforces the finding that
`engagement` is an empty shell awaiting either repurposing or removal.

## 9. Ordering Guarantee

Kafka key = `tenantId` means:
- All events from the same tenant go to the same partition (if topic has single partition)
- Within a single partition, events are ordered by publish time
- Across multiple partitions (if topic has >1), per-tenant ordering is maintained
  within a partition but not guaranteed globally

If a tenant's events are distributed across multiple partitions (possible with
multi-partition topics + hash-based routing), consumers may receive events out
of order relative to wall-clock time. No compensating logic (e.g., event
sequencing numbers) was observed in the codebase.
