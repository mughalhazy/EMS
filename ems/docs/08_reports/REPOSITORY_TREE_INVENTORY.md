Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Repository Tree Inventory

> Full inventory of every folder and meaningful file group in `D:\SaaS\EMS\ems`,
> generated per `FULL REPOSITORY NORMALIZATION AND REALITY AUDIT.md`.
> Excludes `node_modules/`. Generated artifacts (`.jest-cache/`, `dist/`) are
> listed and classified but file-by-file detail is omitted — see
> `GENERATED_ARTIFACT_REGISTER.md`.

---

## Root Level (D:\SaaS\EMS\ems)

| File / Folder | Type | Classification | Notes |
|---|---|---|---|
| `.dockerignore` | Config file | Configuration | Correct at root; Docker build context exclusions |
| `.gitignore` | Config file | Configuration | Correct at root; includes `dist/`, `.jest-cache/`, `node_modules/`, `.env*` |
| `.npmrc` | Config file | Configuration | npm registry / cache redirection config |
| `.prettierrc` | Config file | Configuration | Code formatting rules |
| `README.md` | Doc file | Supporting Documentation | Repo structure overview — still accurate |
| `data-source.ts` | Source file | Active Source | TypeORM CLI datasource for migrations — must remain at root for `typeorm` CLI to find it via `package.json` scripts; correct location |
| `doc-catalogue.md` | Doc file | **Misplaced** | Documentation index artifact at root; belongs in `docs/` — see ROOT_LEVEL_CLEANUP_PLAN.md |
| `eslint.config.mjs` | Config file | Configuration | ESLint flat config — correct at root |
| `nest-cli.json` | Config file | Configuration | NestJS CLI monorepo config (registers api, event-bus, cache as projects) — correct at root |
| `package-lock.json` | Build file | Configuration | npm lockfile — correct at root |
| `package.json` | Build file | Configuration | npm manifest + scripts — correct at root |
| `tsconfig.json` | Config file | Configuration | Root TypeScript config (path aliases for all `@ems/*` modules) — correct at root |
| `.github/` | Folder | Configuration | CI/CD workflows — see below |
| `.jest-cache/` | Folder | **Generated Artifact** | 316 generated Jest transform cache files; correctly gitignored; should NOT be committed — see GENERATED_ARTIFACT_REGISTER.md |
| `apps/` | Folder | Active Source | Application entry points — see below |
| `design/` | Folder | Supporting Documentation | Phase E design scaffolds — see below |
| `dist/` | Folder | **Generated Artifact** | Build output; correctly gitignored; currently contains only `tsconfig.tsbuildinfo` — see GENERATED_ARTIFACT_REGISTER.md |
| `docs/` | Folder | Authority Documentation | Full documentation tree — see below |
| `infra/` | Folder | Active Source + Infrastructure | Shared libraries + docker/deployment config — see below |
| `migrations/` | Folder | Migration / Database | TypeORM migration files location — currently empty (only a README) |
| `node_modules/` | Folder | Build Output | npm packages; gitignored; excluded from this inventory |
| `prompts/` | Folder | Legacy | Phase A gap-fill prompt archive; obsolete — see LEGACY_AND_ARCHIVE_PLAN.md |
| `scripts/` | Folder | Script / Tooling | Build and env scripts — see below |
| `services/` | Folder | Active Source | 27 NestJS service modules — see below |

**Root file count (tracked, excluding auto-generated):** 12 files + 10 folders

---

## .github/

| File | Type | Classification | Notes |
|---|---|---|---|
| `workflows/ci.yml` | CI/CD config | Configuration | GitHub Actions: lint → typecheck → test → docker-build; fully implemented |

---

## apps/

| Subfolder / File | Type | Classification | Notes |
|---|---|---|---|
| `apps/api/Dockerfile` | Build file | Infrastructure | Container image definition for NestJS API — implemented (Phase D) |
| `apps/api/tsconfig.app.json` | Config | Configuration | Per-app TypeScript config extending root tsconfig |
| `apps/api/src/main.ts` | Source | Active Source | NestJS bootstrap; listens on port from env |
| `apps/api/src/app.module.ts` | Source | Active Source | Root AppModule; imports all 26 service modules + infra |
| `apps/api/src/config/env.validation.ts` | Source | Active Source | Joi-based env variable validation on startup |
| `apps/api/src/health/health.controller.ts` | Source | Active Source | `/v1/health` + `/v1/health/ready` endpoints |
| `apps/web/README.md` | Doc | Working Draft | Phase E frontend placeholder — correctly aspirational |

