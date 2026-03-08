# EMS — Build Log
> Chronological. Oldest at top, newest at bottom.
> Resume: Read CLAUDE.md and PROGRESS.md, then await instructions.

---

## [1] Foundation
- Read backend docs: product.md, architecture.md, domain-model.md, api-standards.md, service-map.md
- Loaded design language from ems/design-language/design-language.html
- Repo at C:/EMS/ — retention: CLAUDE.md + PROGRESS.md + git commits

---

## [2] Frontend Scaffold — `ems/apps/web/`
- package.json, tsconfig.json, next.config.ts, .env.local.example
- styles/tokens.css, styles/globals.css, styles/components.css
- types/domain.ts, types/api.ts
- services/api.ts, auth, events, agenda, speakers, attendees, registrations, ticketing, orders, payments, fulfillment, sponsors, exhibitors, analytics, notifications, tenant (16 total)
- components/ui: Button, Badge, Input, KpiCard, StatusChip, DataTable, AlertCard + index.ts
- components/nav: Sidebar, TopBar
- layouts/AppLayout, PortalLayout, AuthLayout
- app routes (19): root, login, dashboard, events, events/[id], agenda, speakers, attendees, registrations, ticketing, sponsors, exhibitors, analytics, notifications, settings, portal

---

## [3] Design Language Artifacts
- tailwind.config.js, postcss.config.js
- styles/tokens.css updated with Tailwind directives
- design-language/wireframes/: _base.css, dashboard.html, events.html, ticketing.html, registration.html, agenda.html, exhibitors.html, attendee-portal.html, admin-console.html

---

## [4] UI Renderer — `ems/apps/web/renderer/`
- types/wireframe.ts, types/component.ts, types/output.ts
- catalog/ComponentCatalog.ts
- core/WireframeParser.ts, ComponentResolver.ts, LayoutEngine.ts, TokenResolver.ts, Validator.ts, RendererEngine.ts
- pipeline/steps/step1–7, pipeline/Pipeline.ts
- components/RenderedPage.tsx, RenderedRegion.tsx, RenderedBlock.tsx
- index.ts, renderer.css
- samples/dashboard.wireframe.json

---

## [5] Reusable UI Components — `ems/apps/web/components/ui/`

| Component | File | Status |
|-----------|------|--------|
| Button | Button.tsx + module.css | pre-existing, kept as is |
| Badge | Badge.tsx + module.css | pre-existing, kept as is |
| Input | Input.tsx + module.css | pre-existing, kept as is |
| Card | Card.tsx + module.css | new — header (title + actions slot), body, flush variant |
| Modal | Modal.tsx + module.css | new — backdrop, dialog (sm/md/lg), header, scrollable body, footer slot, ESC + click-outside close, body scroll lock, focus, mobile bottom sheet |
| Avatar | Avatar.tsx + module.css | new — initials or img, 6 color variants, 3 sizes (sm/md/lg) |
| DataTable | DataTable.tsx + module.css | enhanced — skeleton fixed (no gradient literals), footer slot added |
| index.ts | — | updated with Card, Modal, Avatar exports |

---

## [6] Base Layouts — `ems/apps/web/layouts/`
- AppLayout.tsx + module.css — enhanced: height:100vh, overflow:hidden shell
- DashboardLayout.tsx + module.css — TopBar + banner slot + two-col (1fr | 320px panel)
- EventLayout.tsx + module.css — TopBar + optional subnav + optional filter bar + content
- AdminLayout.tsx + module.css — portal surface: dark ink header, horizontal tab nav, centered 1200px body
- layouts/index.ts
- dashboard/page.tsx and events/page.tsx migrated to new layouts

---

## [7] UI Component Audit — `ems/apps/web/components/ui/`
Full audit against design-language tokens. All 7 requested components confirmed present and on-spec.

| Component | Variants / Features |
|-----------|---------------------|
| Button | primary / forest / indigo / ghost / soft; sm/md/lg; loading spinner |
| Badge | forest / amber / brick / indigo / gold / teal / neutral; pill shape |
| Input | label, error, hint; indigo focus ring; brick error state |
| Card | header (title + actions slot); body; flush variant |
| Modal | portal; ESC + click-outside close; scroll lock; focus trap; sm/md/lg; mobile bottom sheet |
| Avatar | initials or img; 6 colors + neutral; sm/md/lg |
| DataTable | typed columns; opacity-pulse skeleton; empty state; footer slot; row click |

- index.ts exports all 10 components (above 7 + StatusChip, KpiCard, AlertCard) with full type re-exports
- No changes required — all components on-token, production-ready

---

## [8] Frontend API Services — `ems/apps/web/services/`
All 6 requested services audited against api-standards.md + domain-model.md + service-map.md. Gaps filled.

| Service | Added |
|---------|-------|
| `auth.service.ts` | `changePassword`, `forgotPassword`, `resetPassword` |
| `events.service.ts` | `remove` (DELETE); `listVenues`, `createVenue` sub-resource |
| `ticketing.service.ts` | `CreateTicketPayload`/`UpdateTicketPayload` types; `remove`; `availability` |
| `registrations.service.ts` | `confirm` transition; `checkin`; status filter on `list`; caller-supplied idempotencyKey |
| `attendees.service.ts` | `create`, `update`; `AttendeeStatus` filter on `list` |
| `analytics.service.ts` | `FunnelMetrics` type + `funnelMetrics`; `TenantKpis` type + `tenantKpis` |

Base client (`api.ts`), domain types (`types/domain.ts`), and API types (`types/api.ts`) unchanged — already correct.

