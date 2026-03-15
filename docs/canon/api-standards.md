# API Standards

This document defines the canonical API structure for EMS documentation.

## URI and Versioning

- Base path is `/api/v1`.
- Use plural resource segments in kebab-case.
- Use path parameters in braces: `{tenantId}`.
- Tenant-scoped resources must start with `/tenants/{tenantId}`.
- Event-scoped resources should include `/events/{eventId}` when the resource belongs to a single event.

## Method Semantics

- `POST` creates resources or triggers explicit actions.
- `GET` retrieves resources and read models.
- `PATCH` performs partial updates.
- `DELETE` removes resources when hard-delete behavior is intended.

## Action Endpoints

- Prefer state transitions as explicit actions: `POST /publish`, `POST /cancel`, `POST /confirm`.
- Actions must be idempotent when retried with the same idempotency key.

## Request/Response Basics

- Mutating endpoints should accept `Idempotency-Key` where retries are expected.
- Timestamps use ISO-8601 UTC.
- IDs are opaque strings and should not encode business semantics.
- Errors should include `code`, `message`, and `correlationId`.
