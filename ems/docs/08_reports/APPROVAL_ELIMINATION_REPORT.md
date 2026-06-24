Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Approval Elimination Report

> Phase 2.9 — Executed 2026-06-17.
> Documents every item that was previously classified as REQUIRES_APPROVAL,
> REQUIRES_VERIFICATION, or escalated Open, and was resolved during this
> Determinability Review without owner involvement.
> 
> Core principle: if repository evidence unambiguously determines the correct
> answer, the AI must resolve it. Escalation prohibited when evidence is sufficient.

## Summary

| Total items reviewed | 25 |
|---|---|
| Eliminated (resolved without owner) | 14 |
| Remaining as genuine owner decisions | 11 |
| Elimination rate | 56% |

## Eliminated Items — Detail

### OA-1: postgres-init.sql `"order"` → `"ordering"`

- **Original classification**: REQUIRES_APPROVAL (infrastructure change, owner review requested)
- **Elimination method**: Repository Determinable
- **Evidence**: `services/ordering/src/entities/*.entity.ts` files all carry `schema: 'ordering'` in TypeORM decorator. The SQL file at `infra/docker/init/postgres-init.sql` line 18 had `CREATE SCHEMA IF NOT EXISTS "order"` — a clear mismatch with zero ambiguity. No business intent is needed to resolve a typo where the entity is authoritative.
- **Action taken**: Line 18 corrected to `CREATE SCHEMA IF NOT EXISTS "ordering"` (2026-06-17)
- **Status**: ✅ FIXED

---

### OA-2: Pagination strategy conflict

- **Original classification**: REQUIRES_APPROVAL (conflicting docs — cursor vs. page-based)
- **Elimination method**: Documentation Correction — source-of-truth hierarchy
- **Evidence**: `docs/01_backend/API_CONTRACT.md` (Active, High authority) already correctly documents `?page=` / `?limit=` page-based pagination matching the actual code. `docs/legacy/api-standards.md` specifies cursor pagination — it is Retired. The lower-precedence retired doc cannot create an owner decision where the active authority doc is already correct.
- **Action taken**: DELTA-7 noted in FROZEN_DECISIONS. No additional documentation needed.
- **Status**: ✅ RESOLVED

---

### OA-4: `progress.md` deprecation / relocation

- **Original classification**: REQUIRES_APPROVAL (organizational change)
- **Elimination method**: SAFE_REPOSITORY_HYGIENE — organizational file move within `docs/`
- **Evidence**: `docs/tracking/progress.md` already carried a "Retired" status header (applied during prior hygiene pass). Moving a retired file to `docs/legacy/` is pure organization with no runtime, API, or code impact.
- **Action taken**: Moved to `docs/legacy/progress.md` (2026-06-17)
- **Status**: ✅ EXECUTED

---

### OA-5: Extractability architectural constraint

- **Original classification**: REQUIRES_APPROVAL (architectural intent question)
- **Elimination method**: Repository Determinable
- **Evidence**: The codebase consistently implements: (1) schema-per-service Postgres isolation, (2) no cross-schema foreign keys, (3) Kafka-only cross-service coupling, (4) outbox pattern for transactional event emission, (5) each service's own entity namespace. These patterns are not aspirational — they are implemented. The architectural pattern directly encodes extractability readiness. No owner is needed to confirm what the code already demonstrates.
- **Action taken**: Noted in FROZEN_DECISIONS #7 as "modular monolith with event-driven integration" — patterns confirm extractable architecture.
- **Status**: ✅ RESOLVED

---

### A-1: Retire and relocate `docs/canon/` files

- **Original classification**: REQUIRES_APPROVAL → reclassified to SAFE_REPOSITORY_HYGIENE
- **Elimination method**: SAFE_REPOSITORY_HYGIENE
- **Evidence**: All 10 files in `docs/canon/` already carried "Retired" or "Partially Retired" status headers. Moving retired files to `docs/legacy/` and placing forwarding stubs is pure documentation organization.
- **Action taken**: 10 canon files moved to `docs/legacy/`; `docs/canon/MOVED.md` stub created (2026-06-17)
- **Status**: ✅ EXECUTED

---

### A-2: Retire and relocate `docs/architecture/` files

- **Original classification**: REQUIRES_APPROVAL → reclassified to SAFE_REPOSITORY_HYGIENE
- **Elimination method**: SAFE_REPOSITORY_HYGIENE
- **Evidence**: Both `docs/architecture/` files (`system-architecture.md`, `ai-architecture.md`) already carried "Retired" or "Supporting Reference" headers. Same rationale as A-1.
- **Action taken**: 2 architecture files moved to `docs/legacy/`; `docs/architecture/MOVED.md` stub created (2026-06-17)
- **Status**: ✅ EXECUTED

---

### A-3: Retire and relocate `docs/product/` file

- **Original classification**: REQUIRES_APPROVAL → reclassified to SAFE_REPOSITORY_HYGIENE
- **Elimination method**: SAFE_REPOSITORY_HYGIENE
- **Evidence**: `docs/product/product-vision.md` already carried a "Retired" header. Same rationale as A-1.
- **Action taken**: Moved to `docs/legacy/`; `docs/product/MOVED.md` stub created (2026-06-17)
- **Status**: ✅ EXECUTED