---

## [9] Organizer Dashboard UI — 5 pages

| Page | Route | Key Features |
|------|-------|-------------|
| Dashboard | `/dashboard` | `tenantKpis` + recent events right panel; 6 KPI cards; live alert banner |
| Events | `/events` | NEW page.tsx; status filter tabs (All/Draft/Published/Live/Archived); DataTable; row → `/events/:id` |
| Ticketing | `/ticketing` | Event selector dropdown; ticket inventory table (price, total/sold/available, status, sales window) |
| Registrations | `/registrations` | Event selector + status filter tabs; approve / confirm / cancel row actions wired to service |
| Analytics | `/analytics` | Event selector; 6 KPI cards; revenue by ticket type + checkout funnel + attendance by day tables |

**Patterns used across all pages:**
- `'use client'` + `useEffect`/`useState` for data fetching with loading states
- `Card flush` wrapping `DataTable` for edge-to-edge tables
- Shared styled `<select>` with SVG chevron (design token colors) for event selector
- Filter button row (pill tabs) using `--ink`/`--surface` tokens
- All `.module.css` files rewritten: `height:100%` + `overflow:hidden` shell, `overflow-y:auto` scroll body

---

## [10] Attendee Portal — 5 pages + layout

| Page | Route | Key Features |
|------|-------|-------------|
| Events | `/attendee/events` | 3-col card grid; search + status filter tabs (All/Published/Live/Upcoming); skeleton loading |
| Event Detail | `/attendee/event/[id]` | Parallel fetch event+sessions+speakers; 3 tabs (overview/sessions/speakers); hero panel; session timeline grouped by date; speaker grid |
| Schedule | `/attendee/schedule` | Event selector; timeline view; sessions grouped by date; time gutter (start→line→end); duration + capacity |
| Networking | `/attendee/networking` | Event selector + search; attendee directory grouped A–Z by last name; deterministic avatar colors; checked_in/registered badges |
| Profile | `/attendee/profile` | `authService.me()`; edit/view toggle (firstName/lastName/email); registration list with status badge; skeleton loading |

**Layout:** `AttendeeLayout` — sticky horizontal nav, forest gradient logomark, 4 nav links with `usePathname` active state, avatar button → profile.

**Route group:** `app/(attendee)/` with server component `layout.tsx` wrapping `<AttendeeLayout>`.

**Patterns:** deterministic avatar color (`charCodeAt(0) % 6`), `groupByDate()` for timeline/schedule, styled native `<select>` with SVG chevron data URI, `useMemo` for client-side filtering/grouping.

---

## [11] Admin Console — 4 pages + service

| Page | Route | Key Features |
|------|-------|-------------|
| Users | `/admin/users` | All platform users cross-tenant; search + status filter (All/Active/Invited/Disabled); Avatar+Name cell; tenant tag; enable/disable row action |
| Tenants | `/admin/tenants` | Stat summary row (Total/Active/Suspended); status filter tabs; DataTable with slug, event/user counts; suspend/activate action |
| Events | `/admin/events` | Cross-tenant event list; tenant selector + status tabs + search; live-now pulse pill; attendee count column |
| System | `/admin/system` | Platform metrics (6 cards: req/min, error rate, p95 latency, active sessions, kafka lag, cache hit); service health grid (3-col) with colored status dot + left-border accent, latency, uptime; overall status pill; manual refresh |

**New service:** `services/admin.service.ts` — `AdminTenant`, `AdminUser`, `AdminEvent`, `SystemMetrics`/`ServiceHealth` types; listTenants/Users/Events (paginated), suspend/activate tenant, enable/disable user, systemHealth.

**Route group:** `app/(admin)/` with server component `layout.tsx` wrapping `<AdminLayout>`.

**Patterns:** status-color-tinted left border accent on service cards, conditional metric color based on threshold (error rate > 1% → brick, latency > 500ms → amber), animated live pulse dot, useCallback for refreshable data fetch.

---

## [12] Development Seed Data — `ems/infra/scripts/seed/`

**Files:** `seed.sql` (main), `seed.sh` (shell wrapper with postgres readiness check)

**Records seeded:**

| Table | Records | Notes |
|-------|---------|-------|
| `tenants` | 1 | Acme Events Co. (slug: `acme`) |
| `users` | 10 | 8 active + 2 invited; emails `alice`–`jack` @acme.dev |
| `auth_credentials` | 8 | bcrypt via pgcrypto `crypt()`. Password: `DevSeed2026!` |
| `auth_user_state` | 8 | All active users email-verified |
| `roles` | 3 | tenant_admin / event_manager / checkin_staff |
| `user_role_assignments` | 6 | Alice+Bob = admin; Carol–Eve = manager; Frank = checkin |
| `events` | 3 | TechConf 2026 (live), DevSummit 2026 (published), Design Week 2025 (archived) |
| `venues` | 3 | Moscone Center (physical), Hopin (virtual), Design Hub Chicago (physical) |
| `sessions` | 25 | 13 TechConf + 6 DevSummit + 6 Design Week; realistic titles + abstracts |
| `speakers` | 8 | 4 TechConf + 2 DevSummit + 2 Design Week; confirmed status |
| `inventory_items` | 5 | One per ticket type; reserved_quantity reflects current sales |
| `tickets` | 5 | General $299, VIP $799, Standard $199, Workshop $99, All Access $149 |
| `attendees` | 18 | 10 TechConf + 5 DevSummit + 3 Design Week; mix of linked/external |
| `registrations` | 17 | Mix of confirmed/approved/pending across all events |
| `event_analytics` | 51 | TechConf: 30 daily snapshots (growth model); DevSummit: 14 days; Design Week: 5 event-day rows |

