> **Note**: This README is for local orientation only. For authoritative
> Redis configuration documentation see
> `docs/01_backend/BACKEND_ARCHITECTURE.md` §7. The "SCAFFOLD" status
> below is stale — this infra is fully implemented (GAP-1/GAP-7 resolved).

# Cache & Idempotency (Redis)

Status: Implemented — see `infra/cache/src/redis.client.ts` (`RedisClient`),
used for rate limiting, idempotency keys, and the inventory reservation TTL
store (`services/inventory/src/inventory-reservation.store.ts`).

Phase: Batch 7 - Infra Layer, Prompt 23
Source: V2/BACKEND BUILD(REMAINING)/Batch 7 - Infra Layer/Prompt 23 - Cache & Idempotency.docx

Contents (per blueprint):
- General cache layer
- Rate limiting
- Idempotency keys (used across API standards, see docs/canon/api-standards.md)
- Inventory reservation TTL (used by services/inventory)

Per BUILD_BLUEPRINT.md sec 6/11, this is a PREREQUISITE for Batch 4 (Commerce Core),
which hard-depends on Redis-backed inventory locking to prevent overselling.
