Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Frontend Workflow to Screen Map

> Maps every product workflow to its frontend UI path.
> Source: PRODUCT_WORKFLOWS.md (10 verified workflows), SERVICE_CATALOG.md,
> and Phase 2.95 Decision Collapse outputs.
> 
> Every workflow has a complete UI path. No orphan workflows.

---

## Workflow 1: Tenant Onboarding

**Services**: tenant, auth, rbac, audit  
**Trigger**: New tenant signs up

| Step | UI Screen | Route | Action |
|---|---|---|---|
| 1. Create initial admin account | Account Registration | `/register` | Form: email, name, password |
| 2. Tenant auto-created on registration | (Automatic — Kafka: tenant.created → rbac seeds roles) | — | Background |
| 3. Default roles seeded | (Automatic) | — | Background |
| 4. Admin logs in | Login | `/login` | Form: email, password |
| 5. Configure tenant settings | Tenant Settings | `/admin/tenant` | Edit tenant name, branding |
| 6. Optional: configure SSO | SSO Configuration | `/admin/sso` | Add OAuth2/SAML provider |
| 7. Create first event | Create Event | `/events/new` | Event creation form |

**UI entry point**: `/register`  
**Completion state**: Admin sees event list `/events` with the first event

---

## Workflow 2: Event Lifecycle

**Services**: event, agenda, notification, analytics, search  
**Trigger**: Organizer creates and manages an event

| Step | UI Screen | Route | Action |
|---|---|---|---|
| 1. Create event | Create Event | `/events/new` | Form: name, description, venue, dates |
| 2. Edit event details | Edit Event | `/events/:id/edit` | Update any field |
| 3. Configure event settings | Event Settings | `/events/:id/settings` | Registration dates, capacity, approval mode |
| 4. Publish event | Event Overview | `/events/:id` | Click "Publish" → status: published |
| 5. Monitor event (live) | Event Overview | `/events/:id` | Click "Go Live" → status: live |
| 6. Archive event | Event Overview | `/events/:id` | Click "Archive" → status: archived |
| 7. Cancel event (if needed) | Event Overview | `/events/:id` | Click "Cancel" → status: cancelled; refund workflow triggers |

**UI entry point**: `/events/new` or `/events`  
**Status transitions visible in**: Event overview header; event list badges

**State machine UI**:
```
[draft] → [published] → [live] → [archived]
   └→ [cancelled] (from draft or published)
```

---

## Workflow 3: Agenda Management

**Services**: agenda, speaker, notification  
**Trigger**: Organizer builds session schedule for an event

| Step | UI Screen | Route | Action |
|---|---|---|---|
| 1. Create tracks (optional) | Agenda Builder | `/events/:id/agenda` | "Add Track" form |
| 2. Create sessions | Create Session | `/events/:id/sessions/new` | Form: title, description, start/end time, room, track |
| 3. Assign room (if Venue has rooms) | Create/Edit Session | `/events/:id/sessions/new` | Room dropdown |
| 4. Assign speakers to session | Session Detail | `/events/:id/sessions/:sessionId` | "Assign Speaker" → speaker search |
| 5. Publish agenda (by publishing event) | Event Overview | `/events/:id` | Publish action |
| 6. Manage session cancellation | Session Detail | `/events/:id/sessions/:sessionId` | "Cancel Session" action |

**UI entry point**: `/events/:id/agenda`  
**Dependency**: Speakers must be created before they can be assigned (Workflow 4)

---

## Workflow 4: Speaker Management

**Services**: speaker, agenda  
**Trigger**: Organizer invites/onboards a speaker

| Step | UI Screen | Route | Action |
|---|---|---|---|
| 1. Create speaker profile | Create Speaker | `/speakers/new` | Form: name, bio, photo, social links |
| 2. View speaker list | Speaker List | `/speakers` | Browse/search speakers |
| 3. Assign to session | Session Detail | `/events/:id/sessions/:sessionId` | "Assign Speaker" → select from speaker list |
| 4. View speaker sessions | Speaker Profile | `/speakers/:id` | Session list tab showing assigned sessions |
| 5. Speaker views own sessions | My Sessions | `/my/sessions` | Speaker-filtered session list (speaker role) |

