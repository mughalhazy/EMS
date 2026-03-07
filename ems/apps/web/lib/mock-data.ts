// ============================================================
// EMS Mock Seed Data — served by /app/api/v1/[...path]/route.ts
// when NEXT_PUBLIC_API_URL is not set (local / Render free tier)
// ============================================================

import type {
  Tenant, User, Event, Session, Speaker, Ticket,
  Attendee, Registration, Sponsor, Exhibitor,
  Notification, Organization,
} from '@/types/domain'
import type { TenantKpis, EventKpis, RevenueSummary, AttendanceTrend, FunnelMetrics } from '@/services/analytics.service'

// ── IDs ──────────────────────────────────────────────────────
const T  = 'tenant-001'
const O1 = 'org-001', O2 = 'org-002', O3 = 'org-003', O4 = 'org-004', O5 = 'org-005'
const E1 = 'event-001', E2 = 'event-002', E3 = 'event-003'

// ── Tenant ───────────────────────────────────────────────────
export const tenant: Tenant = {
  id: T,
  name: 'Acme Events Co.',
  slug: 'acme-events',
  status: 'active',
  createdAt: '2024-01-15T09:00:00Z',
  updatedAt: '2025-03-01T12:00:00Z',
}

// ── Organizations ─────────────────────────────────────────────
export const organizations: Organization[] = [
  { id: O1, tenantId: T, name: 'Acme Corp',       type: 'host',     createdAt: '2024-01-15T09:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: O2, tenantId: T, name: 'TechCorp Inc.',    type: 'sponsor',  createdAt: '2024-02-01T09:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: O3, tenantId: T, name: 'Global Exhibits',  type: 'exhibitor',createdAt: '2024-02-10T09:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: O4, tenantId: T, name: 'StartupXYZ',       type: 'sponsor',  createdAt: '2024-03-01T09:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: O5, tenantId: T, name: 'InnovateLabs',     type: 'exhibitor',createdAt: '2024-03-15T09:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
]

// ── Users ─────────────────────────────────────────────────────
export const users: User[] = [
  { id: 'user-001', tenantId: T, email: 'admin@acme.com',   firstName: 'Sarah',   lastName: 'Chen',      status: 'active',  lastLoginAt: '2026-03-06T14:30:00Z', createdAt: '2024-01-15T09:00:00Z', updatedAt: '2026-03-06T14:30:00Z' },
  { id: 'user-002', tenantId: T, email: 'ops@acme.com',     firstName: 'Marcus',  lastName: 'Williams',  status: 'active',  lastLoginAt: '2026-03-05T11:00:00Z', createdAt: '2024-02-01T09:00:00Z', updatedAt: '2026-03-05T11:00:00Z' },
  { id: 'user-003', tenantId: T, email: 'dev@acme.com',     firstName: 'Priya',   lastName: 'Patel',     status: 'active',  lastLoginAt: '2026-03-04T09:00:00Z', createdAt: '2024-02-15T09:00:00Z', updatedAt: '2026-03-04T09:00:00Z' },
  { id: 'user-004', tenantId: T, email: 'finance@acme.com', firstName: 'James',   lastName: 'Okafor',    status: 'active',  lastLoginAt: '2026-03-03T10:00:00Z', createdAt: '2024-03-01T09:00:00Z', updatedAt: '2026-03-03T10:00:00Z' },
  { id: 'user-005', tenantId: T, email: 'mktg@acme.com',    firstName: 'Aisha',   lastName: 'Thompson',  status: 'invited', lastLoginAt: undefined,              createdAt: '2026-02-20T09:00:00Z', updatedAt: '2026-02-20T09:00:00Z' },
  { id: 'user-006', tenantId: T, email: 'sales@acme.com',   firstName: 'Leo',     lastName: 'Nakamura',  status: 'active',  lastLoginAt: '2026-02-28T08:00:00Z', createdAt: '2024-05-01T09:00:00Z', updatedAt: '2026-02-28T08:00:00Z' },
  { id: 'user-007', tenantId: T, email: 'support@acme.com', firstName: 'Elena',   lastName: 'Vasquez',   status: 'active',  lastLoginAt: '2026-03-01T13:00:00Z', createdAt: '2024-06-01T09:00:00Z', updatedAt: '2026-03-01T13:00:00Z' },
  { id: 'user-008', tenantId: T, email: 'pm@acme.com',      firstName: 'David',   lastName: 'Kim',       status: 'disabled',lastLoginAt: '2025-11-15T10:00:00Z', createdAt: '2024-07-01T09:00:00Z', updatedAt: '2025-12-01T00:00:00Z' },
  { id: 'user-009', tenantId: T, email: 'hr@acme.com',      firstName: 'Natasha', lastName: 'Rivera',    status: 'active',  lastLoginAt: '2026-03-05T16:00:00Z', createdAt: '2024-09-01T09:00:00Z', updatedAt: '2026-03-05T16:00:00Z' },
  { id: 'user-010', tenantId: T, email: 'intern@acme.com',  firstName: 'Ben',     lastName: 'Foster',    status: 'invited', lastLoginAt: undefined,              createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z' },
]

// ── Events ────────────────────────────────────────────────────
export const events: Event[] = [
  {
    id: E1, tenantId: T, organizationId: O1,
    name: 'TechSummit 2026',
    code: 'TECH26',
    description: 'Annual flagship technology conference bringing together 2 000+ leaders in software, AI, and cloud.',
    timezone: 'America/Los_Angeles',
    startAt: '2026-04-15T09:00:00Z',
    endAt:   '2026-04-17T18:00:00Z',
    status: 'published',
    createdAt: '2025-10-01T09:00:00Z', updatedAt: '2026-02-28T10:00:00Z',
  },
  {
    id: E2, tenantId: T, organizationId: O1,
    name: 'Product Design Week',
    code: 'PDW26',
    description: 'Three-day immersive design sprint focused on UX research, accessibility, and design systems.',
    timezone: 'America/New_York',
    startAt: '2026-05-20T10:00:00Z',
    endAt:   '2026-05-22T17:00:00Z',
    status: 'live',
    createdAt: '2025-12-01T09:00:00Z', updatedAt: '2026-03-01T08:00:00Z',
  },
  {
    id: E3, tenantId: T, organizationId: O1,
    name: 'Startup Founders Forum',
    code: 'SFF26',
    description: 'Exclusive one-day forum for early-stage founders: fundraising, GTM strategy, and investor speed rounds.',
    timezone: 'America/Chicago',
    startAt: '2026-06-10T08:00:00Z',
    endAt:   '2026-06-10T20:00:00Z',
    status: 'draft',
    createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z',
  },
]

// ── Sessions ──────────────────────────────────────────────────
export const sessions: Session[] = [
  // TechSummit sessions
  { id: 's-001', tenantId: T, eventId: E1, title: 'Opening Keynote: The AI Decade',           abstract: 'CEO vision keynote.', sessionType: 'keynote',    startAt: '2026-04-15T09:00:00Z', endAt: '2026-04-15T10:00:00Z', capacity: 2000, status: 'scheduled', createdAt: '2025-11-01T09:00:00Z', updatedAt: '2026-01-01T09:00:00Z' },
  { id: 's-002', tenantId: T, eventId: E1, title: 'Scaling Distributed Systems',               abstract: 'Deep dive into large-scale architectures.', sessionType: 'talk', startAt: '2026-04-15T10:30:00Z', endAt: '2026-04-15T11:30:00Z', capacity: 300, status: 'scheduled', createdAt: '2025-11-01T09:00:00Z', updatedAt: '2026-01-01T09:00:00Z' },
  { id: 's-003', tenantId: T, eventId: E1, title: 'AI in Production — Panel',                  abstract: 'ML leaders share deployment war stories.', sessionType: 'panel', startAt: '2026-04-15T13:00:00Z', endAt: '2026-04-15T14:00:00Z', capacity: 500, status: 'scheduled', createdAt: '2025-11-01T09:00:00Z', updatedAt: '2026-01-01T09:00:00Z' },
  { id: 's-004', tenantId: T, eventId: E1, title: 'Kubernetes Workshop: Zero to Hero',         abstract: 'Hands-on workshop.', sessionType: 'workshop',   startAt: '2026-04-15T14:30:00Z', endAt: '2026-04-15T17:00:00Z', capacity: 80, status: 'scheduled', createdAt: '2025-11-01T09:00:00Z', updatedAt: '2026-01-01T09:00:00Z' },
  { id: 's-005', tenantId: T, eventId: E1, title: 'Networking Happy Hour',                     abstract: 'Meet fellow attendees.', sessionType: 'networking', startAt: '2026-04-15T18:00:00Z', endAt: '2026-04-15T20:00:00Z', capacity: 2000, status: 'scheduled', createdAt: '2025-11-01T09:00:00Z', updatedAt: '2026-01-01T09:00:00Z' },
  { id: 's-006', tenantId: T, eventId: E1, title: 'Cloud Cost Optimization',                   abstract: 'Practical strategies to cut your cloud bill by 40%.', sessionType: 'talk', startAt: '2026-04-16T09:30:00Z', endAt: '2026-04-16T10:30:00Z', capacity: 400, status: 'scheduled', createdAt: '2025-11-15T09:00:00Z', updatedAt: '2026-01-10T09:00:00Z' },
  { id: 's-007', tenantId: T, eventId: E1, title: 'Platform Engineering at Scale',             abstract: 'How Stripe, Shopify and Netlify built their platforms.', sessionType: 'talk', startAt: '2026-04-16T11:00:00Z', endAt: '2026-04-16T12:00:00Z', capacity: 350, status: 'scheduled', createdAt: '2025-11-15T09:00:00Z', updatedAt: '2026-01-10T09:00:00Z' },
  { id: 's-008', tenantId: T, eventId: E1, title: 'Security Threat Landscape 2026',            abstract: 'Emerging attack vectors and defences.', sessionType: 'talk', startAt: '2026-04-16T13:30:00Z', endAt: '2026-04-16T14:30:00Z', capacity: 300, status: 'scheduled', createdAt: '2025-11-15T09:00:00Z', updatedAt: '2026-01-10T09:00:00Z' },
  { id: 's-009', tenantId: T, eventId: E1, title: 'Closing Keynote: Open Source Horizons',     abstract: 'State of open source in 2026.', sessionType: 'keynote', startAt: '2026-04-17T16:00:00Z', endAt: '2026-04-17T17:00:00Z', capacity: 2000, status: 'scheduled', createdAt: '2025-11-15T09:00:00Z', updatedAt: '2026-01-10T09:00:00Z' },
  { id: 's-010', tenantId: T, eventId: E1, title: 'GraphQL vs REST: A 2026 Perspective',       abstract: 'When to use which — an honest comparison.', sessionType: 'talk', startAt: '2026-04-17T09:30:00Z', endAt: '2026-04-17T10:30:00Z', capacity: 280, status: 'draft', createdAt: '2025-12-01T09:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
  // Product Design Week sessions
  { id: 's-011', tenantId: T, eventId: E2, title: 'UX Research Bootcamp',                      abstract: 'From qualitative interviews to insight synthesis.', sessionType: 'workshop', startAt: '2026-05-20T10:00:00Z', endAt: '2026-05-20T13:00:00Z', capacity: 60, status: 'scheduled', createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
  { id: 's-012', tenantId: T, eventId: E2, title: 'Design Systems at Enterprise Scale',        abstract: 'Figma tokens, component libraries, governance.', sessionType: 'talk', startAt: '2026-05-20T14:00:00Z', endAt: '2026-05-20T15:00:00Z', capacity: 200, status: 'scheduled', createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
  { id: 's-013', tenantId: T, eventId: E2, title: 'Accessibility First: WCAG 3.0',             abstract: 'Building for everyone from day one.', sessionType: 'talk', startAt: '2026-05-21T10:00:00Z', endAt: '2026-05-21T11:00:00Z', capacity: 200, status: 'scheduled', createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-02-15T09:00:00Z' },
  { id: 's-014', tenantId: T, eventId: E2, title: 'AI-Assisted Design Tools Panel',            abstract: 'Figma AI, Framer, Galileo — what works?', sessionType: 'panel', startAt: '2026-05-21T14:00:00Z', endAt: '2026-05-21T15:30:00Z', capacity: 150, status: 'scheduled', createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-02-15T09:00:00Z' },
  { id: 's-015', tenantId: T, eventId: E2, title: 'Prototyping Sprint',                        abstract: 'Build a working prototype in 90 minutes.', sessionType: 'workshop', startAt: '2026-05-22T10:00:00Z', endAt: '2026-05-22T12:00:00Z', capacity: 40, status: 'scheduled', createdAt: '2026-01-25T09:00:00Z', updatedAt: '2026-02-20T09:00:00Z' },
  // Startup Founders Forum sessions
  { id: 's-016', tenantId: T, eventId: E3, title: 'Fundraising in a Tight Market',             abstract: 'Seed and Series A strategies for 2026.', sessionType: 'talk', startAt: '2026-06-10T09:00:00Z', endAt: '2026-06-10T10:00:00Z', capacity: 300, status: 'draft', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-20T09:00:00Z' },
  { id: 's-017', tenantId: T, eventId: E3, title: 'GTM Playbooks That Actually Work',          abstract: 'PLG vs SLG — choosing the right motion.', sessionType: 'talk', startAt: '2026-06-10T10:30:00Z', endAt: '2026-06-10T11:30:00Z', capacity: 300, status: 'draft', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-20T09:00:00Z' },
  { id: 's-018', tenantId: T, eventId: E3, title: 'Investor Speed Rounds',                     abstract: '5-minute pitches to 10 angels and VCs.', sessionType: 'networking', startAt: '2026-06-10T13:00:00Z', endAt: '2026-06-10T17:00:00Z', capacity: 50, status: 'draft', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-20T09:00:00Z' },
]

// ── Speakers ──────────────────────────────────────────────────
export const speakers: Speaker[] = [
  { id: 'sp-001', tenantId: T, eventId: E1, firstName: 'Aiko',     lastName: 'Tanaka',     email: 'aiko@techcorp.com',  bio: 'CTO at TechCorp. 20 years building distributed systems at scale.', status: 'confirmed', createdAt: '2025-11-01T09:00:00Z', updatedAt: '2026-01-01T09:00:00Z' },
  { id: 'sp-002', tenantId: T, eventId: E1, firstName: 'Carlos',   lastName: 'Mendez',     email: 'carlos@cloud.io',    bio: 'Principal Engineer at CloudBase. Author of "Platform Engineering Handbook".', status: 'confirmed', createdAt: '2025-11-05T09:00:00Z', updatedAt: '2026-01-10T09:00:00Z' },
  { id: 'sp-003', tenantId: T, eventId: E1, firstName: 'Yuki',     lastName: 'Sato',       email: 'yuki@ailab.dev',     bio: 'ML Research Lead. PhD Computer Science, Stanford. Focus on LLM deployment.', status: 'confirmed', createdAt: '2025-11-10T09:00:00Z', updatedAt: '2026-01-15T09:00:00Z' },
  { id: 'sp-004', tenantId: T, eventId: E1, firstName: 'Fatima',   lastName: 'Al-Rashid',  email: 'fatima@secfirm.com', bio: 'CISO at SecureFirm. CISSP, 15+ years in enterprise security.', status: 'invited', createdAt: '2025-12-01T09:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
  { id: 'sp-005', tenantId: T, eventId: E2, firstName: 'Jordan',   lastName: 'Blake',      email: 'jordan@designco.io', bio: 'Design Lead at Stripe. Creator of the Stripe design system.', status: 'confirmed', createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
  { id: 'sp-006', tenantId: T, eventId: E2, firstName: 'Mia',      lastName: 'Hoffmann',   email: 'mia@a11y.dev',       bio: 'Accessibility consultant. Former Mozilla web standards contributor.', status: 'confirmed', createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-02-15T09:00:00Z' },
  { id: 'sp-007', tenantId: T, eventId: E3, firstName: 'Ravi',     lastName: 'Krishnan',   email: 'ravi@vcfund.com',    bio: 'Partner at Horizon Ventures. 50+ early-stage investments across SaaS and AI.', status: 'confirmed', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-20T09:00:00Z' },
  { id: 'sp-008', tenantId: T, eventId: E3, firstName: 'Sophie',   lastName: 'Laurent',    email: 'sophie@startup.fr',  bio: 'Founder of LaunchPad Paris. Serial entrepreneur, 3x exits.', status: 'invited', createdAt: '2026-02-05T09:00:00Z', updatedAt: '2026-02-25T09:00:00Z' },
]

// ── Tickets ───────────────────────────────────────────────────
export const tickets: { [eventId: string]: import('@/types/domain').Ticket[] } = {
  [E1]: [
    { id: 'tk-001', tenantId: T, eventId: E1, name: 'General Admission', description: 'Full 3-day access to all keynotes and sessions.', priceAmount: 79900, priceCurrency: 'USD', quantityTotal: 1500, quantitySold: 1243, salesStartAt: '2025-11-01T00:00:00Z', salesEndAt: '2026-04-14T23:59:59Z', status: 'on_sale', createdAt: '2025-10-15T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z' },
    { id: 'tk-002', tenantId: T, eventId: E1, name: 'VIP Pass',           description: 'All-access pass with speaker dinner and private lounge.', priceAmount: 199900, priceCurrency: 'USD', quantityTotal: 200, quantitySold: 178, salesStartAt: '2025-11-01T00:00:00Z', salesEndAt: '2026-04-14T23:59:59Z', status: 'on_sale', createdAt: '2025-10-15T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z' },
    { id: 'tk-003', tenantId: T, eventId: E1, name: 'Workshop Add-on',    description: 'Access to all pre-conference workshops.', priceAmount: 29900, priceCurrency: 'USD', quantityTotal: 300, quantitySold: 287, salesStartAt: '2025-11-01T00:00:00Z', salesEndAt: '2026-04-10T23:59:59Z', status: 'sold_out', createdAt: '2025-10-15T09:00:00Z', updatedAt: '2026-02-20T09:00:00Z' },
  ],
  [E2]: [
    { id: 'tk-004', tenantId: T, eventId: E2, name: 'Designer Pass',   description: 'Full 3-day access to PDW.', priceAmount: 49900, priceCurrency: 'USD', quantityTotal: 500, quantitySold: 342, salesStartAt: '2026-01-01T00:00:00Z', salesEndAt: '2026-05-19T23:59:59Z', status: 'on_sale', createdAt: '2025-12-15T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z' },
    { id: 'tk-005', tenantId: T, eventId: E2, name: 'Sprint Workshop', description: 'Prototyping sprint on day 3 only.', priceAmount: 19900, priceCurrency: 'USD', quantityTotal: 40, quantitySold: 38, salesStartAt: '2026-01-01T00:00:00Z', salesEndAt: '2026-05-19T23:59:59Z', status: 'on_sale', createdAt: '2025-12-15T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z' },
  ],
  [E3]: [
    { id: 'tk-006', tenantId: T, eventId: E3, name: 'Founder Ticket',  description: 'Full day access including investor speed rounds.', priceAmount: 39900, priceCurrency: 'USD', quantityTotal: 300, quantitySold: 0, salesStartAt: '2026-03-15T00:00:00Z', salesEndAt: '2026-06-09T23:59:59Z', status: 'draft', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
  ],
}

// ── Attendees ─────────────────────────────────────────────────
export const attendees: { [eventId: string]: Attendee[] } = {
  [E1]: [
    { id: 'at-001', tenantId: T, eventId: E1, firstName: 'Alex',     lastName: 'Morgan',    email: 'alex@webco.com',    status: 'checked_in', createdAt: '2025-12-01T09:00:00Z', updatedAt: '2026-04-15T08:45:00Z' },
    { id: 'at-002', tenantId: T, eventId: E1, firstName: 'Chiara',   lastName: 'Rossi',     email: 'chiara@design.it',  status: 'registered', createdAt: '2025-12-05T09:00:00Z', updatedAt: '2026-01-10T09:00:00Z' },
    { id: 'at-003', tenantId: T, eventId: E1, firstName: 'Omar',     lastName: 'Hassan',    email: 'omar@fintech.ae',   status: 'registered', createdAt: '2025-12-10T09:00:00Z', updatedAt: '2026-01-15T09:00:00Z' },
    { id: 'at-004', tenantId: T, eventId: E1, firstName: 'Nina',     lastName: 'Kovacs',    email: 'nina@startup.hu',   status: 'registered', createdAt: '2026-01-05T09:00:00Z', updatedAt: '2026-01-20T09:00:00Z' },
    { id: 'at-005', tenantId: T, eventId: E1, firstName: 'Tyler',    lastName: 'Brooks',    email: 'tyler@saas.co',     status: 'checked_in', createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-04-15T09:00:00Z' },
    { id: 'at-006', tenantId: T, eventId: E1, firstName: 'Yuna',     lastName: 'Park',      email: 'yuna@uiux.kr',      status: 'registered', createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
    { id: 'at-007', tenantId: T, eventId: E1, firstName: 'Sam',      lastName: 'Osei',      email: 'sam@devops.gh',     status: 'cancelled',  createdAt: '2026-01-25T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z' },
    { id: 'at-008', tenantId: T, eventId: E1, firstName: 'Leila',    lastName: 'Ahmadi',    email: 'leila@cloud.ir',    status: 'registered', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
    { id: 'at-009', tenantId: T, eventId: E1, firstName: 'Tom',      lastName: 'Garcia',    email: 'tom@platform.mx',   status: 'registered', createdAt: '2026-02-05T09:00:00Z', updatedAt: '2026-02-15T09:00:00Z' },
    { id: 'at-010', tenantId: T, eventId: E1, firstName: 'Ingrid',   lastName: 'Larsen',    email: 'ingrid@data.no',    status: 'prospect',   createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
  ],
  [E2]: [
    { id: 'at-011', tenantId: T, eventId: E2, firstName: 'Maya',     lastName: 'Singh',     email: 'maya@figma.com',    status: 'registered', createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
    { id: 'at-012', tenantId: T, eventId: E2, firstName: 'Diego',    lastName: 'Fuentes',   email: 'diego@ux.cl',       status: 'registered', createdAt: '2026-01-25T09:00:00Z', updatedAt: '2026-02-05T09:00:00Z' },
    { id: 'at-013', tenantId: T, eventId: E2, firstName: 'Hana',     lastName: 'Novak',     email: 'hana@product.cz',   status: 'registered', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
    { id: 'at-014', tenantId: T, eventId: E2, firstName: 'Kwame',    lastName: 'Asante',    email: 'kwame@design.gh',   status: 'cancelled',  createdAt: '2026-02-05T09:00:00Z', updatedAt: '2026-02-20T09:00:00Z' },
    { id: 'at-015', tenantId: T, eventId: E2, firstName: 'Lena',     lastName: 'Schneider', email: 'lena@motion.de',    status: 'prospect',   createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
  ],
  [E3]: [
    { id: 'at-016', tenantId: T, eventId: E3, firstName: 'Patrick',  lastName: 'O\'Brien',  email: 'patrick@seed.ie',   status: 'prospect',   createdAt: '2026-02-15T09:00:00Z', updatedAt: '2026-02-15T09:00:00Z' },
    { id: 'at-017', tenantId: T, eventId: E3, firstName: 'Zara',     lastName: 'Ahmed',     email: 'zara@vctrack.pk',   status: 'prospect',   createdAt: '2026-02-20T09:00:00Z', updatedAt: '2026-02-20T09:00:00Z' },
    { id: 'at-018', tenantId: T, eventId: E3, firstName: 'Hugo',     lastName: 'Martins',   email: 'hugo@startup.pt',   status: 'prospect',   createdAt: '2026-02-25T09:00:00Z', updatedAt: '2026-02-25T09:00:00Z' },
  ],
}

// ── Registrations ─────────────────────────────────────────────
export const registrations: { [eventId: string]: Registration[] } = {
  [E1]: [
    { id: 'reg-001', tenantId: T, eventId: E1, attendeeId: 'at-001', ticketId: 'tk-002', status: 'confirmed', registeredAt: '2025-12-01T10:00:00Z', checkinAt: '2026-04-15T08:45:00Z', createdAt: '2025-12-01T10:00:00Z', updatedAt: '2026-04-15T08:45:00Z' },
    { id: 'reg-002', tenantId: T, eventId: E1, attendeeId: 'at-002', ticketId: 'tk-001', status: 'confirmed', registeredAt: '2025-12-05T11:00:00Z', createdAt: '2025-12-05T11:00:00Z', updatedAt: '2026-01-10T09:00:00Z' },
    { id: 'reg-003', tenantId: T, eventId: E1, attendeeId: 'at-003', ticketId: 'tk-001', status: 'confirmed', registeredAt: '2025-12-10T14:00:00Z', createdAt: '2025-12-10T14:00:00Z', updatedAt: '2026-01-15T09:00:00Z' },
    { id: 'reg-004', tenantId: T, eventId: E1, attendeeId: 'at-004', ticketId: 'tk-001', status: 'approved',  registeredAt: '2026-01-05T09:00:00Z', createdAt: '2026-01-05T09:00:00Z', updatedAt: '2026-01-20T09:00:00Z' },
    { id: 'reg-005', tenantId: T, eventId: E1, attendeeId: 'at-005', ticketId: 'tk-003', status: 'confirmed', registeredAt: '2026-01-15T10:00:00Z', checkinAt: '2026-04-15T09:00:00Z', createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-04-15T09:00:00Z' },
    { id: 'reg-006', tenantId: T, eventId: E1, attendeeId: 'at-006', ticketId: 'tk-001', status: 'confirmed', registeredAt: '2026-01-20T11:00:00Z', createdAt: '2026-01-20T11:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
    { id: 'reg-007', tenantId: T, eventId: E1, attendeeId: 'at-007', ticketId: 'tk-001', status: 'cancelled', registeredAt: '2026-01-25T09:00:00Z', createdAt: '2026-01-25T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z' },
    { id: 'reg-008', tenantId: T, eventId: E1, attendeeId: 'at-008', ticketId: 'tk-001', status: 'confirmed', registeredAt: '2026-02-01T09:00:00Z', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
    { id: 'reg-009', tenantId: T, eventId: E1, attendeeId: 'at-009', ticketId: 'tk-002', status: 'pending',   registeredAt: '2026-02-05T13:00:00Z', createdAt: '2026-02-05T13:00:00Z', updatedAt: '2026-02-05T13:00:00Z' },
  ],
  [E2]: [
    { id: 'reg-010', tenantId: T, eventId: E2, attendeeId: 'at-011', ticketId: 'tk-004', status: 'confirmed', registeredAt: '2026-01-20T10:00:00Z', createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
    { id: 'reg-011', tenantId: T, eventId: E2, attendeeId: 'at-012', ticketId: 'tk-004', status: 'confirmed', registeredAt: '2026-01-25T11:00:00Z', createdAt: '2026-01-25T11:00:00Z', updatedAt: '2026-02-05T09:00:00Z' },
    { id: 'reg-012', tenantId: T, eventId: E2, attendeeId: 'at-013', ticketId: 'tk-005', status: 'approved',  registeredAt: '2026-02-01T09:00:00Z', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
    { id: 'reg-013', tenantId: T, eventId: E2, attendeeId: 'at-014', ticketId: 'tk-004', status: 'cancelled', registeredAt: '2026-02-05T14:00:00Z', createdAt: '2026-02-05T14:00:00Z', updatedAt: '2026-02-20T09:00:00Z' },
  ],
  [E3]: [],
}

// ── Sponsors ──────────────────────────────────────────────────
export const sponsors: { [eventId: string]: Sponsor[] } = {
  [E1]: [
    { id: 'spon-001', tenantId: T, eventId: E1, organizationId: O2, tier: 'gold',   amount: 5000000, benefitsJson: { booth: true, logo: true, keynoteSlot: true },  status: 'active',    createdAt: '2025-11-01T09:00:00Z', updatedAt: '2026-01-01T09:00:00Z' },
    { id: 'spon-002', tenantId: T, eventId: E1, organizationId: O4, tier: 'silver', amount: 2000000, benefitsJson: { booth: true, logo: true, keynoteSlot: false }, status: 'active',    createdAt: '2025-11-15T09:00:00Z', updatedAt: '2026-01-15T09:00:00Z' },
    { id: 'spon-003', tenantId: T, eventId: E1, organizationId: O3, tier: 'bronze', amount: 500000,  benefitsJson: { booth: false, logo: true },                    status: 'prospect',  createdAt: '2025-12-01T09:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
  ],
  [E2]: [
    { id: 'spon-004', tenantId: T, eventId: E2, organizationId: O2, tier: 'silver', amount: 1000000, benefitsJson: { booth: true, logo: true },                    status: 'active',    createdAt: '2026-01-10T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
  ],
  [E3]: [],
}

// ── Exhibitors ────────────────────────────────────────────────
export const exhibitors: { [eventId: string]: Exhibitor[] } = {
  [E1]: [
    { id: 'ex-001', tenantId: T, eventId: E1, organizationId: O3, boothCode: 'A-101', boothSize: '20x20', status: 'confirmed',  createdAt: '2025-12-01T09:00:00Z', updatedAt: '2026-01-10T09:00:00Z' },
    { id: 'ex-002', tenantId: T, eventId: E1, organizationId: O5, boothCode: 'B-205', boothSize: '10x10', status: 'invited',    createdAt: '2025-12-15T09:00:00Z', updatedAt: '2026-01-20T09:00:00Z' },
    { id: 'ex-003', tenantId: T, eventId: E1, organizationId: O4, boothCode: 'C-310', boothSize: '10x20', status: 'confirmed',  createdAt: '2026-01-05T09:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
  ],
  [E2]: [
    { id: 'ex-004', tenantId: T, eventId: E2, organizationId: O5, boothCode: 'D-401', boothSize: '10x10', status: 'invited',    createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-02-05T09:00:00Z' },
  ],
  [E3]: [],
}

// ── Notifications ─────────────────────────────────────────────
export const notifications: Notification[] = [
  { id: 'notif-001', tenantId: T, eventId: E1, channel: 'email', templateKey: 'registration_confirmed', subject: 'Your TechSummit 2026 registration is confirmed!', payloadJson: {}, status: 'delivered', sentAt: '2025-12-05T11:05:00Z', deliveredAt: '2025-12-05T11:06:00Z', createdAt: '2025-12-05T11:05:00Z', updatedAt: '2025-12-05T11:06:00Z' },
  { id: 'notif-002', tenantId: T, eventId: E1, channel: 'email', templateKey: 'registration_confirmed', subject: 'Your TechSummit 2026 registration is confirmed!', payloadJson: {}, status: 'delivered', sentAt: '2025-12-10T14:05:00Z', deliveredAt: '2025-12-10T14:06:00Z', createdAt: '2025-12-10T14:05:00Z', updatedAt: '2025-12-10T14:06:00Z' },
  { id: 'notif-003', tenantId: T, eventId: E1, channel: 'email', templateKey: 'reminder_7d',           subject: 'TechSummit 2026 is one week away!',                payloadJson: {}, status: 'delivered', sentAt: '2026-04-08T10:00:00Z', deliveredAt: '2026-04-08T10:01:00Z', createdAt: '2026-04-08T10:00:00Z', updatedAt: '2026-04-08T10:01:00Z' },
  { id: 'notif-004', tenantId: T, eventId: E1, channel: 'sms',   templateKey: 'reminder_1d',           subject: undefined,                                          payloadJson: {}, status: 'delivered', sentAt: '2026-04-14T09:00:00Z', deliveredAt: '2026-04-14T09:00:10Z', createdAt: '2026-04-14T09:00:00Z', updatedAt: '2026-04-14T09:00:10Z' },
  { id: 'notif-005', tenantId: T, eventId: E1, channel: 'email', templateKey: 'ticket_cancelled',       subject: 'Your TechSummit 2026 ticket has been cancelled.',  payloadJson: {}, status: 'delivered', sentAt: '2026-03-01T09:05:00Z', deliveredAt: '2026-03-01T09:06:00Z', createdAt: '2026-03-01T09:05:00Z', updatedAt: '2026-03-01T09:06:00Z' },
  { id: 'notif-006', tenantId: T, eventId: E1, channel: 'push',  templateKey: 'checkin_open',          subject: undefined,                                          payloadJson: {}, status: 'sent',      sentAt: '2026-04-15T07:00:00Z', createdAt: '2026-04-15T07:00:00Z', updatedAt: '2026-04-15T07:00:00Z' },
  { id: 'notif-007', tenantId: T, eventId: E2, channel: 'email', templateKey: 'registration_confirmed', subject: 'Product Design Week registration confirmed!',       payloadJson: {}, status: 'delivered', sentAt: '2026-01-20T10:05:00Z', deliveredAt: '2026-01-20T10:06:00Z', createdAt: '2026-01-20T10:05:00Z', updatedAt: '2026-01-20T10:06:00Z' },
  { id: 'notif-008', tenantId: T, eventId: E2, channel: 'email', templateKey: 'reminder_7d',           subject: 'Product Design Week is one week away!',            payloadJson: {}, status: 'queued',    createdAt: '2026-05-13T10:00:00Z', updatedAt: '2026-05-13T10:00:00Z' },
  { id: 'notif-009', tenantId: T, channel: 'webhook', templateKey: 'payment_received',                 subject: undefined,                                          payloadJson: {}, status: 'failed',    sentAt: '2026-02-05T13:05:00Z', createdAt: '2026-02-05T13:05:00Z', updatedAt: '2026-02-05T13:06:00Z' },
  { id: 'notif-010', tenantId: T, channel: 'in_app', templateKey: 'system_alert',                      subject: 'All systems operational.',                          payloadJson: {}, status: 'delivered', sentAt: '2026-03-07T08:00:00Z', deliveredAt: '2026-03-07T08:00:01Z', createdAt: '2026-03-07T08:00:00Z', updatedAt: '2026-03-07T08:00:01Z' },
]

// ── Analytics ─────────────────────────────────────────────────
export const tenantKpis: TenantKpis = {
  totalEvents:        3,
  activeEvents:       2,
  totalRevenue:       113_420_100,
  totalAttendees:     1597,
  avgRevenuePerEvent: 37_806_700,
  currency: 'USD',
}

export const eventKpis: Record<string, EventKpis> = {
  [E1]: { totalRegistrations: 1243, totalRevenue: 109_350_100, totalAttendees: 1421, checkedInCount: 2, conversionRate: 0.62, avgOrderValue: 87_970 },
  [E2]: { totalRegistrations: 342,  totalRevenue: 4_070_000,   totalAttendees: 176,  checkedInCount: 0, conversionRate: 0.68, avgOrderValue: 49_880 },
  [E3]: { totalRegistrations: 0,    totalRevenue: 0,            totalAttendees: 0,    checkedInCount: 0, conversionRate: 0,    avgOrderValue: 0 },
}

export const revenueSummary: Record<string, RevenueSummary> = {
  [E1]: {
    totalRevenue: 109_350_100,
    currency: 'USD',
    byTicketType: [
      { ticketName: 'General Admission', revenue: 99_357_000, count: 1243 },
      { ticketName: 'VIP Pass',           revenue: 8_563_200,  count: 178 },
      { ticketName: 'Workshop Add-on',    revenue: 1_429_900,  count: 287 },
    ],
    byDay: [
      { date: '2026-04-15', revenue: 42_000_000 },
      { date: '2026-04-16', revenue: 38_500_000 },
      { date: '2026-04-17', revenue: 28_850_100 },
    ],
  },
  [E2]: {
    totalRevenue: 4_070_000,
    currency: 'USD',
    byTicketType: [
      { ticketName: 'Designer Pass',   revenue: 3_314_200, count: 342 },
      { ticketName: 'Sprint Workshop', revenue: 755_800,   count: 38 },
    ],
    byDay: [
      { date: '2026-05-20', revenue: 1_600_000 },
      { date: '2026-05-21', revenue: 1_400_000 },
      { date: '2026-05-22', revenue: 1_070_000 },
    ],
  },
  [E3]: { totalRevenue: 0, currency: 'USD', byTicketType: [], byDay: [] },
}

export const attendanceTrend: Record<string, AttendanceTrend> = {
  [E1]: {
    byDay: [
      { date: '2025-12-01', registrations: 45, checkins: 0 },
      { date: '2026-01-15', registrations: 120, checkins: 0 },
      { date: '2026-02-01', registrations: 200, checkins: 0 },
      { date: '2026-03-01', registrations: 350, checkins: 0 },
      { date: '2026-04-01', registrations: 528, checkins: 0 },
      { date: '2026-04-15', registrations: 0,   checkins: 2 },
    ],
  },
  [E2]: {
    byDay: [
      { date: '2026-01-20', registrations: 80,  checkins: 0 },
      { date: '2026-02-15', registrations: 150, checkins: 0 },
      { date: '2026-03-10', registrations: 112, checkins: 0 },
    ],
  },
  [E3]: { byDay: [] },
}

export const funnelMetrics: Record<string, FunnelMetrics> = {
  [E1]: {
    pageViews: 28_400,
    cartStarts: 6_200,
    checkoutStarts: 3_100,
    checkoutCompletions: 1_421,
    abandonmentRate: 0.54,
    conversionRate: 0.05,
    byStep: [
      { step: 'Page View → Cart',         count: 6200,  dropOffRate: 0.78 },
      { step: 'Cart → Checkout',           count: 3100,  dropOffRate: 0.50 },
      { step: 'Checkout → Confirmation',   count: 1421,  dropOffRate: 0.54 },
    ],
  },
  [E2]: {
    pageViews: 8_400,
    cartStarts: 1_800,
    checkoutStarts: 900,
    checkoutCompletions: 380,
    abandonmentRate: 0.58,
    conversionRate: 0.045,
    byStep: [
      { step: 'Page View → Cart',         count: 1800, dropOffRate: 0.79 },
      { step: 'Cart → Checkout',           count: 900,  dropOffRate: 0.50 },
      { step: 'Checkout → Confirmation',   count: 380,  dropOffRate: 0.58 },
    ],
  },
  [E3]: { pageViews: 0, cartStarts: 0, checkoutStarts: 0, checkoutCompletions: 0, abandonmentRate: 0, conversionRate: 0, byStep: [] },
}

// ── Auth stub ─────────────────────────────────────────────────
export const me = {
  id: 'user-001',
  tenantId: T,
  email: 'admin@acme.com',
  firstName: 'Sarah',
  lastName: 'Chen',
  status: 'active',
  roles: ['admin'],
}
