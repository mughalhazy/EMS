Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Frontend Permission Matrix

> Derived from: 23-permission taxonomy (Phase 2.95 collapse, OCR-2) and rbac.service.ts.
> Documents every permission and its precise impact on UI behavior.
> 
> Source: `services/rbac/src/rbac.service.ts` PLATFORM_PERMISSIONS (12 governance)
> + Phase 2.95 collapse recommended domain permissions (11 domain) = 23 total.

## Permission Check Model

Per Phase 2.95 ROD-5 (RESOLVED): Permissions are resolved via DB lookup at request time.
Frontend must NOT read the `permissions` array from the JWT (it is always `[]`).

**Frontend permission resolution:**
1. After login: call `GET /v1/rbac/users/me/roles` → get role names
2. Derive UI visibility from role names using the matrices below
3. On `403` response from any API: show "Permission denied" state inline
4. On `401` response from any API: redirect to `/login`

---

## Governance Permissions (12 — from code)

### `user:read`
- **Description**: Read user profiles
- **UI elements shown**: User list table, user detail view, user search
- **Actions enabled**: View user details, search users by email/name
- **Routes gated**: `/admin/users`, `/admin/users/:id`
- **Assigned to**: tenant_admin, organizer, support

### `user:write`
- **Description**: Create and update users
- **UI elements shown**: Create user button, edit user form, password reset trigger
- **Actions enabled**: Create user, edit user profile, trigger password reset
- **Routes gated**: `/admin/users/new`, `/admin/users/:id/edit`
- **Assigned to**: tenant_admin

### `user:delete`
- **Description**: Delete or deactivate users
- **UI elements shown**: Deactivate/delete action on user row
- **Actions enabled**: Deactivate user account, delete user
- **Routes gated**: Action within `/admin/users/:id`
- **Assigned to**: tenant_admin

### `tenant:read`
- **Description**: Read tenant details
- **UI elements shown**: Tenant settings read-only view
- **Actions enabled**: View tenant name, plan, config
- **Routes gated**: `/admin/tenant` (read-only portion)
- **Assigned to**: tenant_admin

### `tenant:write`
- **Description**: Update tenant settings
- **UI elements shown**: Tenant settings edit form, save button
- **Actions enabled**: Update tenant name, branding, configuration
- **Routes gated**: `/admin/tenant` (edit form)
- **Assigned to**: tenant_admin

### `tenant:suspend`
- **Description**: Suspend a tenant
- **UI elements shown**: Suspend tenant button (dangerous action with confirmation)
- **Actions enabled**: Suspend/unsuspend tenant
- **Routes gated**: Action within `/admin/tenant`
- **Assigned to**: tenant_admin

### `sso:manage`
- **Description**: Manage tenant SSO connections
- **UI elements shown**: SSO configuration section, provider list, add/edit/delete SSO connection
- **Actions enabled**: Create OAuth2/SAML connection, test SSO, delete SSO connection
- **Routes gated**: `/admin/sso`, `/admin/sso/new`, `/admin/sso/:id`
- **Assigned to**: tenant_admin

### `role:read`
- **Description**: Read roles and permissions
- **UI elements shown**: Role list, role detail (read-only)
- **Actions enabled**: View all roles and their permissions
- **Routes gated**: `/admin/roles`, `/admin/roles/:id`
- **Assigned to**: tenant_admin, organizer

### `role:write`
- **Description**: Create and update roles
- **UI elements shown**: Create role button, edit role form, permission checkboxes
- **Actions enabled**: Create custom role, edit role name, assign permissions to role
- **Routes gated**: `/admin/roles/new`, `/admin/roles/:id/edit`
- **Assigned to**: tenant_admin

### `role:assign`
- **Description**: Assign roles to users
- **UI elements shown**: Role assignment control on user detail page, role selector
- **Actions enabled**: Assign any role to a user
- **Routes gated**: Action within `/admin/users/:id`
- **Assigned to**: tenant_admin

### `role:revoke`
- **Description**: Revoke roles from users
- **UI elements shown**: Remove role badge/button on user detail page
- **Actions enabled**: Remove a role from a user
- **Routes gated**: Action within `/admin/users/:id`
- **Assigned to**: tenant_admin

