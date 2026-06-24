Status: FROZEN
Authority Level: Critical
Freeze Date: 2026-06-20
Owner: AI
Phase: L0 — Pre-Design Input Freeze

# L0 Design Constraints for Claude Design

> These constraints are non-negotiable and must be applied to every archetype,
> mockup, component, layout, and design decision produced during Phase E.
> Claude Design MUST load this file before producing any output.
> Claude Code MUST validate every design deliverable against these constraints.

---

## Constraint Class A: Scope Constraints (ABSOLUTE — no exceptions)

### A-1: No Invented Routes

All routes are frozen at 91 routes in L0_FRONTEND_AUTHORITY_INPUT_FREEZE.md.
Claude Design MUST NOT introduce any new route, path parameter, or URL structure.
If a design seems to require a new route, flag it as a scope violation — do not create it.

### A-2: No Invented Screens

All screen types are frozen at 28 in L0_FRONTEND_AUTHORITY_INPUT_FREEZE.md.
Claude Design MUST NOT design a screen that is not in the approved list.
Variations of the same screen type (e.g., S-07 with different role content) are permitted.
A brand-new screen type is not permitted.

### A-3: No Invented Workflows

All workflows are frozen at 10. Claude Design must not introduce new user journeys
that are not derived from the 10 approved workflows.

### A-4: No Invented Roles

The 8 authoritative roles are frozen. Claude Design must not reference any other role name
(not `admin`, not `event_manager`, not `platform_admin` — only the 8 frozen roles).

### A-5: No Invented Permissions

The 23-permission taxonomy is frozen. Claude Design must not reference permission
names other than the 23 in L0_FRONTEND_AUTHORITY_INPUT_FREEZE.md Section 2.

### A-6: No Invented APIs

All API dependencies are frozen. Claude Design must not assume new API endpoints.
If a design needs data that is not in the approved API list, flag it — do not invent an endpoint.

### A-7: No Engagement Section

There is NO Engagement section, NO engagement dashboard, NO `/engagement/*` routes.
Campaign features are under the Campaigns section (Section 12 of navigation), backed by `notification` service.
This is final and non-negotiable (ROD-1).

---

## Constraint Class B: Auth Constraints (ABSOLUTE)

### B-1: JWT Permission Field Is Always Empty

Do not design any component that reads `permissions` from the JWT.
The JWT `permissions` field is always `[]`.

### B-2: Role Resolution Pattern

After login: the app must call `GET /v1/rbac/users/me/roles` to get the role list.
Design the app shell to support this async role-resolution step before rendering navigation.
Loading state: show full skeleton until roles are resolved.

### B-3: 401 Handler

On any API 401 response: redirect to `/login` preserving the original URL as `?next=`.

### B-4: 403 Handler

On any API 403 response: show an inline "You don't have permission" state within the content area.
Do NOT redirect to login on 403.
Do NOT blank the entire page on 403 — only the relevant section.

### B-5: Permission Guard Strategy (Phase E)

Use RoleGuard (role-name check) for all permission enforcement in Phase E.
PermissionGate (23-permission checks) is the target model — switchover is per-component
when OCR-2 is confirmed. Do not design screens that require OCR-2 to render at all.

---

## Constraint Class C: Navigation Constraints

### C-1: Navigation Structure Is Frozen

18 primary navigation sections. No new sections. No renamed sections.
See L0_FRONTEND_AUTHORITY_INPUT_FREEZE.md Section 3 for the complete list.

### C-2: Role-Based Visibility Is Frozen

Navigation section visibility by role is defined in FRONTEND_NAVIGATION_MODEL.md.
Claude Design MUST implement role-based visibility exactly as specified.
No section may be shown to a role that is not in the approved matrix.

### C-3: Context-Sensitive Event Navigation

When in any `/events/:id/*` route, display a secondary contextual navigation panel
containing: Overview, Agenda, Speakers, Registration, Ticketing, Orders, Inventory,
Exhibitors, Onsite, Campaigns, Polls & Q&A, Analytics, Settings.
This secondary nav appears inside the app shell, not as a separate layout.

### C-4: Attendee and Speaker Navigation Is Simplified

attendee and speaker roles see a stripped-down navigation.
attendee: Dashboard, My Registrations, My Tickets, Networking, Polls & Q&A, Search.
speaker: Dashboard, My Sessions, Networking, Profile.
Do not show management sections to these roles.

### C-5: Admin Shell

