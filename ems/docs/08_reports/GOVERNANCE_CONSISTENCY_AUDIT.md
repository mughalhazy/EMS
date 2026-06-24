Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Governance Consistency Audit — Phase 1 Validation

> Audit scope: seven Phase 1 governance documents cross-checked against each
> other. Source: direct full reads of all seven documents on 2026-06-15.
> This is an audit-only report — no documents were modified during its
> production. Issue IDs use prefix `CA-` (Consistency Audit).

---

## CRITICAL ISSUES

Issues that would cause a new AI session to reach an incorrect conclusion or
take a wrong action without further verification.

---

### CA-001 | `PRODUCT_WORKFLOWS.md` §11 directly contradicts §10 on Campaign Delivery executability

**Documents**: `PRODUCT_WORKFLOWS.md`
**Type**: Internal contradiction

**§10** (Campaign Delivery) states, correctly:
> "Status: **Implemented**, but in a different service than `workflow-catalog.md`/`service-map.md` specify."

**§11** (Notes for AI Sessions) states, incorrectly:
> "Workflow 10 (Campaign Delivery) is the only one not currently executable
> end-to-end **due to the `engagement` service stub status**."

The §11 note was written before the §10 correction was made during the Phase 1
audit (GAP-G3 discovery). The note was never updated. A new AI session reading
§11 would conclude Campaign Delivery is broken, but `CampaignController` at
`/v1/campaigns` is fully implemented in `services/notification`.

**Fix required**: Replace the §11 note with: "All 10 workflows are executable
via direct API calls. Workflow 10 runs under `services/notification`
(not `engagement`) — see §10 and GAP-G3 in `ARCHITECTURAL_GAP_REGISTER.md`."

---

### CA-002 | `PROJECT_CHARTER.md` §4 and §7 state campaigns are unbuilt — contradicts three other documents

**Documents**: `PROJECT_CHARTER.md` vs `FEATURE_SCOPE.md`, `DOMAIN_MODEL.md`, `PRODUCT_WORKFLOWS.md`
**Type**: Cross-document contradiction + incorrect factual claim

**§4 row** (Engagement/Marketing):
> "notification, engagement (campaigns — stub, **see GAP-2**)"
> "Implemented (notification); engagement is a minimal stub"

**§7 row** (T3 Delivery Tier):
> "Notification, **campaigns (stub)**, analytics…"
> "Complete (**campaigns scope unbuilt** — see §4)"

Reality (verified by controller/entity grep during Phase 1):
- `Campaign` and `AudienceSegment` entities exist in `services/notification`.
- `CampaignController` at `/campaigns` with POST/GET/send endpoints is live.
- The `engagement` service stub is irrelevant to campaign executability.

`FEATURE_SCOPE.md` §2 (row 18), `DOMAIN_MODEL.md` §6, and `PRODUCT_WORKFLOWS.md`
§10 all correctly document this. `PROJECT_CHARTER.md` is the outlier.

Additionally, "see GAP-2" is a wrong cross-reference: **GAP-2** is about
`Poll`/`Q&A`/`Survey` migration to `networking`/`interactive-engagement`,
not about campaigns. The correct reference is **GAP-G3**.

**Fix required in `PROJECT_CHARTER.md`**:
1. §4: Update Engagement row note to remove "campaigns — stub, see GAP-2";
   replace with "notification implements Campaign/AudienceSegment (see GAP-G3)."
2. §7: Update T3 row to remove "campaigns (stub)" and "campaigns scope unbuilt."

---

### CA-003 | `AI_OPERATING_CONTEXT.md` references a non-existent section in `ADR-001`

**Documents**: `AI_OPERATING_CONTEXT.md` → `ADR-001_PROJECT_FOUNDATION.md`
**Type**: Broken internal reference

`AI_OPERATING_CONTEXT.md` CURRENT_PHASE states:
> "both are open per `06_decisions/ADR-001_PROJECT_FOUNDATION.md`
> **'Open Architectural Questions'**"

