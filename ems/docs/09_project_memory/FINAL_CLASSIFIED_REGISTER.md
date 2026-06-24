Status: Active
Authority Level: Critical
Last Reviewed: 2026-06-20
Owner: AI

# Final Classified Register — Project Memory Layer

> Master index of every classified item in the EMS project.
> Load this document at the start of every AI session before auditing,
> designing, or implementing.
>
> Sub-registers contain full entry details. This file is the single
> entry point and cross-reference index.
>
> Source: All governance passes Phase 1 through Phase 3.5 L0 Freeze (2026-06-20).
> Total items: 77 (68 original + 9 OOS items added in memory layer)

---

## How to Use

1. Check this index before treating anything as a new gap or decision.
2. If an item already exists — update it, do not duplicate it.
3. If new — classify, add to the correct sub-register, and add an entry here.
4. Items may only be reopened per REOPEN GOVERNANCE rules in PROJECT_MEMORY_GOVERNANCE.md.

---

## Current Project State (as of 2026-06-20)

| Dimension | Value |
|---|---|
| Current phase | Phase E — Frontend Implementation |
| L0 Frontend Authority Input Freeze | **FROZEN** (2026-06-20) |
| Claude Design authorization | GRANTED |
| Owner decisions pending | 0 |
| Phase E blockers | 0 |
| Next milestone | Claude Design archetype work (app shell, list/detail/form/dashboard archetypes) |

---

## Classification Summary

| Classification | Count | Sub-Register |
|---|---|---|
| AUTO-CLOSED | 38 | AUTO_CLOSED_REGISTER.md |
| SAFE-DEFAULT | 29 | SAFE_DEFAULT_REGISTER.md |
| OUT-OF-SCOPE | 10 | OUT_OF_SCOPE_REGISTER.md |
| OWNER-DECISION | 0 (pending) | OWNER_DECISION_REGISTER.md |
| EXTERNAL-DEPENDENCY | 10 (tracked separately) | EXTERNAL_DEPENDENCY_REGISTER.md |
| **Total classified** | **77** | |

---

## AUTO-CLOSED Items (38)

Items proven directly from repository evidence. No action required.

