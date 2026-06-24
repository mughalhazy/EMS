Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Frontend Component Inventory

> Identifies all reusable UI components required to implement the frontend.
> Derived from screen patterns, form definitions, table structures, and state
> variations across all 28 screen types. No invented components — every
> component is justified by at least one screen.

## Component Categories

1. Layout Components
2. Navigation Components
3. Auth Components
4. Data Display Components
5. Form Components
6. Feedback Components
7. Domain-Specific Components
8. Permission / Role Guard Components

---

## 1. Layout Components

| Component | Purpose | Used by |
|---|---|---|
| `AppShell` | Main authenticated layout — sidebar + topbar + content area | All authenticated screens |
| `PublicShell` | Unauthenticated layout — centered card container | S-01, S-02, S-03, S-04, S-05, S-06 |
| `EventContextHeader` | Event name breadcrumb + status badge — appears above event-scoped screens | All `/events/:id/*` screens |
| `SidebarNav` | Primary sidebar navigation with role-based visibility | All authenticated screens |
| `PageHeader` | Page title + action buttons row | All management screens |
| `ContentCard` | Bordered content container with optional header | Widely used |
| `TwoColumnLayout` | 2:1 split layout for detail+sidebar pattern | S-09, S-13, S-15, S-27 |

---

## 2. Navigation Components

| Component | Purpose | Used by |
|---|---|---|
| `NavItem` | Single sidebar navigation item with icon and active state | `SidebarNav` |
| `NavGroup` | Collapsible group of NavItems | `SidebarNav` |
| `Breadcrumbs` | Page location trail | All screens with nested routes |
| `Tabs` | Horizontal tab bar for content switching within a screen | S-09, S-13, Speaker detail |
| `BackButton` | Navigate up one level | Detail screens |

---

## 3. Auth Components

| Component | Purpose | Used by |
|---|---|---|
| `LoginForm` | Email/password login form | S-01 |
| `RegisterForm` | New account registration form | S-02 |
| `ForgotPasswordForm` | Email-only reset request form | S-03 |
| `ResetPasswordForm` | New password + confirm form | S-03 |
| `SSOButton` | Provider-labeled SSO redirect button | S-01 |
| `AuthGuard` | Route wrapper — redirects to `/login` on 401 | All authenticated routes |

---

## 4. Data Display Components

### Tables

| Component | Purpose | Used by |
|---|---|---|
| `DataTable` | Sortable, paginated, filterable table with column definitions | S-08, S-14, S-20, S-22, S-25, S-27 |
| `DataTableRow` | Individual row — supports click-to-navigate | `DataTable` |
| `DataTablePagination` | Page-based pagination controls (`?page=&limit=`) | `DataTable` |
| `DataTableFilters` | Filter bar (status, date range, search input) | `DataTable` |

### Cards / Tiles

| Component | Purpose | Used by |
|---|---|---|
| `KPICard` | Single metric with label, value, and optional trend | All dashboards |
| `EventCard` | Event summary tile — name, dates, status, thumbnail | S-07 (upcoming events), S-08 |
| `SpeakerCard` | Speaker profile thumbnail — name, bio excerpt, photo | Speaker list |
| `AttendeeCard` | Attendee profile card for networking directory | S-25 |

### Feeds / Lists

| Component | Purpose | Used by |
|---|---|---|
| `ActivityFeed` | Scrollable time-ordered event list | D-01, D-05 (recent registrations, audit) |
| `CheckInFeed` | Live auto-refreshing check-in list | D-03 |

### Charts

| Component | Purpose | Used by |
|---|---|---|
| `LineChart` | Time-series data (registrations, users over time) | S-18, D-05 |
| `BarChart` | Categorical comparison (revenue by event, sessions by track) | S-18 |
| `PieChart` | Proportion display (ticket type breakdown, registration status distribution) | D-02, S-18 |
| `GaugeChart` | 0–100% metric (check-in rate, confirmed rate) | D-03 |

### Status / Metadata

| Component | Purpose | Used by |
|---|---|---|
| `StatusBadge` | Color-coded status pill | Event status, registration status, order status |
| `PermissionBadge` | Permission code display | S-21 role detail |
| `RoleBadge` | Role name pill | S-20 user detail |
| `TagPill` | Attendee tag display | Attendee profile |
| `QRCode` | QR code display from ticket token | S-24 My Tickets |
| `CopyableText` | Text with copy-to-clipboard button | Webhook URL, API keys |

---

## 5. Form Components

### Inputs

| Component | Purpose | Used by |
|---|---|---|
| `TextInput` | Single-line text field with label and validation | All forms |
| `TextArea` | Multi-line text field | Event description, campaign body, speaker bio |
| `NumberInput` | Numeric input with optional min/max | Ticket quantity, max capacity, price |
| `DateTimePicker` | Date + time selector | Event dates, session times, registration open/close, campaign schedule |
| `ToggleSwitch` | Boolean on/off | requiresApproval, active status |
| `SelectInput` | Single-select dropdown | Status filter, track selector, venue selector |
| `MultiSelect` | Multi-select dropdown | Webhook event types, permission checkboxes |
| `SearchInput` | Text input with debounced search | Attendee search, speaker search |
| `PasswordInput` | Masked text field with visibility toggle | Login, register, webhook secret |
| `URLInput` | Text input with URL format validation | Webhook target URL |
| `JSONEditor` | Raw JSON editor for advanced config | Branding config (EventSettings) |
| `ImageUpload` | File upload with preview | Event banner, speaker photo |
| `PromoCodeInput` | Promo code entry with apply button | S-06 Checkout |

