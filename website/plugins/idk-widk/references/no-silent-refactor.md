# No Silent Refactor Rule

## Rule

Do not let a local fix become a broad rewrite without saying so.

## Stop message

```text
This is no longer a local fix. It is becoming a refactor because <reason>. I recommend <path>.
```

## When to stop

- More files are changing than the implementation plan allowed.
- Behavior is being changed and structure is being changed at the same time.
- The agent proposes deleting or replacing large areas.
- Existing tests do not cover behavior to preserve.
- The codebase has unclear ownership or hidden dependencies.

## Safer paths

- Local fix first.
- Characterization tests first.
- Adapter layer.
- Feature flag.
- Split into phases.
- Revert and reapply smaller changes.
- Create a refactor plan.