| ID | Title | Status | Register Entry |
|---|---|---|---|
| ROD-2 | Phase E and testing may run in parallel | CLOSED | AUTO_CLOSED_REGISTER.md#rod-2 |
| ROD-4 | Test priority order derivable from commerce chain | CLOSED | AUTO_CLOSED_REGISTER.md#rod-4 |
| ROD-5 | DB-lookup for permissions is the correct approach | CLOSED | AUTO_CLOSED_REGISTER.md#rod-5 |
| ROD-8 | TypeScript Kafka payload schemas | EXECUTED | AUTO_CLOSED_REGISTER.md#rod-8 |
| ROD-11 / OCR-6 | 8 roles are authoritative — legacy docs updated | EXECUTED | AUTO_CLOSED_REGISTER.md#rod-11 |
| GAP-B8 | Webhook secret minimum length | FIXED | AUTO_CLOSED_REGISTER.md#gap-b8 |
| GAP-B9 | OpenSearch not used — Postgres ILIKE confirmed | CLOSED | AUTO_CLOSED_REGISTER.md#gap-b9 |
| GAP-B10 | pgvector not required — JSONB used | CLOSED | AUTO_CLOSED_REGISTER.md#gap-b10 |
| GAP-B12 | Analytics schema extracted | CLOSED | AUTO_CLOSED_REGISTER.md#gap-b12 |
| GAP-B15 | Integration webhook covers all 64 topics | FIXED | AUTO_CLOSED_REGISTER.md#gap-b15 |
| GAP-G2 | Campaign ownership reclassification | CLOSED | AUTO_CLOSED_REGISTER.md#gap-g2 |
| GAP-G7 | AI architecture doc cross-checked | CLOSED | AUTO_CLOSED_REGISTER.md#gap-g7 |
| GAP-G10 | Role model conflict — 8 roles authoritative | CLOSED | AUTO_CLOSED_REGISTER.md#gap-g10 |
| GAP-G11 | postgres-init.sql schema name bug | FIXED | AUTO_CLOSED_REGISTER.md#gap-g11 |
| GAP-FE4 | Engagement removal — frontend unaffected | CLOSED | AUTO_CLOSED_REGISTER.md#gap-fe4 |
| GAP-FE5 | JWT permissions empty — DB-lookup pattern clarified | CLOSED | AUTO_CLOSED_REGISTER.md#gap-fe5 |
| GAP-FE6 | Interactive entity names — no frontend impact | CLOSED | AUTO_CLOSED_REGISTER.md#gap-fe6 |
| GAP-FE8 | No WebSocket — polling accepted for Phase E | CLOSED | AUTO_CLOSED_REGISTER.md#gap-fe8 |
| GAP-FE10 | System roles read-only — isSystem field confirmed | CLOSED | AUTO_CLOSED_REGISTER.md#gap-fe10 |
| TBD-O1 | Organization entity purpose | CLOSED | AUTO_CLOSED_REGISTER.md#tbd-o1 |
| TBD-O2 | TenantSettings creation timing | CLOSED | AUTO_CLOSED_REGISTER.md#tbd-o2 |
| TBD-O3 | EventSettings existence confirmed missing | CLOSED | AUTO_CLOSED_REGISTER.md#tbd-o3 |
| TBD-O4 | Commerce event chain | CLOSED | AUTO_CLOSED_REGISTER.md#tbd-o4 |
| TBD-O5 | Integration topic coverage | CLOSED | AUTO_CLOSED_REGISTER.md#tbd-o5 |
| UC-1 | Outbox relay is used for publishing | CLOSED (FALSE) | AUTO_CLOSED_REGISTER.md#uc-1 |
| UC-2 | TenantScopedRepository enforces isolation | CLOSED (PARTIALLY FALSE) | AUTO_CLOSED_REGISTER.md#uc-2 |
| UC-3 | All 64 Kafka topics covered by integration | CLOSED (TRUE after fix) | AUTO_CLOSED_REGISTER.md#uc-3 |
| UC-4 | Payment service knows the gateway | CLOSED (FALSE) | AUTO_CLOSED_REGISTER.md#uc-4 |
| UC-5 | Fulfillment subscribes to payment.completed | CLOSED (FALSE) | AUTO_CLOSED_REGISTER.md#uc-5 |
| UC-6 | USER_ROLES doc has correct role names | CLOSED (FALSE — corrected) | AUTO_CLOSED_REGISTER.md#uc-6 |
| UC-7 | AI embeddings are functional | CLOSED (FALSE) | AUTO_CLOSED_REGISTER.md#uc-7 |
| UC-8 | OpenSearch is used for search | CLOSED (FALSE) | AUTO_CLOSED_REGISTER.md#uc-8 |
| UC-9 | Cursor pagination is exceptions-only (orders) | CLOSED (PARTIAL — also notifications) | AUTO_CLOSED_REGISTER.md#uc-9 |
| ITBD-1 | INTEGRATION_CATALOG §4 outbox claim | CORRECTED | AUTO_CLOSED_REGISTER.md#itbd-1 |
| ITBD-2 | INTEGRATION_CATALOG §6 OpenSearch TBD | CORRECTED | AUTO_CLOSED_REGISTER.md#itbd-2 |
| ITBD-3 | INTEGRATION_CATALOG §8 Email/SMS TBD | RESOLVED | AUTO_CLOSED_REGISTER.md#itbd-3 |
| ITBD-4 | INTEGRATION_CATALOG §9 Object Storage TBD | RESOLVED | AUTO_CLOSED_REGISTER.md#itbd-4 |
| ITBD-5 | AUTH_AND_TENANCY_CONTRACT §7 TenantSettings TBD | CORRECTED | AUTO_CLOSED_REGISTER.md#itbd-5 |

---

## SAFE-DEFAULT Items (29)

Items resolved through safe deterministic defaults. Implement recommended path unless owner explicitly rejects.

