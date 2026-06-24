Status: Active
Authority Level: High
Last Reviewed: 2026-06-20
Owner: Project Owner

# Owner Decision Register

> Contains genuine product and business decisions that require owner input.
> Items here affect product behaviour, commercial strategy, or business policy
> in ways that cannot be inferred from repository evidence.
>
> **Current status**: 0 decisions pending.
> All previously-open owner-required items were resolved via the compression
> pass (2026-06-17). See OWNER_REQUIRED_COMPRESSION_REPORT.md.
>
> This register also documents FROZEN_DECISIONS — architectural choices
> already made that are protected from change without a new ADR.

---

## Pending Decisions

**None.** OWNER-REQUIRED count = 0 as of 2026-06-17.

---

## Resolved Historical Decisions

Items that were classified OWNER-REQUIRED and subsequently resolved.

### HIST-1: Embedding API Vendor (Resolved → SAFE-DEFAULT)

| Field | Value |
|---|---|
| Item ID | HIST-1 (was ROD-10) |
| Title | AI embedding API vendor selection |
| Previous Classification | OWNER-REQUIRED |
| Final Classification | SAFE-DEFAULT |
| Resolution Date | 2026-06-17 |
| Resolution | `OPENAI_API_KEY` confirmed in environment — vendor implicitly selected. OpenAI `text-embedding-3-small` is the default. Owner can override by changing the implementation to use `GEMINI_API_KEY` or `DEEPSEEK_API_KEY`. |
| Override Condition | Owner explicitly selects Gemini or DeepSeek instead |
| Related Register | SAFE_DEFAULT_REGISTER.md#rod-10, EXTERNAL_DEPENDENCY_REGISTER.md#openai |

---

### HIST-2: Payment Gateway Provider (Resolved → SAFE-DEFAULT + OUT-OF-SCOPE split)

| Field | Value |
|---|---|
| Item ID | HIST-2 (was GAP-FE7) |
| Title | Payment gateway provider selection |
| Previous Classification | OWNER-REQUIRED |
| Final Classification | SPLIT — scaffold SAFE-DEFAULT; gateway integration OUT-OF-SCOPE |
| Resolution Date | 2026-06-17 |
| Resolution | Phase E checkout scaffold builds with placeholder form (SAFE-DEFAULT). Actual gateway account provisioning is an external dependency — tracked in EXTERNAL_DEPENDENCY_REGISTER.md. No owner policy decision is required; when credentials are available, Stripe Elements (recommended) is the implementation path. |
| Override Condition | Owner selects a non-Stripe gateway (PayPal, Braintree, etc.) — implementation changes; API contract does not |
| Related Register | SAFE_DEFAULT_REGISTER.md#gap-fe7a, OUT_OF_SCOPE_REGISTER.md#gap-fe7b, EXTERNAL_DEPENDENCY_REGISTER.md#payment-gateway |

---

## Frozen Decisions (Protected Architectural Choices)

These decisions are encoded in the codebase and protected by REVISED_DECISION_ESCALATION_MATRIX.md. Changing them requires a new ADR under `docs/06_decisions/`.

| Decision | Detail | ADR |
|---|---|---|
| Service boundaries | 26 services as defined in service-map.md and FEATURE_SCOPE.md §2 | ADR-001 |
| Schema-per-service Postgres | One Postgres schema per service; no cross-schema foreign keys | ADR-001 |
| No cross-service DB foreign keys | Cross-service references by ID + eventual consistency via Kafka | ADR-001 |
| Multi-tenancy model | Shared DB, shared schema, `tenant_id` row-level isolation (manual per-service filtering) | ADR-001 |
| API conventions | `/v1/` prefix, `{data, meta}` response envelope, Idempotency-Key header, RBAC via @RequirePermissions | ADR-001 |
| Event bus pattern | Kafka via `infra/event-bus`; direct publish (outbox relay infrastructure exists but unused) | ADR-001 |
| Single deployable backend | All 26 services in one NestJS process (modular monolith) | ADR-001 |
| Tech stack | NestJS 10 + TypeORM 0.3 + Postgres + Redis + Kafka + TypeScript 5.6 | ADR-001 |

---

## Future Decision Template

When a new owner decision is required, create an entry using this template:

```
## [DECISION-ID]: [Title]

| Field | Value |
|---|---|
| Item ID | [ID] |
| Title | [Title] |
| Classification | OWNER-DECISION |
| Current Status | PENDING / RESOLVED |
| Decision Required | [What specifically the owner must decide] |
| Options | [Option A / Option B / Option C] |
| Recommended | [Recommended option with rationale] |
| Affects | [Components / Routes / APIs / Workflows / Roles] |
| Blocking | YES / NO — [what it blocks] |
| Deadline | [If time-sensitive] |
| Resolution | [Filled in when resolved] |
| Resolution Date | [Date] |
```
