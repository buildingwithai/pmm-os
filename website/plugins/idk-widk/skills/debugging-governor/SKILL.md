---
name: debugging-governor
description: Use when AI-generated code breaks, fixes create new bugs, the user is stuck prompting repeatedly, context is polluted, the app has fragile behavior, debugging has gone in circles, or the agent needs an evidence-first process before changing code. Applies to web apps, Chrome extensions, mobile apps, APIs, backends, build errors, auth bugs, state bugs, and production defects.
license: Proprietary
compatibility: Designed for OpenAI Codex plugins and Agent Skills compatible coding agents. No network required.
metadata:
  version: "0.1.0"
  author: "Jovanny"
---

# Vibe Debugging Governor

## Purpose

Stop prompt loops. Replace trial-and-error patching with evidence-first debugging.

## Activate when

- The user says the agent keeps making the bug worse.
- Multiple fixes have failed.
- The app works in one place but breaks somewhere else.
- The AI is adding workarounds instead of finding root cause.
- A fix breaks other functionality.
- The user does not know what logs, files, or tests matter.
- The branch may be degraded by too many AI changes.

## Debugging principles

1. Reproduce before patching when possible.
2. State expected behavior and actual behavior.
3. Identify the smallest failing path.
4. Inspect the code path before modifying it.
5. Change one variable at a time.
6. Prefer root-cause fixes over hacks.
7. Add regression tests for proven bugs.
8. Stop after three failed attempts and reset hypotheses.
9. Keep a debugging ledger.
10. Never claim fixed without verification.

## Debugging ledger

For Level 1 or higher bugs, track:

```text
Bug summary:
Expected behavior:
Actual behavior:
Repro steps:
Environment:
Evidence:
Current hypothesis:
Attempts made:
Attempt result:
Hypotheses eliminated:
Next smallest test:
```

Use `assets/templates/DEBUGGING_LEDGER.md` when needed.

## Three-attempt reset

After three failed fix attempts, stop coding and produce:

```text
We have entered a debugging loop.
What failed:
What assumptions were unsupported:
What evidence we still need:
Which files or paths are actually implicated:
The next smallest experiment:
Whether to reset context, ask for a second model, inspect docs, or reproduce manually:
```

## Branch degradation check

If many AI edits have accumulated, inspect for:

- Large unreviewed diffs.
- Duplicate logic.
- Dead code.
- Changed patterns without reason.
- Tests that assert buggy behavior.
- New dependencies added without need.
- Workarounds masking the root cause.
- Changes outside the intended scope.

If degradation is found, recommend either:

- Revert to last known good state and reapply a smaller fix.
- Split the branch into reviewable slices.
- Create a refactor plan.
- Park unrelated changes.

## Verification

At the end, classify verification:

```text
Verified by test:
Verified by build:
Verified by manual reproduction:
Verified by browser or device flow:
Not yet verified:
```
