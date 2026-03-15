# EMS Domain Model

This document defines the **core EMS entities** and the **service that owns each entity's source of truth**.

## Modeling Principles

- Every entity is tenant-scoped unless explicitly global.
- Service ownership is authoritative for writes, lifecycle rules, and invariants.
- Cross-service references should use immutable IDs and async integration events.

---

## Service Ownership Map

| Entity | Purpose | Owning service |
|---|---|---|
| `Tenant` | Top-level customer/account boundary | `Tenant Service` |
| `User` | Authenticated platform identity | `Identity & Access Service` |
| `Role` | Authorization role definition and scope | `Identity & Access Service` |
| `Event` | Event container and lifecycle | `Event Service` |
| `Venue` | Event location (physical/virtual/hybrid) | `Event Service` |
| `Session` | Agenda item scheduled within an event | `Program Service` |
| `Speaker` | Speaker profile and participation | `Program Service` |
| `Exhibitor` | Exhibitor participation in event | `Partner Service` |
| `Attendee` | Person record attending an event | `Attendee Service` |
| `Registration` | Enrollment of attendee into an event/ticket | `Registration Service` |
| `TicketProduct` | Sellable admission product for an event | `Ticketing Catalog Service` |
| `PriceRule` | Dynamic/static pricing policy for ticket products | `Ticketing Catalog Service` |
| `InventoryReservation` | Temporary hold of ticket inventory | `Inventory Service` |
| `Order` | Commercial checkout aggregate | `Commerce Service` |
| `OrderItem` | Individual line item within an order | `Commerce Service` |
| `Payment` | Payment authorization/capture record | `Billing Service` |
| `Refund` | Refund instruction and settlement status | `Billing Service` |
| `Ticket` | Issued admission entitlement artifact | `Fulfillment Service` |
| `Badge` | Printed/digital attendee badge artifact | `Fulfillment Service` |
| `EngagementPoll` | Interactive live poll attached to an event session | `Engagement Service` |
| `EngagementQuestion` | Attendee-submitted session Q&A prompt | `Engagement Service` |
| `EngagementSurvey` | Event feedback survey and completion window | `Engagement Service` |

---

## Core Entity Definitions

### Identity & Access

#### `Tenant`
- **Description:** Isolated EMS customer boundary for data and policy.
- **Key fields:** `id`, `name`, `slug`, `status`, `created_at`, `updated_at`.
- **Invariants:** `slug` is globally unique and immutable.

#### `User`
- **Description:** Human or service principal that can authenticate.
- **Key fields:** `id`, `tenant_id`, `email`, `status`, `last_login_at`.
- **Invariants:** `email` unique per tenant.

#### `Role`
- **Description:** Named permission bundle, optionally scoped.
- **Key fields:** `id`, `tenant_id`, `name`, `scope` (`tenant|event|resource`).
- **Invariants:** role `name` unique per tenant.

### Event & Program

#### `Event`
- **Description:** Top-level event object (conference, expo, summit).
- **Key fields:** `id`, `tenant_id`, `code`, `name`, `timezone`, `start_at`, `end_at`, `status`.
- **Invariants:** (`tenant_id`, `code`) unique; `start_at < end_at`.

#### `Venue`
- **Description:** Place where event experiences occur.
- **Key fields:** `id`, `tenant_id`, `event_id`, `name`, `type`, `capacity`.
- **Invariants:** venue belongs to one event.

#### `Session`
- **Description:** Agenda block (talk/workshop/panel/etc.).
- **Key fields:** `id`, `tenant_id`, `event_id`, `venue_id` (optional), `title`, `start_at`, `end_at`, `status`.
- **Invariants:** `start_at < end_at`; no overlapping active sessions in same location/time.

#### `Speaker`
- **Description:** Speaker profile linked to one or more sessions.
- **Key fields:** `id`, `tenant_id`, `event_id`, `first_name`, `last_name`, `email`, `status`.
- **Invariants:** many-to-many with `Session` through join model (`SessionSpeaker`).

#### `Exhibitor`
- **Description:** Exhibitor organization participating in event.
- **Key fields:** `id`, `tenant_id`, `event_id`, `organization_name`, `booth_code`, `status`.
- **Invariants:** booth code unique per event.

### Participation & Registration

#### `Attendee`
- **Description:** Person record attending an event; may map to `User`.
- **Key fields:** `id`, `tenant_id`, `event_id`, `user_id` (optional), `email`, `status`.
- **Invariants:** `email` unique per event.

#### `Registration`
- **Description:** Attendee enrollment state for attendance and entitlements.
- **Key fields:** `id`, `tenant_id`, `event_id`, `attendee_id`, `ticket_product_id`, `status`, `registered_at`.
- **Invariants:** one active registration per attendee per event per ticket product.

### Ticketing Catalog & Inventory

