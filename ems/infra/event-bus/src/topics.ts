/**
 * Canonical Kafka topic registry.
 * Matches docs/canon/event-catalog.md exactly.
 * Topic naming: <domain>.<past_tense_event>
 */
export const Topics = {
  // Platform Core
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_SUSPENDED: 'tenant.suspended',
  USER_REGISTERED: 'user.registered',
  USER_LOGIN_SUCCEEDED: 'user.login_succeeded',
  USER_LOGIN_FAILED: 'user.login_failed',
  USER_PASSWORD_CHANGED: 'user.password_changed',
  USER_STATUS_CHANGED: 'user.status_changed',
  USER_SSO_LOGIN_SUCCEEDED: 'user.sso_login_succeeded',
  ROLE_ASSIGNED: 'role.assigned',
  ROLE_REVOKED: 'role.revoked',

  // Event Operations
  EVENT_CREATED: 'event.created',
  EVENT_UPDATED: 'event.updated',
  EVENT_PUBLISHED: 'event.published',
  EVENT_UNPUBLISHED: 'event.unpublished',
  EVENT_WENT_LIVE: 'event.went_live',
  EVENT_ARCHIVED: 'event.archived',
  EVENT_CANCELLED: 'event.cancelled',
  SESSION_CREATED: 'session.created',
  SESSION_UPDATED: 'session.updated',
  SESSION_CANCELLED: 'session.cancelled',
  SPEAKER_CREATED: 'speaker.created',
  SPEAKER_UPDATED: 'speaker.updated',
  SPEAKER_ASSIGNED_TO_SESSION: 'speaker.assigned_to_session',
  EXHIBITOR_CREATED: 'exhibitor.created',
  SPONSOR_CREATED: 'sponsor.created',
  LEAD_CAPTURED: 'lead.captured',
  ATTENDEE_CREATED: 'attendee.created',
  ATTENDEE_PROFILE_UPDATED: 'attendee.profile_updated',

  // Participation
  REGISTRATION_SUBMITTED: 'registration.submitted',
  REGISTRATION_APPROVED: 'registration.approved',
  REGISTRATION_CONFIRMED: 'registration.confirmed',
  REGISTRATION_CANCELLED: 'registration.cancelled',
  REGISTRATION_WAITLISTED: 'registration.waitlisted',
  ATTENDEE_CHECKED_IN: 'attendee.checked_in',
  SESSION_ATTENDED: 'session.attended',

  // Commerce
  TICKET_PRODUCT_CREATED: 'ticket_product.created',
  INVENTORY_RESERVED: 'inventory.reserved',
  INVENTORY_RELEASED: 'inventory.released',
  INVENTORY_DEPLETED: 'inventory.depleted',
  ORDER_CREATED: 'order.created',
  ORDER_PAID: 'order.paid',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_FULFILLED: 'order.fulfilled',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  PROMO_CODE_REDEEMED: 'promo_code.redeemed',
  TICKET_ISSUED: 'ticket.issued',
  TICKET_REDEEMED: 'ticket.redeemed',
  TICKET_VOIDED: 'ticket.voided',
  FULFILLMENT_COMPLETED: 'fulfillment.completed',

  // Engagement
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_FAILED: 'notification.failed',
  CAMPAIGN_SCHEDULED: 'campaign.scheduled',
  CAMPAIGN_SENT: 'campaign.sent',

  // Social
  CONNECTION_REQUESTED: 'connection.requested',
  CONNECTION_ACCEPTED: 'connection.accepted',
  CONNECTION_DECLINED: 'connection.declined',

  // Interactive Engagement
  POLL_CREATED: 'poll.created',
  POLL_RESPONDED: 'poll.responded',
  QA_QUESTION_SUBMITTED: 'qa.question_submitted',
  SURVEY_COMPLETED: 'survey.completed',

  // AI
  EMBEDDING_UPDATED: 'embedding.updated',
} as const;

export type TopicName = (typeof Topics)[keyof typeof Topics];
