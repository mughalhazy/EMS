# Data Architecture

This document defines canonical storage roles for core data systems in EMS.

## Guiding Principle

Each storage technology has a single primary responsibility. Services should avoid overlapping usage unless explicitly documented in a subsystem design.

## PostgreSQL

**Primary role:** System of record for transactional domain data.

Use PostgreSQL for:
- Strongly consistent OLTP workloads (orders, registrations, payments, inventory, user/account state).
- Relational data modeling with foreign keys and constraints.
- Source-of-truth writes that require ACID guarantees.
- Auditable history tables and operational reporting queries that run on normalized data.

Do not use PostgreSQL for:
- High-throughput ephemeral caching.
- Long-term raw event stream retention.
- Full-text and relevance-ranked search as a primary search engine.

## Redis

**Primary role:** Low-latency volatile data and coordination layer.

Use Redis for:
- Read-through/write-through caches.
- Session storage and short-lived auth artifacts (tokens, OTP state).
- Rate-limiting counters and distributed locks.
- Short-lived queues or coordination primitives where durability requirements are low.

Do not use Redis for:
- Canonical business records.
- Durable event replay guarantees.
- Complex analytical querying.

## Kafka

**Primary role:** Durable event streaming backbone for asynchronous integration.

Use Kafka for:
- Publishing and consuming domain events between bounded contexts.
- Event-driven workflows and decoupled processing.
- Replayable logs for rebuilding downstream projections.
- Integrations requiring backpressure handling and consumer groups.

Do not use Kafka for:
- Ad hoc transactional reads/writes.
- Serving end-user query workloads directly.
- Primary storage of mutable entity state.

## OpenSearch

**Primary role:** Search index and query engine for discovery workloads.

Use OpenSearch for:
- Full-text search, filtering, faceting, and relevance scoring.
- Geospatial queries and aggregations for discovery experiences.
- Read-optimized denormalized search documents derived from source systems.

Do not use OpenSearch for:
- Source-of-truth transactional data.
- Multi-row ACID updates across entities.
- Durable event transport.

## Object Storage

**Primary role:** Durable blob/file storage for unstructured content.

Use object storage for:
- Media assets (images, PDFs, video, attachments).
- Export/import files, backups, and archived payloads.
- Large immutable artifacts referenced by metadata in PostgreSQL.

Do not use object storage for:
- High-frequency relational updates.
- Low-latency secondary index queries.
- Event stream fan-out.

## Cross-System Data Flow (Canonical Pattern)

1. Transactional writes are committed in PostgreSQL.
2. Domain events are emitted to Kafka.
3. Consumers materialize read/search projections into OpenSearch.
4. Hot keys and computed responses are cached in Redis.
5. Binary assets are stored in object storage, with references persisted in PostgreSQL.

## Ownership and Consistency

- PostgreSQL remains the canonical source for entity truth.
- Kafka is the canonical transport for cross-service state change events.
- OpenSearch and Redis are derived/read-optimized stores and may be eventually consistent.
- Object storage is canonical for binary artifacts, while metadata ownership remains in PostgreSQL.
