Status: FROZEN
Authority Level: Critical
Freeze Date: 2026-06-20
Owner: AI
Phase: L0 — Pre-Design Input Freeze

# L0 Claude Design Brief

> This is the complete brief for Claude Design to begin Phase E archetype work.
> Claude Design must read this document and the constraints in
> L0_DESIGN_CONSTRAINTS_FOR_CLAUDE_DESIGN.md before producing any artifact.
> The brief provides enough context to make design judgments independently.

---

## 1. What Is EMS?

EMS (Event Management System) is a multi-tenant SaaS platform for professional event management.
A single platform instance hosts multiple organizations (tenants), each managing their own events.

**What the product does**:
- Lets organizers create and manage events (conferences, seminars, expos, workshops)
- Lets attendees discover events, register, purchase tickets, and check in onsite
- Lets exhibitors manage their booth presence and capture leads
- Lets speakers manage their sessions and engage with content
- Sends marketing campaigns (email) and provides event analytics
- Manages onsite check-in and badge printing on event day

**Scale target**: Enterprise event management. Not a consumer ticketing app. Not a social platform.

**Primary commercial scenario**: A company runs a conference. They use EMS as their backend and branded web app to manage the entire event lifecycle — from creation to post-event analytics.

---

## 2. The Role Landscape

There are 8 roles. Each role has a distinct user persona and expects a fundamentally different experience:

| Role | Who they are | What they care about |
|---|---|---|
| `tenant_admin` | IT or ops admin who set up the platform | Platform health, user management, security settings, high-level analytics |
| `organizer` | The event manager who runs everything | Creating events, managing the agenda, registrations, campaigns, tickets |
| `finance` | Accountant or finance manager | Revenue, orders, refunds, audit trail |
| `support` | Help desk agent | Finding attendees, resolving registration issues |
| `exhibitor` | Company that bought a booth | Their booth info, their leads, networking |
| `speaker` | Conference speaker | Their sessions, their schedule |
| `onsite_staff` | Staff on event day | Check-in speed, badge printing, real-time headcount |
| `attendee` | Ticket holder | Their tickets, their schedule, connecting with other attendees |

**Design implication**: The same URL `/dashboard` renders 6 completely different experiences. The app shell must detect role on load and render the appropriate variant.

---

## 3. The Product Architecture

- **Backend**: NestJS 10 monolith, 26 service modules, single Postgres database (schema-per-service)
- **Events**: Kafka with 64 topics (background processing; not visible to frontend)
- **Frontend**: Next.js (React) application (`apps/web`)
- **API**: REST, `/v1/` prefix, Bearer JWT auth
- **Auth**: Email/password + optional SSO (OAuth2/SAML)
- **Notifications**: Email only (SMTP, Nodemailer); no SMS, no push
- **Search**: Postgres full-text (ILIKE); AI semantic search coming (ROD-10)
- **Real-time**: HTTP polling at 30-second intervals; no WebSocket in Phase E

---

## 4. Design Priority Order

Not all screens are equal. Prioritize archetypes in this order:

### Tier 1 — Critical Path (design first)

These screens are in every user's path. A flawed design here affects all roles.

1. **S-01 Login** — entry point for all users
2. **S-07 Dashboard** — role-adaptive home; 6+ variants
3. **App Shell** — sidebar navigation; role-based visibility; context-sensitive event nav

### Tier 2 — Core Organizer Experience

The primary monetization use case. Organizers are the paying customer.

4. **S-08 Event List** + **S-09 Event Overview** — the event management hub
5. **S-10 Create/Edit Event** — the most frequent organizer action
6. **S-14 Registration List** + **S-15 Registration Detail** — daily work for organizers/support
7. **S-19 Campaign Management** — pre-event marketing
8. **S-18 Analytics Dashboard** (D-01 organizer + D-07 event) — performance tracking

### Tier 3 — Commerce Chain

The revenue-generating flow. Must be frictionless.

9. **S-05 Public Event Registration** — public-facing; no auth required
10. **S-06 Checkout** — ticket purchase; includes placeholder payment form (GAP-FE7-A)
11. **S-23 My Registrations** + **S-24 My Tickets** — attendee self-service

### Tier 4 — Event Day Operations

High-frequency, high-pressure, tablet-optimized.

12. **S-16 Check-in Station** — tablet-first; must be visually dominant and touch-optimized
13. **S-17 Onsite Dashboard** — live event day status

### Tier 5 — Platform Administration

Complex but low-frequency.

14. **S-20 Admin Users** + **S-21 Admin Roles** — user and role management
15. **S-22 Audit Log** — filtered log viewer
16. **S-28 SSO Configuration** — includes production warning banner (GAP-FE9)

### Tier 6 — Remaining Screens

