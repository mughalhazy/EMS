Status: Active
Authority Level: High
Last Reviewed: 2026-06-20
Owner: AI

# Out-of-Scope Register

> Contains items intentionally deferred from current scope.
> Purpose: Maintain scope discipline. Prevent deferred features from
> re-appearing as gaps or blockers in future sessions.
>
> Items here are NOT gaps. They are intentional deferrals.
> They do not block Phase E or any current development work.

---

## GAP-FE7-B: Payment Gateway SDK Integration {#gap-fe7b}

| Field | Value |
|---|---|
| Item ID | GAP-FE7-B |
| Title | Payment Gateway SDK Integration (Step 3 of checkout) |
| Classification | OUT-OF-SCOPE |
| Deferred From | Phase E |
| Deferred Until | When payment gateway account is provisioned |
| Original Source | GAP-FE7 (split in compression pass 2026-06-17) |
| Evidence Source | Backend is gateway-agnostic; Step 3 requires gateway-specific SDK (Stripe Elements etc.) |
| Scope Boundary | Phase E delivers placeholder payment form (Step 3 disabled). Gateway SDK is post-Phase E drop-in. |
| Affected Components | S-06 checkout screen (Step 3 only) |
| Affected Routes | `/orders/:id/checkout` (Step 3 UI only) |
| Affected APIs | `POST /v1/payments/:id/complete` (called after gateway success) |
| Affected Workflows | Commerce/payment workflow (Step 3 gateway interaction) |
| Affected Roles | `attendee` (primary purchaser) |
| Owner Required | YES — gateway account credentials needed |
| External Dependency | YES — EXT-1 (payment gateway account) |
| Future Impact | HIGH — enables live payment collection |
| Resume Criteria | EXT-1 (payment gateway account + API keys) is provisioned |
| Recommended Implementation | Stripe Elements. Drop placeholder Step 3 with Stripe's hosted payment fields. `POST /v1/payments/:id/complete { providerRef: 'ch_xxx' }` after `PaymentIntent` confirmation. |
| Related Register | SAFE_DEFAULT_REGISTER.md#gap-fe7a, EXTERNAL_DEPENDENCY_REGISTER.md#payment-gateway |

---

## OOS-2: Webhook HMAC Signing and SSO Assertion Verification {#security-hardening}

| Field | Value |
|---|---|
| Item ID | OOS-2 |
| Title | Security hardening — GAP-G6 (pre-production sprint) |
| Classification | OUT-OF-SCOPE for Phase E (but SAFE-DEFAULT — single correct implementation) |
| Deferred From | Phase E |
| Deferred Until | Pre-production security sprint |
| Original Source | GAP-G6 (Architectural Gap Register) |
| Evidence Source | SSO: assertion signature verification not implemented. Webhooks: no HMAC header on outbound delivery. |
| Scope Boundary | Phase E can proceed with SSO warning banner (GAP-FE9). Security hardening is a pre-production requirement, not a Phase E requirement. |
| Affected Components | `services/auth/src/sso.service.ts`, `services/integration/src/integration.service.ts` |
| Owner Required | NO — technical implementation with single correct path |
| External Dependency | NO |
| Future Impact | HIGH — required before production SSO or webhook exposure |
| Resume Criteria | Pre-production sprint; must complete before any public SSO or webhook go-live |
| Related Register | SAFE_DEFAULT_REGISTER.md#gap-g6, SAFE_DEFAULT_REGISTER.md#gap-fe9 |

---

## OOS-3: Kafka Schema Registry (Avro/Protobuf/JSON Schema) {#schema-registry}

| Field | Value |
|---|---|
| Item ID | OOS-3 |
| Title | Formal Kafka schema registry for payload validation |
| Classification | OUT-OF-SCOPE |
| Deferred From | Phase E |
| Deferred Until | When external consumers (third-party integrations) require formal schema contracts |
| Original Source | GAP-B7 (Backend Gap Register) |
| Evidence Source | TypeScript payload interfaces in `infra/event-bus/src/schemas/index.ts` are sufficient for current internal use |
| Scope Boundary | TypeScript contracts sufficient for Phase E. Avro/Protobuf registry needed only when external webhook consumers require schema validation. |
| Affected Components | `infra/event-bus/src/` |
| Owner Required | NO |
| External Dependency | NO |
| Future Impact | MEDIUM — improves external integration reliability |
| Resume Criteria | External consumer ecosystem grows to require formal schema contracts |
| Related Register | SAFE_DEFAULT_REGISTER.md#gap-b7, AUTO_CLOSED_REGISTER.md#rod-8 |

---

## OOS-4: Modular Monolith → Microservices Extraction {#microservices}

| Field | Value |
|---|---|
| Item ID | OOS-4 |
| Title | C-4 — Extract services to independent deployables |
| Classification | OUT-OF-SCOPE |
| Deferred From | All current phases |
| Deferred Until | Explicit architecture decision + new ADR |
| Original Source | C-4 (CONFLICT_ANALYSIS_REPORT.md); AI_OPERATING_CONTEXT.md Open Question 6 |
| Evidence Source | `system-architecture.md` §2 mentioned "designed to be extractable"; current code is a modular monolith in one NestJS process |
| Scope Boundary | Modular monolith is the FROZEN_DECISION. Extraction to microservices would require a new ADR. Extraction is possible (services are loosely coupled via Kafka) but not planned. |
| Affected Components | `apps/api/`, all 26 services, `infra/event-bus/` |
| Owner Required | YES — major infrastructure and deployment strategy decision |
| External Dependency | NO |
| Future Impact | HIGH — affects deployment, scaling, team structure |
| Resume Criteria | Owner initiates architecture review; new ADR created |
| Related Register | OWNER_DECISION_REGISTER.md (Frozen Decisions) |

