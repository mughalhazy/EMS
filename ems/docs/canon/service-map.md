# EMS Backend Service Map

This document defines the backend service boundaries for EMS and the core responsibility of each service.

## Service Responsibilities

| Service | Primary Responsibility |
|---|---|
| **auth** | Handles identity and access management: login, token issuance/validation, password and MFA flows, role/permission checks, and session lifecycle for staff and API clients. |
| **tenant** | Manages tenant lifecycle and configuration, including tenant provisioning, plan/features, organization-level settings, branding, and tenant isolation policies used across all services. |
| **event** | Owns event master data and lifecycle (draft, published, live, archived), event metadata, dates/timezone, venues linkage, and event-level governance rules. |
| **agenda** | Manages program structure: tracks, sessions, room/time slot planning, conflict detection, publishing of schedules, and agenda versioning. |
| **speaker** | Manages speaker profiles, bios, credentials, speaker onboarding, approvals, and speaker-to-session assignments in collaboration with agenda. |
| **ticketing** | Owns ticket catalog and commercial setup: ticket types, inventory/quota, pricing tiers, promo/discount logic, sales windows, and availability rules. |
| **registration** | Orchestrates the registration workflow: cart/checkout integration points, registration states, confirmation, transfer/cancellation policies, and check-in eligibility status. |
| **attendee** | Maintains attendee records and preferences, profile enrichment, consent/privacy flags, badge data, and attendee-specific relationships to events and registrations. |
| **exhibitor** | Manages exhibitor participation operations: exhibitor applications, booth allocation metadata, exhibitor packages, deliverables, and exhibitor contacts/tasks. |
| **sponsor** | Manages sponsorship operations: sponsor packages, tier entitlements, fulfillment tracking, sponsor assets, and sponsor activation commitments per event. |
| **analytics** | Produces reporting and insights by aggregating cross-service events and read models: KPIs, funnel metrics, attendance trends, revenue dashboards, and exports. |
| **notification** | Handles outbound/in-app communications: template management, campaign/transactional dispatch, channel routing (email/SMS/push), retries, and delivery tracking. |
| **integration** | Provides external system connectivity: webhooks, connector orchestration, third-party sync (CRM/marketing/payment/lead capture), schema mapping, and idempotent ingestion. |
| **ai-service** | Delivers AI-powered capabilities: agenda recommendations, content summarization, attendee matchmaking, support assistants, and prompt/model policy enforcement. |

## Boundary Notes

- All services are tenant-aware and must enforce tenant isolation in APIs, storage, and emitted events.
- `registration` coordinates with `ticketing`, but `ticketing` remains source-of-truth for pricing and availability.
- `agenda` owns session scheduling; `speaker` owns speaker identity/profile and assignment constraints.
- `notification` sends messages triggered by events from domain services but does not own core domain state.
- `analytics` should consume immutable domain events/read models and avoid becoming a write-path dependency.

## QC-01 separation addendum

### Missing-but-required service responsibilities
| Service | Primary Responsibility |
|---|---|
| **order** | Owns cart/order lifecycle, line items, totals, tax/fee calculations, and order state transitions (`draft`, `placed`, `cancelled`, `refunded`). |
| **payment** | Owns payment intent/authorization/capture/refund workflows, gateway integrations, payment event normalization, and reconciliation handoff. |
| **fulfillment** | Generates and manages post-payment ticket artifacts (QR/pass/PDF), attaches artifacts to attendee registrations, enforces issuance idempotency, and revokes credentials on refund/cancel events. |

### Responsibility separation rules
1. `ticketing` owns availability and price rules, but never captures funds directly.
2. `order` owns commercial aggregation and checkout orchestration, but delegates fund movement to `payment`.
3. `registration` materializes participation entitlements only after confirmed order/payment states.
4. `fulfillment` generates QR/pass artifacts only after `payment` emits successful capture events and attaches them to `attendee` + `registration`.
5. `notification` consumes domain events from other services and must not be a transactional dependency for core writes.

### Evolution note
These services begin as bounded modules within the modular monolith and become first-class deployable services as throughput and team ownership increase.
