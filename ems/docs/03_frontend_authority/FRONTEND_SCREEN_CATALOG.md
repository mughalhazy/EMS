Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Frontend Screen Catalog

> Full Screen Authority Model for every distinct screen type.
> Derived entirely from verified backend reality. No invented screens.
> 91 routes resolve to ~38 distinct screen types (remaining routes are
> contextual variants of these types within different event contexts).

---

## S-01: Login

| Field | Value |
|---|---|
| **Route** | `/login` |
| **Purpose** | Authenticate user with email/password or redirect to SSO |
| **Primary users** | All (unauthenticated) |
| **Required permissions** | None |
| **API dependencies** | `POST /v1/auth/login`, `GET /v1/sso-connections` (to show SSO buttons) |
| **Workflows** | Workflow 1 (Tenant Onboarding — step 4) |
| **Actions** | Submit email/password form; click SSO provider button |
| **Navigation entry** | Direct URL; redirect from protected routes on 401 |
| **Related screens** | Register (S-02), Forgot Password (S-03), Dashboard (S-07) |
| **Error states** | Invalid credentials (401 → "Email or password incorrect"); Account deactivated |
| **Empty states** | N/A |
| **Loading state** | Button spinner on submit |
| **Success state** | Redirect to `/dashboard` (or originally requested URL) |

---

## S-02: Register

| Field | Value |
|---|---|
| **Route** | `/register` |
| **Purpose** | Create new user account (triggers tenant creation for first user) |
| **Primary users** | New users (unauthenticated) |
| **Required permissions** | None |
| **API dependencies** | `POST /v1/auth/register` |
| **Workflows** | Workflow 1 (Tenant Onboarding — steps 1–4) |
| **Actions** | Submit name, email, password form |
| **Navigation entry** | Login page link; direct URL |
| **Related screens** | Login (S-01) |
| **Error states** | Email already in use (409 → "Email already registered"); Weak password |
| **Empty states** | N/A |
| **Loading state** | Button spinner |
| **Success state** | Redirect to `/dashboard` with welcome state |

---

## S-03: Forgot / Reset Password

| Field | Value |
|---|---|
| **Routes** | `/forgot-password`, `/reset-password` |
| **Purpose** | Request and complete password reset |
| **Primary users** | All (unauthenticated) |
| **Required permissions** | None |
| **API dependencies** | `POST /v1/auth/forgot-password`, `POST /v1/auth/reset-password` |
| **Actions** | Submit email; submit new password |
| **Error states** | Invalid/expired reset token; Email not found (show success message anyway — security) |
| **Success state** | Redirect to `/login` with "Password updated" toast |

---

## S-04: SSO Callback

| Field | Value |
|---|---|
| **Route** | `/sso/callback` |
| **Purpose** | Handle OAuth2/SAML redirect; exchange code for tokens |
| **Primary users** | All (unauthenticated) |
| **Required permissions** | None |
| **API dependencies** | `GET /v1/auth/sso/callback` |
| **Error states** | SSO provider error; Invalid state param; SSO not configured |
| **Success state** | Redirect to `/dashboard` |
| **Loading state** | Full-page spinner ("Completing SSO login...") |

---

## S-05: Public Event Registration

| Field | Value |
|---|---|
| **Route** | `/events/:eventId/register` |
| **Purpose** | Collect attendee registration data for an event |
| **Primary users** | Attendees (public/unauthenticated or authenticated) |
| **Required permissions** | None |
| **API dependencies** | `GET /v1/events/:id` (event info), `GET /v1/registration-fields?eventId=` (dynamic fields), `POST /v1/registrations` |
| **Data dependencies** | Event entity, RegistrationField entities |
| **Workflows** | Workflow 8 (Registration — step 1–2) |
| **Actions** | Fill form, submit registration |
| **Navigation entry** | Direct link from event page / marketing |
| **Related screens** | Checkout (S-06), Registration Confirmation (S-27) |
| **Error states** | Event not published (redirect); Registration closed (show closed state); Event at capacity |
| **Empty states** | No custom fields → minimal form (name, email only) |
| **Loading state** | Form skeleton while loading event + fields |
| **Success state** | Redirect to `/registrations/:id/confirm` |

