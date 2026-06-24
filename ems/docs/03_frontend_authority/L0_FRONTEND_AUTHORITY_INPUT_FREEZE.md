Status: FROZEN
Authority Level: Critical
Freeze Date: 2026-06-20
Owner: AI
Phase: L0 — Pre-Design Input Freeze

# L0 Frontend Authority Input Freeze

> This document is the single frozen input pack for Phase E frontend implementation.
> Claude Design and Claude Code MUST treat every item in this document as approved and final.
> No new routes, screens, workflows, roles, permissions, or APIs may be invented.
> Deviations from this document require a formal amendment — they cannot be made during design.

---

## Freeze Verdict

**L0 FROZEN**

All inputs verified against backend code (code-verified 2026-06-17).
Frontend-impacting gaps: 3 — all have approved mitigations; none block implementation.
Owner decisions pending: 0.
Phase E authorization: GRANTED.

---

## Section 1: Approved Roles (8 — FROZEN)

Source: `services/rbac/src/rbac.service.ts` DEFAULT_ROLES. These are the only authoritative roles.

| Role | Persona | Permissions | Default on registration |
|---|---|---|---|
| `tenant_admin` | Platform administrator | All 23 (full access) | No — manually assigned |
| `organizer` | Event manager | 11 domain + role:read + user:read | No — manually assigned |
| `finance` | Finance/reporting | commerce:manage, analytics:read, audit:read | No — manually assigned |
| `support` | Customer support | user:read, attendee:manage, registration:manage, analytics:read, audit:read | No — manually assigned |
| `exhibitor` | Booth/sponsor rep | exhibitor:manage (own records only) | No — manually assigned |
| `speaker` | Session speaker | None (authenticated routes only) | No — manually assigned |
| `onsite_staff` | Event day staff | onsite:operate, attendee:manage | No — manually assigned |
| `attendee` | Event participant | None (authenticated routes only) | **YES** — auto-assigned on `user.registered` |

**EXCLUDED**: No `platform_admin`, `admin`, `event_manager`, `content_manager`, `finance_manager` or any other role. The 8 above are authoritative.

---

## Section 2: Approved Permissions (23 — FROZEN)

Source: rbac.service.ts PLATFORM_PERMISSIONS (12) + Phase 2.95 collapse OCR-2 recommendation (11 domain).

### Governance Permissions (12 — in code)

| Permission | Assigned to |
|---|---|
| `user:read` | tenant_admin, organizer, support |
| `user:write` | tenant_admin |
| `user:delete` | tenant_admin |
| `tenant:read` | tenant_admin |
| `tenant:write` | tenant_admin |
| `tenant:suspend` | tenant_admin |
| `sso:manage` | tenant_admin |
| `role:read` | tenant_admin, organizer |
| `role:write` | tenant_admin |
| `role:assign` | tenant_admin |
| `role:revoke` | tenant_admin |
| `audit:read` | tenant_admin, finance, support |

### Domain Permissions (11 — OCR-2 recommended, pending confirmation)

| Permission | Assigned to |
|---|---|
| `event:manage` | tenant_admin, organizer |
| `agenda:manage` | tenant_admin, organizer |
| `speaker:manage` | tenant_admin, organizer |
| `attendee:manage` | tenant_admin, organizer, support, onsite_staff |
| `registration:manage` | tenant_admin, organizer, support |
| `exhibitor:manage` | tenant_admin, organizer, exhibitor* |
| `commerce:manage` | tenant_admin, organizer, finance |
| `onsite:operate` | tenant_admin, organizer, onsite_staff |
| `analytics:read` | tenant_admin, organizer, finance, support |
| `campaign:manage` | tenant_admin, organizer |
| `integration:manage` | tenant_admin |

*exhibitor:manage is row-level scoped (own exhibitor/booth/sponsor/lead records only)

**Permission check model**: Do NOT read `permissions` from JWT — it is always `[]`. After login, call `GET /v1/rbac/users/me/roles` to get role names. Derive section visibility from role names. Use `RoleGuard` until OCR-2 is confirmed; switch to `PermissionGate` per component when OCR-2 lands.

---

## Section 3: Approved Navigation Groups (18 — FROZEN)

Source: FRONTEND_NAVIGATION_MODEL.md. No navigation section may be added, renamed, or removed.

