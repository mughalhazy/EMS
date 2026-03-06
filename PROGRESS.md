# EMS Build Progress

## Legend
- ✅ Complete
- 🔄 In Progress
- ⏳ Pending

---

## Phase 1 — Foundation

### Context & Architecture
- ✅ Read product.md, architecture.md, domain-model.md, api-standards.md, service-map.md
- ✅ Built mental model of 17 services, 19 entities, API contracts
- ✅ Loaded design language (tokens, components, surfaces, responsive rules)

### Repo Setup
- ✅ Cloned repo to C:/EMS/
- ✅ CLAUDE.md created (auto-loads on session start)
- ✅ PROGRESS.md created (this file)
- ✅ Retention system: CLAUDE.md + PROGRESS.md + git commits

---

## Phase 2 — Frontend Scaffold (`ems/apps/web/`)

### Config
- ✅ package.json
- ✅ tsconfig.json
- ✅ next.config.ts
- ✅ .env.local.example

### Styles
- ✅ styles/tokens.css       — exact design language CSS variables
- ✅ styles/globals.css      — reset + typography scale
- ✅ styles/components.css   — badge, btn, input, kpi-card, status-chip, table, alert

### Types
- ✅ types/domain.ts         — all 19 domain entities typed
- ✅ types/api.ts            — ApiError, PaginatedResponse, ApiRequestError

### Services (API layer)
- ✅ services/api.ts             — base client: auth, tenant, pagination, errors, idempotency
- ✅ services/auth.service.ts
- ✅ services/events.service.ts
- ✅ services/agenda.service.ts
- ✅ services/speakers.service.ts
- ✅ services/attendees.service.ts
- ✅ services/registrations.service.ts
- ⏳ services/ticketing.service.ts
- ⏳ services/orders.service.ts
- ⏳ services/payments.service.ts
- ⏳ services/fulfillment.service.ts
- ⏳ services/sponsors.service.ts
- ⏳ services/exhibitors.service.ts
- ⏳ services/analytics.service.ts
- ⏳ services/notifications.service.ts
- ⏳ services/tenant.service.ts

### Components (UI)
- ⏳ components/ui/Button.tsx + module.css
- ⏳ components/ui/Badge.tsx + module.css
- ⏳ components/ui/Input.tsx + module.css
- ⏳ components/ui/KpiCard.tsx + module.css
- ⏳ components/ui/StatusChip.tsx + module.css
- ⏳ components/ui/DataTable.tsx + module.css
- ⏳ components/ui/AlertCard.tsx + module.css
- ⏳ components/ui/index.ts
- ⏳ components/nav/Sidebar.tsx
- ⏳ components/nav/TopBar.tsx

### Layouts
- ⏳ layouts/AppLayout.tsx      — operational, sidebar nav
- ⏳ layouts/PortalLayout.tsx   — executive digest
- ⏳ layouts/AuthLayout.tsx     — auth pages

### App (Pages)
- ⏳ app/layout.tsx             — root layout, font loading, global styles
- ⏳ app/page.tsx               — root redirect
- ⏳ app/(auth)/layout.tsx
- ⏳ app/(auth)/login/page.tsx
- ⏳ app/(app)/layout.tsx       — app shell
- ⏳ app/(app)/dashboard/page.tsx
- ⏳ app/(app)/events/page.tsx
- ⏳ app/(app)/events/[id]/page.tsx
- ⏳ app/(app)/agenda/page.tsx
- ⏳ app/(app)/speakers/page.tsx
- ⏳ app/(app)/attendees/page.tsx
- ⏳ app/(app)/registrations/page.tsx
- ⏳ app/(app)/ticketing/page.tsx
- ⏳ app/(app)/sponsors/page.tsx
- ⏳ app/(app)/exhibitors/page.tsx
- ⏳ app/(app)/analytics/page.tsx
- ⏳ app/(app)/notifications/page.tsx
- ⏳ app/(app)/settings/page.tsx
- ⏳ app/(portal)/layout.tsx
- ⏳ app/(portal)/portal/page.tsx

---

## Phase 3 — Backend Wiring
⏳ Not started

## Phase 4 — Deployment (Render.com)
⏳ Not started

---

## Last Checkpoint
Phase 2 in progress — services 1–6 complete, remaining services + all components/layouts/pages pending.

## Resume Command
> Read CLAUDE.md and PROGRESS.md. Resume Phase 2 frontend build from last checkpoint.
