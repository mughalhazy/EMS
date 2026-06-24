Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Codebase Placement Audit

> Verifies that source code, tests, scripts, configs, and database files are
> in their expected locations. Identifies misplacement, mixing of concerns,
> and structural gaps. Does not modify application code.

---

## 1. Source Code in Expected Folders?

### Backend Application (`apps/api/`)

| File | Location | Correct? | Notes |
|---|---|---|---|
| `apps/api/src/main.ts` | `apps/api/src/` | ✅ | NestJS bootstrap |
| `apps/api/src/app.module.ts` | `apps/api/src/` | ✅ | Root module, imports all 26 services |
| `apps/api/src/config/env.validation.ts` | `apps/api/src/config/` | ✅ | Env validation schema |
| `apps/api/src/health/health.controller.ts` | `apps/api/src/health/` | ✅ | Health endpoints |
| `apps/api/Dockerfile` | `apps/api/` | ✅ | Container image; referenced by docker-compose.app.yml |
| `apps/api/tsconfig.app.json` | `apps/api/` | ✅ | Extends root tsconfig |

**Verdict**: API application code is correctly structured. ✅

### Shared Libraries (`infra/`)

| Library | Location | Correct? | Notes |
|---|---|---|---|
| `infra/cache/src/` | `infra/cache/` | ✅ | Redis client, lock, rate-limiter, idempotency |
| `infra/common/src/` | `infra/common/` | ✅ | Guards, decorators, base repo, logger, filters |
| `infra/event-bus/src/` | `infra/event-bus/` | ✅ | Kafka event bus + outbox pattern |

**Verdict**: Shared library source is correctly placed in `infra/`. ✅

### Service Modules (`services/`)

All 26 NestJS service modules follow the same structure:
```
services/<name>/
  README.md
  src/
    <name>.module.ts
    <name>.controller.ts
    <name>.service.ts
    entities/
      <entity>.entity.ts (1-N)
    dto/
      <name>.dto.ts (0-N)
    index.ts
```

**Verdict**: Service module structure is consistent and correctly placed. ✅

**Exception — `services/engagement/`**: This service has 6 files (module, controller, service, entities/, dto/, index) but its entities were migrated to `interactive-engagement` during the gap-fill work. The `engagement` service remains as a near-empty stub. Source files are technically not misplaced but the service may need consolidation or explicit stub marking — see REPOSITORY_RESTRUCTURING_PLAN.md.

---

## 2. Backend Code Not Mixed with Generated Reports?

Verified all `docs/` subdirectories: no `.ts`, `.js`, or other source files found. ✅

Verified all `services/` subdirectories: no `.md` report files found beyond per-service `README.md` orientation docs. ✅

**Verdict**: Clean separation between source code and documentation. ✅

---

## 3. Frontend Code Not Mixed with Backend Authority Docs?

| Check | Result |
|---|---|
| No frontend source in `docs/01_backend/` | ✅ |
| No frontend source in `docs/03_fullstack_contracts/` | ✅ |
| `apps/web/` contains only a README | ✅ |
| `design/` contains only README scaffolds | ✅ |

**Verdict**: Frontend and backend concerns are cleanly separated. ✅

---

## 4. Scripts Grouped Logically?

| Script | Location | Purpose | Documented? |
|---|---|---|---|
| `scripts/register-paths.js` | `scripts/` | Runtime path-alias resolver for `start:prod` | ⚠️ Referenced in `delta-log.md` RA-1/DELTA-4, not in developer README |
| `scripts/setup-env.ps1` | `scripts/` | One-time machine setup (cache redirect to D:, telemetry disable) | ❌ Not documented in any authority doc or README |
| `scripts/verify-build.ps1` | `scripts/` | TypeScript compile + npm audit verification | ❌ Not documented in any authority doc or README |

**Verdict**: All scripts are correctly in `scripts/`. However, 2 of 3 are undocumented. Recommend adding them to `docs/developer/README.md`. This is a safe doc-only addition.

---

## 5. Tests Discoverable?

### Test Configuration

Jest is configured in `package.json` (confirmed by the `jest` script and `.jest-cache` existence). No separate `jest.config.js` at root (Jest config is embedded in `package.json`). No `test/` directory exists.

```json
"test:e2e": "jest --config ./test/jest-e2e.json"
```

**Finding**: The `test:e2e` script references `./test/jest-e2e.json` but **no `test/` directory exists** and **no `jest-e2e.json` exists anywhere in the repo**. This script would fail if executed. This is an active gap — either the E2E framework is planned but not implemented, or it was removed without updating `package.json`.

| Test Concern | Status | Location |
|---|---|---|
| Unit test framework | ✅ Configured | Jest via `package.json` |
| Unit test coverage script | ✅ Exists | `npm run test:cov` → `jest --coverage` |
| Unit test files | ⚠️ 4/26 services | `services/auth/src/auth.service.spec.ts`, etc. |
| E2E test config | ❌ Missing | `test/jest-e2e.json` referenced but not present |
| E2E test files | ❌ Missing | No `test/` directory; no `*.e2e-spec.ts` anywhere |
| Integration tests | ❌ Missing | Not present |

