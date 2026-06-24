Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-15
Owner: Shared

# Project Charter — EMS (Event Management SaaS)

> Extracted from `docs/product/product-overview.md`, `docs/canon/capability-matrix.md`,
> `docs/canon/service-map.md`, and `BUILD_BLUEPRINT.md` (workspace root). This document
> is the top-level authority for "what is EMS and why does it exist." Where this
> document and a source canon doc disagree, the source canon doc is authoritative
> and this document should be corrected (see `07_governance/AI_OPERATING_CONTEXT.md`
> Documentation Freshness Rule).

## 1. Purpose

EMS is a **multi-tenant SaaS platform** combining two integrated product lines:

1. **Enterprise Event Management** — end-to-end planning and operation of
   conferences, trade shows, and corporate events (agenda, speakers, exhibitors,
   sponsors, attendees, onsite operations, engagement, analytics).
2. **High-Performance Ticketing & Commerce** — ticket inventory, dynamic
   pricing, checkout, payments, fulfillment, and revenue reporting, built to
   handle high-concurrency on-sale events without overselling.

A single tenant can run both product lines against the same event record.

Source: `docs/product/product-overview.md` §1.

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

## 3. Event Lifecycle (Core State Machine)

```
draft -> published -> live -> archived
            \-> cancelled (from draft or published)
```

- **draft**: organizer configures event, venue, agenda, tickets — not visible publicly.
- **published**: public registration/ticket sales open (`/events/public/[eventId]`).
- **live**: event is running — onsite check-in, session attendance, real-time analytics active.
- **archived**: event ended — read-only, retained for reporting.
- **cancelled**: terminal state from draft/published — triggers refund workflow.

State transitions emit events defined in `docs/canon/event-catalog.md`, implemented
by the `event` service (`docs/canon/service-map.md`).

## 4. Core Modules / Build Batches

| Module group | Services | Batch | Status (2026-06-15) |
|---|---|---|---|
| Platform Core | auth, tenant, rbac, audit | 1 | Implemented |
| Event Operations | event, agenda, speaker, exhibitor, attendee | 2 | Implemented |
| Participation | registration, onsite | 3 | Implemented |
| Commerce Core | ticketing, pricing, inventory, order, payment, fulfillment | 4 | Implemented |
| Engagement (Marketing) | notification (owns Campaign/AudienceSegment — see GAP-G3), engagement (near-empty stub) | 5 | Implemented; Campaign/AudienceSegment live in `notification`, not `engagement` |
| Intelligence | analytics, search | 6 | Implemented |
| Infra Layer | event-bus, cache | 7 | Implemented |
| Social | networking | 8 (gap-fill) | Implemented |
| Interactive Engagement | interactive-engagement (polls/Q&A/survey) | 9 (gap-fill) | Implemented |
| AI Layer | ai-service | 10 (gap-fill) | Implemented |
| Cross-cutting | integration (webhooks) | — | Implemented |
| Enterprise SSO | auth extension (OAuth2/SAML) | Phase D ¹ | Implemented |
| Frontend | apps/web, design system, ui-renderer | Phase E | **Not started** |

¹ Phase D = security/enterprise extension pass, added after Batch 10 gap-fill work;
corresponds to GAP-6 resolution in `docs/tracking/gap-register.md`.

Status column reflects `docs/tracking/gap-register.md` as of 2026-06-15. NOTE:
`docs/tracking/progress.md` (last updated 2026-06-13) is **stale** — it predates
the completion of Batches 8-10, Enterprise SSO, and `integration`. See
`08_reports/ARCHITECTURAL_GAP_REGISTER.md` for this discrepancy.

## 5. Enterprise Capabilities

- **Multi-tenancy**: every entity carries `tenant_id`; enforced via shared
  base repository (`infra/common`) at the TypeORM repository layer
  (`docs/canon/security-model.md`).
- **RBAC**: role/permission model with per-tenant role assignment.
- **Enterprise Identity**: OAuth2/SAML SSO (`services/auth` extension —
  `SsoConnection`/`SsoIdentity`, `/auth/sso/*`).
- **Audit Logging**: all auth, role, tenant, and entity-mutation events recorded
  in `AuditLog`.
- **Analytics & Reporting**: real-time dashboards plus CSV/JSON exports, tenant-scoped.
- **Outbox pattern**: all domain events are written to an `outbox` table in
  the same DB transaction as the triggering write, then relayed to Kafka by
  `infra/event-bus` — guaranteeing at-least-once event delivery without
  distributed transactions (`docs/canon/data-architecture.md`).

## 6. AI Capabilities

Defined in full in `docs/legacy/ai-architecture.md` (relocated 2026-06-17). Summary:

- **Semantic search** across events, sessions, speakers, attendees.
- **Attendee matchmaking** — networking recommendations driven by
  profile/interest embeddings (`VectorEmbedding`).
- **AI assistants** — conversational interfaces over event data, logged to
  `AIInteractionLog`.
- **Agent automation** — workflow automation hooks (e.g., auto-drafting
  campaign content, summarizing session feedback).

## 7. Delivery Tiers

| Tier | Scope | Status |
|---|---|---|
| T1 — Foundation | Multi-tenant auth/RBAC/audit, event/agenda/speaker/exhibitor/attendee, free registration, onsite check-in | Complete |
| T2 — Commerce | Ticketing, pricing, inventory, order, payment, fulfillment | Complete |
| T3 — Operations & Intelligence | Notification (incl. Campaign/AudienceSegment), analytics, search, event-bus, cache | Complete |
| T4 — Enterprise & Engagement | Networking, interactive-engagement, ai-service, Enterprise SSO, integration, full DevOps, frontend | Backend complete; **frontend (apps/web, design system, ui-renderer) not started** |

Full mapping: `docs/canon/capability-matrix.md`.

## 8. Repository Layout

```
ems/
  apps/api/            NestJS HTTP entrypoint (implemented)
  apps/web/            Next.js frontend (NOT implemented — README only)
  services/<name>/     one NestJS module per service (26 total)
  infra/
    docker/            local dev stack (Postgres, Redis, Kafka, OpenSearch, MinIO)
    deployment/        env configs, secrets placeholders
    event-bus/         Kafka client, outbox relay, topic definitions
    cache/             Redis client, rate limiter, idempotency store
    common/            shared guards, decorators, response envelope, base repository
  design/              design tokens, components, wireframes (NOT populated)
  docs/                canonical docs + this governance tree
  prompts/             gap-fill build prompts
```

## 9. Authoritative Source Documents

This charter is a synthesis. For detail, the following remain authoritative:

- `docs/product/product-overview.md`
- `docs/canon/service-map.md`
- `docs/canon/domain-model.md`
- `docs/canon/capability-matrix.md`
- `docs/canon/security-model.md`
- `docs/architecture/system-architecture.md`
- `BUILD_BLUEPRINT.md` (workspace root, one level above `ems/`)
