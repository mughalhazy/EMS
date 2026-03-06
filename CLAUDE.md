# EMS — Claude Code Project Context

## Project Location
`C:/EMS/` — root of the cloned GitHub repo (https://github.com/mughalhazy/EMS)

## What This Is
Enterprise Event Management System — hybrid EMS + Ticketing platform.
Ticketing is ONE subsystem. The platform covers:
events, agenda, speakers, attendees, registrations, exhibitors, sponsors,
networking, onsite check-in, analytics, notifications, commerce.

## Stack
- Backend:  NestJS (modular monolith) — do NOT modify
- Frontend: Next.js 14 + React 18 + TypeScript (App Router)
- DB:       PostgreSQL | Cache: Redis | Events: Kafka | Search: OpenSearch

## Key Docs (read before any task)
- `ems/docs/product.md`       — system definition
- `ems/docs/architecture.md`  — architecture + data flow
- `ems/docs/domain-model.md`  — 19 entities + relationships
- `ems/docs/api-standards.md` — REST contracts, pagination, errors, auth
- `ems/docs/service-map.md`   — 17 backend services + responsibilities

## Design Language — SINGLE SOURCE OF TRUTH
Source: `ems/design-language/design-language.html`
Memory: `~/.claude/projects/C--Users-Admin/memory/ems-design-language.md`

RULE: Do not invent tokens or components. Use only what is defined.

### Color Families
- Forest `--f-*`  — health, positive, confirmed
- Indigo `--i-*`  — data, navigation, primary actions
- Amber  `--a-*`  — warnings, pending
- Brick  `--b-*`  — danger, errors, cancellations
- Gold   `--g-*`  — finance, revenue, commerce
- Teal   `--t-*`  — sync, live, real-time

### Typography
Plus Jakarta Sans — 52/28/18/13/11px scale

### Radius: 8px / 14px / 20px | Grid: 8px base | Breakpoint: 900px

### Three Surfaces
- App    — dense, operational, sidebar nav, all 6 colors
- Portal — executive digest, summary-first
- Auth   — minimal, centered

## Frontend Path
`ems/apps/web/` — Next.js App Router

## API Rules (frontend must follow)
- Base:          `/api/v1/...`
- Auth:          `Authorization: Bearer <JWT>` on every request
- Tenant:        resolved from token — never self-asserted by client
- Pagination:    cursor-based, default 25, max 100
- Errors:        `{ error: { code, message, details[], requestId } }`
- Idempotency:   `Idempotency-Key` header on POST for order/payment/registration
- Timestamps:    ISO 8601 UTC
- Fields:        camelCase

## Working Rules
- DESIGN IS KING — deterministic, Shopify/Stripe/Netlify caliber
- User issues task prompts; provide feedback where appropriate
- Do not modify backend code
- Every task prompt ends with a git commit

## Resume Process
Read `CLAUDE.md` (this file) + `PROGRESS.md` → continue from last checkpoint.
