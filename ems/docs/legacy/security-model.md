> **Status: Retired (Partial).** §1, §3, §5, §7 superseded by
> `docs/03_fullstack_contracts/AUTH_AND_TENANCY_CONTRACT.md`. §4 (PII
> handling), §6 (rate limiting/abuse detection), §8 (secrets management)
> remain **active design targets** — not yet fully implemented. **Conflicts**:
> §2's role table has been resolved — **8 roles in `rbac.service.ts`
> `seedDefaultRoles()` are authoritative**: `tenant_admin`, `organizer`,
> `finance`, `support`, `exhibitor`, `speaker`, `onsite_staff`, `attendee`.
> No 9th `platform_admin` role is seeded in code (ROD-11/OCR-6 resolved
> 2026-06-17). §3's "tenant isolation middleware" is superseded — the
> `TenantScopedRepository` base class exists in `infra/common/src/base.repository.ts`
> but is **not used by any service** (see Phase 3.25 UC-9 resolution).

# Security Model

> Source: V1 Packet 0 Prompt 6 — Security Model (initial), refined by V2 DOCS Phase 3
> Prompt 9 — security model (adds PII handling, rate limiting — authoritative).

## 1. Authentication

- **Primary**: JWT access tokens (short-lived, ~15 min) + refresh tokens
  (long-lived, rotated on use, stored hashed in `AuthSession`).
- **Credentials**: passwords hashed with bcrypt/argon2 (`UserCredential.password_hash`);
  optional MFA (`UserCredential.mfa_enabled`, TOTP).
- **Enterprise SSO**: OAuth2 / SAML, per-tenant identity provider configuration
  (V1 Stream-10 enterprise scope) — implemented as an `auth` module extension,
  does not change the core `User`/`AuthSession` model.

## 2. Authorization (RBAC)

- Roles are tenant-scoped (`Role.tenant_id`, nullable for platform-global roles
  like `platform_admin`).
- Permissions are platform-global, immutable codes (`Permission.code`, e.g.,
  `event:create`, `order:refund`, `attendee:export`).
- `UserRole` assigns roles to users; a user's effective permission set is the
  union of permissions across their assigned roles.
- Every controller method declares required permission(s); the `rbac` guard
  resolves the caller's permission set from JWT `roles[]` claim (cached in Redis,
  `infra/cache`, invalidated on `role.assigned`/`role.revoked`).

### Default Roles (per tenant, seeded on `tenant.created`)

| Role | Key permissions |
|---|---|
| `tenant_admin` | full access within tenant |
| `organizer` | event/agenda/exhibitor/ticketing CRUD |
| `finance` | order/payment/refund read + refund execute |
| `support` | read-only + audit log access |
| `exhibitor` | own-booth/lead access only |
| `speaker` | own-profile/session access only |
| `onsite_staff` | check-in/badge endpoints only |
| `attendee` | self-service registration/ticket/profile endpoints |

`platform_admin` is a global role (not tenant-scoped), granted only to EMS
platform operators, and is the only role permitted through the
`/v1/admin/*` superuser guard.

## 3. Tenant Isolation

- Shared DB/schema, row-level `tenant_id` (see `system-architecture.md` §7).
- A base repository class injects `WHERE tenant_id = :tenantId` into every query;
  raw queries bypassing this base class are disallowed by lint rule.
- `tenant_id` is derived server-side from the JWT — never accepted from request
  body/query params (prevents tenant-spoofing).
- Cross-tenant access is only possible via `platform_admin` + `/v1/admin/*`,
  which is itself fully audited (`AuditLog`).

## 4. PII Handling

- PII fields (name, email, phone, address, payment metadata) are identified per
  entity in `domain-model.md` and are:
  - encrypted at rest where the field is not needed for querying/indexing
    (e.g., `RegistrantProfile.contact`), using column-level encryption (KMS-backed key);
  - excluded from `search`/OpenSearch indices except for fields explicitly
    needed for search (name, company, title — not contact details);
  - excluded from `AIInteractionLog`/`VectorEmbedding` payloads beyond
    profile/interest text the attendee has marked public.
- Data export/erasure (GDPR-style) requests are handled via `platform_admin`
  tooling that cascades across `attendee`, `registration`, `order`,
  `notification`, and `ai-service` records for a given `user_id`.

## 5. API Security

- TLS termination at the infra layer (`infra/deployment`); no plaintext HTTP in
  any environment beyond local dev.
- CORS restricted to configured tenant frontend origins (`TenantSettings`).
- Input validation per `api-standards.md` §9; output encoding to prevent stored
  XSS in any field rendered in `apps/web` (esp. free-text fields:
  `AttendeeProfile.bio`, `QAQuestion.question`, `Survey` responses).
- SQL injection prevented via ORM parameterization (TypeORM/Prisma) — no raw
  string-concatenated queries.

## 6. Rate Limiting & Abuse Prevention

- See `api-standards.md` §6 for limits. Additional abuse controls:
  - login endpoint: per-IP + per-account lockout after repeated `user.login_failed`
    (exponential backoff, tracked in Redis);
  - public registration/ticket endpoints: CAPTCHA on suspected bot traffic
    (threshold-based, V1 Stream-10 scope);
  - `inventory.reserved` holds are time-boxed (Redis TTL) to prevent cart-hoarding
    denial-of-inventory.

## 7. Audit Logging

- `audit` service consumes the full event stream (`event-catalog.md` §9) and
  writes immutable `AuditLog` rows: `actor_user_id`, `action`, `entity_type`,
  `entity_id`, `before`/`after` snapshots, `created_at`.
- Auth events (`user.login_succeeded`, `user.login_failed`,
  `user.password_changed`), role changes, tenant changes, and all financial
  mutations (`order.*`, `payment.*`) are always audited regardless of tenant
  settings.
- `AuditLog` is append-only (no update/delete API); retention per tenant plan.

## 8. Secrets Management

- Provider credentials (payment gateway keys, SSO certs, SMTP/SMS provider
  keys), per-tenant where applicable, stored in the deployment secret store
  (`infra/deployment`) — never in the database or source control.
- `infra/event-bus` and `infra/cache` connection credentials are
  environment-injected per deployment.
