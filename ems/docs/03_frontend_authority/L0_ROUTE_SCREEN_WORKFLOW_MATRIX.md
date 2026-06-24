Status: FROZEN
Authority Level: Critical
Freeze Date: 2026-06-20
Owner: AI
Phase: L0 — Pre-Design Input Freeze

# L0 Route–Screen–Workflow Matrix

> Consolidated matrix of all 91 approved routes.
> Each row: route → screen → workflow(s) → roles → primary APIs → blocking conditions.
> No new rows may be added without amending L0_FRONTEND_AUTHORITY_INPUT_FREEZE.md.

---

## Zone: Public (Unauthenticated)

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/login` | S-01 Login | W-1 (step 4) | Public | `POST /v1/auth/login` | None |
| `/register` | S-02 Register | W-1 (steps 1–4) | Public | `POST /v1/auth/register` | None |
| `/forgot-password` | S-03 Forgot Password | — | Public | `POST /v1/auth/forgot-password` | None |
| `/reset-password` | S-03 Reset Password | — | Public | `POST /v1/auth/reset-password` | Token must be valid |
| `/sso/callback` | S-04 SSO Callback | — | Public | `GET /v1/auth/sso/callback` | SSO provider must be configured |
| `/events/:id/register` | S-05 Public Registration | W-8 (steps 1–2) | Public/Auth | `GET /v1/events/:id`, `POST /v1/registrations` | Event must be published |
| `/events/:id/checkout` | S-06 Checkout | W-6 (steps 2–6) | Public/Auth | `GET /v1/ticket-products?eventId=`, `POST /v1/orders` | Event published; ticket products exist |
| `/registrations/:id/confirm` | Registration Confirmation | W-8 (step 3) | Public | `GET /v1/registrations/:id` | Registration must exist |

---

## Zone: Dashboard

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/dashboard` | S-07 Dashboard (role-adaptive) | Entry point for all workflows | All authenticated | `GET /v1/analytics/summary`, `GET /v1/events` | None |

**Dashboard variants**: organizer=D-01, finance=D-02, support=D-04, admin=D-05, attendee=D-06. exhibitor/speaker are simplified sub-variants of D-06/S-07.

---

## Zone: Events

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/events` | S-08 Event List | W-2 (entry) | tenant_admin, organizer | `GET /v1/events` | None |
| `/events/new` | S-10 Create Event | W-2 (step 1) | tenant_admin, organizer | `POST /v1/events`, `GET /v1/venues` | Permission: event:manage |
| `/events/:id` | S-09 Event Overview | W-2 (steps 4–7) | tenant_admin, organizer | `GET /v1/events/:id`, `GET /v1/analytics/events/:id` | Event must exist |
| `/events/:id/edit` | S-10 Edit Event | W-2 (step 2) | tenant_admin, organizer | `PATCH /v1/events/:id` | Event must exist; not archived/cancelled |
| `/events/:id/settings` | S-11 Event Settings | W-2 (step 3) | tenant_admin, organizer | `GET/PUT /v1/events/:id/settings` | Event must exist (graceful degradation: OCR-5) |

---

## Zone: Agenda

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:id/agenda` | S-12 Agenda Builder | W-3 (steps 1–2) | tenant_admin, organizer | `GET /v1/sessions?eventId=`, `GET /v1/tracks?eventId=` | Event must exist |
| `/events/:id/tracks/new` | S-12 (track form) | W-3 (step 1) | tenant_admin, organizer | `POST /v1/tracks` | Event must exist |
| `/events/:id/sessions` | S-12 / S-13 list | W-3 | tenant_admin, organizer, speaker* | `GET /v1/sessions?eventId=` | Event must exist |
| `/events/:id/sessions/new` | S-13 (create form) | W-3 (step 2) | tenant_admin, organizer | `POST /v1/sessions` | Event + tracks must exist |
| `/events/:id/sessions/:sessionId` | S-13 Session Detail | W-3 (step 4), W-4 | tenant_admin, organizer, speaker* | `GET /v1/sessions/:id`, `GET /v1/sessions/:id/speakers` | Session must exist |
| `/events/:id/sessions/:sessionId/edit` | S-13 (edit form) | W-3 (step 2) | tenant_admin, organizer | `PATCH /v1/sessions/:id` | Session must exist; not cancelled |
| `/my/sessions` | S-13 (speaker filtered) | W-4 (step 5) | speaker | `GET /v1/sessions?speakerId=me` | User must have Speaker record |

