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
| OrderConfirmationEmailRequested | `order.confirmation.email.requested` | An order confirmation notification should be queued for delivery. |

## Registration

| Event Name | Topic | Trigger |
| --- | --- | --- |
| RegistrationStarted | `registration.started` | Registration intake begins and a registration record is created. |
| RegistrationConfirmed | `registration.confirmed` | Registration is confirmed for attendance. |
| RegistrationTransferred | `registration.transferred` | Registration ownership is transferred to another attendee. |
| RegistrationCancelled | `registration.cancelled` | Registration is cancelled. |


## Agenda and Program

| Event Name | Topic | Trigger |
| --- | --- | --- |
| SessionLifecycleChanged | `session.lifecycle` | Session create/update lifecycle envelope is published. |
| SessionAttendanceScanned | `session.attendance_scanned` | Session attendance scan is recorded from agenda operations. |
| ExhibitorCreated | `exhibitor.created` | A new exhibitor profile is created for an event. |
| LeadCaptured | `lead.captured` | An exhibitor captures an attendee lead. |

## Onsite Operations

| Event Name | Topic | Trigger |
| --- | --- | --- |
| CheckInDeviceRegistered | `checkin.device_registered` | A check-in device is registered. |
| CheckInDeviceStatusUpdated | `checkin.device_status_updated` | Device status changes. |
| OnsiteCheckinCompleted | `onsite.checkin.completed` | Attendee event check-in completes at venue or gate. |
| SessionAttendanceScanned | `session.attendance_scanned` | Session attendance scan is recorded. |
| OnsiteAccessGranted | `onsite.access.granted` | A scan grants attendee access at a gate/session boundary. |
| OnsiteAccessDenied | `onsite.access.denied` | A scan denies attendee access at a gate/session boundary. |
| OnsiteBadgePrinted | `onsite.badge.printed` | Badge print operation succeeds. |

## Identity and Access

| Event Name | Topic | Trigger |
| --- | --- | --- |
| AuthUserCreated | `auth.user.created` | A new platform identity is provisioned. |
| AuthUserUpdated | `auth.user.updated` | User identity attributes or status are updated. |
| AuthRoleChanged | `auth.role.changed` | Role definitions or role assignments are changed. |
| AuthSessionStarted | `auth.session.started` | A user authentication session is established. |
| AuthSessionEnded | `auth.session.ended` | A user authentication session is terminated. |

## Tenant Lifecycle

| Event Name | Topic | Trigger |
| --- | --- | --- |
| TenantProvisioned | `tenant.tenant.provisioned` | A new tenant is created and initialized. |
| TenantUpdated | `tenant.tenant.updated` | Tenant metadata or settings are updated. |
| TenantPlanChanged | `tenant.plan.changed` | A tenant plan entitlement changes. |
| TenantMembershipChanged | `tenant.membership.changed` | Tenant membership assignments are modified. |

## Audit

| Event Name | Topic | Trigger |
| --- | --- | --- |
| AuditLogRecorded | `audit.log.recorded` | A compliance/security-relevant action is persisted. |
| AuditRetentionExpired | `audit.retention.expired` | Retention policy removes or archives an audit record set. |
