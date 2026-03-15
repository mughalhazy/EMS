# EMS Backend Service Map

This document defines backend service boundaries for EMS. Each service includes:

- **Purpose**: Why the service exists.
- **Owned entities**: Data/aggregates for which the service is source of truth.
- **Published events**: Domain events emitted by the service.
- **Consumed events**: Domain events the service reacts to from other services.

## auth
- **Purpose**: Manage identity, authentication, authorization, and service-to-service access policies.
- **Owned entities**: `User`, `Credential`, `Role`, `Permission`, `Session`, `MfaFactor`, `ApiClient`.
- **Published events**: `auth.user.created`, `auth.user.updated`, `auth.role.changed`, `auth.session.started`, `auth.session.ended`.
- **Consumed events**: `tenant.tenant.provisioned`, `tenant.membership.changed`, `integration.identity.sync.requested`.

## tenant
- **Purpose**: Manage tenant/org lifecycle, tenant settings, and feature plan entitlements.
- **Owned entities**: `Tenant`, `TenantPlan`, `TenantFeatureFlag`, `TenantBranding`, `TenantMembership`.
- **Published events**: `tenant.tenant.provisioned`, `tenant.tenant.updated`, `tenant.plan.changed`, `tenant.membership.changed`.
- **Consumed events**: `auth.user.created`, `order.subscription.purchased`, `integration.tenant.imported`.

## audit
- **Purpose**: Persist immutable compliance and traceability logs for business and security actions.
- **Owned entities**: `AuditLog`, `AuditActor`, `AuditEvidenceLink`, `RetentionPolicy`.
- **Published events**: `audit.log.recorded`, `audit.retention.expired`.
- **Consumed events**: Wildcard consumption of high-value events from all services (for example `auth.*`, `order.*`, `payment.*`, `onsite.*`).

## event
- **Purpose**: Own event master data and lifecycle from draft through archive.
- **Owned entities**: `Event`, `VenueRef`, `EventPolicy`, `EventStatus`, `EventSettings`.
- **Published events**: `event.created`, `event.updated`, `event.published`, `event.cancelled`, `event.archived`.
- **Consumed events**: `tenant.tenant.provisioned`, `integration.event.imported`.

## agenda
- **Purpose**: Plan and publish event program structure (tracks, sessions, slots, rooms).
- **Owned entities**: `Track`, `Session`, `AgendaSlot`, `RoomAllocation`, `AgendaVersion`.
- **Published events**: `agenda.session.created`, `agenda.session.updated`, `agenda.session.scheduled`, `agenda.agenda.published`.
- **Consumed events**: `event.created`, `event.published`, `speaker.profile.approved`.

## speaker
- **Purpose**: Manage speaker identity/profile, onboarding, and speaker-session assignment constraints.
- **Owned entities**: `SpeakerProfile`, `SpeakerCredential`, `SpeakerAvailability`, `SpeakerAssignment`.
- **Published events**: `speaker.profile.created`, `speaker.profile.approved`, `speaker.assignment.created`, `speaker.assignment.removed`.
- **Consumed events**: `agenda.session.created`, `event.published`, `auth.user.created`.

## exhibitor
- **Purpose**: Manage exhibitor participation lifecycle and booth/package operations.
- **Owned entities**: `Exhibitor`, `ExhibitorApplication`, `BoothAllocation`, `ExhibitorPackage`, `ExhibitorContact`.
- **Published events**: `exhibitor.application.submitted`, `exhibitor.application.approved`, `exhibitor.booth.assigned`, `exhibitor.package.fulfillment.updated`.
- **Consumed events**: `event.published`, `order.paid`, `payment.refunded`.

## attendee
- **Purpose**: Own attendee profile, preferences, privacy/consent, and attendee-facing attributes.
- **Owned entities**: `Attendee`, `AttendeePreference`, `ConsentRecord`, `BadgeProfile`.
- **Published events**: `attendee.created`, `attendee.updated`, `attendee.consent.updated`, `attendee.badge.updated`.
- **Consumed events**: `registration.confirmed`, `registration.cancelled`, `fulfillment.ticket.issued`, `onsite.checkin.completed`.

## registration
- **Purpose**: Materialize participation entitlements and lifecycle status for event attendance.
- **Owned entities**: `Registration`, `RegistrationItem`, `RegistrationStatus`, `TransferRequest`, `CancellationRequest`.
- **Published events**: `registration.started`, `registration.confirmed`, `registration.transferred`, `registration.cancelled`.
- **Consumed events**: `order.placed`, `order.paid`, `payment.captured`, `payment.refunded`, `event.cancelled`.

## ticketing
- **Purpose**: Manage ticket catalog and sale policy definitions.
- **Owned entities**: `TicketType`, `TicketRule`, `SalesWindow`, `AccessTier`, `PromoRule`.
- **Published events**: `ticketing.tickettype.created`, `ticketing.tickettype.updated`, `ticketing.saleswindow.opened`, `ticketing.promo.applied`.
- **Consumed events**: `event.created`, `pricing.price.published`, `inventory.stock.changed`.

