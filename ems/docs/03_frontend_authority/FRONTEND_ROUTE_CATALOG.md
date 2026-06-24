Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Frontend Route Catalog

> Every frontend route is justified by a backend service and API endpoint.
> No orphan routes. Derived from SERVICE_CATALOG.md (code-verified 2026-06-17),
> FEATURE_SCOPE.md, and Phase 2.95 Decision Collapse outputs.
> 
> Format: Route | Purpose | Roles | Required Permission | Backend API | Blocking Conditions

---

## Zone: Public (Unauthenticated)

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/login` | Login with email/password or SSO | Public | None | `POST /v1/auth/login` | None |
| `/register` | Create new user account | Public | None | `POST /v1/auth/register` | None |
| `/forgot-password` | Request password reset email | Public | None | `POST /v1/auth/forgot-password` | None |
| `/reset-password` | Submit new password via reset token | Public | None | `POST /v1/auth/reset-password` | Token must be valid |
| `/sso/callback` | Handle OAuth2/SAML redirect | Public | None | `GET /v1/auth/sso/callback` | SSO provider must be configured |
| `/events/:eventId/register` | Public event registration form | Public or Authenticated | None | `POST /v1/registrations` | Event must be published |
| `/events/:eventId/checkout` | Ticket purchase checkout | Public or Authenticated | None | `POST /v1/orders` | Event must be published; ticket products must exist |
| `/registrations/:id/confirm` | Registration confirmation page | Public | None | `GET /v1/registrations/:id` | Registration must exist |

---

## Zone: Authenticated — Dashboard

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/dashboard` | Role-adaptive home dashboard | All | None (authenticated) | `GET /v1/analytics/summary`, `GET /v1/events` | None |

---

## Zone: Events

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/events` | Event list (all events in tenant) | tenant_admin, organizer | `event:manage` | `GET /v1/events` | None |
| `/events/new` | Create event form | tenant_admin, organizer | `event:manage` | `POST /v1/events` | None |
| `/events/:eventId` | Event overview / detail | tenant_admin, organizer | `event:manage` | `GET /v1/events/:id` | Event must exist |
| `/events/:eventId/edit` | Edit event details | tenant_admin, organizer | `event:manage` | `PATCH /v1/events/:id` | Event must exist; not archived/cancelled |
| `/events/:eventId/settings` | Event settings (registration config, branding) | tenant_admin, organizer | `event:manage` | `GET/PUT /v1/events/:id/settings` | Event must exist (ROD-9 pending) |

---

## Zone: Agenda

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:eventId/agenda` | Agenda overview (tracks + sessions) | tenant_admin, organizer | `agenda:manage` | `GET /v1/sessions?eventId=`, `GET /v1/tracks?eventId=` | Event must exist |
| `/events/:eventId/tracks/new` | Create track | tenant_admin, organizer | `agenda:manage` | `POST /v1/tracks` | Event must exist |
| `/events/:eventId/sessions` | Session list for event | tenant_admin, organizer, speaker* | `agenda:manage` | `GET /v1/sessions?eventId=` | Event must exist |
| `/events/:eventId/sessions/new` | Create session | tenant_admin, organizer | `agenda:manage` | `POST /v1/sessions` | Event must exist; tracks must exist |
| `/events/:eventId/sessions/:sessionId` | Session detail | tenant_admin, organizer, speaker* | `agenda:manage` | `GET /v1/sessions/:id` | Session must exist |
| `/events/:eventId/sessions/:sessionId/edit` | Edit session | tenant_admin, organizer | `agenda:manage` | `PATCH /v1/sessions/:id` | Session must exist; not cancelled |
| `/my/sessions` | Speaker's own assigned sessions | speaker | None (authenticated, filtered) | `GET /v1/sessions?speakerId=me` | User must have Speaker record |

---

