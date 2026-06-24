Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Frontend Navigation Model

> Derived from: verified backend service endpoints, 8-role model (rbac.service.ts),
> 23-permission taxonomy (Phase 2.95 collapse), 10 product workflows (PRODUCT_WORKFLOWS.md),
> and FEATURE_SCOPE.md. No invented navigation — every section maps to an implemented backend service.

## Navigation Zones

The frontend navigation is organized into three zones:

| Zone | Description | Access |
|---|---|---|
| **Public** | Pre-authentication screens | Unauthenticated |
| **App Shell** | Authenticated user experience | All authenticated roles |
| **Admin Shell** | Platform administration | tenant_admin only |

---

## 1. Public Zone (Unauthenticated)

Routes accessible without authentication:

| Path | Screen |
|---|---|
| `/login` | Login |
| `/register` | Account Registration |
| `/forgot-password` | Password Reset Request |
| `/reset-password` | Password Reset (token link) |
| `/sso/callback` | SSO OAuth2/SAML redirect handler |
| `/events/:eventId/register` | Public Event Registration form |
| `/events/:eventId/checkout` | Ticket checkout (attendee-facing) |
| `/registrations/:id/confirm` | Registration confirmation page |

---

## 2. App Shell Navigation Tree

### Primary Sidebar Navigation

```
Dashboard                       [all authenticated roles]
│
├── Events                      [tenant_admin, organizer]
│   ├── All Events
│   └── Create Event
│
├── Agenda                      [tenant_admin, organizer, speaker*]
│   (* speaker sees own sessions only)
│   ├── Sessions
│   └── Tracks
│
├── Speakers                    [tenant_admin, organizer]
│   ├── All Speakers
│   └── Add Speaker
│
├── Exhibitors                  [tenant_admin, organizer, exhibitor*]
│   (* exhibitor sees own records only)
│   ├── Exhibitor List
│   ├── Sponsors
│   └── Booths
│
├── Attendees                   [tenant_admin, organizer, support, onsite_staff]
│   ├── Attendee Directory
│   └── [Search by name/email]
│
├── Registration                [tenant_admin, organizer, support]
│   ├── Registrations
│   └── Registration Fields
│
├── Ticketing                   [tenant_admin, organizer, finance]
│   ├── Ticket Products
│   ├── Pricing Rules
│   └── Promo Codes
│
├── Orders                      [tenant_admin, organizer, finance]
│   └── Order List
│
├── Inventory                   [tenant_admin, organizer, finance]
│   └── Inventory Status
│
├── Onsite                      [tenant_admin, organizer, onsite_staff]
│   ├── Check-in Station
│   ├── Badge Prints
│   └── Devices
│
├── Campaigns                   [tenant_admin, organizer]
│   ├── All Campaigns
│   ├── Audience Segments
│   └── Create Campaign
│
├── Analytics                   [tenant_admin, organizer, finance, support]
│   ├── Overview
│   └── Event Analytics [contextual]
│
├── Networking                  [all authenticated users]
│   ├── My Connections
│   └── Connection Requests
│
├── Polls & Q&A                 [tenant_admin, organizer (manage); all (participate)]
│   ├── Poll Management
│   ├── Q&A Management
│   └── Surveys
│
├── Search                      [all authenticated users]
│
├── Integrations                [tenant_admin]
│   └── Webhook Subscriptions
│
└── Admin                       [tenant_admin]
    ├── Users
    ├── Roles
    ├── Tenant Settings
    ├── SSO Configuration
    └── Audit Log
```

### Context-Sensitive Navigation

When a user is in the context of a specific **Event**, a secondary contextual navigation appears:

```
[Event: {name}]                 ← breadcrumb / context header
├── Overview
├── Agenda
│   ├── Sessions
│   └── Tracks
├── Speakers
├── Registration
│   ├── Registrations
│   └── Fields
├── Ticketing
│   ├── Ticket Products
│   ├── Pricing
│   └── Promo Codes
├── Orders
├── Inventory
├── Exhibitors
│   ├── Exhibitors
│   ├── Sponsors
│   └── Booths
├── Onsite
│   ├── Check-in
│   ├── Badges
│   └── Devices
├── Campaigns
├── Polls & Q&A
├── Analytics
└── Settings
```

