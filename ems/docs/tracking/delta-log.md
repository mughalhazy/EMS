# Delta Log — Spec vs. Implementation

Records every point where the actual implementation (Batches 1–6, Phase D)
diverges from what `docs/canon/*` / `docs/architecture/*` literally specify.
Unlike `gap-register.md` (things not yet built), this file is about things
that **were** built, but differently than documented — so the canon docs and
the code don't currently agree. Each entry notes whether the canon doc or the
code should be considered authoritative going forward.

Last updated: 2026-06-17

---

## DELTA-1: `order` schema renamed to `ordering`

- **Canon says**: `docs/canon/data-architecture.md` §1 — "one schema per service
  (`auth.*`, `event.*`, `order.*`, ...)".
- **Implementation**: The `order` service's PostgreSQL schema is named `ordering`,
  not `order`.
- **Reason**: `order` is a reserved word in SQL (used in `ORDER BY`), which causes
  quoting friction and potential driver issues as an unquoted schema identifier.
- **Authoritative**: Code. `data-architecture.md` §1's `order.*` example should be
  read as illustrative naming, not a literal requirement — `ordering.*` is the
  real schema name.
- **Action**: Optional — add a footnote to `data-architecture.md` §1 noting the
  `order` → `ordering` rename and the reason, so future readers don't search for
  a non-existent `order` schema.

---

## DELTA-2: `search` implemented via PostgreSQL `ILIKE`, not OpenSearch

- **Canon says**: `docs/canon/service-map.md` (search section), `docs/canon/data-architecture.md`
  §4, and `docs/canon/read-model-catalog.md` all describe `search` as owning
  OpenSearch indices (`events`, `sessions`, `speakers`, `attendees`), populated
  via Kafka consumers, with vector fields for semantic search.
- **Implementation**: `services/search` (Batch 6) uses a single PostgreSQL table
  `search.search_documents` (`SearchDocument` entity, `@Unique(['tenantId','entityType','entityId'])`)
  with a `SearchEntityType` union covering the same 5 entity types (`event`,
  `session`, `speaker`, `exhibitor`, `attendee` — note `exhibitor` was added,
  not in the original 4-index list). Queries use `ILIKE` on `title`/`content`
  with cursor pagination. It still subscribes to the same Kafka topics
  (`event.*`, `session.*`, `speaker.*`, `exhibitor.*`, `attendee.*`, plus
  `embedding.updated`) and exposes the same `GET /search?q=&type=&eventId=` shape.
- **Reason**: OpenSearch is provisioned in `infra/docker/docker-compose.yml` but
  wiring a second datastore into Batch 6 was deferred — Postgres ILIKE gives a
  working, schema-consistent full-text search read model with the same external
  contract, swappable later without changing `service-map.md`'s consumer/producer
  relationships.
- **Authoritative**: Canon docs remain the **target** architecture (OpenSearch +
  vector/k-NN, required for `docs/architecture/ai-architecture.md` §4 semantic
  search). Current code is an interim implementation behind the same API surface.
- **Action**: When Batch 10 (`ai-service`) is built, `services/search` needs a
  migration from `search.search_documents` (ILIKE) to OpenSearch indices to
  support `embedding.updated` / k-NN as designed. Track this as a prerequisite
  for Batch 10, not just a Batch 6 cleanup.

---

## DELTA-3: `exhibitor` added as a 5th search entity type (not in original 4-index list)

- **Canon says**: `docs/canon/read-model-catalog.md` "Search Indices" section and
  `docs/canon/domain-model.md` §8 list exactly 4 OpenSearch indices: `events`,
  `sessions`, `speakers`, `attendees`.
- **Implementation**: `SearchEntityType = 'event' | 'session' | 'speaker' | 'exhibitor' | 'attendee'`
  — `exhibitor` was added during Batch 6 implementation, with `services/search`
  subscribing to `exhibitor.*` topics as well.
- **Reason**: Exhibitor directory search (booth/sponsor discovery) is a natural
  extension and `exhibitor.created`/`sponsor.created` events already exist
  (`docs/canon/event-catalog.md` §2) — no new infrastructure required.
- **Authoritative**: Code's superset is a reasonable enhancement.
- **Action**: Update `docs/canon/read-model-catalog.md` "Search Indices" table and
  `domain-model.md` §8 to add `exhibitors` as a 5th index/entity type, so DELTA-2's
  future OpenSearch migration plans for 5 indices, not 4.

---

## DELTA-4: Custom `scripts/register-paths.js` runtime path-alias resolver (not in any canon doc)

- **Canon says**: Nothing — `docs/architecture/system-architecture.md` §9 just
  points to `BUILD_BLUEPRINT.md` §11 for build sequencing; no doc specifies *how*
  `@ems/*` TypeScript path aliases resolve at runtime in the compiled `dist/` output.
- **Implementation**: `npm run build:all` compiles the whole monorepo via the root
  `tsconfig.json` (`tsc -p tsconfig.json`, preserving directory structure under
  `dist/`). `scripts/register-paths.js` strips `.ts`/`.tsx` extensions from the
  `tsconfig.json` path-mapping values and registers them with `tsconfig-paths` so
  compiled `.js` files resolve `@ems/*` aliases against `dist/`. `npm run start:prod`
  and `apps/api/Dockerfile`'s `CMD` both load this script via `-r`.
- **Reason**: `nest build`'s default project only builds `apps/api`, not the
  `@ems/*` libs under `services/`/`infra/` — there was no out-of-the-box way to
  produce a runnable production build of the monorepo. This was a necessary
  architectural addition discovered during Phase D Bundle 1.
- **Authoritative**: Code is the source of truth; this is a real (and previously
  undocumented) piece of the build architecture.