*speaker sees own sessions only — no agenda:manage permission

---

## Zone: Speakers

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/speakers` | Speaker List | W-4 (step 2) | tenant_admin, organizer | `GET /v1/speakers` | Permission: speaker:manage |
| `/speakers/new` | Create Speaker | W-4 (step 1) | tenant_admin, organizer | `POST /v1/speakers` | Permission: speaker:manage |
| `/speakers/:id` | Speaker Profile | W-4 (step 4) | tenant_admin, organizer | `GET /v1/speakers/:id` | Speaker must exist |
| `/speakers/:id/edit` | Edit Speaker | W-4 | tenant_admin, organizer | `PATCH /v1/speakers/:id` | Speaker must exist |

---

## Zone: Exhibitors

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:id/exhibitors` | Exhibitor List | — | tenant_admin, organizer, exhibitor* | `GET /v1/exhibitors?eventId=` | Event must exist |
| `/events/:id/exhibitors/new` | Create Exhibitor | — | tenant_admin, organizer | `POST /v1/exhibitors` | Event must exist |
| `/events/:id/exhibitors/:exhibitorId` | Exhibitor Detail | — | tenant_admin, organizer, exhibitor* | `GET /v1/exhibitors/:id` | Exhibitor must exist |
| `/events/:id/exhibitors/:exhibitorId/edit` | Edit Exhibitor | — | tenant_admin, organizer, exhibitor* | `PATCH /v1/exhibitors/:id` | Exhibitor must exist |
| `/events/:id/sponsors` | Sponsor List | — | tenant_admin, organizer | `GET /v1/sponsors?eventId=` | Event must exist |
| `/events/:id/booths` | Booth Management | — | tenant_admin, organizer, exhibitor* | `GET /v1/booths?eventId=` | Event must exist |
| `/events/:id/leads` | Lead Capture List | — | tenant_admin, organizer, exhibitor* | `GET /v1/leads?eventId=` | Event must exist |

*exhibitor role: API enforces row-level scope to own records

---

## Zone: Attendees

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:id/attendees` | Attendee List | W-9 (step 2) | tenant_admin, organizer, support, onsite_staff | `GET /v1/attendees?eventId=` | Event must exist |
| `/attendees/:id` | Attendee Profile | W-9 | tenant_admin, organizer, support, onsite_staff | `GET /v1/attendees/:id` | Attendee must exist |

---

## Zone: Registration

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:id/registrations` | S-14 Registration List | W-8 (step 4b) | tenant_admin, organizer, support | `GET /v1/registrations?eventId=` | Event must exist |
| `/events/:id/registrations/:registrationId` | S-15 Registration Detail | W-8 (step 4b) | tenant_admin, organizer, support | `GET /v1/registrations/:id` | Registration must exist |
| `/my/registrations` | S-23 My Registrations | W-8 (attendee) | attendee | `GET /v1/registrations?userId=me` | None |

---

## Zone: Ticketing & Pricing

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:id/tickets` | Ticket Product List | W-5 | tenant_admin, organizer, finance | `GET /v1/ticket-products?eventId=` | Event must exist |
| `/events/:id/tickets/new` | Create Ticket | W-5 (step 1) | tenant_admin, organizer | `POST /v1/ticket-products` | Event must exist |
| `/events/:id/tickets/:ticketProductId/edit` | Edit Ticket | W-5 | tenant_admin, organizer | `PATCH /v1/ticket-products/:id` | TicketProduct must exist |
| `/events/:id/pricing` | Pricing Rules | W-5 (step 3) | tenant_admin, organizer, finance | `GET /v1/price-rules?eventId=` | Event must exist |
| `/events/:id/promo-codes` | Promo Code Management | W-5 (step 4) | tenant_admin, organizer | `GET /v1/promo-codes?eventId=` | Event must exist |
| `/my/tickets` | S-24 My Tickets | W-6 (completion), W-9 | attendee | `GET /v1/tickets?userId=me` | None |

---

## Zone: Orders

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:id/orders` | Order List | W-7 | tenant_admin, organizer, finance | `GET /v1/orders?eventId=` | Event must exist |
| `/orders/:orderId` | Order Detail | W-7 (steps 1–4) | tenant_admin, organizer, finance | `GET /v1/orders/:id` | Order must exist |
| `/my/orders` | My Orders | W-6 (attendee history) | attendee | `GET /v1/orders?userId=me` | None |

