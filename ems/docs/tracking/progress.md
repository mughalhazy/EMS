> **Status: Obsolete. Moved to `docs/legacy/progress.md` (2026-06-17).**
> This tracker was last updated 2026-06-13 and marks
> Batches 8–10, Enterprise SSO, and `services/integration` as "Not started."
> All are **implemented** as of 2026-06-15. Do not use for current status.
> Authority: `docs/01_backend/SERVICE_CATALOG.md`.

# Build Progress Tracker

Tracks the status of every phase/batch in the EMS build, how it was verified, and
what's left. Cross-reference `docs/canon/capability-matrix.md` for tier mapping
and `BUILD_BLUEPRINT.md` (workspace root) for the canonical execution order.

Last updated: 2026-06-13

---

## Status legend

| Symbol | Meaning |
|---|---|
| ✅ | Complete, verified (`tsc --noEmit` exit 0 and/or `eslint --max-warnings=0` exit 0) |
| 🚧 | In progress / partially started |
| ⬜ | Not started |

---

## Phase-level status

| Phase | Description | Status | Verification |
|---|---|---|---|
| A | Canonical docs (`docs/canon`, `docs/architecture`, `docs/workflows`, `docs/product`, `docs/ui`, `docs/developer`) | ✅ | 57 `.md` files written, indexed in `doc-catalogue.md` |
| B | Infra scaffolding (`docker-compose`, `infra/event-bus`, `infra/cache`, `infra/common`, `AppModule` scaffold) | ✅ | Manual build/run checks |
| C | Backend services — Batches 1–6 (see below) | ✅ | Per-batch `tsc --noEmit` exit 0 |
| D | CI/CD, Observability, Deployment Scaffolding (4 bundles) | ✅ | `tsc --noEmit` + `eslint --max-warnings=0` + `jest --passWithNoTests`, all exit 0 |
| E | Frontend (Next.js, `apps/web`) | ⬜ | Not started |

---

## Phase C — Backend Service Batches

| Batch | Services | Status | Notes |
|---|---|---|---|
| 1 — Platform Core | auth, tenant, rbac, audit | ✅ | tsc verified |
| 2 — Event Operations | event, agenda, speaker, exhibitor, attendee | ✅ | tsc verified |
| 3 — Participation | registration, onsite | ✅ | tsc verified |
| 4 — Commerce Core | ticketing, pricing, inventory, order, payment, fulfillment | ✅ | tsc verified. Schema named `ordering` (not `order`, a SQL reserved word) — see `delta-log.md` |
| 5 — Engagement (Marketing) | notification, engagement | ✅ | tsc verified (resumed after a memory-constraint pause). Engagement module also absorbed Poll/QA/Survey entities — see `delta-log.md` |
| 6 — Intelligence | analytics, search | ✅ | tsc verified. `search` implemented via Postgres ILIKE, not OpenSearch — see `delta-log.md` |
| 7 — Infra Layer | infra/event-bus, infra/cache | ✅ (delivered early, in Phase B) | READMEs still say "SCAFFOLD" — see `gap-register.md` #1 |
| 8 — Social (gap-fill) | networking | ⬜ | Not started |
| 9 — Interactive Engagement (gap-fill) | interactive-engagement | ⬜ | Not started — entity overlap with Batch 5's `engagement` module needs reconciliation first, see `gap-register.md` #2 |
| 10 — AI Layer (gap-fill) | ai-service | ⬜ | Not started |

---

## Phase D — Bundles (Stream-10: Infrastructure & DevOps)

| Bundle | Description | Status |
|---|---|---|
| 1 — Containerization | `apps/api/Dockerfile`, `.dockerignore`, `docker-compose.app.yml`, `scripts/register-paths.js`, `npm run build:all`/`start:prod` | ✅ |
| 2 — CI/CD | `.github/workflows/ci.yml` (lint, typecheck, test, docker-build/push to GHCR) | ✅ |
| 3 — Observability | `JsonLogger`, `RequestLoggerMiddleware`, `/v1/health` + `/v1/health/ready` | ✅ |
| 4 — Deployment Scaffolding | `infra/deployment/env/*.example`, `infra/deployment/secrets/README.md` | ✅ |

---

## Outstanding work (in priority/dependency order)

1. **Batch 8 — Social (networking)** — `AttendeeConnection`, `connection.requested/accepted/declined`.
2. **Batch 9 — Interactive Engagement** — reconcile with Batch 5's `engagement` module first (see `gap-register.md` #2), then build/migrate `interactive-engagement` if a separate service is still warranted.
3. **Batch 10 — AI Layer (ai-service)** — depends on Batches 2, 6, 8, 9 per `docs/architecture/ai-architecture.md` §8.
4. **Phase D residual** — Enterprise SSO (auth extension), `services/integration`, Dockerfile for `apps/web` (all called out as Phase D scope in `docs/canon/capability-matrix.md` Tier 4 but not yet built).
5. **Phase E — Frontend** — `design/tokens`, `design/components`, `design/wireframes` populated first (TASK 02/04/05), then `apps/web` (TASK 03–14), per `apps/web/README.md` and `services/ui-renderer/spec.md`.