| ID | Title | Status | Register Entry |
|---|---|---|---|
| ROD-1 / OCR-1 | Remove EngagementModule (dead code) | QUEUED — REQUIRES_APPROVAL | SAFE_DEFAULT_REGISTER.md#rod-1 |
| ROD-3 / OCR-2 | Apply 23-permission taxonomy to 22 controllers | QUEUED — REQUIRES_APPROVAL | SAFE_DEFAULT_REGISTER.md#rod-3 |
| ROD-6 / OCR-3 | Prefix-ID refresh token (O(n) bcrypt fix) | QUEUED — REQUIRES_APPROVAL | SAFE_DEFAULT_REGISTER.md#rod-6 |
| ROD-7 / OCR-4 | Postgres-backed Event DLQ | QUEUED — REQUIRES_APPROVAL | SAFE_DEFAULT_REGISTER.md#rod-7 |
| ROD-9 / OCR-5 | EventSettings entity + GET/PUT endpoints | QUEUED — REQUIRES_APPROVAL | SAFE_DEFAULT_REGISTER.md#rod-9 |
| ROD-10 / GAP-B14 | AI embedding via OpenAI (OPENAI_API_KEY in env) | QUEUED — REQUIRES_APPROVAL | SAFE_DEFAULT_REGISTER.md#rod-10 |
| GAP-B1 | Apply @RequirePermissions to 22 controllers | PENDING OCR-2 | SAFE_DEFAULT_REGISTER.md#gap-b1 |
| GAP-B2 | Write unit tests for 22 services | AUTONOMOUS | SAFE_DEFAULT_REGISTER.md#gap-b2 |
| GAP-B3 | JWT empty permissions — DB-lookup model is correct | DOCUMENTED (no change needed) | SAFE_DEFAULT_REGISTER.md#gap-b3 |
| GAP-B4 | O(n) bcrypt — fix via OCR-3 | PENDING OCR-3 | SAFE_DEFAULT_REGISTER.md#gap-b4 |
| GAP-B5 | Controller path collisions — low risk documented | MONITORED | SAFE_DEFAULT_REGISTER.md#gap-b5 |
| GAP-B6 | No Kafka DLQ — fix via OCR-4 | PENDING OCR-4 | SAFE_DEFAULT_REGISTER.md#gap-b6 |
| GAP-B7 | No Kafka schema registry — TypeScript contracts sufficient | DOCUMENTED | SAFE_DEFAULT_REGISTER.md#gap-b7 |
| GAP-B11 | EventSettings entity missing — fix via OCR-5 | PENDING OCR-5 | SAFE_DEFAULT_REGISTER.md#gap-b11 |
| GAP-B13 | EngagementModule dead code — fix via OCR-1 | PENDING OCR-1 | SAFE_DEFAULT_REGISTER.md#gap-b13 |
| GAP-G1 | progress.md stale — update or retire | AUTONOMOUS (SAFE_HYGIENE) | SAFE_DEFAULT_REGISTER.md#gap-g1 |
| GAP-G3 | Campaign placement — update canon docs | AUTONOMOUS (SAFE_HYGIENE) | SAFE_DEFAULT_REGISTER.md#gap-g3 |
| GAP-G4 | Test coverage critically low | AUTONOMOUS | SAFE_DEFAULT_REGISTER.md#gap-g4 |
| GAP-G5 | Permission coverage unverified | PENDING OCR-2 | SAFE_DEFAULT_REGISTER.md#gap-g5 |
| GAP-G6 | SSO/webhook security hardening | REQUIRES_APPROVAL (pre-production) | SAFE_DEFAULT_REGISTER.md#gap-g6 |
| GAP-G8 | Frontend stack version unconfirmed | VERIFY at Phase E kickoff | SAFE_DEFAULT_REGISTER.md#gap-g8 |
| GAP-G9 | Entity naming deviations — update canon docs | AUTONOMOUS (SAFE_HYGIENE) | SAFE_DEFAULT_REGISTER.md#gap-g9 |
| GAP-FE1 | EventSettings UI — graceful degradation | PHASE E: build with "Settings not yet configured" empty state | SAFE_DEFAULT_REGISTER.md#gap-fe1 |
| GAP-FE2 | AI search — full-text fallback | PHASE E: build with full-text only; AI copy added when ROD-10 ships | SAFE_DEFAULT_REGISTER.md#gap-fe2 |
| GAP-FE3 | Permission guards — RoleGuard now, PermissionGate when OCR-2 lands | PHASE E: RoleGuard active | SAFE_DEFAULT_REGISTER.md#gap-fe3 |
| GAP-FE7-A | S-06 checkout scaffold with placeholder payment form | PHASE E: BUILDABLE (placeholder form, Steps 1/2/4 functional) | SAFE_DEFAULT_REGISTER.md#gap-fe7a |
| GAP-FE9 | SSO warning banner in S-28 | PHASE E: BUILDABLE (amber banner, dismissible per session) | SAFE_DEFAULT_REGISTER.md#gap-fe9 |
| NF-3 | SponsorPackage no tenantId — audit during Phase E | MONITORING | SAFE_DEFAULT_REGISTER.md#nf-3 |
| DELTA-7 | api-standards.md specifies cursor; code uses page-based | AUTONOMOUS (SAFE_HYGIENE) | SAFE_DEFAULT_REGISTER.md#delta-7 |

---

## OUT-OF-SCOPE Items (10)

Items intentionally deferred from Phase E. Not blockers. Resume when prerequisites are met.

