# EMS — Pending Tasks
> Implementation order. Top = next to execute. Check off as completed.
> Cross-reference: PROGRESS.md for completed work log.
> Resume: Read CLAUDE.md + PROGRESS.md + this file, then execute from first unchecked task.

---

## Design Principles (non-negotiable)
- Design Language (`ems/design-language/design-language.html`) is the single source of truth
- Wireframes = structure, DL = beauty, Renderer = guarantee
- No arbitrary CSS literals — only named DL tokens
- Every task ends with a git commit + push to GitHub + Render deploy
- Backend is built and frozen — do NOT modify

---

## Architecture Chain (target state)
```
Wireframe JSON (structure)
  → Renderer Pipeline (DL enforcement)
    → COMPONENT_REGISTRY (React component map)
      → UI Components (DL tokens)
        → Visual Output
```

---

## [DONE] Gap Fixes Applied (session prior to this file)
- [x] KpiCard: tinted-background architecture (`--*-lt` bg, `1.5px` border, `color: inherit`, `::after` radial accent)
- [x] Button: `forest` base `--f-dk`; `ghost` white bg + `border-strong`; `soft` forest-tinted; `translateY(-1px)` on solid hovers
- [x] Badge: `::before` 5px dot indicator; `:hover { transform: scale(1.04) }`
- [x] TopBar: title `font-size: 16px` → `18px`
- [x] DashboardLayout: body `padding: 20px` → `24px`
- [x] Sidebar: logomark gradient teal → forest; shadow token replacing rgba literal
- **Commit:** `7f3bba2` — pushed to GitHub + deployed to Render

---

## STEP 1 — Extend BlockType Schema [x]

**Files to change:**

### 1a. `ems/apps/web/renderer/types/wireframe.ts`
Add two missing BlockTypes to the union:
```ts
| 'alert_banner'   // informational / warning banner (not error-only)
| 'schedule_grid'  // time × room schedule grid (Agenda page)
```

### 1b. `ems/apps/web/renderer/types/component.ts`
Add to `CanonicalComponent` union:
```ts
| 'AlertBanner'
| 'ScheduleGrid'
```
Add to `DEFAULT_SPANS`:
```ts
alert_banner:  12,
schedule_grid: 12,
```

### 1c. `ems/apps/web/renderer/catalog/ComponentCatalog.ts`
Add two entries to `COMPONENT_CATALOG`:
```ts
alert_banner: {
  component: 'AlertBanner',
  defaultSpan: 12,
  defaultProps: { variant: 'amber' },
  requiresA11yLabel: false,
  supportsStates: false,
  notes: 'Informational / warning banner. Variants: forest, amber, brick, indigo.',
},
schedule_grid: {
  component: 'ScheduleGrid',
  defaultSpan: 12,
  defaultProps: {},
  requiresA11yLabel: false,
  supportsStates: true,
  notes: 'Time × room grid. Sessions colored by SessionType. Day tabs in toolbar.',
},
```

**Commit:** `feat(renderer): extend BlockType — alert_banner, schedule_grid [step-1]`

---

## STEP 2 — Wireframe JSON Documents [x]

**Location:** `ems/apps/web/renderer/samples/`
**Format:** follow `dashboard.wireframe.json` as reference

Create one JSON per page using the 5 structural templates below.
All must be valid `WireframeDocument` (id, version, surface, meta, regions.primary required).

### Template A — `list_page` (DataTable + filters)
Pages: **Speakers, Attendees, Registrations, Notifications**

Regions:
- `top`: `page_header` (title + actions slot)
- `filters`: `select_input` (event selector) + filter button row (use `tabset`)
- `primary`: `list_table` (span 12) with loading/empty states

### Template B — `card_grid_page` (entity cards + CTA)
Pages: **Events**

Regions:
- `top`: `page_header` + view toggle (`tabset`)
- `filters`: `text_input` (search) + `tabset` (status filter) + count
- `primary`: `entity_card` (span 4 each, repeating) + `primary_cta` (CTA card)

### Template C — `schedule_page` (time × room grid)
Pages: **Agenda**

Regions:
- `top`: `page_header`
- `filters`: `select_input` (event) + `tabset` (day tabs) + `secondary_cta` (Publish) + `primary_cta` (Add Session)
- `primary`: `schedule_grid` (span 12) with loading/empty states