## Zone: Speakers

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/speakers` | Speaker list (global) | tenant_admin, organizer | `speaker:manage` | `GET /v1/speakers` | None |
| `/speakers/new` | Create speaker profile | tenant_admin, organizer | `speaker:manage` | `POST /v1/speakers` | None |
| `/speakers/:speakerId` | Speaker profile detail | tenant_admin, organizer | `speaker:manage` | `GET /v1/speakers/:id` | Speaker must exist |
| `/speakers/:speakerId/edit` | Edit speaker profile | tenant_admin, organizer | `speaker:manage` | `PATCH /v1/speakers/:id` | Speaker must exist |

---

## Zone: Exhibitors

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:eventId/exhibitors` | Exhibitor list for event | tenant_admin, organizer, exhibitor* | `exhibitor:manage` | `GET /v1/exhibitors?eventId=` | Event must exist |
| `/events/:eventId/exhibitors/new` | Add exhibitor to event | tenant_admin, organizer | `exhibitor:manage` | `POST /v1/exhibitors` | Event must exist |
| `/events/:eventId/exhibitors/:exhibitorId` | Exhibitor detail | tenant_admin, organizer, exhibitor* | `exhibitor:manage` | `GET /v1/exhibitors/:id` | Exhibitor must exist |
| `/events/:eventId/exhibitors/:exhibitorId/edit` | Edit exhibitor | tenant_admin, organizer, exhibitor* | `exhibitor:manage` | `PATCH /v1/exhibitors/:id` | Exhibitor must exist |
| `/events/:eventId/sponsors` | Sponsor list | tenant_admin, organizer | `exhibitor:manage` | `GET /v1/sponsors?eventId=` | Event must exist |
| `/events/:eventId/booths` | Booth management | tenant_admin, organizer, exhibitor* | `exhibitor:manage` | `GET /v1/booths?eventId=` | Event must exist |
| `/events/:eventId/leads` | Lead capture list (exhibitor view) | tenant_admin, organizer, exhibitor* | `exhibitor:manage` | `GET /v1/leads?eventId=` | Event must exist |

---

## Zone: Attendees

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:eventId/attendees` | Attendee list for event | tenant_admin, organizer, support, onsite_staff | `attendee:manage` | `GET /v1/attendees?eventId=` | Event must exist |
| `/attendees/:attendeeId` | Attendee profile detail | tenant_admin, organizer, support, onsite_staff | `attendee:manage` | `GET /v1/attendees/:id` | Attendee must exist |

---

## Zone: Registration

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:eventId/registrations` | Registration list with status filters | tenant_admin, organizer, support | `registration:manage` | `GET /v1/registrations?eventId=` | Event must exist |
| `/events/:eventId/registrations/:registrationId` | Registration detail + approval actions | tenant_admin, organizer, support | `registration:manage` | `GET /v1/registrations/:id` | Registration must exist |
| `/my/registrations` | Own registration history (attendee) | attendee | None (authenticated, filtered) | `GET /v1/registrations?userId=me` | None |

---

## Zone: Ticketing and Pricing

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:eventId/tickets` | Ticket product list | tenant_admin, organizer, finance | `commerce:manage` | `GET /v1/ticket-products?eventId=` | Event must exist |
| `/events/:eventId/tickets/new` | Create ticket product | tenant_admin, organizer | `commerce:manage` | `POST /v1/ticket-products` | Event must exist |
| `/events/:eventId/tickets/:ticketProductId/edit` | Edit ticket product | tenant_admin, organizer | `commerce:manage` | `PATCH /v1/ticket-products/:id` | TicketProduct must exist |
| `/events/:eventId/pricing` | Pricing rules management | tenant_admin, organizer, finance | `commerce:manage` | `GET /v1/price-rules?eventId=` | Event must exist |
| `/events/:eventId/promo-codes` | Promo code management | tenant_admin, organizer | `commerce:manage` | `GET /v1/promo-codes?eventId=` | Event must exist |
| `/my/tickets` | Own tickets with QR codes (attendee) | attendee | None (authenticated, filtered) | `GET /v1/tickets?userId=me` | None |

---

## Zone: Orders

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:eventId/orders` | Order list for event | tenant_admin, organizer, finance | `commerce:manage` | `GET /v1/orders?eventId=` | Event must exist |
| `/orders/:orderId` | Order detail + refund action | tenant_admin, organizer, finance | `commerce:manage` | `GET /v1/orders/:id` | Order must exist |
| `/my/orders` | Own order history (attendee) | attendee | None (authenticated, filtered) | `GET /v1/orders?userId=me` | None |