---

## S-06: Checkout

| Field | Value |
|---|---|
| **Route** | `/events/:eventId/checkout` |
| **Purpose** | Ticket selection, promo code, and payment |
| **Primary users** | Attendees |
| **Required permissions** | None |
| **API dependencies** | `GET /v1/ticket-products?eventId=`, `GET /v1/price-rules?eventId=`, `POST /v1/orders` (with Idempotency-Key header) |
| **Data dependencies** | TicketProduct, PriceRule, InventoryItem (availability) |
| **Workflows** | Workflow 6 (Checkout — steps 2–6) |
| **Actions** | Select ticket quantity, enter promo code, enter payment details, submit order |
| **Error states** | Ticket sold out; Promo code invalid; Payment declined (display gateway message); Duplicate order (idempotency key) |
| **Empty states** | No tickets available → "No tickets on sale for this event" |
| **Loading state** | Skeleton while loading ticket options; spinner on payment submit |
| **Success state** | Redirect to `/orders/:orderId` (confirmation with QR code) |

---

## S-07: Dashboard (Role-Adaptive)

| Field | Value |
|---|---|
| **Route** | `/dashboard` |
| **Purpose** | Role-specific home page with relevant KPIs and quick actions |
| **Primary users** | All authenticated |
| **Required permissions** | None (authenticated) |
| **API dependencies** | Varies by role (see FRONTEND_DASHBOARD_CATALOG.md) |
| **Workflows** | Entry point for all workflows |
| **Actions** | Quick action buttons; KPI card navigation; Recent activity list |
| **Error states** | API error → show empty KPI cards with retry |
| **Empty state** | First login → "Create your first event" CTA (organizer) |
| **Loading state** | KPI card skeletons |

---

## S-08: Event List

| Field | Value |
|---|---|
| **Route** | `/events` |
| **Purpose** | Browse and manage all events in the tenant |
| **Primary users** | tenant_admin, organizer |
| **Required permissions** | `event:manage` |
| **API dependencies** | `GET /v1/events` (paginated, filterable by status) |
| **Data dependencies** | Event entity |
| **Workflows** | Workflow 2 (entry) |
| **Actions** | Create event; Filter by status (draft/published/live/archived/cancelled); Search by name; Click event to open |
| **Error states** | API error → show empty state with retry |
| **Empty state** | No events → "Create your first event" CTA |
| **Loading state** | Table row skeletons |
| **Success state** | Table with event name, status badge, dates, attendee count |

---

## S-09: Event Overview / Detail

| Field | Value |
|---|---|
| **Route** | `/events/:eventId` |
| **Purpose** | Event management hub — overview and status controls |
| **Primary users** | tenant_admin, organizer |
| **Required permissions** | `event:manage` |
| **API dependencies** | `GET /v1/events/:id`, `GET /v1/analytics/events/:id` (summary), `GET /v1/registrations?eventId=&limit=5` |
| **Data dependencies** | Event, AnalyticsEvent |
| **Workflows** | Workflow 2 (steps 4–7 — publish/live/archive/cancel) |
| **Actions** | Publish event; Go live; Archive event; Cancel event; Edit event; View settings; Quick-navigate to sub-sections |
| **Navigation entry** | Event list; Dashboard |
| **Related screens** | Edit Event (S-10), Event Settings (S-11), Agenda (S-12) |
| **Error states** | Event not found (404 → redirect to `/events`) |
| **Loading state** | Skeleton panels |
| **Success state** | Event status header; KPI summary cards (registrations, tickets sold, revenue) |

---

## S-10: Create / Edit Event

| Field | Value |
|---|---|
| **Routes** | `/events/new`, `/events/:id/edit` |
| **Purpose** | Create a new event or edit event details |
| **Primary users** | tenant_admin, organizer |
| **Required permissions** | `event:manage` |
| **API dependencies** | `POST /v1/events` (create) or `PATCH /v1/events/:id` (edit), `GET /v1/venues` (venue selector) |
| **Data dependencies** | Event, Venue |
| **Workflows** | Workflow 2 (steps 1–2) |
| **Actions** | Fill: name, description, venue, start date, end date, timezone, banner image; Save draft; Save and publish |
| **Error states** | Validation errors inline; Venue not found |
| **Loading state** | Form skeleton |
| **Success state** | Redirect to `/events/:id` with "Event saved" toast |

