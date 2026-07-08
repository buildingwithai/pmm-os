# Project AGENTS.md for idkWidk

## Repo layout

TODO: Describe important directories.

## How to run

TODO: Add local dev command.

## How to test

TODO: Add test, lint, typecheck, build, and smoke-test commands.

## idkWidk rules

- Keep Mission Control for Level 2 or higher work.
- Create a User Signal Brief when the user's request is rambling, multimodal, or ambiguous.
- Do not silently refactor.
- Do not commit research-only open-source clones. Keep them under `.external-repos/`.
- Verify before claiming completion.

## Risk rules

TODO: Add auth, data, deployment, extension, or mobile-specific risks for this repo.

## idkWidk Visual Runtime QA rule

For browser-visible work, require Chrome DevTools MCP connected to the active Chrome for Testing browser at http://127.0.0.1:9222. Reuse existing tabs, do not open duplicate tabs, capture source/reference screenshots, target before screenshots, target after screenshots, DOM/CSS evidence, console/network observations, and a visual comparison summary before accepting completion.


## idkWidk visual runtime rule

For UI work, screenshots, external repo feature extraction, visual parity, browser flows, Chrome extension UI, mobile web, or visual regressions, require visual runtime evidence. Require Chrome DevTools MCP connected to the active Chrome for Testing browser for external repo runtime labs. Capture source/baseline screenshots before changes, capture target/after screenshots after changes, compare them, and do not claim visual parity or setup correctness without evidence.

## Mandatory Chrome DevTools MCP rule

For web UI work, source-repo runtime labs, visual parity, frontend debugging, browser extension UI, screenshot comparison, and before/after visual checks, use Chrome DevTools MCP connected to the active Chrome for Testing browser at `http://127.0.0.1:9222`. If it is unavailable, stop and ask for setup instead of continuing blind. Reuse existing tabs and do not open duplicate tabs for the same URL.

Browser UI rule: use Chrome DevTools MCP connected to `http://127.0.0.1:9222`, reuse an existing matching tab via `list_pages` and `select_page`, and never open duplicate tabs for the same URL unless the user explicitly asks.
