Status: Active
Authority Level: Medium
Last Reviewed: 2026-06-17
Owner: AI

# TBD Resolution Register

> Produced by: Pre-Frontend Doc-to-Code Delta Audit, 2026-06-17.
> Tracks every "TBD", "REQUIRES VERIFICATION", "TODO", or equivalent
> placeholder found across governance documents, and the resolution status
> after this audit pass.

## Resolved TBDs

### TBD-R1: Analytics Schema (SERVICE_CATALOG.md, DATABASE_SCHEMA.md)

- **Was**: "Projection entities (read model, exact names TBD — REQUIRES VERIFICATION)"
- **Resolution**: 3 TypeORM entities + 2 @ViewEntity read models identified:
  - `AnalyticsEvent` (`analytics.analytics_events`)
  - `EventMetric` (`analytics.event_metrics`)
  - `TicketSalesSummary` (`analytics.ticket_sales_summaries`)
  - `AttendanceMetrics` (view: `analytics.attendance_metrics`)
  - `EventDashboardView` (view: `analytics.event_dashboard_view`)
- **Fixed in**: `SERVICE_CATALOG.md`, `DATABASE_SCHEMA.md`, `BACKEND_GAP_REGISTER.md` (GAP-B12 closed)
- **Resolved**: 2026-06-17

---

### TBD-R2: Search Technology (SERVICE_CATALOG.md)

- **Was**: "CQRS read model (OpenSearch). Client library not confirmed in package.json (TBD — REQUIRES VERIFICATION)"
- **Resolution**: Search uses Postgres ILIKE. `SearchDocument` entity (`search.search_documents`). No OpenSearch client in package.json. OpenSearch is provisioned but commented out in .env.development.example.
- **Fixed in**: `SERVICE_CATALOG.md`, `DATABASE_SCHEMA.md`, `BACKEND_GAP_REGISTER.md` (GAP-B9 closed)
- **Resolved**: 2026-06-17

---

### TBD-R3: CI Test Job Content (AI_OPERATING_CONTEXT.md)

- **Was**: "A test job also exists in `.github/workflows/ci.yml` — full body TBD – REQUIRES VERIFICATION"
- **Resolution**: Test job verified: `npm test -- --passWithNoTests` on ubuntu-latest. CI passes with zero spec files.
- **Fixed in**: `AI_OPERATING_CONTEXT.md` REQUIRED_VALIDATIONS section; OPEN_ARCHITECTURAL_QUESTIONS question 3 closed
- **Resolved**: 2026-06-17

---

### TBD-R4: VectorEmbedding Storage Type (DATABASE_SCHEMA.md)

- **Was**: References to `embedding (vector)` with pgvector assumption; GAP-B10 open
- **Resolution**: `VectorEmbedding.vector` column uses `jsonb` type (not pgvector). Column name is `vector` not `embedding`. No pgvector needed.
- **Fixed in**: `DATABASE_SCHEMA.md`, `BACKEND_GAP_REGISTER.md` (GAP-B10 closed)
- **Resolved**: 2026-06-17

---

### TBD-R5: OpenSearch Client Verification (BACKEND_GAP_REGISTER.md GAP-B9)

- **Was**: "Whether `@opensearch-project/opensearch` or similar is installed — TBD"
- **Resolution**: No OpenSearch client in package.json. Not needed — search is Postgres ILIKE.
- **Fixed in**: `BACKEND_GAP_REGISTER.md` (GAP-B9 closed)
- **Resolved**: 2026-06-17

---

### TBD-R6: pgvector Extension Requirement (BACKEND_GAP_REGISTER.md GAP-B10)

- **Was**: "Whether pgvector is enabled in Docker Compose or production — TBD"
- **Resolution**: Not needed. VectorEmbedding uses JSONB. postgres-init.sql only enables uuid-ossp and pgcrypto.
- **Fixed in**: `BACKEND_GAP_REGISTER.md` (GAP-B10 closed)
- **Resolved**: 2026-06-17

---

### TBD-R7: Kafka Topic Count Verification (EVENT_AND_QUEUE_ARCHITECTURE.md)

- **Was**: Topic count claimed as 57; names unverified against topics.ts
- **Resolution**: Verified 64 topics in `infra/event-bus/src/topics.ts`; all names read and corrected.
- **Fixed in**: `EVENT_AND_QUEUE_ARCHITECTURE.md` §5, `SERVICE_CATALOG.md`, `BACKEND_GAP_REGISTER.md` GAP-B7
- **Resolved**: 2026-06-17

---

### TBD-R8: SAFE_REPOSITORY_HYGIENE Items A-1/A-2/A-3/A-5A (APPROVAL_RECLASSIFICATION_REPORT.md)

