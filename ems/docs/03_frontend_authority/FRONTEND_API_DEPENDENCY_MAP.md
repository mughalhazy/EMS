Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Frontend API Dependency Map

> Maps every frontend screen to its backend API endpoints, entity dependencies,
> backend service, and test requirements. Derived from SERVICE_CATALOG.md
> (code-verified 2026-06-17). No orphan screens — every screen traces to
> a verified backend endpoint.

## API Pattern Reference

All APIs follow:
- Base prefix: `/v1/`
- Response envelope: `{ data: T, meta: { page?, limit?, total? } }` (success) or `{ error: { code, message, details }, meta }` (error)
- Authentication: `Authorization: Bearer {jwt}` header
- Pagination: `?page=N&limit=N`
- Idempotency: `Idempotency-Key: {uuid}` header (required for POST /orders)

---

## Authentication APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| S-01 Login | `/v1/auth/login` | POST | auth | User, AuthSession |
| S-02 Register | `/v1/auth/register` | POST | auth | User, UserCredential |
| S-03 Forgot Password | `/v1/auth/forgot-password` | POST | auth | User |
| S-03 Reset Password | `/v1/auth/reset-password` | POST | auth | User, UserCredential |
| S-04 SSO Callback | `/v1/auth/sso/callback` | GET | auth | SsoConnection, SsoIdentity |
| S-28 SSO List | `/v1/sso-connections` | GET | auth | SsoConnection |
| S-28 SSO Create | `/v1/sso-connections` | POST | auth | SsoConnection |
| S-28 SSO Delete | `/v1/sso-connections/:id` | DELETE | auth | SsoConnection |
| Profile | `/v1/auth/me` | GET | auth | User |
| Profile | `/v1/auth/change-password` | POST | auth | UserCredential |
| Profile | `/v1/auth/refresh` | POST | auth | AuthSession |

---

## Event APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| S-08 Event List | `/v1/events` | GET | event | Event |
| S-10 Create Event | `/v1/events` | POST | event | Event |
| S-09 Event Detail | `/v1/events/:id` | GET | event | Event |
| S-10 Edit Event | `/v1/events/:id` | PATCH | event | Event |
| S-09 Publish | `/v1/events/:id/publish` | POST | event | Event |
| S-09 Go Live | `/v1/events/:id/go-live` | POST | event | Event |
| S-09 Archive | `/v1/events/:id/archive` | POST | event | Event |
| S-09 Cancel | `/v1/events/:id/cancel` | POST | event | Event |
| S-11 Settings GET | `/v1/events/:id/settings` | GET | event | EventSettings (OCR-5) |
| S-11 Settings PUT | `/v1/events/:id/settings` | PUT | event | EventSettings (OCR-5) |
| Venues | `/v1/venues` | GET | event | Venue |
| Rooms | `/v1/rooms?venueId=` | GET | event | Room |

---

## Agenda APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| S-12 Agenda | `/v1/sessions?eventId=` | GET | agenda | Session |
| S-12 Tracks | `/v1/tracks?eventId=` | GET | agenda | Track |
| S-12 Create Track | `/v1/tracks` | POST | agenda | Track |
| S-13 Session Detail | `/v1/sessions/:id` | GET | agenda | Session |
| S-13 Create Session | `/v1/sessions` | POST | agenda | Session |
| S-13 Edit Session | `/v1/sessions/:id` | PATCH | agenda | Session |
| S-13 Cancel Session | `/v1/sessions/:id/cancel` | POST | agenda | Session |
| S-13 Speakers | `/v1/sessions/:id/speakers` | GET | speaker | SessionSpeaker |
| S-13 Assign Speaker | `/v1/sessions/:id/speakers` | POST | speaker | SessionSpeaker |
| S-13 Remove Speaker | `/v1/sessions/:id/speakers/:speakerId` | DELETE | speaker | SessionSpeaker |

---

## Speaker APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| Speaker List | `/v1/speakers` | GET | speaker | Speaker |
| Create Speaker | `/v1/speakers` | POST | speaker | Speaker, SpeakerProfile |
| Speaker Detail | `/v1/speakers/:id` | GET | speaker | Speaker, SpeakerProfile |
| Edit Speaker | `/v1/speakers/:id` | PATCH | speaker | Speaker, SpeakerProfile |
| My Sessions | `/v1/sessions?speakerId=me` | GET | agenda | Session |

---

