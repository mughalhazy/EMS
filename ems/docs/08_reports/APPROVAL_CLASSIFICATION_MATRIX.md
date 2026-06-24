Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Approval Classification Matrix

> Phase 2.9 — Executed 2026-06-17.
> Comprehensive matrix of every open item from all prior governance passes,
> with final determinability classification and disposition.
> 
> Classification tiers (highest to lowest autonomy):
> - **AUTONOMOUS** — pure code/documentation, no behavior change, no approval needed
> - **SAFE_HYGIENE** — documentation organization, no code impact
> - **REPO_DETERMINABLE** — sufficient evidence in repo to resolve without owner
> - **PRODUCT_POLICY** — scope/prioritization decision requiring owner
> - **ARCH_DECISION** — architectural design choice requiring owner
> - **SECURITY_POLICY** — security policy requiring owner
> - **API_COST** — external dependency requiring owner

## All Items — Classification and Disposition

| ID | Description | Final Classification | Disposition | Status |
|---|---|---|---|---|
| OA-1 | postgres-init.sql `"order"` → `"ordering"` | REPO_DETERMINABLE | Fixed directly | ✅ FIXED 2026-06-17 |
| OA-2 | Pagination strategy conflict | REPO_DETERMINABLE | Active doc was already correct; retired doc irrelevant | ✅ RESOLVED |
| OA-3 | Engagement module removal | PRODUCT_POLICY | Carried to RESIDUAL_OWNER_DECISION_REGISTER | ⏳ OWNER DECISION |
| OA-4 | progress.md deprecation | SAFE_HYGIENE | Moved to docs/legacy/ | ✅ EXECUTED 2026-06-17 |
| OA-5 | Extractability constraint | REPO_DETERMINABLE | Patterns confirm extractable; noted in FROZEN_DECISIONS | ✅ RESOLVED |
| OA-6 | E2E test baseline timing | PRODUCT_POLICY | Carried to RESIDUAL_OWNER_DECISION_REGISTER | ⏳ OWNER DECISION |
| A-1 | Retire docs/canon/ files | SAFE_HYGIENE | 10 files moved to docs/legacy/ | ✅ EXECUTED 2026-06-17 |
| A-2 | Retire docs/architecture/ files | SAFE_HYGIENE | 2 files moved to docs/legacy/ | ✅ EXECUTED 2026-06-17 |
| A-3 | Retire docs/product/ file | SAFE_HYGIENE | 1 file moved to docs/legacy/ | ✅ EXECUTED 2026-06-17 |
| A-4 | postgres-init.sql fix | REPO_DETERMINABLE | Same as OA-1 — fixed | ✅ FIXED 2026-06-17 |
| A-5A | Remove broken test:e2e script | SAFE_HYGIENE | Removed from package.json | ✅ EXECUTED 2026-06-17 |
| GAP-B1 | @RequirePermissions coverage | SECURITY_POLICY | Gap confirmed (22/26 missing); scheme design is owner decision | ⏳ OWNER DECISION |
| GAP-B2 | Test coverage 22/26 zero | PRODUCT_POLICY | Carried to RESIDUAL_OWNER_DECISION_REGISTER | ⏳ OWNER DECISION |
| GAP-B3 | JWT issued with empty permissions | ARCH_DECISION | Two valid approaches; carried to owner | ⏳ OWNER DECISION |
| GAP-B4 | O(n) bcrypt on token refresh | ARCH_DECISION | Fix path known (hash index); behavior change requires approval | ⏳ OWNER DECISION |
| GAP-B5 | Controller routing collision | REPO_DETERMINABLE | No actual collision — read both controllers | ✅ DOWNGRADED to Low |
| GAP-B6 | No Kafka DLQ | ARCH_DECISION | Design choice requiring infrastructure decision | ⏳ OWNER DECISION |
| GAP-B7 | No Kafka schema registry | ARCH_DECISION | Design choice requiring infrastructure decision | ⏳ OWNER DECISION |
| GAP-B8 | Webhook secret @MinLength missing | AUTONOMOUS | @MinLength(16) added to DTO | ✅ FIXED 2026-06-17 |
| GAP-B9 | OpenSearch dependency unverified | REPO_DETERMINABLE | No OpenSearch — JSONB only | ✅ CLOSED |
| GAP-B10 | pgvector dependency unverified | REPO_DETERMINABLE | No pgvector — JSONB only | ✅ CLOSED |
| GAP-B11 | EventSettings entity missing | PRODUCT_POLICY | Scope decision | ⏳ OWNER DECISION |
| GAP-B12 | Analytics schema TBD | REPO_DETERMINABLE | Analytics has no entities — pure consumer | ✅ CLOSED |
| GAP-B13 | EngagementModule dead code | PRODUCT_POLICY | Module removal is scope decision | ⏳ OWNER DECISION |
| GAP-B14 | AI embeddings are placeholder | API_COST | Requires external API contract | ⏳ OWNER DECISION |
| GAP-B15 | Integration service 23 missing topics | AUTONOMOUS | 2-line fix: Object.values(Topics) | ✅ FIXED 2026-06-17 |
| GAP-G1 | progress.md stale | SAFE_HYGIENE | Moved to legacy (OA-4) | ✅ EXECUTED |
| GAP-G3 | Campaign owned by notification not engagement | PRODUCT_POLICY | Covered by OA-3 / GAP-B13 | ⏳ OWNER DECISION |
| GAP-G4 | Test coverage critically low | PRODUCT_POLICY | Covered by GAP-B2 | ⏳ OWNER DECISION |
| GAP-G5 | @RequirePermissions coverage | SECURITY_POLICY | Covered by GAP-B1 | ⏳ OWNER DECISION |
| GAP-G6 | SSO/webhook security deferred | SECURITY_POLICY | Acknowledged pre-production blocker; covered by owner decisions | ⏳ OWNER DECISION |
| GAP-G7 | AI architecture not cross-checked | REPO_DETERMINABLE | Verified: embeddings are placeholder (GAP-B14) | ✅ CLOSED (GAP-B14) |
| GAP-G8 | Frontend stack unconfirmed | PRODUCT_POLICY | Verify at Phase E kickoff | ⏳ VERIFY AT PHASE E |
| GAP-G9 | Entity naming deviations | REPO_DETERMINABLE | All entities read; DATABASE_SCHEMA.md updated | ✅ RESOLVED (docs corrected) |
| GAP-G10 | Role model conflict (9 canon vs 8 code) | ARCH_DECISION | Carried to RESIDUAL_OWNER_DECISION_REGISTER | ⏳ OWNER DECISION |
| GAP-G11 | postgres-init.sql schema name bug | REPO_DETERMINABLE | Same as OA-1 — fixed | ✅ FIXED 2026-06-17 |
| C-4 | Extractable monolith intent | REPO_DETERMINABLE | Same as OA-5 — patterns confirm | ✅ RESOLVED |
| DELTA-7 | Pagination doc vs. code mismatch | REPO_DETERMINABLE | Same as OA-2 — active doc correct | ✅ RESOLVED |
| TBD-O1 | progress.md status | SAFE_HYGIENE | Same as OA-4 — moved | ✅ EXECUTED |
| TBD-O2 | ai-architecture.md accuracy | REPO_DETERMINABLE | Embedding placeholder confirmed | ✅ CLOSED (GAP-B14) |
| TBD-O3 | Column schemas for 9 entities | REPO_DETERMINABLE | All entities read; DATABASE_SCHEMA.md updated | ✅ CLOSED |
| TBD-O4 | Fullstack stitching contract | REPO_DETERMINABLE | Relevant fields updated from code reads | ✅ CLOSED |
| TBD-O5 | DELTA-7 pagination | REPO_DETERMINABLE | Same as OA-2 — already correct | ✅ RESOLVED |

## Classification Summary

| Classification | Count | Status |
|---|---|---|
| AUTONOMOUS | 2 | Both fixed |
| SAFE_HYGIENE | 7 | All executed |
| REPO_DETERMINABLE | 17 | All resolved |
| PRODUCT_POLICY | 7 | All carried to owner |
| ARCH_DECISION | 5 | All carried to owner |
| SECURITY_POLICY | 2 | All carried to owner |
| API_COST | 1 | Carried to owner |
| VERIFY_AT_PHASE_E | 1 | Deferred to Phase E kickoff |
| **Total** | **42** | |

## Elimination Rate by Type

Items requiring owner decision: **15** (of 42 reviewed = 36%)  
Items resolved without owner: **27** (of 42 reviewed = 64%)
