Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Frontend Dashboard Catalog

> Defines every dashboard, its target role, widgets, KPIs, actions, data sources,
> and navigation paths. All dashboards derived from verified backend analytics and
> service endpoints. No invented widgets.

---

## D-01: Organizer Dashboard

**Target role**: organizer, tenant_admin (organizer view)  
**Route**: `/dashboard` (organizer variant)  
**Required permissions**: `event:manage`, `analytics:read`

### Widgets

| Widget | Type | Data source | API |
|---|---|---|---|
| Active Events | Count card | Events with status: published or live | `GET /v1/events?status=live,published&limit=1&count=true` |
| Recent Registrations | Count + trend | Registrations in last 7 days | `GET /v1/analytics/summary?metric=registrations&period=7d` |
| Ticket Revenue (MTD) | Currency card | TicketSalesSummary | `GET /v1/analytics/summary?metric=revenue&period=mtd` |
| Upcoming Events | List | Next 3 events by startDate | `GET /v1/events?status=published&sort=startDate&limit=3` |
| Recent Registrations | Feed | Last 10 registrations | `GET /v1/registrations?limit=10&sort=createdAt` |
| Pending Approvals | Alert count | Registrations with status=submitted | `GET /v1/registrations?status=submitted&count=true` |

### KPIs

| KPI | Calculation | Target |
|---|---|---|
| Total Registrations | Count from analytics | N/A (informational) |
| Confirmed Rate | confirmed / total registrations × 100 | >80% |
| Check-in Rate | checked_in / confirmed × 100 | >70% on event day |
| Revenue MTD | Sum of paid orders | N/A (informational) |

### Actions

- "Create Event" primary CTA
- "Review Pending Approvals" (if pending > 0)
- Click upcoming event → `/events/:id`

### Navigation paths

- Upcoming events → `/events/:id`
- Pending approvals → `/events/:id/registrations?status=submitted`
- Revenue → `/analytics`

---

## D-02: Finance / Commerce Dashboard

**Target role**: finance  
**Route**: `/dashboard` (finance variant)  
**Required permissions**: `commerce:manage`, `analytics:read`, `audit:read`

### Widgets

| Widget | Type | Data source | API |
|---|---|---|---|
| Total Revenue (MTD) | Currency card | TicketSalesSummary | `GET /v1/analytics/summary?metric=revenue&period=mtd` |
| Orders This Month | Count card | Order events | `GET /v1/analytics/summary?metric=orders&period=mtd` |
| Refunds This Month | Currency card | PaymentTransaction (refund type) | `GET /v1/analytics/summary?metric=refunds&period=mtd` |
| Revenue by Event | Bar chart | EventMetric | `GET /v1/analytics/metrics?group=event&metric=revenue` |
| Ticket Sales Breakdown | Pie chart | TicketSalesSummary | `GET /v1/analytics/ticket-sales` |
| Recent Orders | Feed | Last 10 orders | `GET /v1/orders?limit=10&sort=createdAt` |

### KPIs

| KPI | Calculation |
|---|---|
| Gross Revenue | Sum of all paid orders |
| Net Revenue | Gross − refunds |
| Average Order Value | Total revenue / order count |
| Refund Rate | Refund count / order count × 100 |

### Actions

- "View All Orders"
- "Export Report" (CSV)

---

## D-03: Onsite Operations Dashboard

**Target role**: onsite_staff, organizer (event-day view)  
**Route**: `/events/:eventId/onsite`  
**Required permissions**: `onsite:operate`

### Widgets

| Widget | Type | Data source | API |
|---|---|---|---|
| Check-in Rate | Gauge (0–100%) | CheckIn count / confirmed registrations | `GET /v1/analytics/checkin?eventId=` |
| Checked In (live) | Count card (auto-refresh) | CheckIn events | `GET /v1/check-ins?eventId=&count=true` |
| Not Yet Arrived | Count card | Confirmed registrations − CheckIns | Derived |
| Badges Printed | Count card | BadgePrint records | `GET /v1/badge-prints?eventId=&count=true` |
| Recent Check-ins | Live feed | Last 20 CheckIn records | `GET /v1/check-ins?eventId=&limit=20&sort=createdAt` |
| Active Devices | Count | DeviceSession records with endedAt=null | `GET /v1/device-sessions?eventId=&active=true` |

### KPIs

| KPI | Target |
|---|---|
| Check-in Rate | >80% of confirmed registrations by event end |
| Badge Print Rate | ~100% of check-ins |
| Average Check-in Time | <30 seconds per attendee |

### Actions

- "Go to Check-in Station" primary CTA → `/events/:id/onsite/checkin`
- "Print Badges" → `/events/:id/onsite/badges`
- "Manage Devices" → `/events/:id/onsite/devices`

### Refresh behavior

Auto-refresh every 30 seconds (live event context).

---

## D-04: Support Dashboard

**Target role**: support  
**Route**: `/dashboard` (support variant)  
**Required permissions**: `attendee:manage`, `registration:manage`, `analytics:read`