## Exhibitor APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| Exhibitor List | `/v1/exhibitors?eventId=` | GET | exhibitor | Exhibitor |
| Create Exhibitor | `/v1/exhibitors` | POST | exhibitor | Exhibitor |
| Exhibitor Detail | `/v1/exhibitors/:id` | GET | exhibitor | Exhibitor |
| Edit Exhibitor | `/v1/exhibitors/:id` | PATCH | exhibitor | Exhibitor |
| Booth List | `/v1/booths?eventId=` | GET | exhibitor | Booth |
| Sponsor List | `/v1/sponsors?eventId=` | GET | exhibitor | Sponsor, SponsorPackage |
| Lead List | `/v1/leads?exhibitorId=` | GET | exhibitor | Lead |

---

## Attendee APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| Attendee List | `/v1/attendees?eventId=` | GET | attendee | Attendee |
| Attendee Detail | `/v1/attendees/:id` | GET | attendee | Attendee, AttendeeProfile |
| Public Directory | `/v1/attendees?public=true` | GET | attendee | Attendee |
| Edit Attendee | `/v1/attendees/:id` | PATCH | attendee | Attendee, AttendeeProfile |

---

## Registration APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| S-05 Public Register | `/v1/registrations` | POST | registration | Registration |
| S-14 Registration List | `/v1/registrations?eventId=` | GET | registration | Registration |
| S-15 Registration Detail | `/v1/registrations/:id` | GET | registration | Registration |
| S-15 Approve | `/v1/registrations/:id/approve` | POST | registration | Registration |
| S-15 Waitlist | `/v1/registrations/:id/waitlist` | POST | registration | Registration |
| S-15 Cancel | `/v1/registrations/:id/cancel` | POST | registration | Registration |
| S-23 My Registrations | `/v1/registrations?userId=me` | GET | registration | Registration |
| Registration Fields | `/v1/registration-fields?eventId=` | GET | registration | RegistrationField |

---