`ADR-001_PROJECT_FOUNDATION.md` has **no section called "Open Architectural
Questions."** Its sections are: Status, Context, Project Purpose, Current
Architecture, Core Technology Choices, Known Constraints, Major Assumptions,
Known Risks, Architectural Principles, Consequences.

The intent was to point at open questions in ADR-001, but those appear under
"Major Assumptions" and "Known Risks." An AI session following this reference
would find nothing under the cited heading.

**Fix required**: Change the reference to
`"ADR-001_PROJECT_FOUNDATION.md" 'Major Assumptions' and 'Known Risks'`
or add an "Open Architectural Questions" section to ADR-001 that consolidates
them.

---

### CA-004 | `PROJECT_CHARTER.md` §5 calls tenant isolation "middleware" — three other docs say "base repository"

**Documents**: `PROJECT_CHARTER.md` vs `DOMAIN_MODEL.md`, `AI_OPERATING_CONTEXT.md`, `ADR-001`
**Type**: Inconsistent naming — incorrect term in one document

`PROJECT_CHARTER.md` §5:
> "Multi-tenancy: every entity carries `tenant_id`; enforced via **tenant
> isolation middleware**"

All three other documents correctly say **"shared base repository (`infra/common`)"**:
- `DOMAIN_MODEL.md` §1: "enforced at the repository layer by a **shared base repository** (`infra/common`)"
- `AI_OPERATING_CONTEXT.md` FROZEN_DECISIONS #4: "enforced via **shared base repository** (`infra/common`)"
- `ADR-001` Current Architecture: "enforced by a **shared base repository** in `infra/common`"

"Middleware" implies HTTP middleware (e.g. a NestJS guard or interceptor), which
is a different layer. An AI session reading PROJECT_CHARTER might look for
middleware in `infra/common` or `apps/api` instead of the base repository class.
The enforcement is at the TypeORM repository layer, not the HTTP layer.

**Fix required**: Change PROJECT_CHARTER §5 to "enforced via shared base
repository (`infra/common`)."

---

## HIGH ISSUES

Significant inconsistencies that affect document correctness or could
cause incorrect implementation decisions.

---

### CA-005 | `DOMAIN_MODEL.md` §8 incorrectly assigns `Poll`/`PollResponse` to `networking`

**Documents**: `DOMAIN_MODEL.md`
**Type**: Domain entity mismatch — incorrect entity-to-service assignment

`DOMAIN_MODEL.md` §8:
> "networking (Batch 8) | networking | `Connection` (attendee-to-attendee
> social graph), **plus migrated `Poll`/`PollResponse` artifacts where applicable**"

Per `docs/tracking/gap-register.md` GAP-2 resolution (the authoritative record):
> "`Connection`/`Poll`/`PollResponse`/`QAQuestion`/`Survey`/`SurveyResponse`
> migrated out of `services/engagement` into dedicated `services/networking`
> and `services/interactive-engagement`"

The verified split is:
- `networking` → `Connection` only
- `interactive-engagement` → `Poll`, `PollResponse`, `QAQuestion`, `Survey`, `SurveyResponse`

The "plus migrated `Poll`/`PollResponse` artifacts where applicable" phrase in
the `networking` row is carryover ambiguity from the migration description.
Verified entity list for `networking` is `Connection` alone.

**Fix required**: Remove `Poll`/`PollResponse` from the `networking` §8 row.
Networking owns `Connection` only.

---

### CA-006 | `FULLSTACK_STITCHING_CONTRACT.md` — `fulfillment` placed in Checkout as synchronous participant, contradicting ADR-001 Principle 3

**Documents**: `FULLSTACK_STITCHING_CONTRACT.md` Row 3 vs `ADR-001` Architectural Principles vs `PRODUCT_WORKFLOWS.md` §6
**Type**: Architectural assumption conflict