| # | Section | Roles | Backend service |
|---|---|---|---|
| 1 | Dashboard | All authenticated | analytics, event |
| 2 | Events | tenant_admin, organizer | event |
| 3 | Agenda | tenant_admin, organizer, speaker (own) | agenda |
| 4 | Speakers | tenant_admin, organizer | speaker |
| 5 | Exhibitors | tenant_admin, organizer, exhibitor (own) | exhibitor |
| 6 | Attendees | tenant_admin, organizer, support, onsite_staff | attendee |
| 7 | Registration | tenant_admin, organizer, support | registration |
| 8 | Ticketing | tenant_admin, organizer, finance | ticketing, pricing |
| 9 | Orders | tenant_admin, organizer, finance | order, payment |
| 10 | Inventory | tenant_admin, organizer, finance | inventory |
| 11 | Onsite | tenant_admin, organizer, onsite_staff | onsite |
| 12 | Campaigns | tenant_admin, organizer | notification |
| 13 | Analytics | tenant_admin, organizer, finance, support | analytics |
| 14 | Networking | All authenticated | networking |
| 15 | Polls & Q&A | tenant_admin, organizer (manage); all (participate) | interactive-engagement |
| 16 | Search | All authenticated | search |
| 17 | Integrations | tenant_admin | integration |
| 18 | Admin | tenant_admin | tenant, auth, rbac, audit |

**EXCLUDED**: No "Engagement" section. No "AI" section. No standalone engagement dashboard. Campaign management is under section 12 (Campaigns), backed by `services/notification`.

---

## Section 4: Approved Routes (91 — FROZEN)

Source: FRONTEND_ROUTE_CATALOG.md. Route count by zone:

| Zone | Count |
|---|---|
| Public (unauthenticated) | 8 |
| Dashboard | 1 |
| Events | 5 |
| Agenda | 7 |
| Speakers | 4 |
| Exhibitors | 7 |
| Attendees | 2 |
| Registration | 3 |
| Ticketing & Pricing | 6 |
| Orders | 3 |
| Inventory | 1 |
| Onsite Operations | 4 |
| Campaigns | 6 |
| Analytics | 2 |
| Search | 1 |
| Networking | 3 |
| Interactive Engagement | 8 |
| Integrations | 3 |
| Platform Administration | 14 |
| Profile / Account | 2 |
| **Total** | **91** |

Full route list is the authoritative source in FRONTEND_ROUTE_CATALOG.md. No routes may be added, removed, or renamed.

---

## Section 5: Approved Screens (28 — FROZEN)

Source: FRONTEND_SCREEN_CATALOG.md.

| ID | Screen | Route pattern |
|---|---|---|
| S-01 | Login | `/login` |
| S-02 | Register | `/register` |
| S-03 | Forgot / Reset Password | `/forgot-password`, `/reset-password` |
| S-04 | SSO Callback | `/sso/callback` |
| S-05 | Public Event Registration | `/events/:id/register` |
| S-06 | Checkout | `/events/:id/checkout` |
| S-07 | Dashboard (role-adaptive) | `/dashboard` |
| S-08 | Event List | `/events` |
| S-09 | Event Overview | `/events/:id` |
| S-10 | Create / Edit Event | `/events/new`, `/events/:id/edit` |
| S-11 | Event Settings | `/events/:id/settings` |
| S-12 | Agenda Builder | `/events/:id/agenda` |
| S-13 | Session Detail | `/events/:id/sessions/:id` |
| S-14 | Registration List | `/events/:id/registrations` |
| S-15 | Registration Detail | `/events/:id/registrations/:id` |
| S-16 | Check-in Station | `/events/:id/onsite/checkin` |
| S-17 | Onsite Dashboard | `/events/:id/onsite` |
| S-18 | Analytics Dashboard | `/analytics`, `/events/:id/analytics` |
| S-19 | Campaign Management | `/campaigns`, `/campaigns/:id` |
| S-20 | Admin User Management | `/admin/users`, `/admin/users/:id` |
| S-21 | Admin Role Management | `/admin/roles`, `/admin/roles/:id` |
| S-22 | Audit Log | `/admin/audit` |
| S-23 | My Registrations | `/my/registrations` |
| S-24 | My Tickets | `/my/tickets` |
| S-25 | Networking | `/network`, `/attendees` |
| S-26 | Global Search | `/search` |
| S-27 | Webhook Integration Management | `/integrations`, `/integrations/:id` |
| S-28 | SSO Configuration | `/admin/sso`, `/admin/sso/:id` |

**EXCLUDED**: No `/engagement/*` screens. No standalone AI screen. No mobile-native screens. No screens not listed above.

---

## Section 6: Approved Dashboards (7 — FROZEN)

Source: FRONTEND_DASHBOARD_CATALOG.md.

