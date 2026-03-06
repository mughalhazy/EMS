// ============================================================
// EMS Domain Entity Types
// Mapped from ems/docs/domain-model.md
// ============================================================

export type TenantStatus = 'active' | 'suspended' | 'archived'
export type UserStatus = 'invited' | 'active' | 'disabled'
export type EventStatus = 'draft' | 'published' | 'live' | 'archived'
export type SessionStatus = 'draft' | 'scheduled' | 'completed' | 'cancelled'
export type SessionType = 'keynote' | 'talk' | 'panel' | 'workshop' | 'networking' | 'other'
export type SpeakerStatus = 'invited' | 'confirmed' | 'declined' | 'withdrawn'
export type TicketStatus = 'draft' | 'on_sale' | 'sold_out' | 'closed'
export type RegistrationStatus = 'pending' | 'approved' | 'confirmed' | 'cancelled'
export type AttendeeStatus = 'prospect' | 'registered' | 'checked_in' | 'cancelled'
export type OrderStatus = 'draft' | 'pending_payment' | 'paid' | 'partially_refunded' | 'refunded' | 'cancelled'
export type PaymentStatus = 'initiated' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'voided'
export type FulfillmentStatus = 'pending' | 'generated' | 'attached' | 'revoked' | 'failed'
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app' | 'webhook'
export type NotificationStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'suppressed'
export type SponsorTier = 'gold' | 'silver' | 'bronze'
export type SponsorStatus = 'prospect' | 'active' | 'fulfilled' | 'cancelled'
export type ExhibitorStatus = 'invited' | 'confirmed' | 'checked_in' | 'cancelled'
export type VenueType = 'physical' | 'virtual' | 'hybrid'
export type OrganizationType = 'host' | 'sponsor' | 'exhibitor' | 'agency' | 'vendor' | 'other'
export type ArtifactType = 'qr_png' | 'qr_svg' | 'wallet_pass' | 'pdf'
export type LeadStatus = 'new' | 'qualified' | 'disqualified' | 'follow_up' | 'converted'

export interface Tenant {
  id: string
  name: string
  slug: string
  status: TenantStatus
  createdAt: string
  updatedAt: string
}

export interface Organization {
  id: string
  tenantId: string
  name: string
  type: OrganizationType
  externalRef?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  tenantId: string
  organizationId?: string
  email: string
  firstName: string
  lastName: string
  status: UserStatus
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  tenantId: string
  name: string
  scope: 'tenant' | 'organization' | 'event'
  description: string
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  tenantId: string
  organizationId: string
  name: string
  code: string
  description: string
  timezone: string
  startAt: string
  endAt: string
  status: EventStatus
  createdAt: string
  updatedAt: string
}

export interface Venue {
  id: string
  tenantId: string
  eventId: string
  name: string
  type: VenueType
  addressLine1?: string
  city?: string
  country?: string
  virtualUrl?: string
  capacity?: number
  createdAt: string
  updatedAt: string
}

export interface Room {
  id: string
  tenantId: string
  venueId: string
  name: string
  floor?: string
  capacity: number
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  tenantId: string
  eventId: string
  roomId?: string
  title: string
  abstract: string
  sessionType: SessionType
  startAt: string
  endAt: string
  capacity?: number
  status: SessionStatus
  createdAt: string
  updatedAt: string
}

export interface Speaker {
  id: string
  tenantId: string
  eventId: string
  organizationId?: string
  firstName: string
  lastName: string
  email?: string
  bio: string
  status: SpeakerStatus
  createdAt: string
  updatedAt: string
}

export interface Ticket {
  id: string
  tenantId: string
  eventId: string
  name: string
  description: string
  priceAmount: number
  priceCurrency: string
  quantityTotal: number
  quantitySold: number
  salesStartAt?: string
  salesEndAt?: string
  status: TicketStatus
  createdAt: string
  updatedAt: string
}

export interface Attendee {
  id: string
  tenantId: string
  eventId: string
  userId?: string
  organizationId?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  badgeName?: string
  status: AttendeeStatus
  createdAt: string
  updatedAt: string
}

export interface Registration {
  id: string
  tenantId: string
  eventId: string
  attendeeId: string
  ticketId: string
  orderId?: string
  status: RegistrationStatus
  registeredAt: string
  checkinAt?: string
  createdAt: string
  updatedAt: string
}

export interface Sponsor {
  id: string
  tenantId: string
  eventId: string
  organizationId: string
  tier: SponsorTier
  amount: number
  benefitsJson: Record<string, unknown>
  status: SponsorStatus
  createdAt: string
  updatedAt: string
}

export interface Exhibitor {
  id: string
  tenantId: string
  eventId: string
  organizationId: string
  boothCode: string
  boothSize: string
  status: ExhibitorStatus
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  tenantId: string
  eventId: string
  buyerAttendeeId?: string
  orderNumber: string
  subtotalAmount: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  status: OrderStatus
  placedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  tenantId: string
  orderId: string
  provider: 'stripe' | 'adyen' | 'paypal' | 'bank_transfer' | 'offline' | 'other'
  providerPaymentRef: string
  amount: number
  currency: string
  status: PaymentStatus
  paidAt?: string
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export interface TicketFulfillment {
  id: string
  tenantId: string
  eventId: string
  orderId: string
  paymentId: string
  registrationId: string
  attendeeId: string
  ticketId: string
  fulfillmentStatus: FulfillmentStatus
  artifactType: ArtifactType
  artifactUrl?: string
  issuedAt?: string
  attachedAt?: string
  revokedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  tenantId: string
  eventId?: string
  recipientUserId?: string
  recipientAttendeeId?: string
  channel: NotificationChannel
  templateKey: string
  subject?: string
  payloadJson: Record<string, unknown>
  status: NotificationStatus
  sentAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}
