Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Residual Owner Decision Register

> Phase 2.9 — Executed 2026-06-17.
> Contains only items that genuinely require owner/product/architecture
> decisions and cannot be resolved from repository evidence alone.
> 
> All 27 items that could be resolved from repository evidence have been
> resolved. The 11 items below are the irreducible residual set.
> 
> See APPROVAL_ELIMINATION_REPORT.md for items eliminated before this list.

## Decision Items

### ROD-1: Engagement Module Fate

- **Source**: OA-3, GAP-B13, GAP-G3
- **Decision type**: Product Policy Decision
- **Severity**: Medium
- **Evidence summary**:
  - `services/engagement/src/engagement.controller.ts` contains only a 2-line comment: "Controllers for connections, polls, Q&A, and surveys have moved to the `networking` and `interactive-engagement` services."
  - No controller class, no routes, no entity directory, no Kafka consumers.
  - `services/engagement/src/engagement.service.ts` is a 6-line stub.
  - `services/engagement/src/engagement.module.ts` is an 8-line module registering only `EngagementService`.
  - `Campaign` and `AudienceSegment` entities are implemented under `services/notification`, not `engagement`.
  - Module IS registered in `apps/api/src/app.module.ts`.
- **Options**:
  1. Remove `EngagementModule` from `app.module.ts` and delete `services/engagement/` — aligns code with reality, eliminates dead module
  2. Repurpose `EngagementModule` to own Campaign/AudienceSegment (would require moving entities from notification) — large refactor
  3. Leave as-is — low cost but keeps dead code
- **AI recommendation**: Option 1 (remove). Evidence is overwhelming for removal. Repository risk: very low (no routes, no entities, no consumers).
- **Blocks frontend**: Yes — do not build engagement-module-specific frontend pages until decided.
- **Decision required from**: Product owner / architect

---

### ROD-2: E2E Test Baseline Timing

- **Source**: OA-6
- **Decision type**: Product Policy Decision
- **Severity**: Medium
- **Evidence summary**:
  - Only 4/26 services have any `.spec.ts` files (`auth`, `notification`, `onsite`, `order` — 1 each).
  - CI passes with `--passWithNoTests` — zero-test services do not fail CI.
  - No `jest-e2e.json` existed (script was removed as A-5A).
- **Options**:
  1. Establish test coverage requirement before Phase E begins (testing phase)
  2. Begin Phase E (frontend) in parallel with gradual test coverage build-up
  3. Defer testing until after Phase E
- **AI recommendation**: Option 2. Writing tests for all 22 uncovered services before Phase E would add 4–6 weeks. Phase E (frontend) does not depend on backend test coverage. Risk: backend regressions during Phase E have no automated safety net.
- **Decision required from**: Product owner

---

### ROD-3: Permission Scheme Design (`@RequirePermissions` coverage)

- **Source**: GAP-B1, GAP-G5
- **Decision type**: Security Policy Decision
- **Severity**: High (pre-production security concern)
- **Evidence summary**:
  - 12 `PLATFORM_PERMISSIONS` are defined in `services/rbac/src/rbac.service.ts`.
  - Only 4 controllers use `@RequirePermissions`: `auth`, `audit`, `rbac`, `tenant`.
  - 22 controllers rely only on `JwtAuthGuard` (authentication, no fine-grained authorization).
  - `PermissionsGuard` infrastructure exists and works — it is applied inconsistently.
- **Options**:
  1. Audit each of the 22 controllers and assign appropriate permissions before Phase E
  2. Extend the 12 PLATFORM_PERMISSIONS to cover all controller operations first, then apply
  3. Accept authentication-only protection for Phase E and add authorization in a security hardening sprint
- **AI recommendation**: Option 2 then 1. Define the full permission taxonomy first, then apply. This is architecture work needed before the frontend permission-gate layer can be designed correctly.
- **Blocks frontend**: Partially — frontend permission-gated UI cannot be designed correctly until the permission taxonomy is finalized.
- **Decision required from**: Security lead / architect

---

### ROD-4: Test Coverage Service Prioritization

- **Source**: GAP-B2, GAP-G4
- **Decision type**: Product Policy Decision
- **Severity**: High (operational risk)
- **Evidence summary**:
  - 22 services have zero test coverage.
  - No repository evidence can determine which service is highest priority to test first.
  - `auth`, `payment`, `order`, `registration`, `tenant` are highest-risk based on business criticality.
- **Decision required from**: Product owner / tech lead
- **Note**: Adding tests is AUTONOMOUS per the decision matrix — once priorities are set, AI can write tests without further approval.

---

### ROD-5: JWT Empty Permissions Architecture

- **Source**: GAP-B3
- **Decision type**: Architecture Decision
- **Severity**: Medium
- **Evidence summary**:
  - JWT tokens are issued with `permissions: []` (empty array) by `services/auth/src/auth.service.ts`.
  - `PermissionsGuard` reads permissions from the JWT payload — so all permission checks currently pass vacuously for the 4 controllers that use `@RequirePermissions`.
  - Two valid approaches:
    1. **JWT snapshot**: embed user's current permissions in the JWT at issue time (requires token refresh on role change)
    2. **DB lookup on each request**: resolve permissions from RBAC service/DB per request (always current, higher latency)
- **AI recommendation**: DB lookup (option 2) — current code structure (RBAC service with `getUserPermissions()`) already supports this and avoids stale-permission problems. JWT approach would require handling permission invalidation.
- **Decision required from**: Architect

---

### ROD-6: O(n) bcrypt on Token Refresh Mitigation