---

## OOS-5: Mobile Native Application {#mobile}

| Field | Value |
|---|---|
| Item ID | OOS-5 |
| Title | Mobile native application (iOS / Android) |
| Classification | OUT-OF-SCOPE |
| Deferred From | All current phases |
| Deferred Until | Post-Phase E product decision |
| Scope Boundary | Phase E delivers web frontend only (`apps/web`). Mobile app is not in current scope. Backend API is REST — mobile client would consume same endpoints. |
| Affected Components | None (new scope) |
| Owner Required | YES — product launch decision |
| External Dependency | YES — App Store / Play Store accounts |
| Future Impact | HIGH — significantly broadens reach |
| Resume Criteria | Owner decides to add mobile scope |
| Related Register | — |

---

## OOS-6: Regional Payment Gateways (Pakistan-Specific) {#regional-payments}

| Field | Value |
|---|---|
| Item ID | OOS-6 |
| Title | JazzCash, Easypaisa, and other Pakistan-regional payment integrations |
| Classification | OUT-OF-SCOPE |
| Deferred From | Phase E |
| Deferred Until | Post-launch regional expansion or owner decision |
| Scope Boundary | Phase E payment scaffold uses a single gateway (Stripe recommended). Regional Pakistani gateways are expansion options. Backend `Payment.provider` is a free-text string — any provider name can be used. Each regional gateway requires separate merchant onboarding. |
| Affected Components | S-06 checkout screen (Step 3) |
| Affected Workflows | Commerce workflow |
| Owner Required | YES — merchant account onboarding per gateway |
| External Dependency | YES — JazzCash merchant ID, Easypaisa merchant account, FBR registration (tax compliance) |
| Future Impact | HIGH — enables Pakistani market commerce |
| Resume Criteria | Owner initiates merchant onboarding with JazzCash/Easypaisa; regulatory requirements (FBR) met |
| Related Register | EXTERNAL_DEPENDENCY_REGISTER.md#payment-gateway, OUT_OF_SCOPE_REGISTER.md#gap-fe7b |

---

## OOS-7: Tax and Regulatory Compliance Module {#tax}

| Field | Value |
|---|---|
| Item ID | OOS-7 |
| Title | FBR/GST/VAT tax compliance module |
| Classification | OUT-OF-SCOPE |
| Deferred From | Phase E |
| Deferred Until | Regulatory requirement triggers implementation |
| Scope Boundary | Current payment model stores `amountCents` and `currency` only. No tax calculation, GST registration number, or FBR invoice generation. These are regulatory requirements that vary by market. |
| Affected Components | `services/payment/`, `services/order/` |
| Owner Required | YES — regulatory/legal decision; FBR registration required for Pakistani commerce |
| External Dependency | YES — FBR registration, tax authority credentials |
| Future Impact | HIGH — compliance requirement for production commerce in regulated markets |
| Resume Criteria | Regulatory compliance becomes a launch requirement |
| Related Register | — |

---

## OOS-8: Advanced AI Features (Agentic Automation, Matchmaking) {#advanced-ai}

| Field | Value |
|---|---|
| Item ID | OOS-8 |
| Title | Agentic AI, attendee matchmaking, AI-generated content |
| Classification | OUT-OF-SCOPE |
| Deferred From | Phase E |
| Deferred Until | Post-ROD-10 implementation; separate product phase |
| Original Source | `docs/legacy/ai-architecture.md` §7 (described agent-automation; not implemented) |
| Evidence Source | No agent-automation entities exist in code; `AIInteractionLog` and `VectorEmbedding` only |
| Scope Boundary | Phase E + ROD-10 delivers basic semantic search and AI chat. Agentic workflows, attendee-speaker matchmaking, AI content generation are future product features. |
| Affected Components | `services/ai-service/src/` |
| Owner Required | NO (technical implementation); YES (product feature decision) |
| External Dependency | YES — higher-tier API usage |
| Future Impact | HIGH — differentiating product features |
| Resume Criteria | ROD-10 implemented; owner initiates next AI phase |
| Related Register | SAFE_DEFAULT_REGISTER.md#rod-10 |

---

## OOS-9: Hardware Integrations (Badge Printers, QR Scanners) {#hardware}

| Field | Value |
|---|---|
| Item ID | OOS-9 |
| Title | Physical hardware integrations for onsite check-in |
| Classification | OUT-OF-SCOPE |
| Deferred From | Phase E |
| Deferred Until | Hardware procurement and vendor selection |
| Scope Boundary | `services/onsite` supports check-in, badge printing records, and device sessions. Physical hardware integration (QR scanner drivers, badge printer APIs) requires hardware vendor selection and SDK integration. Phase E builds the web-based onsite management UI. |
| Affected Components | `services/onsite/src/`, S-22 through S-25 (onsite screens) |
| Owner Required | YES — hardware procurement decision |
| External Dependency | YES — hardware purchase, printer vendor API |
| Future Impact | MEDIUM — improves onsite operations |
| Resume Criteria | Hardware vendor selected and SDK documented |
| Related Register | — |
