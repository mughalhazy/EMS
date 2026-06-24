Status: Draft
Authority Level: Medium
Last Reviewed: 2026-06-15
Owner: AI

# Testing Documentation

This directory holds testing strategy, standards, and coverage documentation.

## Critical Finding (GAP-G4)

Test coverage is **critically low** across the EMS backend. As of 2026-06-15:

- **4 of 26 services** have any `.spec.ts` file (1 each): `auth`,
  `notification`, `onsite`, `order`.
- **22 of 26 services** have zero unit tests.
- `test:e2e` script references `./test/jest-e2e.json` — existence and content
  **TBD – REQUIRES VERIFICATION**.

This is the highest-risk finding from GOVERNANCE IMPLEMENTATION PHASE 1.
See `08_reports/ARCHITECTURAL_GAP_REGISTER.md` GAP-G4 and
`08_reports/RECOMMENDED_ADR_ROADMAP.md` ADR-005.

## Current Test Infrastructure (verified from `package.json`)

- **Test runner**: Jest 29 + ts-jest (`"test": "jest"`)
- **Jest config**: in `package.json` `jest` block — roots are `services/`,
  `infra/`, `apps/`; cache at `<rootDir>/.jest-cache`; module name mapper
  for `@ems/*` path aliases.
- **Run command** (with required memory override):
  ```
  node --max-old-space-size=2048 node_modules/jest/bin/jest.js --passWithNoTests --runInBand
  ```
- **Coverage report**: `test:cov` → `./coverage/`
- **E2e config**: `test:e2e` → `./test/jest-e2e.json` (TBD – REQUIRES VERIFICATION)

## CI Test Gates (verified from `.github/workflows/ci.yml`)

- **Lint + typecheck job**: `npx eslint "{src,apps,libs,test,services,infra}/**/*.ts" --max-warnings=0`
  and `npx tsc -p tsconfig.json --noEmit` (ubuntu-latest).
- **Unit test job**: exists (`test`, ubuntu-latest) — full job body
  TBD – REQUIRES VERIFICATION.

## Recommended Future Documents for This Directory

- `TEST_STRATEGY.md` — ADR-005 outcome: minimum test coverage requirements
  per service, mock vs. integration testing policy, e2e test scope.
- `COVERAGE_REPORT.md` — living document, updated by CI: per-service coverage
  percentages (can be generated from `jest --coverage` output).
