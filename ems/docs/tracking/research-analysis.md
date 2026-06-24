# Research & Analysis Notes

Architectural decisions, trade-offs, and judgment calls made during the build
that aren't (yet) captured in `docs/canon/*` but materially affect how the
codebase works. Each entry explains the problem, the options considered, and
why the chosen approach won. Cross-references `delta-log.md` where a decision
also created a documented spec/code divergence.

Last updated: 2026-06-13

---

## RA-1: Monorepo production build — `tsc -p tsconfig.json` + custom path-alias resolver

**Problem**: `docs/architecture/system-architecture.md` §8 defines the repo
layout as one NestJS module per service under `services/<name>/`, all imported
via `@ems/<name>` path aliases (root `tsconfig.json`). NestJS's default
`nest build` only compiles the `apps/api` project — it does not compile the
`@ems/*` libraries, so `dist/apps/api/src/main.js` would `require()` modules
that were never emitted.

**Options considered**:
1. Convert every `services/*` and `infra/*` folder into an Nx/Nest "library"
   with its own `nest-cli.json` project entry, relying on Nest's monorepo mode
   to build a dependency graph.
2. Bundle everything with esbuild/webpack into a single file, sidestepping
   module resolution entirely.
3. Compile the whole tree with the root `tsc -p tsconfig.json` (preserving
   `services/`, `infra/`, `apps/` structure under `dist/`), then teach Node's
   module resolver about the `@ems/*` aliases at runtime.