- **Was**: Items authorized but not yet executed; marked "next session"
- **Resolution**: All four executed 2026-06-17:
  - A-1: docs/canon/ files copied to docs/legacy/, MOVED.md placed, cross-references updated
  - A-2: docs/architecture/ files copied to docs/legacy/, MOVED.md placed, cross-references updated
  - A-3: docs/product/product-overview.md copied to docs/legacy/, MOVED.md placed
  - A-5A: `test:e2e` script removed from package.json
- **Fixed in**: Multiple docs (see PRE_FRONTEND_DELTA_AUDIT.md)
- **Resolved**: 2026-06-17

---

## Remaining Open TBDs — RESOLVED BY PHASE 3.25 (2026-06-17)

### TBD-O1: `docs/tracking/progress.md` — ✅ RESOLVED (ALREADY DEPRECATED)

- **Location**: `docs/tracking/progress.md`
- **Resolution**: File already has a deprecation notice at the top of the file:
  "Status: Obsolete. Moved to `docs/legacy/progress.md`. [...] Do not use for current status."
  The file had been marked obsolete in a prior pass. No further action required.
- **Resolved**: 2026-06-17

---

### TBD-O2: `docs/legacy/ai-architecture.md` — ✅ RESOLVED (CORRECTIONS APPLIED)

- **Location**: `docs/legacy/ai-architecture.md`
- **Resolution**: File read 2026-06-17. Contradictions with actual code confirmed:
  1. §3 claims embedding API is called — code stores `vector: []` placeholder
  2. §4 describes OpenSearch k-NN — code uses Postgres ILIKE (no OpenSearch)
  3. §7 describes agent automation entities — no such entities in code
  Correction notice added to document header marking these as design intent vs. reality.
- **Resolved**: 2026-06-17

---

### TBD-O3: Column-Level Schemas for Undocumented Entities — ✅ RESOLVED

- **Location**: DATABASE_SCHEMA.md
- **Resolution**: All 9 entity files read 2026-06-17. Schemas extracted:
  - `Organization` (tenant.organizations): id, tenantId, name, billingInfo (jsonb nullable), createdAt, updatedAt, ManyToOne → Tenant
  - `SessionSpeaker` (speaker.session_speakers): id, sessionId, speakerId, role (default: 'presenter'), assignedAt
  - `AttendeeTag` (attendee.attendee_tags): id, attendeeId, tenantId, tag, createdAt
  - `Lead` (exhibitor.leads): id, exhibitorId, attendeeId, capturedByDeviceId (nullable), notes (text nullable), capturedAt
  - `SponsorPackage` (exhibitor.sponsor_packages): id, eventId, tier, price (numeric 12,2), benefits (jsonb nullable), createdAt — NOTE: no tenantId column
  - `TicketEntitlement` (ticketing.ticket_entitlements): id, tenantId, ticketId, entitlementType (enum: session_access/lounge_access/swag_bag/meal/parking), value (text nullable), createdAt
  - `PaymentTransaction` (payment.payment_transactions): id, tenantId, paymentId, type (authorize/capture/refund), amountCents, currency, status (pending/completed/failed), providerRef (nullable), createdAt
  - `AudienceSegment` (notification.audience_segments): id, tenantId, campaignId, criteria (jsonb), createdAt
  - `DeviceSession` (onsite.device_sessions): id, tenantId, eventId, deviceId, staffUserId (nullable), startedAt, endedAt (timestamptz nullable)
  New finding: `SponsorPackage` has no `tenantId` column — potential multi-tenancy gap.
  DATABASE_SCHEMA.md updated with these schemas.
- **Resolved**: 2026-06-17

---

### TBD-O4: `FULLSTACK_STITCHING_CONTRACT.md` — ✅ RESOLVED

- **Location**: `docs/00_authority/FULLSTACK_STITCHING_CONTRACT.md`
- **Resolution**: File verified at `docs/00_authority/FULLSTACK_STITCHING_CONTRACT.md` (not `docs/03_fullstack_contracts/`). The contract's Permission Model cells show `TBD — REQUIRES VERIFICATION` for non-platform controllers. These are now resolved: all 22 non-platform service controllers use `JwtAuthGuard` only. The stitching contract's entity domain rows match corrected DATABASE_SCHEMA.md. No blocking data shape errors found.
- **Resolved**: 2026-06-17

---

### TBD-O5: DELTA-7 — Cursor vs. Page Pagination — ✅ RESOLVED

- **Location**: `docs/01_backend/API_CONTRACT.md`, `docs/legacy/api-standards.md`
- **Resolution**: Code inspection reveals a **mixed pagination model**:
  - `order.service.ts` `listOrders()`: uses cursor pagination (`.take(limit+1)`, returns `{ data, nextCursor }`)
  - All other service list endpoints: use page-based pagination (`?page=N&limit=N`)
  - `API_CONTRACT.md` documents page-based as the global convention — this is accurate for all services EXCEPT orders
  Decision: **Page-based is the standard; cursor-based is an exception for orders only** (justified by high-volume ordered data). `API_CONTRACT.md` updated to note orders exception. No migration required.
- **Resolved**: 2026-06-17
