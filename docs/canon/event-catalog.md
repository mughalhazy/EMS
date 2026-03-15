# Event Catalog

This catalog is the authoritative list of domain events used across EMS.

## Event Lifecycle

| Event Name | Topic | Trigger |
| --- | --- | --- |
| EventCreated | `event.created` | A new event is created in draft state. |
| EventUpdated | `event.updated` | Event metadata is updated. |
| EventPublished | `event.published` | Event transitions to published/discoverable. |
| EventUnpublished | `event.unpublished` | Event transitions back to non-public state. |
| EventCancelled | `event.cancelled` | Event is cancelled and no longer accepts attendance operations. |
| EventCloned | `event.cloned` | A new event is seeded from an existing event. |

## Commerce

| Event Name | Topic | Trigger |
| --- | --- | --- |
| OrderCreated | `order.created` | A new order is created. |
| PaymentAuthorized | `payment.authorized` | Payment authorization succeeds. |
| PaymentCaptured | `payment.captured` | Funds are captured. |
| RefundIssued | `refund.issued` | A refund is issued. |
| TicketIssued | `ticket.issued` | Ticket entitlement is generated. |

## Registration

| Event Name | Topic | Trigger |
| --- | --- | --- |
| RegistrationSubmitted | `registration.submitted` | Registration is submitted. |
| RegistrationUpdated | `registration.updated` | Registration fields are amended. |
| RegistrationApproved | `registration.approved` | Registration is approved. |
| RegistrationCancelled | `registration.cancelled` | Registration is cancelled. |
| RegistrationConfirmed | `registration.confirmed` | Registration is confirmed for attendance. |

## Onsite Operations

| Event Name | Topic | Trigger |
| --- | --- | --- |
| CheckInDeviceRegistered | `checkin.device_registered` | A check-in device is registered. |
| CheckInDeviceStatusUpdated | `checkin.device_status_updated` | Device status changes. |
| AttendeeCheckedIn | `attendee.checked_in` | Attendee is checked in at venue or gate. |
| SessionAttendanceScanned | `session.attendance_scanned` | Session attendance scan is recorded. |
| BadgePrinted | `badge.printed` | Badge print operation succeeds. |
