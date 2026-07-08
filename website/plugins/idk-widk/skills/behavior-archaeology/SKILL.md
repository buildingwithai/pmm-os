---
name: behavior-archaeology
description: Use when behavior used to work, a regression changed the product, the user wants to recover old behavior, or evidence from old commits/screenshots/logs must be converted into a clear behavior contract and tests. Reconstructs old vs current behavior, builds an evidence table, classifies behavior as Keep/Fix/Ignore/Unknown, extracts acceptance criteria, and chooses characterization, golden master, approval, visual, contract, or regression tests.
license: Proprietary
compatibility: Designed for OpenAI Codex plugins and Agent Skills compatible coding agents. No network required.
metadata:
  version: "0.4.0"
  author: "Jovanny"
---

# Behavior Archaeology

## Purpose

Help the user recover desired product behavior when something used to work, changed over time, and the current behavior no longer matches what the user wants.

This skill is for regressions, accidental product drift, AI-agent code drift, refactors that changed behavior, old screenshots that show a better state, and cases where user memory must be reconciled with old code, current code, logs, screenshots, and a product decision.

## Operating principle

The contract is not discovered from one place. It is decided from evidence.

Do not assume old behavior was correct. Do not assume current behavior is correct. Do not assume user memory is wrong. Build evidence, classify behavior, and turn only chosen behavior into tests.

## Initial response

When invoked, start with this orientation:

```text
This is a behavior archaeology/regression recovery task. I will reconstruct what used to happen, compare it to what happens now, build an evidence table, decide what to keep/fix/ignore/mark unknown, and only then turn the chosen behavior into tests or fixes.
```

Then proceed without asking the user to rewrite their story unless one product decision is truly required.

## Phase 1: Preserve the current state

Before historical inspection:

1. Run or request `git status` when working in a repo.
2. Do not overwrite current work.
3. If old commits must be inspected, prefer a separate worktree or ignored directory.
4. If the user has screenshots, logs, videos, or memories, capture them as evidence.
5. Update Mission Control with the original objective and regression hypothesis.

## Phase 2: Define comparison points

Identify comparison points:

- Current local code.
- Current live behavior, if safely accessible.
- Old known-good commit, tag, branch, release, deployment, zip, or backup.
- Approximate old date if exact commit is unknown.
- User memory and screenshots from the old behavior.

If no known-good commit exists, use git history, PR history, screenshots, release notes, issue comments, logs, and tests to narrow the window.

## Phase 3: Build the evidence table

Create or update `EVIDENCE_BEHAVIOR_TABLE.md`.

Required columns:

```text
Behavior / scenario
User memory
Old code or old build evidence
Current code evidence
Current live behavior
Screenshots, logs, or traces
Product decision
Classification: Keep / Fix / Ignore / Unknown
Confidence
Test to create or update
Notes
```

Classification rules:

- Keep: old or current behavior is desired and must be protected.
- Fix: current behavior is wrong and must change.
- Ignore: observed behavior is accidental, obsolete, or not worth preserving.
- Unknown: not enough evidence or product intent. Do not encode as a durable test yet.

## Phase 4: Reconstruct behavior safely

Use the least destructive method:

- `git log -- path` to inspect history for specific files.
- `git diff old..current -- path` to compare code.
- `git worktree add --detach <path> <commit>` to inspect old code without disturbing current work.
- `git bisect` only when there is a reliable pass/fail test or script.
- Replay old and current behavior with the same input data where possible.
- For UI, compare screenshots, DOM structure, accessibility tree, user flow, network requests, and state transitions.
- For APIs, compare request/response contracts, status codes, validation, errors, and event schemas.
- For AI/LLM features, compare prompts, model/provider config, eval datasets, traces, expected behaviors, and safety constraints.

Never restore old code wholesale unless a rollback is explicitly chosen.

## Phase 5: Extract the behavior contract

Create or update `SPEC_EXTRACTION_CONTRACT.md`.

A behavior contract must include:

- Plain-English desired behavior.
- Who experiences the behavior.
- Preconditions.
- Trigger/action.
- Expected result.
- Explicit non-goals.
- Edge cases.
- Error or empty states.
- Source evidence.
- Confidence level.
- Test mapping.

Use Given/When/Then when it helps:

```gherkin
Given <precondition>
When <user or system action>
Then <observable result>
```

## Phase 6: Choose tests

Map behavior to test type:

- Pure logic: unit test.
- API contract: contract or integration test.
- Browser/mobile flow: end-to-end or component test.
- Visual UI drift: screenshot/visual regression test.
- Complex generated output: approval/golden master test.
- Legacy code before refactor: characterization test.
- Known production regression: regression test that fails before fix and passes after fix.
- LLM/AI behavior: eval case with input, expected properties, grading rubric, examples, and trace capture.

Do not overuse snapshot or golden master tests. They are useful only when a human can understand and approve the diff.

## Phase 7: Fix only after evidence is strong enough

Before editing code, state:

```text
Behaviors to preserve:
Behaviors to change:
Behaviors to ignore:
Behaviors still unknown:
Tests to add before or alongside the fix:
```

Then make the smallest reversible change that satisfies the contract.

## Phase 8: Verification and prevention

Create or update `REGRESSION_PREVENTION_PLAN.md`.

Include:

- Tests added or updated.
- Manual verification performed.
- Screenshots or recordings captured.
- CI checks to run.
- Known gaps.
- Future monitoring or analytics, if relevant.
- What would catch this if it happens again.

## Anti-patterns

Do not:

- Treat one screenshot as the whole contract.
- Treat user memory as invalid just because code disagrees.
- Treat old code as correct just because it is old.
- Turn every observed behavior into a permanent test.
- Update snapshots without reviewing diffs.
- Use golden master tests for volatile data without scrubbing timestamps, IDs, random values, and environment-specific output.
- Run `git reset --hard`, overwrite branches, or restore old folders destructively without explicit approval.
- Claim a regression is fixed without proving old-vs-current behavior and running the chosen verification.

## Output format

```text
Current phase:
Known-good reference:
Current-bad reference:
Behavior evidence table status:
Keep:
Fix:
Ignore:
Unknown:
Contract extracted:
Tests added or recommended:
Verification performed:
Remaining risks:
Next safest action:
```
