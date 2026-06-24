# EMS Repository

This is the working repository skeleton for the Event Management System (EMS),
scaffolded according to ../BUILD_BLUEPRINT.md (the unified V1 + V2 build plan).

## Structure

- docs/        - canonical documentation (Phase A). Subfolders: canon, architecture,
                  workflows, product, developer, ui. Each file is a placeholder
                  pointing to the prompt(s) that populate it.
- design/      - design tokens, components, wireframes (Design System Foundation)
- apps/web/    - Next.js frontend (Phase E)
- services/    - one folder per backend module (Batches 1-10). Each has a README
                  pointing to its V1/V2 source prompts, batch, and key entities.
- infra/       - docker, deployment, event-bus (Kafka), cache (Redis)
- prompts/     - new gap-fill prompts (Enterprise SSO, Social, Interactive
                  Engagement, AI Layer) not present in V1 or V2

## How to use this skeleton

1. Read ../BUILD_BLUEPRINT.md sec 11 for the recommended execution order.
2. Work through Phase A first - each docs/canon/*.md and docs/architecture/*.md
   placeholder names the exact source prompt(s) to run and which file the
   output replaces.
3. Stand up infra/docker (local Postgres/Redis/Kafka/OpenSearch) and
   infra/event-bus + infra/cache before starting the service batches -
   most services depend on them.
4. Work through services/* in the batch order given in BUILD_BLUEPRINT.md sec 11,
   running Batch QC after each.
5. Build apps/web last (Phase E), following TASK 01-14.

## Source material

All original prompt documents remain unmodified at the workspace root:
- /V1 - original full-stack design (foundation, 10 streams, frontend, QC)
- /V2 - refined backend roadmap (canon doc restructure, 7 batches, QC)
- /BUILD_BLUEPRINT.md - the merged plan this skeleton implements