**Key design decisions:**
- All UUIDs fixed (prefixed pattern) → seed is idempotent, `ON CONFLICT DO NOTHING` everywhere
- Ticketing tables (`inventory_items`, `tickets`) wrapped in `DO $$ ... EXCEPTION WHEN undefined_table` — graceful fallback if app hasn't synced schema yet
- TechConf analytics use `generate_series` + polynomial formula: `reg(d) = ROUND(3 + 5d + 0.1d²)`, check-ins ramp 90/day from Mar 5
- Today = Mar 7 2026: TechConf is live (days 1–2 completed, day 3 in progress), DevSummit published, Design Week archived

---

## [13] Build & Deploy — `ems/apps/web/`

| File | Change |
|------|--------|
| `next.config.ts` | `output: 'standalone'`; `NEXT_PUBLIC_API_URL` guarded with `?? 'http://localhost:3001'` fallback (prevents `undefined/api/v1/*` rewrite in CI) |
| `Dockerfile` | Multi-stage: `deps` (npm ci) → `builder` (next build, ARG for API URL) → `runner` (standalone, non-root `nextjs` user, port 3000) |
| `.dockerignore` | Excludes `node_modules`, `.next`, `.env*` from build context |
| `render.yaml` | Render Blueprint — `ems-web` Docker web service; `NEXT_PUBLIC_API_URL` + `NEXT_PUBLIC_APP_URL` env vars; `autoDeploy: true` |
| `.env.local.example` | Documented all public env vars with descriptions |
| `public/.gitkeep` | Created `public/` dir (required by Dockerfile COPY) |

**Key decisions:**
- `NEXT_PUBLIC_API_URL` is both an ARG (baked into bundle at build) and an ENV (available at runtime for server-side rewrites)
- Standalone output bundles only required files — image ~200MB vs ~1GB full `node_modules`
- Render's Docker runtime reads the same `Dockerfile`; env vars set in dashboard override build-time defaults

---

## [14] Render Deployment — `https://ems-web-b233.onrender.com`

| Item | Value |
|------|-------|
| Service ID | `srv-d6lq8hdactks73fm2bpg` |
| Project | `prj-d6lnsl75gffc73b0ip90` |
| Runtime | Node.js (native, not Docker) |
| Build command | `cd ems/apps/web && npm install && npm run build` |
| Start command | `cd ems/apps/web && npm start` |
| Health check | `/login` |
| Region | Oregon (free tier) |

**Key fixes applied during deployment:**
- `next.config.ts` → `next.config.js` (CJS `module.exports`) — SWC not available in Render build env
- Removed `output: 'standalone'` — native Node runtime does not copy `.next/static` into standalone dir
- `rootDir: ""` + explicit `cd ems/apps/web &&` prefix — more reliable than Render's rootDir field
- Health check `/login` (root `/` returns 307 → health check failure)
- Removed all `NEXT_PUBLIC_*` env vars from Render dashboard — changing them invalidates build cache

---

## [15] Stub Pages Wired — all 7 nav destinations

| Page | Key Features |
|------|-------------|
| Agenda | Event selector; status filter tabs (All/Scheduled/Completed/Draft/Cancelled); session columns: title, type, date+time, duration, capacity, status |
| Speakers | Event selector; status filter (All/Confirmed/Invited/Declined/Withdrawn); Avatar cell with bio |
| Attendees | Event selector; status filter (All/Registered/Checked In/Prospect/Cancelled); count badge |
| Sponsors | Event selector; status filter; org ID, tier (gold/silver/bronze badge), amount, status |
| Exhibitors | Event selector; status filter; org ID, booth code, booth size, status |
| Notifications | Status filter only (no event selector); channel, template (mono), subject, status, sentAt |
| Settings | Tab layout (Account/Team); Account: workspace + platform info Cards; Team: User DataTable with Avatar |

---

## [16] Mock API — seed data served by Next.js route handlers

**Root cause fixed:** `API_BASE` defaulted to `http://localhost:3001`, baked into client bundle at build — all browser fetches hit a nonexistent server on Render.

**Fix:**
- `services/api.ts` — `API_BASE` default changed from `'http://localhost:3001'` to `''` (relative URLs)
- `next.config.js` — rewrites only activate when `NEXT_PUBLIC_API_URL` is explicitly set; otherwise internal handlers serve all data
- `lib/mock-data.ts` — full seed dataset: 3 events, 18 sessions, 8 speakers, 18 attendees, 17 registrations, 6 tickets, 7 sponsors, 4 exhibitors, 10 notifications, 10 users, 1 tenant, analytics KPIs
- `app/api/v1/[...path]/route.ts` — catch-all GET handler matching every endpoint used by the frontend services; POST/PATCH/PUT/DELETE return `{ ok: true, mock: true }`

---

## [17] UI Polish Pass — enterprise SaaS caliber

**Auth:**
- `AuthLayout` rewritten as split-screen: dark brand panel (ink bg + teal/indigo radial glows + dot-grid overlay) left, white form panel right
- Brand panel: teal logomark with shadow, tagline, 3 feature bullets with teal dots
- Mobile: brand panel hidden, form becomes centered card with embedded wordmark

**Navigation:**
- Sidebar: user identity footer — `Avatar` + name + "Admin" role label; collapses to avatar-only
- Sidebar: unicode toggle arrows replaced with SVG chevrons
- TopBar: right-side user chip — `Avatar` + name + chevron; vertical separator from page actions

