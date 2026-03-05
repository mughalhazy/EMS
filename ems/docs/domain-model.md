# EMS Domain Model

This document defines the core Event Management System (EMS) domain entities, their relationships, and key data constraints. The model is multi-tenant by design and supports conferences, trade shows, and similar events.

## Modeling Principles

- **Tenant-first isolation:** Every business record is scoped to a `tenant`.
- **Organization hierarchy:** A tenant can manage multiple organizations (event owners, agencies, sponsors, exhibitors).
- **Role-based access:** Users can hold multiple roles, potentially with event-level scope.
- **Event-centric operations:** Commercial, logistics, and engagement workflows pivot around events.
- **Auditability and integrity:** Immutable identifiers, status fields, timestamps, and referential constraints are expected on all entities.

---

## Entities

### 1) tenant
Represents an isolated customer space in EMS.

**Key attributes**
- `id` (PK)
- `name` (unique)
- `slug` (unique, immutable)
- `status` (`active|suspended|archived`)
- `created_at`, `updated_at`

**Constraints**
- `slug` must be globally unique.
- Hard delete is discouraged once production data exists.

---

### 2) organization
A business unit within a tenant (e.g., event host, sponsor company, exhibitor company, agency).

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `name`
- `type` (`host|sponsor|exhibitor|agency|vendor|other`)
- `external_ref` (optional integration key)
- `created_at`, `updated_at`

**Constraints**
- Unique per tenant: (`tenant_id`, `name`).
- Must always belong to exactly one tenant.

---

### 3) user
A system identity used for platform access (staff, organizer, speaker admin, etc.).

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `organization_id` (FK -> organization, nullable)
- `email`
- `first_name`, `last_name`
- `status` (`invited|active|disabled`)
- `last_login_at`
- `created_at`, `updated_at`

**Constraints**
- Unique email per tenant: (`tenant_id`, `email`).
- `organization_id`, if present, must reference an organization in the same tenant.

---

### 4) role
Defines permissions that can be assigned to users.

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `name` (e.g., `tenant_admin`, `event_manager`, `checkin_staff`)
- `scope` (`tenant|organization|event`)
- `description`
- `created_at`, `updated_at`

**Constraints**
- Unique role name per tenant: (`tenant_id`, `name`).
- Roles are assigned through a join model (recommended: `user_role_assignment`) supporting optional scope references.

---

### 5) event
Top-level event (conference, expo, summit).

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `organization_id` (FK -> organization, owner/host)
- `name`
- `code` (short unique identifier)
- `description`
- `timezone`
- `start_at`, `end_at`
- `status` (`draft|published|live|completed|cancelled`)
- `created_at`, `updated_at`

**Constraints**
- Unique event code per tenant: (`tenant_id`, `code`).
- `start_at < end_at`.
- Owner organization must belong to same tenant.

---

### 6) venue
Physical or virtual location hosting an event.

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `event_id` (FK -> event)
- `name`
- `type` (`physical|virtual|hybrid`)
- `address_line1`, `city`, `country` (nullable for virtual)
- `virtual_url` (nullable for physical)
- `capacity` (optional)
- `created_at`, `updated_at`

**Constraints**
- Must belong to one event.
- For `physical`, address required; for `virtual`, `virtual_url` required.

---

### 7) room
Sub-location within a venue where sessions occur.

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `venue_id` (FK -> venue)
- `name`
- `floor` (optional)
- `capacity`
- `created_at`, `updated_at`

**Constraints**
- Unique room name per venue: (`venue_id`, `name`).
- `capacity >= 0`.

---

### 8) session
Agenda item within an event (talk, panel, workshop).

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `event_id` (FK -> event)
- `room_id` (FK -> room, nullable for virtual/unassigned)
- `title`
- `abstract`
- `session_type` (`keynote|talk|panel|workshop|networking|other`)
- `start_at`, `end_at`
- `capacity` (optional)
- `status` (`draft|scheduled|completed|cancelled`)
- `created_at`, `updated_at`

**Constraints**
- `start_at < end_at`.
- If `room_id` is set, room must belong to the same event via room -> venue -> event chain.
- No overlapping scheduled sessions in same room time window (enforced at app/DB exclusion constraint where supported).

