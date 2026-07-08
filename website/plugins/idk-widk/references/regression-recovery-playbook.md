# Regression Recovery Playbook

## Trigger

Use this playbook when a desired behavior existed before and has changed unintentionally or undesirably.

## Steps

1. Preserve current state with `git status`.
2. Identify known-good and known-bad references.
3. Create a separate worktree or ignored checkout for old commits.
4. Run the same behavior flow in old and current versions when feasible.
5. Capture evidence in an evidence table.
6. Classify each behavior as Keep, Fix, Ignore, or Unknown.
7. Extract acceptance criteria from Keep and Fix decisions.
8. Add characterization/golden/visual/contract/regression tests as appropriate.
9. Make the smallest reversible fix.
10. Verify old-vs-current behavior, tests, and any manual flow.
11. Update Mission Control and Session Handoff.

## Git commands to prefer

```bash
git status
git log --oneline --decorate -- path/to/file
git diff <old>..<current> -- path/to/file
git worktree add --detach .worktrees/known-good <commit>
git bisect start
git bisect bad <bad-ref>
git bisect good <good-ref>
git bisect run <command>
```

Use `.worktrees/` or another ignored directory when the worktree is for investigation only.

## When not to use bisect

Do not use `git bisect` until there is a reliable pass/fail command. If the behavior can only be judged by a human looking at screenshots, first create a small characterization, visual, or smoke test if possible.