### `audit:read`
- **Description**: Read audit logs
- **UI elements shown**: Audit log table with filters (event type, actor, date range)
- **Actions enabled**: View audit log, filter, export
- **Routes gated**: `/admin/audit`
- **Assigned to**: tenant_admin, finance, support

---

## Domain Permissions (11 — recommended, OCR-2)

### `event:manage`
- **Description**: Create, update, publish, archive, cancel events
- **UI elements shown**: Create event button, edit form, publish/archive/cancel action buttons, event status controls
- **Actions enabled**: Create event, edit event details, publish event, go live, archive, cancel
- **Routes gated**: `/events/new`, `/events/:id/edit`, `/events/:id/settings`; publish/archive/cancel actions within `/events/:id`
- **Hidden from**: exhibitor, speaker, onsite_staff, attendee, finance, support
- **Assigned to**: organizer, tenant_admin

### `agenda:manage`
- **Description**: Create, update, delete sessions and tracks
- **UI elements shown**: Add session button, add track button, edit/delete session actions
- **Actions enabled**: Create session, edit session, delete session, create track, edit track
- **Routes gated**: `/events/:id/sessions/new`, `/events/:id/sessions/:sessionId/edit`, track management
- **Assigned to**: organizer, tenant_admin

### `speaker:manage`
- **Description**: Create, update, assign speakers to sessions
- **UI elements shown**: Add speaker button, assign speaker to session control, edit/delete speaker actions
- **Actions enabled**: Create speaker profile, edit speaker, assign to session, remove from session
- **Routes gated**: `/speakers/new`, `/speakers/:id/edit`, speaker assignment within session detail
- **Assigned to**: organizer, tenant_admin

### `attendee:manage`
- **Description**: Read and manage attendee records
- **UI elements shown**: Attendee list table with full details, edit attendee button, tag management
- **Actions enabled**: View attendee profiles, edit attendee details, manage attendee tags
- **Routes gated**: Full access to `/events/:id/attendees`, `/attendees/:id`
- **Note**: Without this permission, attendees can only see public attendee directory (networking context)
- **Assigned to**: organizer, support, onsite_staff, tenant_admin

### `registration:manage`
- **Description**: Approve, reject, cancel registrations
- **UI elements shown**: Registration status action buttons (Approve / Waitlist / Cancel), registration detail with all fields
- **Actions enabled**: Approve registration, move to waitlist, cancel registration, view all registration answers
- **Routes gated**: Full access to `/events/:id/registrations`, registration actions within detail view
- **Assigned to**: organizer, support, tenant_admin

### `exhibitor:manage`
- **Description**: Create and manage exhibitor/booth/sponsor records
- **UI elements shown**: Add exhibitor button, add sponsor button, booth assignment controls, edit/delete actions
- **Actions enabled**: Create exhibitor, create sponsor, manage booth, assign sponsor package
- **Routes gated**: `/events/:id/exhibitors/new`, edit/delete actions; **Exhibitors** see only their own records (row-level scope)
- **Assigned to**: organizer, exhibitor (own records), tenant_admin

### `commerce:manage`
- **Description**: Create and manage orders, tickets, pricing, inventory
- **UI elements shown**: Create ticket product button, pricing rule form, promo code management, order management actions (refund, cancel)
- **Actions enabled**: Create/edit ticket products, set pricing rules, create promo codes, view all orders, process refunds
- **Routes gated**: `/events/:id/tickets/new`, `/events/:id/pricing`, `/events/:id/promo-codes`, order management actions
- **Assigned to**: organizer, finance, tenant_admin

### `onsite:operate`
- **Description**: Check-in, badge printing, device session operations
- **UI elements shown**: Check-in station controls, scan badge button, print badge button, device session management
- **Actions enabled**: Create CheckIn record, print badge, manage device sessions
- **Routes gated**: `/events/:id/onsite/checkin`, `/events/:id/onsite/badges`, `/events/:id/onsite/devices`
- **Assigned to**: onsite_staff, organizer, tenant_admin

