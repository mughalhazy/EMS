# Module Pattern

Canonical backend module pattern for EMS service folders.

## Required files

Each service module should include:

- `src/<name>.module.ts`
- `src/<name>.service.ts` (or equivalent application service)
- `src/index.ts`

Controllers, publishers, consumers, DTOs, entities, and adapters are added as needed.

## API response standard

Controllers must return the canonical JSON envelope by using either:

- `@UseInterceptors(ApiResponseInterceptor)` from `services/shared`, or
- explicit `ApiDataResponseDto<T>` wrappers.

## Event publication standard

When a module publishes message-bus events, topic constants should be centralized in `*.publisher.ts`/`*events*.ts` files and mirrored in `docs/canon/event-catalog.md`.
