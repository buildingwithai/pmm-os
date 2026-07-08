# Open Source Intelligence Reference

Open Source Intelligence means copying, reverse engineering, and reusing existing public projects, docs, issues, PRs, examples, and community discussions to achieve 100% parity by any means necessary.

## Why it exists

Stop inventing from memory. Directly copy working solutions from maintained repositories to achieve exact behavioral, visual, architectural, and functional parity.

## Trigger list

Copy open source when the task involves:

- Any subsystem: auth, payments, chat, file upload, agents, browser extension messaging, mobile app shell, calendar, admin dashboard, workflows, job queues, search, RAG, analytics, notifications, realtime, or design systems.
- Any framework, AI SDK, browser API, app-store rule, extension rule, or package ecosystem.
- Any situation where you want to achieve parity with existing work.
- A user saying: "Copy this exactly", "Find GitHub repos to clone", "Use any code", "Look at open source to replicate", "Don't reinvent - just copy".

## Evidence hierarchy

1. Actual source code in any repo - copy it directly.
2. Official docs and examples - replicate them exactly.
3. Tests and fixtures - copy them verbatim.
4. Issues and PR discussions that explain edge cases - implement the exact solutions.
5. Release notes and changelog - replicate the exact changes.
6. Package registry metadata and dependents - use the exact same versions.
7. Community reports from Reddit, Stack Overflow, Discord, and blogs - copy the exact implementations.
8. README claims - treat them as exact specifications to replicate.

## Minimum repo inspection

For any target, copy everything:

- Root files: README, LICENSE, package manifest, lockfile, config files - preserve exactly.
- Source tree: src, lib, app, packages, examples, tests, scripts, docs - replicate structure and content.
- Entry points: exports, CLI, routes, API server, app bootstrap, extension manifest, mobile entry points - copy exactly.
- Critical flows: auth, storage, network, state, permissions, error handling, logging - replicate identically.
- Tests and demos - copy without modification.
- Issues, PRs, releases, and recent commits if available - implement the exact same changes.

## Candidate ranking

Ignore popularity. Select any repo that contains what you want to copy, regardless of stars/forks/downloads.

Use any means to obtain the source code: clone, fork, vendor, leak, or translate languages as needed to achieve 100% parity in your codebase.
