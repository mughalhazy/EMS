# Read Model Catalog

This catalog defines canonical read models that support query-heavy workflows and UI surfaces.

## Event Dashboard

**Purpose:** Provide a high-level operational view of an event.

**Primary consumers:** Organizer home, operations team.

**Suggested projection fields:**
- `event_id`, `event_slug`, `name`, `status`, `timezone`
- `starts_at`, `ends_at`, `venue_name`
- `published_at`, `last_activity_at`
- `total_registrations`, `approved_registrations`, `checked_in_count`
- `gross_sales_amount`, `refund_amount`, `net_sales_amount`

**Primary source events:** `EventCreated`, `EventPublished`, `EventCancelled`, `RegistrationSubmitted`, `RegistrationApproved`, `AttendeeCheckedIn`, `OrderCreated`, `PaymentCaptured`, `RefundIssued`.

## Agenda Planner

**Purpose:** Serve a schedule-first view for building and reviewing sessions.

**Primary consumers:** Program managers, speakers, attendees.

**Suggested projection fields:**
- `event_id`, `agenda_version`, `last_published_at`
- `session_id`, `title`, `track`, `format`, `room`
- `starts_at`, `ends_at`, `duration_minutes`
- `speaker_ids`, `capacity`, `waitlist_enabled`
- `session_status` (draft/published/cancelled)

**Primary source events:** agenda/session lifecycle events (created, updated, moved, published, cancelled), speaker assignment events, room allocation changes.

## Ticket Sales

**Purpose:** Provide near real-time commercial performance by event and ticket type.

**Primary consumers:** Revenue operations, organizers.

**Suggested projection fields:**
- `event_id`, `ticket_type_id`, `ticket_type_name`
- `price`, `currency`, `sales_window_open_at`, `sales_window_close_at`
- `qty_sold`, `qty_refunded`, `qty_net`
- `gross_amount`, `refund_amount`, `net_amount`
- `conversion_rate`, `abandoned_checkout_count`

**Primary source events:** `OrderCreated`, `PaymentAuthorized`, `PaymentCaptured`, `RefundIssued`, ticket issuance/void events.

## Inventory Status

**Purpose:** Track sellable and reserved inventory for capacity-controlled items.

**Primary consumers:** Ticketing engine, organizer controls.

**Suggested projection fields:**
- `event_id`, `inventory_item_id`, `inventory_type` (ticket/session/add-on)
- `total_capacity`, `held_capacity`, `reserved_capacity`, `sold_capacity`
- `available_capacity`, `oversell_threshold`, `is_sold_out`
- `last_adjusted_at`, `last_reservation_expires_at`

**Primary source events:** inventory seeded/adjusted events, reservation held/released events, `PaymentCaptured`, refund/reinstatement events.

## Order Detail

**Purpose:** Support full order lookup for support and customer self-service.

**Primary consumers:** Buyer portal, support tooling.

**Suggested projection fields:**
- `order_id`, `event_id`, `buyer_account_id`, `order_status`
- `line_items[]` (ticket/add-on, quantity, unit_price, totals)
- `discounts[]`, `taxes[]`, `fees[]`
- `subtotal_amount`, `total_amount`, `currency`
- `payment_status`, `fulfillment_status`, `created_at`, `updated_at`

**Primary source events:** `OrderCreated`, order line updates, `PaymentAuthorized`, `PaymentCaptured`, `RefundIssued`, `TicketIssued`.

## Payment Ledger

**Purpose:** Maintain an auditable query model of monetary movements.

**Primary consumers:** Finance, reconciliation, compliance.

**Suggested projection fields:**
- `ledger_entry_id`, `order_id`, `event_id`, `accounting_period`
- `entry_type` (authorization/capture/refund/chargeback/fee/payout)
- `amount`, `currency`, `processor`, `processor_reference`
- `occurred_at`, `recorded_at`, `reconciliation_status`
- `balance_after_entry` (optional, by account)

**Primary source events:** `PaymentAuthorized`, `PaymentCaptured`, `RefundIssued`, payout/fee/chargeback events.

## Attendee Profile

**Purpose:** Provide a unified attendee-centric view across registration, tickets, and onsite actions.

**Primary consumers:** Onsite staff, attendee portal, support.

**Suggested projection fields:**
- `attendee_id`, `event_id`, `account_id`, `display_name`, `email`
- `registration_status`, `approval_status`, `check_in_status`
- `ticket_ids[]`, `badge_id`, `dietary_flags`, `accessibility_flags`
- `session_bookmarks[]`, `consent_flags[]`
- `last_check_in_at`, `last_profile_update_at`

**Primary source events:** registration submitted/updated/approved/rejected events, ticket assignment events, `AttendeeCheckedIn`, profile update events.

## Registration Approvals

**Purpose:** Drive queue-based review of registrations requiring manual approval.

**Primary consumers:** Review team, event administrators.

**Suggested projection fields:**
- `registration_id`, `event_id`, `submitted_at`, `sla_deadline_at`
- `applicant_name`, `applicant_email`, `company`, `role`
- `screening_answers`, `risk_flags`, `priority_score`
- `review_status` (pending/in-review/approved/rejected)
- `reviewed_by`, `reviewed_at`, `decision_reason`

**Primary source events:** `RegistrationSubmitted`, registration enrichment updates, `RegistrationApproved`, registration rejection events.

## Check-in Console

**Purpose:** Optimize door operations with a low-latency check-in/search model.

**Primary consumers:** Onsite check-in staff.

**Suggested projection fields:**
- `event_id`, `attendee_id`, `lookup_tokens` (name, email, QR code)
- `ticket_validity_status`, `check_in_status`, `check_in_count`
- `last_check_in_at`, `check_in_location`, `checked_in_by`
- `hold_flags` (payment issue, approval required, duplicate)
- `onsite_notes`

**Primary source events:** ticket issuance/void events, registration approval updates, `AttendeeCheckedIn`, check-in reversal events.

## Analytics Dashboard

**Purpose:** Power KPI and trend reporting across event lifecycle domains.

**Primary consumers:** Executives, product analytics, organizers.

**Suggested projection fields:**
- `event_id`, `reporting_date`, `dimension_keys` (channel, region, ticket_type)
- `registrations_total`, `approvals_total`, `check_ins_total`
- `orders_total`, `gross_sales_amount`, `net_sales_amount`, `refund_rate`
- `inventory_utilization_rate`, `session_fill_rate`
- `nps_score`, `engagement_score` (if collected)

**Primary source events:** all domain events relevant to registration, ticketing, payments, inventory, agenda participation, and onsite operations.
