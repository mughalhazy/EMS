> **Status: Retired (Partial).** Analytics service inventory superseded by
> `docs/01_backend/SERVICE_CATALOG.md`. The 10-model breakdown here is more
> granular than current authority docs and is not yet reconciled — retained
> as input for GAP-B12 (analytics entity names TBD).

# Read Model Catalog

> Source: V2 DOCS Phase 3 Prompt 6 — read model catalog. Read models are projections
> built by `analytics` (and `search` for full-text/semantic surfaces) consuming the
> event stream (`docs/canon/event-catalog.md`) — they are never written to directly
> by API requests. Each maps to one or more `docs/canon/ui-surface-map.md` screens.

## 1. Event Dashboard
- **Owner**: analytics
- **Built from**: `event.*`, `registration.confirmed`, `order.paid`,
  `attendee.checked_in`, `ticket.issued`
- **Shape**: per-event summary — registrations count, tickets sold, revenue,
  check-in rate, capacity utilization.
- **Surface**: Organizer `/events/[id]/dashboard`.

## 2. Agenda Planner
- **Owner**: analytics (denormalized from `agenda`/`speaker`)
- **Built from**: `session.created/updated/cancelled`, `speaker.assigned_to_session`
- **Shape**: sessions grouped by track/room/time-slot with assigned speakers and
  conflict flags.
- **Surface**: Organizer `/events/[id]/agenda`.

## 3. Ticket Sales Summary
- **Owner**: analytics
- **Built from**: `ticket_product.created`, `order.paid`, `ticket.issued`,
  `promo_code.redeemed`, `payment.refunded`
- **Shape**: sales by ticket product, by day, by promo code; net revenue after refunds.
- **Surface**: Finance `/ticketing/events/[id]/analytics`.

## 4. Inventory Status
- **Owner**: analytics (near-real-time, also directly queryable from `inventory`
  service for the live "available count" widget)
- **Built from**: `inventory.reserved/released/depleted`, `ticket_product.created`
- **Shape**: per ticket product — total capacity, reserved, sold, available.
- **Surface**: Organizer `/ticketing/events/[id]/inventory`.

## 5. Order Detail
- **Owner**: analytics (denormalized join of `order`/`payment`/`ticketing`)
- **Built from**: `order.created/paid/fulfilled/cancelled`, `payment.completed/failed/refunded`,
  `ticket.issued/voided`
- **Shape**: order header + line items + payment transactions + issued tickets.
- **Surface**: Finance/Attendee `/ticketing/events/[id]/orders/[orderId]`.

## 6. Payment Ledger
- **Owner**: analytics
- **Built from**: `payment.completed`, `payment.refunded`, `PaymentTransaction` events
- **Shape**: chronological ledger of authorizations, captures, refunds per event/tenant.
- **Surface**: Finance `/ticketing/events/[id]/payments`.

## 7. Attendee Profile (360 view)
- **Owner**: analytics (aggregates `attendee`, `registration`, `ticketing`,
  `onsite`, `interactive-engagement`, `networking`)
- **Built from**: `attendee.created/profile_updated`, `registration.confirmed`,
  `ticket.issued`, `attendee.checked_in`, `session.attended`, `connection.accepted`,
  `survey.completed`
- **Shape**: single attendee's registration, tickets, check-in history, session
  attendance, connections, survey responses.
- **Surface**: Support/Organizer `/events/[id]/attendees/[attendeeId]`.

## 8. Registration Approvals Queue
- **Owner**: analytics (or directly queryable from `registration` for low volume)
- **Built from**: `registration.submitted`, `registration.approved`,
  `registration.cancelled`, `registration.waitlisted`
- **Shape**: pending registrations needing organizer action, with applicant details.
- **Surface**: Organizer `/events/[id]/registrations/approvals`.

## 9. Check-in Console
- **Owner**: analytics (real-time feed) + `onsite` (authoritative state)
- **Built from**: `attendee.checked_in`, `session.attended`
- **Shape**: live check-in counter, recent check-ins list, per-session attendance counts.
- **Surface**: Onsite Staff `/events/[id]/onsite/console`.

## 10. Analytics Dashboard (cross-event / tenant-level)
- **Owner**: analytics
- **Built from**: all of the above, aggregated across events for a tenant
- **Shape**: tenant-wide KPIs — total revenue, total attendees, top events,
  trend charts over time.
- **Surface**: Organizer/Finance `/ticketing/dashboard`, `/events/dashboard`.

## Search Indices (owned by `search`, not `analytics`)

| Index | Built from | Surface |
|---|---|---|
| `events` | `event.*` | public event discovery, admin search |
| `sessions` | `session.*` | agenda search |
| `speakers` | `speaker.*` | speaker directory search |
| `attendees` | `attendee.*` | organizer/support attendee search, networking |

These indices are augmented with `VectorEmbedding` data (via `embedding.updated`)
for semantic search — see `docs/architecture/ai-architecture.md`.