`PRODUCT_WORKFLOWS.md` §6 (Checkout):
> "Key event(s): order placed/paid events **drive `fulfillment`** and `analytics`."

This positions `fulfillment` as an **event-driven downstream consumer**, not a
synchronous checkout participant.

`ADR-001` Architectural Principle 3:
> "Events as the integration contract — **direct synchronous inter-service
> calls are avoided.**"

`FULLSTACK_STITCHING_CONTRACT.md` Row 3 Backend Component:
> "`services/ticketing` … `services/pricing` … `services/inventory` …
> `services/order` … `services/payment` … **`services/fulfillment` (`/fulfillments`)**"

Listing `fulfillment` as a Backend Component in the Checkout row implies it is a
direct synchronous participant in the checkout API call, which conflicts with the
event-driven model stated in both PRODUCT_WORKFLOWS and ADR-001.

A secondary issue: the checkout row does not clarify whether `ticketing`,
`pricing`, `inventory`, `order`, and `payment` are called synchronously within
one HTTP request or are also coordinated via events. ADR-001 Principle 3 says
synchronous inter-service calls are avoided, but checkout requires atomicity
across at least `order`, `inventory`, and `payment`.

**Fix required**: Remove `services/fulfillment` from Row 3 Backend Component;
add a note that `fulfillment` is event-driven downstream. Also add a clarifying
note about how synchronous vs. async coordination works within checkout.

---

### CA-007 | `FULLSTACK_STITCHING_CONTRACT.md` Refund row — `notification` missing, `fulfillment` added incorrectly

**Documents**: `FULLSTACK_STITCHING_CONTRACT.md` Row 4 vs `PRODUCT_WORKFLOWS.md` §7
**Type**: Workflow/contract mismatch

`PRODUCT_WORKFLOWS.md` §7 Refund services: "payment, order, inventory, **notification**"
(The step "notify attendee" is an explicit refund step.)

`FULLSTACK_STITCHING_CONTRACT.md` Row 4 Backend Component:
"`services/payment`, `services/inventory`, **`services/fulfillment`**"
- `notification` is absent.
- `fulfillment` is present (but the refund workflow in PRODUCT_WORKFLOWS does not include `fulfillment`).
- `order` is also absent (though "update `Order`/`Ticket` status" is an explicit refund step).

**Fix required**: Row 4 Backend Component should list `services/payment`,
`services/order`, `services/inventory`, `services/notification`. Remove
`services/fulfillment`.

---

### CA-008 | `FULLSTACK_STITCHING_CONTRACT.md` — Workflows 3 (Agenda Management) and 4 (Speaker Management) have no contract rows

**Documents**: `FULLSTACK_STITCHING_CONTRACT.md` vs `PRODUCT_WORKFLOWS.md`
**Type**: Feature scope mismatch — incomplete coverage

`PRODUCT_WORKFLOWS.md` defines 10 workflows. `FULLSTACK_STITCHING_CONTRACT.md`
has 8 rows, of which:
- Row 8 (SSO Login) is not a numbered workflow.
- Row 3 bundles Workflows 5+6.

This leaves **Workflows 3 (Agenda Management)** and **4 (Speaker Management)**
with no traceability rows. These are material backend workflows involving
`agenda`, `speaker`, `notification` services and `Session`/`Track`/`Room`/
`Speaker`/`SpeakerProfile` entities.

**Fix required**: Add Row 3a (Agenda Management) and Row 3b (Speaker Management)
to FULLSTACK_STITCHING_CONTRACT. This is AUTONOMOUS documentation work.

---

### CA-009 | `FEATURE_SCOPE.md` §2 table title says "Built Services" but includes `ui-renderer` (scaffold, not built)

**Documents**: `FEATURE_SCOPE.md`
**Type**: Feature scope mismatch — misleading table classification

The table header is:
> "## 2. Built Services (verified — `services/<name>/README.md` Status line + source present)"

