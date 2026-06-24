Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Frontend Gap Register

> Documents frontend-specific gaps: missing backend APIs, pending backend items,
> UX-impacting decisions still unresolved, and functionality that cannot be
> completed until backend work is done.
> 
> Gaps are prefixed `GAP-FE`. Backend gaps that impact frontend are cross-referenced.

---

## GAP-FE1: EventSettings API Missing

- **Severity**: Medium
- **Category**: Missing Backend API
- **Impact**: Event Settings screen (S-11) at `/events/:id/settings` cannot function
- **Root cause**: EventSettings entity does not yet exist (ROD-9, OCR-5 pending)
- **Blocked screens**: S-11 Event Settings
- **Frontend approach**: Build screen with graceful degradation — show "Settings not yet configured" empty state with "Contact admin" note. Wire up to real API when OCR-5 is implemented.
- **Backend work required**: OCR-5 (EventSettings entity + GET/PUT endpoints)
- **Status**: OPEN — pending OCR-5 confirmation

---

## GAP-FE2: AI Semantic Search Non-Functional — ✅ ROOT CAUSE RESOLVED (Compression Pass)

- **Severity**: Medium (root cause now SAFE-DEFAULT)
- **Category**: Feature Incomplete
- **Impact**: Search results (S-26) currently return only full-text matches
- **Root cause resolution**: ROD-10 reclassified SAFE-DEFAULT 2026-06-17. `OPENAI_API_KEY` confirmed in environment. Embedding implementation is autonomous (one-function change in `ai.service.ts` using `text-embedding-3-small`). See OWNER_REQUIRED_COMPRESSION_REPORT.md.
- **Blocked screens**: S-26 (full-text works now; semantic ranking available after ROD-10 implementation)
- **Frontend approach**: Build search with full-text results initially. "AI-powered" UI copy enabled once OCR-2 + ROD-10 backend implementation lands. No frontend blocker.
- **Backend work required**: ROD-10 implementation (SAFE-DEFAULT — autonomous once OCR tier approved)
- **Status**: SAFE-DEFAULT — implementation path fully determined; no owner decision needed

---

## GAP-FE3: Permission-Gated UI Cannot Be Finalized Until OCR-2 Confirmed

- **Severity**: High
- **Category**: Pending Decision Impact
- **Impact**: The 23-permission taxonomy (including 11 new domain permissions) is recommended but not yet applied to backend controllers. Frontend can use role-based guards for now; permission-based guards need confirmation.
- **Blocked screens**: All screens with `PermissionGate` guards for domain permissions (event:manage, commerce:manage, etc.)
- **Frontend approach**: Implement `RoleGuard` initially (8 stable roles). Switching to `PermissionGate` is a component-level refactor, not a screen-level change.
- **Backend work required**: OCR-2 (permission extension + @RequirePermissions on 22 controllers)
- **Status**: OPEN — OWNER_CONFIRMATION_ONLY (implement unless rejected)

---

## GAP-FE4: Engagement Module Removal — ✅ CLOSED (Phase 3.25)

- **Severity**: Low (closed)
- **Category**: Pending Backend Change
- **Resolution**: The frontend answer is fully deterministic regardless of OCR-1 outcome. The `EngagementModule` has zero routes, zero entities, zero consumers — whether it is removed or not, the frontend must NOT build `/engagement/*` routes. Campaign management is correctly under `/campaigns` backed by `services/notification`. No frontend ambiguity remains.
- **Backend work**: OCR-1 (remove module) is an independent cleanup task; it does not affect the frontend routing decision.
- **Status**: ✅ CLOSED 2026-06-17

---

## GAP-FE5: JWT Permissions Field Always Empty — ✅ CLOSED (Phase 3.25)

- **Severity**: Low (closed)
- **Category**: Auth Pattern Clarification
- **Resolution**: ROD-5 confirmed RESOLVED. `PermissionsGuard` uses DB lookup (correct). JWT `permissions: []` is intentional. Frontend must call `GET /v1/rbac/users/me/roles` after login. Documented in `FRONTEND_AUTHORITY_MASTER.md` quick reference.
- **Backend work required**: None
- **Status**: ✅ CLOSED 2026-06-17

---

## GAP-FE6: Interactive Engagement Entity Names — ✅ CLOSED (Phase 3.25)

- **Severity**: Low (closed)
- **Category**: Documentation Gap
- **Resolution**: Entity names do not affect frontend API consumption. API endpoints (`/v1/polls`, `/v1/qa-questions`, `/v1/surveys`) are verified in SERVICE_CATALOG.md. This gap was never a true frontend blocker.
- **Backend work required**: None
- **Status**: ✅ CLOSED 2026-06-17

---

## GAP-FE7: Payment Gateway — RESOLVED (Compression Pass 2026-06-17)

- **Severity**: Low (Phase E scaffold fully deterministic)
- **Category**: Split — Scaffold SAFE-DEFAULT / Gateway Integration OUT-OF-SCOPE
- **Resolution (Compression Pass)**: Split into two independent sub-items per OWNER_REQUIRED_COMPRESSION_REPORT.md.

### GAP-FE7-A: S-06 Checkout Scaffold — ✅ SAFE-DEFAULT

