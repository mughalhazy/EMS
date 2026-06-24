Status: Active
Authority Level: High
Last Reviewed: 2026-06-20
Owner: Project Owner

# External Dependency Register

> Contains items requiring external provisioning, credentials, onboarding,
> registration, or vendor approval.
>
> Purpose: Prevent external onboarding tasks from appearing as software gaps.
> External dependencies do NOT block development unless explicitly required.
>
> Project Completion Rule: EXTERNAL_DEPENDENCY items do NOT need to be complete
> for development to proceed. They are prerequisites for PRODUCTION LAUNCH only.

---

## Status Overview

| ID | Dependency | Status | Blocks |
|---|---|---|---|
| EXT-1 | Payment Gateway Account (Stripe recommended) | NOT PROVISIONED | Production launch; GAP-FE7-B |
| EXT-2 | Production SMTP Provider | PARTIALLY — env vars set; provider unknown | Production email delivery |
| EXT-3 | OpenAI API Key | PROVISIONED (in env) | ROD-10 implementation |
| EXT-4 | Google Gemini API Key | PROVISIONED (in env) | Alternative to EXT-3 |
| EXT-5 | DeepSeek API Key | PROVISIONED (in env) | Alternative to EXT-3 |
| EXT-6 | Production Kafka Cluster | INFRASTRUCTURE — local only | Production deployment |
| EXT-7 | Production Redis Instance | INFRASTRUCTURE — local only | Production deployment |
| EXT-8 | Production Postgres Instance | INFRASTRUCTURE — local only | Production deployment |
| EXT-9 | Domain + SSL Certificate | NOT PROVISIONED | Production launch |
| EXT-10 | JWT_SECRET (production value) | MUST ROTATE before production | Production security |

---

## EXT-1: Payment Gateway Account {#payment-gateway}

| Field | Value |
|---|---|
| Item ID | EXT-1 |
| Title | Payment Gateway Account and Credentials |
| Classification | EXTERNAL-DEPENDENCY |
| Current Status | NOT PROVISIONED |
| Dependency Type | Vendor account + credentials |
| Recommended Vendor | Stripe (Stripe Elements; best NestJS/Next.js documentation; hosted fields minimize PCI scope) |
| Alternatives | PayPal, Braintree, Razorpay (regional), JazzCash (Pakistan), Easypaisa (Pakistan) |
| What Is Needed | Merchant account; publishable key + secret key; webhook endpoint registration |
| Blocks | GAP-FE7-B (gateway SDK integration, Step 3 of checkout); production commerce |
| Does NOT Block | Phase E development; S-06 scaffold (placeholder form works without credentials) |
| Owner Required | YES — account provisioning is owner action |
| External Dependency | YES |
| Future Impact | HIGH — required for production revenue collection |
| Resolution Path | Owner opens gateway account; provides API keys; frontend integrates Stripe Elements in Step 3 |
| Related Register | OUT_OF_SCOPE_REGISTER.md#gap-fe7b, SAFE_DEFAULT_REGISTER.md#gap-fe7a |

---

## EXT-2: Production SMTP Provider {#smtp}

| Field | Value |
|---|---|
| Item ID | EXT-2 |
| Title | Production SMTP Provider Credentials |
| Classification | EXTERNAL-DEPENDENCY |
| Current Status | PARTIALLY — `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` env vars exist; production provider identity unknown |
| Dependency Type | Credentials / vendor account |
| Recommended Vendor | AWS SES (cheapest at scale), SendGrid (developer-friendly), Mailgun, Postmark |
| What Is Needed | SMTP hostname, port, auth credentials; domain verification (SPF/DKIM/DMARC) |
| Blocks | Production email delivery (transactional emails, notification campaigns) |
| Does NOT Block | Phase E development; notification service compiles and runs (LogTransport used in dev) |
| Owner Required | YES — vendor account and domain DNS configuration |
| External Dependency | YES |
| Future Impact | HIGH — required for all notification workflows |
| Resolution Path | Owner provisions SMTP account; updates env vars; verifies domain |
| Related Register | AUTO_CLOSED_REGISTER.md#itbd-3 |

---

## EXT-3: OpenAI API Key {#openai}

| Field | Value |
|---|---|
| Item ID | EXT-3 |
| Title | OpenAI API Key (Embeddings) |
| Classification | EXTERNAL-DEPENDENCY |
| Current Status | PROVISIONED — `OPENAI_API_KEY` confirmed in `HKCU\Environment` |
| Dependency Type | API credentials (already provisioned) |
| Vendor | OpenAI |
| Usage | `text-embedding-3-small` embeddings for semantic search |
| What Is Needed | Nothing — key already in environment |
| Blocks | Nothing — ROD-10 is SAFE-DEFAULT and can be implemented |
| Does NOT Block | Anything |
| Owner Required | NO — already provisioned |
| External Dependency | YES (already met) |
| Future Impact | HIGH — enables semantic search once ROD-10 implemented |
| Resolution Path | ROD-10 implementation proceeds using this key |
| Related Register | SAFE_DEFAULT_REGISTER.md#rod-10 |