**Core components:**
- `KpiCard`: value 28px → 32px; border-top 3px → 4px; delta renders as colored pill (forest/brick/neutral bg)
- `DataTable` skeleton: opacity-pulse → shimmer gradient slide with staggered per-row delays
- `DataTable` empty state: SVG table icon in bordered box + bold title + descriptor text
- `Button`: removed `translateY(-1px)` hover jump — shadow elevation only
- `AlertCard`: live dot upgraded to outward-expanding ring pulse (sonar style)

**Page-level:**
- Content padding standardized: 24px → 20px across all 11 pages
- Toolbar horizontal padding: 16px → 20px (aligns with card edges)
- Dashboard KPI grid: added 1100px responsive breakpoint (3-col → 2-col)

---

## [18] Page Audit & Data Fixes

**Re-anchored to all 5 backend docs** (product.md, architecture.md, domain-model.md, api-standards.md, service-map.md) before audit.

**Fixes applied:**

| Issue | Fix |
|-------|-----|
| `/events/[id]` placeholder | Full event detail page: header card (code, status, description, dates, timezone) + Sessions DataTable + Speakers DataTable |
| Events status filter tabs did nothing | Mock route `/events` now reads `?status=` query param and filters |
| Sponsors showed raw `organizationId` | Page loads `/organizations`, builds `orgId → name` map, renders org name |
| Exhibitors showed raw `organizationId` | Same pattern as sponsors |
| Registrations showed truncated IDs | Parallel-loads attendees + tickets per event; renders attendee full name + ticket type name |

---

## [19] UI Polish — Design Language Audit

**Re-anchored to all 5 backend docs** before starting. Full sweep of all CSS modules against `ems/design-language/design-language.html` as source of truth.

**Fixes applied (12 files):**

| File | Violation | Fix |
|------|-----------|-----|
| `Button.module.css` | `border: 1px solid` | → `1.5px solid` (spec) |
| `Badge.module.css` | `border: 1px solid` on all variants | → `1.5px solid` (spec) |
| `AlertCard.module.css` | `border: 1px`, `radius: --radius`, `padding: 12px 16px` | → `1.5px`, `--radius-lg`, `14px 16px` |
| `Sidebar.module.css` | Active item: `ink`/`white` (master-nav pattern) | → `--i-lt`/`--i-dk` (app-nav spec) |
| `DataTable.module.css` | `th`/`td`/`footer` horizontal padding `16px` | → `20px` (aligns with content padding) |
| `KpiCard.module.css` | Off-grid padding `20px 22px 18px`; hover only `shadow-md` | → `20px` flat; hover `translateY(-3px)` + `shadow-lg` |
| `Input.module.css` | `border: 1px`; no default shadow | → `1.5px`; `box-shadow: var(--shadow-sm)` |
| `events/events.module.css` | Toolbar `padding: 12px 16px` | → `10px 20px` |
| `registrations/registrations.module.css` | Toolbar `padding: 12px 16px` | → `10px 20px` |
| `ticketing/ticketing.module.css` | Toolbar `padding: 12px 16px` | → `10px 20px` |
| `dashboard/dashboard.module.css` | KPI grid `gap: 14px` (off 8px grid) | → `16px` |
| `settings/settings.module.css` | Tabs `padding: 0 16px`; skeleton opacity-pulse | → `0 20px`; shimmer gradient |

**Commit:** `7cbc38b` — `fix(ui): design-language audit — token/spacing/state violations [19]`

---

## [20] Design System Reconciliation + Agenda/Events Rebuild

**Source hierarchy re-established:** `design-language.html` = single source of truth. `wireframes/_base.css` = prototype tool only. `components.css` was outdated — now reconciled.

**`styles/components.css` fixes (all derived from design-language.html):**

| Rule | Before | After |
|------|--------|-------|
| `.badge-*` borders | `1px solid` | `1.5px solid` |
| `.btn` border | `1px solid transparent` | `1.5px solid transparent` |
| `.input` border | `1px solid` (no shadow) | `1.5px solid` + `box-shadow: var(--shadow-sm)` |
| `.kpi-card` hover | `shadow-md` | `translateY(-3px)` + `shadow-lg` |
| `.kpi-card` transition | `box-shadow` only | `box-shadow, transform` |
| `.kpi-card.*` border-top | `3px solid` | `4px solid` |
| `.alert-card` radius | `var(--radius)` | `var(--radius-lg)` |
| `.alert-card` border | `1px solid` | `1.5px solid` |
| `.data-table th/td` padding | `10/12px 16px` | `10/12px 20px` |

**Batch padding fix across 10 page module.css files:**
- Content padding: `20px` → `24px`
- Toolbar padding: `10px 20px` → `14px 24px`
- Files: analytics, ticketing, notifications, sponsors, exhibitors, speakers, registrations, attendees, settings, events/[id]

**Agenda page — complete rebuild (DataTable → Schedule Grid):**
- Day tabs in toolbar with indigo active underline (from wireframe spec)
- Track legend (Keynote/Talk/Panel/Workshop/Networking) with colored 8×8 marker
- CSS grid schedule: 80px time column + N×1fr room columns
- Session blocks color-coded by type: keynote=indigo, talk=forest, panel=gold, workshop=teal, networking=amber
- Keynotes with no roomId span all room columns automatically
- Time slots computed dynamically from session startAt/endAt range
- "Publish Agenda" + "Add Session" action buttons in toolbar
- Empty/loading states handled