## pricing
- **Purpose**: Compute and publish prices, discounts, taxes, and fee policies.
- **Owned entities**: `PriceBook`, `PriceRule`, `DiscountCampaign`, `TaxRule`, `FeePolicy`.
- **Published events**: `pricing.price.published`, `pricing.discount.activated`, `pricing.discount.expired`, `pricing.taxrule.updated`.
- **Consumed events**: `event.published`, `ticketing.tickettype.created`, `tenant.plan.changed`.

## inventory
- **Purpose**: Track allocatable stock/quotas and holds for scarce sellable units.
- **Owned entities**: `InventoryPool`, `InventoryItem`, `InventoryHold`, `InventoryReservation`, `InventoryLedger`.
- **Published events**: `inventory.stock.changed`, `inventory.hold.created`, `inventory.hold.released`, `inventory.reservation.confirmed`.
- **Consumed events**: `ticketing.tickettype.created`, `order.placed`, `order.expired`, `payment.refunded`.

## order
- **Purpose**: Own cart/order lifecycle, commercial totals, and checkout orchestration.
- **Owned entities**: `Cart`, `Order`, `OrderLine`, `OrderTotal`, `OrderAdjustment`.
- **Published events**: `order.started`, `order.placed`, `order.paid`, `order.cancelled`, `order.refunded`, `order.expired`.
- **Consumed events**: `pricing.price.published`, `inventory.reservation.confirmed`, `payment.captured`, `payment.failed`, `payment.refunded`.

## payment
- **Purpose**: Execute payment intent, authorization/capture, and refund processes with gateways.
- **Owned entities**: `PaymentIntent`, `PaymentTransaction`, `PaymentMethodToken`, `Refund`, `SettlementRecord`.
- **Published events**: `payment.intent.created`, `payment.authorized`, `payment.captured`, `payment.failed`, `payment.refunded`.
- **Consumed events**: `order.placed`, `order.cancelled`, `order.refunded`, `integration.payment.webhook.received`.

## fulfillment
- **Purpose**: Generate and revoke post-payment access artifacts (QR/pass/PDF) and delivery states.
- **Owned entities**: `TicketArtifact`, `Credential`, `FulfillmentJob`, `RevocationRecord`.
- **Published events**: `fulfillment.ticket.issued`, `fulfillment.ticket.delivered`, `fulfillment.ticket.revoked`.
- **Consumed events**: `payment.captured`, `payment.refunded`, `registration.confirmed`, `registration.cancelled`.

## notification
- **Purpose**: Deliver transactional and campaign communications across channels.
- **Owned entities**: `Template`, `Notification`, `ChannelRoute`, `DispatchAttempt`, `SubscriptionPreference`.
- **Published events**: `notification.queued`, `notification.sent`, `notification.failed`, `notification.bounced`.
- **Consumed events**: `registration.confirmed`, `payment.captured`, `fulfillment.ticket.issued`, `onsite.checkin.completed`, `event.updated`.

## engagement
- **Purpose**: Manage interactive event engagement experiences including polls, session Q&A, and feedback surveys.
- **Owned entities**: `EngagementPoll`, `EngagementQuestion`, `EngagementSurvey`.
- **Published events**: `poll.submitted`, `session.question.asked`, `survey.completed`.
- **Consumed events**: `agenda.session.created`, `registration.confirmed`, `onsite.checkin.completed`.

## analytics
- **Purpose**: Build read models, metrics, and reporting datasets from cross-service events.
- **Owned entities**: `MetricDefinition`, `KpiSnapshot`, `FunnelView`, `AnalyticsExport`, `MaterializedView`.
- **Published events**: `analytics.snapshot.generated`, `analytics.report.ready`, `analytics.anomaly.detected`.
- **Consumed events**: Broad consumption from all domain services (notably `event.*`, `registration.*`, `order.*`, `payment.*`, `onsite.*`).

## integration
- **Purpose**: Manage inbound/outbound connectors, webhooks, and data synchronization.
- **Owned entities**: `Connector`, `WebhookSubscription`, `SyncJob`, `ExternalMapping`, `IntegrationCredential`.
- **Published events**: `integration.sync.started`, `integration.sync.completed`, `integration.sync.failed`, `integration.webhook.received`.
- **Consumed events**: `event.published`, `attendee.updated`, `order.paid`, `payment.refunded`, `onsite.checkin.completed`.

## onsite
- **Purpose**: Support venue-day operations including check-in, badge print, and access control.
- **Owned entities**: `CheckinRecord`, `BadgePrintJob`, `GateScan`, `OnsiteDevice`, `ManualOverride`.
- **Published events**: `onsite.checkin.completed`, `onsite.badge.printed`, `onsite.access.denied`, `onsite.access.granted`.
- **Consumed events**: `fulfillment.ticket.issued`, `registration.confirmed`, `attendee.badge.updated`, `event.published`.

## Boundary Notes

1. `ticketing` defines sellable products and constraints; `pricing` defines monetary rules; `inventory` defines stock truth.
2. `order` orchestrates checkout state but never processes funds directly.
3. `payment` is the system of record for money movement and gateway outcomes.
4. `registration` grants participation entitlements only from successful commercial outcomes (`order.paid`/`payment.captured`).
5. `fulfillment` issues access artifacts only after payment success and revokes on cancellation/refund.
6. `notification` is event-driven and never blocks transactional writes.
7. `audit` and `analytics` are downstream consumers and should not be hard dependencies in write paths.