All remaining screens (S-02, S-03, S-04, S-11, S-12, S-13, S-25, S-26, S-27, exhibitor/speaker views).

---

## 5. Key Design Challenges

### 5.1 Role-Adaptive Dashboard (S-07)

The dashboard route `/dashboard` serves 6 role variants (organizer, finance, support, admin, attendee, plus exhibitor/speaker as simplified sub-variants). Claude Design must create a design system that supports role-adaptive content without the shell layout changing per role.

**Approach**: Same shell; different widget sets. Widget composition varies by role. The dashboard discovers role on load, then renders the appropriate widget grid.

### 5.2 Event-Scoped Context Navigation

When a user navigates into an event context (`/events/:id/*`), a secondary contextual navigation appears. This must not disrupt the primary navigation or require a full page layout change.

**Approach**: Design a collapsible secondary nav panel (or breadcrumb + tab strip) that appears contextually when in event scope. The primary sidebar stays; the secondary nav adds depth.

### 5.3 Check-in Station (S-16) — Tablet First

S-16 is used by onsite_staff on dedicated tablets during high-volume check-in. The design must be:
- Touch-first (48px minimum tap targets)
- Visually dominant "Check In" action
- Fast search: search-as-you-type with immediate results
- Large success state (full-screen or near-full-screen green confirmation)
- Minimal cognitive load (staff are handling high-throughput check-in)

### 5.4 Commerce Chain UX (W-6)

The checkout flow spans multiple API calls with a Kafka-backed processing chain:
1. Select tickets → 2. Apply promo → 3. Payment form (placeholder in Phase E) → 4. Submit order → 5. Poll for fulfillment → 6. Show QR

**Design must include**: A processing/loading state between order submission and fulfillment confirmation. The QR code must only appear after `status === 'fulfilled'`. Skeleton or spinner for the polling wait.

### 5.5 Graceful Degradation Screens

Three screens require designed degradation states in Phase E:
- S-11: "Settings not yet configured" empty state (plus the full settings form for when OCR-5 ships)
- S-26: Full-text search results with no AI label; "AI-powered" UI copy added later
- S-28: Production warning banner (SSO signature verification pending)

### 5.6 Permission Enforcement in UI

Two patterns must be designed:
- **Hide section**: User's role never has access (hide nav item entirely)
- **Disable action**: User is in the right section but lacks write permission (show button as disabled)
- **Inline 403**: API returned 403 on an action the user attempted

Design the disabled/403 state for all action buttons — they must never just silently fail.

---

## 6. Required Archetype Outputs

Claude Design should produce the following archetypal layouts and patterns before
screen-specific designs:

### 6.1 App Shell Archetype

- Desktop layout: fixed left sidebar (collapsed/expanded), top header, content area
- Sidebar contents: 18 primary navigation sections, role-visibility applied
- Contextual event navigation: secondary nav that appears when in event scope
- Header: tenant name, current user, role badge, notification bell, profile menu
- Mobile/tablet: collapsible sidebar (hamburger menu)

### 6.2 List Page Archetype

Used by: S-08, S-14, S-19, S-20, S-21, S-22, S-25, and all event-scoped list pages.

- Anatomy: page header + create button + filter bar + search input + data table + pagination
- Table row: data cells + status badge + action menu (or action buttons)
- Empty state: centered illustration + message + primary CTA
- Loading state: 5–8 skeleton rows

### 6.3 Detail Page Archetype

Used by: S-09, S-13, S-15, S-27, S-28 and most single-entity views.

- Anatomy: breadcrumb + entity header (name + status badge + action buttons) + tab sections
- Each tab: section-specific content
- Action buttons: primary (save/submit) + secondary (cancel/back) + destructive (delete/cancel event)
- Loading state: full-page skeleton matching the final layout

### 6.4 Form Page Archetype

Used by: S-10, S-05 (public), create screens for all entities.

- Anatomy: page title + form sections + field labels + inputs + validation messages + footer buttons
- Footer: "Save" (primary) + "Cancel" (secondary)
- Inline validation: real-time where possible; submit-time where not
- Loading state: form skeleton

### 6.5 Dashboard / Analytics Archetype

Used by: S-07 (all variants), S-17, S-18, D-01 through D-07.

- Anatomy: page header + KPI card row + chart/widget grid + activity feed
- KPI card: metric value + label + trend indicator (up/down/neutral)
- Chart types: line chart (trends), bar chart (comparisons), gauge (rates, 0–100%)
- Activity feed: timestamped list of recent events

### 6.6 Role-Adaptive Dashboard Variants