Row 26 (`ui-renderer`) is listed with "scaffold only, not built" — which
contradicts the table title's assertion that all listed services are "built."
A new AI session might count 26 built services and then be surprised when
`ui-renderer` has no real implementation.

**Fix required**: Rename table header to "All Services (26 total — built and
scaffold)" or move `ui-renderer` to the §3 "Out of Scope" section.

---

### CA-010 | `FULLSTACK_STITCHING_CONTRACT.md` Row 6 (Check-in) omits `registration`, `attendee`, `analytics` from Backend Component

**Documents**: `FULLSTACK_STITCHING_CONTRACT.md` Row 6 vs `PRODUCT_WORKFLOWS.md` §9
**Type**: Workflow/contract mismatch

`PRODUCT_WORKFLOWS.md` §9 Check-in services: "onsite, **registration, attendee, analytics**"

`FULLSTACK_STITCHING_CONTRACT.md` Row 6 Backend Component lists only `services/onsite`
(four controllers). `registration`, `attendee`, and `analytics` are not
mentioned, making the traceability row incomplete.

**Fix required**: Add reference to `services/registration`, `services/attendee`
(lookups during check-in validation), and `services/analytics` (real-time
event feeds) to Row 6 Backend Component, with a note distinguishing direct
lookup vs. event-driven participation.

---

## MEDIUM ISSUES

Gaps, ambiguities, or inconsistencies that reduce clarity but do not cause
outright incorrect conclusions.

---

### CA-011 | Tension between "service boundaries frozen" (FEATURE_SCOPE) and Campaign entity placement being "open" (DOMAIN_MODEL/ADR-001)

**Documents**: `FEATURE_SCOPE.md` §4, `DOMAIN_MODEL.md` §11, `ADR-001` Major Assumptions
**Type**: Architectural assumption conflict

`FEATURE_SCOPE.md` §4: "all 26 service module boundaries... **Frozen for current phase**"

`DOMAIN_MODEL.md` §11 TBD: "whether `notification.Campaign`/`AudienceSegment`
should be **reassigned** to `engagement`..."

`ADR-001` Major Assumptions: "`services/engagement` being near-empty while
`notification` owns `Campaign`/`AudienceSegment` is treated as an unresolved
placement deviation (GAP-G3) **not an intentional architecture decision**."

If boundaries are frozen, moving `Campaign` between services requires an ADR.
The TBD wording in DOMAIN_MODEL implies movement is possible without that gate.
These should be reconciled: either the Campaign placement is frozen until an ADR
says otherwise (consistent with FEATURE_SCOPE), or FEATURE_SCOPE's "frozen"
language should carve out GAP-G3 as a pending exception.

---

### CA-012 | "Phase D" used in `PROJECT_CHARTER` without definition

**Documents**: `PROJECT_CHARTER.md` §4
**Type**: Missing terminology

The batch/phase table row reads "Enterprise SSO | auth extension (OAuth2/SAML)
| **Phase D** | Implemented." Phase E (frontend) is well-explained but Phase D
is not defined anywhere in the seven audited documents. A new AI session would
not know what "Phase D" represents in the build sequence.

**Fix required**: Add a note: "Phase D — security/enterprise extension pass,
added after Batch 10 gap-fill work; corresponds to GAP-6 in
`docs/tracking/gap-register.md`."

---

### CA-013 | "Modular monolith" architectural label absent from `AI_OPERATING_CONTEXT` and `FEATURE_SCOPE`

**Documents**: `ADR-001` vs `AI_OPERATING_CONTEXT.md`, `FEATURE_SCOPE.md`
**Type**: Missing terminology — inconsistent architectural framing

`ADR-001` Current Architecture: "**modular monolith** with event-driven integration"

`AI_OPERATING_CONTEXT.md` FROZEN_DECISIONS #7: "Single deployable backend —
all 26 services run inside one NestJS process" (no "modular monolith" label)

`FEATURE_SCOPE.md`: no architectural style label at all.

