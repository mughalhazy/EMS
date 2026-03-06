# EMS Security Architecture

## Objectives and Principles

The EMS security architecture protects users, customer tenant data, and platform services through a layered, defense-in-depth model.

Core principles:
- **Zero trust by default**: every request is authenticated, authorized, and validated.
- **Least privilege**: users, services, and admins only get the minimum required access.
- **Tenant-first boundaries**: tenant data and operations are logically isolated in every layer.
- **Secure by default**: secure transport, encryption, and auditability are mandatory platform defaults.
- **Traceability**: security-relevant actions are logged and attributable to an identity.

---

## 1) Authentication

EMS uses centralized identity and modern token-based authentication.

### User authentication
- **Primary protocol**: OpenID Connect (OIDC) / OAuth 2.1 for web and API clients.
- **Identity providers**: built-in EMS identity and enterprise federation (see SSO SAML section).
- **MFA support**: TOTP, WebAuthn/FIDO2, or IdP-enforced MFA.
- **Session controls**:
  - short-lived access tokens (e.g., 15 minutes)
  - refresh tokens with rotation and revocation
  - idle and absolute session timeout policies
- **Credential policy** (for local accounts): strong password policy, breached password checks, lockout + throttling.

### Service-to-service authentication
- **Mechanism**: OAuth2 client credentials or mTLS where required.
- **Secret handling**: client secrets and certificates stored in a managed secrets system; no hardcoded secrets.
- **Token audience/scopes**: strictly bound per service to prevent token reuse across services.

### Authentication hardening
- Global and per-identity rate limiting.
- IP/device anomaly detection and optional step-up authentication.
- CSRF protections for browser session flows.

---

## 2) RBAC Authorization

EMS authorization combines tenant scoping and role-based controls.

### Authorization model
- **Deny by default** for all operations.
- **Role-Based Access Control (RBAC)** with roles assigned per tenant.
- **Permission granularity** at resource-action level (e.g., `asset:read`, `asset:write`, `user:invite`).
- **Scope binding**: permissions evaluated against tenant context and resource ownership.

### Role structure (example)
- **Tenant Admin**: full tenant management and policy configuration.
- **Operator**: operational access to EMS resources, no tenant-level IAM changes.
- **Analyst**: read/reporting access.
- **Auditor**: read-only with audit log access.
- **Service Account**: non-human role with narrowly scoped API permissions.

### Enforcement points
- API gateway validates token and coarse scope.
- Application service enforces fine-grained authorization (role + tenant + resource checks).
- Data layer enforces tenant predicates to prevent cross-tenant access.

---

## 3) SSO SAML

EMS supports enterprise SSO using SAML 2.0 for workforce identity federation.

### SAML architecture
- EMS acts as **Service Provider (SP)**; enterprise IdP acts as **Identity Provider**.
- Per-tenant SAML configuration:
  - IdP metadata URL or XML upload
  - entity ID / ACS URL
  - x509 signing certificate validation
  - NameID and attribute mapping

### Security requirements
- Signed assertions are required; signed responses strongly recommended.
- Assertion encryption supported for high-security tenants.
- Strict validation of audience, issuer, recipient, timestamps, and replay protection.
- Just-in-time (JIT) provisioning optional; SCIM can be used for lifecycle management.

### Account mapping
- Unique immutable identity key (e.g., IdP subject + tenant).
- Attribute mappings for email, display name, group membership.
- Optional group-to-role mapping with explicit admin approval.

---

## 4) API Security

EMS APIs are secured through standards-based controls and input/output protections.

### API access controls
- OAuth2 bearer tokens with audience and scope checks.
- Optional mTLS and IP allowlists for privileged integrations.
- Per-client rate limiting, burst limits, and quota enforcement.
- Idempotency keys for sensitive mutation endpoints.

### API protection controls
- Strict schema validation for all request payloads.
- Input sanitization and output encoding to mitigate injection attacks.
- Pagination and field filtering to limit data exposure.
- Secure defaults for CORS (explicit origins only, no wildcard for credentials).
- Standard security headers (HSTS, X-Content-Type-Options, CSP where applicable).

### Secure API lifecycle
- Versioned APIs with deprecation policy.
- OpenAPI contract with security requirements documented.
- Automated SAST/DAST and dependency vulnerability scanning in CI.

---

## 5) Data Encryption

EMS protects data in transit and at rest across all layers.

