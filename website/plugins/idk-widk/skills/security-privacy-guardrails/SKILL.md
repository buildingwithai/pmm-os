---
name: security-privacy-guardrails
description: Use when work touches auth, authorization, user data, secrets, payments, browser extension permissions, mobile permissions, third-party integrations, APIs, logs, public deployment, file uploads, AI agents, or any feature that could expose private data. Applies secure software development, OWASP-style checks, threat modeling, privacy review, and safe release defaults for non-engineer vibe coders.
license: Proprietary
compatibility: Designed for OpenAI Codex plugins and Agent Skills compatible coding agents. No network required.
metadata:
  version: "0.1.0"
  author: "Jovanny"
---

# Security and Privacy Guardrails

## Purpose

Prevent the common vibe-coding security failure: shipping something public, powerful, or data-bearing without understanding access control, privacy, secrets, or abuse cases.

## Immediate escalation triggers

Escalate to high risk if the task touches:

- Login, signup, passwords, sessions, tokens, OAuth, magic links, SSO, or account recovery.
- Roles, permissions, admin features, billing access, or organization membership.
- Personal data, health data, financial data, customer messages, private files, internal documents, or student data.
- Secrets, environment variables, API keys, webhooks, service accounts, private repositories, or logs.
- Public deployments, search indexing, preview URLs, or sharing settings.
- Browser extension host permissions, content scripts, message passing, or storage.
- Mobile permissions, location, contacts, camera, microphone, notifications, or background behavior.
- File upload, import/export, email, SMS, notifications, or third-party integrations.
- AI agent actions that can read files, call tools, send messages, or mutate state.

## Minimum checks

For any security-sensitive task:

1. Identify assets to protect.
2. Identify who can access what.
3. Identify trust boundaries.
4. Identify data created, read, updated, deleted, logged, exported, or shared.
5. Check default privacy and public visibility.
6. Check secrets are not committed or exposed.
7. Check auth and authorization are enforced server-side where applicable.
8. Check validation and error handling.
9. Check logs do not leak sensitive data.
10. Define abuse cases and mitigations.
11. Define tests or manual checks.
12. Define rollback, disable, or kill switch path.

## Required artifacts

Use:

- `assets/templates/THREAT_MODEL.md`
- `assets/templates/PRIVACY_REVIEW.md`
- `assets/templates/ROLLBACK_KILL_SWITCH_PLAN.md`
- `assets/templates/RUNBOOK.md`

Do not skip these for high-risk work.

## Plain-language warning for the user

When relevant, explain:

```text
This is not just a code change. It affects who can see or change data. That means a working demo is not enough. We need to verify access control, privacy defaults, logs, and rollback before release.
```
