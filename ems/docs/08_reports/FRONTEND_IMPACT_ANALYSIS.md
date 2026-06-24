Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Frontend Impact Analysis

> Phase 2.95 — Executed 2026-06-17.
> Documents the specific frontend impact of each collapsed decision on
> navigation, menus, screens, dashboards, permissions, workflows, forms,
> components, user journeys, and role experiences.

---

## 1. Navigation and Information Architecture

Based on collapsed decisions, the frontend navigation is now stable:

### Primary Navigation Sections (all confirmed, no ambiguity)

| Section | Backend Service | Roles with Access |
|---|---|---|
| Events | `services/event` | tenant_admin, organizer |
| Agenda | `services/agenda` | tenant_admin, organizer, speaker (own sessions) |
| Speakers | `services/speaker` | tenant_admin, organizer |
| Exhibitors | `services/exhibitor` | tenant_admin, organizer, exhibitor (own records) |
| Attendees | `services/attendee` | tenant_admin, organizer, support, onsite_staff |
| Registration | `services/registration` | tenant_admin, organizer, support |
| Ticketing | `services/ticketing` + `services/pricing` | tenant_admin, organizer, finance |
| Commerce | `services/order` + `services/payment` + `services/fulfillment` | tenant_admin, organizer, finance |
| Inventory | `services/inventory` | tenant_admin, organizer, finance |
| Onsite | `services/onsite` | tenant_admin, organizer, onsite_staff |
| Networking | `services/networking` | All authenticated users |
| Polls / Q&A / Surveys | `services/interactive-engagement` | All authenticated users |
| Campaigns | `services/notification` (`/campaigns`, `/audience-segments`) | tenant_admin, organizer |
| Analytics | `services/analytics` | tenant_admin, organizer, finance, support |
| Search | `services/search` | All authenticated users |
| AI / Recommendations | `services/ai-service` | All authenticated users (graceful degradation) |
| Platform Admin | `services/tenant` + `services/auth` + `services/rbac` + `services/audit` | tenant_admin |
| Integrations | `services/integration` | tenant_admin |

**Not in navigation** (ROD-1 collapsed): `services/engagement` — no routes, removed from scope.

---

## 2. Menus

### Main Menu (by role)

**tenant_admin**: All 18 sections above.

**organizer**: Events, Agenda, Speakers, Exhibitors, Attendees, Registration, Ticketing, Commerce, Inventory, Onsite, Campaigns, Analytics, Search, AI/Recommendations, Networking, Polls/Q&A/Surveys.

**finance**: Commerce, Ticketing, Inventory, Analytics. (Audit access: read-only)

**support**: Attendees, Registration, Analytics (read). (User lookup access)

**exhibitor**: Exhibitors (own records only), Networking, Search.

**speaker**: Agenda (own sessions only), Networking.

**onsite_staff**: Onsite (check-in, badge print, device sessions), Attendees (read).

**attendee**: Networking, Polls/Q&A/Surveys, Search, AI/Recommendations, own Registration and Ticket records.

---

## 3. Screens — Per Collapsed Decision

### ROD-1: Engagement Module Removal

- **REMOVE** from build plan: any screen labelled "Engagement," "Engagement Hub," or "Engagement Dashboard"
- **RECLASSIFY**: Campaign management screens → belong in the Campaigns section (backed by `services/notification`)
- **KEEP**: Interactive engagement screens (polls, Q&A, surveys) → backed by `services/interactive-engagement`
- **No API endpoints** exist for `services/engagement` — do not build any page that calls a non-existent engagement API

### ROD-3: Permission Scheme

The 23-permission taxonomy stabilizes which screens are gated:

| Screen | Required Permission |
|---|---|
| Create/edit/publish Event | `event:manage` |
| Create/edit Session | `agenda:manage` |
| Assign Speaker to Session | `speaker:manage` |
| Manage Attendee profile | `attendee:manage` |
| Approve/reject Registration | `registration:manage` |
| Manage Exhibitor/Booth | `exhibitor:manage` |
| Create/refund Order | `commerce:manage` |
| Check-in / Badge print | `onsite:operate` |
| View Analytics dashboard | `analytics:read` |
| Create/send Campaign | `campaign:manage` |
| Manage Webhooks | `integration:manage` |
| Manage Users | `user:read` / `user:write` / `user:delete` |
| Manage Roles | `role:read` / `role:write` / `role:assign` / `role:revoke` |
| View Audit Log | `audit:read` |
| Manage Tenant Settings | `tenant:read` / `tenant:write` |
| Manage SSO | `sso:manage` |
| Suspend Tenant | `tenant:suspend` |