---

### 9) speaker
Profile of a person speaking at sessions.

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `event_id` (FK -> event)
- `organization_id` (FK -> organization, nullable)
- `first_name`, `last_name`
- `email` (optional)
- `bio`
- `status` (`invited|confirmed|declined|withdrawn`)
- `created_at`, `updated_at`

**Constraints**
- Speaker is event-scoped.
- Many-to-many with `session` via recommended join entity `session_speaker`.

---

### 10) ticket
Sellable or allocatable admission type for an event.

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `event_id` (FK -> event)
- `name`
- `description`
- `price_amount`, `price_currency`
- `quantity_total`
- `quantity_sold`
- `sales_start_at`, `sales_end_at`
- `status` (`draft|on_sale|sold_out|closed`)
- `created_at`, `updated_at`

**Constraints**
- Unique ticket name per event: (`event_id`, `name`).
- `price_amount >= 0`.
- `0 <= quantity_sold <= quantity_total`.
- Sales window must satisfy `sales_start_at < sales_end_at` when both present.

---

### 11) registration
Represents an attendee’s registration intent/record for an event, linked to ticketing and checkout.

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `event_id` (FK -> event)
- `attendee_id` (FK -> attendee)
- `ticket_id` (FK -> ticket)
- `order_id` (FK -> order, nullable until checkout)
- `status` (`pending|confirmed|cancelled|waitlisted|refunded`)
- `registered_at`
- `checkin_at` (optional)
- `created_at`, `updated_at`

**Constraints**
- One attendee cannot hold duplicate active registrations for same ticket/event (unique partial index by status).
- `ticket_id` must reference ticket in same event.

---

### 12) attendee
Person attending an event (can exist with or without platform user account).

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `event_id` (FK -> event)
- `user_id` (FK -> user, nullable)
- `organization_id` (FK -> organization, nullable)
- `first_name`, `last_name`
- `email`
- `phone` (optional)
- `badge_name` (optional)
- `status` (`prospect|registered|checked_in|cancelled`)
- `created_at`, `updated_at`

**Constraints**
- Unique attendee email per event: (`event_id`, `email`).
- If `user_id` is set, user must belong to same tenant.

---

### 13) sponsor
Sponsorship agreement record for an organization at an event.

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `event_id` (FK -> event)
- `organization_id` (FK -> organization)
- `tier` (`platinum|gold|silver|bronze|custom`)
- `amount`
- `benefits_json` (structured benefit package)
- `status` (`prospect|active|fulfilled|cancelled`)
- `created_at`, `updated_at`

**Constraints**
- Organization can appear once per tier per event (or once per event per business rule).
- `amount >= 0`.

---

### 14) exhibitor
Exhibitor participation record for an organization at an event.

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `event_id` (FK -> event)
- `organization_id` (FK -> organization)
- `booth_code`
- `booth_size`
- `status` (`invited|confirmed|checked_in|cancelled`)
- `created_at`, `updated_at`

**Constraints**
- Unique booth per event: (`event_id`, `booth_code`).
- Organization can have at most one active exhibitor record per event.

---

### 15) lead
Captured commercial lead (typically at exhibitor booths or sponsor activations).

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `event_id` (FK -> event)
- `exhibitor_id` (FK -> exhibitor, nullable)
- `sponsor_id` (FK -> sponsor, nullable)
- `attendee_id` (FK -> attendee, nullable)
- `captured_by_user_id` (FK -> user)
- `full_name`
- `email`
- `phone` (optional)
- `score` (optional)
- `status` (`new|qualified|disqualified|follow_up|converted`)
- `notes`
- `created_at`, `updated_at`

**Constraints**
- At least one of `exhibitor_id` or `sponsor_id` must be present.
- Lead email uniqueness should be event- and owner-scoped to avoid duplicate clutter.

---

### 16) order
Commercial order representing a checkout transaction (can include one or multiple ticket lines).

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `event_id` (FK -> event)
- `buyer_attendee_id` (FK -> attendee, nullable)
- `order_number`
- `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`
- `currency`
- `status` (`draft|pending_payment|paid|partially_refunded|refunded|cancelled`)
- `placed_at`
- `created_at`, `updated_at`

