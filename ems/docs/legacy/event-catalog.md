> **Status: Retired.** Topic catalog superseded by
> `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md` (57 code-verified topics
> vs. ~40 planned here). §10 (topic naming convention and versioning policy,
> e.g. `order.paid.v2`) remains in effect and is not restated elsewhere.

# Event Catalog

> Source: V2 DOCS Phase 2 Prompt 4 — event catalog (baseline, 11 events for Batches
> 1–6), merged with V1 stream-level events per `BUILD_BLUEPRINT.md` §5 to cover the
> gap-fill batches (8–10) and full event-operations surface. Topic naming follows
> `docs/architecture/system-architecture.md` §6: `<domain>.<event>`.
>
> Every event envelope includes: `event_id`, `event_type`, `tenant_id`, `occurred_at`,
> `payload`. Consumers must dedupe on `event_id` (idempotency, see `api-standards.md`).

## 1. Platform Core

| Topic | Producer | Consumers | Payload highlights |
|---|---|---|---|
| `tenant.created` | tenant | auth, rbac | `tenant_id`, `name`, `plan` |
| `tenant.updated` | tenant | — | `tenant_id`, changed fields |
| `tenant.suspended` | tenant | auth | `tenant_id` |
| `user.registered` | auth | rbac, notification, engagement | `user_id`, `tenant_id`, `email` |
| `user.login_succeeded` | auth | audit | `user_id`, `ip`, `device` |
| `user.sso_login_succeeded` | auth | audit | `user_id`, `connection_id` |
| `user.login_failed` | auth | audit | `user_id`/`email`, `reason` |
| `user.password_changed` | auth | audit, notification | `user_id` |
| `user.status_changed` | auth | audit | `user_id`, `status` |
| `role.assigned` | rbac | audit | `user_id`, `role_id` |
| `role.revoked` | rbac | audit | `user_id`, `role_id` |

## 2. Event Operations (V1 lifecycle merge)

| Topic | Producer | Consumers | Payload highlights |
|---|---|---|---|
| `event.created` | event | agenda, exhibitor, ticketing, search | `event_id`, `tenant_id`, `name` |
| `event.published` | event | registration, search | `event_id` |
| `event.unpublished` *(V1)* | event | registration, search | `event_id` |
| `event.went_live` *(V1)* | event | onsite, analytics | `event_id` |
| `event.archived` *(V1)* | event | analytics, search | `event_id` |
| `event.cancelled` | event | registration, agenda, payment | `event_id`, `reason` |
| `session.created` *(V1)* | agenda | speaker, onsite, search, interactive-engagement | `session_id`, `event_id`, `track_id`, `room_id` |
| `session.updated` *(V1)* | agenda | speaker, search | `session_id`, changed fields |
| `session.cancelled` *(V1)* | agenda | speaker, onsite | `session_id` |
| `speaker.created` | speaker | search | `speaker_id`, `tenant_id` |
| `speaker.assigned_to_session` | speaker | agenda, notification | `speaker_id`, `session_id` |
| `exhibitor.created` *(V1)* | exhibitor | search, analytics | `exhibitor_id`, `event_id` |
| `sponsor.created` *(V1)* | exhibitor | analytics | `sponsor_id`, `event_id`, `sponsor_package_id` |
| `lead.captured` *(V1)* | exhibitor | analytics, notification | `lead_id`, `exhibitor_id`, `attendee_id` |
| `attendee.created` | attendee | onsite, networking, engagement, search, ai-service | `attendee_id`, `event_id`, `user_id` |
| `attendee.profile_updated` | attendee | engagement, ai-service, search | `attendee_id`, changed fields |

## 3. Participation

| Topic | Producer | Consumers | Payload highlights |
|---|---|---|---|
| `registration.submitted` | registration | notification | `registration_id`, `event_id`, `user_id` |
| `registration.approved` | registration | notification | `registration_id` |
| `registration.confirmed` *(aka AttendeeCreated trigger, V1)* | registration | attendee, notification, engagement | `registration_id`, `event_id`, `user_id`, `ticket_id` |
| `registration.cancelled` | registration | notification | `registration_id` |
| `registration.waitlisted` | registration | notification | `registration_id` |
| `attendee.checked_in` *(V1)* | onsite | notification, analytics | `attendee_id`, `event_id`, `checked_in_at` |
| `session.attended` *(V1)* | onsite | analytics, interactive-engagement | `attendee_id`, `session_id`, `scanned_at` |

