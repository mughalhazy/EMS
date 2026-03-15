# Service Map

This document is the authoritative service ownership map for EMS entities.

## Services

| Service | Responsibility |
| --- | --- |
| Identity Service | Tenant/account/user identity, access context, and authorization claims. |
| Event Service | Event lifecycle and event-level metadata management. |
| Program Service | Agenda and speaker management. |
| Commerce Service | Ticket definitions, inventory, orders, payments, and refunds. |
| Registration Service | Registration lifecycle and attendee approval state. |
| Onsite Service | Device management, check-in operations, and badge actions. |
| Communications Service | Outbound campaign orchestration and delivery state. |
| Analytics Service | Read-model projections and reporting aggregates. |

## Entity Ownership (Exactly One Owner)

| Entity | Owning Service |
| --- | --- |
| Tenant | Identity Service |
| Event | Event Service |
| AgendaSession | Program Service |
| SpeakerProfile | Program Service |
| TicketType | Commerce Service |
| InventoryItem | Commerce Service |
| Order | Commerce Service |
| Payment | Commerce Service |
| Ticket | Commerce Service |
| Registration | Registration Service |
| AttendeeProfile | Registration Service |
| CheckInRecord | Onsite Service |
| CheckInDevice | Onsite Service |
| Refund | Commerce Service |

## Ownership Rules

- Owning service handles writes and invariant enforcement.
- Non-owning services consume events and materialize derived read models.
- Ownership changes require a canonical update to this file first.
