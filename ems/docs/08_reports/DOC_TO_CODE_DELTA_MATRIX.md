Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Doc-to-Code Delta Matrix

> Produced by: Pre-Frontend Doc-to-Code Delta Audit, 2026-06-17.
> Lists every discrepancy found between documentation and repository code.
> Status column shows whether the delta was fixed (documentation corrected)
> or escalated (true code defect requiring owner action).

## Legend

| Status | Meaning |
|---|---|
| ✅ Fixed | Documentation corrected to match code |
| ⬆️ Escalated | True code defect — owner approval required before fix |
| ℹ️ Noted | Intentional design decision — recorded in delta-log, no change required |

---

## Delta Matrix

| ID | Document | Field/Section | Documented (Wrong) | Code Reality (Correct) | Status | Fix Location |
|---|---|---|---|---|---|---|
| D-01 | `SERVICE_CATALOG.md` + `EVENT_AND_QUEUE_ARCHITECTURE.md` | Kafka topic count | 57 topics | 64 topics | ✅ Fixed | Both files |
| D-02 | `EVENT_AND_QUEUE_ARCHITECTURE.md` §5 | All topic names | Invented prefixes (`agenda.*`, `networking.*`, `interactive.*`, `ai.*`, `rbac.*`) | Flat domain prefix (`session.*`, `connection.*`, `poll.*`, `embedding.*`, `role.*`) | ✅ Fixed | EVENT_AND_QUEUE_ARCHITECTURE.md §5 fully rewritten |
| D-03 | `SERVICE_CATALOG.md` — auth | Kafka publishes | `user.logged_in` | `user.login_succeeded`, `user.login_failed`, `user.password_changed`, `user.status_changed` | ✅ Fixed | SERVICE_CATALOG.md |
| D-04 | `SERVICE_CATALOG.md` — agenda | Kafka publishes | `agenda.session_created`, `agenda.session_updated` | `session.created`, `session.updated`, `session.cancelled` | ✅ Fixed | SERVICE_CATALOG.md |
| D-05 | `SERVICE_CATALOG.md` — speaker | Kafka publishes | `speaker.assigned`, `speaker.profile_updated` | `speaker.created`, `speaker.updated`, `speaker.assigned_to_session` | ✅ Fixed | SERVICE_CATALOG.md |
| D-06 | `SERVICE_CATALOG.md` — exhibitor | Kafka publishes | `exhibitor.registered` | `exhibitor.created`, `sponsor.created`, `lead.captured` | ✅ Fixed | SERVICE_CATALOG.md |
| D-07 | `SERVICE_CATALOG.md` — attendee | Kafka publishes | (missing `attendee.created`) | `attendee.created`, `attendee.profile_updated` | ✅ Fixed | SERVICE_CATALOG.md |
| D-08 | `SERVICE_CATALOG.md` — registration | Kafka publishes | `registration.completed` | `registration.submitted`, `registration.approved`, `registration.confirmed`, `registration.cancelled`, `registration.waitlisted` | ✅ Fixed | SERVICE_CATALOG.md |
| D-09 | `SERVICE_CATALOG.md` — onsite | Kafka publishes | `onsite.check_in`, `onsite.badge_printed` | `attendee.checked_in`, `session.attended` | ✅ Fixed | SERVICE_CATALOG.md |
| D-10 | `SERVICE_CATALOG.md` — ticketing | Kafka publishes | `ticketing.ticket_issued`, `ticketing.ticket_cancelled` | `ticket_product.created`, `ticket.issued`, `ticket.redeemed`, `ticket.voided` | ✅ Fixed | SERVICE_CATALOG.md |
| D-11 | `SERVICE_CATALOG.md` — pricing | Kafka publishes | `pricing.price_rule_applied` | `promo_code.redeemed` | ✅ Fixed | SERVICE_CATALOG.md |
| D-12 | `SERVICE_CATALOG.md` — order | Postgres schema | `order` | `ordering` (SQL reserved word) | ✅ Fixed | SERVICE_CATALOG.md |
| D-13 | `SERVICE_CATALOG.md` — order | Kafka publishes | `order.confirmed` | `order.paid`, `order.fulfilled` | ✅ Fixed | SERVICE_CATALOG.md |
| D-14 | `SERVICE_CATALOG.md` — payment | Kafka publishes | `payment.initiated`, `payment.refund_initiated`, `payment.refund_completed` | `payment.completed`, `payment.failed`, `payment.refunded` | ✅ Fixed | SERVICE_CATALOG.md |
| D-15 | `SERVICE_CATALOG.md` — fulfillment | Kafka publishes | `fulfillment.dispatched`, `fulfillment.delivered` | `fulfillment.completed` | ✅ Fixed | SERVICE_CATALOG.md |
| D-16 | `SERVICE_CATALOG.md` — notification | Kafka publishes | `notification.campaign_sent` | `notification.sent`, `notification.failed`, `campaign.scheduled`, `campaign.sent` | ✅ Fixed | SERVICE_CATALOG.md |
| D-17 | `SERVICE_CATALOG.md` — networking | Kafka publishes | `networking.connection_requested`, `networking.connection_accepted` | `connection.requested`, `connection.accepted`, `connection.declined` | ✅ Fixed | SERVICE_CATALOG.md |
| D-18 | `SERVICE_CATALOG.md` — interactive-engagement | Kafka publishes | `interactive.poll_created`, `interactive.survey_submitted` | `poll.created`, `poll.responded`, `qa.question_submitted`, `survey.completed` | ✅ Fixed | SERVICE_CATALOG.md |
| D-19 | `SERVICE_CATALOG.md` — analytics | Entities | TBD | `AnalyticsEvent`, `EventMetric`, `TicketSalesSummary` + 2 @ViewEntity: `AttendanceMetrics`, `EventDashboardView` | ✅ Fixed | SERVICE_CATALOG.md, DATABASE_SCHEMA.md |
| D-20 | `SERVICE_CATALOG.md` — search | Entities | OpenSearch documents (not Postgres entities) | `SearchDocument` (`search.search_documents`) — Postgres ILIKE | ✅ Fixed | SERVICE_CATALOG.md |
| D-21 | `SERVICE_CATALOG.md` — integration | Entities | `WebhookSubscription`, `WebhookDelivery` | `WebhookSubscription` only (`WebhookDelivery` does not exist) | ✅ Fixed | SERVICE_CATALOG.md |
| D-22 | `DATABASE_SCHEMA.md` — order schema | Schema name | `order` | `ordering` | ✅ Fixed | DATABASE_SCHEMA.md |
| D-23 | `DATABASE_SCHEMA.md` — Order entity | Column: attendeeId | `attendeeId` | `userId` | ✅ Fixed | DATABASE_SCHEMA.md |
| D-24 | `DATABASE_SCHEMA.md` — Order entity | Columns: totalAmount, currency | `totalAmount (decimal)`, `currency (varchar)` | `subtotalCents (int)`, `discountCents (int)`, `totalCents (int)` | ✅ Fixed | DATABASE_SCHEMA.md |
| D-25 | `DATABASE_SCHEMA.md` — WebhookDelivery | Entire entity | Documented as existing | Does not exist in code | ✅ Fixed (removed) | DATABASE_SCHEMA.md |
| D-26 | `DATABASE_SCHEMA.md` — WebhookSubscription | Column: url | `url` | `targetUrl` | ✅ Fixed | DATABASE_SCHEMA.md |
| D-27 | `DATABASE_SCHEMA.md` — WebhookSubscription | Column: events | `events (varchar[])` | `eventTypes (jsonb)` | ✅ Fixed | DATABASE_SCHEMA.md |
| D-28 | `DATABASE_SCHEMA.md` — VectorEmbedding | Column name | `embedding` | `vector` | ✅ Fixed | DATABASE_SCHEMA.md |
| D-29 | `DATABASE_SCHEMA.md` — VectorEmbedding | Column type | `vector (pgvector)` | `jsonb` | ✅ Fixed | DATABASE_SCHEMA.md |
| D-30 | `DATABASE_SCHEMA.md` — VectorEmbedding | Column: tenantId | Present | Not present in entity | ✅ Fixed | DATABASE_SCHEMA.md |
| D-31 | `DATABASE_SCHEMA.md` — AIInteractionLog | Columns: model, tokensUsed | `model (varchar)`, `tokensUsed (int)` | Neither column exists in entity | ✅ Fixed (removed) | DATABASE_SCHEMA.md |
| D-32 | `DATABASE_SCHEMA.md` — analytics schema | Entire schema | TBD | 3 entities + 2 view entities documented | ✅ Fixed | DATABASE_SCHEMA.md |
| D-33 | `DATABASE_SCHEMA.md` — search schema | Description | "OpenSearch index" | Postgres table `search.search_documents` | ✅ Fixed | DATABASE_SCHEMA.md |
| D-34 | `BACKEND_GAP_REGISTER.md` — GAP-B7 | Topic count | 57 | 64 | ✅ Fixed | BACKEND_GAP_REGISTER.md |
| D-35 | `BACKEND_GAP_REGISTER.md` — GAP-B9 | Status | Open | Closed — no OpenSearch needed (Postgres ILIKE used) | ✅ Fixed | BACKEND_GAP_REGISTER.md |
| D-36 | `BACKEND_GAP_REGISTER.md` — GAP-B10 | Status | Open | Closed — no pgvector needed (JSONB used) | ✅ Fixed | BACKEND_GAP_REGISTER.md |
| D-37 | `BACKEND_GAP_REGISTER.md` — GAP-B12 | Status | Open | Closed — 3 entities + 2 views documented | ✅ Fixed | BACKEND_GAP_REGISTER.md |
| D-38 | `AI_OPERATING_CONTEXT.md` — REQUIRED_VALIDATIONS | CI test job | TBD — REQUIRES VERIFICATION | `npm test -- --passWithNoTests` (verified) | ✅ Fixed | AI_OPERATING_CONTEXT.md |
| D-39 | `AI_OPERATING_CONTEXT.md` | Filename: `REVISED_REVISED_` | `REVISED_REVISED_DECISION_ESCALATION_MATRIX.md` (2 occurrences) | `REVISED_DECISION_ESCALATION_MATRIX.md` | ✅ Fixed | AI_OPERATING_CONTEXT.md |
| D-40 | `AI_OPERATING_CONTEXT.md` — FROZEN_DECISIONS #5 | Pagination spec | cursor pagination stated as frozen decision | Code uses page-based; cursor-based is spec target only | ✅ Noted | AI_OPERATING_CONTEXT.md (note added) |
| D-41 | `postgres-init.sql` line 18 | Schema name | `CREATE SCHEMA "order"` | Should be `CREATE SCHEMA "ordering"` | ⬆️ Escalated | GAP-G11 — A-4 (infra change, owner required) |
| D-42 | `delta-log.md` | Entry count / last updated | 7 entries; 2026-06-13 | 8 entries; 2026-06-17 | ✅ Fixed | delta-log.md (DELTA-8 added) |