**Events page — card grid + view toggle:**
- Default view: 3-col card grid (per wireframe spec) with responsive 2-col/1-col breakpoints
- Card: name, status chip (1.5px border), date range, timezone, stats row, action buttons
- Draft cards: dashed border, `--surface` background, muted name color
- "Create new event" CTA card: indigo-lt dashed border with centered plus
- View toggle (Grid / List) in TopBar actions with `--border-strong` active state
- List view: retains existing DataTable with Badge status column
- Search input + status filter tabs + count in filter bar
- Hover: `translateY(-2px)` + `shadow-md`

---

## [21] Design Language Gap Fixes + Renderer Step 1

**Gap fixes (6 components):**

| Component | Fix |
|-----------|-----|
| `KpiCard.module.css` | Tinted-background architecture: `--*-lt` bg, `1.5px` all-around border, `color: inherit` on value, `::after` radial gradient accent |
| `Button.module.css` | `forest` base `--f-dk`; `ghost` white bg + `border-strong`; `soft` forest-tinted (`--f-lt/--f-dk/--f-border`); `translateY(-1px)` on solid hovers |
| `Badge.module.css` | `::before` 5×5px dot indicator; `:hover { transform: scale(1.04) }` |
| `TopBar.module.css` | Title `font-size: 16px` → `18px` |
| `DashboardLayout.module.css` | Body `padding: 20px` → `24px` |
| `Sidebar.module.css` | Logomark gradient teal → forest; `box-shadow` rgba literal → `var(--shadow-color-forest)` |

**Renderer Step 1 — Extend BlockType Schema:**

| File | Change |
|------|--------|
| `renderer/types/wireframe.ts` | Added `alert_banner`, `schedule_grid` to `BlockType` union |
| `renderer/types/component.ts` | Added `AlertBanner`, `ScheduleGrid` to `CanonicalComponent`; added `DEFAULT_SPANS` entries (both span 12) |
| `renderer/catalog/ComponentCatalog.ts` | Added `alert_banner` → `AlertBanner` entry; `schedule_grid` → `ScheduleGrid` entry |

**Added:** `PENDING-TASKS.md` — ordered implementation anchor (Steps 1–6) parallel to this file.

---

## [22] Wireframe JSON Documents — Step 2

All 12 `WireframeDocument` JSON files created at `ems/apps/web/renderer/samples/`.
Each is a valid document with `id`, `version`, `surface`, `meta`, and all required `regions`.
Status filter tabs derived directly from `domain-model.md` status enumerations.

| File | Template | Regions |
|------|----------|---------|
| `notifications.wireframe.json` | list_page | top, filters (status tab), primary (list_table) |
| `settings.wireframe.json` | dashboard_page | top, filters (tabs: Account/Team), primary (2 entity_cards + list_table) |
| `sponsors.wireframe.json` | list_page | top, filters (event selector + status tab), primary (list_table) |
| `exhibitors.wireframe.json` | list_page | top, filters (event selector + status tab), primary (list_table) |
| `speakers.wireframe.json` | list_page | top, filters (event selector + status tab), primary (list_table) |
| `attendees.wireframe.json` | list_page | top, filters (event selector + status tab), primary (list_table) |
| `registrations.wireframe.json` | list_page | top, filters (event selector + status tab), primary (list_table) |
| `ticketing.wireframe.json` | dashboard_page | top, filters (event selector), primary (4 metric_tiles + list_table) |
| `analytics.wireframe.json` | dashboard_page | top, filters (event selector), primary (6 metric_tiles + 3 list_tables) |
| `events.wireframe.json` | card_grid_page | top (header + view toggle), filters (search + status tab), primary (entity_card repeating + CTA) |
| `events-detail.wireframe.json` | detail_page | top (header + status_chip), primary (entity_card + 2 list_tables) |
| `agenda.wireframe.json` | schedule_page | top, filters (event selector + day tabs + 2 CTAs), primary (schedule_grid) |

**Domain anchors used:** entity statuses from `domain-model.md`; color semantics from DL (forest=positive, amber=warning, gold=finance, teal=live, indigo=data, brick=danger).

---

## [23] Wire COMPONENT_REGISTRY — Step 3

**File:** `ems/apps/web/renderer/components/RenderedBlock.tsx`

Populated `COMPONENT_REGISTRY` with `dynamic()` lazy imports for all currently built UI components:

| CanonicalComponent | Mapped to | Source file |
|--------------------|-----------|-------------|
| `StatCard` | `KpiCard` | `components/ui/KpiCard.tsx` |
| `DataTable` | `DataTable` | `components/ui/DataTable.tsx` |
| `EventCard` | `Card` | `components/ui/Card.tsx` |
| `Card` | `Card` | `components/ui/Card.tsx` |
| `Button` | `Button` | `components/ui/Button.tsx` |
| `EventStatusPill` | `StatusChip` | `components/ui/StatusChip.tsx` |
| `Badge` | `Badge` | `components/ui/Badge.tsx` |
| `Avatar` | `Avatar` | `components/ui/Avatar.tsx` |
| `Alert` | `AlertCard` | `components/ui/AlertCard.tsx` |
| `AlertBanner` | `AlertCard` | `components/ui/AlertCard.tsx` |
| `Modal` | `Modal` | `components/ui/Modal.tsx` |
| `Input` | `Input` | `components/ui/Input.tsx` |

Still resolving to `getComponent()` placeholder (not yet built): `Skeleton`, `EmptyState`, `Toast`, `Drawer`, `Popover`, `Tabs`, `CommandPalette`, `TenantSwitcher`, `VenueSelector`, `AttendeeList`, `ScheduleGrid`, `UnknownBlock`.