---

## S-11: Event Settings

| Field | Value |
|---|---|
| **Route** | `/events/:eventId/settings` |
| **Purpose** | Configure registration rules, capacity, and branding (ROD-9 pending) |
| **Primary users** | tenant_admin, organizer |
| **Required permissions** | `event:manage` |
| **API dependencies** | `GET /v1/events/:id/settings`, `PUT /v1/events/:id/settings` |
| **Data dependencies** | EventSettings entity (pending OCR-5) |
| **Workflows** | Workflow 2 (step 3) |
| **Actions** | Set registrationOpensAt, registrationClosesAt, maxCapacity, requiresApproval, brandingConfig |
| **Error states** | Settings not yet created → create defaults on first PUT |
| **Empty state** | "Settings not yet configured" → Create button (graceful degradation until OCR-5 implemented) |
| **Loading state** | Form skeleton |
| **Success state** | "Settings saved" inline toast |

---

## S-12: Agenda Builder

| Field | Value |
|---|---|
| **Route** | `/events/:eventId/agenda` |
| **Purpose** | Visual agenda management — tracks and sessions in grid/timeline view |
| **Primary users** | tenant_admin, organizer |
| **Required permissions** | `agenda:manage` |
| **API dependencies** | `GET /v1/sessions?eventId=`, `GET /v1/tracks?eventId=` |
| **Data dependencies** | Session, Track |
| **Workflows** | Workflow 3 (steps 1–2) |
| **Actions** | Add track; Add session; Drag session to different time slot or track; Click session to view detail |
| **Error states** | Overlapping sessions warning |
| **Empty state** | No sessions → "Add your first session" CTA |
| **Loading state** | Grid skeleton |

---

## S-13: Session Detail

| Field | Value |
|---|---|
| **Route** | `/events/:eventId/sessions/:sessionId` |
| **Purpose** | View session details and manage speaker assignments |
| **Primary users** | tenant_admin, organizer, speaker (own sessions) |
| **Required permissions** | `agenda:manage` (for management actions); none for speaker viewing own |
| **API dependencies** | `GET /v1/sessions/:id`, `GET /v1/sessions/:sessionId/speakers`, `POST /v1/sessions/:sessionId/speakers` |
| **Data dependencies** | Session, SessionSpeaker, Speaker |
| **Workflows** | Workflow 3 (step 4 — assign speakers) |
| **Actions** | Assign speaker (search + select); Remove speaker; Edit session; Cancel session |
| **Error states** | Session not found; Speaker already assigned |
| **Empty state** | No speakers assigned → "Assign a speaker" CTA |

---

## S-14: Registration Management List

| Field | Value |
|---|---|
| **Route** | `/events/:eventId/registrations` |
| **Purpose** | Review and manage all registrations for an event |
| **Primary users** | tenant_admin, organizer, support |
| **Required permissions** | `registration:manage` |
| **API dependencies** | `GET /v1/registrations?eventId=&status=` (filterable) |
| **Data dependencies** | Registration |
| **Workflows** | Workflow 8 (step 4b) |
| **Actions** | Filter by status; Search by name/email; Click to view detail; Bulk approve |
| **Error states** | API error → empty state with retry |
| **Empty state** | No registrations → "No registrations yet" |
| **Loading state** | Table row skeletons |

---

## S-15: Registration Detail

| Field | Value |
|---|---|
| **Route** | `/events/:eventId/registrations/:registrationId` |
| **Purpose** | View registration answers and take approval action |
| **Primary users** | tenant_admin, organizer, support |
| **Required permissions** | `registration:manage` |
| **API dependencies** | `GET /v1/registrations/:id` (includes answers via `answers` JSONB), `PATCH /v1/registrations/:id` |
| **Data dependencies** | Registration, RegistrationField |
| **Workflows** | Workflow 8 (step 4b) |
| **Actions** | Approve; Waitlist; Cancel; View all answers |
| **Error states** | Already confirmed (actions disabled) |
| **Status badges** | submitted (yellow) / approved (blue) / confirmed (green) / waitlisted (orange) / cancelled (red) |

