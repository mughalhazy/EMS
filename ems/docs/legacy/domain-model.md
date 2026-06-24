> **Status: Retired.** Superseded by `docs/00_authority/DOMAIN_MODEL.md`
> (code-verified). Retained as design-intent reference for GAP-G9 (16 entity
> naming deviations pending ADR reconciliation) and DELTA-1
> (`order`→`ordering` schema rename). See `docs/08_reports/DUPLICATION_ANALYSIS_REPORT.md` D-1.

# Domain Model

> Source: V1 Packet 0 Prompt 4 — Domain Model (initial) refined by V2 DOCS Phase 2 Prompt 2 —
> domain model (authoritative for entity naming). Reconciled with V1 stream bundles and
> the gap-fill batches per `BUILD_BLUEPRINT.md` §3 and §12.
>
> Every entity below carries `tenant_id` unless explicitly noted as global/platform-scoped.
> "Owning service" = the only service permitted to write that entity (see `service-map.md`).

## 1. Platform Core (Batch 1)

### Tenant
- **Owning service**: tenant
- Fields: `id`, `name`, `slug`, `plan`, `status`, `created_at`
- Global/platform-scoped (no `tenant_id` — this *is* the tenant).

### Organization
- **Owning service**: tenant
- Fields: `id`, `tenant_id`, `name`, `billing_info`
- Relationships: belongs to `Tenant`.

### TenantSettings
- **Owning service**: tenant
- Fields: `tenant_id`, `key`, `value`
- Relationships: 1:N from `Tenant`. Key/value config store (branding, feature flags, locale).

### User
- **Owning service**: auth
- Fields: `id`, `tenant_id`, `email`, `name`, `status`
- Relationships: N:1 `Tenant`; N:M `Role` via `UserRole`.

### UserCredential
- **Owning service**: auth
- Fields: `user_id`, `password_hash`, `mfa_enabled`, `last_login_at`
- Relationships: 1:1 `User`.

### AuthSession
- **Owning service**: auth
- Fields: `id`, `user_id`, `refresh_token_hash`, `issued_at`, `expires_at`, `revoked_at`
- Relationships: N:1 `User`.

### Role
- **Owning service**: rbac
- Fields: `id`, `tenant_id` (nullable for platform-global roles), `name`

### Permission
- **Owning service**: rbac
- Fields: `id`, `code`, `description` (platform-global, not tenant-scoped)

### UserRole
- **Owning service**: rbac
- Fields: `user_id`, `role_id`
- Relationships: M:N join between `User` and `Role`.