The `/admin` section is exclusively for `tenant_admin`. It may be a visually distinct
sub-shell or a clearly separated area of the main navigation.

---

## Constraint Class D: API Contract Constraints

### D-1: Response Envelope

All API responses: `{ data: T, meta: { page?, limit?, total? } }` (success).
All API errors: `{ error: { code, message, details }, meta }`.
Design all list screens to expect this envelope.

### D-2: Pagination Default

Default pagination: `?page=N&limit=N`.
Exceptions (cursor pagination): `GET /v1/orders` and `GET /v1/notifications` use `nextCursor`.
Design order lists and notification lists with cursor-based "Load More" or infinite scroll.
All other lists use page-number or offset pagination.

### D-3: Idempotency Key on Checkout

`POST /v1/orders` MUST include `Idempotency-Key: {uuid}` header.
The client generates a UUID per checkout attempt.
Design the checkout flow to generate and attach this header — it must not be optional.

### D-4: Commerce Chain Polling

After `POST /v1/orders` succeeds, the checkout screen must poll `GET /v1/orders/:id`
until `status === 'fulfilled'` before showing the success state with QR code.
Design a polling state: "Processing your order..." with progress indicator.

### D-5: No WebSocket in Phase E

There is no WebSocket endpoint. Use HTTP polling at 30-second intervals
for live event-day data (D-03 Onsite Dashboard, S-16 Check-in Station).
Design auto-refresh indicators (e.g., "Last updated 15s ago") for these screens.

---

## Constraint Class E: Screen-Specific Constraints

### E-1: S-06 Checkout — Payment Form Step 3

Step 3 (payment form) is a placeholder in Phase E.
Design it as: disabled card number/expiry/CVC fields + notice: "Payment gateway integration pending".
"Complete Payment" button is disabled in Phase E.
Steps 1, 2, and 4 are fully functional.

### E-2: S-11 Event Settings — Graceful Degradation

EventSettings entity does not yet exist (OCR-5 pending).
Design S-11 with a graceful degradation state: "Settings not yet configured" empty state.
When OCR-5 ships, the empty state is replaced by the actual settings form.
Both states must be designed.

### E-3: S-26 Search — Full-Text Fallback

AI semantic search is pending (ROD-10 implementation).
In Phase E, `GET /v1/search?q=` returns Postgres ILIKE full-text results.
Do not design UI that implies AI results are available yet.
When ROD-10 is implemented, AI-powered indicator can be added.

### E-4: S-28 SSO Configuration — Production Warning

SSO signature verification is deferred (GAP-G6 / OOS-2).
S-28 MUST include a visible warning banner:
"SSO signature verification is pending. Not recommended for production use."
Warning style: yellow/amber banner; dismissible per session; not permanently closeable.

### E-5: S-21 Role Management — System Roles Read-Only

`GET /v1/roles` returns `isSystem: boolean`.
For roles where `isSystem === true`: show read-only view; disable edit/delete controls.
Design both states: editable (custom roles) and read-only (system roles).
System role names to show as read-only: tenant_admin, organizer, finance, support,
exhibitor, speaker, onsite_staff, attendee.

### E-6: S-17 Onsite Dashboard — Live Auto-Refresh

Onsite dashboard auto-refreshes every 30 seconds during an active event.
Design a visible "live" indicator (pulsing dot or countdown timer).
Design a stale-data state for when the refresh fails.

### E-7: S-16 Check-in Station — Optimized for Tablet

Check-in station is the primary screen for `onsite_staff`.
It will often run on a dedicated tablet or kiosk.
Design it for touch-first, large-tap-target interaction.
Minimum tap target: 48×48px for all interactive elements.
Primary action ("Check In" button) must be visually dominant.

---

## Constraint Class F: Commerce Constraints

### F-1: Event Status Badges

Event status transitions: `draft → published → live → archived` (or `→ cancelled`).
All event lists and event headers must show the current status as a color-coded badge:
- draft: gray
- published: blue
- live: green (pulsing for emphasis)
- archived: neutral/muted
- cancelled: red

### F-2: Registration Status Badges

Registration status: `submitted → approved → confirmed | waitlisted | cancelled`.
Registration lists and detail views must use color-coded status badges:
- submitted: yellow
- approved: blue
- confirmed: green
- waitlisted: orange
- cancelled: red

### F-3: Refund Action Gating