**Verdict**: Unit tests are discoverable but severely under-coverage (4/26 services). E2E framework is broken (config file missing). Neither is a misplacement issue — they are coverage gaps already tracked in `BACKEND_RISK_REGISTER.md`.

**New finding**: Missing `test/jest-e2e.json` makes `npm run test:e2e` fail on invocation. Recommend either creating a minimal config or removing the script — requires owner approval since it touches `package.json`.

---

## 6. Config Files Unnecessarily Duplicated?

| Config Type | Files | Duplicated? | Notes |
|---|---|---|---|
| Root TypeScript config | `tsconfig.json` (1) | No | Single root config; subprojects extend it |
| App TypeScript config | `apps/api/tsconfig.app.json` (1) | No | Per-app extension; correct |
| Library TypeScript configs | `infra/cache/tsconfig.lib.json`, `infra/common/tsconfig.lib.json`, `infra/event-bus/tsconfig.lib.json` (3) | No | Per-library extension; correct |
| Jest config | Embedded in `package.json` (1) | No | |
| ESLint config | `eslint.config.mjs` (1) | No | |
| Prettier config | `.prettierrc` (1) | No | |
| Docker Compose | `docker-compose.yml` (dev deps), `docker-compose.app.yml` (full app) (2) | No — different purposes | Dev-only infra vs. full app stack; correct split |
| Env examples | `.env.development.example`, `.env.staging.example`, `.env.production.example` (3) | No — different environments | Correct per-env templates |
| `.env.example` in docker | `infra/docker/.env.example` (1) | ⚠️ Minor | Docker Compose env example; different from deployment env templates. Same pattern (`*.example`) but different scope — acceptable |

**Verdict**: No unnecessary config duplication found. ✅

---

## 7. Database / Migration Files Discoverable?

| Artifact | Location | Status | Notes |
|---|---|---|---|
| TypeORM data source | `data-source.ts` (root) | ✅ | Configured for `DATABASE_URL` env var; scans `services/**/src/entities/*.entity.ts` |
| Migration files | `migrations/*.ts` | ❌ None exist | Directory only has `README.md`; no migrations have been authored yet |
| Schema creation SQL | `infra/docker/init/postgres-init.sql` | ✅ Present | Creates all 26 schemas + uuid-ossp + pgcrypto extensions |
| **Schema name conflict** | `postgres-init.sql` line 16 | ❌ **Bug** | `CREATE SCHEMA IF NOT EXISTS "order"` — should be `"ordering"` per DELTA-1 |

**Finding — `postgres-init.sql` schema name conflict**: The init SQL creates a schema named `order` (quoted, because it's a SQL reserved word), but the TypeORM entity in `services/order/` uses the schema name `ordering` (renamed exactly to avoid this SQL reserved word collision, per DELTA-1 / RA-5). On a fresh database:
1. `postgres-init.sql` creates schema `order`
2. TypeORM entities expect schema `ordering`
3. TypeORM with `synchronize: false` would not auto-create `ordering`
4. First database operation in the `order` service would fail with "schema ordering does not exist"

This is a **silent infrastructure bug** — development and CI environments that already have the database set up (possibly with manual schema creation or `synchronize: true` at some point) would not surface it. A fresh developer environment would break.

**Action**: This requires `REQUIRES_OWNER_APPROVAL` — fixing it changes `infra/docker/init/postgres-init.sql` (infrastructure file). The fix is to change line 16 from `CREATE SCHEMA IF NOT EXISTS "order";` to `CREATE SCHEMA IF NOT EXISTS "ordering";`. Recommend adding as GAP-G11 to `ARCHITECTURAL_GAP_REGISTER.md`.

---

## 8. Generated Files Not Mixed with Source Authority?

| Check | Result |
|---|---|
| No compiled JS in `services/*/src/` | ✅ |
| No compiled JS in `infra/*/src/` | ✅ |
| No compiled JS in `apps/api/src/` | ✅ |
| `dist/` is separate from source | ✅ |
| `*.tsbuildinfo` only in `dist/` | ✅ |

**Verdict**: Generated files are correctly separated from source. ✅

---

## Codebase Placement Summary

| Check | Status | Action |
|---|---|---|
| API source in correct folders | ✅ | None |
| Shared library source in correct folders | ✅ | None |
| Service modules in correct folders | ✅ | None |
| No backend/report mixing | ✅ | None |
| No frontend/backend mixing | ✅ | None |
| Scripts grouped logically | ✅ (location) ⚠️ (docs) | Add `setup-env.ps1` and `verify-build.ps1` to `docs/developer/README.md` |
| Test discoverability | ⚠️ | `test/jest-e2e.json` missing — REQUIRES_OWNER_APPROVAL |
| Config files not duplicated | ✅ | None |
| Database files discoverable | ⚠️ | No migrations yet — expected; postgres-init.sql schema name bug — REQUIRES_OWNER_APPROVAL |
| Generated files not mixed with source | ✅ | None |