- **Frontend approach**: Build S-06 with the following deterministic steps:
  1. Order summary screen (data from `GET /v1/orders/:id`)
  2. Call `POST /v1/payments { orderId, amountCents, currency, provider: 'placeholder' }` on "Proceed"
  3. Placeholder payment form: disabled card fields + "Payment gateway integration pending" notice
  4. "Complete Payment" button disabled until gateway credentials available
- **Verified backend API contract**:
  - `POST /v1/payments` (body: `{ orderId, amountCents, currency, provider }`)
  - `POST /v1/payments/:id/complete` (body: `{ providerRef }`)
  - `POST /v1/payments/:id/fail`
  - `POST /v1/payments/:orderId/refund` (body: `{ amountCents, reason }`)
- **Status**: ✅ SAFE-DEFAULT — fully deterministic; no owner decision needed

### GAP-FE7-B: Gateway SDK Integration (Step 3 only) — OUT-OF-SCOPE for Phase E

- **What this is**: Swapping the placeholder form for Stripe Elements / PayPal SDK
- **Why out-of-scope**: Requires active gateway account + API keys; Phase E delivers placeholder scaffold
- **When to resume**: When gateway credentials are provisioned; recommended gateway = Stripe Elements
- **Status**: OUT-OF-SCOPE — post-Phase E task; does not block any Phase E screen

---

## GAP-FE8: No Real-time Push / WebSocket — ✅ CLOSED (Phase 3.25)

- **Severity**: Low (closed)
- **Category**: Missing Real-time API
- **Resolution**: HTTP polling (30-second interval) is explicitly accepted for Phase E. This is a known architectural limitation with an available workaround. No ambiguity remains about the Phase E implementation approach.
- **Backend work required**: None for Phase E; WebSocket is a Phase E+ enhancement
- **Status**: ✅ CLOSED 2026-06-17 (polling accepted)

---

## GAP-FE9: Tenant SSO Signature Verification Deferred

- **Severity**: Medium (production only)
- **Category**: Security Gap (GAP-G6)
- **Impact**: SSO login UX works; backend does not verify OAuth2/SAML assertion signatures
- **Affected screens**: S-04 SSO Callback, S-28 SSO Configuration
- **Frontend approach**: Build SSO UI normally. Add a visible warning in S-28: "SSO signature verification is pending — not recommended for production use"
- **Backend work required**: GAP-G6 security hardening
- **Status**: OPEN — pre-production concern; Phase E can proceed

---

## GAP-FE10: System Roles Read-Only in Role Management — ✅ CLOSED (Phase 3.25)

- **Severity**: Low (closed)
- **Category**: UX Constraint
- **Resolution**: `Role` entity includes `isSystem: boolean` column (verified in rbac.service.ts via `DEFAULT_ROLES` seeding). `GET /v1/roles` returns this field. Frontend checks `role.isSystem` and renders edit/delete controls as disabled. Implementation is deterministic.
- **Backend work required**: None
- **Status**: ✅ CLOSED 2026-06-17

---

## Gap Summary

| ID | Gap | Severity | Screens Blocked | Backend Dependency | Unblocked? |
|---|---|---|---|---|---|
| GAP-FE1 | EventSettings API missing | Medium | S-11 | OCR-5 backend | ✅ Partially (graceful degradation) |
| GAP-FE2 | AI semantic search non-functional | Medium | S-26 (partial) | ROD-10 commercial | ✅ Partially (full-text works) |
| GAP-FE3 | Permission guards pending OCR-2 | High | All permission-gated | OCR-2 REQUIRES_APPROVAL | ✅ Partially (RoleGuard works) |
| GAP-FE4 | Engagement removal | Low | None | N/A — frontend answer is deterministic | ✅ CLOSED |
| GAP-FE5 | JWT permissions empty | Low | None | None | ✅ CLOSED |
| GAP-FE6 | Interactive engagement entity names | Low | None | None | ✅ CLOSED |
| GAP-FE7-A | S-06 checkout scaffold (Steps 1/2/3-placeholder/4) | Low | S-06 fully buildable | None | ✅ SAFE-DEFAULT |
| GAP-FE7-B | Gateway SDK integration (Step 3 actual) | N/A for Phase E | None (post-Phase E) | Gateway credentials | OUT-OF-SCOPE |
| GAP-FE8 | No real-time push/WebSocket | Low | None (polling works) | None | ✅ CLOSED |
| GAP-FE9 | SSO signature verification deferred | Medium (production) | S-04, S-28 | Security sprint | Open — production concern only |
| GAP-FE10 | System roles read-only constraint | Low | None | None | ✅ CLOSED |

**Absolute frontend blockers**: 0
**Closed (Phase 3.25)**: GAP-FE4, GAP-FE5, GAP-FE6, GAP-FE8, GAP-FE10 (5 of 10)
**SAFE-DEFAULT (Compression Pass 2026-06-17)**: GAP-FE7-A (scaffold), GAP-FE2 (root cause resolved)
**OUT-OF-SCOPE**: GAP-FE7-B (gateway SDK integration — post-Phase E)
**Remaining open gaps**: 3 — all SAFE-DEFAULT with mitigations
  - GAP-FE1: graceful degradation empty state (OCR-5 pending implementation)
  - GAP-FE3: RoleGuard available now; PermissionGate when OCR-2 lands
  - GAP-FE9: SSO warning banner (production concern only)
**OWNER-REQUIRED**: 0 — all items resolved or out-of-scoped
