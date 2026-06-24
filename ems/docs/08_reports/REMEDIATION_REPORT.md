Status: Active
Authority Level: High
Last Reviewed: 2026-06-15
Owner: AI

# Audit Remediation Report

> Covers all findings from `08_reports/GOVERNANCE_CONSISTENCY_AUDIT.md`
> (22 issues: CA-001 through CA-022) plus one newly discovered issue (GAP-G9)
> found during entity verification performed as part of this remediation pass.
> Instruction source: `D:\SaaS\EMS\AUDIT REMEDIATION.md`.
> No application code, schema, API, infra, or dependency changes were made.

---

## 1. Findings Fixed

### Critical (4/4 fixed)

| ID | Finding | Fix applied | Document |
|---|---|---|---|
| CA-001 | `PRODUCT_WORKFLOWS §11` said Campaign Delivery "not executable" — contradicted §10 | §11 note rewritten: "All 10 workflows are executable via direct API calls. Workflow 10 runs under `services/notification`" | `PRODUCT_WORKFLOWS.md` |
| CA-002 | `PROJECT_CHARTER §4/§7` said campaigns "stub/unbuilt", cited wrong GAP-2 | §4 Engagement row updated to correct description; §7 T3 row corrected to "Complete"; GAP-2 reference removed | `PROJECT_CHARTER.md` |
| CA-003 | `AI_OPERATING_CONTEXT` referenced non-existent ADR-001 section "Open Architectural Questions" | Fixed reference to correct sections: "Major Assumptions and Known Risks" | `AI_OPERATING_CONTEXT.md` |
| CA-004 | `PROJECT_CHARTER §5` said "tenant isolation middleware" — three other docs say "shared base repository" | Changed to "shared base repository (`infra/common`) at the TypeORM repository layer" | `PROJECT_CHARTER.md` |

### High (6/6 fixed)

| ID | Finding | Fix applied | Document |
|---|---|---|---|
| CA-005 | `DOMAIN_MODEL §8` incorrectly listed `Poll`/`PollResponse` under `networking` | Removed; `networking` row now shows `AttendeeConnection` only (verified entity name) | `DOMAIN_MODEL.md` |
| CA-006 | `fulfillment` listed as synchronous Checkout participant — contradicts ADR-001 Principle 3 | Row 3 updated: `fulfillment` removed from synchronous component list; note added distinguishing sync (in-process) vs async (event-driven) participants | `FULLSTACK_STITCHING_CONTRACT.md` |
| CA-007 | Refund contract missing `notification`/`order`; contained wrong `fulfillment` | Row 4 corrected: added `services/order` and `services/notification`; removed `services/fulfillment` | `FULLSTACK_STITCHING_CONTRACT.md` |
| CA-008 | Workflows 3 (Agenda) and 4 (Speaker) had no contract rows | Added Row 2a (Agenda Management) and Row 2b (Speaker Management) with all 10 traceability fields | `FULLSTACK_STITCHING_CONTRACT.md` |
| CA-009 | §2 table header said "Built Services" but included `ui-renderer` scaffold | Header renamed to "All Services (26 total — built and scaffold)" | `FEATURE_SCOPE.md` |
| CA-010 | Check-in Row 6 omitted `registration`, `attendee`, `analytics` from backend component | Row 6 expanded: `services/registration`/`attendee` noted as synchronous lookups; `services/analytics` noted as async event consumer | `FULLSTACK_STITCHING_CONTRACT.md` |

### Medium (7/7 fixed)

| ID | Finding | Fix applied | Document |
|---|---|---|---|
| CA-011 | Tension between "frozen boundaries" and Campaign placement being "open" | §4 updated with explicit exception clause: Campaign placement (GAP-G3) is REQUIRES APPROVAL (ADR-002), not fully frozen; current implementation (`notification`) is authoritative until resolved | `FEATURE_SCOPE.md` |
| CA-012 | "Phase D" used without definition | Footnote added to §4 table defining Phase D | `PROJECT_CHARTER.md` |
| CA-013 | "Modular monolith" label absent from `AI_OPERATING_CONTEXT` | FROZEN_DECISIONS #7 updated to read "Single deployable backend (modular monolith)" | `AI_OPERATING_CONTEXT.md` |
| CA-014 | "CQRS" used without definition | Definition block added above §7 table explaining CQRS as applied in this project | `DOMAIN_MODEL.md` |
| CA-015 | Checkout sync vs async coordination ambiguous | Added detailed note to PRODUCT_WORKFLOWS §11 and to FULLSTACK_STITCHING_CONTRACT Row 3 clarifying: multi-service coordination is synchronous NestJS injection within one process; `fulfillment`/`analytics` are async downstream | `PRODUCT_WORKFLOWS.md`, `FULLSTACK_STITCHING_CONTRACT.md` |
| CA-016 | `TenantSettings` absent from Tenant Onboarding workflow | Added TBD note in DOMAIN_MODEL §11 flagging TenantSettings creation timing as unverified | `DOMAIN_MODEL.md` |
| CA-017 | `EventSettings` entity covered by no workflow or contract row | Added TBD note in DOMAIN_MODEL §11: no `event-settings.entity.ts` found in code — canon doc may be ahead of implementation | `DOMAIN_MODEL.md` |