| ID | Dashboard | Target role(s) | Route |
|---|---|---|---|
| D-01 | Organizer Dashboard | organizer, tenant_admin | `/dashboard` (organizer variant) |
| D-02 | Finance / Commerce Dashboard | finance, tenant_admin | `/dashboard` (finance variant) |
| D-03 | Onsite Operations Dashboard | onsite_staff, organizer, tenant_admin | `/events/:id/onsite` |
| D-04 | Support Dashboard | support, tenant_admin | `/dashboard` (support variant) |
| D-05 | Admin Dashboard | tenant_admin | `/dashboard` (admin variant) or `/admin` |
| D-06 | Attendee Hub | attendee | `/dashboard` (attendee variant) |
| D-07 | Event Analytics Dashboard | tenant_admin, organizer, finance, support | `/events/:id/analytics` |

**Note**: Exhibitor and Speaker portals are simplified role-adaptive variants of D-06/S-07, not full dashboards. D-07 is an event-scoped sub-dashboard accessible from the contextual event navigation.

---

## Section 7: Approved Workflows (10 — FROZEN)

Source: PRODUCT_WORKFLOWS.md, FRONTEND_WORKFLOW_TO_SCREEN_MAP.md.

| # | Workflow | Entry point | Services |
|---|---|---|---|
| W-1 | Tenant Onboarding | `/register` | tenant, auth, rbac, audit |
| W-2 | Event Lifecycle | `/events/new` | event, agenda, notification, analytics, search |
| W-3 | Agenda Management | `/events/:id/agenda` | agenda, speaker, notification |
| W-4 | Speaker Management | `/speakers/new` | speaker, agenda |
| W-5 | Ticket Setup | `/events/:id/tickets/new` | ticketing, pricing, inventory |
| W-6 | Checkout (Ticket Purchase) | `/events/:id/checkout` | order, inventory, pricing, payment, ticketing, notification, fulfillment |
| W-7 | Refund | `/orders/:id` | payment, order, inventory, notification |
| W-8 | Registration | `/events/:id/register` | registration, attendee, notification |
| W-9 | Check-in | `/events/:id/onsite/checkin` | onsite, registration, attendee, analytics |
| W-10 | Campaign Delivery | `/campaigns/new` | notification |

**Commerce chain (W-6) — critical for checkout UI state machine**:
`POST /v1/orders` → `payment.completed` → `order.paid` → `fulfillment.completed` → `ticket.issued` → notification sent

**EXCLUDED**: No engagement-specific workflow. No SMS workflow. No push notification workflow.

---

## Section 8: Approved API Dependencies (FROZEN)

Source: FRONTEND_API_DEPENDENCY_MAP.md. Summary by category:

| Category | API count | Key patterns |
|---|---|---|
| Authentication | 12 endpoints | `/v1/auth/*`, `/v1/users/*`, `/v1/rbac/*` |
| Events | 10 endpoints | `/v1/events`, `/v1/venues`, `/v1/rooms` |
| Agenda | 9 endpoints | `/v1/sessions`, `/v1/tracks` |
| Speakers | 6 endpoints | `/v1/speakers` |
| Exhibitors | 7 endpoints | `/v1/exhibitors`, `/v1/booths`, `/v1/sponsors`, `/v1/leads` |
| Attendees | 4 endpoints | `/v1/attendees` |
| Registration | 8 endpoints | `/v1/registrations`, `/v1/registration-fields` |
| Commerce | 14 endpoints | `/v1/ticket-products`, `/v1/price-rules`, `/v1/promo-codes`, `/v1/orders`, `/v1/inventory` |
| Onsite | 5 endpoints | `/v1/check-ins`, `/v1/badge-prints`, `/v1/device-sessions` |
| Campaigns | 7 endpoints | `/v1/campaigns`, `/v1/audience-segments` |
| Analytics | 5 endpoints | `/v1/analytics/*` |
| Search | 1 endpoint | `GET /v1/search?q=` |
| Networking | 5 endpoints | `/v1/connections` |
| Interactive Engagement | 8 endpoints | `/v1/polls`, `/v1/qa-questions`, `/v1/surveys` |
| Integrations | 3 endpoints | `/v1/webhooks` |
| RBAC / Admin | 10 endpoints | `/v1/roles`, `/v1/permissions`, `/v1/rbac/*`, `/v1/audit-logs`, `/v1/tenant` |

**API contract rules (all endpoints)**:
- Base prefix: `/v1/`
- Response envelope: `{ data: T, meta: { page?, limit?, total? } }` (success)
- Error envelope: `{ error: { code, message, details }, meta }`
- Auth header: `Authorization: Bearer {jwt}`
- Pagination: `?page=N&limit=N` (default; cursor exceptions below)
- **Cursor pagination exceptions**: `GET /v1/orders` and `GET /v1/notifications` use `.take(limit+1)` with `nextCursor`
- Idempotency: `POST /v1/orders` MUST include `Idempotency-Key: {uuid}` header