---

## S-16: Check-in Station

| Field | Value |
|---|---|
| **Route** | `/events/:eventId/onsite/checkin` |
| **Purpose** | Rapid attendee lookup and check-in for onsite staff |
| **Primary users** | onsite_staff, organizer, tenant_admin |
| **Required permissions** | `onsite:operate` |
| **API dependencies** | `GET /v1/attendees?search=`, `GET /v1/registrations?attendeeId=&eventId=`, `POST /v1/check-ins`, `POST /v1/badge-prints` |
| **Data dependencies** | Attendee, Registration, CheckIn, BadgePrint |
| **Workflows** | Workflow 9 (steps 1–5) |
| **Actions** | Search attendee by name/email/QR; Confirm identity; Click "Check In"; Print badge |
| **Navigation entry** | Onsite dashboard; Direct URL (often on dedicated tablet) |
| **Error states** | Attendee not found; Already checked in (show with timestamp); Registration not confirmed |
| **Empty state** | Search prompt |
| **Loading state** | Search results spinner |
| **Success state** | Large green confirmation ("Checked In!") + name + optional badge print |

---

## S-17: Onsite Dashboard

| Field | Value |
|---|---|
| **Route** | `/events/:eventId/onsite` |
| **Purpose** | Real-time event day operations overview |
| **Primary users** | onsite_staff, organizer, tenant_admin |
| **Required permissions** | `onsite:operate` |
| **API dependencies** | `GET /v1/analytics/checkin?eventId=`, `GET /v1/check-ins?eventId=&limit=20` |
| **Data dependencies** | CheckIn, AnalyticsEvent |
| **Workflows** | Workflow 9 (step 6) |
| **Actions** | Navigate to check-in station; View recent check-ins; Monitor capacity |
| **Loading state** | KPI card skeletons |

---

## S-18: Analytics Dashboard

| Field | Value |
|---|---|
| **Routes** | `/analytics`, `/events/:eventId/analytics` |
| **Purpose** | Metrics and reporting for event/platform performance |
| **Primary users** | tenant_admin, organizer, finance, support |
| **Required permissions** | `analytics:read` |
| **API dependencies** | `GET /v1/analytics/summary`, `GET /v1/analytics/events/:id`, `GET /v1/analytics/metrics` |
| **Data dependencies** | AnalyticsEvent, EventMetric, TicketSalesSummary, AttendanceMetrics, EventDashboardView (views) |
| **Workflows** | All workflows (analytics reads from all events) |
| **Actions** | Filter by date range; Filter by event; Export CSV |
| **Error states** | No data → empty state with guidance |
| **Loading state** | Chart skeletons |

---

## S-19: Campaign List and Detail

| Field | Value |
|---|---|
| **Routes** | `/campaigns`, `/campaigns/:id` |
| **Purpose** | Manage marketing campaigns; view send history |
| **Primary users** | tenant_admin, organizer |
| **Required permissions** | `campaign:manage` |
| **API dependencies** | `GET /v1/campaigns`, `GET /v1/campaigns/:id`, `POST /v1/campaigns/:id/send` |
| **Data dependencies** | Campaign, AudienceSegment |
| **Workflows** | Workflow 10 (steps 3–5) |
| **Actions** | Create campaign; Edit draft; Schedule; Send now; View results |
| **Error states** | No audience segments (create segment first) |
| **Empty state** | No campaigns → "Create your first campaign" CTA |

---

## S-20: Admin User Management