### Low (5/5 fixed)

| ID | Finding | Fix applied | Document |
|---|---|---|---|
| CA-018 | Outbox pattern absent from `PROJECT_CHARTER` | Added outbox pattern entry to §5 Enterprise Capabilities | `PROJECT_CHARTER.md` |
| CA-019 | `AuthSession` absent from SSO stitching contract row | Row 8 Domain Entity updated: added `AuthSession` and `User` with explanation | `FULLSTACK_STITCHING_CONTRACT.md` |
| CA-020 | "Gap-fill batches" undefined | Added explanatory note to DOMAIN_MODEL §8 heading defining what "gap-fill" means | `DOMAIN_MODEL.md` |
| CA-021 | Workflow 3/4 session-assignment ordering undocumented | Added ordering dependency note to PRODUCT_WORKFLOWS §11; also noted in FULLSTACK_STITCHING_CONTRACT Row 2b | `PRODUCT_WORKFLOWS.md`, `FULLSTACK_STITCHING_CONTRACT.md` |
| CA-022 | "agent-automation records" unnamed entity | Removed — no such entity exists in `services/ai-service/src/entities/` (verified: only `VectorEmbedding` and `AIInteractionLog`) | `DOMAIN_MODEL.md` |

---

## 2. Additional Finding Discovered and Fixed During Remediation

### GAP-G9: Entity naming deviations between governance docs and actual code

During entity verification (systematic `ls services/*/src/entities/` across all
26 services), 16 entity-level discrepancies were found between governance doc
names and actual code file names. All were corrected in `DOMAIN_MODEL.md` using
repository evidence as source of truth per AUDIT REMEDIATION rule 12.

**Corrections applied to `DOMAIN_MODEL.md`**:

| Service | Old (canon/governance) | Corrected (code evidence) |
|---|---|---|
| ticketing | `TicketType`, `Ticket` | `TicketProduct`, `Ticket`, `TicketEntitlement` |
| pricing | `PriceRule`, `Discount`, `PromoCode` | `PriceRule`, `DiscountRule`, `PromoCode` |
| inventory | `InventoryPool`, `InventoryReservation` | `InventoryItem` |
| fulfillment | `FulfillmentRequest`, `DeliveryRecord` | `Fulfillment` |
| registration | `Registration`, `RegistrationForm`, `RegistrationAnswer` | `Registration`, `RegistrationField` |
| onsite | `CheckIn`, `Badge`, `SessionAttendance` | `CheckIn`, `BadgePrint`, `DeviceSession` |
| networking | `Connection` | `AttendeeConnection` |
| event | `Event`, `Venue`, `EventSettings` | `Event`, `Venue`, `Room` (`EventSettings` not found in code; `Room` is in `event` not `agenda`) |
| agenda | `Session`, `Track`, `Room` | `Session`, `Track` (no `Room`) |
| auth | `User`, `AuthSession`, `SsoConnection`, `SsoIdentity` | + `UserCredential` (previously undocumented) |
| tenant | `Tenant`, `TenantSettings` | + `Organization` (previously undocumented) |
| speaker | `Speaker`, `SpeakerProfile` | + `SessionSpeaker` junction (previously undocumented) |
| attendee | `Attendee`, `AttendeeProfile` | + `AttendeeTag` (previously undocumented) |
| exhibitor | `Exhibitor`, `Booth`, `SponsorPackage`, `Lead` | + `Sponsor` (previously undocumented) |
| payment | `Payment`, `Refund` | + `PaymentTransaction` (previously undocumented) |
| ai-service | `VectorEmbedding`, `AIInteractionLog`, "agent-automation records" | `VectorEmbedding`, `AIInteractionLog` only ("agent-automation records" does not exist) |

Registered as **GAP-G9** in `08_reports/ARCHITECTURAL_GAP_REGISTER.md`.
`docs/canon/domain-model.md` was **not** modified (preserved per governance
policy — it may reflect intended entity names, and reconciling code vs. canon
is a REQUIRES APPROVAL decision, ADR-needed).

---

## 3. Documents Updated