**Chosen**: Option 3. `npm run build:all` = `tsc -p tsconfig.json`. A new
`scripts/register-paths.js` reads the root `tsconfig.json`'s `compilerOptions.paths`,
strips the `.ts`/`.tsx` extensions from each mapping (tsconfig-paths' `createMatchPath`
checks file existence against the literal mapped string, and `index.ts` → `index.ts.js`
doesn't exist), and registers the result with `tsconfig-paths`. `start:prod` and
`apps/api/Dockerfile`'s `CMD` both `node -r ./scripts/register-paths.js dist/apps/api/src/main.js`.

**Why this won**: Lowest blast radius — no changes to any of the 21 already-built
services' import statements or `tsconfig.lib.json` files. Verified end-to-end by
loading the compiled `AppModule` directly (`node -r ./scripts/register-paths.js
-e "require('./dist/apps/api/src/app.module')"`) and confirming all `@ems/*`
resolutions succeed. See `delta-log.md` DELTA-4.

**Residual risk**: Every new `@ems/<name>` path alias added to `tsconfig.json`
must point at a `.ts` (not `.tsx`) entry file for the extension-stripping regex
in `register-paths.js` to work — if a future library's entry point is `.tsx`,
the regex (`/\.tsx?$/`) already covers it, but this is worth a comment in the
script if it's ever touched again.

---

## RA-2: Memory-constrained build verification strategy (3.9GB RAM + 400MB pagefile)

**Problem**: The dev machine has a ~4.4GB virtual-commit ceiling. `tsc --noEmit`
on the growing monorepo needs roughly 0.7GB+ free virtual memory for a 512MB
heap to succeed, and 1.3GB+ for a 1024MB heap. Below ~0.6GB free, `tsc` fails
with `FATAL ERROR: Zone Allocation failed - process out of memory` (exit 134) —
this happened mid-way through Batch 5.

**Options considered**:
1. Increase the Windows pagefile size (more virtual memory headroom).
2. Split `tsc --noEmit` into smaller per-service invocations (lower peak heap
   per run).
3. Ask the user to free RAM (close extra Claude Code windows / other apps)
   before each verification run, scaling `--max-old-space-size` to whatever's
   available.

**Chosen**: Option 3. User declined changing the pagefile size (option 1).
Option 2 was avoided because the root `tsconfig.json` project-references the
whole tree — a true per-service `tsc --noEmit` would still need to type-check
transitive `@ems/*` dependencies, giving little memory savings while adding
significant process-orchestration complexity.

**Why this won**: It's the only option that doesn't require permanent
environment changes the user explicitly ruled out, and it has a 100% success
rate once applied (every batch eventually verified at exit 0 after a memory-free
pause).

**Process established**: Per-batch workflow is: write files → update
`tsconfig.json` paths → update `app.module.ts` → check available virtual memory
→ run `tsc --noEmit --max-old-space-size=<scaled to free memory>` → fix issues →
report. If `tsc` OOMs, pause and ask the user to free memory (Option A) rather
than retrying in a loop.

**Implication for future batches**: Batches 7–10 and Phase E will hit the same
ceiling, likely sooner (larger `tsconfig.json` project graph each time). Budget
for at least one memory-pause per remaining batch.

---

## RA-3: Repo-wide ESLint/Prettier formatting debt surfaced by adding the CI lint gate

**Problem**: Phase D Bundle 2 (CI/CD) added `eslint --max-warnings=0` as a CI
gate. Running it for the first time surfaced 172 pre-existing formatting errors
spread across many files from earlier batches (`services/tenant`, `services/ticketing`,
`services/speaker`, `services/search`, etc.) — none were logic errors, all were
import-order/object-literal formatting that `eslint --fix` resolves automatically.

**Options considered**:
1. Set `--max-warnings` to the current error count (172) and ratchet it down
   over time.
2. Run `npm run lint` (eslint `--fix`) once across the whole monorepo to zero
   out the backlog, then gate at 0 going forward.

**Chosen**: Option 2. Ran the autofixer repo-wide, then re-verified `tsc --noEmit`
(exit 0) and `eslint --max-warnings=0` (exit 0).

**Why this won**: A ratcheting threshold (option 1) is a permanent reminder of
debt and a recurring source of CI confusion ("why did the count go up by 1?").
Since all 172 errors were auto-fixable formatting issues with zero logic risk,
clearing them in one pass was strictly better — confirmed safe by the
post-fix `tsc --noEmit` exit 0.

**Lesson for future work**: Run `npm run lint` locally before each batch's final
verification, not just at the end of Phase D — catches formatting drift early
and keeps the "one new ternary-formatting error in `json-logger.service.ts`"
class of issue (caught and fixed during Bundle 3) from accumulating.

---

## RA-4: Search implementation — Postgres ILIKE now, OpenSearch later

See `delta-log.md` DELTA-2 for the what/why summary. The analysis angle: this
was a **deliberate interface-preserving substitution** — `services/search`'s
`GET /search?q=&type=&eventId=&cursor=&limit=` contract, its Kafka topic
subscriptions, and its `SearchEntityType` union are all exactly what an
OpenSearch-backed implementation would also expose. The only thing that changes
when OpenSearch is introduced (for Batch 10's k-NN/semantic search) is the
internals of `search.service.ts`'s `upsert`/`search` methods and the entity
storage (`search.search_documents` table → OpenSearch index). No consumer of
`services/search` (UI routes per `ui-surface-map.md`, `ai-service` per
`ai-architecture.md` §4) needs to change.

**Implication**: Batch 10 planning should budget for a `search` service
migration as a discrete sub-task, but it is a swap-the-adapter change, not a
contract change — lower risk than it might first appear from `delta-log.md`
alone.

---

## RA-5: Schema naming — avoiding SQL reserved words

`order` → `ordering` (DELTA-1) was the only reserved-word collision found across
the 21 implemented service schemas. No other service name
(`auth`, `tenant`, `rbac`, `audit`, `event`, `agenda`, `speaker`, `exhibitor`,
`attendee`, `registration`, `onsite`, `ticketing`, `pricing`, `inventory`,
`payment`, `fulfillment`, `notification`, `engagement`, `analytics`, `search`)
collides with a reserved word in PostgreSQL. **Forward-looking note for Batches
8–10**: `networking`, `interactive-engagement` (or whatever GAP-2 resolves to),
and `ai-service` are also collision-free — no special handling anticipated.
