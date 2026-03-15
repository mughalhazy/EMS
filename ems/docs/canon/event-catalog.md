# Event Catalog

This catalog is the authoritative list of currently implemented domain events used across EMS modules.

## Event Lifecycle

| Event Name | Topic | Trigger |
| --- | --- | --- |
| EventLifecycleChanged | `event.lifecycle` | Event create/update/status-change envelopes emitted by Event Service. |
| SessionLifecycleChanged | `session.lifecycle` | Session create/update lifecycle envelopes emitted by Event/Agenda services. |

## Commerce

| Event Name | Topic | Trigger |
| --- | --- | --- |
| OrderCreated | `order.created` | A new order is created. |
| PaymentCaptured | `payment.captured` | Payment status transitions to captured/succeeded. |
| OrderConfirmationEmailRequested | `order.confirmation.email.requested` | Order confirmation notification should be queued for delivery. |

## Registration

| Event Name | Topic | Trigger |
| --- | --- | --- |
| RegistrationStarted | `registration.started` | Registration intake begins and a registration record is created. |
| RegistrationConfirmed | `registration.confirmed` | Registration is confirmed for attendance. |
| RegistrationCancelled | `registration.cancelled` | Registration is cancelled. |

## Agenda and Program

| Event Name | Topic | Trigger |
| --- | --- | --- |
| SessionAttended | `session.attended` | Session attendance is confirmed for analytics stream processing. |
| SessionQuestionAsked | `session.question.asked` | An attendee submits a question for a session Q&A stream. |
| PollSubmitted | `poll.submitted` | An attendee submits a response for a live poll option. |
| SurveyCompleted | `survey.completed` | An attendee completes an engagement survey. |
| ExhibitorCreated | `exhibitor.created` | A new exhibitor profile is created for an event. |
| LeadCaptured | `lead.captured` | An exhibitor captures an attendee lead. |

## Onsite Operations

| Event Name | Topic | Trigger |
| --- | --- | --- |
| OnsiteCheckinCompleted | `onsite.checkin.completed` | Attendee event check-in completes at venue or gate. |
| SessionAttendanceScanned | `session.attendance_scanned` | Session attendance scan is recorded from onsite operations. |
| OnsiteAccessGranted | `onsite.access.granted` | A scan grants attendee access at a gate/session boundary. |
| OnsiteAccessDenied | `onsite.access.denied` | A scan denies attendee access at a gate/session boundary. |
| OnsiteBadgePrinted | `onsite.badge.printed` | Badge print operation succeeds. |

## Networking

| Event Name | Topic | Trigger |
| --- | --- | --- |
| AttendeeConnectionRequested | `attendee.connection.requested` | An attendee requests a networking connection. |
| AttendeeConnected | `attendee.connected` | A networking connection request is accepted. |
