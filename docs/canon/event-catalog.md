# Event Catalog

This catalog defines canonical domain events used across the platform.

## Event

### EventCreated
Raised when a new event record is created in the system.

### EventPublished
Raised when an event transitions from draft/private to published and discoverable.

### EventCancelled
Raised when an existing event is cancelled and should no longer accept registrations.

## Order & Ticketing

### OrderCreated
Raised when a new ticketing order is submitted and persisted.

### PaymentAuthorized
Raised when payment authorization succeeds for an order.

### PaymentCaptured
Raised when funds are captured for an authorized payment.

### RefundIssued
Raised when a full or partial refund is issued for an order.

### TicketIssued
Raised when one or more tickets are generated and assigned to an order/attendee.

## Registration & Onsite

### RegistrationSubmitted
Raised when an attendee submits a registration request.

### RegistrationApproved
Raised when a submitted registration is approved.

### AttendeeCheckedIn
Raised when an attendee is checked in on-site.