### AuditLog
- **Owning service**: audit
- Fields: `id`, `tenant_id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `before`, `after`, `created_at`
- Captures: auth events, role/permission changes, tenant changes, and entity
  mutations from every other service (consumed via event bus).

---

## 2. Event Operations (Batch 2)

### Event
- **Owning service**: event
- Fields: `id`, `tenant_id`, `name`, `slug`, `status` (`draft|published|live|archived|cancelled`),
  `start_at`, `end_at`, `timezone`, `capacity`, `visibility`
- Relationships: 1:N `Venue` association, `Track`, `Session`, `Exhibitor`, `Registration`, `Order`.

### Venue
- **Owning service**: event
- Fields: `id`, `tenant_id`, `name`, `address`, `geo`
- Relationships: 1:N `Room`; N:M `Event` (an event may use one venue; a venue may host many events).

### Room
- **Owning service**: event
- Fields: `id`, `venue_id`, `name`, `capacity`
- Relationships: N:1 `Venue`; 1:N `Session`.

### Track
- **Owning service**: agenda
- Fields: `id`, `event_id`, `name`, `description`
- Relationships: N:1 `Event`; 1:N `Session`.

### Session
- **Owning service**: agenda
- Fields: `id`, `event_id`, `track_id`, `room_id`, `title`, `description`,
  `start_time`, `end_time`, `capacity`
- Relationships: N:1 `Event`, `Track`, `Room`; M:N `Speaker` via `SessionSpeaker`;
  1:N `SessionAttendance`, `Poll`, `QAQuestion`.
- Constraints: scheduling service must prevent room/time conflicts within an event.

### Speaker
- **Owning service**: speaker
- Fields: `id`, `tenant_id`, `user_id` (nullable), `name`
- Relationships: 1:1 `SpeakerProfile`; M:N `Session` via `SessionSpeaker`.

### SpeakerProfile
- **Owning service**: speaker
- Fields: `speaker_id`, `bio`, `photo_url`, `social_links`, `title`, `company`

### SessionSpeaker
- **Owning service**: speaker
- Fields: `session_id`, `speaker_id`, `role` (e.g., `presenter|moderator|panelist`)
- Relationships: M:N join, supports multiple speakers per session and multi-session speakers.

### Exhibitor
- **Owning service**: exhibitor
- Fields: `id`, `event_id`, `tenant_id`, `name`, `description`, `contact_info`
- Relationships: N:1 `Event`; 1:N `Booth`, `Lead`; 0:1 `Sponsor`.

### Booth
- **Owning service**: exhibitor
- Fields: `id`, `exhibitor_id`, `venue_id`, `location`, `capacity`
- Relationships: N:1 `Exhibitor`, `Venue`.

### SponsorPackage
- **Owning service**: exhibitor
- Fields: `id`, `event_id`, `tier` (`gold|silver|bronze`), `price`, `benefits`
- Relationships: N:1 `Event`; 1:N `Sponsor`.

### Sponsor *(reconciliation entity — see BUILD_BLUEPRINT.md §6 conflict)*
- **Owning service**: exhibitor
- Fields: `id`, `event_id`, `exhibitor_id` (nullable — a sponsor need not have a booth),
  `sponsor_package_id`, `display_name`, `logo_url`, `website`
- Relationships: N:1 `Event`, `SponsorPackage`; 0:1 `Exhibitor`.
- **Resolution**: V1 modeled `Sponsor` as a standalone entity; V2 only specified
  `SponsorPackage` under the Exhibitor module. Here, `Sponsor` is retained as a
  thin entity representing "an org that holds a sponsor package for this event,"
  optionally linked to an `Exhibitor` record if they also have a booth. Both
  `Sponsor` and `SponsorPackage` are owned by the `exhibitor` service — no new
  service required.

### Lead
- **Owning service**: exhibitor
- Fields: `id`, `exhibitor_id`, `attendee_id`, `captured_at`, `captured_by_device_id`, `notes`
- Relationships: N:1 `Exhibitor`, `Attendee`.

### Attendee
- **Owning service**: attendee
- Fields: `id`, `tenant_id`, `event_id`, `user_id`, `registration_id`
- Relationships: N:1 `Event`, `User`, `Registration` (1:1 — created from a confirmed registration);
  1:1 `AttendeeProfile`; 1:N `AttendeeTag`, `AttendeeConnection`, `CheckinRecord`,
  `SessionAttendance`, `Lead` (as the captured party).

### AttendeeProfile
- **Owning service**: attendee
- Fields: `attendee_id`, `bio`, `interests`, `company`, `title`, `photo_url`

### AttendeeTag
- **Owning service**: attendee
- Fields: `attendee_id`, `tag`

---

## 3. Participation (Batch 3)

### Registration
- **Owning service**: registration
- Fields: `id`, `tenant_id`, `event_id`, `user_id`, `ticket_id` (nullable until commerce
  link resolves), `status`
- Relationships: N:1 `Event`, `User`, `Ticket`; 1:1 `Attendee` (created on confirmation);
  1:N `RegistrationStatus` (history), `RegistrationAnswer`.

### RegistrationStatus
- **Owning service**: registration
- Fields: `registration_id`, `status` (`pending|approved|confirmed|cancelled|waitlisted`), `changed_at`
- History/audit trail of status transitions.

### RegistrantProfile
- **Owning service**: registration
- Fields: `registration_id`, `name`, `contact`, `custom_answers` (JSON)

### RegistrationQuestion / RegistrationAnswer
- **Owning service**: registration
- Fields (Question): `id`, `event_id`, `label`, `type`, `required`
- Fields (Answer): `registration_id`, `question_id`, `value`
- Supports per-event custom registration fields.

### CheckinRecord
- **Owning service**: onsite
- Fields: `id`, `attendee_id`, `event_id`, `checked_in_at`, `device_id`
- Constraint: duplicate check-ins for the same attendee+event are rejected.

### Badge
- **Owning service**: onsite
- Fields: `id`, `attendee_id`, `qr_code`, `printed_at`
- Relationships: 1:1 `Attendee`. Generated on first check-in.

### ScanningDevice
- **Owning service**: onsite
- Fields: `id`, `event_id`, `device_id`, `status`

### SessionAttendance
- **Owning service**: onsite
- Fields: `id`, `attendee_id`, `session_id`, `scanned_at`
- Relationships: N:1 `Attendee`, `Session`.

---

## 4. Commerce Core (Batch 4)

> V2 splits V1's three flat entities (`ticket`, `order`, `payment`) into 11 entities
> across 6 modules. Build order: Ticketing → Pricing → Inventory → Order → Payment → Fulfillment.

### TicketProduct
- **Owning service**: ticketing
- Fields: `id`, `event_id`, `name`, `type` (`general|vip|early-bird|...`), `base_price`, `currency`
- Relationships: N:1 `Event`; 1:N `Ticket`, `PriceRule`, `InventoryPool`.

### Ticket
- **Owning service**: ticketing
- Fields: `id`, `ticket_product_id`, `order_item_id`, `attendee_id` (nullable until assigned),
  `qr_code`, `status` (`issued|assigned|redeemed|void`)
- Relationships: N:1 `TicketProduct`, `OrderItem`; 0:1 `Attendee`.

### TicketEntitlement
- **Owning service**: ticketing
- Fields: `id`, `ticket_id`, `entitlement_type`, `value`
- Examples: session access, lounge access, swag bag.

### PriceRule
- **Owning service**: pricing
- Fields: `id`, `ticket_product_id`, `rule_type` (`tier|early-bird|time-window`),
  `value`, `valid_from`, `valid_to`

### DiscountRule
- **Owning service**: pricing
- Fields: `id`, `scope` (`ticket_product|order`), `discount_type` (`percentage|fixed`), `value`

### PromoCode
- **Owning service**: pricing
- Fields: `id`, `code`, `discount_rule_id`, `usage_limit`, `used_count`, `valid_from`, `valid_to`

### InventoryPool
- **Owning service**: inventory
- Fields: `id`, `ticket_product_id`, `total_capacity`, `available`
- Relationships: N:1 `TicketProduct`; 1:N `InventoryReservation`.

### InventoryReservation
- **Owning service**: inventory
- Fields: `id`, `inventory_pool_id`, `order_id`, `quantity`, `expires_at`
- **Implementation note**: backed by Redis TTL (`infra/cache`) to enforce hold
  expiry and prevent overselling under concurrency (Redis lock per `inventory_pool_id`).

### Order
- **Owning service**: order
- Fields: `id`, `tenant_id`, `event_id`, `user_id`, `status`, `currency`, `subtotal`, `total`
- Relationships: 1:N `OrderItem`, `OrderStatus`; 1:N `Payment`.

### OrderItem
- **Owning service**: order
- Fields: `id`, `order_id`, `ticket_product_id`, `quantity`, `unit_price`
- Relationships: N:1 `Order`, `TicketProduct`; 1:N `Ticket`.

### OrderStatus
- **Owning service**: order
- Fields: `order_id`, `status` (`created|pending_payment|paid|fulfilled|cancelled|refunded`), `changed_at`

### Payment
- **Owning service**: payment
- Fields: `id`, `order_id`, `provider` (e.g., `stripe`), `provider_ref`, `status`, `amount`, `currency`
- Relationships: N:1 `Order`; 1:N `PaymentTransaction`, `Refund`.

### PaymentTransaction
- **Owning service**: payment
- Fields: `id`, `payment_id`, `type` (`authorize|capture|refund`), `amount`, `status`, `created_at`

### Refund
- **Owning service**: payment
- Fields: `id`, `payment_id`, `amount`, `reason`, `status`

### Fulfillment (process, no new core entities)
- **Owning service**: fulfillment
- Responsibilities: ticket issuance (creates `Ticket` rows from `OrderItem` after
  `payment.completed`), order completion (`OrderStatus -> fulfilled`), email
  confirmation (via `notification` service).

---

## 5. Engagement / Marketing (Batch 5)

### NotificationMessage
- **Owning service**: notification
- Fields: `id`, `tenant_id`, `recipient_id`, `channel` (`email|sms|push`),
  `template`, `payload`, `status`, `sent_at`

### Campaign
- **Owning service**: engagement
- Fields: `id`, `tenant_id`, `event_id`, `name`, `schedule`, `status`
- Relationships: 1:N `AudienceSegment`.

### AudienceSegment
- **Owning service**: engagement
- Fields: `id`, `campaign_id`, `criteria` (JSON query against `Attendee`/`AttendeeTag`/`Registration`)

---

## 6. Social — Batch 8 (gap-fill)

### AttendeeConnection
- **Owning service**: networking
- Fields: `id`, `attendee_a_id`, `attendee_b_id`, `status` (`requested|accepted|declined`), `requested_at`
- Relationships: M:N self-referential on `Attendee`.

---

## 7. Interactive Engagement — Batch 9 (gap-fill)

### Poll
- **Owning service**: interactive-engagement
- Fields: `id`, `session_id`, `question`, `options` (JSON)
- Relationships: N:1 `Session`; 1:N `PollResponse`.

### PollResponse
- **Owning service**: interactive-engagement
- Fields: `id`, `poll_id`, `attendee_id`, `choice`

### QAQuestion
- **Owning service**: interactive-engagement
- Fields: `id`, `session_id`, `attendee_id`, `question`, `upvotes`, `answered`

### Survey
- **Owning service**: interactive-engagement
- Fields: `id`, `event_id`, `questions` (JSON)
- Relationships: N:1 `Event`; 1:N `SurveyResponse`.

### SurveyResponse
- **Owning service**: interactive-engagement
- Fields: `id`, `survey_id`, `attendee_id`, `answers` (JSON)

---

## 8. Intelligence (Batch 6)

Read models (no independent write-side schema — projections built from the event
stream). Defined in detail in `docs/canon/read-model-catalog.md`:

- `EventDashboardView`
- `TicketSalesSummary`
- `AttendanceMetrics`

Plus OpenSearch indices (no relational schema), owned by `search`:
`events`, `sessions`, `speakers`, `attendees`.

---

## 9. AI Layer — Batch 10 (gap-fill)

### VectorEmbedding
- **Owning service**: ai-service
- Fields: `id`, `entity_type`, `entity_id`, `vector`, `model_version`, `updated_at`
- Powers semantic search and attendee matchmaking (see `docs/architecture/ai-architecture.md`).

### AIInteractionLog
- **Owning service**: ai-service
- Fields: `id`, `tenant_id`, `user_id`, `prompt`, `response`, `context`, `created_at`

---

## 10. Cross-Cutting Notes

- **Tenant isolation**: every table above except `Tenant`, `Permission`, and
  OpenSearch indices carries `tenant_id` and is subject to the isolation
  middleware described in `docs/canon/security-model.md`.
- **Outbox**: every owning service maintains an `outbox` table (not listed per
  entity above — it is a generic infrastructure table provided by
  `infra/event-bus`) for the events listed in `docs/canon/event-catalog.md`.
- **No cross-service foreign keys**: relationships that cross service
  boundaries (e.g., `Registration.ticket_id -> Ticket`) are referenced by ID
  only, not enforced at the database level — consistency is maintained via
  domain events.
