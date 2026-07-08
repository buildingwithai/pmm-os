# Engineering Resolution Lifecycle

Use this lifecycle for bugs, features, migrations, refactors, and releases.

## 0. Intake and classification

Classify work type, risk, platform, urgency, owner, impacted users, and initial definition of done.

## 1. Evidence capture and reproducibility

For bugs, capture exact repro steps, expected behavior, actual behavior, environment, logs, traces, screenshots, version, flags, account state, and data conditions.

For features, capture user problem, business objective, current workflow, constraints, personas, examples, and success metrics.

## 2. Problem framing and success definition

Separate symptom, suspected cause, user impact, business impact, technical impact, constraints, non-goals, assumptions, and success metrics.

## 3. System mapping and root-cause analysis

Map UI, routing, state, APIs, database, permissions, cache, jobs, queues, logs, analytics, external systems, feature flags, and release versions.

## 4. Requirements, constraints, and risk model

Define functional, non-functional, security, privacy, performance, accessibility, reliability, compatibility, migration, and operational requirements.

## 5. Solution design and decision records

Define target architecture, alternatives, tradeoffs, data model, API contracts, state model, permissions, errors, observability, rollout, rollback, and migration.

## 6. Implementation strategy and work decomposition

Slice by risk and reversibility. Prefer schema or contract first, adapter, subsystem behind flag, compatibility layer, migrate reads, migrate writes, switch traffic, remove old path, and cleanup.

## 7. Build and integrate

Make one coherent slice at a time. Keep PRs reviewable. Add tests close to changed behavior. Avoid unrelated changes.

## 8. Verification matrix

Map requirements and risks to actual checks. Include automated tests, manual tests, platform tests, security checks, migration checks, rollback checks, and known gaps.

## 9. Dogfood and readiness

Use the product like a real user. Check UX, empty states, errors, support, logs, alerts, runbooks, flags, rollback, and communication.

## 10. Progressive release

Use staged rollout, canaries, beta cohorts, percentage rollout, app-store phased release, extension staged publishing, or feature flags.

## 11. Production observation

Compare production signals against baseline: errors, latency, crashes, support tickets, adoption, data integrity, queue health, and user impact.

## 12. Retrospective and cleanup

Write postmortems for significant failures. Clean up temporary code, flags, adapters, stale docs, dead tests, and temporary dashboards.
