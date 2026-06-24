> **Status: Retired.** Fully superseded by `docs/00_authority/PROJECT_CHARTER.md`,
> which corrects §4's Campaign/AudienceSegment module placement (these entities
> belong to `notification`, not `engagement` — see GAP-G3/CA-002).

# Product Overview

> Source: V1 Packet 0 Prompt 2 — Product Definition. Relocated (unmodified path) by V2 Phase 1.
> This is the canonical product definition referenced by all build batches.

## 1. Vision

EMS is a multi-tenant SaaS platform that combines two integrated product lines:

1. **Enterprise Event Management** — end-to-end planning and operation of conferences,
   trade shows, and corporate events (agenda, speakers, exhibitors, sponsors, attendees,
   onsite operations, engagement, analytics).
2. **High-Performance Ticketing & Commerce** — ticket inventory, dynamic pricing,
   checkout, payments, fulfillment, and revenue reporting, built to handle
   high-concurrency on-sale events without overselling.

A single tenant can run both product lines against the same event record.

## 2. Users / Personas

| Persona | Description | Primary surfaces |
|---|---|---|
| Platform Admin | Operates the SaaS platform across tenants | `/admin/*` |
| Organizer | Owns/operates events for a tenant | `/events/*`, `/ticketing/*` dashboards |
| Finance | Reviews orders, payments, refunds, revenue | `/ticketing/events/[id]/{orders,payments,refunds,analytics}` |
| Support | Assists attendees/organizers, views audit trail | read access across tenant data + `AuditLog` |
| Exhibitor | Manages booth, leads, sponsor package | `/events/[id]/exhibitors`, `/events/[id]/leads` |
| Speaker | Manages profile and assigned sessions | `/events/[id]/speakers`, session detail |
| Onsite Staff | Runs check-in, badge printing, session scanning | `/events/[id]/onsite/*` |
| Attendee | Registers, buys tickets, attends, networks | `/events/public/*`, `/events/account/*`, `/ticketing/account/*` |

Full surface-by-persona detail: `docs/canon/ui-surface-map.md`.

## 3. Event Lifecycle

```
draft -> published -> live -> archived
            \-> cancelled (from draft or published)
```

- **draft**: organizer configures event, venue, agenda, tickets — not visible publicly.
- **published**: public registration/ticket sales open (`/events/public/[eventId]`).
- **live**: event is running — onsite check-in, session attendance, real-time analytics active.
- **archived**: event ended — read-only, retained for reporting.
- **cancelled**: terminal state from draft/published — triggers refund workflow.

State transitions emit events defined in `docs/canon/event-catalog.md` and are
implemented by the `event` service (`docs/canon/service-map.md`).

## 4. Core Modules

| Module group | Services | Batch |
|---|---|---|
| Platform Core | auth, tenant, rbac, audit | 1 |
| Event Operations | event, agenda, speaker, exhibitor, attendee | 2 |
| Participation | registration, onsite | 3 |
| Commerce Core | ticketing, pricing, inventory, order, payment, fulfillment | 4 |
| Engagement (Marketing) | notification, engagement (campaigns) | 5 |
| Intelligence | analytics, search | 6 |
| Infra Layer | event-bus, cache | 7 |
| Social | networking | 8 (gap-fill) |
| Interactive Engagement | interactive-engagement (polls/Q&A/survey) | 9 (gap-fill) |
| AI Layer | ai-service | 10 (gap-fill) |

## 5. Enterprise Capabilities

- **Multi-tenancy**: every entity carries `tenant_id`; enforced via tenant isolation
  middleware (see `docs/canon/security-model.md`).
- **RBAC**: role/permission model with per-tenant role assignment.
- **Enterprise Identity**: OAuth2 / SAML SSO (Auth module extension, see
  `services/auth/README.md`).
- **Audit Logging**: all auth, role, tenant, and entity-mutation events recorded
  in `AuditLog`.
- **Analytics & Reporting**: real-time dashboards plus CSV/JSON exports, tenant-scoped.

## 6. AI Capabilities

Defined in full in `docs/architecture/ai-architecture.md`. Summary:

- **Semantic search** across events, sessions, speakers, attendees (built on the
  `search` service's OpenSearch indices, augmented with vector embeddings).
- **Attendee matchmaking** — networking recommendations driven by profile/interest
  embeddings.
- **AI assistants** — conversational interfaces over event data (read models +
  vector store).
- **Agent automation** — workflow automation hooks (e.g., auto-drafting campaign
  content, summarizing session feedback).

## 7. Capability Tiers

Delivery is staged into four tiers — see `docs/canon/capability-matrix.md` for the
full mapping of services/batches to V1–V4.
