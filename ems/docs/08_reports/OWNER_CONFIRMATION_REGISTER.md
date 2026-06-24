Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Owner Confirmation Register

> Phase 2.95 — Executed 2026-06-17.
> Contains only OWNER_CONFIRMATION_ONLY items — decisions where the recommended
> path is clear from repository evidence and architectural analysis, and
> implementation will proceed unless the owner explicitly rejects or modifies
> the recommendation.
> 
> **Default behavior**: If no response is received before Phase E (frontend)
> implementation begins, these items are treated as confirmed and queued for
> implementation in their respective tiers.

---

## How to Use This Register

For each item:
- **Confirm**: No action needed — implementation proceeds as recommended
- **Reject**: Reply with item ID and alternative direction
- **Modify**: Reply with item ID and specific change to the recommendation

Silence = Confirm.

---

## OCR-1: Remove Engagement Module

**Source**: ROD-1  
**Recommended action**: Delete `services/engagement/` directory; remove `EngagementModule` from `apps/api/src/app.module.ts`.  
**Rationale**: Zero routes, zero entities, zero Kafka consumers. The comment in the controller explicitly states content moved to `networking` and `interactive-engagement`. Module is dead code.

**Execution tier**: REQUIRES_APPROVAL (app.module.ts change)  
**Effort**: Low (~20 minutes)  
**Risk**: Near zero — nothing references this module at runtime  
**Frontend impact**: Campaign management UI built under Campaigns/Notification section. No engagement-specific pages.

**If rejected**: Keep as-is. Frontend team should still NOT build engagement-specific pages — the module has no endpoints.  
**If modified by owner to repurpose**: Define the new purpose; implementation will be planned accordingly.

---

## OCR-2: Extend Permission Scheme to 23 Permissions

**Source**: ROD-3  
**Recommended action**: Add 11 domain permissions to `PLATFORM_PERMISSIONS` in `rbac.service.ts`; update `DEFAULT_ROLES` permission assignments; apply `@RequirePermissions(...)` to 22 unguarded controllers.

**New permissions:**

| Code | Assigned to |
|---|---|
| `event:manage` | organizer, tenant_admin |
| `agenda:manage` | organizer, tenant_admin |
| `speaker:manage` | organizer, tenant_admin |
| `attendee:manage` | organizer, support, onsite_staff, tenant_admin |
| `registration:manage` | organizer, support, tenant_admin |
| `exhibitor:manage` | organizer, exhibitor (own), tenant_admin |
| `commerce:manage` | organizer, finance, tenant_admin |
| `onsite:operate` | onsite_staff, organizer, tenant_admin |
| `analytics:read` | organizer, finance, support, tenant_admin |
| `campaign:manage` | organizer, tenant_admin |
| `integration:manage` | tenant_admin |

**Updated role matrix:**

| Role | Permissions |
|---|---|
| `tenant_admin` | All 23 |
| `organizer` | event:manage, agenda:manage, speaker:manage, attendee:manage, registration:manage, exhibitor:manage, commerce:manage, campaign:manage, analytics:read, user:read, role:read |
| `finance` | commerce:manage, analytics:read, audit:read |
| `support` | attendee:manage, registration:manage, user:read, audit:read |
| `exhibitor` | exhibitor:manage |
| `speaker` | (none — authenticated routes only) |
| `onsite_staff` | onsite:operate, attendee:manage |
| `attendee` | (none — authenticated routes only) |

**Execution tier**: REQUIRES_APPROVAL (security policy change)  
**Effort**: High (mapping 22 controllers is thorough but mechanical work)  
**Risk**: Existing API clients that assume broad access will receive 403 Forbidden after implementation. Document as a breaking change.  
**Frontend impact**: Enables permission-gated navigation, action buttons, and admin-only screens.

**If rejected**: Current state (authentication-only protection) persists. Flag as a security risk.  
**If modified**: Specify which permissions or role assignments to change.

---

## OCR-3: Prefix-ID Refresh Token

**Source**: ROD-6  
**Recommended action**: Change refresh token format to `{sessionId}.{randomBytes(32).hex}` in `auth.service.ts`. Extract `sessionId` prefix for O(1) lookup; bcrypt-verify only the matched record.

**Execution tier**: REQUIRES_APPROVAL (auth service change; invalidates existing sessions)  
**Effort**: Medium (~2 hours + migration planning)  
**Risk**: All existing refresh tokens become invalid — users must re-authenticate once. This is a one-time forced logout.  
**Frontend impact**: Transparent — refresh token format is opaque to frontend.

