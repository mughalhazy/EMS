# EMS — Build Log
> Chronological. Oldest at top, newest at bottom. Read down to see what's done, read the last entry to know where we are.
> Resume command: **Read CLAUDE.md and PROGRESS.md, then continue from the last entry.**

---

## [1] Foundation
- Read all backend docs (product, architecture, domain-model, api-standards, service-map)
- Built mental model of 17 services, 19 domain entities, API contracts
- Loaded design language as single UI source of truth (tokens, components, surfaces, responsive rules)
- Repo moved to C:/EMS/ — retention system in place: CLAUDE.md (auto-load) + PROGRESS.md (this file) + git commits

---

## [2] Frontend Scaffold — `ems/apps/web/`
- **Config:** package.json, tsconfig.json, next.config.ts, .env.local.example
- **Styles:** tokens.css (all CSS variables), globals.css (reset + type scale), components.css (base classes)
- **Types:** domain.ts (19 entities), api.ts (ApiError, PaginatedResponse, ApiRequestError)
- **Services (16):** api.ts base client + auth, events, agenda, speakers, attendees, registrations, ticketing, orders, payments, fulfillment, sponsors, exhibitors, analytics, notifications, tenant
- **Components:** Button, Badge, Input, KpiCard, StatusChip, DataTable, AlertCard, Sidebar, TopBar (all with module.css)
- **Pages (19 routes):** root redirect, login, dashboard, events, events/[id], agenda, speakers, attendees, registrations, ticketing, sponsors, exhibitors, analytics, notifications, settings, portal

---

## [3] Design Language Artifacts
- **Token config:** tailwind.config.js (full token map — colors, type, radius, shadow, spacing, breakpoints), postcss.config.js
- **Wireframes (8):** dashboard, events, ticketing, registration, agenda, exhibitors, attendee-portal, admin-console — all following design language layout rules + _base.css shared foundation

---

## [4] UI Renderer — `ems/apps/web/renderer/`
7-step deterministic pipeline: wireframe JSON → validated React tree

| Step | File | Does |
|------|------|------|
| 1 | step1-normalize | Parse + validate WireframeDocument |
| 2 | step2-resolve-components | BlockType → CanonicalComponent (27 types) |
| 3 | step3-apply-layout | 12-col grid, 5 regions, span heuristics |
| 4 | step4-responsive-transform | Breakpoint overrides per surface |
| 5 | step5-apply-tokens | Semantic tokens, no arbitrary CSS literals |
| 6 | step6-validate | 8 categories: a11y, contrast, state, wireframe, reuse, styling, failure, constraints |
| 7 | step7-produce-output | Deterministic RenderResult tree |

- **Types:** wireframe.ts, component.ts, output.ts
- **Catalog:** ComponentCatalog.ts — full 27-entry map + getCatalogEntry() fallback
- **React:** RenderedPage → RenderedRegion → RenderedBlock (with dev debug overlay)
- **Public API:** index.ts, renderer.css (12-col grid, 5 regions, responsive primitives)
- **Sample:** samples/dashboard.wireframe.json

---

## [5] Base Layouts — `ems/apps/web/layouts/`

| Layout | Surface | Structure |
|--------|---------|-----------|
| AppLayout | app | Sidebar (220px dark) + main column. `height:100vh`, internal scroll only. |
| DashboardLayout | app (inside AppLayout) | TopBar + optional banner + two-col: `1fr` content \| `320px` right panel. Collapses at 900px. |
| EventLayout | app (inside AppLayout) | TopBar + optional subnav tabs + optional filter bar + scrollable content. |
| AdminLayout | portal (standalone shell) | Dark ink header (56px sticky) with horizontal tab nav + centered `max-width:1200px` body. No sidebar. |
| PortalLayout | portal | Executive digest, centered max-width. |
| AuthLayout | auth | Minimal centered card. |

- `layouts/index.ts` barrel export added
- `dashboard/page.tsx` and `events/page.tsx` migrated to new layouts

---

## [6] Up Next — Phase 3: Backend Wiring
Wire each page to its backend service. Issue task prompts per module:

- [ ] Dashboard — events + analytics services
- [ ] Events list + event detail
- [ ] Agenda — sessions + rooms
- [ ] Speakers
- [ ] Attendees
- [ ] Registrations — workflow states
- [ ] Ticketing + Orders
- [ ] Sponsors + Exhibitors
- [ ] Analytics
- [ ] Notifications
- [ ] Auth flow end-to-end

Then: **Phase 4 — Render.com deployment**
