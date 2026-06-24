Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-17
Owner: AI

# Frontend Authority Master

> Phase 3 — Frontend Authority Capture. Executed 2026-06-17.
> This document is the primary reference for any AI session beginning
> frontend implementation. Load this first, then load the relevant
> sub-document for the area being implemented.
> 
> All content is derived from verified backend reality (code-verified 2026-06-17).
> No invented screens, routes, workflows, or navigation.

---

## Governing Principle

**The backend is the source of truth. The frontend represents backend reality.**

Every screen in this authority set:
- Maps to at least one verified backend API endpoint
- Is gated by a real implemented service
- Supports at least one of the 10 verified product workflows
- Is accessible to at least one of the 8 authoritative roles

---

## System Overview

| Dimension | Value |
|---|---|
| Backend services | 26 (all implemented) |
| Kafka topics | 64 (all verified) |
| Product workflows | 10 (all verified) |
| Roles | 8 (from rbac.service.ts) |
| Permissions | 23 (12 governance + 11 domain — OCR-2) |
| Frontend routes | 91 |
| Screen types | 28 |
| Dashboard types | 7 |
| Reusable components | ~100 |
| Frontend gaps | 10 (0 absolute blockers) |

---

## Document Index

| Document | Purpose | Load when... |
|---|---|---|
| **This document** | Master reference and entry point | Starting any frontend session |
| `FRONTEND_NAVIGATION_MODEL.md` | Full navigation tree and role-based visibility | Designing app shell, sidebar, menus |
| `FRONTEND_PERMISSION_MATRIX.md` | All 23 permissions and their UI impact | Implementing permission guards and role-gated UI |
| `FRONTEND_ROLE_EXPERIENCE_MATRIX.md` | Per-role complete experience definition | Implementing role-adaptive UI, dashboards |
| `FRONTEND_ROUTE_CATALOG.md` | All 91 routes with permissions, APIs, blocking conditions | Implementing routing, auth guards, navigation |
| `FRONTEND_WORKFLOW_TO_SCREEN_MAP.md` | 10 workflows → UI step-by-step paths | Implementing a specific user journey |
| `FRONTEND_SCREEN_CATALOG.md` | Full Screen Authority Model for all 28 screen types | Implementing any specific screen |
| `FRONTEND_DASHBOARD_CATALOG.md` | All 7 dashboards with widgets, KPIs, data sources | Implementing dashboard screens |
| `FRONTEND_API_DEPENDENCY_MAP.md` | Screen → API → Entity → Service traceability | Implementing API integration for a screen |
| `FRONTEND_COMPONENT_INVENTORY.md` | ~100 component definitions and purposes | Planning component library, implementing components |
| `FRONTEND_GAP_REGISTER.md` | 10 frontend gaps with mitigation strategies | Encountering a missing API or unresolved dependency |
| `FRONTEND_AUTHORITY_READINESS_REPORT.md` | Final readiness assessment and verdict | Verifying Phase 3 completion |

---

## Quick Reference: Role Access Summary

| Role | Primary section | Home screen | Max permissions |
|---|---|---|---|
| `tenant_admin` | Platform Admin + everything | `/dashboard` (admin) | All 23 |
| `organizer` | Events + all management | `/dashboard` (organizer) | 11 domain |
| `finance` | Commerce + Analytics | `/analytics` | commerce, analytics, audit |
| `support` | Attendees + Registrations | `/events/:id/registrations` | attendee, registration, analytics, audit |
| `exhibitor` | Exhibitor portal | `/exhibitors` | exhibitor (own) |
| `speaker` | My Sessions | `/my/sessions` | None (authenticated routes) |
| `onsite_staff` | Check-in Station | `/events/:id/onsite/checkin` | onsite:operate, attendee:manage |
| `attendee` | Attendee Hub | `/dashboard` (attendee) | None (authenticated routes) |

---

## Quick Reference: Key Frontend Rules

### Auth
- Do NOT read `permissions` from JWT — it is always `[]`
- After login: call `GET /v1/rbac/users/me/roles` to get role names
- Derive section visibility from role names
- On 401: redirect to `/login`; on 403: show inline "Permission denied" state

### API
- All APIs: `Authorization: Bearer {jwt}` header
- All APIs: `/v1/` prefix
- Successful responses: `{ data: T, meta: { page?, limit?, total? } }`
- Error responses: `{ error: { code, message, details }, meta }`
- Pagination: `?page=N&limit=N`
- Idempotency: `POST /v1/orders` MUST include `Idempotency-Key: {uuid}` header

### Navigation
- 18 primary sections (see FRONTEND_NAVIGATION_MODEL.md)
- No "Engagement" section — engagement module removed (ROD-1/OCR-1)
- Campaign management is under "Campaigns" (backed by notification service)
- Event-scoped navigation appears as contextual secondary nav when in `/events/:id/*` context

### Permissions (pending OCR-2)
- Use `RoleGuard` until OCR-2 is confirmed
- `PermissionGate` is the target pattern — switchover is component-level, not screen-level
- System roles have `isSystem: true` — show as read-only in role management

### Graceful Degradation Required
- S-11 (EventSettings): "Not yet configured" empty state (OCR-5 pending)
- S-26 (Search): Full-text fallback when semantic search returns no results (ROD-10 pending)
- S-04/S-28 (SSO): Warning banner "Not recommended for production" (GAP-G6)

---

## Quick Reference: Commerce Chain (Critical for Checkout UI)

The verified event sequence that drives checkout UI state:

```
POST /v1/orders
  → payment.completed (Kafka)
    → order service: order.paid (Kafka)
      → fulfillment service: fulfillment.completed (Kafka)
        → ticketing: ticket.issued (Kafka)
          → notification: ticket issued email
```

**Frontend implication**: After `POST /v1/orders` succeeds, the frontend must poll `GET /v1/orders/:id` until `status === 'fulfilled'` (or listen via WebSocket if implemented). The ticket QR code is available after `ticket.issued` is processed.

---

## Quick Reference: Event Status Machine

```
draft → published → live → archived
draft → cancelled
published → cancelled
```

UI transition actions (all on S-09 Event Overview):
- `POST /v1/events/:id/publish` → moves draft → published
- `POST /v1/events/:id/go-live` → moves published → live
- `POST /v1/events/:id/archive` → moves live → archived
- `POST /v1/events/:id/cancel` → moves draft/published → cancelled

---

## Quick Reference: Registration Status Machine

```
submitted → approved → confirmed
submitted → waitlisted
any → cancelled
```

UI transition actions (on S-15 Registration Detail):
- `POST /v1/registrations/:id/approve` → approved
- `POST /v1/registrations/:id/confirm` → confirmed (or auto on approval if requiresApproval=false)
- `POST /v1/registrations/:id/waitlist` → waitlisted
- `POST /v1/registrations/:id/cancel` → cancelled

---

## Pending Backend Items Affecting Frontend

| Item | Impact | Mitigation |
|---|---|---|
| OCR-1: Remove EngagementModule | Confirms campaign routing | Build campaigns under `/campaigns` now |
| OCR-2: 23 permissions applied | Enables PermissionGate | Use RoleGuard in the interim |
| OCR-5: EventSettings entity | Enables S-11 | Build with graceful degradation |
| ROD-10: Real embedding API | Enables full AI search | Build with full-text fallback |
| GAP-FE7: Payment gateway unknown | Affects S-06 payment form | Document required: which gateway? |
