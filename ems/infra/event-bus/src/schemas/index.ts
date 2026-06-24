/**
 * TypeScript payload contracts for all 64 Kafka topics.
 * These interfaces define the shape of the `payload` field inside
 * each DomainEvent. They are enforced at compile time (tsc --noEmit).
 *
 * ROD-8 resolution (2026-06-17): TypeScript interfaces serve as the
 * schema registry for this modular monolith. All 26 services compile
 * together — payload shape drift is caught by tsc before runtime.
 */

// ─── Platform Core ────────────────────────────────────────────────────────────

export interface TenantCreatedPayload {
  tenantId: string;
  name: string;
  plan: string;
}

export interface TenantUpdatedPayload {
  tenantId: string;
  changes: Record<string, unknown>;
}

export interface TenantSuspendedPayload {
  tenantId: string;
  reason?: string;
}

export interface UserRegisteredPayload {
  userId: string;
  tenantId: string;
  email: string;
}

export interface UserLoginSucceededPayload {
  userId: string;
  tenantId: string;
  sessionId: string;
}

export interface UserLoginFailedPayload {
  tenantId: string;
  email: string;
  reason: string;
}

export interface UserPasswordChangedPayload {
  userId: string;
  tenantId: string;
}

export interface UserStatusChangedPayload {
  userId: string;
  tenantId: string;
  status: string;
}

export interface UserSsoLoginSucceededPayload {
  userId: string;
  tenantId: string;
  provider: string;
}

export interface RoleAssignedPayload {
  userId: string;
  tenantId: string;
  roleId: string;
  roleName: string;
}

export interface RoleRevokedPayload {
  userId: string;
  tenantId: string;
  roleId: string;
  roleName: string;
}

// ─── Event Operations ─────────────────────────────────────────────────────────

export interface EventCreatedPayload {
  eventId: string;
  tenantId: string;
  name: string;
}

export interface EventUpdatedPayload {
  eventId: string;
  tenantId: string;
  changes: Record<string, unknown>;
}

export interface EventPublishedPayload {
  eventId: string;
  tenantId: string;
}

export interface EventUnpublishedPayload {
  eventId: string;
  tenantId: string;
}

export interface EventWentLivePayload {
  eventId: string;
  tenantId: string;
}

export interface EventArchivedPayload {
  eventId: string;
  tenantId: string;
}

export interface EventCancelledPayload {
  eventId: string;
  tenantId: string;
  reason?: string;
}

export interface SessionCreatedPayload {
  sessionId: string;
  eventId: string;
  tenantId: string;
  title: string;
}

export interface SessionUpdatedPayload {
  sessionId: string;
  eventId: string;
  tenantId: string;
  changes: Record<string, unknown>;
}

export interface SessionCancelledPayload {
  sessionId: string;
  eventId: string;
  tenantId: string;
}

export interface SpeakerCreatedPayload {
  speakerId: string;
  tenantId: string;
}

export interface SpeakerUpdatedPayload {
  speakerId: string;
  tenantId: string;
  changes: Record<string, unknown>;
}

export interface SpeakerAssignedToSessionPayload {
  sessionSpeakerId: string;
  sessionId: string;
  speakerId: string;
  tenantId: string;
}

export interface ExhibitorCreatedPayload {
  exhibitorId: string;
  tenantId: string;
  eventId: string;
}

export interface SponsorCreatedPayload {
  sponsorId: string;
  tenantId: string;
  eventId: string;
}

export interface AttendeeCreatedPayload {
  attendeeId: string;
  userId: string;
  tenantId: string;
}

export interface AttendeeUpdatedPayload {
  attendeeId: string;
  tenantId: string;
  changes: Record<string, unknown>;
}

// ─── Commerce ─────────────────────────────────────────────────────────────────

export interface OrderCreatedPayload {
  orderId: string;
  userId: string;
  eventId: string;
  tenantId: string;
  items: Array<{ ticketProductId: string; quantity: number }>;
}

export interface OrderPaidPayload {
  orderId: string;
  userId: string;
  eventId: string;
  tenantId: string;
  totalCents: number;
  items: Array<{ ticketProductId: string; quantity: number }>;
}

