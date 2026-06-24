Status: Draft
Authority Level: Medium
Last Reviewed: 2026-06-15
Owner: AI

# Fullstack Contracts

This directory holds cross-cutting traceability contracts that span both
backend and frontend layers.

## Primary Document

**`docs/00_authority/FULLSTACK_STITCHING_CONTRACT.md`** is the canonical
location for fullstack traceability. It was placed under `00_authority/` (not
here) because the GOVERNANCE IMPLEMENTATION PHASE 1 instruction lists it as a
required `00_authority/` document. This directory is the conceptual home for
any additional fullstack contract documents.

The stitching contract tracks:
```
Feature → Workflow → Domain Entity → Backend Component → API Endpoint
→ Frontend Consumer → Permission Model → Validation Layer
→ Test Coverage → Deployment Dependency
```

## Current State (Phase 1)

The stitching contract is populated for 8 representative features (one per
major workflow). It is explicitly marked `Status: Draft` and incomplete —
22 of 26 services are not yet fully represented. See the "Open Items" section
of `docs/00_authority/FULLSTACK_STITCHING_CONTRACT.md`.

`Frontend Consumer` cells are uniformly "Not built (Phase E)" until `apps/web`
exists.

## Recommended Future Documents for This Directory

- `API_CONSUMER_CONTRACTS.md` — per-endpoint request/response shape snapshots
  (typed contracts between backend and frontend, versioned alongside any
  breaking changes per `07_governance/AI_OPERATING_CONTEXT.md`
  CONTRACT_COMPATIBILITY_POLICY).
- `EVENT_CONSUMER_MAP.md` — which services subscribe to which Kafka topics
  (full cross-service consumer graph).