### `analytics:read`
- **Description**: Read analytics dashboards and metrics
- **UI elements shown**: Analytics dashboard with all charts, KPI cards, export buttons
- **Actions enabled**: View attendee metrics, revenue metrics, engagement metrics, export data
- **Routes gated**: `/analytics`, `/events/:id/analytics`
- **Assigned to**: organizer, finance, support, tenant_admin

### `campaign:manage`
- **Description**: Create, schedule, and send campaigns
- **UI elements shown**: Create campaign button, send/schedule controls, audience segment builder
- **Actions enabled**: Create campaign, create audience segment, schedule campaign, send immediately, view send history
- **Routes gated**: `/campaigns/new`, `/campaigns/:id/edit`, `/campaigns/:id/send`, `/audience-segments/new`
- **Assigned to**: organizer, tenant_admin

### `integration:manage`
- **Description**: Create and manage webhook subscriptions
- **UI elements shown**: Webhook subscription list, create webhook button, test/delete webhook actions
- **Actions enabled**: Create webhook subscription, view webhook deliveries, test webhook endpoint, delete webhook
- **Routes gated**: `/integrations`, `/integrations/new`, `/integrations/:id`
- **Assigned to**: tenant_admin

---

## Permission-to-Role Matrix

| Permission | tenant_admin | organizer | finance | support | exhibitor | speaker | onsite_staff | attendee |
|---|---|---|---|---|---|---|---|---|
| user:read | ✅ | ✅ | — | ✅ | — | — | — | — |
| user:write | ✅ | — | — | — | — | — | — | — |
| user:delete | ✅ | — | — | — | — | — | — | — |
| tenant:read | ✅ | — | — | — | — | — | — | — |
| tenant:write | ✅ | — | — | — | — | — | — | — |
| tenant:suspend | ✅ | — | — | — | — | — | — | — |
| sso:manage | ✅ | — | — | — | — | — | — | — |
| role:read | ✅ | ✅ | — | — | — | — | — | — |
| role:write | ✅ | — | — | — | — | — | — | — |
| role:assign | ✅ | — | — | — | — | — | — | — |
| role:revoke | ✅ | — | — | — | — | — | — | — |
| audit:read | ✅ | — | ✅ | ✅ | — | — | — | — |
| event:manage | ✅ | ✅ | — | — | — | — | — | — |
| agenda:manage | ✅ | ✅ | — | — | — | — | — | — |
| speaker:manage | ✅ | ✅ | — | — | — | — | — | — |
| attendee:manage | ✅ | ✅ | — | ✅ | — | — | ✅ | — |
| registration:manage | ✅ | ✅ | — | ✅ | — | — | — | — |
| exhibitor:manage | ✅ | ✅ | — | — | ✅* | — | — | — |
| commerce:manage | ✅ | ✅ | ✅ | — | — | — | — | — |
| onsite:operate | ✅ | ✅ | — | — | — | — | ✅ | — |
| analytics:read | ✅ | ✅ | ✅ | ✅ | — | — | — | — |
| campaign:manage | ✅ | ✅ | — | — | — | — | — | — |
| integration:manage | ✅ | — | — | — | — | — | — | — |

*exhibitor gets `exhibitor:manage` scoped to own records only (row-level tenantId + exhibitorId filter)

---

## UI Patterns for Permission Enforcement

| Pattern | When to use |
|---|---|
| **Hide section** | User role never has access to this section (e.g., hide Admin nav for non-admin) |
| **Disable button** | User is in the right section but lacks write permission (e.g., finance sees Orders but cannot refund) |
| **403 inline state** | API returns 403 — show "You don't have permission" inside the content area |
| **Redirect to dashboard** | User navigates directly to a gated route — redirect to `/dashboard` with toast: "Access denied" |
| **Row-level scope** | Exhibitor sees `/exhibitors` but API filters to their records only — no frontend filtering needed |

## Notes on Roles Without Domain Permissions

Roles `speaker`, `attendee` receive zero platform/domain permissions. Their access is:
- Authenticated routes that are not permission-gated (networking, search, own profile)
- Own-data endpoints that filter by the authenticated user's ID (e.g., `GET /v1/registrations?userId=me`, `GET /v1/tickets?userId=me`)
- These routes do not appear in the permission matrix because they are authentication-only (JwtAuthGuard)