export interface OrderFulfilledPayload {
  orderId: string;
  tenantId: string;
  fulfillmentId?: string;
}

export interface OrderCancelledPayload {
  orderId: string;
  userId: string;
  eventId: string;
  tenantId: string;
  items: Array<{ ticketProductId: string; quantity: number }>;
}

export interface PaymentCompletedPayload {
  paymentId: string;
  orderId: string;
  tenantId: string;
  amountCents: number;
}

export interface PaymentFailedPayload {
  paymentId: string;
  orderId: string;
  tenantId: string;
}

export interface PaymentRefundedPayload {
  paymentId: string;
  refundId: string;
  orderId: string;
  tenantId: string;
  amountCents: number;
}

export interface FulfillmentCompletedPayload {
  fulfillmentId: string;
  orderId: string;
  userId: string;
  eventId: string;
  tenantId: string;
  items: Array<{ ticketProductId: string; quantity: number }>;
}

export interface TicketIssuedPayload {
  ticketId: string;
  orderId: string;
  userId: string;
  eventId: string;
  tenantId: string;
  ticketProductId: string;
}

export interface InventoryReservedPayload {
  ticketProductId: string;
  tenantId: string;
  quantity: number;
}

export interface InventoryReleasedPayload {
  ticketProductId: string;
  tenantId: string;
  quantity: number;
}

// ─── Participation ────────────────────────────────────────────────────────────

export interface RegistrationSubmittedPayload {
  registrationId: string;
  userId: string;
  eventId: string;
  tenantId: string;
}

export interface RegistrationApprovedPayload {
  registrationId: string;
  userId: string;
  eventId: string;
  tenantId: string;
}

export interface RegistrationConfirmedPayload {
  registrationId: string;
  userId: string;
  eventId: string;
  tenantId: string;
}

export interface RegistrationCancelledPayload {
  registrationId: string;
  userId: string;
  eventId: string;
  tenantId: string;
}

export interface RegistrationWaitlistedPayload {
  registrationId: string;
  userId: string;
  eventId: string;
  tenantId: string;
}

export interface CheckInCreatedPayload {
  checkInId: string;
  attendeeId: string;
  eventId: string;
  tenantId: string;
}

export interface BadgePrintedPayload {
  badgePrintId: string;
  attendeeId: string;
  eventId: string;
  tenantId: string;
}

// ─── Notifications / Campaigns ───────────────────────────────────────────────

export interface NotificationSentPayload {
  notificationId: string;
  tenantId: string;
  channel: string;
  recipientId: string;
}

export interface CampaignScheduledPayload {
  campaignId: string;
  tenantId: string;
  scheduledAt: string;
}

export interface CampaignSentPayload {
  campaignId: string;
  tenantId: string;
  recipientCount: number;
}

// ─── Intelligence ─────────────────────────────────────────────────────────────

export interface EmbeddingUpdatedPayload {
  entityType: string;
  entityId: string;
  tenantId: string;
  modelVersion: string;
}

// ─── Networking / Interactive Engagement ─────────────────────────────────────

export interface ConnectionRequestedPayload {
  connectionId: string;
  requesterId: string;
  recipientId: string;
  tenantId: string;
}

export interface ConnectionAcceptedPayload {
  connectionId: string;
  tenantId: string;
}

export interface ConnectionDeclinedPayload {
  connectionId: string;
  tenantId: string;
}

export interface PollCreatedPayload {
  pollId: string;
  sessionId: string;
  tenantId: string;
}

export interface PollClosedPayload {
  pollId: string;
  tenantId: string;
}

export interface QaQuestionSubmittedPayload {
  questionId: string;
  sessionId: string;
  userId: string;
  tenantId: string;
}

export interface QaAnswerPostedPayload {
  answerId: string;
  questionId: string;
  tenantId: string;
}

export interface SurveyCompletedPayload {
  surveyId: string;
  userId: string;
  tenantId: string;
}

// ─── Integration ─────────────────────────────────────────────────────────────

export interface WebhookDeliveredPayload {
  subscriptionId: string;
  tenantId: string;
  topic: string;
  statusCode: number;
}

export interface WebhookFailedPayload {
  subscriptionId: string;
  tenantId: string;
  topic: string;
  error: string;
}