---

## Cross-Reference Updates

| Source File | Old Reference | New Reference |
|---|---|---|
| `AI_OPERATING_CONTEXT.md` — ACTIVE_AUTHORITY_DOCS | `docs/canon/*` | `docs/legacy/*` (relocated A-1) |
| `AI_OPERATING_CONTEXT.md` — ACTIVE_AUTHORITY_DOCS | `docs/architecture/system-architecture.md`, `docs/architecture/ai-architecture.md` | `docs/legacy/system-architecture.md`, `docs/legacy/ai-architecture.md` (relocated A-2) |
| `AI_OPERATING_CONTEXT.md` — CURRENT_PHASE | "pending relocation" note | "executed 2026-06-17" |
| `docs/00_authority/PROJECT_CHARTER.md` §6 | `docs/architecture/ai-architecture.md` | `docs/legacy/ai-architecture.md` |
| `docs/00_authority/FEATURE_SCOPE.md` | `docs/architecture/ai-architecture.md` | `docs/legacy/ai-architecture.md` |
| `docs/01_backend/README.md` | `docs/canon/data-architecture.md`, `docs/architecture/system-architecture.md` | `docs/legacy/data-architecture.md`, `docs/legacy/system-architecture.md` |
| `docs/01_backend/SERVICE_CATALOG.md` | `docs/architecture/ai-architecture.md` | `docs/legacy/ai-architecture.md` |
| `docs/01_backend/INTEGRATION_CATALOG.md` | `docs/architecture/ai-architecture.md` | `docs/legacy/ai-architecture.md` |