**Constraints**
- Unique order number per tenant: (`tenant_id`, `order_number`).
- `total_amount = subtotal + tax - discount`.
- Non-negative monetary fields, except refund adjustments tracked separately.

---

### 17) payment
Payment transaction associated with an order.

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `order_id` (FK -> order)
- `provider` (`stripe|adyen|paypal|bank_transfer|offline|other`)
- `provider_payment_ref`
- `amount`
- `currency`
- `status` (`initiated|authorized|captured|failed|refunded|voided`)
- `paid_at` (optional)
- `failure_reason` (optional)
- `created_at`, `updated_at`

**Constraints**
- Provider payment reference unique per provider: (`provider`, `provider_payment_ref`).
- Sum of captured payments should equal or exceed order total for `order.status = paid`.

---

### 18) notification
Message sent by system (email/SMS/push/in-app) related to operational or transactional events.

**Key attributes**
- `id` (PK)
- `tenant_id` (FK -> tenant)
- `event_id` (FK -> event, nullable)
- `recipient_user_id` (FK -> user, nullable)
- `recipient_attendee_id` (FK -> attendee, nullable)
- `channel` (`email|sms|push|in_app|webhook`)
- `template_key`
- `subject` (nullable depending on channel)
- `payload_json`
- `status` (`queued|sent|delivered|failed|bounced|suppressed`)
- `sent_at`, `delivered_at` (optional)
- `created_at`, `updated_at`

**Constraints**
- Must target at least one recipient (`recipient_user_id` or `recipient_attendee_id` or explicit external address in payload).
- Notification dispatch should be idempotent using deduplication key (recommended).

---

## Relationship Summary

### Core hierarchy
- `tenant` 1---* `organization`
- `tenant` 1---* `user`
- `tenant` 1---* `role`
- `tenant` 1---* `event`

### Event logistics
- `event` 1---* `venue`
- `venue` 1---* `room`
- `event` 1---* `session`
- `session` *---* `speaker` (via `session_speaker`)

### Participation & commerce
- `event` 1---* `ticket`
- `event` 1---* `attendee`
- `attendee` 1---* `registration`
- `ticket` 1---* `registration`
- `order` 1---* `payment`
- `order` 1---* `registration` (one order can cover multiple registrations)

### Partners & lead capture
- `event` 1---* `sponsor`
- `event` 1---* `exhibitor`
- `sponsor` 1---* `lead` (optional path)
- `exhibitor` 1---* `lead` (optional path)
- `attendee` 1---* `lead` (optional association)

### Messaging
- `event` 1---* `notification` (optional event scope)
- `user` 1---* `notification` (recipient path)
- `attendee` 1---* `notification` (recipient path)

---

## Cross-Cutting Constraints

1. **Tenant consistency rule**  
   All foreign-key relationships must preserve tenant boundaries. For every FK chain, parent and child `tenant_id` values must match.

2. **Status lifecycle enforcement**  
   State transitions should be validated by a domain service/state machine (e.g., prevent `paid -> draft`, prevent `completed -> draft`).

3. **Time integrity**  
   Datetimes should be stored in UTC with event timezone metadata for display. Business rules (sales windows, session windows, event windows) should validate chronological order.

4. **Soft delete + audit**  
   Prefer soft deletes (`deleted_at`) and immutable audit logs for financial and compliance-sensitive entities (`order`, `payment`, `registration`, `notification`).

5. **PII handling**  
   Entities containing personal data (`user`, `attendee`, `speaker`, `lead`) require retention, masking, and export/delete workflows compliant with applicable privacy regulations.

6. **Idempotency for integration boundaries**  
   Payment callbacks and notification dispatches should use idempotency keys to avoid duplicate side effects.

## Recommended Supporting Join/Lookup Models (Non-mandatory)

To operationalize the model cleanly, these additional models are recommended:

- `user_role_assignment` (user <-> role with optional `event_id`/`organization_id` scope)
- `session_speaker` (session <-> speaker)
- `order_line` (order <-> ticket with quantity/unit price)
- `registration_checkin` (historical check-in/out records)
- `notification_delivery_attempt` (provider-level retry log)

These are not part of the mandatory entity list but are typically required for production-grade behavior.