### ROD-9: EventSettings

- **ADD** screen: Event Settings page (separate from Event edit)
- **Route**: `/events/:id/settings`
- **Form fields**: Registration Opens At (datetime), Registration Closes At (datetime), Max Capacity (number, 0=unlimited), Requires Approval (toggle), Branding Config (JSON editor or structured form)
- **API**: `GET /v1/events/:id/settings`, `PUT /v1/events/:id/settings`
- **State**: Build with graceful degradation — if endpoint returns 404 (entity not yet created), show "Settings not yet configured" with a Create button

### ROD-10: AI Features

- **Build with graceful degradation** for all AI-powered features
- Semantic search returns 0 results until real embedding API is wired → fall back to full-text search (works now)
- Speaker recommendations → placeholder "recommendations coming soon" state
- Content suggestions → placeholder state
- Full-text search via `GET /v1/search?q=` works today

### ROD-11: Role Management

- **8 roles only**: tenant_admin, organizer, finance, support, exhibitor, speaker, onsite_staff, attendee
- Role management screen shows these 8 system roles (read-only for system roles) + any custom roles the tenant created
- Role assignment UI: dropdown/selector with these 8 options + custom roles
- No 9th "platform_admin" role in UI

---

## 4. Dashboards

| Dashboard | Audience | Data sources |
|---|---|---|
| Event Overview | organizer, tenant_admin | Analytics: attendance, revenue, registrations |
| Check-in Live | onsite_staff, organizer | Onsite: check-in rate, badge prints |
| Commerce | finance, organizer | Orders, payments, inventory levels |
| Attendee Insights | organizer, finance | Analytics: demographics, connection graph |
| Platform Admin | tenant_admin | Tenant settings, user list, audit log |

---

## 5. Permissions (UI layer)

### Frontend permission check model

Per ROD-5 (RESOLVED): Do NOT read `permissions` from the JWT token. The JWT issues `permissions: []` always.

**Correct approach**: After login, call `GET /v1/rbac/users/me/roles` to fetch the user's roles. Derive permitted sections from the role→section mapping above. Cache in application state (not localStorage).

**On 403 response**: Show "You don't have permission to view this" — do not retry.

**On 401 response**: Redirect to login.

### Permission check pseudocode
```
const userRoles = await api.get('/v1/rbac/users/me/roles');
const canManageEvents = userRoles.includes('tenant_admin') || userRoles.includes('organizer');
const canViewAnalytics = ['tenant_admin', 'organizer', 'finance', 'support'].some(r => userRoles.includes(r));
// etc.
```

---

## 6. Workflows — Frontend State Machines

### Event Lifecycle (ROD impact: none — always stable)
`draft` → `published` → `live` → `archived` (or `cancelled` from any state)

UI state machine for the Event edit page. Status transitions via:
- `POST /v1/events/:id/publish` → `event.published`
- `POST /v1/events/:id/go-live` → `event.went_live`
- `POST /v1/events/:id/archive` → `event.archived`
- `DELETE /v1/events/:id` or `POST /v1/events/:id/cancel` → `event.cancelled`

### Registration Workflow (ROD impact: none)
`submitted` → `approved` → `confirmed` → `waitlisted` | `cancelled`

The Registration list page shows status badges. Manual approval (`POST /v1/registrations/:id/approve`) gated on `registration:manage`.

### Commerce Workflow (ROD impact: none)
Order: `pending` → `paid` → `fulfilled` | `cancelled`
Payment: triggers order state change via Kafka (`payment.completed` → `order.paid`)

### Campaign Workflow (ROD-1 impact: UI section is under Campaigns, not Engagement)
`draft` → `scheduled` → `sent`
`POST /v1/campaigns` → `POST /v1/campaigns/:id/send`

---

## 7. Forms — Key Field Mappings

### Event Settings Form (ROD-9)
```
Registration Opens At:  DateTimePicker → registrationOpensAt (nullable)
Registration Closes At: DateTimePicker → registrationClosesAt (nullable)
Max Capacity:           NumberInput (0=unlimited) → maxCapacity
Requires Approval:      Toggle → requiresApproval
Branding Config:        JSONEditor (advanced) → brandingConfig
```