- **Source**: GAP-B4
- **Decision type**: Architecture Decision
- **Severity**: Medium
- **Evidence summary**:
  - `services/auth/src/auth.service.ts` bcrypt-hashes the refresh token and queries `UserCredential` table by scanning all rows to find matching hashed values — O(n) on the credential table.
  - Fix options: (a) store a hash index of the token, (b) store refresh token in Redis with fast lookup, (c) use a structured token with embedded ID prefix for indexed lookup.
  - Any fix modifies auth behavior and session lifecycle — REQUIRES APPROVAL.
- **AI recommendation**: Option (c) — prefix the refresh token with a unique ID stored in the DB, allowing O(1) lookup by the ID prefix while still validating the full token via bcrypt.
- **Decision required from**: Architect

---

### ROD-7: Kafka Dead Letter Queue Implementation

- **Source**: GAP-B6
- **Decision type**: Architecture Decision
- **Severity**: High (reliability concern)
- **Evidence summary**:
  - `EventBusService` catches Kafka publish errors, logs them, and does NOT retry after producer retry exhaustion.
  - Failed events are silently lost.
  - DLQ implementation would require: new Kafka topic(s), retry logic, monitoring/alerting.
- **AI recommendation**: Implement DLQ before production. A DLQ is standard practice for Kafka-based systems. Impact: adds infrastructure but no API surface change.
- **Decision required from**: Architect / DevOps

---

### ROD-8: Kafka Schema Registry

- **Source**: GAP-B7
- **Decision type**: Architecture Decision
- **Severity**: Medium
- **Evidence summary**:
  - Event payload shapes are TypeScript-only contracts — no Avro/Protobuf schema registry.
  - With 64 topics and 26 services, payload shape drift is a risk.
  - Adding a schema registry (Confluent or AWS Glue) adds infrastructure and requires serialization format change.
- **AI recommendation**: Document a TypeScript-interface contract for each of the 64 topics as a lower-cost alternative to a full registry. Full schema registry is Phase E+ work.
- **Decision required from**: Architect

---

### ROD-9: EventSettings Entity Implementation

- **Source**: GAP-B11
- **Decision type**: Product Policy Decision
- **Severity**: Medium
- **Evidence summary**:
  - `docs/00_authority/DOMAIN_MODEL.md` and canon docs reference `EventSettings` as an entity under `services/event`.
  - `services/event/src/entities/` contains only `event.entity.ts`, `venue.entity.ts`, `room.entity.ts` — no `event-settings.entity.ts`.
  - Event settings (registration open/close dates, capacity limits, branding) have no dedicated storage.
- **Decision required from**: Product owner (implement as new entity, or fold settings into `Event` entity)

---

### ROD-10: Real Embedding API Connection

- **Source**: GAP-B14
- **Decision type**: API/Cost Decision
- **Severity**: Medium (feature gap — search/recommendations non-functional)
- **Evidence summary**:
  - `services/ai-service/src/ai.service.ts` `upsertEmbedding()` stores `vector: []` and `modelVersion: 'placeholder-v0'`.
  - `embedding.updated` events are published but carry meaningless data.
  - All vector similarity features (semantic event search, speaker recommendations, content suggestions) are non-functional.
  - Connecting to a real embedding API (OpenAI `text-embedding-3-small`, Cohere, etc.) requires API key management and per-call cost.
- **Decision required from**: Product owner / API vendor selection

---

### ROD-11: Role Model Conflict

- **Source**: GAP-G10
- **Decision type**: Architecture/Documentation Decision
- **Severity**: High (governance and frontend RBAC design depend on authoritative role list)
- **Evidence summary**:
  - `docs/legacy/security-model.md` (canon) defines 9 roles.
  - `services/rbac/src/rbac.service.ts` `seedDefaultRoles()` implements 8 roles with different names and permission sets.
  - Both cannot be correct.
  - Frontend RBAC-gated UI and role management screens depend on the authoritative role list.
- **Options**:
  1. Code is authoritative — update documentation to match the 8 code roles (AUTONOMOUS)
  2. Canon doc is authoritative — add the missing 9th role to code and reconcile names (REQUIRES APPROVAL)
- **AI recommendation**: Option 1 — code is always the source of truth per this project's governance policy. The 8 implemented roles should be documented as authoritative.
- **Decision required from**: Architect / product owner (to confirm code is the intended state)

---

## Decision Summary

| ID | Description | Type | Severity | Blocks Frontend? |
|---|---|---|---|---|
| ROD-1 | Engagement module removal | Product Policy | Medium | Yes (engagement UI) |
| ROD-2 | E2E test baseline timing | Product Policy | Medium | No |
| ROD-3 | Permission scheme design | Security Policy | High | Partially (permission-gated UI) |
| ROD-4 | Test coverage prioritization | Product Policy | High | No |
| ROD-5 | JWT permissions architecture | Architecture | Medium | No |
| ROD-6 | O(n) bcrypt mitigation | Architecture | Medium | No |
| ROD-7 | Kafka DLQ | Architecture | High | No |
| ROD-8 | Kafka schema registry | Architecture | Medium | No |
| ROD-9 | EventSettings entity | Product Policy | Medium | Partially (event settings UI) |
| ROD-10 | Real embedding API | API/Cost | Medium | Partially (search/recommendation UI) |
| ROD-11 | Role model conflict | Architecture/Doc | High | Yes (role management UI) |

**Hard frontend blockers (must be decided before building those UI areas):**
- ROD-1: Do not build engagement-specific pages until fate is decided
- ROD-3: Do not design permission-gated UI until permission taxonomy is finalized
- ROD-11: Do not build role management UI until authoritative role list is confirmed

**Frontend-safe to proceed without:**
- ROD-2, ROD-4, ROD-5, ROD-6, ROD-7, ROD-8 — infrastructure/testing concerns, not API surface concerns
- ROD-9, ROD-10 — build the UI with graceful degradation for missing data
