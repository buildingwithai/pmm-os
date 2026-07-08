---
name: verification-release
description: Use before claiming a bug is fixed, a feature is done, a refactor is safe, or a release is ready. Builds a verification matrix, runs or recommends tests, checks manual flows, security, privacy, performance, accessibility, rollback, release notes, monitoring, canaries, and production validation.
license: Proprietary
compatibility: Designed for OpenAI Codex plugins and Agent Skills compatible coding agents. No network required.
metadata:
  version: "0.6.0"
  author: "Jovanny"
---

# Verification and Release

## Purpose

Make the difference between "the code changed" and "the product is safe to use" explicit.

## Verification levels

Use the right mix:

- Static checks: lint, typecheck, formatting, dependency audit.
- Unit tests: small behavior checks.
- Integration tests: components or services working together.
- Contract tests: API, schema, event, message, webhook, or extension message shape.
- End-to-end tests: real user paths.
- Regression tests: the original bug path stays fixed.
- Manual exploratory tests: realistic user behavior.
- Accessibility checks: keyboard, screen reader basics, contrast, labels.
- Security checks: auth, authorization, validation, secrets, public exposure.
- Privacy checks: data minimization, logs, retention, access.
- Performance checks: latency, bundle size, memory, battery, slow network.
- Migration checks: data integrity, idempotency, rollback.
- Platform checks: browser, mobile OS, extension permissions, offline behavior.

## Verification matrix

For Level 2 or higher, create:

```text
docs/idkwidk/<work-slug>/VERIFICATION_MATRIX.md
```

Each row should include:

```text
Requirement or risk:
Test or check:
Environment:
Owner:
Status:
Evidence:
Gap or follow-up:
```

## Release readiness

Before release, verify:

- Acceptance criteria pass.
- Known risks are either mitigated or accepted.
- Monitoring exists for likely failures.
- Logs are useful and safe.
- Rollback or kill switch path is known.
- Support or user communication is ready when needed.
- Release notes are written for user-visible changes.
- Dogfood or beta feedback is acceptable for user-facing features.


## Visual verification gate

For UI, browser, Chrome extension, design, and visual parity work, verification must include runtime visual evidence.

Required evidence where applicable:

- Source or reference screenshot.
- Target before screenshot.
- Target after screenshot.
- DOM snapshot or relevant DOM/CSS findings.
- Console and network review.
- Visual diff report or screenshot comparison.
- Chrome DevTools MCP trace or screenshot test when the flow should be protected long term.

If these were not run, list them under `Not verified` and do not say full visual verification passed.

## Final verification statement

Never write "fixed" alone. Write:

```text
Verified:
- <check that passed>

Not verified:
- <important check not run>

Remaining risk:
- <risk>
```
