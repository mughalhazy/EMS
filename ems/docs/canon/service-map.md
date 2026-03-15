# EMS Backend Service Map

This document defines backend service boundaries for **currently implemented modules in this repository**.

Each section lists:
- **Purpose**
- **Owned entities** (source-of-truth)
- **Published events** (implemented topics)
- **Consumed events** (implemented subscriptions/reactions)

## auth
- **Purpose**: Identity, authentication, and authorization controls.
- **Owned entities**: `User`, `Credential`, `Role`, `Permission`, `Session`.
- **Published events**: None cataloged as message-bus topics yet.
- **Consumed events**: None cataloged as message-bus topics yet.

## tenant
- **Purpose**: Tenant lifecycle and tenant-level settings.
- **Owned entities**: `Tenant`, `TenantSettings`.
- **Published events**: None cataloged as message-bus topics yet.
- **Consumed events**: None cataloged as message-bus topics yet.

## user
- **Purpose**: Tenant-scoped user and organization administration surface.
- **Owned entities**: `Organization` (and user admin endpoints scoped to tenants).
- **Published events**: None cataloged as message-bus topics yet.
- **Consumed events**: None cataloged as message-bus topics yet.

## event
- **Purpose**: Event lifecycle, venue, room, and event-level session/speaker operations.
- **Owned entities**: `Event`, `Venue`, `Room`, `EventSettings`.
- **Published events**: `event.lifecycle`, `session.lifecycle`.
- **Consumed events**: None cataloged as message-bus topics yet.

## agenda
- **Purpose**: Agenda/session planning workflows and attendance publication.
- **Owned entities**: `Session` (agenda view), scheduling metadata.
- **Published events**: `session.lifecycle`, `session.attended`.
- **Consumed events**: None cataloged as message-bus topics yet.

## speaker
- **Purpose**: Speaker profile and speaker-event participation operations.
- **Owned entities**: `SpeakerProfile`, `SpeakerAvailability`, assignment metadata.
- **Published events**: None cataloged as message-bus topics yet.
- **Consumed events**: None cataloged as message-bus topics yet.

## exhibitor
- **Purpose**: Exhibitor management and lead capture.
- **Owned entities**: `Exhibitor`, `Booth`, `LeadCapture`.
- **Published events**: `exhibitor.created`, `lead.captured`.
- **Consumed events**: None cataloged as message-bus topics yet.

## attendee
- **Purpose**: Attendee profile and attendee-facing directory/search projection support.
- **Owned entities**: `Attendee`, `AttendeePreference`, attendee directory projection data.
- **Published events**: None cataloged as message-bus topics yet.
- **Consumed events**: `registration.confirmed`, `registration.cancelled`, `onsite.checkin.completed`, `attendee.connection.requested`, `attendee.connected`, `session.attendance_scanned`.

## registration
- **Purpose**: Registration intake and status lifecycle.
- **Owned entities**: `Registration`, `RegistrationStatus`.
- **Published events**: `registration.started`, `registration.confirmed`, `registration.cancelled`.
- **Consumed events**: `order.created`, `payment.captured`.

## ticketing
- **Purpose**: Ticket catalog, ticket pricing and inventory-related business rules.
- **Owned entities**: `TicketType`, pricing/inventory ticket policies.
- **Published events**: None cataloged as message-bus topics yet.
- **Consumed events**: None cataloged as message-bus topics yet.

## pricing
- **Purpose**: Price rule and pricing module boundary.
- **Owned entities**: `PriceRule`/pricing policy primitives.
- **Published events**: None cataloged as message-bus topics yet.
- **Consumed events**: None cataloged as message-bus topics yet.

## inventory
- **Purpose**: Inventory and stock allocations.
- **Owned entities**: `InventoryPool`, `InventoryReservation`, stock ledgers.
- **Published events**: None cataloged as message-bus topics yet.
- **Consumed events**: None cataloged as message-bus topics yet.

## commerce
- **Purpose**: Checkout orchestration, order/payment lifecycle, and fulfillment actions.
- **Owned entities**: `Order`, `OrderItem`, `Payment`, `Refund`, `TicketFulfillment`.
- **Published events**: `order.created`, `payment.captured`, `order.confirmation.email.requested`.
- **Consumed events**: None cataloged as message-bus topics yet.

## notification
- **Purpose**: Notification and delivery orchestration.
- **Owned entities**: `Notification`, `Template`, dispatch records.
- **Published events**: None cataloged as message-bus topics yet.
- **Consumed events**: None cataloged as message-bus topics yet.

## engagement
- **Purpose**: Poll, Q&A, and survey interaction management.
- **Owned entities**: `EngagementPoll`, `EngagementQuestion`, `EngagementSurvey`.
- **Published events**: `poll.submitted`, `session.question.asked`, `survey.completed`.
- **Consumed events**: None cataloged as message-bus topics yet.

## networking
- **Purpose**: Attendee networking connections.
- **Owned entities**: `AttendeeConnection`.
- **Published events**: `attendee.connection.requested`, `attendee.connected`.
- **Consumed events**: None cataloged as message-bus topics yet.

## onsite
- **Purpose**: Onsite check-in, badge printing, and gate/session access scans.
- **Owned entities**: `CheckinRecord`, `BadgePrintJob`, `SessionScan`.
- **Published events**: `onsite.checkin.completed`, `session.attendance_scanned`, `onsite.access.granted`, `onsite.access.denied`, `onsite.badge.printed`.
- **Consumed events**: None cataloged as message-bus topics yet.

## analytics
- **Purpose**: Metrics ingestion and reporting read models.
- **Owned entities**: `KpiSnapshot`, reporting aggregates.
- **Published events**: None cataloged as message-bus topics yet.
- **Consumed events**: `registration.confirmed`, `onsite.checkin.completed`, `session.attended`, `poll.submitted`, `session.question.asked`, `lead.captured`.

## search
- **Purpose**: Search indexing and query abstraction.
- **Owned entities**: Search indexes/projections.
- **Published events**: None cataloged as message-bus topics yet.
- **Consumed events**: None cataloged as message-bus topics yet.

## audit
- **Purpose**: Audit and traceability persistence.
- **Owned entities**: `AuditLog`.
- **Published events**: None cataloged as message-bus topics yet.
- **Consumed events**: Internal audit service calls from domain modules.

## shared
- **Purpose**: Shared cross-cutting backend primitives and middleware.
- **Owned entities**: N/A.
- **Published events**: N/A.
- **Consumed events**: N/A.

## Notes on planned capabilities

The canonical model still references future split services such as `payment`, `fulfillment`, and `integration`. In the current implementation, those capabilities are hosted inside the `commerce` module and supporting modules, and may be extracted later.