| Document | Changes |
|---|---|
| `docs/00_authority/PROJECT_CHARTER.md` | CA-002 (§4 Engagement row, §7 T3 row), CA-004 (§5 "middleware"), CA-012 (Phase D footnote), CA-018 (outbox pattern in §5) |
| `docs/00_authority/FEATURE_SCOPE.md` | CA-009 (table header), CA-011 (frozen scope exception clause) |
| `docs/00_authority/DOMAIN_MODEL.md` | CA-005 (networking entity), CA-014 (CQRS definition), CA-016 (TenantSettings TBD), CA-017 (EventSettings TBD), CA-020 (gap-fill definition), CA-022 (ai-service entity removal), GAP-G9 (all entity corrections per code evidence) |
| `docs/00_authority/PRODUCT_WORKFLOWS.md` | CA-001 (§11 Campaign note), CA-015 (checkout coordination model), CA-021 (workflow 3/4 ordering) |
| `docs/00_authority/FULLSTACK_STITCHING_CONTRACT.md` | CA-006 (Row 3 fulfillment fix + sync/async note), CA-007 (Row 4 refund fix), CA-008 (Rows 2a+2b added), CA-010 (Row 6 check-in fix), CA-015 (Row 3 coordination note), CA-019 (Row 8 AuthSession), Status: Draft → Active |
| `docs/07_governance/AI_OPERATING_CONTEXT.md` | CA-003 (ADR-001 section reference), CA-013 (modular monolith label) |
| `docs/08_reports/ARCHITECTURAL_GAP_REGISTER.md` | Added GAP-G9 (entity naming deviations) |

---

## 4. Remaining Items Requiring Verification

These items were flagged as TBD during remediation — evidence does not yet exist
to resolve them without reading additional source files or human confirmation:

| Item | Location | Verification needed |
|---|---|---|
| `tenant.Organization` entity purpose | `DOMAIN_MODEL.md` §2 | Read `organization.entity.ts` to understand its relationship to `Tenant`; update `docs/canon/domain-model.md` if it's new or update DOMAIN_MODEL if it's an existing canon entity under a different name |
| `event.EventSettings` non-existence | `DOMAIN_MODEL.md` §11 | Confirm no `event-settings.entity.ts` exists anywhere; determine if canon doc is intentionally ahead of code or if the entity was renamed/removed |
| `TenantSettings` creation timing | `DOMAIN_MODEL.md` §11 | Does Tenant Onboarding (Workflow 1) create `TenantSettings` with defaults, or is it a separate admin step? |
| Permission model for 22/26 services | `FULLSTACK_STITCHING_CONTRACT.md` Open Items | Full `@RequirePermissions` audit across all controller files (GAP-G5) |
| Canon vs. code entity name reconciliation | `docs/canon/domain-model.md` | REQUIRES APPROVAL — decide direction before any entity renaming or schema migration (ADR needed; see GAP-G9) |
| CI test job full content | `AI_OPERATING_CONTEXT.md` REQUIRED_VALIDATIONS | Read `.github/workflows/ci.yml` test job body to confirm what it runs |
| OpenSearch client library | `ADR-001` tech stack table | Verify exact npm package name/version used for OpenSearch |

---

## 5. Documents Recommended for Active Status

| Document | Previous Status | Recommended Status | Rationale |
|---|---|---|---|
| `FULLSTACK_STITCHING_CONTRACT.md` | Draft | **Active** | All audit-identified errors in existing rows fixed; two missing workflow rows (2a/2b) added; entity names corrected to code evidence. Remaining TBDs (permission models, refund endpoint sub-route) are explicitly documented, not omissions. Document now meets the Phase 1 "sections contain extracted content, unknowns explicitly documented" criteria. |
| All other Phase 1 documents | Active (already) | **Remain Active** | All critical and high issues resolved. |

---

## 6. Internal Consistency Revalidation

After applying all fixes, cross-checking the key consistency risks:

| Check | Result |
|---|---|
| "Campaign is implemented" — consistent across all docs? | Yes — PROJECT_CHARTER §4/§7, FEATURE_SCOPE §2 row 18/§3, DOMAIN_MODEL §6, PRODUCT_WORKFLOWS §10/§11, FULLSTACK_STITCHING_CONTRACT Row 7 all agree: notification owns Campaign/AudienceSegment |
| "Tenant isolation = shared base repository" — consistent? | Yes — PROJECT_CHARTER §5, DOMAIN_MODEL §1, AI_OPERATING_CONTEXT FROZEN_DECISIONS #4, ADR-001 all use the same term |
| "Checkout is in-process synchronous, fulfillment is async" — consistent? | Yes — PRODUCT_WORKFLOWS §11 note, FULLSTACK_STITCHING_CONTRACT Row 3 note both state this clearly |
| "networking owns AttendeeConnection only" — consistent? | Yes — DOMAIN_MODEL §8, FULLSTACK_STITCHING_CONTRACT (no networking row, but entity name correct), ARCHITECTURAL_GAP_REGISTER GAP-G9 |
| "All 10 workflows executable" — consistent? | Yes — PRODUCT_WORKFLOWS §10 and §11 now agree |
| ADR-001 section references valid? | Yes — AI_OPERATING_CONTEXT now references "Major Assumptions and Known Risks" which exist in ADR-001 |
| "Modular monolith" label consistent? | Yes — ADR-001 Current Architecture, AI_OPERATING_CONTEXT FROZEN_DECISIONS #7 now both use the term |