### In transit
- TLS 1.2+ (prefer TLS 1.3) for all external and internal service traffic.
- Strong cipher suites and certificate rotation policy.
- HSTS for browser-facing endpoints.

### At rest
- Database, object storage, and backups encrypted with AES-256.
- Envelope encryption via cloud KMS/HSM-backed keys.
- Key rotation policies with separation of duties for key administration.

### Sensitive data controls
- Secrets stored in dedicated secret manager, never in source control.
- Optional field-level encryption/tokenization for highly sensitive attributes.
- Data minimization and retention policies enforced per data class.

---

## 6) Audit Logging

EMS maintains tamper-evident, searchable audit trails for security and compliance.

### What is logged
- Authentication events: login success/failure, MFA events, token issuance/revocation.
- Authorization events: access denied, privilege changes, role assignments.
- Administrative actions: tenant config updates, SSO changes, key/security policy changes.
- Data access events for sensitive operations.
- API events with request metadata (excluding sensitive payload contents).

### Logging controls
- Structured logs with correlation/request IDs and actor identity.
- Time synchronization using trusted NTP.
- Immutable or append-only log storage with retention controls.
- Centralized SIEM export and alerting for suspicious patterns.

### Privacy and safety
- No plaintext secrets in logs.
- Sensitive fields masked/redacted.
- Access to audit logs restricted to authorized roles.

---

## 7) Tenant Isolation

EMS enforces strict logical isolation between tenants throughout identity, compute, and data planes.

### Isolation strategy
- **Tenant context is mandatory** in authentication tokens and request context.
- **Application-level isolation**:
  - tenant-aware authorization checks
  - tenant-scoped caches and queues
- **Data-level isolation**:
  - every row/object tagged with tenant ID
  - mandatory tenant filter predicates for all reads/writes
  - optional stronger isolation tier (separate schema/database per tenant)

### Isolation safeguards
- Automated tests for cross-tenant access prevention.
- Policy checks in code review and CI to ensure tenant predicates are present.
- Operational guardrails for admin tooling to prevent multi-tenant data leakage.
- Tenant-level analytics access controls must be enforced in addition to RBAC for reporting endpoints.

### Tenant analytics access controls
- Every analytics request must satisfy both role permission checks and tenant analytics policy checks.
- Tenant policy includes independent switches for analytics enablement, cross-event reporting, and PII analytics access.
- Analytics APIs should fail closed (`42501`) when tenant policy or permission checks fail.

---

## Cross-Cutting Security Operations

### Monitoring and detection
- Real-time alerting for brute force, token abuse, privilege escalation, and anomalous tenant access.
- Threat detection rules tuned with tenant and environment context.

### Incident response
- Documented runbooks for account compromise, key compromise, and data exposure.
- Emergency controls: token revocation, forced logout, key rotation, tenant lock.

### Governance
- Periodic access reviews and role recertification.
- Security policy reviews and penetration testing.
- Compliance mapping (e.g., SOC 2, ISO 27001, GDPR as applicable).

---

## Reference Security Control Matrix (Condensed)

| Domain | Core Controls |
|---|---|
| Authentication | OIDC/OAuth2, MFA, session rotation, rate limiting |
| Authorization | RBAC, least privilege, deny-by-default, tenant-scoped checks |
| SSO SAML | Signed assertions, strict validation, per-tenant IdP config |
| API Security | Token scopes, mTLS option, schema validation, WAF/rate limits |
| Encryption | TLS in transit, AES-256 at rest, KMS-backed key management |
| Audit Logging | Immutable structured logs, SIEM export, redaction |
| Tenant Isolation | Tenant context enforcement, data predicates, isolation tiers |

This architecture provides a secure baseline for EMS and can be extended with customer-specific controls for regulated or high-assurance environments.

## QC-01 coverage addendum

### Expanded control requirements
- **Payment security:** tokenize cardholder data, enforce PCI-scoped segmentation, and avoid storing PAN/CVV in EMS domains.
- **Key management:** all encryption keys are managed via KMS/HSM with rotation policies and access audit.
- **Secrets management:** runtime secrets must come from managed secret stores, never static repository config.
- **Supply chain security:** SBOM generation, dependency scanning, and signed build artifacts are required in CI/CD.

### AI security controls
- Prompt construction applies policy-based redaction for PII and payment-linked attributes.
- Tenant-scoped retrieval filters are enforced before vector search execution.
- Model/provider policy enforces residency, retention mode, and blocked tool actions.
- High-risk AI actions require human approval and full audit traceability.
