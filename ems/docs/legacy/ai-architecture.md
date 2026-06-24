> **CORRECTIONS (Phase 3.25 — 2026-06-17):**
> This document describes the intended AI architecture design. The following
> sections are **contradicted by the actual implementation** (verified 2026-06-17):
>
> - §3 "call embedding model": NOT implemented. `ai.service.ts` `upsertEmbedding()`
>   stores `vector: []` (placeholder) and `modelVersion: 'placeholder-v0'`.
>   No real embedding API is called. See ROD-10.
> - §3 "search consumer updates OpenSearch vector field": OpenSearch is NOT used.
>   `services/search` uses Postgres ILIKE via `SearchDocument` entity. No
>   OpenSearch client is installed. See GAP-B9 (closed), GAP-B14.
> - §4 "OpenSearch k-NN": NOT implemented. Search is Postgres full-text only.
> - §7 "Agent Automation": No agent entity or scheduler exists in code.
>   `AIInteractionLog` exists but no agent automation records are generated.
>
> For accurate AI service documentation, use `docs/01_backend/SERVICE_CATALOG.md`
> §ai-service (verified 2026-06-17). This document is historical design intent only.

# AI Architecture

> Source: V1 Packet 0 Prompt 8 — AI Compatibility Layer (not addressed by V2 — V1 is
> authoritative here). The `ai-service` is built in gap-fill Batch 10
> (`BUILD_BLUEPRINT.md` §7); this document defines its design so Batches 1–9 leave
> the right hooks (entity IDs, profile fields, search indices) for it to consume.

## 1. Goals

1. **Semantic search** — attendees and organizers find events, sessions, and
   speakers via meaning, not just keywords.
2. **Attendee matchmaking** — suggest connections and sessions aligned to
   attendee interests and company profile.
3. **AI assistants** — conversational interfaces over event data for organizers
   (agenda drafting, campaign copy) and attendees (schedule assistant, FAQ).
4. **Agent automation** — background agents that act on behalf of organizers
   (auto-segment campaigns, summarize post-event survey feedback).

## 2. Service Boundary

All AI features are encapsulated in `services/ai-service`. No other service
computes embeddings or calls an LLM directly — they expose the data (via domain
events and read APIs) and consume AI-enriched results (semantic search, match
scores) via the `search` service or via `ai-service` REST endpoints.

## 3. Vector Embedding Pipeline

```
Domain event (attendee.profile_updated / session.created / ...)
  -> ai-service Kafka consumer
    -> extract text fields (name, bio, interests, session title/description)
    -> call embedding model (e.g., text-embedding-3-small or equivalent)
    -> upsert VectorEmbedding {entity_type, entity_id, vector, model_version}
    -> publish embedding.updated
      -> search consumer updates OpenSearch vector field for the entity
```

### Embeddable Entities

| Entity | Text fields embedded | Owning service that publishes the event |
|---|---|---|
| `Attendee`/`AttendeeProfile` | bio, interests, title, company | attendee |
| `Session` | title, description, track | agenda |
| `Speaker`/`SpeakerProfile` | name, bio, title, company | speaker |
| `Event` | name, description | event |

### VectorEmbedding entity
Defined in `docs/canon/domain-model.md` §9: `id`, `entity_type`, `entity_id`,
`vector` (float array, dimension depends on model), `model_version`, `updated_at`.
Stored in PostgreSQL (`ai-service` schema) as the source of record; synced
to OpenSearch `knn_vector` fields via `embedding.updated`.

## 4. Semantic Search

- OpenSearch `k-NN` (approximate nearest-neighbour) enabled on `events`,
  `sessions`, `speakers`, `attendees` indices.
- Query path: `apps/web` -> `search` service -> OpenSearch hybrid query
  (BM25 keyword + k-NN vector) -> ranked results.
- `ai-service` provides a `/v1/embeddings/query` endpoint that encodes a
  free-text query into a vector; `search` calls this inline for semantic queries.

## 5. Attendee Matchmaking

- Triggered when a logged-in attendee views `/events/account/[eventId]/networking`.
- `networking` service calls `ai-service` `/v1/match/attendees`:
  - Fetches the requesting attendee's `VectorEmbedding`.
  - Runs k-NN against all other `attendee` embeddings in the same `event_id`.
  - Filters out already-connected attendees (`AttendeeConnection` status
    `accepted` or `requested`).
  - Returns ranked list of `attendee_id` + similarity score.
- Session recommendations (which sessions to attend) use the same k-NN against
  `session` embeddings, biased by the attendee's interest vector.

## 6. AI Assistants

### Organizer Assistant
- Endpoint: `ai-service` `/v1/assistant/organizer`.
- Context injected: `Event`, `Agenda Planner` read model, `Campaign` draft,
  `TicketSalesSummary` read model (all filtered by `tenant_id`/`event_id`).
- Capabilities: draft session descriptions, draft campaign copy, answer
  "how many tickets sold this week?"-style questions over read models.

### Attendee Assistant
- Endpoint: `ai-service` `/v1/assistant/attendee`.
- Context injected: public `Event` data, `Session` list, attendee's personal
  agenda, FAQ content.
- Capabilities: "which session should I attend?", "where is Room B?",
  "what's on at 2pm?".

### Implementation Note
LLM calls are made server-side by `ai-service` only (never from `apps/web`
directly). All prompts and responses are logged in `AIInteractionLog` (see
`domain-model.md` §9) for tenant audit and usage metering. No PII beyond what
the attendee has set public on their profile is injected into LLM context
(`security-model.md` §4).

## 7. Agent Automation

Lightweight background agents run on a schedule (via infra scheduler, not
always-on processes):

| Agent | Trigger | Output |
|---|---|---|
| Campaign Segment Suggester | after `event.published` | proposes audience segments for the organizer to approve |
| Survey Feedback Summariser | after `event.archived` + surveys closed | generates per-session + overall event summary |
| Embedding Refresh | model version bump (config event) | re-queues all embeddable entities for re-embedding |

## 8. Dependencies on Earlier Batches

`ai-service` (Batch 10) requires these to be built first:

| Dependency | Batch | Why |
|---|---|---|
| `attendee`, `AttendeeProfile` | 2 | primary embedding source for matchmaking |
| `session` via `agenda` | 2 | session embeddings for recommendation |
| `search` + OpenSearch indices | 6 | target of `embedding.updated` sync |
| `networking` | 8 | consumes match results |
| `interactive-engagement` | 9 | `survey.completed` triggers feedback summariser |
| Kafka + event bus | 7 | all pipelines are event-driven |
