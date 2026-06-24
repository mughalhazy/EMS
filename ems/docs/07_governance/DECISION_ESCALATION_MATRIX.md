Status: Retired
Authority Level: Critical
Last Reviewed: 2026-06-17
Owner: Shared

> **Status: Retired.** Superseded as of 2026-06-17 by
> `docs/07_governance/REVISED_DECISION_ESCALATION_MATRIX.md`, which
> introduces a third execution tier (SAFE_REPOSITORY_HYGIENE) between
> AUTONOMOUS and REQUIRES_APPROVAL. The content below is preserved for
> historical reference only. Use `REVISED_DECISION_ESCALATION_MATRIX.md`
> for all current decisions.

# Decision Escalation Matrix

> Classifies actions an AI session (or human contributor) might take in this
> repository into AUTONOMOUS, REQUIRES APPROVAL, and PROHIBITED, adjusted for
> EMS's actual architecture (multi-tenant SaaS, schema-per-service Postgres,
> Kafka event bus, RBAC, audit logging — see `00_authority/ADR-001` and
> `06_decisions/ADR-001_PROJECT_FOUNDATION.md`).

## AUTONOMOUS (proceed without asking; verify with `REQUIRED_VALIDATIONS`)

- Documentation updates: `docs/00_authority/*`, `docs/07_governance/*`,
  `docs/08_reports/*`, `README.md` `Status:` line corrections, gap-register
  updates.
- Adding new `.spec.ts` test files (unit tests) for existing code, as long as
  they do not require new test infrastructure or mocking frameworks not
  already in `package.json`.
- Safe refactors that do not change: entity field names/types, table/schema
  names, API endpoint paths or response shapes, Kafka topic names/payload
  shapes, or permission codes. E.g.: extracting a private helper method,
  renaming a local variable, adding comments-free clarity improvements,
  reorganizing imports.
- Adding new **optional** fields to entities/DTOs (additive, non-breaking)
  with corresponding migration — *if* a migration workflow already exists and
  is exercised elsewhere (TBD – REQUIRES VERIFICATION: confirm migration
  tooling is active before treating this as fully autonomous; if unsure,
  escalate).
- Adding new Kafka topics/events that no existing consumer needs to handle
  (purely additive to `infra/event-bus/src/topics.ts` + `event-catalog.md`).
- Adding new read-only endpoints that expose already-stored data under
  existing permission codes.
- Fixing lint/type errors that do not change runtime behavior.

## REQUIRES APPROVAL (ask the user first, even if technically capable)

- **Schema changes**: any change to an existing entity's columns (add
  required column, rename, type change, remove), new tables in an existing
  schema, new Postgres schemas, TypeORM migrations that run against real data.
- **Auth/RBAC changes**: changes to `services/auth`, `services/rbac`,
  `infra/common` guards/decorators (`JwtAuthGuard`, `PermissionsGuard`,
  `RequirePermissions`), JWT payload shape, SSO connection/identity logic,
  permission code additions/removals, default role permission sets.
- **Billing/payment changes**: anything in `services/payment`,
  `services/order`, `services/fulfillment`, `services/pricing`,
  `services/inventory` that affects money movement, refunds, or inventory
  reservation correctness.
- **Infrastructure changes**: `infra/docker/*`, `.github/workflows/*`,
  `infra/deployment/*`, `infra/event-bus/*` config (beyond additive topic
  registration), `infra/cache/*` config, environment variable redirection
  (`HKCU\Environment` workspace isolation settings).
- **Dependency changes**: any `package.json` add/remove/upgrade of a
  dependency or devDependency, Node/npm engine version changes.
- **Breaking API/contract changes**: removing/renaming an endpoint, removing
  a response field, removing/renaming a Kafka topic or changing an existing
  event's payload shape in a non-additive way.
- **Cross-service architecture changes**: anything that would introduce a
  cross-schema foreign key, change the schema-per-service convention, change
  the "single process, all modules" deployment model, or reassign entity
  ownership between services (e.g. resolving GAP-G3
  `Campaign`/`AudienceSegment` placement).
- **Editing `docs/canon/*`, `docs/architecture/*`, `docs/tracking/*`,
  `BUILD_BLUEPRINT.md`** in ways that change their meaning (not just
  `Status:`/date metadata corrections) — per Documentation Freshness Rule in
  `AI_OPERATING_CONTEXT.md`.
- **Phase transitions**: starting Phase E (frontend) or any new "batch" of
  work not yet scoped in `00_authority/FEATURE_SCOPE.md`.

## PROHIBITED (do not do, even if asked, without explicit human override and justification)

- Deleting production data (any `DELETE`/`DROP`/`TRUNCATE` against non-local,
  non-test databases; deleting rows via API in ways that bypass soft-delete
  conventions if such conventions exist — TBD – REQUIRES VERIFICATION whether
  soft-delete is used anywhere).
- Removing or weakening audit logging (`services/audit`, `AuditLog` entity,
  or any `AuditLog`-writing code path in auth/rbac/tenant/financial services).
- Removing or weakening tenant isolation (`tenant_id` filtering in the shared
  base repository, `infra/common` guards that enforce tenant scoping).
- Disabling or bypassing `JwtAuthGuard`/`PermissionsGuard` on existing
  protected endpoints.
- Committing secrets (API keys, DB credentials, JWT signing keys) into the
  repository. (Note: during the C: workspace-sealing audit this session,
  plaintext API keys were observed in `HKCU\Environment` — these must never
  be written into files, logs, or documentation.)
- Force-pushing to shared branches, rewriting published git history, or
  skipping CI/lint/test gates (`--no-verify`, `--max-warnings` overrides)
  without explicit user instruction.
- Running `docker:reset` (`docker-compose down -v`) or any command that
  destroys persistent volumes without explicit confirmation.

## Notes

- This matrix is itself a Critical-authority document — changes to it are
  REQUIRES APPROVAL.
- When an action's classification is ambiguous, default to the more
  restrictive classification and ask the user.
