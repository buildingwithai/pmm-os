---
name: mission-control
description: Use during multi-step coding, debugging, feature, refactor, or release sessions to preserve the original objective, prevent side-quest drift, track evidence, decisions, files, tests, blockers, parked issues, and create a resume prompt or session handoff. Especially useful when the user is vibe coding, non-technical, context is getting long, or multiple bugs appear.
license: Proprietary
compatibility: Designed for OpenAI Codex plugins and Agent Skills compatible coding agents. No network required.
metadata:
  version: "0.1.0"
  author: "Jovanny"
---

# Mission Control

## Purpose

Keep the task from drifting. A vibe-coding session often starts with one issue and then spirals through tool errors, dependency problems, environment setup, styling issues, tests, unrelated warnings, and half-fixed side bugs. Mission Control keeps the original objective visible and forces each tangent to be classified.

## When to use

Use this skill when:

- The task will take more than a few minutes.
- More than one issue appears.
- The agent is about to pivot.
- The user says they forgot what they were solving.
- The context is getting long.
- The work is Level 2 risk or higher.
- There is a bug loop or repeated failed fix attempt.

## Required file

Create or update:

```text
docs/idkwidk/<work-slug>/MISSION_CONTROL.md
```

Use the template in:

```text
assets/templates/MISSION_CONTROL.md
```

If the repository has an established docs path, use that and say where it is.

## Side quest classification

When a new problem appears, classify it immediately:

```text
Blocking: must be solved to complete the original objective.
Parked: real but not needed for the current objective.
Discarded: unsupported, irrelevant, or not worth pursuing now.
```

Never follow a side issue silently.

## Pivot rule

Before pivoting, write:

```text
Original objective: <objective>
New issue found: <issue>
Classification: Blocking / Parked / Discarded
Reason: <why it matters or does not matter>
Next action: <what happens next>
```

## Handoff rule

When the session becomes long, when the task is paused, or when the user may need to restart in a new thread, create or update:

```text
docs/idkwidk/<work-slug>/SESSION_HANDOFF.md
```

The handoff must include:

- What we were trying to solve.
- What we changed.
- What we learned.
- What failed.
- Current hypothesis.
- Files touched.
- Commands run.
- Verification status.
- Next safest action.
- A copy-paste resume prompt.

## Required status response

At natural checkpoints, tell the user:

```text
We are still solving: <original objective>.
Current phase: <phase>.
The active blocker is: <blocker or none>.
The next best action is: <one action>.
```