### Template D — `detail_page` (header card + sub-tables)
Pages: **Events[id]**

Regions:
- `top`: `page_header` (event name + status chip + actions)
- `primary`: `entity_card` (event header details, span 12) + `list_table` (Sessions, span 12) + `list_table` (Speakers, span 12)

### Template E — `dashboard_page` (KPIs + split layout)
Pages: **Dashboard, Analytics, Ticketing, Sponsors, Exhibitors, Settings**

Regions:
- `top`: `page_header`
- `filters`: event selector (`select_input`) where applicable
- `primary`: `metric_tile` × N (span 3 or 4) + `list_table`
- `secondary`: `primary_cta` + `audit_stream` where applicable

**Files to create:**
```
renderer/samples/events.wireframe.json
renderer/samples/events-detail.wireframe.json
renderer/samples/agenda.wireframe.json
renderer/samples/speakers.wireframe.json
renderer/samples/attendees.wireframe.json
renderer/samples/registrations.wireframe.json
renderer/samples/ticketing.wireframe.json
renderer/samples/sponsors.wireframe.json
renderer/samples/exhibitors.wireframe.json
renderer/samples/notifications.wireframe.json
renderer/samples/settings.wireframe.json
renderer/samples/analytics.wireframe.json
```

**Commit:** `feat(wireframes): define WireframeDocument JSON for all 12 pages [step-2]`

---

## STEP 3 — Wire COMPONENT_REGISTRY [x]

**File:** `ems/apps/web/renderer/components/RenderedBlock.tsx`

Currently `COMPONENT_REGISTRY = {}` — all blocks render as dev placeholders.

Wire all existing UI components using `dynamic()` imports:

```ts
import dynamic from 'next/dynamic'

const COMPONENT_REGISTRY: Record<string, React.ComponentType<Record<string, unknown>>> = {
  // Data display
  StatCard:    dynamic(() => import('@/components/ui/KpiCard').then(m => m.KpiCard)),
  DataTable:   dynamic(() => import('@/components/ui/DataTable').then(m => m.DataTable)),
  EventCard:   dynamic(() => import('@/components/ui/Card').then(m => m.Card)),
  Card:        dynamic(() => import('@/components/ui/Card').then(m => m.Card)),

  // Actions
  Button:      dynamic(() => import('@/components/ui/Button').then(m => m.Button)),

  // Status
  EventStatusPill: dynamic(() => import('@/components/ui/Badge').then(m => m.Badge)),

  // Feedback
  Alert:       dynamic(() => import('@/components/ui/AlertCard').then(m => m.AlertCard)),
  AlertBanner: dynamic(() => import('@/components/ui/AlertCard').then(m => m.AlertCard)),
  Modal:       dynamic(() => import('@/components/ui/Modal').then(m => m.Modal)),

  // Form
  Input:       dynamic(() => import('@/components/ui/Input').then(m => m.Input)),

  // Nav (already rendered by layout — registry entries prevent double-render)
  // TopNav, Sidebar: intentionally omitted — handled by AppLayout
}
```

Components not yet built (leave as placeholder): `Skeleton`, `EmptyState`, `Toast`, `Drawer`, `Popover`, `CommandPalette`, `Tabs`, `TenantSwitcher`, `VenueSelector`, `AttendeeList`, `ScheduleGrid`, `UnknownBlock`

**Commit:** `feat(renderer): wire COMPONENT_REGISTRY with existing UI components [step-3]`

---

## STEP 4 — Data Bridge [x]

**Goal:** Pages pass API data into the renderer so blocks receive real values.

**Pattern (Option A — explicit prop injection):**
```tsx
// page.tsx
<RenderedPage wireframe={eventsWireframe} data={{ events: apiEvents, total: count }} />
```

**Changes needed:**

### 4a. `RenderedPage.tsx` — accept optional `data` prop
```tsx
interface RenderedPageProps {
  wireframe: unknown
  data?: Record<string, unknown>   // <-- add this
  showDebug?: boolean
}
```
Pass `data` into the render call so the pipeline can inject it into block props.