"Refund" action on Order Detail is only available when:
1. User has `commerce:manage` permission (organizer, finance, tenant_admin)
2. Order status is `paid` or `fulfilled`
Design the refund button as hidden (not just disabled) for unauthorized roles.

---

## Constraint Class G: Data Display Constraints

### G-1: Currency Display

All monetary values are stored as `amountCents` (integer, cents).
Display: divide by 100 and format with currency symbol.
Default currency: `USD` unless `currency` field specifies otherwise.

### G-2: Dates and Timezones

Events have a `timezone` field (IANA timezone string).
All event dates must be displayed in the event's timezone, not the browser's local timezone.
Show timezone abbreviation alongside all event dates (e.g., "Jun 20, 2026 9:00 AM PKT").

### G-3: Tenant Isolation

The frontend never needs to filter by `tenantId` — the API enforces this via `Authorization` header.
Do not build any client-side tenant filter.

### G-4: Exhibitor Row-Level Scope

The `exhibitor` role sees its own records only. This filtering is enforced entirely by the API.
The frontend shows whatever the API returns — no client-side filtering needed.

---

## Constraint Class H: Excluded Technologies and Patterns

The following must NOT appear in any Phase E design or implementation:

| Excluded item | Reason |
|---|---|
| WebSocket connections | Not implemented; use HTTP polling |
| OpenSearch / Elasticsearch query UI | Postgres ILIKE only |
| File upload / S3 UI | No object storage client in backend |
| SMS / push notification UI | Email-only via SmtpTransport |
| Stripe Elements / PayPal SDK | OUT-OF-SCOPE (GAP-FE7-B) |
| JazzCash / Easypaisa UI | OUT-OF-SCOPE (OOS-6) |
| Tax / GST calculation UI | OUT-OF-SCOPE (OOS-7) |
| Badge printer SDK UI | OUT-OF-SCOPE (OOS-9) |
| QR scanner hardware SDK | OUT-OF-SCOPE (OOS-9) |
| Mobile-native (React Native / Flutter) | OUT-OF-SCOPE (OOS-5) |
| Engagement-specific routes or screens | AUTO-CLOSED (ROD-1) |
| Platform Admin routes for non-tenant_admin roles | Prohibited by role model |

---

## Constraint Class I: Design System Constraints

### I-1: Responsive Design Target

Primary target: desktop web (1280px+ width, sidebar navigation).
Secondary target: tablet (768–1280px, collapsible sidebar).
Mobile (< 768px): not in scope for Phase E except S-16 (check-in — tablet optimized).

### I-2: Loading State Pattern

Every data-driven surface must have a skeleton loading state matching the final layout shape.
Skeleton = gray placeholder blocks in the same dimensions as the real content.
Never show a spinner for full-page loads — use skeletons.
Spinner is acceptable for button actions only (submit, save, delete).

### I-3: Error State Pattern

API errors must be shown inline within the content area, not as modal dialogs.
Error states must include: error message, retry button.
Never show raw error codes or stack traces to end users.

### I-4: Empty State Pattern

Every list screen must have a designed empty state.
Empty states must include: illustration or icon, contextual message, primary CTA.
The CTA must link to the most logical next action (e.g., "Create your first event").

### I-5: Toast / Notification Pattern

Mutation success messages (save, delete, publish, etc.) appear as toast notifications.
Toasts: bottom-right position; auto-dismiss after 4 seconds; manually closeable.
Toasts must NOT block content interaction.

### I-6: Confirmation Dialogs

Destructive actions (delete, cancel event, suspend tenant, refund) require a confirmation dialog.
Dialog: title = "Are you sure?", body = consequence of action, cancel button, confirm button (red).
Keyboard: Escape = cancel; Enter = confirm.

---

## Summary: Phase E Go/No-Go Check

Before any design artifact is produced, verify:

| Check | Status |
|---|---|
| Route count = 91 | ✅ FROZEN |
| Screen count = 28 types | ✅ FROZEN |
| Dashboard count = 7 | ✅ FROZEN |
| Workflow count = 10 | ✅ FROZEN |
| Role count = 8 | ✅ FROZEN |
| Permission count = 23 | ✅ FROZEN |
| No engagement section | ✅ CONFIRMED |
| No new owner decisions pending | ✅ CONFIRMED (0) |
| Frontend-impacting blockers | ✅ 0 ABSOLUTE BLOCKERS |

**Phase E design may proceed. All constraints in this document are active and binding.**
