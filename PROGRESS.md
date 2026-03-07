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