**EXCLUDED**: No OpenSearch endpoints. No app-level S3/MinIO endpoints. No SMS endpoint. No push notification endpoint. No WebSocket endpoint (Phase E uses HTTP polling at 30-second intervals for live onsite data).

---

## Section 9: Approved Frontend States (FROZEN)

All screens must implement the following state patterns:

### Universal States (every screen)
- **Loading**: Skeleton UI matching the final layout shape (cards → skeleton cards; tables → skeleton rows; forms → skeleton fields)
- **Error (API failure)**: Inline error state with retry action; do NOT redirect on API errors (except auth)
- **401 / Unauthenticated**: Redirect to `/login` preserving the original target URL
- **403 / Forbidden**: Inline "You don't have permission" state; do NOT redirect to login

### Screen-specific States (approved)

| Screen | Empty state | Error state | Success state |
|---|---|---|---|
| S-01 Login | N/A | "Email or password incorrect" | Redirect to `/dashboard` |
| S-02 Register | N/A | "Email already registered" (409) | Redirect to `/dashboard` |
| S-03 Reset Password | N/A | "Invalid or expired link" | Redirect to `/login` with toast |
| S-04 SSO Callback | N/A | "SSO login failed" | Redirect to `/dashboard` |
| S-05 Registration | No custom fields → minimal form | Event not published → redirect | Redirect to `/registrations/:id/confirm` |
| S-06 Checkout | "No tickets available" | Payment declined; sold out | Redirect to `/orders/:id` with QR |
| S-07 Dashboard | "Create your first event" CTA (organizer) | Retry button per widget | KPI cards populated |
| S-08 Event List | "Create your first event" CTA | Retry button | Event table |
| S-09 Event Overview | N/A (event exists) | 404 → redirect to `/events` | Status header + KPI summary |
| S-10 Create/Edit Event | N/A | Validation errors inline | Redirect to `/events/:id` |
| S-11 Event Settings | "Settings not yet configured" (graceful degradation — OCR-5) | API error → retry | "Settings saved" toast |
| S-12 Agenda Builder | "Add your first session" CTA | Retry | Grid with sessions |
| S-13 Session Detail | "Assign a speaker" CTA | 404 → redirect | Session detail with speakers |
| S-14 Registration List | "No registrations yet" | Retry | Filterable table |
| S-15 Registration Detail | N/A | 404 → redirect | Status badge + action buttons |
| S-16 Check-in Station | Search prompt | "Attendee not found" | Large green "Checked In!" |
| S-17 Onsite Dashboard | No check-ins yet | Retry | KPI + live feed |
| S-18 Analytics | "No data available" + guidance | Retry per chart | Charts + export |
| S-19 Campaign | "Create your first campaign" CTA | "No audience segments" (create first) | Campaign list / detail |
| S-20 Admin Users | N/A (always ≥1 user) | Retry | User table |
| S-21 Admin Roles | N/A (system roles always present) | Retry | Role list (system = read-only) |
| S-22 Audit Log | "No audit events yet" | Retry | Filterable log |
| S-23 My Registrations | "Browse events" CTA | Retry | Registration history |
| S-24 My Tickets | "Purchase tickets" CTA | Retry | Ticket list with QR codes |
| S-25 Networking | "Browse attendees" CTA | Retry | Connection list |
| S-26 Search | Search prompt | "No results for '...'" | Typed result list |
| S-27 Webhook | "Connect an external system" CTA | Retry | Webhook list |
| S-28 SSO | "Add Identity Provider" CTA | Retry | SSO connection list + warning banner |

---

## Section 10: Approved Blocked / Excluded Items (FROZEN)

The following are explicitly excluded from Phase E implementation:

| Item | Reason | Registered as |
|---|---|---|
| `/engagement/*` routes | EngagementModule has zero routes/entities/consumers (ROD-1) | AUTO-CLOSED |
| SMS / push notification channels | Not implemented in backend | AUTO-CLOSED |
| OpenSearch / Elasticsearch | No client in package.json; Postgres ILIKE used | AUTO-CLOSED |
| S3 / MinIO object storage | No app-level client in codebase | AUTO-CLOSED |
| WebSocket / real-time push | HTTP polling (30s interval) accepted for Phase E | AUTO-CLOSED |
| Payment gateway SDK embed (Step 3) | Requires unprovisionned gateway credentials | OUT-OF-SCOPE (GAP-FE7-B) |
| Mobile native screens | Not in scope | OUT-OF-SCOPE (OOS-5) |
| Badge printer hardware SDK | Requires hardware procurement | OUT-OF-SCOPE (OOS-9) |
| QR scanner hardware SDK | Requires hardware procurement | OUT-OF-SCOPE (OOS-9) |
| JazzCash / Easypaisa gateways | Pakistan-specific; post-launch | OUT-OF-SCOPE (OOS-6) |
| Tax/FBR compliance module | Regulatory; post-launch | OUT-OF-SCOPE (OOS-7) |
| AI agentic features / matchmaking | Post-ROD-10 phase | OUT-OF-SCOPE (OOS-8) |
| Microservices-adapted UI | Architecture is modular monolith | OUT-OF-SCOPE (OOS-4) |