"Modular monolith" is the conventional term for this pattern and is meaningful
to anyone familiar with architecture styles. AI_OPERATING_CONTEXT is the
"load this first" document; it should use the same term ADR-001 uses so the
architectural framing is consistent from the start.

---

### CA-014 | "CQRS" used in `DOMAIN_MODEL` and `FEATURE_SCOPE` without definition

**Documents**: `DOMAIN_MODEL.md` §7, `FEATURE_SCOPE.md` §2
**Type**: Missing terminology

Both documents use "CQRS read model" without explaining what CQRS means or how
it is implemented here (Kafka event stream → projected into analytics/search
read models). A new AI session unfamiliar with event-sourced CQRS might not
understand the relationship between write-side services and the read models.

---

### CA-015 | Checkout workflow cross-service coordination model is ambiguous (sync vs async)

**Documents**: `PRODUCT_WORKFLOWS.md` §6, `ADR-001` Principle 3
**Type**: Architectural assumption conflict — ambiguous coordination model

`ADR-001` Principle 3 states synchronous inter-service calls are avoided, but
the Checkout workflow lists 6 services as direct participants (order, inventory,
pricing, payment, ticketing, notification). The document does not clarify
whether these are:
(a) Synchronously coordinated within one NestJS process via injected service
    classes (permissible since it's a monolith — no network hops), or
(b) Event-driven across service boundaries.

In a monolith, option (a) is compatible with Principle 3 if the principle means
"no network calls between services" rather than "no direct method calls." This
ambiguity should be resolved in a dedicated ADR or clarifying note so future
sessions implement checkout correctly.

---

### CA-016 | `TenantSettings` entity not referenced in Tenant Onboarding workflow

**Documents**: `DOMAIN_MODEL.md` §2, `PRODUCT_WORKFLOWS.md` §1
**Type**: Domain entity mismatch — incomplete workflow coverage

`DOMAIN_MODEL.md` §2 lists `TenantSettings` as an entity owned by `tenant`.
`PRODUCT_WORKFLOWS.md` §1 (Tenant Onboarding) creates `Tenant`, `User`,
`Role`/`Permission`, and `AuditLog` entry — but not `TenantSettings`.
It is unclear whether `TenantSettings` is created as part of onboarding
(with defaults) or configured separately by the Platform Admin afterward.

---

### CA-017 | `EventSettings` entity not covered by any workflow or stitching contract row

**Documents**: `DOMAIN_MODEL.md` §3, `PRODUCT_WORKFLOWS.md`, `FULLSTACK_STITCHING_CONTRACT.md`
**Type**: Missing workflow coverage for a named entity

`DOMAIN_MODEL.md` §3 lists `EventSettings` under `event` schema. No workflow
in `PRODUCT_WORKFLOWS.md` mentions configuring `EventSettings`, and no row in
`FULLSTACK_STITCHING_CONTRACT.md` covers it. The entity's lifecycle (when is it
created, who can change it, what events it emits) is undocumented.

---

## LOW ISSUES

Minor omissions, stylistic inconsistencies, or low-impact ambiguities.

---

### CA-018 | Outbox pattern not mentioned in `PROJECT_CHARTER` architectural overview

**Documents**: `PROJECT_CHARTER.md`
**Type**: Missing terminology

`DOMAIN_MODEL.md` §1 and `ADR-001` both document the outbox pattern as a
cross-cutting invariant. `PROJECT_CHARTER.md` §5 describes enterprise
capabilities but makes no mention of it, leaving a gap in the charter's
architectural completeness.

---

### CA-019 | `AuthSession` entity not referenced in FULLSTACK_STITCHING_CONTRACT SSO row

**Documents**: `DOMAIN_MODEL.md` §2, `FULLSTACK_STITCHING_CONTRACT.md` Row 8
**Type**: Domain entity omission in contract