### Role Assignment Form (ROD-11)
```
Role selector: ['tenant_admin', 'organizer', 'finance', 'support', 'exhibitor', 'speaker', 'onsite_staff', 'attendee'] + custom roles
API: POST /v1/rbac/users/:userId/roles { roleId }
```

### Webhook Subscription Form (GAP-B8 fixed)
```
Name:       TextInput → name
Target URL: URLInput → targetUrl
Event Types: MultiSelect (64 options from Topics enum) → eventTypes
Secret:     PasswordInput (min 16 chars) → secret (optional)
```

---

## 8. Components

| Component | Depends on | Notes |
|---|---|---|
| `RoleGuard` | ROD-5 (RESOLVED) | Wrap with roles array; fetch from RBAC API not JWT |
| `PermissionGate` | ROD-3 (OWNER_CONFIRMATION_ONLY) | Stable permission taxonomy now defined |
| `EventStatusBadge` | Always stable | 5 states: draft/published/live/archived/cancelled |
| `RegistrationStatusBadge` | Always stable | 5 states: submitted/approved/confirmed/waitlisted/cancelled |
| `RoleSelector` | ROD-11 (OWNER_CONFIRMATION_ONLY) | 8 system roles + custom roles |
| `CampaignSection` | ROD-1 (OWNER_CONFIRMATION_ONLY) | Belongs in notification section, not engagement |
| `SemanticSearch` | ROD-10 (TRUE_OWNER_DECISION) | Build with full-text fallback |
| `EventSettingsForm` | ROD-9 (OWNER_CONFIRMATION_ONLY) | 5 core fields |

---

## 9. User Journeys — Role Experiences

### Organizer Journey
1. Create Event (event:manage) → configure Event Settings (ROD-9)
2. Build Agenda: create Tracks → create Sessions → assign Speakers (agenda:manage, speaker:manage)
3. Set up Ticketing: create TicketProduct → define pricing → allocate inventory (commerce:manage)
4. Publish Event → open Registration → manage registrations (registration:manage)
5. Send Campaign to audience segment (campaign:manage)
6. Go live → monitor Analytics dashboard (analytics:read)
7. Archive or cancel event

### Attendee Journey
1. Register for Event (unauthenticated or authenticated)
2. Purchase Ticket → receive confirmation (notification)
3. Check-in at event (onsite staff operates; attendee scans QR)
4. Network with other attendees (networking)
5. Participate in polls/Q&A (interactive-engagement)

### Onsite Staff Journey
1. Open Onsite dashboard (onsite:operate)
2. Scan attendee badge → create CheckIn → optionally print Badge
3. Monitor check-in rate on live dashboard

### Finance Journey
1. View Commerce dashboard (commerce:manage, analytics:read)
2. Review Order and Payment reports (audit:read)
3. Export reports

### Exhibitor Journey
1. View/edit own Booth and Exhibitor records (exhibitor:manage — own only)
2. View Lead captures from booth visits
3. Network with attendees

---

## 10. Impact Summary by Decision

| Decision | Navigation | Menus | Screens | Permissions | Workflows | Forms | Components |
|---|---|---|---|---|---|---|---|
| ROD-1 (Remove engagement) | Remove engagement item | Remove from all menus | Remove engagement pages; reclassify campaign under notification | No impact | Campaign workflow stays under notification | No change | Remove EngagementPage |
| ROD-3 (Permission scheme) | Permission gates menus | Show/hide by role | Gate screens by permission | **Major** — 23 permissions define all UI gates | No change | No new forms | PermissionGate, RoleGuard stabilized |
| ROD-5 (JWT permissions) | No impact | No impact | No impact | Minor — don't read JWT | No change | No change | JWT helper removed or fixed |
| ROD-9 (EventSettings) | No impact | No impact | Add Event Settings screen | event:manage gate | Event setup workflow adds settings step | EventSettingsForm added | EventSettingsForm new |
| ROD-10 (Embeddings) | No impact | No impact | Add graceful degradation to AI screens | No impact | No change | No change | SemanticSearch with fallback |
| ROD-11 (8 roles) | No impact | Minor — 8 role names confirmed | Role management shows 8 | No impact | No change | RoleSelector uses 8 roles | RoleSelector stabilized |
