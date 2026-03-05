# EMS AI Integration Architecture

## 1) Purpose and scope

This document defines the AI integration layer for EMS and how AI capabilities are embedded into the platform without breaking tenant isolation, reliability, or compliance.

### In-scope capabilities
- AI assistants
- Semantic search
- Attendee matchmaking
- Event analytics
- Agent automation

### Design goals
1. Keep EMS core transactional workflows authoritative in PostgreSQL.
2. Use an event-driven pipeline so AI features remain loosely coupled from core domain modules.
3. Support model-provider flexibility (hosted and self-hosted).
4. Enforce tenant-aware retrieval, inference, and auditability by default.

---

## 2) High-level architecture

```text
                     [EMS Web / Admin UI]
                              |
                              v
                     [API Gateway / BFF]
                              |
                              v
             [AI Orchestration Service (NestJS Module)]
          /            |                 |             \
         v             v                 v              v
[Model Interfaces] [Vector Storage] [Feature Services] [Agent Runtime]
         |             |                 |              |
         v             |                 |              v
 [LLM/Embedding/Rerank]|         (assistants/search/   [Tool adapters]
   providers]          |          matchmaking/analytics)   |
                       v                                   v
             [Event Data Pipeline <-> Kafka <-> Outbox <-> EMS Core]
                       |
                       v
             [ETL/Indexers/Feature Builders]
```

Core idea: EMS domain events feed an AI-ready data plane. The AI orchestration service resolves tenant context, retrieves relevant knowledge from vector storage + structured stores, invokes model interfaces, and returns controlled responses/actions.

---

## 3) Core components

## 3.1 AI Orchestration Service

A dedicated EMS module/service that coordinates all AI requests.

### Responsibilities
- Request classification (assistant vs search vs analytics vs agent task).
- Tenant-aware policy enforcement (entitlements, PII rules, data boundaries).
- Retrieval orchestration across vector + SQL + search indexes.
- Prompt/response assembly using reusable templates and tool contracts.
- Function/tool calling and action execution with guardrails.
- Observability: token usage, latency, cost, confidence, trace IDs.

### Key internal submodules
- **Prompt Manager**: versioned prompt templates and policy snippets.
- **Context Builder**: combines embeddings retrieval + domain records + user/session context.
- **Inference Router**: selects model/provider by task (quality, latency, cost).
- **Safety Layer**: redaction, moderation, output validation, policy checks.
- **Evaluation Hooks**: captures outcomes for offline eval and continuous tuning.

## 3.2 Vector Storage

Purpose-built semantic index for AI retrieval.

### Data model
Each vector document includes:
- `tenant_id`
- `entity_type` (event, session, attendee, sponsor, note, FAQ, policy, etc.)
- `entity_id`
- `source_version`
- `chunk_id`
- `embedding`
- `metadata` (time windows, tags, access level, locale)

### Storage strategy
- Shared cluster with strict tenant filtering in query path.
- Optional dedicated index/namespace per large tenant.
- Hybrid retrieval: vector similarity + keyword/metadata filters.

### Indexing inputs
- Event descriptions, agendas, speaker bios, venue details.
- Ticketing and registration context (access-controlled fields only).
- CRM/engagement activity summaries.
- Analytics snapshots and post-event reports.

## 3.3 Event Data Pipeline

The event data pipeline transforms operational events into AI-ready features.

### Ingestion path
1. EMS core commits business transactions.
2. Outbox publishes domain events to Kafka.
3. AI pipeline consumers subscribe to relevant topics.
4. Transformation jobs normalize and enrich records.
5. Indexers generate embeddings and upsert vector documents.
6. Feature builders materialize analytics/matchmaking features.

### Pipeline properties
- Idempotent consumers keyed by event/message IDs.
- Replayable from Kafka for backfill/reindex.
- Schema-versioned contracts for compatibility.
- DLQ with retry and operator alerts.

## 3.4 Model Interfaces

A stable abstraction over model providers.

### Interface types
- **Chat/Reasoning interface**: assistants and agent planning.
- **Embedding interface**: semantic indexing + query vectorization.
- **Reranking interface**: result refinement for precision-sensitive flows.
- **Classification/Extraction interface**: tagging, intent, entity extraction.

### Provider abstraction requirements
- Unified request/response schema independent of vendor.
- Routing by policy (data residency, latency, cost ceilings).
- Circuit breakers and fallback providers.
- Structured output mode (JSON schema contracts).

---

## 4) Capability architecture

## 4.1 AI Assistants