`DOMAIN_MODEL.md` §2 lists `AuthSession` as an entity in the `auth` schema.
SSO login presumably creates or links an `AuthSession`. The SSO stitching
contract row (Row 8) lists only `SsoConnection` and `SsoIdentity` as domain
entities, omitting `AuthSession`.

---

### CA-020 | "Gap-fill batches" used in `DOMAIN_MODEL` and `FEATURE_SCOPE` without explanation

**Documents**: `DOMAIN_MODEL.md` §8 heading, `FEATURE_SCOPE.md` §2 column
**Type**: Missing terminology

"Gap-fill" is used as a batch label (e.g. "Batch 8 (gap-fill)") without
explaining that these were batches added to fill gaps discovered after the
original blueprint, rather than being part of the original Batch 1–7 sequence.
A new AI session would not know why these batches have a different name.

---

### CA-021 | Agenda Management (Workflow 3) and Speaker Management (Workflow 4) overlap without clarifying who creates the Session assignment

**Documents**: `PRODUCT_WORKFLOWS.md` §3, §4
**Type**: Workflow ambiguity

Both workflows include `speaker` and `agenda` services and both involve
assigning speakers to sessions. Workflow 3 creates Sessions; Workflow 4 assigns
speakers to Sessions. The dependency ordering is implied but not stated —
Workflow 4 can only run after Workflow 3 creates the Sessions. This ordering
dependency is not documented.

---

### CA-022 | `ai-service` "agent-automation records" has no named entity in `DOMAIN_MODEL`

**Documents**: `DOMAIN_MODEL.md` §8
**Type**: Missing entity name

The `ai-service` row lists "`VectorEmbedding`, `AIInteractionLog`,
**agent-automation records**." The last item is not a named entity — it's a
description. The actual TypeORM entity name (if one exists) is unverified.

---

## SUMMARY TABLE

| ID | Issue | Severity | Documents affected | Type |
|---|---|---|---|---|
| CA-001 | `PRODUCT_WORKFLOWS` §11 contradicts §10 on Campaign executability | Critical | PRODUCT_WORKFLOWS | Internal contradiction |
| CA-002 | `PROJECT_CHARTER` §4/§7 state campaigns unbuilt + wrong GAP reference | Critical | PROJECT_CHARTER | Cross-doc contradiction |
| CA-003 | `AI_OPERATING_CONTEXT` references non-existent ADR-001 section | Critical | AI_OPERATING_CONTEXT → ADR-001 | Broken internal reference |
| CA-004 | "tenant isolation middleware" vs "shared base repository" | Critical | PROJECT_CHARTER vs 3 others | Inconsistent naming |
| CA-005 | `DOMAIN_MODEL` §8 assigns Poll/PollResponse to networking (wrong) | High | DOMAIN_MODEL | Entity mismatch |
| CA-006 | `fulfillment` listed as synchronous checkout participant | High | FULLSTACK_STITCHING_CONTRACT, PRODUCT_WORKFLOWS, ADR-001 | Arch assumption conflict |
| CA-007 | Refund contract missing `notification`/`order`; has wrong `fulfillment` | High | FULLSTACK_STITCHING_CONTRACT vs PRODUCT_WORKFLOWS | Workflow/contract mismatch |
| CA-008 | Workflows 3 and 4 (Agenda/Speaker) have no contract rows | High | FULLSTACK_STITCHING_CONTRACT | Incomplete coverage |
| CA-009 | `ui-renderer` in "Built Services" table despite being scaffold | High | FEATURE_SCOPE | Scope mismatch |
| CA-010 | Check-in contract missing `registration`/`attendee`/`analytics` | High | FULLSTACK_STITCHING_CONTRACT vs PRODUCT_WORKFLOWS | Workflow/contract mismatch |
| CA-011 | "Boundaries frozen" vs Campaign placement as open question | Medium | FEATURE_SCOPE, DOMAIN_MODEL, ADR-001 | Arch assumption conflict |
| CA-012 | "Phase D" undefined | Medium | PROJECT_CHARTER | Missing terminology |
| CA-013 | "Modular monolith" label absent from AI_OPERATING_CONTEXT | Medium | AI_OPERATING_CONTEXT vs ADR-001 | Inconsistent framing |
| CA-014 | "CQRS" used without definition | Medium | DOMAIN_MODEL, FEATURE_SCOPE | Missing terminology |
| CA-015 | Checkout sync vs async coordination ambiguous | Medium | PRODUCT_WORKFLOWS, ADR-001 | Arch assumption conflict |
| CA-016 | `TenantSettings` absent from Tenant Onboarding workflow | Medium | DOMAIN_MODEL vs PRODUCT_WORKFLOWS | Entity/workflow mismatch |
| CA-017 | `EventSettings` covered by no workflow or contract row | Medium | DOMAIN_MODEL | Missing workflow coverage |
| CA-018 | Outbox pattern absent from PROJECT_CHARTER | Low | PROJECT_CHARTER | Missing terminology |
| CA-019 | `AuthSession` absent from SSO stitching contract row | Low | FULLSTACK_STITCHING_CONTRACT vs DOMAIN_MODEL | Entity omission |
| CA-020 | "Gap-fill batches" undefined | Low | DOMAIN_MODEL, FEATURE_SCOPE | Missing terminology |
| CA-021 | Workflow 3/4 session-assignment ordering undocumented | Low | PRODUCT_WORKFLOWS | Workflow ambiguity |
| CA-022 | "agent-automation records" unnamed entity in ai-service | Low | DOMAIN_MODEL | Missing entity name |