---

## Zone: Inventory

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:eventId/inventory` | Inventory item list and levels | tenant_admin, organizer, finance | `commerce:manage` | `GET /v1/inventory?eventId=` | Event must exist |

---

## Zone: Onsite Operations

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:eventId/onsite` | Onsite dashboard (check-in rate, live stats) | tenant_admin, organizer, onsite_staff | `onsite:operate` | `GET /v1/analytics/checkin?eventId=`, `GET /v1/check-ins?eventId=` | Event must be live |
| `/events/:eventId/onsite/checkin` | Check-in station (scan/search attendee) | tenant_admin, organizer, onsite_staff | `onsite:operate` | `POST /v1/check-ins`, `GET /v1/attendees?search=` | Event must be live |
| `/events/:eventId/onsite/badges` | Badge print log and reprint | tenant_admin, organizer, onsite_staff | `onsite:operate` | `GET /v1/badge-prints?eventId=`, `POST /v1/badge-prints` | Event must exist |
| `/events/:eventId/onsite/devices` | Device session management | tenant_admin, organizer, onsite_staff | `onsite:operate` | `GET /v1/device-sessions?eventId=` | Event must exist |

---

## Zone: Campaigns

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/campaigns` | Campaign list | tenant_admin, organizer | `campaign:manage` | `GET /v1/campaigns` | None |
| `/campaigns/new` | Create campaign | tenant_admin, organizer | `campaign:manage` | `POST /v1/campaigns` | Audience segment must exist |
| `/campaigns/:campaignId` | Campaign detail | tenant_admin, organizer | `campaign:manage` | `GET /v1/campaigns/:id` | Campaign must exist |
| `/campaigns/:campaignId/edit` | Edit campaign | tenant_admin, organizer | `campaign:manage` | `PATCH /v1/campaigns/:id` | Campaign must exist; not yet sent |
| `/audience-segments` | Audience segment list | tenant_admin, organizer | `campaign:manage` | `GET /v1/audience-segments` | None |
| `/audience-segments/new` | Create audience segment | tenant_admin, organizer | `campaign:manage` | `POST /v1/audience-segments` | None |

---

## Zone: Analytics

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/analytics` | Platform-wide analytics dashboard | tenant_admin, organizer, finance, support | `analytics:read` | `GET /v1/analytics/summary`, `GET /v1/analytics/metrics` | None |
| `/events/:eventId/analytics` | Event-specific analytics | tenant_admin, organizer, finance, support | `analytics:read` | `GET /v1/analytics/events/:id` | Event must exist |

---

## Zone: Search

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/search` | Global full-text search across events, speakers, sessions, attendees | All authenticated | None | `GET /v1/search?q=` | None (graceful degradation if no results) |

---

## Zone: Networking

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/network` | My connections list | All authenticated | None | `GET /v1/connections?userId=me` | None |
| `/network/requests` | Pending connection requests | All authenticated | None | `GET /v1/connections?status=pending&requesteeId=me` | None |
| `/attendees` | Public attendee directory for networking | All authenticated | None | `GET /v1/attendees?public=true` | None |

---