---

## Zone: Inventory

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:id/inventory` | Inventory Status | W-5 (step 5) | tenant_admin, organizer, finance | `GET /v1/inventory?eventId=` | Event must exist |

---

## Zone: Onsite Operations

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:id/onsite` | S-17 Onsite Dashboard (D-03) | W-9 (step 6) | tenant_admin, organizer, onsite_staff | `GET /v1/analytics/checkin?eventId=`, `GET /v1/check-ins?eventId=` | Event must be live |
| `/events/:id/onsite/checkin` | S-16 Check-in Station | W-9 (steps 1–5) | tenant_admin, organizer, onsite_staff | `GET /v1/attendees?search=`, `POST /v1/check-ins` | Event must be live |
| `/events/:id/onsite/badges` | Badge Print Log | W-9 (step 5) | tenant_admin, organizer, onsite_staff | `GET /v1/badge-prints?eventId=`, `POST /v1/badge-prints` | Event must exist |
| `/events/:id/onsite/devices` | Device Sessions | — | tenant_admin, organizer, onsite_staff | `GET /v1/device-sessions?eventId=` | Event must exist |

---

## Zone: Campaigns

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/campaigns` | S-19 Campaign List | W-10 (step 5) | tenant_admin, organizer | `GET /v1/campaigns` | None |
| `/campaigns/new` | Create Campaign | W-10 (step 2) | tenant_admin, organizer | `POST /v1/campaigns` | Audience segment must exist |
| `/campaigns/:id` | Campaign Detail | W-10 (steps 3–5) | tenant_admin, organizer | `GET /v1/campaigns/:id` | Campaign must exist |
| `/campaigns/:id/edit` | Edit Campaign | W-10 (step 2) | tenant_admin, organizer | `PATCH /v1/campaigns/:id` | Not yet sent |
| `/audience-segments` | Segment List | W-10 (entry) | tenant_admin, organizer | `GET /v1/audience-segments` | None |
| `/audience-segments/new` | Create Segment | W-10 (step 1) | tenant_admin, organizer | `POST /v1/audience-segments` | None |

---

## Zone: Analytics

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/analytics` | S-18 Analytics (platform-wide, D-02 variant) | — | tenant_admin, organizer, finance, support | `GET /v1/analytics/summary`, `GET /v1/analytics/metrics` | None |
| `/events/:id/analytics` | S-18 Event Analytics (D-07) | — | tenant_admin, organizer, finance, support | `GET /v1/analytics/events/:id` | Event must exist |

---

## Zone: Search

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/search` | S-26 Global Search | — | All authenticated | `GET /v1/search?q=` | None (graceful degradation if no results) |

---

## Zone: Networking

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/network` | S-25 Networking — My Connections | — | All authenticated | `GET /v1/connections?userId=me` | None |
| `/network/requests` | S-25 Networking — Requests | — | All authenticated | `GET /v1/connections?requesteeId=me&status=pending` | None |
| `/attendees` | S-25 Attendee Directory | — | All authenticated | `GET /v1/attendees?public=true` | None |

---

## Zone: Interactive Engagement

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:id/polls` | Poll Management | — | tenant_admin, organizer | `GET /v1/polls?eventId=` | Event must exist |
| `/events/:id/polls/new` | Create Poll | — | tenant_admin, organizer | `POST /v1/polls` | Event must exist |
| `/events/:id/qa` | Q&A Management | — | tenant_admin, organizer | `GET /v1/qa-questions?eventId=` | Event must exist |
| `/events/:id/surveys` | Survey Management | — | tenant_admin, organizer | `GET /v1/surveys?eventId=` | Event must exist |
| `/events/:id/surveys/new` | Create Survey | — | tenant_admin, organizer | `POST /v1/surveys` | Event must exist |
| `/participate/polls/:pollId` | Attendee Poll Response | — | attendee, speaker | `POST /v1/polls/:id/respond` | Poll must be active |
| `/participate/qa/:sessionId` | Attendee Q&A | — | attendee, speaker | `POST /v1/qa-questions` | Session must be live |
| `/participate/surveys/:surveyId` | Attendee Survey | — | attendee, speaker | `POST /v1/surveys/:id/complete` | Survey must be active |

---

## Zone: Integrations

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/integrations` | S-27 Webhook List | — | tenant_admin | `GET /v1/webhooks` | None |
| `/integrations/new` | Create Webhook | — | tenant_admin | `POST /v1/webhooks` | None |
| `/integrations/:id` | Webhook Detail | — | tenant_admin | `GET /v1/webhooks/:id` | Webhook must exist |

