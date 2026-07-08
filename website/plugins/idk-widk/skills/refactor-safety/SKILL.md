---
name: refactor-safety
description: Use for large rewrites, refactors, modularization, component splitting, architecture cleanup, technical debt, migrations, dependency upgrades, or situations where AI-generated code has become messy, duplicated, hard to maintain, or fragile. Prevents broad unsafe rewrites by requiring current-state mapping, target design, reversible slices, tests, rollback, and cleanup.
license: Proprietary
compatibility: Designed for OpenAI Codex plugins and Agent Skills compatible coding agents. No network required.
metadata:
  version: "0.1.0"
  author: "Jovanny"
---

# Refactor Safety

## Purpose

Make refactors safe. AI often makes refactors feel cheap, but broad rewrites are where hidden behavior disappears.

## Refactor triggers

Use this skill when:

- A bug fix requires changing many files.
- A component is being split into smaller components.
- A single file has become too large.
- Logic is duplicated or inconsistent.
- The app has no clear structure.
- Adding a feature requires fighting the codebase.
- The AI wants to rewrite or reorganize large parts of the app.

## Required rules

1. Do not refactor and change behavior in the same slice unless unavoidable.
2. Map current behavior before changing structure.
3. Preserve public contracts.
4. Add characterization tests before risky changes when possible.
5. Use branch by abstraction, adapters, compatibility layers, or strangler-style replacement when needed.
6. Keep old and new paths side by side when migration risk is high.
7. Delete old code only after the new path is verified.
8. Track cleanup separately.
9. Do not modularize blindly. First define component boundaries and data flow.
10. Every refactor needs a rollback or recovery strategy.

## Refactor plan sections

Use `assets/templates/REFACTOR_PLAN.md`.

Include:

- Why refactor.
- Current behavior to preserve.
- Current structure.
- Target structure.
- Non-goals.
- Risks.
- Test strategy.
- Implementation slices.
- Rollback strategy.
- Cleanup strategy.
- Done criteria.

## Red flags

Stop and re-plan if:

- The agent cannot explain what behavior must be preserved.
- Tests are missing and the change is high-risk.
- The diff grows beyond the original plan.
- The agent changes unrelated files.
- The app only works because of a workaround.
- The new structure removes error handling, auth checks, validation, or platform-specific behavior.