## Zone: Interactive Engagement

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/events/:eventId/polls` | Poll management (organizer view) | tenant_admin, organizer | `agenda:manage` | `GET /v1/polls?eventId=` | Event must exist |
| `/events/:eventId/polls/new` | Create poll | tenant_admin, organizer | `agenda:manage` | `POST /v1/polls` | Event must exist |
| `/events/:eventId/qa` | Q&A management (organizer view) | tenant_admin, organizer | `agenda:manage` | `GET /v1/qa-questions?eventId=` | Event must exist |
| `/events/:eventId/surveys` | Survey management | tenant_admin, organizer | `agenda:manage` | `GET /v1/surveys?eventId=` | Event must exist |
| `/events/:eventId/surveys/new` | Create survey | tenant_admin, organizer | `agenda:manage` | `POST /v1/surveys` | Event must exist |
| `/participate/polls/:pollId` | Attendee poll response screen | attendee, speaker | None (authenticated) | `POST /v1/polls/:id/respond` | Poll must be active |
| `/participate/qa/:sessionId` | Attendee Q&A submission | attendee, speaker | None (authenticated) | `POST /v1/qa-questions` | Session must be live |
| `/participate/surveys/:surveyId` | Attendee survey completion | attendee, speaker | None (authenticated) | `POST /v1/surveys/:id/complete` | Survey must be active |

---

## Zone: Integrations

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/integrations` | Webhook subscription list | tenant_admin | `integration:manage` | `GET /v1/webhooks` | None |
| `/integrations/new` | Create webhook subscription | tenant_admin | `integration:manage` | `POST /v1/webhooks` | None |
| `/integrations/:webhookId` | Webhook detail + delivery log | tenant_admin | `integration:manage` | `GET /v1/webhooks/:id` | Webhook must exist |

---

## Zone: Platform Administration

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/admin` | Admin overview dashboard | tenant_admin | All admin permissions | Multiple summary endpoints | None |
| `/admin/users` | User list with search | tenant_admin | `user:read` | `GET /v1/users` | None |
| `/admin/users/new` | Create / invite user | tenant_admin | `user:write` | `POST /v1/users` | None |
| `/admin/users/:userId` | User detail + role assignment | tenant_admin | `user:read`, `role:assign` | `GET /v1/users/:id`, `GET /v1/rbac/users/:id/roles` | User must exist |
| `/admin/users/:userId/edit` | Edit user profile | tenant_admin | `user:write` | `PATCH /v1/users/:id` | User must exist |
| `/admin/roles` | Role list | tenant_admin | `role:read` | `GET /v1/roles` | None |
| `/admin/roles/new` | Create custom role | tenant_admin | `role:write` | `POST /v1/roles` | None |
| `/admin/roles/:roleId` | Role detail + permission list | tenant_admin | `role:read` | `GET /v1/roles/:id` | Role must exist |
| `/admin/roles/:roleId/edit` | Edit role permissions | tenant_admin | `role:write` | `PATCH /v1/roles/:id` | Role must exist; system roles protected |
| `/admin/tenant` | Tenant settings | tenant_admin | `tenant:read` | `GET /v1/tenant` | None |
| `/admin/sso` | SSO connection list | tenant_admin | `sso:manage` | `GET /v1/sso-connections` | None |
| `/admin/sso/new` | Create SSO connection | tenant_admin | `sso:manage` | `POST /v1/sso-connections` | None |
| `/admin/sso/:connectionId` | SSO connection detail | tenant_admin | `sso:manage` | `GET /v1/sso-connections/:id` | Connection must exist |
| `/admin/audit` | Audit log with filters | tenant_admin | `audit:read` | `GET /v1/audit-logs` | None |

---

## Zone: Profile / Account

| Route | Purpose | Roles | Permission | Backend API | Blocking Conditions |
|---|---|---|---|---|---|
| `/profile` | Own profile view and edit | All authenticated | None (own data) | `GET /v1/auth/me`, `PATCH /v1/users/:id` | None |
| `/profile/security` | Password change, active sessions | All authenticated | None (own data) | `POST /v1/auth/change-password`, `GET /v1/auth/sessions` | None |

---

## Route Count Summary

| Zone | Route Count |
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
| Platform Admin | 14 |
| Profile | 2 |
| **Total** | **91** |