### Widgets

| Widget | Type | Data source | API |
|---|---|---|---|
| Pending Registrations | Alert count | status=submitted | `GET /v1/registrations?status=submitted&count=true` |
| Registrations Today | Count card | Created today | `GET /v1/analytics/summary?metric=registrations&period=1d` |
| Attendee Search | Search box | Direct to attendee search | `GET /v1/attendees?search=` |
| Recent Registrations | Feed | Last 10 submitted | `GET /v1/registrations?status=submitted&limit=10` |

### Actions

- "Search Attendees" (primary CTA)
- "Review Pending" (if pending > 0)

---

## D-05: Admin Dashboard

**Target role**: tenant_admin  
**Route**: `/dashboard` (admin variant) or `/admin`  
**Required permissions**: All admin permissions

### Widgets

| Widget | Type | Data source | API |
|---|---|---|---|
| Active Events | Count card | Events status=live,published | `GET /v1/events?status=live,published&count=true` |
| Total Users | Count card | All users in tenant | `GET /v1/users?count=true` |
| Platform Revenue (MTD) | Currency card | TicketSalesSummary | `GET /v1/analytics/summary?metric=revenue&period=mtd` |
| Recent Audit Events | Feed | Last 10 audit entries | `GET /v1/audit-logs?limit=10` |
| Active Webhook Subscriptions | Count | Active webhooks | `GET /v1/webhooks?count=true` |
| Registered Users (30d trend) | Line chart | Analytics | `GET /v1/analytics/summary?metric=users&period=30d&group=day` |

### Actions

- "Invite User" → `/admin/users/new`
- "Create Event" → `/events/new`
- "View Audit Log" → `/admin/audit`

---

## D-06: Attendee Hub

**Target role**: attendee  
**Route**: `/dashboard` (attendee variant)  
**Required permissions**: None (authenticated, own data)

### Widgets

| Widget | Type | Data source | API |
|---|---|---|---|
| My Upcoming Events | List | Own confirmed registrations with future events | `GET /v1/registrations?userId=me&status=confirmed` + event dates |
| My Tickets | Count + quick access | Own tickets | `GET /v1/tickets?userId=me&count=true` |
| Pending Connection Requests | Count badge | Incoming requests | `GET /v1/connections?requesteeId=me&status=pending&count=true` |
| Active Polls | List | Active polls for registered events | `GET /v1/polls?active=true&registeredEventIds=...` |

### Actions

- "Browse Events" → public event discovery (if implemented)
- "View My Tickets" → `/my/tickets`
- "View Connections" → `/network`
- Quick link to active poll participation

---

## D-07: Event Analytics Dashboard (Event-scoped)

**Target role**: tenant_admin, organizer, finance, support  
**Route**: `/events/:eventId/analytics`  
**Required permissions**: `analytics:read`

### Widgets

| Widget | Type | Data source | API |
|---|---|---|---|
| Total Registrations | Count card | Registration events | `GET /v1/analytics/events/:id?metric=registrations` |
| Confirmed Rate | Gauge | Confirmed / total | Derived |
| Check-in Rate | Gauge | CheckIn / confirmed | `GET /v1/analytics/checkin?eventId=` |
| Ticket Revenue | Currency card | TicketSalesSummary | `GET /v1/analytics/events/:id?metric=revenue` |
| Tickets Sold | Count + breakdown | TicketSalesSummary | `GET /v1/analytics/ticket-sales?eventId=` |
| Registration Timeline | Line chart | Daily registration count | `GET /v1/analytics/events/:id?metric=registrations&group=day` |
| Attendance by Session | Bar chart | session.attended events | `GET /v1/analytics/events/:id?metric=session-attendance` |
| Attendee Tags | Tag cloud | AttendeeTag | Derived from attendee data |

### Actions

- "Export to CSV"
- Filter by date range

---

## Dashboard-to-Role Matrix

| Dashboard | tenant_admin | organizer | finance | support | exhibitor | speaker | onsite_staff | attendee |
|---|---|---|---|---|---|---|---|---|
| D-01 Organizer | ✅ | ✅ | — | — | — | — | — | — |
| D-02 Finance | ✅ | ✅ (reduced) | ✅ | — | — | — | — | — |
| D-03 Onsite | ✅ | ✅ | — | — | — | — | ✅ | — |
| D-04 Support | ✅ | — | — | ✅ | — | — | — | — |
| D-05 Admin | ✅ | — | — | — | — | — | — | — |
| D-06 Attendee Hub | — | — | — | — | — | — | — | ✅ |
| D-07 Event Analytics | ✅ | ✅ | ✅ | ✅ | — | — | — | — |
| Exhibitor Portal* | ✅ | — | — | — | ✅ | — | — | — |
| Speaker Portal* | ✅ | — | — | — | — | ✅ | — | — |

*Exhibitor and Speaker portals are simplified dashboard variants, not full dashboards — included in S-07 role-adaptive dashboard
