# Read Model Catalog

This catalog defines canonical read models that support query-heavy workflows and UI surfaces.

## Event Dashboard

- **Purpose:** Operational overview for an event.
- **Primary consumers:** Organizer and operations teams.
- **Primary source events:** `EventCreated`, `EventUpdated`, `EventPublished`, `RegistrationSubmitted`, `RegistrationApproved`, `AttendeeCheckedIn`, `OrderCreated`, `PaymentCaptured`, `RefundIssued`.

## Agenda Planner

- **Purpose:** Schedule-first planning and review for sessions.
- **Primary consumers:** Program managers, speakers, attendees.
- **Primary source events:** `EventCreated`, `EventUpdated`.

## Ticket Sales

- **Purpose:** Near real-time commercial performance by event and ticket type.
- **Primary consumers:** Revenue operations and organizers.
- **Primary source events:** `OrderCreated`, `PaymentAuthorized`, `PaymentCaptured`, `RefundIssued`, `TicketIssued`.

## Inventory Status

- **Purpose:** Capacity visibility for sellable and reservable items.
- **Primary consumers:** Commerce and organizer controls.
- **Primary source events:** `OrderCreated`, `PaymentCaptured`, `RefundIssued`, `TicketIssued`.

## Order Detail

- **Purpose:** Full order lookup for support and buyer self-service.
- **Primary consumers:** Buyer portal and support tooling.
- **Primary source events:** `OrderCreated`, `PaymentAuthorized`, `PaymentCaptured`, `RefundIssued`, `TicketIssued`.

## Payment Ledger

- **Purpose:** Auditable query model of monetary movements.
- **Primary consumers:** Finance, reconciliation, compliance.
- **Primary source events:** `PaymentAuthorized`, `PaymentCaptured`, `RefundIssued`.

## Attendee Profile

- **Purpose:** Unified attendee-centric view across registration, tickets, and onsite actions.
- **Primary consumers:** Onsite staff, attendee portal, support.
- **Primary source events:** `RegistrationSubmitted`, `RegistrationUpdated`, `RegistrationApproved`, `RegistrationConfirmed`, `RegistrationCancelled`, `TicketIssued`, `AttendeeCheckedIn`.

## Registration Approvals

- **Purpose:** Queue-based review for registrations requiring manual approval.
- **Primary consumers:** Review teams and event administrators.
- **Primary source events:** `RegistrationSubmitted`, `RegistrationUpdated`, `RegistrationApproved`, `RegistrationCancelled`.

## Check-in Console

- **Purpose:** Low-latency attendee lookup and entry operations.
- **Primary consumers:** Onsite check-in staff.
- **Primary source events:** `TicketIssued`, `RegistrationApproved`, `RegistrationConfirmed`, `AttendeeCheckedIn`, `BadgePrinted`.

## Analytics Dashboard

- **Purpose:** KPI and trend reporting across event lifecycle domains.
- **Primary consumers:** Executives, product analytics, organizers.
- **Primary source events:** all events listed in `docs/canon/event-catalog.md`.