### 4b. `RendererEngine.ts` — accept and forward `data`
```ts
export function render(wireframe: unknown, data?: Record<string, unknown>): RenderResult
```

### 4c. Pipeline step 2 (`step2-resolve-components.ts`) — data injection
For each block, if `block.props.dataKey` exists, resolve `data[dataKey]` and merge into block props.

```ts
// block definition in wireframe JSON:
{ "id": "events-table", "type": "list_table", "props": { "dataKey": "events" } }

// resolved block props at render time:
{ "rows": apiData.events, "dataKey": "events" }
```

**Commit:** `feat(renderer): data bridge — props injection via dataKey [step-4]`

---

## STEP 5 — Page Migration (renderer-first) [ ]

Migrate pages one by one. Each migration:
1. `page.tsx` becomes a data-fetching shell
2. Data passed to `<RenderedPage wireframe={doc} data={apiData} />`
3. Remove hand-written JSX once renderer output is verified visually

**Migration order (simplest → most complex):**

| Order | Page | Route | Wireframe | Notes |
|-------|------|-------|-----------|-------|
| 1 | Settings | `/settings` | `settings.wireframe.json` | No event selector, static layout |
| 2 | Notifications | `/notifications` | `notifications.wireframe.json` | Status filter only |
| 3 | Sponsors | `/sponsors` | `sponsors.wireframe.json` | Event selector + list |
| 4 | Exhibitors | `/exhibitors` | `exhibitors.wireframe.json` | Same as sponsors pattern |
| 5 | Ticketing | `/ticketing` | `ticketing.wireframe.json` | Event selector + stats + table |
| 6 | Speakers | `/speakers` | `speakers.wireframe.json` | Avatar cell, status filter |
| 7 | Attendees | `/attendees` | `attendees.wireframe.json` | Same as speakers pattern |
| 8 | Registrations | `/registrations` | `registrations.wireframe.json` | Row actions |
| 9 | Analytics | `/analytics` | `analytics.wireframe.json` | 6 KPIs + 3 tables |
| 10 | Events[id] | `/events/[id]` | `events-detail.wireframe.json` | Dynamic route, multi-table |
| 11 | Events | `/events` | `events.wireframe.json` | Card grid + view toggle |
| 12 | Agenda | `/agenda` | `agenda.wireframe.json` | Schedule grid — most complex |
| 13 | Dashboard | `/dashboard` | `dashboard.wireframe.json` | Already has sample wireframe |

**Per-page commit format:** `feat(pages): migrate [page] to renderer pipeline [step-5]`

---

## STEP 6 — Missing UI Components (build as needed during Step 5) [ ]

Build these only when a migrating page actually requires them.

| Component | CanonicalName | Needed by |
|-----------|---------------|-----------|
| `EmptyState` | `EmptyState` | All list pages |
| `Skeleton` | `Skeleton` | All data-fetching pages |
| `ScheduleGrid` | `ScheduleGrid` | Agenda (Step 5 item 12) |
| `Tabs` | `Tabs` | Events view toggle, status filters |
| `Toast` | `Toast` | Mutation feedback (row actions) |

Design rules for each:
- `EmptyState`: SVG icon (neutral) + bold title + descriptor + optional CTA Button
- `Skeleton`: animated shimmer, mirrors target block shape, DL tokens only
- `ScheduleGrid`: wraps the schedule grid from `agenda/page.tsx` into a standalone component that accepts `sessions[]` + `activeDay` props
- `Tabs`: pill or underline variant; indigo active state; `tabset` block type

---

## Post-Migration Validation [ ]

After all 13 pages migrated:

- [ ] Run renderer in `showDebug` mode on each page — zero validation errors
- [ ] Confirm `TokenResolver` blocks no arbitrary CSS literals
- [ ] Check responsive behavior at 900px breakpoint for each page
- [ ] Verify all `requiresA11yLabel: true` blocks have `aria-label` in wireframe JSON
- [ ] Visual QA against design-language.html reference panels

---

## Render Deploy Reference
- Service ID: `srv-d6lq8hdactks73fm2bpg`
- Deploy: `curl -X POST https://api.render.com/v1/services/srv-d6lq8hdactks73fm2bpg/deploys -H "Authorization: Bearer <key>"`
- URL: `https://ems-web-b233.onrender.com`