#### `TicketProduct`
- **Description:** Sellable ticket type (e.g., Early Bird, VIP).
- **Key fields:** `id`, `tenant_id`, `event_id`, `name`, `sales_start_at`, `sales_end_at`, `status`.
- **Invariants:** product name unique per event.

#### `PriceRule`
- **Description:** Price determination rule for a `TicketProduct`.
- **Key fields:** `id`, `tenant_id`, `ticket_product_id`, `rule_type`, `amount_or_percent`, `priority`, `active_from`, `active_to`.
- **Invariants:** deterministic winner by priority and validity window.

#### `InventoryReservation`
- **Description:** Time-bound hold on available ticket quantity.
- **Key fields:** `id`, `tenant_id`, `ticket_product_id`, `order_id`, `quantity`, `reserved_until`, `status`.
- **Invariants:** reservations expire automatically; confirmed order converts reservation to committed allocation.

### Commerce, Billing, and Fulfillment

#### `Order`
- **Description:** Checkout aggregate for purchase intent and totals.
- **Key fields:** `id`, `tenant_id`, `event_id`, `order_number`, `currency`, `subtotal`, `tax`, `discount`, `total`, `status`.
- **Invariants:** (`tenant_id`, `order_number`) unique; `total = subtotal + tax - discount`.

#### `OrderItem`
- **Description:** Line item under an order.
- **Key fields:** `id`, `tenant_id`, `order_id`, `product_type`, `product_ref_id`, `unit_price`, `quantity`, `line_total`.
- **Invariants:** `line_total = unit_price * quantity` (before line-level adjustments if configured).

#### `Payment`
- **Description:** Payment attempt/transaction for an order.
- **Key fields:** `id`, `tenant_id`, `order_id`, `provider`, `provider_ref`, `amount`, `currency`, `status`, `captured_at`.
- **Invariants:** provider reference unique per provider; only captured amounts count toward paid balance.

#### `Refund`
- **Description:** Return of funds for a prior payment.
- **Key fields:** `id`, `tenant_id`, `payment_id`, `order_id`, `amount`, `reason`, `status`, `refunded_at`.
- **Invariants:** cumulative successful refunds cannot exceed captured payment amount.

#### `Ticket`
- **Description:** Issued admission entitlement bound to a registration.
- **Key fields:** `id`, `tenant_id`, `event_id`, `registration_id`, `order_item_id`, `ticket_code`, `status`, `issued_at`.
- **Invariants:** `ticket_code` unique; revocation required on full cancellation/refund per policy.

#### `Badge`
- **Description:** Attendee-facing badge artifact for check-in/onsite identity.
- **Key fields:** `id`, `tenant_id`, `event_id`, `attendee_id`, `ticket_id` (optional), `badge_code`, `print_status`, `issued_at`.
- **Invariants:** one active badge per attendee per event unless explicit reprint policy.

### Engagement

#### `EngagementPoll`
- **Description:** Session-scoped poll used for audience interaction.
- **Key fields:** `id`, `tenant_id`, `event_id`, `session_id`, `question`, `options`, `status`, `starts_at`, `ends_at`.
- **Invariants:** poll schedule must satisfy `starts_at < ends_at` when both timestamps are set.

#### `EngagementQuestion`
- **Description:** Q&A item submitted by an attendee against a session.
- **Key fields:** `id`, `tenant_id`, `event_id`, `session_id`, `attendee_id`, `question`, `created_at`.
- **Invariants:** referenced attendee and session must belong to the same `tenant_id` and `event_id`.

#### `EngagementSurvey`
- **Description:** Feedback survey definition and lifecycle for an event.
- **Key fields:** `id`, `tenant_id`, `event_id`, `code`, `title`, `status`, `is_anonymous`, `open_at`, `close_at`, `questions`, `settings`.
- **Invariants:** (`tenant_id`, `event_id`, `code`) unique; survey schedule must satisfy `open_at < close_at` when both timestamps are set.

---

## Relationship Backbone

- `Tenant` 1---* `User`, `Role`, `Event`, and all tenant-owned entities.
- `Event` 1---* `Venue`, `Session`, `Speaker`, `Exhibitor`, `Attendee`, `Registration`, `TicketProduct`, `Order`, `Ticket`, `Badge`.
- `Attendee` 1---* `Registration`.
- `TicketProduct` 1---* `PriceRule` and 1---* `InventoryReservation`.
- `Order` 1---* `OrderItem` and 1---* `Payment`.
- `Payment` 1---* `Refund`.
- `Registration` 1---0..1 `Ticket`; `Ticket` 1---0..1 `Badge`.

## Cross-Service Guardrails

1. **Tenant consistency:** all FK chains must preserve `tenant_id`.
2. **Write authority:** only the owning service can mutate its entity.
3. **Lifecycle integrity:** status transitions are validated by owning service state machines.
4. **Idempotency:** payment, refund, and fulfillment commands must be idempotent.
5. **Auditability:** commerce and fulfillment entities require immutable event logs.
