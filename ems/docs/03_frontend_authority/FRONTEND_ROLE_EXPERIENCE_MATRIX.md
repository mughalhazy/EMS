Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Frontend Role Experience Matrix

> Defines the complete UX experience for each of the 8 authoritative roles.
> Derived from: rbac.service.ts (roles + permissions), PRODUCT_WORKFLOWS.md (workflows),
> SERVICE_CATALOG.md (endpoints), and Phase 2.95 Decision Collapse outputs.

## Role Overview

| Role | Primary persona | Access breadth | Default on registration? |
|---|---|---|---|
| `tenant_admin` | Platform administrator | Full — all 23 permissions | No (manually assigned) |
| `organizer` | Event organizer | Event management + analytics | No (manually assigned) |
| `finance` | Finance/reporting | Commerce + analytics read | No (manually assigned) |
| `support` | Customer support | User/attendee/registration read | No (manually assigned) |
| `exhibitor` | Exhibitor company rep | Own booth/sponsor/lead records | No (manually assigned) |
| `speaker` | Session speaker | Own sessions, networking | No (manually assigned) |
| `onsite_staff` | Event day staff | Check-in, badge, attendee lookup | No (manually assigned) |
| `attendee` | Event attendee | Own registrations/tickets, networking | **Yes** (auto-assigned on user.registered) |

---

## 1. tenant_admin

**Primary personas**: Syntera tenant administrator, platform superuser

**Dashboard**: Admin Overview — active events, user count, recent audit entries, platform health indicators

**Navigation visible**: All sections

**Full capabilities**:
- Everything `organizer` can do
- Create and manage users (invite, deactivate, delete)
- Assign/revoke any role to any user
- Create and manage custom roles with custom permission sets
- View and edit tenant settings (name, branding, config)
- Configure SSO connections (OAuth2/SAML providers)
- Suspend tenant (dangerous — requires confirmation)
- View full audit log with all event types
- Manage webhook integrations
- Access all reports and analytics
- Override all event/registration/order actions

**Screens accessible**: All 70+ screens

**Home screen after login**: `/dashboard` (admin overview variant)

---

## 2. organizer

**Primary personas**: Event manager, event coordinator, conference organizer

**Dashboard**: Event Management Dashboard — upcoming events, registration count, ticket sales, recent registrations

**Navigation visible**: Events, Agenda, Speakers, Exhibitors, Attendees, Registration, Ticketing, Orders, Inventory, Onsite, Campaigns, Analytics, Networking, Polls & Q&A, Search

**Full capabilities**:
- Create, edit, publish, archive, and cancel events
- Build event agenda (tracks, sessions)
- Manage speakers and assign to sessions
- Manage exhibitors and sponsors
- View and manage all attendees (attendee:manage)
- Approve, reject, waitlist, cancel registrations (registration:manage)
- Create ticket products, set pricing rules, create promo codes (commerce:manage)
- View all orders; trigger refunds (commerce:manage)
- Operate onsite check-in and badge printing (onsite:operate)
- Create and send campaigns (campaign:manage)
- View analytics dashboards (analytics:read)
- View roles (role:read)
- View users (user:read)

**Not accessible**: Admin section (users management, role management, tenant settings, SSO, audit log — these require tenant_admin)

**Home screen after login**: `/dashboard` (organizer variant)

---

## 3. finance

**Primary personas**: Finance manager, revenue analyst, accountant

**Dashboard**: Commerce Dashboard — revenue summary, ticket sales, order volume, refund rate, inventory levels

**Navigation visible**: Orders, Ticketing, Inventory, Analytics, Networking (self), Search

**Full capabilities**:
- View all orders (commerce:manage)
- View ticket products and pricing (commerce:manage)
- View inventory status (commerce:manage)
- Process refunds (commerce:manage)
- View analytics dashboards (analytics:read)
- View audit log for financial entries (audit:read)

**Cannot do**:
- Create or edit events, sessions, speakers
- Manage attendees or registrations
- Send campaigns
- Create tickets (view only)

**Home screen after login**: `/analytics` (commerce/finance view)

---

## 4. support

**Primary personas**: Customer support agent, helpdesk

**Dashboard**: Support Dashboard — recent registrations, open issues (based on registration status), attendee search

**Navigation visible**: Attendees, Registration, Analytics, Networking (self), Search

**Full capabilities**:
- Search and view user profiles (user:read)
- View attendee profiles and tags (attendee:manage)
- View and manage registrations — approve, cancel, view all answers (registration:manage)
- View audit log (audit:read)
- View analytics read-only (analytics:read)

**Cannot do**:
- Create or edit events, sessions, speakers
- Manage orders or process refunds
- Send campaigns
- Manage roles or users (beyond viewing)

