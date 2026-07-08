---
name: feature-specification
description: Use when the user has a fuzzy product idea, new feature, UX flow, customer request, or unclear behavior change. Turns vague intent into a problem statement, requirements, acceptance criteria, technical design, implementation plan, test plan, release plan, and needed artifacts without overbuilding.
license: Proprietary
compatibility: Designed for OpenAI Codex plugins and Agent Skills compatible coding agents. No network required.
metadata:
  version: "0.1.0"
  author: "Jovanny"
---

# Feature Specification

## Purpose

Turn a fuzzy feature into buildable engineering work.

## Feature discovery flow

1. Identify the user problem.
2. Identify the user-level outcome.
3. Define scope and non-scope.
4. Define success metrics.
5. Define acceptance criteria.
6. Map affected surfaces.
7. Identify data, security, privacy, and release risks.
8. Decide required artifacts.
9. Design the target flow.
10. Slice implementation.
11. Define verification and release.

## Product questions to ask when needed

Ask only questions that change product behavior:

- Who is the user?
- What should happen when the happy path succeeds?
- What should happen when it fails?
- What should the user see?
- What data is created, changed, stored, shared, or deleted?
- Is this internal, beta, or public?
- What would make this feature not worth shipping?

## Engineering defaults

If the user cannot answer technical questions, inspect the repo and infer:

- Existing patterns.
- Routing.
- State management.
- API style.
- Test setup.
- Deployment model.
- Auth model.
- Data model.

## Required output

For non-trivial features, produce:

```text
Problem statement:
User outcome:
Scope:
Non-scope:
Acceptance criteria:
Risks:
Recommended implementation strategy:
Required artifacts:
Verification plan:
Release plan:
```
