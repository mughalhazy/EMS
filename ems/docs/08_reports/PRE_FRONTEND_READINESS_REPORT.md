Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Pre-Frontend Readiness Report

> Produced by: Pre-Frontend Doc-to-Code Delta Audit, 2026-06-17.
> Determines whether documentation is sufficiently accurate and complete
> to begin Phase E (frontend development) without risk of building against
> wrong contracts.

## Executive Summary

**Documentation is now READY to begin frontend development**, with the following
known limitations that should be addressed in parallel with or before specific
frontend features:

1. **CRITICAL blocker (infrastructure)**: `postgres-init.sql` creates schema
   `"order"` but code expects `"ordering"` — this will cause runtime failures
   for any order-related features. Owner must fix this before order/payment
   frontend testing against a real database.
2. **Medium-impact gaps**: 9 entity column schemas undocumented (from
   UNDOCUMENTED_CODE_REGISTER) — frontend forms for these entities will require
   a code-read pass first.
3. **Pagination contract mismatch** (DELTA-7): Frontend must use page-based
   pagination (`?page=&limit=`) not cursor-based, despite api-standards.md
   describing cursor pagination. The actual API behavior is page-based.

---

## Readiness by Domain

### Platform Core (auth, tenant, rbac, audit) — ✅ Ready

- Auth: entity schema verified; Kafka topics corrected; SSO gap (GAP-G6) documented
- Tenant: `Organization` entity undocumented but not likely frontend-blocking initially
- RBAC: `@ManyToMany` junction confirmed; no separate entity needed by frontend
- Audit: read-only log entity; low frontend complexity

**Frontend can proceed on auth/login/SSO, user management, role assignment.**

---

### Event Operations (event, agenda, speaker, exhibitor, attendee) — ✅ Ready

- All entity schemas documented; Kafka topics corrected
- `Room` in `event` schema (not `agenda`) — confirmed
- `SessionSpeaker` junction entity exists but columns not extracted (UCR-3)
- `Lead` and `SponsorPackage` columns not extracted (UCR-5, UCR-6)

**Frontend can proceed on event creation, agenda builder, speaker directory,
exhibitor directory. Lead capture form and sponsor tier config need UCR-5/UCR-6 resolved first.**

---

### Participation (registration, onsite) — ✅ Ready

- Registration status machine (5 states) documented; entity column detail not extracted for all fields
- Onsite: `BadgePrint`, `DeviceSession`, `CheckIn` confirmed; `DeviceSession` columns not extracted (UCR-10)

**Frontend can proceed on registration flow, check-in UI. Device management screen needs UCR-10.**

---

### Commerce (ticketing, pricing, inventory, order, payment, fulfillment) — ⚠️ Partial

- **CRITICAL**: `postgres-init.sql` creates wrong schema name for order service (GAP-G11/A-4)
- `TicketEntitlement` columns not extracted (UCR-7)
- `PaymentTransaction` columns not extracted (UCR-8)
- `Order` columns corrected (userId, subtotalCents, discountCents, totalCents)
- Kafka commerce topics fully verified and corrected

**Frontend can proceed on ticketing product listing, promo codes, order history display.
Payment history detail, ticket entitlement enforcement, and order checkout need
the postgres-init fix (A-4) and UCR-7/UCR-8 column reads.**

---

### Engagement (notification, engagement stub) — ✅ Ready

- `Campaign` and `AudienceSegment` confirmed in `notification` service (not `engagement`)
- `AudienceSegment` columns not extracted (UCR-9)
- `engagement` module is a stub — no routes; do not build UI against it

**Frontend can proceed on notification history, campaign list. Campaign builder
audience definition needs UCR-9 column read.**

---

### Intelligence (analytics, search) — ✅ Ready

- Analytics: 3 entities + 2 view entities documented; queries should use view endpoints
- Search: Postgres ILIKE confirmed; `SearchDocument` entity documented; 5 entity types
- **Note**: Search will eventually migrate to OpenSearch for AI/vector features (DELTA-2)

**Frontend can proceed on analytics dashboard, search/filter UIs.**

---

### Social (networking) — ✅ Ready

- `AttendeeConnection` entity confirmed; Kafka topics corrected
- No unverified claims for core functionality

**Frontend can proceed on connection requests, attendee directory networking.**

---

### Interactive (interactive-engagement) — ✅ Ready

- All 5 entities documented (Poll, PollResponse, QaQuestion, Survey, SurveyResponse)
- Kafka topics corrected

**Frontend can proceed on live polls, Q&A, surveys.**

---

### AI Layer (ai-service) — ⚠️ Partial

- `VectorEmbedding` (JSONB) and `AIInteractionLog` entity schemas verified and corrected
- `ai-architecture.md` content not verified against code (UC-8)
- "Agent automation" entity does not exist (UCR-11)

**Frontend can proceed on AI interaction log display. Vector search / semantic
features depend on UC-8 verification first.**

---

### Integration (webhooks) — ✅ Ready

- `WebhookSubscription` schema fully verified and corrected
- `WebhookDelivery` removed from documentation (never existed)
- Retry/DLQ deferred (GAP-G6)

**Frontend can proceed on webhook subscription management.**

---

## Key Contract Clarifications for Frontend

| Contract Point | Correct Behavior |
|---|---|
| Pagination | Page-based: `?page=<number>&limit=<number>` — NOT cursor-based |
| Response envelope | `{ data: T, meta: { page, limit, total, totalPages } }` for lists |
| Error envelope | `{ error: { code, message, details }, meta: { requestId, timestamp } }` |
| Auth | JWT Bearer; access token TTL 15 min; refresh via `POST /auth/refresh` |
| Tenant isolation | All endpoints scoped by `tenantId` from JWT; no tenant param in URL |
| Idempotency | `Idempotency-Key` header required on mutating commerce endpoints |
| Order schema | `ordering` (not `order`) in DB — but this is transparent to frontend |

---

## Blocking Owner Actions Before Commerce Frontend Testing

| Item | Description | Impact |
|---|---|---|
| A-4 / GAP-G11 | Fix `postgres-init.sql` line 18: `"order"` → `"ordering"` | Order/payment/fulfillment features non-functional against real DB |

See `docs/08_reports/OWNER_APPROVAL_ITEMS_BEFORE_PHASE3.md` for full context.

---

## Documentation Confidence Score (Post-Audit)

| Document | Confidence | Notes |
|---|---|---|
| `SERVICE_CATALOG.md` | ✅ High | Fully corrected; Kafka topics verified |
| `DATABASE_SCHEMA.md` | ✅ High | All discovered entities documented; 9 entity column schemas still TBD |
| `EVENT_AND_QUEUE_ARCHITECTURE.md` | ✅ High | All 64 topics verified from source |
| `API_CONTRACT.md` | ⚠️ Medium | Not re-read this pass; endpoint listing may have gaps |
| `BACKEND_ARCHITECTURE.md` | ✅ High | Structural doc; unchanged |
| `FULLSTACK_STITCHING_CONTRACT.md` | ⚠️ Medium | Not re-verified against corrected entity schemas |
| `docs/legacy/*.md` | ❌ Low | Retired; may conflict with implementation at various points |
