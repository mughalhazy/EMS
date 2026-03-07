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
