Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Frontend Blockers Register

> Phase 2.9 — Executed 2026-06-17.
> Assesses every known gap and open item for its impact on Phase E (frontend)
> development. Only items that would prevent the frontend from being built,
> tested, or shipped correctly are listed here.
> 
> Items are classified as:
> - **HARD BLOCKER**: frontend for this feature area CANNOT proceed until resolved
> - **SOFT BLOCKER**: frontend can be scaffolded but feature will not work end-to-end
> - **NOT A BLOCKER**: frontend can proceed without resolving this item

## Hard Blockers

> Items that must be resolved before any frontend work begins in their area.

### FB-H1: Role Model Conflict (ROD-11 / GAP-G10)

- **Area affected**: Role management UI, permission-gated navigation, RBAC admin screens
- **Why it blocks**: The frontend cannot correctly display or manage roles if the canonical role list is undecided. Building role management UI against 9 documented roles when 8 are implemented (with different names) will produce incorrect screens.
- **Unblocking action**: Owner decides whether code (8 roles) or canon doc (9 roles) is authoritative. If code is authoritative, AI can update docs autonomously.
- **Current status**: AWAITING ROD-11 DECISION

---

### FB-H2: Permission Taxonomy Undefined (ROD-3 / GAP-B1)

- **Area affected**: Any permission-gated UI — admin panels, owner-only actions, role-restricted views
- **Why it blocks**: The frontend cannot correctly implement permission checks if the permission taxonomy is not finalized. 22/26 controllers currently have no `@RequirePermissions` — the frontend does not know which actions require which permissions.
- **Unblocking action**: Owner/architect finalizes permission taxonomy; AI then applies `@RequirePermissions` to all 22 controllers (AUTONOMOUS once decided).
- **Current status**: AWAITING ROD-3 DECISION

---

### FB-H3: Engagement Module Fate Undecided (ROD-1 / OA-3 / GAP-B13)

- **Area affected**: Any "engagement" page or section in the frontend
- **Why it blocks**: If the engagement module is removed (recommended), building frontend pages for it wastes work. If it is kept and repurposed, its new scope must be defined first.
- **Unblocking action**: Owner decides engagement module fate (remove vs. repurpose).
- **Current status**: AWAITING ROD-1 DECISION

---

## Soft Blockers

> Items where the feature area exists and can be built, but will not function end-to-end until the backend item is resolved.

### FB-S1: EventSettings Entity Missing (ROD-9 / GAP-B11)

- **Area affected**: Event settings/configuration UI (registration open dates, capacity limits, branding)
- **Why it's a soft blocker**: `Event` entity exists, but event settings (separate configuration concern) has no entity, no controller, and no API endpoints.
- **Frontend approach**: Build the event settings UI component with graceful degradation ("Settings not yet available") or mock data, then wire up when the backend entity is implemented.
- **Current status**: AWAITING ROD-9 DECISION

---

### FB-S2: AI Embeddings Placeholder (ROD-10 / GAP-B14)

- **Area affected**: Semantic event search, speaker recommendations, content suggestions, any AI-powered feature
- **Why it's a soft blocker**: `embedding.updated` events are published but carry `vector: []`. Vector similarity queries return meaningless results. Search can be implemented with full-text fallback.
- **Frontend approach**: Build AI-powered UI with a feature flag or graceful fallback. Full-text search (Postgres ILIKE / JSONB) works. Semantic search will not work until a real embedding API is connected.
- **Current status**: AWAITING ROD-10 DECISION (API vendor/key selection)

---

### FB-S3: JWT Permissions Empty (ROD-5 / GAP-B3)

- **Area affected**: Frontend permission checks derived from JWT claims
- **Why it's a soft blocker**: JWT is issued with `permissions: []`. If the frontend reads permissions from the JWT (common pattern), all permission checks pass vacuously, masking unauthorized-access bugs.
- **Frontend approach**: Do not derive frontend permission display from JWT `permissions` field. Use the RBAC service API (`GET /v1/rbac/roles/:userId`) instead.
- **Current status**: AWAITING ROD-5 DECISION (JWT snapshot vs. DB lookup)

---

## Not Blockers

| Item | Why not blocking | Notes |
|---|---|---|
| GAP-G11 (postgres-init.sql) | ✅ FIXED 2026-06-17 | Schema `ordering` now correct |
| GAP-B5 (routing collision) | ✅ RESOLVED — not a real collision | No frontend impact |
| GAP-B8 (webhook @MinLength) | ✅ FIXED 2026-06-17 | Webhook form validation now enforced |
| GAP-B15 (integration 23 missing topics) | ✅ FIXED 2026-06-17 | Webhook fan-out now covers all 64 topics |
| GAP-B2 (test coverage) | Operational risk, not API surface | Frontend doesn't depend on test count |
| GAP-B6 (no Kafka DLQ) | Reliability risk, not frontend concern | Events may be lost; frontend is not affected |
| GAP-B7 (no schema registry) | Infrastructure risk | Frontend is not affected |
| GAP-B4 (O(n) bcrypt) | Performance issue at scale, not frontend blocker | Auth endpoints still function correctly |
| GAP-G8 (frontend stack unconfirmed) | Verify at Phase E kickoff | `apps/web` has only README; stack TBD |
| OA-6 (E2E baseline timing) | Test planning, not frontend blocker | Frontend development does not require E2E tests first |
| GAP-G6 (SSO/webhook security deferred) | Pre-production concern | SSO login and webhook HMAC work; signature verification is incomplete |

## Blocker Summary

| ID | Blocker | Type | Affected Area |
|---|---|---|---|
| FB-H1 | Role model conflict | HARD | Role management, permission-gated UI |
| FB-H2 | Permission taxonomy undefined | HARD | All permission-gated UI |
| FB-H3 | Engagement module fate | HARD | Engagement pages |
| FB-S1 | EventSettings entity missing | SOFT | Event settings pages |
| FB-S2 | AI embeddings placeholder | SOFT | AI-powered search/recommendations |
| FB-S3 | JWT permissions empty | SOFT | Frontend permission derivation from JWT |

**Hard blockers**: 3 (all are owner decisions — cannot be resolved from repository evidence)  
**Soft blockers**: 3 (frontend can be scaffolded; feature completes when backend resolved)  
**Absolute backend blockers**: 0 (all critical infrastructure items resolved)

**Overall assessment**: The backend API surface is stable and documented. Frontend can begin on all areas except the three hard-blocked areas (engagement UI, full permission-gated UI, role management). Soft-blocked areas can be scaffolded with graceful degradation.