**UI entry point**: `/speakers/new` then `/events/:id/sessions/:sessionId`  
**Dependency**: Sessions (Workflow 3) must exist before assignment

---

## Workflow 5: Ticket Setup

**Services**: ticketing, pricing, inventory  
**Trigger**: Organizer configures sellable tickets for an event

| Step | UI Screen | Route | Action |
|---|---|---|---|
| 1. Create ticket product | Create Ticket | `/events/:id/tickets/new` | Form: name, description, price, quantity |
| 2. Inventory auto-created | (Automatic — Kafka: ticket_product.created → inventory creates InventoryItem) | — | Background |
| 3. Define pricing rules | Pricing Rules | `/events/:id/pricing` | Add tiered/early-bird rules |
| 4. Create promo codes | Promo Codes | `/events/:id/promo-codes` | Form: code, discount type, discount value, usage limit |
| 5. Monitor inventory | Inventory | `/events/:id/inventory` | View stock levels and reservations |
| 6. Publish tickets (tied to event.published) | Event Overview | `/events/:id` | Publish → tickets become purchasable |

**UI entry point**: `/events/:id/tickets`  
**Dependency**: Event must exist; tickets become available when event is published

---

## Workflow 6: Checkout (Ticket Purchase)

**Services**: order, inventory, pricing, payment, ticketing, notification, fulfillment  
**Trigger**: Attendee purchases ticket(s)

| Step | UI Screen | Route | Action |
|---|---|---|---|
| 1. Attendee views event | (Public event page) | `/events/:id` | Browse event info and ticket options |
| 2. Select tickets + apply promo | Checkout | `/events/:id/checkout` | Ticket selector, promo code input |
| 3. Enter payment details | Checkout | `/events/:id/checkout` | Payment form (card details) |
| 4. Submit order | Checkout | `/events/:id/checkout` | `POST /v1/orders` with Idempotency-Key |
| 5. Payment processed | Checkout (result) | `/events/:id/checkout` | Success/failure state |
| 6. Ticket issued (on success) | Order Confirmation | `/orders/:orderId` | Shows ticket QR codes |
| 7. Confirmation notification sent | (Background — Kafka: ticket.issued → notification.sent) | — | Background |
| 8. View tickets later | My Tickets | `/my/tickets` | All issued tickets with QR codes |

**UI entry point**: `/events/:id/checkout` (linked from event page)  
**Error states**: Inventory depleted → "Sold out" state; Payment failed → "Payment declined" state with retry

---

## Workflow 7: Refund

**Services**: payment, order, inventory, notification  
**Trigger**: Cancellation (attendee-initiated or event.cancelled)

| Step | UI Screen | Route | Action |
|---|---|---|---|
| 1. Organizer or finance views order | Order Detail | `/orders/:orderId` | View order status |
| 2. Initiate refund | Order Detail | `/orders/:orderId` | "Refund" button (requires `commerce:manage`) |
| 3. Confirm refund | Order Detail | `/orders/:orderId` | Confirmation modal |
| 4. Refund processed | Order Detail | `/orders/:orderId` | Success state; order status → refunded |
| 5. Inventory released (automatic) | Inventory | `/events/:id/inventory` | Quantity replenished (background) |
| 6. Attendee notification (automatic) | (Background) | — | Kafka: payment.refunded → notification |

**UI entry point**: `/orders/:orderId` (from order list or attendee history)  
**Blocking**: Only orders in `paid`/`fulfilled` state can be refunded

---

## Workflow 8: Registration

**Services**: registration, attendee, notification  
**Trigger**: Attendee registers for an event

