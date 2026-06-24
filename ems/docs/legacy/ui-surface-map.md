# UI Surface Map

> Source: V2 DOCS Phase 4 Prompt 10 — ui surface map, expanded with V1 "Complete
> Structure" route maps (Packet 0 design prompts) for full route coverage. All
> routes live under `apps/web` (Next.js App Router). Drives `docs/ui/design-system.md`
> and `services/ui-renderer/spec.md`.

## 1. Platform Admin
| Route | Purpose | Read models / services |
|---|---|---|
| `/admin/tenants` | list/create/suspend tenants | tenant |
| `/admin/tenants/[id]` | tenant detail, settings, users | tenant, auth, rbac |
| `/admin/audit` | cross-tenant audit log viewer | audit |

## 2. Organizer
| Route | Purpose | Read models / services |
|---|---|---|
| `/events` | list/create events | event |
| `/events/[id]/dashboard` | event KPIs | Event Dashboard read model |
| `/events/[id]/settings` | event details, venue, status transitions | event |
| `/events/[id]/agenda` | tracks/sessions builder | Agenda Planner read model, agenda |
| `/events/[id]/speakers` | speaker directory + assignment | speaker |
| `/events/[id]/exhibitors` | exhibitors, booths, sponsor packages | exhibitor |
| `/events/[id]/registrations` | registration list | registration |
| `/events/[id]/registrations/approvals` | approval queue | Registration Approvals read model |
| `/events/[id]/attendees` | attendee directory | attendee, search |
| `/events/[id]/attendees/[attendeeId]` | attendee 360 view | Attendee Profile read model |
| `/events/[id]/campaigns` | campaign builder | engagement |
| `/events/dashboard` | tenant-wide analytics | Analytics Dashboard read model |

## 3. Finance
| Route | Purpose | Read models / services |
|---|---|---|
| `/ticketing/events/[id]/orders` | order list | order |
| `/ticketing/events/[id]/orders/[orderId]` | order detail | Order Detail read model |
| `/ticketing/events/[id]/payments` | payment ledger | Payment Ledger read model |
| `/ticketing/events/[id]/refunds` | refund initiation | payment |
| `/ticketing/events/[id]/analytics` | sales summary | Ticket Sales Summary read model |
| `/ticketing/events/[id]/inventory` | inventory status | Inventory Status read model |
| `/ticketing/dashboard` | tenant-wide commerce KPIs | Analytics Dashboard read model |

## 4. Support
| Route | Purpose | Read models / services |
|---|---|---|
| `/support/attendees/[attendeeId]` | cross-event attendee lookup | Attendee Profile read model |
| `/support/audit` | tenant-scoped audit log | audit |

## 5. Exhibitor
| Route | Purpose | Read models / services |
|---|---|---|
| `/events/[id]/exhibitors/[exhibitorId]/booth` | booth details | exhibitor |
| `/events/[id]/exhibitors/[exhibitorId]/leads` | captured leads | exhibitor (Lead) |
| `/events/[id]/exhibitors/[exhibitorId]/sponsor` | sponsor package details | exhibitor (Sponsor/SponsorPackage) |

## 6. Speaker
| Route | Purpose | Read models / services |
|---|---|---|
| `/events/[id]/speakers/[speakerId]/profile` | manage own profile | speaker |
| `/events/[id]/speakers/[speakerId]/sessions` | assigned sessions | speaker, agenda |

## 7. Onsite Staff
| Route | Purpose | Read models / services |
|---|---|---|
| `/events/[id]/onsite/scan` | check-in / badge scan UI | onsite |
| `/events/[id]/onsite/console` | live check-in console | Check-in Console read model |
| `/events/[id]/onsite/sessions/[sessionId]/scan` | session attendance scan | onsite |

## 8. Attendee (public + account)
| Route | Purpose | Read models / services |
|---|---|---|
| `/events/public/[eventId]` | public event page | event, search |
| `/events/public/[eventId]/agenda` | public agenda | agenda, search |
| `/events/public/[eventId]/register` | registration form | registration |
| `/ticketing/public/[eventId]/checkout` | ticket purchase / cart / checkout | ticketing, pricing, inventory, order, payment |
| `/events/account` | "my events" | attendee, registration |
| `/events/account/[eventId]/agenda` | personal agenda | agenda, Session Attendance |
| `/events/account/[eventId]/networking` | connections, matchmaking | networking, ai-service |
| `/events/account/[eventId]/sessions/[sessionId]` | session detail incl. polls/Q&A | interactive-engagement |
| `/ticketing/account/orders` | order history | Order Detail read model |
| `/ticketing/account/tickets` | my tickets (QR codes) | ticketing |

## Cross-Cutting UI Elements (all personas)
- Global nav adapts to active role (RBAC-driven, see `security-model.md` §2).
- Notification center (toast + inbox) sourced from `notification`.
- Tenant branding (logo, colors) sourced from `TenantSettings` via design tokens
  (`docs/ui/design-system.md`).
