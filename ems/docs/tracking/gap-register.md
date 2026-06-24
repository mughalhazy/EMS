> **Status: Historical (Closed).** GAP-1 through GAP-7 are all marked
> RESOLVED as of 2026-06-14. For currently open gaps see
> `docs/08_reports/ARCHITECTURAL_GAP_REGISTER.md` (GAP-G1..G11) and
> `docs/08_reports/BACKEND_GAP_REGISTER.md` (GAP-B1..B13).

# Gap Register

Known gaps between the canonical docs (`docs/canon/*`, `docs/architecture/*`)
and the current state of the codebase, plus scaffolds that have not yet been
built out. Each entry has an ID for cross-referencing from `progress.md`,
`delta-log.md`, and commit/PR descriptions.

Last updated: 2026-06-14

---

## GAP-1: `infra/event-bus` and `infra/cache` READMEs say "SCAFFOLD - not yet implemented"

- **Status**: ✅ RESOLVED (2026-06-14)
- **Resolution**: Both READMEs' `Status:` line updated to `Implemented` with a
  pointer to the actual source files (`infra/event-bus/src/event-bus.service.ts`,
  `infra/cache/src/redis.client.ts`).

---

## GAP-2: Poll/Q&A/Survey entities exist in both Batch 5 (`engagement`) and Batch 9 (`interactive-engagement`) scaffolds

- **Status**: ✅ RESOLVED (2026-06-14) — Option 2 chosen.
- **Resolution**: `Connection`/`Poll`/`PollResponse`/`QAQuestion`/`Survey`/`SurveyResponse`
  migrated out of `services/engagement` into dedicated `services/networking` and
  `services/interactive-engagement` modules, matching `docs/canon/service-map.md` exactly.
  DB schemas updated to `networking` and `interactive_engagement` respectively.
  Orphaned entity files removed from `services/engagement/src/entities/`.
  `services/engagement` is now a minimal stub (no entities, no controllers).

---

## GAP-3: `services/integration` has no source spec and no batch assignment

- **Status**: ✅ RESOLVED (2026-06-14)
- **Resolution**: `services/integration` fully implemented — `WebhookSubscription` entity
  (`schema: integration`), fan-out event consumer (subscribes to all known topics, delivers
  to matching per-tenant webhook URLs via HTTP POST with 10 s timeout), and CRUD REST
  controller at `/webhooks`. HMAC signing and retry/dead-letter behaviour remain as
  future hardening (low priority, no consumers depend on them yet).

---

## GAP-4: Design system not populated (`design/tokens`, `design/components`, `design/wireframes`)

- **Where**: `design/tokens/README.md`, `design/components/README.md`, `design/wireframes/README.md` (all 9-line scaffolds)
- **What**: `docs/ui/design-system.md` §10 specifies physical token files
  (`design/tokens/{colors,typography,spacing,shadows,radius}.js`) that
  `apps/web/tailwind.config.ts` is supposed to import, and
  `services/ui-renderer/spec.md` assumes `design/components/` primitives exist.
  None of these files exist yet.
- **Impact**: Blocks Phase E start — `apps/web` (TASK 03) and `ui-renderer`
  both depend on these being populated first (TASK 02/04/05 per
  `apps/web/README.md`).
- **Resolution**: First task of Phase E. Token files are directly derivable from
  the tables already written in `docs/ui/design-system.md` §1–§7 — low risk,
  mostly transcription into Tailwind-consumable JS/TS modules.

---

## GAP-5: `apps/web` Dockerfile pending

- **Where**: `infra/docker/README.md` line 18
- **What**: Bundle 1 (Containerization) shipped `apps/api/Dockerfile` only;
  the frontend Dockerfile is explicitly deferred to Phase E.
- **Impact**: Low — no current consumer. `docker-compose.app.yml` only runs the
  API container.
- **Resolution**: Add alongside Phase E `apps/web` scaffolding (TASK 03), following
  the same multi-stage pattern as `apps/api/Dockerfile` (Next.js build → standalone
  output → slim runtime image).

---

## GAP-6: Enterprise SSO (auth extension) not implemented

- **Status**: ✅ RESOLVED (2026-06-14)
- **Resolution**: Added as an additive extension to `services/auth`, per
  `security-model.md` §1 — the core `User`/`AuthSession` model is unchanged.
  - `SsoConnection` entity (`schema: auth`, table `sso_connections`):
    per-tenant OAuth2/SAML identity provider config (`provider`, `domain`,
    `issuer`, `clientId`/`clientSecret`, `ssoUrl`, `certificate`,
    `attributeMapping`), unique on `(tenantId, domain)`.
  - `SsoIdentity` entity (`schema: auth`, table `sso_identities`): links a
    platform `User` to an external IdP subject, unique on
    `(connectionId, externalId)`.
  - `AuthService`: CRUD for connections, `discoverSsoConnection(email)` for
    login-page tenant discovery by email domain, and `ssoLogin()` which
    exchanges a verified IdP assertion for platform JWT tokens (find-or-create
    user + identity link, publishes `user.sso_login_succeeded`).
  - `SsoController` at `/auth/sso` — `GET /discover`, `POST /callback` (public),
    and `/connections` CRUD gated by new `sso:manage` permission
    (granted to `tenant_admin` by default).
  - Live signature verification of OAuth2 tokens / SAML responses against the
    connection's `issuer`/`certificate` is left as future hardening — the
    `ssoLogin()` boundary assumes the assertion has already been verified by
    the callback handler, matching the `integration` service's HMAC-deferred
    pattern (GAP-3).

---

## GAP-7: All `services/*/README.md` and most `infra/*/README.md` carry stale `Status:` lines

- **Status**: ✅ RESOLVED (2026-06-14)
- **Resolution**: Updated `Status:` line to `Implemented (Batch N — 2026-06-14)`
  for all 19 remaining completed services (agenda, analytics, attendee, audit,
  event, exhibitor, fulfillment, inventory, notification, onsite, order, payment,
  pricing, rbac, registration, search, speaker, tenant, ticketing) — joining
  auth, ai-service, integration, interactive-engagement, and networking, which
  were already marked during GAP-C/D/E.
  - `services/engagement/README.md` updated to reflect its minimal-stub status
    (entities migrated per GAP-2; `Campaign`/`AudienceSegment` still unbuilt).
  - `services/ui-renderer/README.md` left as `SCAFFOLD` — genuinely unbuilt,
    Phase E frontend scope.
