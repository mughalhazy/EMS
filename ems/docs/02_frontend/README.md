Status: Draft
Authority Level: Medium
Last Reviewed: 2026-06-15
Owner: AI

# Frontend Documentation

This directory holds frontend-specific governance and specification documents.

## Current State (Phase 1 — Frontend NOT Started)

`apps/web` (Next.js) and `services/ui-renderer` are Phase E work that has not
yet begun. `design/tokens`, `design/components`, and `design/wireframes` each
contain only a 9-line `README.md` stub.

## Authoritative References

- **Design system spec**: `docs/ui/design-system.md` — design tokens
  (colors/typography/spacing/shadows/radius), component library, Tailwind
  config, theming. This is the specification; the actual token files have not
  been created yet (GAP-4 in `docs/tracking/gap-register.md`).
- **UI surface map**: `docs/canon/ui-surface-map.md` — per-persona route
  tables (Platform Admin, Organizer, Finance, Support, Exhibitor, Speaker,
  Onsite Staff, Attendee), including read-model and service mappings.
- **Apps/web README**: `apps/web/README.md` — Phase E task breakdown (TASK
  01–05 for design tokens, web scaffold, Dockerfile, ui-renderer, frontend CI).
- **Feature scope**: `docs/00_authority/FEATURE_SCOPE.md` §3 — explicitly
  lists `apps/web`, `design/*`, and `ui-renderer` as out of scope / unbuilt.

## Phase E Entry Gates (from GAP-4/GAP-5)

1. Design tokens populated: `design/tokens/{colors,typography,spacing,shadows,radius}.js`
2. `apps/web` Next.js scaffold created (TASK 03 in `apps/web/README.md`)
3. Tailwind config importing design tokens
4. `services/ui-renderer` built out (depends on `design/components/` primitives)
5. `apps/web` Dockerfile added (GAP-5)

## Recommended Future Documents for This Directory

- `FRONTEND_ARCHITECTURE.md` — Next.js app structure, routing conventions,
  state management choice, API client pattern, auth session handling.
- `DESIGN_TOKEN_CHANGELOG.md` — track design token version changes for
  components depending on them.
