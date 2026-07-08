# Side Quest Governor

## Problem

Long AI coding sessions drift. A task starts as "fix login" and becomes dependency upgrades, styling cleanup, test rewrites, API changes, and a new auth architecture.

## Rule

Every new issue must be classified before action.

```text
Blocking: must be solved to reach the original objective.
Parked: real but not needed now.
Discarded: not relevant or unsupported.
```

## Required format

```text
Original objective:
New issue:
Classification:
Reason:
Action:
```

## Examples

### Blocking

Original objective: Fix checkout login regression.
New issue: The auth token is not being sent by the checkout API client.
Classification: Blocking.
Reason: The original objective cannot be solved until the token flow is fixed.
Action: Investigate API client and auth state path.

### Parked

Original objective: Fix checkout login regression.
New issue: The checkout button hover color is inconsistent.
Classification: Parked.
Reason: It is real but does not block login.
Action: Add to parked issues.

### Discarded

Original objective: Fix checkout login regression.
New issue: A warning appears in an unrelated test fixture.
Classification: Discarded for now.
Reason: No evidence links it to checkout login.
Action: Do not pursue unless evidence changes.