## 4. Commerce Core (V2 baseline)

| Topic | Producer | Consumers | Payload highlights |
|---|---|---|---|
| `ticket_product.created` | ticketing | pricing, inventory | `ticket_product_id`, `event_id`, `base_price` |
| `inventory.reserved` | inventory | order | `inventory_pool_id`, `order_id`, `quantity`, `expires_at` |
| `inventory.released` | inventory | order | `inventory_pool_id`, `order_id` |
| `inventory.depleted` | inventory | analytics, notification | `inventory_pool_id` |
| `order.created` | order | inventory, payment | `order_id`, `tenant_id`, `event_id`, `items[]` |
| `order.paid` | order | registration, notification, analytics | `order_id` |
| `order.cancelled` | order | inventory | `order_id` |
| `order.fulfilled` | order | ticketing, notification | `order_id` |
| `payment.completed` | payment | order, fulfillment | `payment_id`, `order_id`, `amount` |
| `payment.failed` | payment | order, notification | `payment_id`, `order_id`, `reason` |
| `payment.refunded` | payment | order, registration, ticketing, notification | `payment_id`, `order_id`, `amount` |
| `promo_code.redeemed` | pricing | analytics | `promo_code_id`, `order_id` |
| `ticket.issued` | ticketing | notification, analytics | `ticket_id`, `order_item_id`, `attendee_id` |
| `ticket.redeemed` | ticketing | analytics | `ticket_id` |
| `ticket.voided` | ticketing | analytics | `ticket_id` |
| `fulfillment.completed` | fulfillment | order, notification | `order_id` |

## 5. Engagement / Marketing

| Topic | Producer | Consumers | Payload highlights |
|---|---|---|---|
| `notification.sent` | notification | analytics | `message_id`, `channel`, `recipient_id` |
| `notification.failed` | notification | analytics | `message_id`, `reason` |
| `campaign.scheduled` | engagement | notification | `campaign_id`, `event_id`, `schedule` |
| `campaign.sent` | engagement | analytics | `campaign_id` |

## 6. Social — Batch 8 (V1 merge)

| Topic | Producer | Consumers | Payload highlights |
|---|---|---|---|
| `connection.requested` *(AttendeeConnected family, V1)* | networking | notification | `connection_id`, `attendee_a_id`, `attendee_b_id` |
| `connection.accepted` | networking | notification, analytics | `connection_id` |
| `connection.declined` | networking | — | `connection_id` |

## 7. Interactive Engagement — Batch 9 (V1 merge)

| Topic | Producer | Consumers | Payload highlights |
|---|---|---|---|
| `poll.created` | interactive-engagement | onsite (display), analytics | `poll_id`, `session_id` |
| `poll.responded` *(PollSubmitted, V1)* | interactive-engagement | analytics | `poll_id`, `attendee_id`, `choice` |
| `qa.question_submitted` | interactive-engagement | notification (moderator), analytics | `question_id`, `session_id`, `attendee_id` |
| `survey.completed` *(V1)* | interactive-engagement | analytics, ai-service | `survey_id`, `attendee_id` |

## 8. AI Layer — Batch 10 (gap-fill)

| Topic | Producer | Consumers | Payload highlights |
|---|---|---|---|
| `embedding.updated` | ai-service | search | `entity_type`, `entity_id`, `model_version` |

## 9. Wildcard Consumers

- **audit** subscribes to all topics above to populate `AuditLog`.
- **analytics** subscribes to all topics above to build read models
  (`docs/canon/read-model-catalog.md`).
- **integration** subscribes per-tenant to a configurable subset for outbound webhooks.

## 10. Naming Conventions

- Topic = `<owning_domain>.<past_tense_event>` (e.g., `order.paid`, not `order.pay`).
- One topic per event type — no generic `*.updated` catch-alls except where the
  entity genuinely has a single mutable-field-set update event (e.g.,
  `tenant.updated`, `session.updated`).
- Versioning: breaking payload changes require a new topic suffix (`order.paid.v2`),
  per `docs/canon/api-standards.md` versioning policy.