### Selectors

| Component | Purpose | Used by |
|---|---|---|
| `RoleSelector` | Role picker (8 system roles + custom) | S-20 user role assignment |
| `PermissionCheckboxGroup` | Permission selection for custom roles | S-21 role edit |
| `SpeakerSearchSelect` | Search-as-you-type speaker picker | S-13 assign speaker |
| `AudienceSegmentSelect` | Segment picker for campaigns | S-19 create campaign |
| `EventTypeMultiSelect` | 64-event-type multi-select for webhooks | S-27 create webhook |

### Forms (composite)

| Component | Purpose | Used by |
|---|---|---|
| `EventForm` | Full event creation/edit form | S-10 |
| `EventSettingsForm` | Settings fields (5 fields) | S-11 |
| `SessionForm` | Session creation/edit form (title, times, room, track) | S-13 |
| `SpeakerForm` | Speaker profile form | Speaker create/edit |
| `RegistrationForm` | Dynamic field form based on RegistrationField config | S-05 |
| `TicketProductForm` | Ticket product create/edit | Ticketing |
| `PricingRuleForm` | Pricing rule definition | Pricing |
| `CampaignForm` | Campaign create/edit (name, body, segment, schedule) | S-19 |
| `AudienceSegmentForm` | Segment filter builder | Audience segments |
| `WebhookForm` | Webhook create form (URL, events, secret) | S-27 |
| `UserForm` | User invite/edit form | S-20 |
| `RoleForm` | Custom role create/edit | S-21 |
| `TenantSettingsForm` | Tenant name, branding, configuration | Admin |
| `SSOConnectionForm` | OAuth2/SAML provider configuration | S-28 |
| `CheckoutForm` | Ticket selector + payment form | S-06 |

---

## 6. Feedback Components

| Component | Purpose | Used by |
|---|---|---|
| `Toast` | Transient success/error/info notification | All mutating actions |
| `AlertBanner` | Persistent warning/info bar | Pending approvals alert, DLQ warning |
| `ConfirmationModal` | Destructive action confirmation dialog | Delete, cancel, suspend, refund |
| `EmptyState` | Illustrated empty content area with CTA | All list/table screens when empty |
| `ErrorState` | API error display with retry button | All data-fetching screens |
| `LoadingSkeleton` | Placeholder content during data fetch | All screens with async data |
| `ProgressBar` | Linear progress for multi-step forms | S-05 Public Registration, S-06 Checkout |
| `Spinner` | Inline loading indicator | Buttons, search results |

---

## 7. Domain-Specific Components

| Component | Purpose | Used by |
|---|---|---|
| `EventStatusControls` | Publish / Go Live / Archive / Cancel action buttons based on current status | S-09 |
| `RegistrationStatusActions` | Approve / Waitlist / Cancel buttons based on current status | S-15 |
| `OrderStatusBadge` | pending / paid / fulfilled / cancelled / refunded | Order screens |
| `AgendaGrid` | Visual time/track grid layout for sessions | S-12 |
| `SessionBlock` | Draggable session block in agenda grid | S-12 |
| `CheckInScanner` | QR code scan interface (camera or manual input) | S-16 |
| `CheckInResult` | Large success/failure result display after check-in | S-16 |
| `BadgePreview` | Badge layout preview before printing | S-16, badge management |
| `TicketQRDisplay` | Full-screen QR code for ticket presentation | S-24 |
| `ConnectionRequestCard` | Attendee card with Accept/Decline actions | S-25 |
| `PollWidget` | Active poll with answer options (real-time) | Attendee participation |
| `QASubmitForm` | Question submission for live Q&A | Attendee participation |
| `SurveyForm` | Multi-question survey completion form | Attendee participation |
| `AuditLogRow` | Formatted audit event with actor, action, timestamp | S-22 |
| `WebhookDeliveryRow` | Delivery attempt status and payload preview | S-27 |

---

## 8. Permission / Role Guard Components

| Component | Purpose | Used by |
|---|---|---|
| `RoleGuard` | Wraps content — renders children only if user has one of the specified roles | Navigation items, action buttons, sections |
| `PermissionGate` | Wraps content — renders children only if user has the specified permission | Individual action buttons (after OCR-2 lands) |
| `ForbiddenPage` | Full-page "Access denied" state for direct route access | gated routes on unauthorized access |
| `PermissionDeniedInline` | Inline "You don't have permission" state within a content area | 403 API responses within a page |

---

## Component Count Summary

| Category | Count |
|---|---|
| Layout | 7 |
| Navigation | 5 |
| Auth | 6 |
| Data Display | 18 |
| Form (inputs + selectors + composites) | 36 |
| Feedback | 7 |
| Domain-specific | 17 |
| Permission / Role Guards | 4 |
| **Total** | **100** |