**Home screen after login**: `/events/:id/registrations` (most recent active event) or `/attendees` search

---

## 5. exhibitor

**Primary personas**: Sponsor company representative, booth manager, lead collector

**Dashboard**: Exhibitor Portal — my booth info, leads captured, booth traffic

**Navigation visible**: Exhibitors (own records), Networking, Search

**Full capabilities**:
- View and edit own Exhibitor record (exhibitor:manage — row-level scoped)
- View own Booth details
- View own Sponsor record
- View Leads captured at own booth
- Network with attendees (connection requests)
- Search attendee directory

**Cannot do**:
- View other exhibitors' records
- Create events, sessions, or speakers
- Access registration, order, or analytics data
- Manage campaigns or integrations

**Home screen after login**: `/exhibitors` (filtered to own records) or exhibitor dashboard

---

## 6. speaker

**Primary personas**: Conference speaker, panelist, workshop facilitator

**Dashboard**: Speaker Portal — my sessions, session schedule, speaker profile

**Navigation visible**: Agenda (own sessions), Networking, Search, Profile

**Full capabilities**:
- View own sessions (sessions assigned to their Speaker record)
- View session details (room, time, track, co-speakers)
- Network with attendees and other speakers
- Edit own speaker profile (own-data endpoint)

**Cannot do**:
- Create or edit sessions (speaker:manage is not assigned — speakers cannot modify session content)
- View registration or order data
- Access event management features

**Note**: Speaker sees `GET /v1/sessions?speakerId={me}` — this is an authentication-filtered endpoint, not permission-gated.

**Home screen after login**: `/my/sessions` (speaker-filtered session list)

---

## 7. onsite_staff

**Primary personas**: Event day check-in staff, badge printer, usher

**Dashboard**: Onsite Operations — current check-in rate, badge print queue, session attendance

**Navigation visible**: Onsite, Attendees (read-only lookup), Search

**Full capabilities**:
- Operate check-in station — scan QR/badge, create CheckIn record (onsite:operate)
- Print badges (onsite:operate)
- Manage device sessions (onsite:operate)
- Look up attendees by name/QR code (attendee:manage)
- View session schedule (read-only, for directing attendees)

**Cannot do**:
- Create or edit events, sessions, speakers, or exhibitors
- View registration details or registration answers
- Process orders or refunds
- Access analytics

**Home screen after login**: `/events/:id/onsite/checkin` (active event check-in station)

---

## 8. attendee

**Primary personas**: Event attendee, ticket holder, conference participant

**Dashboard**: Attendee Hub — my upcoming events, my tickets, my connections, my registrations

**Navigation visible**: My Registrations, My Tickets, Networking, Polls & Q&A (participate), Search, Profile

**Full capabilities**:
- View own registrations (`GET /v1/registrations?userId=me`)
- View own tickets and QR codes (`GET /v1/tickets?userId=me`)
- View own orders (`GET /v1/orders?userId=me`)
- Submit connection requests to other attendees
- Accept/decline received connection requests
- Participate in active polls, Q&A sessions, and surveys
- Search event content (speakers, sessions, exhibitors)
- Edit own profile
- Register for public events (unauthenticated or authenticated flow)

**Cannot do**:
- View other attendees' private data
- Access event management features
- View orders other than own

**Home screen after login**: `/dashboard` (attendee variant) or `/my/registrations`

---

## Role Experience Comparison — Key Differences

| Capability | tenant_admin | organizer | finance | support | exhibitor | speaker | onsite_staff | attendee |
|---|---|---|---|---|---|---|---|---|
| Create events | ✅ | ✅ | — | — | — | — | — | — |
| Manage sessions | ✅ | ✅ | — | — | — | — | — | — |
| View all registrations | ✅ | ✅ | — | ✅ | — | — | — | — |
| Approve registrations | ✅ | ✅ | — | ✅ | — | — | — | — |
| View all orders | ✅ | ✅ | ✅ | — | — | — | — | — |
| Process refunds | ✅ | ✅ | ✅ | — | — | — | — | — |
| Check in attendees | ✅ | ✅ | — | — | — | — | ✅ | — |
| Send campaigns | ✅ | ✅ | — | — | — | — | — | — |
| View analytics | ✅ | ✅ | ✅ | ✅ | — | — | — | — |
| Manage users | ✅ | — | — | — | — | — | — | — |
| Manage roles | ✅ | — | — | — | — | — | — | — |
| Manage SSO | ✅ | — | — | — | — | — | — | — |
| View audit log | ✅ | — | ✅ | ✅ | — | — | — | — |
| Manage webhooks | ✅ | — | — | — | — | — | — | — |
| Networking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