**Note**: No `apps/web/` source code exists yet — Phase E not started. The folder only holds a README.

---

## design/

| Subfolder / File | Type | Classification | Notes |
|---|---|---|---|
| `design/tokens/README.md` | Doc | Working Draft | Phase E TASK 02 scaffold |
| `design/components/README.md` | Doc | Working Draft | Phase E TASK 04 scaffold |
| `design/wireframes/README.md` | Doc | Working Draft | Phase E TASK 05 scaffold |

No design assets (token values, component specs, wireframes) exist yet.

---

## dist/

| File | Type | Classification | Notes |
|---|---|---|---|
| `tsconfig.tsbuildinfo` | Build artifact | Generated Artifact | TypeScript incremental build cache; correctly gitignored; only file present in dist/ — no compiled JS output currently on disk |

---

## docs/

| Subfolder | File Count | Classification | Notes |
|---|---|---|---|
| `docs/00_authority/` | 5 | Authority Documentation | Phase 1 governance authority docs |
| `docs/01_backend/` | 9 | Authority Documentation | Phase 2 backend authority docs + README stub |
| `docs/02_frontend/` | 1 | Working Draft | Phase E placeholder README |
| `docs/03_fullstack_contracts/` | 6 | Authority Documentation | Phase 2 contracts docs + README stub |
| `docs/04_testing/` | 1 | Working Draft | Testing phase placeholder README |
| `docs/05_deployment/` | 1 | Working Draft | Deployment phase placeholder README |
| `docs/06_decisions/` | 1 | Authority Documentation | ADR-001 (foundational architectural decisions) |
| `docs/07_governance/` | 2 | Authority Documentation | AI operating rules + decision escalation matrix |
| `docs/08_reports/` | 21+* | Generated Report | Phase 1/2 reports + normalization outputs (this audit's outputs go here) |
| `docs/architecture/` | 2 | Legacy | Phase A architecture docs (system-architecture, ai-architecture) |
| `docs/canon/` | 10 | Legacy | Phase A canonical design docs |
| `docs/developer/` | 1 | Operational Artifact | Build/run/CI developer guide |
| `docs/product/` | 1 | Legacy | Phase A product overview (superseded) |
| `docs/tracking/` | 5 | Historical Record | Build tracking docs (progress, gap-register, delta-log, doc-tracker, research-analysis) |
| `docs/ui/` | 1 | Supporting Documentation | Design system guide (Phase E authority placeholder) |
| `docs/workflows/` | 4 | Supporting Documentation | Detailed workflow step-by-step docs |

\* Count grows as this audit's 9 new reports are added.

**Total docs/ tracked files: ~71** (71 existing + 9 new = 80 after this audit)

---

## infra/

| Subfolder | File Count | Classification | Notes |
|---|---|---|---|
| `infra/cache/` | 8 | Active Source | Redis client library (`@ems/cache`): CacheModule, IdempotencyStore, LockService, RateLimiterService; has README + tsconfig.lib.json |
| `infra/common/` | 12 | Active Source | Shared utilities (`@ems/common`): BaseRepository, TenantContext, JwtAuthGuard, PermissionsGuard, decorators, logger, filters; has tsconfig.lib.json but **NO README** |
| `infra/deployment/` | 5 | Infrastructure | Env templates (.env.development/staging/production.example) + secrets README |
| `infra/docker/` | 4 | Infrastructure | docker-compose.yml (dev dependencies), docker-compose.app.yml (full app), .env.example, postgres-init.sql |
| `infra/event-bus/` | 9 | Active Source | Kafka event bus library (`@ems/event-bus`): EventBusService, OutboxRelay, topics enum, DomainEvent interface; has README + tsconfig.lib.json |

**Critical finding**: `infra/common/` has no README. It is the most important shared library in the repo (tenant isolation, permissions, auth guards) and is undocumented in its own folder. None of the Phase 2 authority docs points readers to browse `infra/common/src/` for implementation.

---

## migrations/

| File | Type | Classification | Notes |
|---|---|---|---|
| `README.md` | Doc | Working Draft | Placeholder for migration documentation |

**No migration files exist**. TypeORM CLI datasource (`data-source.ts`) is configured to read from `migrations/*.ts` but that pattern matches zero files. Schema creation is handled by `postgres-init.sql` (CREATE SCHEMA only) and TypeORM `synchronize: false` — meaning no migration history exists and schema must be applied manually or via `typeorm migration:run` once migrations are authored.

---

## prompts/

| File | Type | Classification | Notes |
|---|---|---|---|
| `README.md` | Doc | Obsolete | Lists gap-fill prompts as pending; all are implemented. See LEGACY_AND_ARCHIVE_PLAN.md |

---

## scripts/

| File | Type | Classification | Notes |
|---|---|---|---|
| `register-paths.js` | Script | Script / Tooling | TypeScript path-alias resolver for production runtime; used by `start:prod` and Dockerfile CMD; documented in `delta-log.md` RA-1/DELTA-4 |
| `setup-env.ps1` | Script | Script / Tooling | One-time machine setup — redirects npm/cache/build dirs to D: drive, disables telemetry; documented **nowhere** in authority docs |
| `verify-build.ps1` | Script | Script / Tooling | TypeScript compile check + npm audit runner; documented **nowhere** in authority docs |

**Finding**: `setup-env.ps1` and `verify-build.ps1` are undocumented in all authority docs and the developer README. `register-paths.js` is at least referenced in DELTA-4/RA-1.

---

## services/

26 implemented NestJS service modules + 1 Phase E scaffold. Each follows the pattern `services/<name>/src/` with module, controller, service, entities/, dto/ (many), and index.ts.

| Service | Files | Has Tests | Batch | Notes |
|---|---|---|---|---|
| `agenda` | 10 | No | 2 | |
| `ai-service` | 7 | No | 10 | Gap-fill |
| `analytics` | 11 | No | 6 | |
| `attendee` | 10 | No | 2 | |
| `audit` | 7 | No | 1 | |
| `auth` | 20 | **Yes** (1 spec) | 1 | Largest service; SSO entities added |
| `engagement` | 6 | No | 5 | Near-empty stub; absorbed entities were migrated to interactive-engagement |
| `event` | 12 | No | 2 | |
| `exhibitor` | 12 | No | 2 | |
| `fulfillment` | 7 | No | 4 | |
| `integration` | 7 | No | Cross | Gap-fill |
| `interactive-engagement` | 11 | No | 9 | Gap-fill |
| `inventory` | 8 | No | 4 | |
| `networking` | 7 | No | 8 | Gap-fill |
| `notification` | 15 | **Yes** (1 spec) | 5 | Includes Campaign/AudienceSegment (GAP-G3 resolved) |
| `onsite` | 11 | **Yes** (1 spec) | 3 | |
| `order` | 10 | **Yes** (1 spec) | 4 | Schema is `ordering` (DELTA-1) |
| `payment` | 10 | No | 4 | |
| `pricing` | 10 | No | 4 | |
| `rbac` | 11 | No | 1 | |
| `registration` | 9 | No | 3 | |
| `search` | 8 | No | 6 | ILIKE impl (DELTA-2/3) |
| `speaker` | 10 | No | 2 | |
| `tenant` | 13 | No | 1 | |
| `ticketing` | 10 | No | 4 | |
| `ui-renderer` | 2 | No | Phase E | README + spec.md only; not built |

**Total service files: 254** (including READMEs, source, specs, entities, DTOs)
**Test coverage: 4/26 services** (auth, notification, onsite, order)

---

## Summary Statistics

| Area | Tracked Files | Classification |
|---|---|---|
| Root config files | 11 | Configuration |
| Root doc misplacement | 1 (`doc-catalogue.md`) | Misplaced |
| .github | 1 | Configuration |
| apps/api source | 6 | Active Source |
| apps/api build | 1 (Dockerfile) | Infrastructure |
| apps/web | 1 (README) | Working Draft |
| design | 3 | Working Draft |
| dist | 1 (tsbuildinfo) | Generated Artifact |
| .jest-cache | 316 | Generated Artifact |
| docs | 71 (+ 9 new) | Mixed (see classification matrix) |
| infra source | 27 (cache+common+event-bus) | Active Source |
| infra config | 13 (docker+deployment) | Infrastructure |
| migrations | 1 (README) | Working Draft |
| prompts | 1 (README) | Obsolete |
| scripts | 3 | Script / Tooling |
| services source | 254 | Active Source + Test Asset |
| **Total tracked (approx)** | **~395** | |