| Field | Value |
|---|---|
| **Routes** | `/admin/users`, `/admin/users/:id` |
| **Purpose** | View, create, and manage user accounts and role assignments |
| **Primary users** | tenant_admin |
| **Required permissions** | `user:read`, `user:write`, `user:delete`, `role:assign`, `role:revoke` |
| **API dependencies** | `GET /v1/users`, `GET /v1/users/:id`, `PATCH /v1/users/:id`, `GET /v1/rbac/users/:id/roles`, `POST /v1/rbac/roles/assign`, `DELETE /v1/rbac/roles/revoke` |
| **Workflows** | Workflow 1 (user management post-onboarding) |
| **Actions** | Invite user; Edit user; Deactivate user; Assign role; Revoke role |
| **Error states** | Cannot deactivate own account |
| **Empty state** | No users → only the logged-in admin (shouldn't occur) |

---

## S-21: Admin Role Management

| Field | Value |
|---|---|
| **Routes** | `/admin/roles`, `/admin/roles/new`, `/admin/roles/:id` |
| **Purpose** | View system roles and create/edit custom roles |
| **Primary users** | tenant_admin |
| **Required permissions** | `role:read`, `role:write` |
| **API dependencies** | `GET /v1/roles`, `POST /v1/roles`, `PATCH /v1/roles/:id`, `GET /v1/permissions` |
| **Workflows** | Workflow 1 (role setup) |
| **Actions** | View 8 system roles (read-only for system roles); Create custom role; Edit custom role; Delete custom role |
| **Special behavior** | System roles (`isSystem: true`) — show permission list but disable editing |
| **Roles displayed** | 8 system roles (ROD-11 confirmed) + any custom roles |

---

## S-22: Audit Log

| Field | Value |
|---|---|
| **Route** | `/admin/audit` |
| **Purpose** | View all platform audit events |
| **Primary users** | tenant_admin, finance, support |
| **Required permissions** | `audit:read` |
| **API dependencies** | `GET /v1/audit-logs` (filterable by actor, eventType, dateRange) |
| **Data dependencies** | AuditLog entity (from `services/audit`) |
| **Actions** | Filter by actor, event type, date range; Paginate; Export |
| **Empty state** | No audit events (unlikely — events start on first login) |
| **Loading state** | Table row skeletons |

---

## S-23: My Registrations (Attendee)

| Field | Value |
|---|---|
| **Route** | `/my/registrations` |
| **Purpose** | Attendee's personal registration history |
| **Primary users** | attendee |
| **Required permissions** | None (authenticated, own data) |
| **API dependencies** | `GET /v1/registrations?userId=me` |
| **Workflows** | Workflow 8 (attendee view) |
| **Actions** | View registration status; Navigate to event; Navigate to tickets |
| **Empty state** | No registrations → "Browse events" CTA |

---

## S-24: My Tickets (Attendee)

| Field | Value |
|---|---|
| **Route** | `/my/tickets` |
| **Purpose** | Attendee's tickets with QR codes for check-in |
| **Primary users** | attendee |
| **Required permissions** | None (authenticated, own data) |
| **API dependencies** | `GET /v1/tickets?userId=me` |
| **Data dependencies** | Ticket, TicketEntitlement |
| **Workflows** | Workflow 6 (completion); Workflow 9 (attendee provides QR) |
| **Actions** | View QR code (fullscreen); Download ticket PDF |
| **Empty state** | No tickets → "Purchase tickets" CTA |

---

## S-25: Networking

| Field | Value |
|---|---|
| **Routes** | `/network`, `/network/requests`, `/attendees` |
| **Purpose** | Attendee connection management and discovery |
| **Primary users** | All authenticated |
| **Required permissions** | None (authenticated) |
| **API dependencies** | `GET /v1/connections?userId=me`, `POST /v1/connections` (request), `PATCH /v1/connections/:id` (accept/decline), `GET /v1/attendees?public=true` |
| **Data dependencies** | AttendeeConnection |
| **Actions** | Request connection; Accept; Decline; Browse attendee directory; Search attendees |
| **Empty state** | No connections → "Browse attendees" CTA |

---

## S-26: Global Search

| Field | Value |
|---|---|
| **Route** | `/search` |
| **Purpose** | Cross-entity search for events, sessions, speakers, attendees |
| **Primary users** | All authenticated |
| **Required permissions** | None (authenticated) |
| **API dependencies** | `GET /v1/search?q=` |
| **Data dependencies** | SearchDocument (Postgres ILIKE + JSONB) |
| **Actions** | Enter query; Select result type filter (events/sessions/speakers/attendees); Navigate to result |
| **Error states** | No results → "No results for '...' " |
| **Loading state** | Result skeleton |
| **Note** | Semantic AI search degrades gracefully to full-text (ROD-10 pending) |

---

## S-27: Webhook Integration Management

| Field | Value |
|---|---|
| **Routes** | `/integrations`, `/integrations/new`, `/integrations/:id` |
| **Purpose** | Manage outbound webhook subscriptions for external systems |
| **Primary users** | tenant_admin |
| **Required permissions** | `integration:manage` |
| **API dependencies** | `GET /v1/webhooks`, `POST /v1/webhooks`, `DELETE /v1/webhooks/:id` |
| **Data dependencies** | WebhookSubscription |
| **Actions** | Create webhook (name, URL, event types, secret); Delete webhook; Test webhook |
| **Form validation** | URL must be valid HTTPS; Secret must be ≥16 chars (GAP-B8 fixed) |
| **Empty state** | No webhooks → "Connect an external system" CTA |

---

## S-28: SSO Configuration

| Field | Value |
|---|---|
| **Routes** | `/admin/sso`, `/admin/sso/new`, `/admin/sso/:id` |
| **Purpose** | Configure OAuth2/SAML identity provider connections |
| **Primary users** | tenant_admin |
| **Required permissions** | `sso:manage` |
| **API dependencies** | `GET /v1/sso-connections`, `POST /v1/sso-connections`, `DELETE /v1/sso-connections/:id` |
| **Data dependencies** | SsoConnection, SsoIdentity |
| **Actions** | Add SAML/OAuth2 provider; Test connection; Delete connection |
| **Empty state** | No SSO configured → "Add Identity Provider" CTA |
| **Note** | SSO signature verification is deferred (GAP-G6). UX works; security hardening pre-production. |

---

## Screen Summary

| ID | Screen | Route Pattern | Roles |
|---|---|---|---|
| S-01 | Login | `/login` | Public |
| S-02 | Register | `/register` | Public |
| S-03 | Forgot/Reset Password | `/forgot-password`, `/reset-password` | Public |
| S-04 | SSO Callback | `/sso/callback` | Public |
| S-05 | Public Event Registration | `/events/:id/register` | Public/Auth |
| S-06 | Checkout | `/events/:id/checkout` | Public/Auth |
| S-07 | Dashboard | `/dashboard` | All auth |
| S-08 | Event List | `/events` | admin, organizer |
| S-09 | Event Overview | `/events/:id` | admin, organizer |
| S-10 | Create/Edit Event | `/events/new`, `/events/:id/edit` | admin, organizer |
| S-11 | Event Settings | `/events/:id/settings` | admin, organizer |
| S-12 | Agenda Builder | `/events/:id/agenda` | admin, organizer |
| S-13 | Session Detail | `/events/:id/sessions/:sessionId` | admin, organizer, speaker |
| S-14 | Registration List | `/events/:id/registrations` | admin, organizer, support |
| S-15 | Registration Detail | `/events/:id/registrations/:id` | admin, organizer, support |
| S-16 | Check-in Station | `/events/:id/onsite/checkin` | admin, organizer, onsite_staff |
| S-17 | Onsite Dashboard | `/events/:id/onsite` | admin, organizer, onsite_staff |
| S-18 | Analytics | `/analytics`, `/events/:id/analytics` | admin, organizer, finance, support |
| S-19 | Campaign Management | `/campaigns`, `/campaigns/:id` | admin, organizer |
| S-20 | Admin Users | `/admin/users`, `/admin/users/:id` | admin |
| S-21 | Admin Roles | `/admin/roles`, `/admin/roles/:id` | admin |
| S-22 | Audit Log | `/admin/audit` | admin, finance, support |
| S-23 | My Registrations | `/my/registrations` | attendee |
| S-24 | My Tickets | `/my/tickets` | attendee |
| S-25 | Networking | `/network`, `/attendees` | All auth |
| S-26 | Search | `/search` | All auth |
| S-27 | Webhook Integrations | `/integrations` | admin |
| S-28 | SSO Configuration | `/admin/sso` | admin |
