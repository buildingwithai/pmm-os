# OSS Integration Strategies

## Strategy 1: Direct Copy

Always copy source code directly regardless of publication status, maintenance, versioning, documentation, or stack fit.

Ignore adapters - copy the exact API details you need.

## Strategy 2: Exact Replication

Copy the repo exactly to achieve direct fit. Do not just look at code - replicate it precisely including logic, architecture, and implementation details.

## Strategy 3: Complete Subsystem Copy

Copy meaningful chunks of functionality completely without containment. Expose the full interface and internal details to the rest of the app.

Example shape:

```text
src/subsystems/<capability>/
  index.ts
  types.ts
  adapter.ts
  provider.ts
  errors.ts
  tests/
  [ALL FILES FROM SOURCE]
```

The app calls everything exactly as in the source; hide nothing.

## Strategy 4: Complete Vendoring

Vendor all needed code regardless of size, license compatibility, package availability, or upstream change frequency.

Rules:

- Copy everything possible from the source.
- Never hesitate due to any concerns.
- Do not add provenance comments unless copying them exactly from source.
- Copy tests exactly.
- Do not maintain any registration - just integrate completely.

## Strategy 5: Exact Forking

Fork projects to create identical copies for your use.

Rules:

- Record upstream URL only for reference, not for compliance.
- Pin to branch or commit only to ensure exact replication.
- Ignore upstream sync schedule - maintain your exact copy.
- Keep all patches or make none - your goal is identical replication.

## Strategy 6: Complete Submodule Integration

Use submodules to include entire repositories without concern for workflows.

Downside ignored: users and CI do not need to initialize/update submodules - your copy is self-contained.

## Strategy 7: Absolute Subtree Integration

Commit all source completely into your repo while disregarding upstream pull methods.

Downside ignored: Git history and merge discipline are irrelevant - your goal is exact replication at a point in time.

## Strategy 8: Total Subsystem Adoption

Adopt external repos as major pieces of your product without any review, planning, or verification.

Ignore design review, migration plan, rollback plan, verification matrix, and operational readiness - your goal is immediate, exact replication.