### Primary use cases
- Organizer copilot (planning, operations, recommendations).
- Attendee assistant (agenda help, session suggestions, logistics).
- Support assistant (policy and troubleshooting answers).

### Runtime flow
1. User sends query via UI/API.
2. Orchestrator authenticates, resolves tenant + role.
3. Context Builder retrieves relevant chunks from vector storage and structured entities from EMS.
4. Model Interface executes with policy prompt and tool permissions.
5. Safety Layer validates output and masks restricted data.
6. Response + citations + telemetry returned to client.

### Controls
- Role-based tool permissions.
- Citation-required mode for enterprise tenants.
- Conversation memory partitioned by tenant and user scope.

## 4.2 Semantic Search

### Query flow
1. Query embedding generated.
2. Vector similarity search with tenant and metadata filters.
3. Optional BM25/keyword merge from OpenSearch.
4. Reranking model improves top-N relevance.
5. Result formatter returns snippets, facets, and confidence.

### Relevance tuning signals
- Click-through and dwell time.
- Session saves/bookmarks.
- Post-event feedback ratings.

## 4.3 Attendee Matchmaking

### Matching inputs
- Profile attributes (industry, role, goals).
- Behavioral signals (sessions attended, interactions, interests).
- Explicit preferences and constraints (availability, language, do-not-match rules).

### Matching architecture
- Candidate generation from vector similarity and rule filters.
- Scoring layer combines semantic affinity + business rules.
- Explanation generator provides transparent “why matched” reasons.
- Feedback loop updates feature weights over time.

## 4.4 Event Analytics (AI-enhanced)

### Outputs
- Narrative summaries for organizers.
- Forecasts (attendance trends, engagement risk).
- Anomaly detection (registration drop-offs, session underperformance).
- Recommendation insights (program, sponsor, and operations optimizations).

### Data path
- Batch and streaming features generated in pipeline.
- Analytics models consume curated feature tables.
- Assistant-accessible insights exposed through governed tools.

## 4.5 Agent Automation

### Agent scope
- Multi-step workflows such as:
  - Draft event communication campaigns.
  - Build personalized attendee agenda suggestions.
  - Trigger follow-up tasks in CRM/integration systems.

### Execution pattern
1. Planner model creates task plan.
2. Policy engine validates allowed actions.
3. Tool executor runs side effects with idempotency keys.
4. Human-in-the-loop approvals for high-impact actions.
5. Audit trail stores plan, tool calls, outputs, and approvals.

---

## 5) Security, governance, and compliance

### Tenant/data isolation
- All AI requests require explicit `tenant_id` context.
- Retrieval and tool access enforce tenant + role boundaries.
- Cross-tenant retrieval hard-blocked at query and service levels.

### PII and sensitive data controls
- Field-level masking before prompt assembly.
- Policy-based exclusion lists (e.g., payment/identity fields).
- Optional no-retention mode per tenant/provider.

### Governance
- Prompt and model version registry.
- Full audit logs of prompts, context references, tool actions, and outputs.
- Eval suites for hallucination, policy violations, and bias checks.

---

## 6) Reliability and SLOs

### Reliability patterns
- Fallback model/provider routing.
- Graceful degradation (AI unavailable -> deterministic EMS behavior).
- Cached semantic results for hot queries.
- Async task queues for long-running agent flows.

### Suggested SLO targets
- Assistant p95 response latency: < 3.5s (interactive mode).
- Semantic search p95 latency: < 1.2s.
- Matchmaking refresh SLA: < 10 minutes after new interaction events.
- Analytics narrative generation SLA: < 15 minutes for incremental updates.

---

## 7) Deployment and evolution roadmap

## Phase 1: Foundation
- Stand up model interfaces and vector storage.
- Build event pipeline consumers + embedding indexers.
- Launch semantic search MVP.

## Phase 2: Assistant and matchmaking
- Release organizer + attendee assistants.
- Add matchmaking candidate/scoring service.
- Introduce telemetry dashboards and cost controls.

## Phase 3: Agent automation and advanced analytics
- Enable governed agent automation with approval workflows.
- Add forecasting/anomaly analytics models.
- Harden evaluation and policy enforcement for enterprise readiness.

---

## 8) Implementation notes for EMS stack

- Keep orchestration in NestJS with module boundaries similar to existing EMS architecture.
- Reuse Kafka + outbox for all AI data movement.
- Reuse OpenSearch for hybrid lexical retrieval; vector store handles embeddings.
- Store canonical domain truth in PostgreSQL; never treat vector storage as source-of-truth.
- Expose AI APIs through existing gateway/BFF with consistent auth and tracing.
