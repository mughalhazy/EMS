> **Status: Retired (Historical).** Superseded by
> `docs/00_authority/FEATURE_SCOPE.md` and `PROJECT_CHARTER.md` §4. The
> T1–T4 delivery-tier framing is retained as historical planning context
> only — all batches are now implemented.

# Capability Matrix

> Source: V2 DOCS Phase 4 Prompt 11 — capability matrix. Maps delivery tiers
> (T1-T4) to services and build batches (`BUILD_BLUEPRINT.md` §6-8). Tiers
> describe incremental go-live capability, not pricing plans (pricing tiers, if
> any, are a tenant/billing concern layered on top — see `tenant.plan`).

## Tier 1 — Foundation (V1 scope)
*A tenant can authenticate, manage RBAC, and run a basic event with agenda and
attendee directory — no commerce yet.*

| Capability | Services | Batch |
|---|---|---|
| Multi-tenant auth, RBAC, audit | auth, tenant, rbac, audit | 1 |
| Event creation & lifecycle | event | 2 |
| Agenda (tracks/sessions) | agenda | 2 |
| Speaker management | speaker | 2 |
| Exhibitor/booth/sponsor directory | exhibitor | 2 |
| Attendee directory | attendee | 2 |
| Registration (free events) | registration | 3 |
| Onsite check-in & badges | onsite | 3 |

## Tier 2 — Commerce (V2 scope)
*Adds paid ticketing, dynamic pricing, checkout, payments, and fulfillment —
the V2 backend refinement's core contribution.*

| Capability | Services | Batch |
|---|---|---|
| Ticket products & entitlements | ticketing | 4 |
| Pricing rules, discounts, promo codes | pricing | 4 |
| Inventory pools & reservation holds | inventory | 4 |
| Order management | order | 4 |
| Payment processing & refunds | payment | 4 |
| Post-payment fulfillment | fulfillment | 4 |

## Tier 3 — Operations & Intelligence (V1 + V2 merge)
*Adds marketing automation, analytics dashboards, and search across the
platform.*

| Capability | Services | Batch |
|---|---|---|
| Transactional notifications | notification | 5 |
| Marketing campaigns & segmentation | engagement | 5 |
| Analytics read models & dashboards | analytics | 6 |
| Full-text/semantic search | search | 6 |
| Event bus + outbox infrastructure | infra/event-bus | 7 |
| Cache, locks, idempotency, rate limiting | infra/cache | 7 |

## Tier 4 — Enterprise & Engagement (V1 gap-fill scope)
*Adds attendee networking, live interactive features, AI capabilities, and
enterprise-grade identity/DevOps — fully closes the V1 scope not covered by V2.*

| Capability | Services | Batch |
|---|---|---|
| Attendee social connections / networking | networking | 8 |
| Live polls, Q&A, surveys | interactive-engagement | 9 |
| Semantic search augmentation, matchmaking, AI assistants | ai-service | 10 |
| Enterprise SSO (OAuth2/SAML) | auth (extension) | Phase D |
| Outbound integrations (calendar, CRM, webhooks) | integration | Phase D |
| Full DevOps (CI/CD, observability, multi-env deployment) | infra/docker, infra/deployment | Phase D |
| Frontend application (all personas) | apps/web, design system, ui-renderer | Phase E |

## Tier-to-Persona Readiness

| Persona | Minimum tier for full functionality |
|---|---|
| Platform Admin | T1 |
| Organizer | T1 (basic) -> T2 (ticketed events) -> T3 (campaigns/analytics) |
| Finance | T2 |
| Support | T1 |
| Exhibitor | T1 (booth/leads) -> T2 (sponsor packages tied to paid tiers) |
| Speaker | T1 |
| Onsite Staff | T1 -> T4 (interactive session features) |
| Attendee | T1 (free events) -> T2 (ticketed) -> T4 (networking, polls, AI assistant) |

## Build Order Rationale

Tiers are delivered in order T1 -> T2 -> T3 -> T4 because:
1. T1 establishes tenancy, identity, and the core event/agenda/attendee graph
   that every later entity references (`Event`, `Attendee`, `Session`).
2. T2 (commerce) depends on `Event`/`TicketProduct` from T1 and is the most
   architecturally complex subsystem (inventory concurrency, payment
   idempotency) — built once the foundation is stable.
3. T3 (intelligence/ops) consumes the event stream produced by T1+T2 — read
   models would be empty/meaningless without prior data-producing services.
4. T4 (enterprise/engagement/AI) is additive and depends on T1-T3 entities
   (`Attendee`, `Session`, search indices) for its own features.

Full execution order: `BUILD_BLUEPRINT.md` §11.