---

## [24] Data Bridge — Step 4

Threaded `data?: Record<string, unknown>` through the full renderer pipeline:

| File | Change |
|------|--------|
| `renderer/types/output.ts` | Added `data?` field to `PipelineContext` |
| `renderer/core/WireframeParser.ts` | `parseWireframe(doc, version, data?)` — sets `ctx.data` |
| `renderer/pipeline/steps/step1-normalize.ts` | `stepNormalize(doc, version, data?)` — forwards to parser |
| `renderer/pipeline/Pipeline.ts` | `runPipeline(doc, data?)` — forwards to step 1 |
| `renderer/core/RendererEngine.ts` | `render(doc, data?)` — forwards to pipeline |
| `renderer/pipeline/steps/step2-resolve-components.ts` | Data injection: if `block.props.dataKey` exists and `ctx.data[dataKey]` is defined, merges `{ data: ctx.data[dataKey], dataKey }` into `node.props` |
| `renderer/components/RenderedPage.tsx` | `data?: Record<string, unknown>` prop added; passed to `render()` |

**Usage pattern:**
```tsx
<RenderedPage wireframe={eventsWireframe} data={{ events: apiEvents, total: count }} />
// Block with props.dataKey="events" receives node.props.data = apiEvents
```

---

## [25] Page Migration — Step 5

All 13 pages migrated to renderer-first architecture. Each page is now a thin data-fetching shell feeding `<RenderedPage wireframe={...} data={...} />`.

**Pre-migration fixes:**
- `app/layout.tsx`: added `import '@/renderer/renderer.css'` — renderer grid/region styles were not applied globally
- `RenderedBlock.tsx`: `DataTable` removed from `COMPONENT_REGISTRY` — expects typed `Column<T>[]`, not wireframe string arrays; safely falls back to dev placeholder

**Migrated pages:**

| Page | Route | Data keys passed |
|------|-------|-----------------|
| Dashboard | `/dashboard` | `kpis`, `events`, `loading` + kpi spread |
| Events | `/events` | `events`, `loading` |
| Events Detail | `/events/[id]` | `event`, `sessions`, `speakers`, `loading` |
| Agenda | `/agenda` | `events`, `eventId`, `sessions`, `activeDay`, `days`, `loading` |
| Speakers | `/speakers` | `events`, `eventId`, `speakers`, `loading` |
| Attendees | `/attendees` | `events`, `eventId`, `attendees`, `loading` |
| Registrations | `/registrations` | `events`, `eventId`, `registrations`, `loading` |
| Ticketing | `/ticketing` | `events`, `eventId`, `tickets`, `totalSold`, `revenue`, `available`, `utilization`, `loading` |
| Sponsors | `/sponsors` | `events`, `eventId`, `sponsors`, `loading` |
| Exhibitors | `/exhibitors` | `events`, `eventId`, `exhibitors`, `loading` |
| Analytics | `/analytics` | `events`, `eventId`, all 6 KPI metrics, 3 table arrays, `loading` |
| Notifications | `/notifications` | `notifications`, `loading` |
| Settings | `/settings` | `workspace`, `users`, `loading` |

**Current renderer output per page:** registered blocks (Card, KpiCard, Button, Badge, AlertCard, Input, Avatar, StatusChip) render with wireframe props; DataTable and Tabs blocks show dev placeholders until Step 6 adapters are built. `showDebug` overlay active in development. `renderer.css` now globally available via root layout.

---

## [26] Step 6 — Missing UI Components

Built 5 new components and wired them into `COMPONENT_REGISTRY`:

| Component | File | Notes |
|-----------|------|-------|
| `EmptyState` | `components/ui/EmptyState.tsx` | SVG calendar icon + bold title + descriptor + optional CTA button |
| `Skeleton` | `components/ui/Skeleton.tsx` | Shimmer lines, 3 variants: `table` / `card` / `stat`, staggered delays |
| `Tabs` | `components/ui/Tabs.tsx` | Underline + pill variants, indigo active state, `aria-selected`, internal `useState` |
| `ScheduleGrid` | `components/ui/ScheduleGrid.tsx` | Time×room grid, 6 SessionType color classes, legend, derived from agenda CSS patterns |
| `RendererDataTable` | `components/ui/RendererDataTable.tsx` | Adapter bridging wireframe `string[]` columns to typed `Column<T>[]` via camelCase→Title Case |

`COMPONENT_REGISTRY` updates in `RenderedBlock.tsx`:
- `DataTable` now resolves to `RendererDataTable` (no longer a placeholder)
- `ScheduleGrid`, `EmptyState`, `Skeleton`, `Tabs` all wired
- All 5 new components exported from `ui/index.ts`

**Commit:** `74c5cc4` — pushed to GitHub + deployed to Render

---

## [27] Post-Migration Validation

**Audit scope:** All 13 pages, all 13 wireframe JSONs, renderer pipeline, TokenResolver, renderer.css.

### Validation errors found and fixed (commit `88040c4`)

**Root bug — `step2-resolve-components.ts`:** `node.a11y` was always initialized to `{}` — `block.annotations` with `aria-label`/`aria-live`/`role` were silently dropped, causing validator to fire for every annotated block. Fixed: read `block.annotations` and populate `node.a11y` before constructing the node.

**Span override bug:** `layout.span` was always `entry.defaultSpan` — explicit `span` in wireframe blocks was ignored. Fixed: `span: block.span ?? entry.defaultSpan`.

