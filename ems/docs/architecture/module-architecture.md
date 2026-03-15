# Module Architecture

This document defines the canonical module and folder structure for the current EMS repository layout.

## Current deployment model

EMS is currently implemented as a **modular backend platform with independently organized service modules** under `ems/services`, shared web UI under `ems/apps/web`, and shared infrastructure under `ems/infra`.

The architecture intentionally keeps strong module boundaries so modules can run in-process today and be extracted later if needed.

## Canonical top-level layout

```text
ems/
  apps/
    web/                    # Next.js frontend
  services/
    <service-name>/         # Backend domain/application modules
    shared/                 # Shared backend primitives/utilities
    ui-renderer/            # Rendering specification/prototype assets
  infra/                    # Deployment, docker, scripts, tests
  docs/                     # Architecture, canon, workflows, developer docs
```

## Service module structure contract

Each backend service folder under `ems/services/<service-name>` should follow this baseline:

```text
services/<service>/
  src/
    <service>.module.ts     # Nest module boundary
    <service>.controller.ts # HTTP boundary (if exposed)
    <service>.service.ts    # Application/domain orchestration
    index.ts                # Module public exports
  README.md (optional)
  migrations/ (optional)
```

### Allowed extensions

- `*.publisher.ts`: event publication ports/adapters.
- `*.consumer.ts`: event ingestion handlers.
- `entities/`, `dto/`, `adapters/`, `guards/`, `decorators/`, `middleware/`: internal module organization.

## Boundary rules

1. **No direct cross-module repository access.**
2. **Cross-module communication happens via exported service contracts, HTTP APIs, or events.**
3. **Shared utilities belong in `services/shared`; domain logic must stay in owning module.**
4. **Controllers must use canonical API envelopes** (either explicit response DTOs or `ApiResponseInterceptor`).
5. **Published event topics must be represented in `docs/canon/event-catalog.md`.**

## Active backend module inventory

The following service directories are currently active in this repository and constitute the audited module inventory:

- `agenda`
- `analytics`
- `attendee`
- `audit`
- `auth`
- `commerce`
- `engagement`
- `event`
- `exhibitor`
- `inventory`
- `networking`
- `notification`
- `onsite`
- `order`
- `pricing`
- `registration`
- `search`
- `shared`
- `speaker`
- `tenant`
- `ticketing`
- `user`

`ui-renderer` is a specification/prototype module and not a Nest service runtime.