---

## Zone: Platform Administration

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/admin` | D-05 Admin Dashboard | W-1 (ongoing) | tenant_admin | Multiple summary endpoints | None |
| `/admin/users` | S-20 User List | W-1 (user management) | tenant_admin | `GET /v1/users` | None |
| `/admin/users/new` | Create / Invite User | W-1 | tenant_admin | `POST /v1/users` | None |
| `/admin/users/:userId` | User Detail + Role Assignment | W-1 | tenant_admin | `GET /v1/users/:id`, `GET /v1/rbac/users/:id/roles` | User must exist |
| `/admin/users/:userId/edit` | Edit User | W-1 | tenant_admin | `PATCH /v1/users/:id` | User must exist |
| `/admin/roles` | S-21 Role List | W-1 (role setup) | tenant_admin | `GET /v1/roles` | None |
| `/admin/roles/new` | Create Custom Role | W-1 | tenant_admin | `POST /v1/roles` | None |
| `/admin/roles/:roleId` | Role Detail | W-1 | tenant_admin | `GET /v1/roles/:id`, `GET /v1/permissions` | Role must exist |
| `/admin/roles/:roleId/edit` | Edit Role Permissions | W-1 | tenant_admin | `PATCH /v1/roles/:id` | Role must exist; system roles protected |
| `/admin/tenant` | Tenant Settings | W-1 (step 5) | tenant_admin | `GET/PATCH /v1/tenant` | None |
| `/admin/sso` | S-28 SSO List | W-1 (step 6) | tenant_admin | `GET /v1/sso-connections` | None |
| `/admin/sso/new` | Create SSO Connection | W-1 | tenant_admin | `POST /v1/sso-connections` | None |
| `/admin/sso/:id` | SSO Connection Detail | W-1 | tenant_admin | `GET /v1/sso-connections/:id` | Connection must exist |
| `/admin/audit` | S-22 Audit Log | — | tenant_admin | `GET /v1/audit-logs` | None |

---

## Zone: Profile / Account

| Route | Screen | Workflow(s) | Roles | Primary APIs | Blocking Conditions |
|---|---|---|---|---|---|
| `/profile` | Profile View / Edit | — | All authenticated | `GET /v1/auth/me`, `PATCH /v1/users/:id` | None |
| `/profile/security` | Password Change / Sessions | — | All authenticated | `POST /v1/auth/change-password`, `GET /v1/auth/sessions` | None |

---

## State Machines (UI-critical)

### Event Status Machine
```
draft → published → live → archived
draft → cancelled
published → cancelled
```
Action routes: `POST /v1/events/:id/publish`, `/go-live`, `/archive`, `/cancel`

### Registration Status Machine
```
submitted → approved → confirmed
submitted → waitlisted
any → cancelled
```
Action routes: `POST /v1/registrations/:id/approve`, `/confirm`, `/waitlist`, `/cancel`

### Order / Fulfillment Chain
```
POST /v1/orders (created)
  → payment.completed (Kafka)
    → order.paid (Kafka)
      → fulfillment.completed (Kafka)
        → ticket.issued (Kafka)
          → notification.sent (Kafka)
```
Frontend polls `GET /v1/orders/:id` until `status === 'fulfilled'`.

---

## Route Count Verification

| Zone | Count |
|---|---|
| Public | 8 |
| Dashboard | 1 |
| Events | 5 |
| Agenda | 7 |
| Speakers | 4 |
| Exhibitors | 7 |
| Attendees | 2 |
| Registration | 3 |
| Ticketing & Pricing | 6 |
| Orders | 3 |
| Inventory | 1 |
| Onsite | 4 |
| Campaigns | 6 |
| Analytics | 2 |
| Search | 1 |
| Networking | 3 |
| Interactive Engagement | 8 |
| Integrations | 3 |
| Platform Administration | 14 |
| Profile | 2 |
| **TOTAL** | **91** |