**If rejected**: O(n) bcrypt performance issue persists. Acceptable at low user counts; becomes a problem at scale.  
**If modified**: Alternative implementations (Redis-based, max session limit) will be designed accordingly.

---

## OCR-4: Postgres-Backed Event DLQ

**Source**: ROD-7  
**Recommended action**: Create `event_dlq` entity in `infra/event-bus/entities/`. Add retry poller to `infra/event-bus` that processes failed events with exponential backoff. `EventBusService.publish()` catches errors and writes to DLQ instead of discarding.

**Schema:**
```typescript
EventDlq {
  id: uuid;
  topic: string;
  payload: jsonb;
  failedAt: timestamp;
  retryCount: number (default 0);
  nextRetryAt: timestamp;
  lastError: text;
  resolvedAt: timestamp | null;
}
```

**Execution tier**: REQUIRES_APPROVAL (new entity, new background job, infra change)  
**Effort**: Medium (~3 hours)  
**Risk**: Low. DLQ failure doesn't affect the normal publish path.  
**Frontend impact**: None during Phase E.

**If rejected**: Accept risk of event loss. Recommend adding at minimum a metrics alert on publish failure (AUTONOMOUS).

---

## OCR-5: EventSettings Entity

**Source**: ROD-9  
**Recommended action**: Create `EventSettings` entity in `services/event/src/entities/event-settings.entity.ts` with the recommended 5-field schema. Add `GET /v1/events/:id/settings` and `PUT /v1/events/:id/settings` endpoints to `EventController`. Gate on `event:manage` permission.

**Schema:**
```typescript
EventSettings {
  id: uuid;
  eventId: uuid (unique FK to Event);
  registrationOpensAt: timestamp | null;
  registrationClosesAt: timestamp | null;
  maxCapacity: number (default 0 = unlimited);
  requiresApproval: boolean (default false);
  brandingConfig: jsonb | null;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Execution tier**: REQUIRES_APPROVAL (new entity + DB migration)  
**Effort**: Low (~1.5 hours)  
**Risk**: Low. Additive new entity.  
**Frontend impact**: Enables Event Settings page. Without this, the event settings screen shows a "not yet available" state.

**If rejected**: Event Settings page remains a placeholder.  
**If deferred**: Frontend scaffolds the settings screen with "coming soon" state.

---

## OCR-6: Resolve Role Model — Code is Authoritative (8 Roles)

**Source**: ROD-11  
**Recommended action**: Update `docs/legacy/security-model.md` header to note that the 8 roles in `rbac.service.ts` are the authoritative set. Note that any 9th role referenced in the legacy doc (likely `platform_admin`) is not implemented.

**Execution tier**: SAFE_REPOSITORY_HYGIENE (documentation update only)  
**Effort**: Minimal (~15 minutes)  
**Risk**: None  
**Frontend impact**: Role management UI and role selectors use exactly 8 roles.

**If rejected (owner wants 9 roles)**: Specify the 9th role's name, permissions, and seeding behavior. Implementation will require REQUIRES_APPROVAL backend work.

---

## Summary

| ID | Item | Tier | Effort | Risk | Frontend Impact |
|---|---|---|---|---|---|
| OCR-1 | Remove engagement module | REQUIRES_APPROVAL | Low | Near zero | Campaign UI under notification |
| OCR-2 | Extend to 23 permissions | REQUIRES_APPROVAL | High | Breaking for API clients | Enables all permission-gated UI |
| OCR-3 | Prefix-ID refresh token | REQUIRES_APPROVAL | Medium | One-time forced re-auth | Transparent |
| OCR-4 | Postgres DLQ | REQUIRES_APPROVAL | Medium | Low | None |
| OCR-5 | EventSettings entity | REQUIRES_APPROVAL | Low | Low | Event settings screen |
| OCR-6 | 8 roles authoritative | SAFE_HYGIENE | Minimal | None | Role selectors use 8 roles |

**Recommended Phase E priority order:**
1. OCR-6 (documentation only, 15 min, unblocks role management UI)
2. OCR-1 (remove dead module, confirms campaign navigation)
3. OCR-2 (permission scheme — highest frontend value, enables gated UI design)
4. OCR-5 (EventSettings — enables event settings page)
5. OCR-4 (DLQ — production reliability, no Phase E dependency)
6. OCR-3 (bcrypt fix — performance, no Phase E dependency)