**A11Y_MISSING_LABEL errors (8 blocks):** All `tabset` → `Tabs` blocks require `aria-label`. 8 wireframe blocks lacked it:
| Wireframe | Block | Fix |
|-----------|-------|-----|
| notifications | status-filter | added `annotations.aria-label` |
| speakers | status-filter | added `annotations.aria-label` |
| sponsors | status-filter | added `annotations.aria-label` |
| exhibitors | status-filter | added `annotations.aria-label` |
| attendees | status-filter | added `annotations.aria-label` |
| registrations | status-filter | added `annotations.aria-label` |
| events | view-toggle | added `annotations.aria-label` |
| events | status-filter | added `annotations.aria-label` |

**A11Y_MISSING_LABEL for Input (1 block):** `search-input` in events wireframe had no `label` prop. Fixed: added `"label": "Search events"` to props.

### Validation passes (confirmed clean)

| Check | Result |
|-------|--------|
| TokenResolver — no arbitrary CSS literals | PASS — derived tokens all use named prefixes; CSS module px values are scoped, not validated |
| renderer.css responsive | PASS — `@media (max-width: 900px)` 4-col grid; `640px` single-col |
| `requiresA11yLabel` blocks with aria-label | PASS — all 9 fixed above; remaining annotated blocks (dashboard breadcrumb, agenda day-tabs/CTAs, settings tabs) now propagate via step2 fix |
| Alert aria-live (dashboard live-alert) | PASS — `annotations["aria-live": "polite"]` now flows to `node.a11y` |
| Span 1–12 constraint | PASS — no out-of-range spans |
| Singleton components (TopNav, Sidebar) | PASS — none appear in page wireframes (handled by AppLayout) |

---

## [28] Frontend Rendering Fixes — PageHeader + KpiCard data bridge

Two prop-contract gaps between renderer pipeline output and component interfaces, fixed.

**Gap 1 — `page_header` → `Card` (broken):**
`Card` requires `children`. Renderer passes `{ title, subtitle }` with no children → empty body. `subtitle` not a Card prop.

**Fix:** Standalone `PageHeader` component:
- `title` (18px, 800 weight) + `subtitle` (13px, ink-3) left-aligned
- `children` slot for right-side action buttons
- White bg, `border-bottom`, 16px 24px padding, 900px responsive
- `ComponentCatalog.ts`: `page_header.component = 'PageHeader'`
- `PageHeader` added to `CanonicalComponent` union + `COMPONENT_REGISTRY` + `ui/index.ts`

**Gap 2 — `metric_tile` → `KpiCard` (silent blank):**
Renderer injects `{ data: <api value>, dataKey }` via data bridge — `value` was never set.

**Fix:** `KpiCard` now accepts `data?: unknown`:
```ts
const displayValue = value ?? (data !== undefined ? String(data) : '—')
```
Backward-compatible. Dashboard, Ticketing, Analytics KPIs now show real numbers.

**Commit:** `b294ae5` — pushed to GitHub + deployed to Render

---

## [29] RendererEntityCard — entity_card adapter [step-8]

Built `RendererEntityCard` adapter replacing the empty `Card` shell for all `entity_card` blocks.

| Variant | Page | Rendering |
|---------|------|-----------|
| `event` + `repeating: true` | Events `/events` | 3→2→1 col grid of event cards with status pills, dates, code badge, action buttons, Create CTA card |
| `detail` | Events[id] `/events/[id]` | Ordered key-value table from `fields[]` prop; dates auto-formatted |
| `info` | Settings `/settings` | Auto-derived key-value pairs from entity object; card header with title |

Key design:
- Status pills: draft=neutral/dashed, published=forest, live=teal, archived=muted
- Draft cards: dashed border + surface bg
- ISO dates → "Mar 15, 2025" auto-formatting
- Empty/loading states handled for all variants

`COMPONENT_REGISTRY`: `EventCard` → `RendererEntityCard` (was `Card`)
`events.wireframe.json`: entity_card `span: 4 → 12` (component owns internal grid)

**Commit:** `3366bf8` — pushed to GitHub + deployed to Render (`dep-d6mcsgf5r7bs73cc3fp0`)

---

## [31] RendererActionsContext — Live Event Switching + Day-Tab Bridge [step-10]

Built the client-side callback bridge so renderer components can communicate state changes back to page-level `useState`.

**New file:** `renderer/context/RendererActionsContext.tsx`
- `RendererActions` interface: `onSelectChange?(blockId, value)` + `onTabChange?(blockId, value)`
- `RendererActionsProvider` + `useRendererActions()` hook

**`RenderedPage.tsx`:** accepts `onSelectChange` + `onTabChange` props; wraps output in `<RendererActionsProvider>`.

**`RenderedBlock.tsx`:** injects `blockId` into `combinedProps` so components know their identity.

**`RendererSelect.tsx`:** converted from uncontrolled (`defaultValue`) to controlled (`value`); calls `onSelectChange(blockId, value)` via context.

**`Tabs.tsx`:** added `blockId?` prop; calls `onTabChange(blockId, value)` on click; `useEffect` syncs active tab when `defaultTab`/`tabsData` changes externally.

**8 event-selector pages updated** (speakers, attendees, registrations, sponsors, exhibitors, ticketing, analytics, agenda):
```tsx
onSelectChange={(blockId, value) => { if (blockId === 'event-selector') setEventId(value) }}
```
**Agenda** additionally:
```tsx
onTabChange={(blockId, value) => { if (blockId === 'day-tabs') setActiveDay(value) }}
```