- **Action**: `docs/developer/README.md` already documents the *usage*
  (`build:all`/`start:prod`). Consider adding a short subsection to
  `docs/architecture/system-architecture.md` §8/§9 describing the `tsc -p
  tsconfig.json` + `register-paths.js` pattern as the canonical production build,
  since it's load-bearing for every future service.

---

## DELTA-5: `EventBusService` API shape (`publish<T>`/`subscribe`) not specified in canon docs

- **Canon says**: `docs/canon/event-catalog.md` and `docs/architecture/system-architecture.md`
  §6 describe the outbox pattern and topic naming conventions but not a concrete
  TypeScript API.
- **Implementation**: `EventBusService.publish<T>(topic: TopicName, event: Omit<DomainEvent<T>, 'eventId'|'occurredAt'>)`
  and `EventBusService.subscribe(groupId: string, topics: TopicName[], handler: (event, topic) => Promise<void>)`,
  with a generated `Topics` const / `TopicName` union in `infra/event-bus/src/topics.ts`,
  and an `isConnected()` health-check method added in Phase D Bundle 3.
- **Reason**: A concrete, type-safe API was needed for all 21 implemented services
  to consume consistently; this was designed during Phase B infra scaffolding.
- **Authoritative**: Code. This is an implementation detail one level below what
  canon docs are meant to specify.
- **Action**: None required — optionally document the `EventBusService` public
  API in a short `infra/event-bus/README.md` update (ties into GAP-1).

---

## DELTA-6: `JsonLogger` / `RequestLoggerMiddleware` / `/v1/health` + `/v1/health/ready` (Phase D additions, not in Phase A docs)

- **Canon says**: `docs/canon/security-model.md` and `docs/architecture/system-architecture.md`
  don't mention structured logging or health-check endpoints explicitly (Phase A
  predates Phase D's observability scope).
- **Implementation**: `@ems/common` now exports `JsonLogger` (NestJS `LoggerService`,
  JSON-line stdout) and `RequestLoggerMiddleware` (assigns/propagates `x-request-id`,
  logs method/url/status/duration). `apps/api/src/health/health.controller.ts`
  exposes `GET /v1/health` (liveness, always 200) and `GET /v1/health/ready`
  (checks Postgres `SELECT 1`, Redis ping, `EventBusService.isConnected()` — 503 on
  failure).
- **Reason**: Phase D Bundle 3 (Observability) scope, executed after Phase A docs
  were written.
- **Authoritative**: Code; `docs/developer/README.md` already documents the health
  endpoints (added during Bundle 3).
- **Action**: None required — this is net-new functionality correctly documented
  in `docs/developer/README.md`. Listed here for completeness/traceability.

---

## DELTA-7: Pagination model — cursor-based (spec) vs. page-based (code)

- **Spec**: `docs/canon/api-standards.md` §5 specifies cursor-based pagination
  (`?cursor=<opaque_token>&limit=`) as the standard for all list endpoints.
- **Code**: All implemented list endpoints use page-based pagination
  (`?page=<number>&limit=`), as documented in `docs/01_backend/API_CONTRACT.md`
  and `docs/03_fullstack_contracts/DATA_SHAPE_REGISTRY.md`.
- **Impact**: A frontend client built against `api-standards.md` would send
  `cursor=` params that the actual API ignores; actual API returns `page`, `limit`,
  `total`, `totalPages` in its response envelope, not cursor tokens.
- **Reason**: During implementation, page-based pagination was chosen as the
  practical approach for the initial build. Cursor-based pagination may be adopted
  in a future API version for large datasets — the `CONTRACT_VERSION_REGISTRY.md`
  versioning policy governs that transition.
- **Authoritative**: Code / `API_CONTRACT.md` / `DATA_SHAPE_REGISTRY.md` —
  page-based is what is implemented.
- **Action**: `api-standards.md` §5 is superseded on this point; see
  `CONFLICT_ANALYSIS_REPORT.md` C-3 and `DOCUMENT_RETIREMENT_PLAN.md`.
- **Surfaced**: Full Repository Normalization Audit 2026-06-17.

---

## DELTA-8: Kafka topic count and naming — docs claimed 57 invented names; code has 64 real names

- **Spec**: `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md` (prior to 2026-06-17
  correction) listed 57 Kafka topics with invented prefixes: `agenda.session_created`,
  `networking.connection_requested`, `interactive.poll_created`, `ai.embedding_updated`,
  `rbac.role_assigned`, etc.
- **Code**: `infra/event-bus/src/topics.ts` defines exactly 64 topics. All use flat
  domain-prefix naming without the sub-domain nesting: `session.created`,
  `connection.requested`, `poll.created`, `embedding.updated`, `role.assigned`, etc.
  Service-level `SERVICE_CATALOG.md` entries carried the same invented names forward.
- **Root cause**: Prior documentation was written by inference rather than extracted
  from the actual `topics.ts` source. The 7 extra topics (64 vs 57) include
  `user.login_failed`, `user.password_changed`, `user.status_changed`,
  `event.unpublished`, `inventory.depleted`, `notification.failed`,
  `campaign.scheduled`.
- **Impact**: Any consumer built from prior documentation would subscribe to
  non-existent topics and miss real events.
- **Authoritative**: Code (`infra/event-bus/src/topics.ts`).
- **Action**: Fixed 2026-06-17 — `EVENT_AND_QUEUE_ARCHITECTURE.md` Section 5
  completely rewritten; all SERVICE_CATALOG.md Kafka publish/subscribe rows corrected.
  All 64 topics verified against topics.ts.
- **Surfaced**: Pre-Frontend Delta Audit 2026-06-17.