### Attendee / Speaker Simplified Navigation

Roles `attendee` and `speaker` see a simplified navigation focused on their experience:

```
[attendee]
├── Dashboard (my events, my tickets)
├── My Registrations
├── My Tickets
├── Networking (connections)
├── Polls & Q&A (participate)
└── Search

[speaker]
├── Dashboard (my sessions)
├── My Sessions
├── Networking
└── Profile
```

---

## 3. Admin Shell Navigation (tenant_admin only)

Accessible via `/admin` prefix:

```
Platform Admin
├── Users               → /admin/users
├── Roles               → /admin/roles
├── Tenant Settings     → /admin/tenant
├── SSO Configuration   → /admin/sso
└── Audit Log           → /admin/audit
```

---

## 4. Role-Based Navigation Visibility

| Section | tenant_admin | organizer | finance | support | exhibitor | speaker | onsite_staff | attendee |
|---|---|---|---|---|---|---|---|---|
| Events | ✅ | ✅ | — | — | — | — | — | — |
| Agenda | ✅ | ✅ | — | — | — | ✅ (own) | — | — |
| Speakers | ✅ | ✅ | — | — | — | — | — | — |
| Exhibitors | ✅ | ✅ | — | — | ✅ (own) | — | — | — |
| Attendees | ✅ | ✅ | — | ✅ | — | — | ✅ | — |
| Registration | ✅ | ✅ | — | ✅ | — | — | — | ✅ (own) |
| Ticketing | ✅ | ✅ | ✅ | — | — | — | — | ✅ (own) |
| Orders | ✅ | ✅ | ✅ | — | — | — | — | ✅ (own) |
| Inventory | ✅ | ✅ | ✅ | — | — | — | — | — |
| Onsite | ✅ | ✅ | — | — | — | — | ✅ | — |
| Campaigns | ✅ | ✅ | — | — | — | — | — | — |
| Analytics | ✅ | ✅ | ✅ | ✅ | — | — | — | — |
| Networking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Polls & Q&A | ✅ | ✅ | — | — | — | — | — | ✅ (participate) |
| Search | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Integrations | ✅ | — | — | — | — | — | — | — |
| Admin | ✅ | — | — | — | — | — | — | — |

---

## 5. Navigation Authority Sources

| Navigation section | Backend service | Key entities | Workflow |
|---|---|---|---|
| Events | `services/event` | Event, Venue, Room | Workflow 2 (Event Lifecycle) |
| Agenda | `services/agenda` | Session, Track | Workflow 3 (Agenda Management) |
| Speakers | `services/speaker` | Speaker, SpeakerProfile, SessionSpeaker | Workflow 4 (Speaker Management) |
| Exhibitors | `services/exhibitor` | Exhibitor, Booth, Sponsor, Lead | — |
| Attendees | `services/attendee` | Attendee, AttendeeProfile, AttendeeTag | — |
| Registration | `services/registration` | Registration, RegistrationField | Workflow 8 (Registration) |
| Ticketing | `services/ticketing` + `services/pricing` | TicketProduct, Ticket, PriceRule, PromoCode | Workflow 5 (Ticket Setup) |
| Orders | `services/order` + `services/payment` | Order, Payment, PaymentTransaction | Workflow 6 (Checkout) |
| Inventory | `services/inventory` | InventoryItem | Workflow 5 |
| Onsite | `services/onsite` | CheckIn, BadgePrint, DeviceSession | Workflow 9 (Check-in) |
| Campaigns | `services/notification` | Campaign, AudienceSegment | Workflow 10 (Campaign Delivery) |
| Analytics | `services/analytics` | AnalyticsEvent, EventMetric, TicketSalesSummary | — |
| Networking | `services/networking` | AttendeeConnection | — |
| Polls & Q&A | `services/interactive-engagement` | (Poll, QA, Survey entities) | — |
| Search | `services/search` | SearchDocument | — |
| Integrations | `services/integration` | WebhookSubscription | — |
| Admin | `services/tenant`, `services/auth`, `services/rbac`, `services/audit` | Tenant, User, Role, Permission | Workflow 1 (Tenant Onboarding) |