| ID | Title | Deferred Until | Register Entry |
|---|---|---|---|
| GAP-FE7-B | Payment gateway SDK integration (Step 3 only) | When gateway credentials provisioned (EXT-1) | OUT_OF_SCOPE_REGISTER.md#gap-fe7b |
| OOS-2 | Webhook HMAC signing + SSO assertion verification (GAP-G6 hardening) | Pre-production security sprint | OUT_OF_SCOPE_REGISTER.md#security-hardening |
| OOS-3 | Kafka schema registry (Avro/Protobuf) | When external webhook consumers require formal schemas | OUT_OF_SCOPE_REGISTER.md#schema-registry |
| OOS-4 | Microservices extraction (C-4) | Requires new ADR + explicit owner decision | OUT_OF_SCOPE_REGISTER.md#microservices |
| OOS-5 | Mobile native application (iOS/Android) | Post-Phase E product decision | OUT_OF_SCOPE_REGISTER.md#mobile |
| OOS-6 | Regional payment gateways (JazzCash, Easypaisa) | After Stripe launched; per-gateway merchant onboarding | OUT_OF_SCOPE_REGISTER.md#regional-payments |
| OOS-7 | Tax/regulatory compliance module (FBR/GST/VAT) | When regulatory compliance is a launch requirement | OUT_OF_SCOPE_REGISTER.md#tax |
| OOS-8 | Advanced AI features (agentic automation, matchmaking) | Post-ROD-10 implementation; separate product phase | OUT_OF_SCOPE_REGISTER.md#advanced-ai |
| OOS-9 | Hardware integrations (badge printers, QR scanners) | After hardware vendor selection and SDK documented | OUT_OF_SCOPE_REGISTER.md#hardware |

---

## OWNER-DECISION Items (0 pending)

No owner decisions are currently pending. All items resolved via compression pass (2026-06-17).

See OWNER_DECISION_REGISTER.md for:
- Historical decisions (HIST-1 ROD-10, HIST-2 GAP-FE7)
- Frozen architectural decisions (8 decisions)
- Future decision template

---

## External Dependencies (10 tracked)

See EXTERNAL_DEPENDENCY_REGISTER.md for all external onboarding requirements.

| ID | Dependency | Status | Blocks |
|---|---|---|---|
| EXT-1 | Payment gateway (Stripe recommended) | NOT PROVISIONED | Production commerce; GAP-FE7-B |
| EXT-2 | Production SMTP provider | PARTIAL (env vars set) | Production email |
| EXT-3 | OpenAI API key | PROVISIONED (in env) | ROD-10 implementation |
| EXT-4 | Google Gemini API key | PROVISIONED (in env) | Alternative to EXT-3 |
| EXT-5 | DeepSeek API key | PROVISIONED (in env) | Alternative to EXT-3 |
| EXT-6 | Production Kafka cluster | LOCAL ONLY | Production deployment |
| EXT-7 | Production Redis instance | LOCAL ONLY | Production deployment |
| EXT-8 | Production PostgreSQL instance | LOCAL ONLY | Production deployment |
| EXT-9 | Domain + SSL certificate | NOT PROVISIONED | Production launch |
| EXT-10 | JWT_SECRET production rotation | MUST ROTATE | Production security |

External dependencies do NOT block development. They are prerequisites for production launch only.

---

## Phase History

| Phase | Date | Verdict | Output |
|---|---|---|---|
| Phase 1 — Governance Implementation | 2026-06-15 | GO | 17 authority docs |
| Phase 2 — Backend Authority Capture | 2026-06-15 | GO | 21 backend docs |
| Doc Normalization | 2026-06-15 | GO | 7 reports |
| Full Repo Reality Audit | 2026-06-17 | GO (with A-4 action) | 9 reports; GAP-G11 found |
| Hygiene Governance | 2026-06-17 | GO | SAFE_REPOSITORY_HYGIENE tier |
| Pre-Frontend Delta Audit | 2026-06-17 | GO | 42 deltas corrected |
| Phase 2.9 — Determinability Review | 2026-06-17 | CONDITIONAL GO | 7 reports; 11 RODs |
| Phase 2.95 — Decision Collapse | 2026-06-17 | GO | All 11 RODs collapsed |
| Phase 3 — Frontend Authority Capture | 2026-06-17 | GO | 12 docs; 91 routes; 28 screens |
| Phase 3.25 — Gap Elimination | 2026-06-17 | NEARLY DETERMINED | 4 reports; 7 doc corrections |
| Final Gap Closure Pass | 2026-06-17 | FULLY DETERMINED | 68 items classified |
| Owner-Required Compression | 2026-06-17 | OWNER-REQUIRED = 0 | ROD-10 + GAP-FE7 compressed |
| Project Memory Layer | 2026-06-17 | ESTABLISHED | 8 memory files |
| Phase 3.5 — L0 Input Freeze | 2026-06-20 | **L0 FROZEN** | 4 L0 docs; Claude Design authorized |

---

**Source documents**: `docs/08_reports/FINAL_CLASSIFIED_REGISTER.md`, `docs/08_reports/OWNER_REQUIRED_COMPRESSION_REPORT.md`, `docs/03_frontend_authority/L0_FRONTEND_AUTHORITY_INPUT_FREEZE.md`
**Established**: 2026-06-17
**Last updated**: 2026-06-20
