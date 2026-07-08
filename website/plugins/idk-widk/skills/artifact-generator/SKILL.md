---
name: artifact-generator
description: Use to create the correct engineering documents and templates for a bug, feature, refactor, migration, security review, release, postmortem, or vibe-coding session. Selects artifacts by risk level and fills sections such as Mission Control, issue brief, investigation log, technical design, ADR, implementation plan, verification matrix, release plan, rollback plan, runbook, threat model, privacy review, session handoff, and postmortem.
license: Proprietary
compatibility: Designed for OpenAI Codex plugins and Agent Skills compatible coding agents. No network required.
metadata:
  version: "0.1.0"
  author: "Jovanny"
---

# Artifact Generator

## Purpose

Create the right documents at the right level of detail. Do not create process theater. Do not skip documentation when risk is real.

## Artifact selection rule

Use `references/artifact-selection-guide.md`.

Minimum set by risk:

```text
Level 0: issue note, verification evidence.
Level 1: issue brief, repro notes, implementation notes, verification checklist.
Level 2: Mission Control, investigation log, problem statement, implementation plan, verification matrix, session handoff.
Level 3: Level 2 plus technical design, ADR if needed, threat model or privacy review if relevant, release plan, rollback plan, runbook.
Level 4: Level 3 plus current-state map, target-state design, migration plan, phased refactor plan, cleanup plan, post-release validation.
Critical incident: incident timeline, root-cause analysis, postmortem, action item tracker.
```

## Templates

Use templates from:

```text
assets/templates/
```

Do not leave placeholders unfilled if the answer is known. If unknown, write `Unknown` and add the next step to discover it.

## Strong sections make strong documents

Every artifact must include the sections that make it useful:

- Problem docs need scope, non-scope, success criteria, and assumptions.
- Investigation docs need evidence, hypotheses, attempts, and confidence.
- Design docs need alternatives, tradeoffs, rollback, and test strategy.
- Implementation plans need task slices, ownership, dependencies, files, tests, and rollback points.
- Verification matrices need requirements mapped to proof.
- Release plans need go/no-go criteria, monitoring, communication, and rollback.
- Postmortems need impact, timeline, root causes, contributing factors, and action items.

## Helper script

When in a repo, you may run:

```bash
python scripts/create_idkwidk_artifacts.py --name "Work Name" --type bug --risk medium --platform web-app --owner "Owner"
```

If the script is not available in the target repo, copy it from this plugin or create documents manually.
