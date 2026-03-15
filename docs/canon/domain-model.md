# Domain Model

This document is the authoritative entity list for EMS documentation.

## Core Entities

| Entity | Description | Primary Keys |
| --- | --- | --- |
| Tenant | Organization boundary for data, users, and configuration. | `tenantId` |
| Event | A scheduled experience owned by a tenant. | `eventId`, `tenantId` |
| AgendaSession | A scheduled session within an event agenda. | `sessionId`, `eventId`, `tenantId` |
| SpeakerProfile | A speaker identity and metadata used by sessions. | `speakerId`, `tenantId` |
| TicketType | Commercial sellable ticket definition for an event. | `ticketTypeId`, `eventId`, `tenantId` |
| InventoryItem | Capacity-controlled unit (ticket/session/add-on). | `inventoryItemId`, `eventId`, `tenantId` |
| Order | Commercial purchase intent and payment container. | `orderId`, `tenantId` |
| Payment | Payment authorization/capture/refund lifecycle state. | `paymentId`, `orderId`, `tenantId` |
| Ticket | Issued attendance entitlement tied to an order and attendee. | `ticketId`, `orderId`, `eventId`, `tenantId` |
| Registration | Attendee registration record for an event. | `registrationId`, `eventId`, `tenantId` |
| AttendeeProfile | Attendee-centric profile and participation state per event. | `attendeeId`, `eventId`, `tenantId` |
| CheckInRecord | Onsite check-in action for attendee or session attendance. | `checkInId`, `attendeeId`, `eventId`, `tenantId` |
| CheckInDevice | Registered scanning or badge-printing device for onsite operations. | `deviceId`, `eventId`, `tenantId` |
| Refund | Monetary reversal connected to a prior payment capture. | `refundId`, `paymentId`, `tenantId` |

## Modeling Rules

- All tenant-scoped entities must include `tenantId`.
- Event-scoped entities must include both `tenantId` and `eventId`.
- Cross-entity references must use canonical names from this table.