---

## EXT-4: Google Gemini API Key {#gemini}

| Field | Value |
|---|---|
| Item ID | EXT-4 |
| Title | Google Gemini API Key (Alternative AI) |
| Classification | EXTERNAL-DEPENDENCY |
| Current Status | PROVISIONED — `GEMINI_API_KEY` confirmed in `HKCU\Environment` |
| Dependency Type | API credentials (already provisioned; alternative to EXT-3) |
| Vendor | Google |
| Usage | Alternative embedding/completion vendor if OpenAI is not selected |
| Blocks | Nothing |
| Owner Required | NO |
| External Dependency | YES (already met) |
| Future Impact | LOW — available as fallback |
| Related Register | SAFE_DEFAULT_REGISTER.md#rod-10 |

---

## EXT-5: DeepSeek API Key {#deepseek}

| Field | Value |
|---|---|
| Item ID | EXT-5 |
| Title | DeepSeek API Key (Alternative AI) |
| Classification | EXTERNAL-DEPENDENCY |
| Current Status | PROVISIONED — `DEEPSEEK_API_KEY` confirmed in `HKCU\Environment` |
| Dependency Type | API credentials (already provisioned; alternative to EXT-3) |
| Vendor | DeepSeek |
| Blocks | Nothing |
| Owner Required | NO |
| External Dependency | YES (already met) |
| Future Impact | LOW |
| Related Register | SAFE_DEFAULT_REGISTER.md#rod-10 |

---

## EXT-6: Production Kafka Cluster {#kafka}

| Field | Value |
|---|---|
| Item ID | EXT-6 |
| Title | Production Kafka Cluster |
| Classification | EXTERNAL-DEPENDENCY |
| Current Status | LOCAL ONLY — `docker-compose` Kafka for development |
| Dependency Type | Infrastructure provisioning |
| Options | Confluent Cloud, AWS MSK, RedpandaCloud, self-hosted |
| What Is Needed | Kafka broker URLs; `KAFKA_BROKERS` env var for production |
| Blocks | Production deployment |
| Does NOT Block | All development work |
| Owner Required | YES — infrastructure selection and cost decision |
| External Dependency | YES |
| Future Impact | HIGH — required for all event-driven workflows in production |
| Related Register | — |

---

## EXT-7: Production Redis Instance {#redis}

| Field | Value |
|---|---|
| Item ID | EXT-7 |
| Title | Production Redis Instance |
| Classification | EXTERNAL-DEPENDENCY |
| Current Status | LOCAL ONLY — Docker Redis for development |
| Dependency Type | Infrastructure provisioning |
| Options | AWS ElastiCache, Redis Cloud, Upstash, self-hosted |
| What Is Needed | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` env vars for production |
| Blocks | Production deployment (idempotency, rate limiting, distributed locks) |
| Does NOT Block | All development work |
| Owner Required | YES — infrastructure decision |
| External Dependency | YES |
| Future Impact | HIGH |
| Related Register | — |

---

## EXT-8: Production Postgres Instance {#postgres}

| Field | Value |
|---|---|
| Item ID | EXT-8 |
| Title | Production PostgreSQL Instance |
| Classification | EXTERNAL-DEPENDENCY |
| Current Status | LOCAL ONLY — Docker Postgres for development |
| Dependency Type | Infrastructure provisioning |
| Options | AWS RDS, Supabase, Neon, Railway, self-hosted |
| What Is Needed | `DATABASE_URL` production connection string |
| Blocks | Production deployment |
| Does NOT Block | All development work |
| Owner Required | YES — infrastructure decision |
| External Dependency | YES |
| Future Impact | HIGH |
| Related Register | — |

---

## EXT-9: Domain and SSL Certificate {#domain}

| Field | Value |
|---|---|
| Item ID | EXT-9 |
| Title | Production Domain and SSL Certificate |
| Classification | EXTERNAL-DEPENDENCY |
| Current Status | NOT PROVISIONED |
| Dependency Type | Domain registration + DNS + TLS |
| Blocks | Production launch |
| Does NOT Block | All development work |
| Owner Required | YES — domain name is owner decision |
| External Dependency | YES |
| Future Impact | HIGH |
| Related Register | — |

---

## EXT-10: JWT_SECRET Production Rotation {#jwt-secret}

| Field | Value |
|---|---|
| Item ID | EXT-10 |
| Title | JWT_SECRET must be rotated before production |
| Classification | EXTERNAL-DEPENDENCY |
| Current Status | Dev value in use — must not reach production |
| Dependency Type | Security — secret rotation |
| What Is Needed | Generate cryptographically random 256-bit secret; set as `JWT_SECRET` env var in production environment; rotation invalidates all existing sessions (acceptable for production launch) |
| Blocks | Secure production launch |
| Does NOT Block | All development work |
| Owner Required | YES — secret management ownership |
| External Dependency | NO (internal action, but owner-owned) |
| Future Impact | CRITICAL — security |
| Related Register | — |