---

## Section 11: Approved Safe Defaults (FROZEN)

Items that have a single approved implementation path requiring no further decision:

| Item | Safe Default |
|---|---|
| Auth pattern | RoleGuard (role names from `GET /v1/rbac/users/me/roles`) until OCR-2 confirmed |
| Permission enforcement on 403 | Show inline "Permission denied" state; no redirect |
| JWT permissions field | Always `[]` — do not use for access control |
| S-06 payment form (Step 3) | Disabled placeholder: "Payment gateway integration pending" |
| S-11 EventSettings empty state | "Settings not yet configured" (OCR-5 pending) |
| S-26 search results | Full-text fallback when AI semantic results unavailable (ROD-10 pending) |
| S-28 SSO warning | "SSO signature verification is pending — not recommended for production" |
| Onsite live data refresh | HTTP polling every 30 seconds (no WebSocket) |
| AI embedding vendor | OpenAI `text-embedding-3-small` via `OPENAI_API_KEY` (already in environment) |
| System roles in S-21 | `role.isSystem === true` → read-only display; disable edit/delete controls |
| Idempotency on checkout | `Idempotency-Key: {uuid}` header on `POST /v1/orders` — client generates UUID per attempt |
| Commerce chain polling | After `POST /v1/orders`, poll `GET /v1/orders/:id` until `status === 'fulfilled'` |
| Pagination | `?page=N&limit=N` except orders/notifications which use cursor pagination |
| Exhibitor row-level scope | API enforces; frontend shows what API returns — no client-side filtering |

---

## Section 12: Remaining Owner Confirmations (FROZEN — 0 blocking)

As of compression pass 2026-06-17, OWNER-REQUIRED count = 0.

The following are queued for owner acknowledgement (OCR register) but do NOT block Phase E:

| ID | Item | Impact if not confirmed | Mitigation |
|---|---|---|---|
| OCR-1 | Remove `EngagementModule` and `services/engagement/` | Dead code remains; no frontend impact | Build without `/engagement/*` regardless |
| OCR-2 | Apply 23-permission taxonomy to 22 controllers | Permission-gated routes use RoleGuard instead | Build with RoleGuard now; switch components to PermissionGate when OCR-2 lands |
| OCR-3 | Prefix-ID refresh token format | Transparent to frontend | No frontend change needed |
| OCR-4 | Kafka DLQ (Postgres retry table) | Backend resilience; invisible to frontend | No frontend impact |
| OCR-5 | EventSettings entity + API | S-11 shows graceful degradation empty state | Build with empty state; wire up when OCR-5 ships |

**Silence = confirm per register policy.** Phase E does not wait for explicit confirmation.

---

## Section 13: Freeze Certificate

| Dimension | Count | Source |
|---|---|---|
| Roles | 8 | rbac.service.ts |
| Permissions | 23 | rbac.service.ts + Phase 2.95 collapse |
| Navigation sections | 18 | FRONTEND_NAVIGATION_MODEL.md |
| Routes | 91 | FRONTEND_ROUTE_CATALOG.md |
| Screen types | 28 | FRONTEND_SCREEN_CATALOG.md |
| Dashboards | 7 | FRONTEND_DASHBOARD_CATALOG.md |
| Workflows | 10 | PRODUCT_WORKFLOWS.md |
| Frontend gaps | 3 open (0 blocking) | FRONTEND_GAP_REGISTER.md |
| Owner decisions pending | 0 | DETERMINISM_CERTIFICATION_REPORT.md |
| Classified items | 68 | FINAL_CLASSIFIED_REGISTER.md |

**FINAL VERDICT: L0 FROZEN**

Phase E frontend implementation may begin immediately.
Claude Design may begin archetype work using this input pack.
Claude Code may validate any future design against this input pack.

Issued: 2026-06-20
By: AI (Phase 3.5 — L0 Frontend Authority Input Freeze)
