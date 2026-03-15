# Event Catalog

This catalog is the authoritative list of currently implemented message-bus domain events/topics used across EMS modules.

## Event Lifecycle

| Event Name | Topic | Producer |
| --- | --- | --- |
| EventLifecycleChanged | `event.lifecycle` | `event` |
| SessionLifecycleChanged | `session.lifecycle` | `event`, `agenda` |

## Commerce

| Event Name | Topic | Producer |
| --- | --- | --- |
| OrderCreated | `order.created` | `commerce` |
| PaymentCaptured | `payment.captured` | `commerce` |
| OrderConfirmationEmailRequested | `order.confirmation.email.requested` | `commerce` |

## Registration

| Event Name | Topic | Producer |
| --- | --- | --- |
| RegistrationStarted | `registration.started` | `registration` |
| RegistrationConfirmed | `registration.confirmed` | `registration` |
| RegistrationCancelled | `registration.cancelled` | `registration` |

## Agenda and Program

| Event Name | Topic | Producer |
| --- | --- | --- |
| SessionAttended | `session.attended` | `agenda` |
| SessionQuestionAsked | `session.question.asked` | `engagement` |
| PollSubmitted | `poll.submitted` | `engagement` |
| SurveyCompleted | `survey.completed` | `engagement` |
| ExhibitorCreated | `exhibitor.created` | `exhibitor` |
| LeadCaptured | `lead.captured` | `exhibitor` |

## Onsite Operations

| Event Name | Topic | Producer |
| --- | --- | --- |
| OnsiteCheckinCompleted | `onsite.checkin.completed` | `onsite` |
| SessionAttendanceScanned | `session.attendance_scanned` | `onsite` |
| OnsiteAccessGranted | `onsite.access.granted` | `onsite` |
| OnsiteAccessDenied | `onsite.access.denied` | `onsite` |
| OnsiteBadgePrinted | `onsite.badge.printed` | `onsite` |

## Networking

| Event Name | Topic | Producer |
| --- | --- | --- |
| AttendeeConnectionRequested | `attendee.connection.requested` | `networking` |
| AttendeeConnected | `attendee.connected` | `networking` |
