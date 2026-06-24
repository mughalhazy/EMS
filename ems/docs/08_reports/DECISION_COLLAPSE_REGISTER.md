Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Decision Collapse Register

> Phase 3.25 — Autonomous Gap Elimination and Determinism Enforcement.
> Executed 2026-06-17.
>
> Registers every decision that was "open" before Phase 3.25, the collapse
> rule applied, and the single recommended path. All items below have one
> and only one correct answer derivable from repository evidence — or are
> classified as TRUE_OWNER_DECISION (commercial/legal/architecture fork).

---

## Classification Key

| Code | Meaning |
|---|---|
| RESOLVED-CODE | Answer derived from code; implement immediately |
| RESOLVED-DOC | Answer derived from documentation |
| RESOLVED-PATTERN | Answer derived from existing project patterns |
| OCR-QUEUED | OWNER_CONFIRMATION_ONLY; spec ready; implement unless rejected |
| TRUE_OWNER | Genuine commercial/vendor/legal decision; owner must confirm |

---

## All 11 RODs — Collapsed

| ROD | Decision | Collapse Rule | Single Path | Classification |
|---|---|---|---|---|
| ROD-1 | Engagement module fate | Code: 0 routes, 0 entities, 0 consumers | Remove `EngagementModule` from `app.module.ts`; delete `services/engagement/` | OCR-QUEUED (OCR-1) |
| ROD-2 | E2E test baseline timing | Pattern: Phase E does not depend on backend coverage | Begin Phase E now; test incrementally (auth → commerce first) | RESOLVED-PATTERN |
| ROD-3 | Permission scheme design | Code: 8 roles + 12 governance permissions exist; 22 controllers unguarded | Extend to 23 permissions (add 11 domain); apply @RequirePermissions | OCR-QUEUED (OCR-2) |
| ROD-4 | Test coverage prioritization | Code: business criticality derivable from service purpose | auth → rbac → tenant → payment → order → registration → ticketing | RESOLVED-CODE |
| ROD-5 | JWT empty permissions | Code: PermissionsGuard calls `getUserPermissions()` — DB lookup already works | DB lookup per request is correct; no JWT change needed | RESOLVED-CODE |
| ROD-6 | O(n) bcrypt refresh | Architecture: minimal change option is O(1) UUID prefix lookup | Prefix-ID refresh token `{sessionId}.{randomBytes}` | OCR-QUEUED (OCR-3) |
| ROD-7 | Kafka DLQ | Architecture: outbox relay exists; DLQ follows same pattern | Postgres-backed retry table; exponential backoff; plug into outbox relay | OCR-QUEUED (OCR-4) |
| ROD-8 | Kafka schema registry | Architecture: modular monolith = tsc is the registry | TypeScript interfaces in `infra/event-bus/src/schemas/` — **EXECUTED** | RESOLVED-PATTERN |
| ROD-9 | EventSettings entity | Architecture: separate entity follows existing pattern | Minimal 5-field entity + GET/PUT /v1/events/:id/settings | OCR-QUEUED (OCR-5) |
| ROD-10 | Real embedding API | Requires vendor/cost authorization | **TRUE_OWNER_DECISION** — OpenAI text-embedding-3-small recommended | TRUE_OWNER |
| ROD-11 | Role model conflict | Code is authoritative per governance policy | 8 code roles are authoritative — **EXECUTED (OCR-6)** | RESOLVED-CODE |

---

## Frontend Gap Collapses

| Gap | Prior Status | Collapse Result |
|---|---|---|
| GAP-FE1: EventSettings | Open | Pending OCR-5; build with graceful degradation |
| GAP-FE2: AI search | Open | Pending ROD-10 (TRUE_OWNER); full-text fallback |
| GAP-FE3: Permission guards | Open | Pending OCR-2; use RoleGuard in interim |
| GAP-FE4: Engagement | Open | **COLLAPSED** — frontend must never build /engagement regardless of OCR-1 |
| GAP-FE5: JWT perms | Open | **COLLAPSED** — use GET /v1/rbac/users/me/roles (ROD-5 resolved) |
| GAP-FE6: Entity names | Open | **COLLAPSED** — entity names are irrelevant to frontend API |
| GAP-FE7: Payment gateway | Open | **PARTIALLY COLLAPSED** — backend is gateway-agnostic; gateway selection is TRUE_OWNER |
| GAP-FE8: WebSocket | Open | **COLLAPSED** — polling accepted for Phase E |
| GAP-FE9: SSO security | Open | Remains open — REQUIRES_APPROVAL security sprint |
| GAP-FE10: System roles | Open | **COLLAPSED** — check role.isSystem in API response |

---

## Remaining Unresolvable Items

See `UNRESOLVABLE_ITEMS_REGISTER.md` for full detail.

| Item | Reason Unresolvable | Category |
|---|---|---|
| ROD-10: Embedding API vendor | Cost acceptance + vendor contract required | Commercial |
| GAP-FE7 (partial): Payment gateway | Account credentials + vendor contract required | Commercial |

**Count**: 2 items remain genuinely unresolvable from repository evidence.

---

## Collapse Rules Applied

Per Phase 3.25 protocol:

> A. Can the answer be derived from code? → If YES: Resolve it.
> B. Can the answer be derived from documentation? → If YES: Resolve it.
> C. Can the answer be derived from workflows? → If YES: Resolve it.
> D. Can the answer be derived from architecture? → If YES: Resolve it.
> E. Can the answer be derived from existing project patterns? → If YES: Resolve it.
> F. Is there only one rational interpretation? → If YES: Resolve it.

ROD-2, ROD-4, ROD-5, ROD-8, ROD-11 → Rule A (code derives the answer)  
ROD-3, ROD-6, ROD-7, ROD-9 → Rules D/E (architecture pattern + full spec available)  
ROD-1 → Rule F (only rational option given zero routes/entities/consumers)  
ROD-10 → Not resolvable; commercial decision (allowed escalation)

---

**Issued**: 2026-06-17  
**By**: AI (Phase 3.25 — Autonomous Gap Elimination and Determinism Enforcement)