For each dashboard variant, produce a widget grid specification:
- D-01 Organizer: active events, registrations, revenue MTD, upcoming events, recent registrations, pending approvals
- D-02 Finance: revenue MTD, orders, refunds, revenue by event chart, ticket sales breakdown
- D-03 Onsite: check-in rate gauge, checked-in count, badge print count, live check-in feed
- D-04 Support: pending registrations alert, registrations today, attendee search, recent submitted
- D-05 Admin: active events, user count, platform revenue, recent audit events, registered users trend
- D-06 Attendee Hub: upcoming events, my tickets, connection requests, active polls

### 6.7 Check-in Station Archetype (Tablet-First)

- Full-width search bar at top (autofocused)
- Search results below: attendee name, registration status, event name
- Selected attendee: large card with photo/initials, name, registration status
- Primary CTA: large "Check In" button (minimum 48px height, full-width on mobile)
- Success state: full-height green panel with "Checked In!", attendee name, print badge option
- Error state: "Already checked in" with timestamp, or "Registration not confirmed"

### 6.8 Empty States (Per Screen)

See Section 9 of L0_FRONTEND_AUTHORITY_INPUT_FREEZE.md for the approved empty state copy for every screen. Claude Design should create a visual template for empty states that fits the approved copy.

---

## 7. What Claude Design Must NOT Do

- Do not design any screen that is not in the approved 28 screen types
- Do not add navigation sections beyond the 18 approved
- Do not reference or design an Engagement section or engagement screens
- Do not design a payment form with real card fields (placeholder only in Phase E)
- Do not design AI search result cards that imply AI is active (not yet)
- Do not design WebSocket-powered live feeds — use polling state pattern
- Do not design role management for non-admin users (S-21 is tenant_admin only)
- Do not include regional payment options (JazzCash, Easypaisa)
- Do not design mobile-native layouts (web-responsive is sufficient; mobile is OOS)

---

## 8. Authority Documents for Deep Reference

If Claude Design needs more detail on any specific screen, load:

| Need | Document |
|---|---|
| Full screen spec for any screen | `docs/03_frontend_authority/FRONTEND_SCREEN_CATALOG.md` |
| Full dashboard widget specs | `docs/03_frontend_authority/FRONTEND_DASHBOARD_CATALOG.md` |
| Which APIs each screen calls | `docs/03_frontend_authority/FRONTEND_API_DEPENDENCY_MAP.md` |
| Step-by-step workflow UI paths | `docs/03_frontend_authority/FRONTEND_WORKFLOW_TO_SCREEN_MAP.md` |
| Navigation tree and role visibility | `docs/03_frontend_authority/FRONTEND_NAVIGATION_MODEL.md` |
| Per-role complete experience | `docs/03_frontend_authority/FRONTEND_ROLE_EXPERIENCE_MATRIX.md` |
| Permission → UI element mapping | `docs/03_frontend_authority/FRONTEND_PERMISSION_MATRIX.md` |
| All 91 routes with blocking conditions | `docs/03_frontend_authority/FRONTEND_ROUTE_CATALOG.md` |
| Frontend gap mitigations | `docs/03_frontend_authority/FRONTEND_GAP_REGISTER.md` |

---

## 9. Summary: What Success Looks Like

At the end of Phase E archetype work, Claude Design will have produced:

1. App shell archetype (desktop, tablet, contextual event nav)
2. Core page archetypes (list, detail, form, dashboard)
3. Role-adaptive dashboard variants (D-01 through D-06)
4. Check-in station archetype (tablet-first)
5. Empty states for all 28 screen types
6. Loading/skeleton states for all archetype types
7. Error and 403 states
8. Status badge system (events, registrations, orders)
9. Commerce chain UX pattern (checkout + polling + fulfillment)
10. Graceful degradation states (S-11 OCR-5, S-26 search, S-28 SSO warning)

**These archetypes become the design system that individual screen designs are derived from.**
A screen that follows the archetype correctly can be validated by Claude Code without additional clarification.

---

## 10. Brief Sign-Off

| Criterion | Status |
|---|---|
| Backend fully verified | ✅ 26 services code-verified 2026-06-17 |
| All routes documented | ✅ 91 routes frozen |
| All screens documented | ✅ 28 screen types frozen |
| All workflows documented | ✅ 10 workflows frozen |
| All roles confirmed | ✅ 8 roles from code |
| All permissions defined | ✅ 23 permissions frozen |
| Owner decisions pending | ✅ 0 |
| Frontend blockers | ✅ 0 |
| Design constraints issued | ✅ L0_DESIGN_CONSTRAINTS_FOR_CLAUDE_DESIGN.md |
| Route-screen-workflow matrix | ✅ L0_ROUTE_SCREEN_WORKFLOW_MATRIX.md |
| Freeze certificate issued | ✅ L0_FRONTEND_AUTHORITY_INPUT_FREEZE.md |

**L0 FROZEN. Claude Design may begin archetype work.**

Issued: 2026-06-20
By: AI (Phase 3.5 — L0 Frontend Authority Input Freeze)