**Commit:** `d73b8ee`

---

## [32] Protocol Token Sweep — Design System Protocol Implementation [step-11]

Full implementation of EMS-Design-System-Protocol.md across token layer and all CSS modules.

### Token Layer Extension (`styles/tokens.css`)
Added complete missing token groups:
- **Spacing scale** (8px grid): `--space-1` (4px) through `--space-16` (64px)
- **Typography scale**: `--text-xs` (11px), `--text-sm` (13px), `--text-md` (14px), `--text-lg` (18px), `--text-xl` (28px), `--text-2xl` (32px), `--text-hero` (52px)
- **Font weights**: `--weight-medium` (500), `--weight-semibold` (600), `--weight-bold` (700), `--weight-extrabold` (800)
- **Border**: `--border-width: 1.5px`

### Component CSS Modules Swept (anti-patterns → tokens)
| File | Key Changes |
|------|-------------|
| `KpiCard.module.css` | `padding: 20px` → `var(--space-5)`, `translateY(-3px)` → `-2px`, all font literals → tokens |
| `Button.module.css` | `font-size: 13px` → `var(--text-sm)`, `font-weight: 700` → `var(--weight-bold)`, size variants updated |
| `Badge.module.css` | `font-size: 11px` → `var(--text-xs)`, `gap: 5px` → `var(--space-1)`, `letter-spacing: 0.02em` → `0.05em` |
| `DataTable.module.css` | All font/spacing literals → tokens |
| `Input.module.css` | All literals → tokens |
| `Sidebar.module.css` | All literals → tokens |
| `TopBar.module.css` | `gap: 10px` → `var(--space-2)` |

### Page CSS Modules Swept
| File | Key Changes |
|------|-------------|
| `dashboard.module.css` | `gap: 16px` → `var(--space-4)`, all font values → tokens |
| `analytics.module.css` | All literals → tokens, `padding: 24px` → `var(--space-6)` |
| `ticketing.module.css` | All literals → tokens |
| `registrations.module.css` | All literals → tokens |
| `speakers.module.css` | All literals → tokens (shared: attendees/sponsors/exhibitors/notifications/agenda) |
| `events.module.css` | Full sweep — cards, status chips, CTAs, buttons, stats all tokenized |
| `agenda.module.css` | Full sweep — toolbar, day tabs, schedule grid, session blocks, legend, loading states |

**Protocol anti-patterns eliminated:**
- Hardcoded hex values → semantic color tokens
- Magic number spacing (10px, 14px, 20px…) → 8px-grid `--space-*` tokens
- Inline `font-size: 11/13px` → `--text-xs/sm` scale tokens
- `font-weight: 700/600` → `--weight-bold/semibold` tokens
- `border: 1.5px solid` literals → `var(--border-width) solid`
- Inconsistent hover translateY → standardized `-2px` for cards

---

## [30] Full Pipeline Audit + 9-Fix Resolution [step-9]

Systematic audit across registry, prop contracts, data bridge, and all 13 wireframes. 9 gaps found and fixed.

### P0 — Prop contract fixes (visible blank UI)

**Button `label` prop (`Button.tsx`):**
Button renders `{children}` but renderer passes `label` prop with no children → blank buttons on every CTA.
Fix: added `label?: string` to ButtonProps; renders `children ?? label`.

**Tabs string[] normalisation (`Tabs.tsx`):**
Wireframes send `tabs: ["All","Sent","Pending"]` (strings). Tabs expected `{ label, value }[]` objects → `tabs[0]?.value` was `undefined` → zero tabs rendered on 10+ filter bars.
Fix: `normalise()` converts `string[]` → `Tab[]`; added `tabsData?: string[]` for dynamic day tabs from data bridge.

### P0 — Missing component

**`RendererSelect` (`RendererSelect.tsx` + CSS):**
`select_input` → `Select` not in registry → invisible in production on 8 pages.
Built styled `<select>`: DL tokens, chevron background, focus ring. `options[]` from `optionsKey`, current value from `dataKey`. Wired as `Select` in COMPONENT_REGISTRY.

### P1 — Data bridge multi-Key injection (`step2-resolve-components.ts`)

Single `dataKey` limit meant secondary data never reached components.
Fix: scan all block props ending in `Key` (except `dataKey`), resolve each from `ctx.data`, inject with stripped name:
- `activeDayKey:"activeDay"` → `activeDay: ctx.data["activeDay"]` (ScheduleGrid)
- `optionsKey:"events"` → `options: ctx.data["events"]` (RendererSelect on 8 pages)
- `tabsDataKey:"days"` → `tabsData: ctx.data["days"]` (Tabs day tabs)

**8 wireframes updated** — added `optionsKey:"events"` to all `select_input` blocks (speakers, attendees, registrations, sponsors, exhibitors, ticketing, analytics, agenda).

### P1 — StatusChip fix

**`RendererStatusChip` (`RendererStatusChip.tsx`):**
`EventStatusPill` was raw `StatusChip` requiring `children` string. Renderer passed `data: Event` (whole object).
Built adapter: extracts status via `statusKey` prop, maps 20+ domain status values to DL color tokens (forest/teal/amber/brick/indigo/neutral). Wired as `EventStatusPill` in registry.

### P2 — Dashboard wireframe cleanup

Removed `top_navigation` + `breadcrumbs` blocks (AppLayout already renders nav).
Moved `page_header` to `top` region, removed duplicate from `primary`.

**Commit:** `2bdee64` — pushed to GitHub + deployed to Render (`dep-d6mdaflactks7380foe0`)