**Totals**: 4 Critical · 6 High · 7 Medium · 5 Low

---

## DOCUMENTS READY TO MOVE Draft → Active

| Document | Current Status | Recommendation | Rationale |
|---|---|---|---|
| `FULLSTACK_STITCHING_CONTRACT.md` | Draft | **Remain Draft** | CA-006, CA-007, CA-008, CA-010: significant workflow/service mismatches in existing rows; Workflows 3 and 4 entirely missing. Not ready for Active until these are fixed and coverage expanded. |
| All others (`PROJECT_CHARTER`, `FEATURE_SCOPE`, `DOMAIN_MODEL`, `PRODUCT_WORKFLOWS`, `AI_OPERATING_CONTEXT`, `ADR-001`) | Active | **Remain Active after critical fixes applied** | These are correctly Active — they contain substantive extracted content. However, CA-001 through CA-004 must be corrected before fully trusting them. They do not need to revert to Draft; corrections are AUTONOMOUS documentation fixes. |

### Recommended fix sequence (all AUTONOMOUS per `DECISION_ESCALATION_MATRIX.md`):

1. **CA-001**: Fix `PRODUCT_WORKFLOWS.md` §11 note (contradicts §10 — 1-line edit).
2. **CA-002**: Fix `PROJECT_CHARTER.md` §4 and §7 campaign language + wrong GAP-2 reference.
3. **CA-003**: Fix `AI_OPERATING_CONTEXT.md` ADR-001 section reference.
4. **CA-004**: Fix `PROJECT_CHARTER.md` §5 "middleware" → "shared base repository."
5. **CA-005**: Fix `DOMAIN_MODEL.md` §8 `networking` entity list (remove Poll/PollResponse).
6. **CA-007**: Fix `FULLSTACK_STITCHING_CONTRACT.md` Row 4 Refund service list.
7. **CA-009**: Fix `FEATURE_SCOPE.md` §2 table title.
8. **CA-010**: Expand `FULLSTACK_STITCHING_CONTRACT.md` Row 6 backend component.
9. **CA-008 + CA-006**: Add missing Workflow 3/4 rows and fix fulfillment placement in Row 3 — larger edits.
10. Medium/Low items: schedule as AUTONOMOUS follow-up documentation tasks.

`FULLSTACK_STITCHING_CONTRACT.md` should move to Active only after items 6–9
are applied.
