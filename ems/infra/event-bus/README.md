> **Note**: This README is for local orientation only. For authoritative
> Kafka topic and event documentation see
> `docs/01_backend/EVENT_AND_QUEUE_ARCHITECTURE.md`. The "SCAFFOLD" status
> below is stale — this infra is fully implemented (GAP-1/GAP-7 resolved).

# Event Bus (Kafka)

Status: Implemented — see `infra/event-bus/src/event-bus.service.ts`
(`EventBusService.publish`/`subscribe`, `Topics` registry, outbox-backed),
consumed by every Batch 1-10 service.

Phase: Batch 7 - Infra Layer, Prompt 22
Source: V2/BACKEND BUILD(REMAINING)/Batch 7 - Infra Layer/Prompt 22 - Event Bus.docx

Contents (per blueprint):
- Kafka-based domain event pattern
- Event publishing / subscriber registration
- Outbox pattern for reliable delivery

Cross-reference: docs/canon/event-catalog.md for the full topic/event list.

Per BUILD_BLUEPRINT.md sec 6/11, this is a PREREQUISITE for Batches 1-6
(every service module publishes/consumes domain events) and should be
implemented immediately after Phase A / infra/docker, before the service batches.