| Step | UI Screen | Route | Action |
|---|---|---|---|
| 1. Attendee opens registration form | Public Registration | `/events/:id/register` | Form with event-specific fields |
| 2. Submit registration | Public Registration | `/events/:id/register` | `POST /v1/registrations` |
| 3. Registration status: submitted | Registration Confirmation | `/registrations/:id/confirm` | Shows status |
| 4a. Auto-approved (if requiresApproval=false) | (Automatic) | — | Status → confirmed |
| 4b. Manual review (if requiresApproval=true) | Registration Management | `/events/:id/registrations/:id` | Organizer/support approves |
| 5. Attendee record created (on confirmed) | Attendee Profile | `/attendees/:id` | (Automatic — Kafka: registration.confirmed → attendee created) |
| 6. Confirmation notification | (Background) | — | Kafka: registration.confirmed → notification |
| 7. View registration status | My Registrations | `/my/registrations` | Status badge |

**UI entry point**: `/events/:id/register` (public link)  
**State machine**: submitted → approved → confirmed | waitlisted | cancelled

---

## Workflow 9: Check-in

**Services**: onsite, registration, attendee, analytics  
**Trigger**: Attendee arrives at event

| Step | UI Screen | Route | Action |
|---|---|---|---|
| 1. Staff opens check-in station | Check-in Station | `/events/:id/onsite/checkin` | Search by name, email, or scan QR |
| 2. Locate attendee | Check-in Station | `/events/:id/onsite/checkin` | `GET /v1/attendees?search=` |
| 3. Verify registration | Check-in Station | `/events/:id/onsite/checkin` | Show registration status |
| 4. Create check-in | Check-in Station | `/events/:id/onsite/checkin` | `POST /v1/check-ins` button |
| 5. Print badge (optional) | Badge Print | `/events/:id/onsite/badges` | `POST /v1/badge-prints` |
| 6. Monitor live check-in rate | Onsite Dashboard | `/events/:id/onsite` | Real-time check-in count; analytics:read |

**UI entry point**: `/events/:id/onsite/checkin`  
**Blocking**: Event must be live; attendee must have confirmed registration

---

## Workflow 10: Campaign Delivery

**Services**: notification (owns Campaign + AudienceSegment — ROD-1 collapse confirmed)  
**Trigger**: Organizer creates and sends a marketing campaign

| Step | UI Screen | Route | Action |
|---|---|---|---|
| 1. Create audience segment | Create Segment | `/audience-segments/new` | Form: filter criteria (event, registration status, tags) |
| 2. Create campaign | Create Campaign | `/campaigns/new` | Form: name, subject, body, audience segment |
| 3. Preview campaign | Campaign Detail | `/campaigns/:id` | Preview rendered template |
| 4. Schedule or send | Campaign Detail | `/campaigns/:id` | "Send Now" or "Schedule" with datetime |
| 5. Monitor delivery | Campaign Detail | `/campaigns/:id` | Sent count, failed count, status |

**UI entry point**: `/campaigns/new`  
**Note**: Campaign section appears under "Campaigns" in navigation, NOT under "Engagement" (ROD-1 confirmed — engagement module removed)

---

## Workflow Summary

| # | Workflow | Primary UI entry | Completion indicator | Key Kafka events driving UI state |
|---|---|---|---|---|
| 1 | Tenant Onboarding | `/register` | Arrives at `/events` | tenant.created, user.registered |
| 2 | Event Lifecycle | `/events/new` | Event archived | event.published, event.went_live, event.archived |
| 3 | Agenda Management | `/events/:id/agenda` | Sessions visible in agenda | session.created, speaker.assigned_to_session |
| 4 | Speaker Management | `/speakers/new` | Speaker assigned to session | speaker.created, speaker.assigned_to_session |
| 5 | Ticket Setup | `/events/:id/tickets/new` | Tickets sold out or purchased | ticket_product.created, inventory events |
| 6 | Checkout | `/events/:id/checkout` | Order fulfilled, ticket QR shown | order.paid, fulfillment.completed, ticket.issued |
| 7 | Refund | `/orders/:orderId` | Order refunded | payment.refunded, inventory.released |
| 8 | Registration | `/events/:id/register` | Status: confirmed | registration.confirmed, attendee.created |
| 9 | Check-in | `/events/:id/onsite/checkin` | CheckIn created, badge printed | attendee.checked_in |
| 10 | Campaign Delivery | `/campaigns/new` | campaign.sent | campaign.scheduled, campaign.sent, notification.sent |