## Commerce APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| Ticket Products | `/v1/ticket-products?eventId=` | GET | ticketing | TicketProduct |
| Create Ticket | `/v1/ticket-products` | POST | ticketing | TicketProduct |
| Edit Ticket | `/v1/ticket-products/:id` | PATCH | ticketing | TicketProduct |
| My Tickets | `/v1/tickets?userId=me` | GET | ticketing | Ticket, TicketEntitlement |
| Pricing Rules | `/v1/price-rules?eventId=` | GET | pricing | PriceRule |
| Create Price Rule | `/v1/price-rules` | POST | pricing | PriceRule |
| Promo Codes | `/v1/promo-codes?eventId=` | GET | pricing | PromoCode |
| Create Promo | `/v1/promo-codes` | POST | pricing | PromoCode |
| Order List | `/v1/orders?eventId=` | GET | order | Order |
| S-06 Create Order | `/v1/orders` | POST | order | Order (Idempotency-Key req'd) |
| Order Detail | `/v1/orders/:id` | GET | order | Order |
| Refund | `/v1/orders/:id/refund` | POST | order | Order, PaymentTransaction |
| My Orders | `/v1/orders?userId=me` | GET | order | Order |
| Inventory | `/v1/inventory?eventId=` | GET | inventory | InventoryItem |

---

## Onsite APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| S-16 Check In | `/v1/check-ins` | POST | onsite | CheckIn |
| S-16 Check-in List | `/v1/check-ins?eventId=` | GET | onsite | CheckIn |
| S-16 Badge Print | `/v1/badge-prints` | POST | onsite | BadgePrint |
| Badge Print Log | `/v1/badge-prints?eventId=` | GET | onsite | BadgePrint |
| Device Sessions | `/v1/device-sessions?eventId=` | GET | onsite | DeviceSession |

---

## Campaign APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| Campaign List | `/v1/campaigns` | GET | notification | Campaign |
| Create Campaign | `/v1/campaigns` | POST | notification | Campaign |
| Campaign Detail | `/v1/campaigns/:id` | GET | notification | Campaign |
| Edit Campaign | `/v1/campaigns/:id` | PATCH | notification | Campaign |
| Send Campaign | `/v1/campaigns/:id/send` | POST | notification | Campaign |
| Segment List | `/v1/audience-segments` | GET | notification | AudienceSegment |
| Create Segment | `/v1/audience-segments` | POST | notification | AudienceSegment |

---

## Analytics APIs

| Screen | API | Method | Service | Entity / View |
|---|---|---|---|---|
| D-01/D-07 Summary | `/v1/analytics/summary` | GET | analytics | EventMetric |
| D-07 Event Analytics | `/v1/analytics/events/:id` | GET | analytics | EventDashboardView |
| D-03 Check-in Rate | `/v1/analytics/checkin?eventId=` | GET | analytics | AttendanceMetrics |
| D-02 Ticket Sales | `/v1/analytics/ticket-sales` | GET | analytics | TicketSalesSummary |
| D-02/D-07 Metrics | `/v1/analytics/metrics` | GET | analytics | EventMetric |

---

## Search APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| S-26 Global Search | `/v1/search?q=` | GET | search | SearchDocument |

---

## Networking APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| S-25 Connections | `/v1/connections?userId=me` | GET | networking | AttendeeConnection |
| S-25 Requests | `/v1/connections?requesteeId=me&status=pending` | GET | networking | AttendeeConnection |
| S-25 Request | `/v1/connections` | POST | networking | AttendeeConnection |
| S-25 Accept | `/v1/connections/:id/accept` | PATCH | networking | AttendeeConnection |
| S-25 Decline | `/v1/connections/:id/decline` | PATCH | networking | AttendeeConnection |

---

## Interactive Engagement APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| Poll List | `/v1/polls?eventId=` | GET | interactive-engagement | (Poll entity) |
| Create Poll | `/v1/polls` | POST | interactive-engagement | (Poll entity) |
| Respond to Poll | `/v1/polls/:id/respond` | POST | interactive-engagement | (Poll entity) |
| Q&A Questions | `/v1/qa-questions?eventId=` | GET | interactive-engagement | (QA entity) |
| Submit Question | `/v1/qa-questions` | POST | interactive-engagement | (QA entity) |
| Survey List | `/v1/surveys?eventId=` | GET | interactive-engagement | (Survey entity) |
| Create Survey | `/v1/surveys` | POST | interactive-engagement | (Survey entity) |
| Complete Survey | `/v1/surveys/:id/complete` | POST | interactive-engagement | (Survey entity) |

---

## Integration APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| S-27 Webhook List | `/v1/webhooks` | GET | integration | WebhookSubscription |
| S-27 Create Webhook | `/v1/webhooks` | POST | integration | WebhookSubscription |
| S-27 Delete Webhook | `/v1/webhooks/:id` | DELETE | integration | WebhookSubscription |

---

## RBAC / Admin APIs

| Screen | API | Method | Service | Entity |
|---|---|---|---|---|
| S-20 User List | `/v1/users` | GET | auth | User |
| S-20 User Detail | `/v1/users/:id` | GET | auth | User |
| S-20 Edit User | `/v1/users/:id` | PATCH | auth | User |
| S-20 User Roles | `/v1/rbac/users/:id/roles` | GET | rbac | UserRole |
| S-20 Assign Role | `/v1/rbac/roles/assign` | POST | rbac | UserRole |
| S-20 Revoke Role | `/v1/rbac/roles/revoke` | POST | rbac | UserRole |
| S-21 Role List | `/v1/roles` | GET | rbac | Role |
| S-21 Create Role | `/v1/roles` | POST | rbac | Role |
| S-21 Edit Role | `/v1/roles/:id` | PATCH | rbac | Role |
| S-21 Permissions | `/v1/permissions` | GET | rbac | Permission |
| S-22 Audit Log | `/v1/audit-logs` | GET | audit | AuditLog |
| S-05 Admin Detail | `/v1/tenant` | GET/PATCH | tenant | Tenant, TenantSettings |

---

## API Coverage Summary

| Service | API count (frontend-consumed) | Screens consuming |
|---|---|---|
| auth | 12 | S-01, S-02, S-03, S-04, S-20, S-28, Profile |
| tenant | 2 | Admin Dashboard, Tenant Settings |
| rbac | 7 | S-20, S-21 |
| audit | 1 | S-22 |
| event | 10 | S-08 to S-11 |
| agenda | 9 | S-12, S-13 |
| speaker | 6 | Speaker screens, S-13 |
| exhibitor | 7 | Exhibitor screens |
| attendee | 4 | Attendee screens, S-16 |
| registration | 8 | S-05, S-14, S-15, S-23 |
| ticketing | 4 | Ticketing, S-24 |
| pricing | 4 | Pricing, Promo |
| order | 6 | S-06, Order screens |
| inventory | 1 | Inventory |
| payment | 0 (payment is backend-internal; frontend uses order/refund endpoints) | — |
| fulfillment | 0 (backend-internal; status visible via order) | — |
| notification | 8 | S-19 |
| analytics | 5 | S-18, D-01 to D-07 |
| search | 1 | S-26 |
| networking | 5 | S-25 |
| interactive-engagement | 8 | Polls, Q&A, Surveys |
| onsite | 5 | S-16, S-17 |
| integration | 3 | S-27 |
| ai-service | 0 (API exists but semantic results degrade gracefully to search) | — |
| ui-renderer | 0 (scaffold only — Phase E) | — |
| engagement | 0 (removed — OCR-1) | — |