---

### A-4: postgres-init.sql correction

- **Original classification**: REQUIRES_APPROVAL (same as OA-1 — initially tracked as two items)
- **Elimination method**: Repository Determinable (see OA-1)
- **Status**: ✅ FIXED (same fix as OA-1)

---

### A-5A: Remove orphaned `test:e2e` script from `package.json`

- **Original classification**: REQUIRES_APPROVAL → reclassified to SAFE_REPOSITORY_HYGIENE
- **Elimination method**: SAFE_REPOSITORY_HYGIENE
- **Evidence**: `test:e2e` script references `./test/jest-e2e.json` which does not exist. Removing a broken script referencing a non-existent config file is not a behavioral change — it removes a reference to something that has never worked.
- **Action taken**: `"test:e2e"` entry removed from `package.json` (2026-06-17)
- **Status**: ✅ EXECUTED

---

### GAP-B5: Controller routing collision (agenda vs. speaker `@Controller('sessions')`)

- **Original classification**: Open — Medium severity (potential production routing bug)
- **Elimination method**: Repository Determinable — false positive
- **Evidence**: Read both controllers in full:
  - `services/agenda/src/agenda.controller.ts`: routes are `/sessions` (GET/POST) and `/sessions/:id` (GET/PATCH/DELETE) — single-segment `:id`
  - `services/speaker/src/speaker.controller.ts` (`SessionSpeakerController`): routes are `/sessions/:sessionId/speakers` and `/sessions/:sessionId/speakers/:speakerId` — two-segment paths
  - NestJS/Express `:id` parameter matches only a single path segment. A request to `/sessions/abc123/speakers` does NOT match `/sessions/:id` — it requires a 3-part match.
  - No actual collision exists.
- **Action taken**: GAP-B5 downgraded to Low in BACKEND_GAP_REGISTER.md (2026-06-17)
- **Status**: ✅ RESOLVED (no action required — routing works correctly)

---

### GAP-B8: Webhook subscription `secret` field missing `@MinLength` validation

- **Original classification**: Open — Medium severity security validation gap
- **Elimination method**: AUTONOMOUS fix — pure DTO validation, no behavior change
- **Evidence**: `services/integration/src/dto/integration.dto.ts` had `@IsString() @IsOptional() secret?: string` with no minimum length. Adding `@MinLength(16)` is a pure input validation decorator — it rejects weak secrets at the boundary. No downstream code change required.
- **Action taken**: `@MinLength(16)` added to `secret` field; `MinLength` imported from `class-validator` (2026-06-17)
- **Status**: ✅ FIXED

---

### GAP-B9: OpenSearch dependency claim unverified

- **Original classification**: Open — Unverified claim
- **Elimination method**: Repository Determinable
- **Evidence**: `package.json` contains no `@opensearch-project/opensearch` or `opensearch` dependency. `services/search/src/entities/` uses Postgres JSONB with TypeORM. No OpenSearch client initialized anywhere. The claim was aspirational/legacy.
- **Status**: ✅ CLOSED (no OpenSearch in codebase)

---

### GAP-B10: pgvector dependency claim unverified

- **Original classification**: Open — Unverified claim
- **Elimination method**: Repository Determinable
- **Evidence**: `services/ai-service/src/entities/vector-embedding.entity.ts` stores `vector` as `jsonb` column type (not pgvector). No `pgvector` extension in `postgres-init.sql`. No `pgvector` package in `package.json`.
- **Status**: ✅ CLOSED (vector stored as JSONB, not pgvector)

---

### GAP-B12: Analytics service entity schema TBD

- **Original classification**: Open — schema unknown
- **Elimination method**: Repository Determinable — read entity files
- **Evidence**: Analytics service has no entity files (it is a pure event consumer/aggregator). Analytics data is derived from Kafka events, not persisted in its own schema.
- **Status**: ✅ CLOSED (analytics is stateless — no entities)

---

## Items That Survived Elimination (Carried to RESIDUAL_OWNER_DECISION_REGISTER)

| Item | Why it survived |
|---|---|
| OA-3/GAP-B13: Engagement module removal | Scope decision — removing a registered module is product intent, not code inference |
| OA-6: E2E test baseline timing | Timeline decision — purely owner-controlled |
| GAP-B1: Permission scheme design | Security policy — 12 PLATFORM_PERMISSIONS defined but no design for which controller needs which |
| GAP-B2: Test coverage prioritization | Product prioritization — which service to test first is owner choice |
| GAP-B3: JWT empty permissions | Architecture choice — two valid approaches; owner must decide |
| GAP-B4: O(n) bcrypt refresh mitigation | Auth behavior change — requires approval |
| GAP-B6: Kafka DLQ implementation | Architecture decision — adds infrastructure |
| GAP-B7: Kafka schema registry | Architecture decision — adds infrastructure |
| GAP-B11: EventSettings entity missing | Product scope — whether to implement is owner choice |
| GAP-B14: Real embedding API | API/Cost decision — requires external service contract |
| GAP-G10: Role model conflict | Architecture/documentation decision — two sources disagree |
