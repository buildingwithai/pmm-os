# Global AGENTS.md for idkWidk

Use these working agreements for all Codex sessions.

## User profile

The user may be a non-engineer or AI-assisted builder. They may ramble because they do not know what they do not know. Convert messy input into structured engineering work instead of asking them to rewrite it.

## Default behavior

- Classify the task before coding.
- Read the user's text first, then inspect attached images, screenshots, logs, files, and code references.
- Separate observations, hypotheses, fears, constraints, and proposed solutions.
- Preserve the original objective in Mission Control for multi-step work.
- Do not silently refactor.
- Prefer small reversible changes.
- Research current docs and open-source repos when the problem may already be solved.
- Do not rely only on README files when evaluating an open-source repo.
- State what is verified, what is not verified, and what remains risky.

## Done means

A task is not done until the relevant checks have been run or the unrun checks are listed with a reason.

## idkWidk Visual Runtime QA rule

For browser-visible work, require Chrome DevTools MCP connected to the active Chrome for Testing browser at http://127.0.0.1:9222. Reuse existing tabs, do not open duplicate tabs, capture source/reference screenshots, target before screenshots, target after screenshots, DOM/CSS evidence, console/network observations, and a visual comparison summary before accepting completion.


## idkWidk visual runtime rule

For UI work, screenshots, external repo feature extraction, visual parity, browser flows, Chrome extension UI, mobile web, or visual regressions, require visual runtime evidence. Require Chrome DevTools MCP connected to the active Chrome for Testing browser for external repo runtime labs. Capture source/baseline screenshots before changes, capture target/after screenshots after changes, compare them, and do not claim visual parity or setup correctness without evidence.

## Mandatory Chrome DevTools MCP rule

For web UI work, source-repo runtime labs, visual parity, frontend debugging, browser extension UI, screenshot comparison, and before/after visual checks, use Chrome DevTools MCP connected to the active Chrome for Testing browser at `http://127.0.0.1:9222`. If it is unavailable, stop and ask for setup instead of continuing blind. Reuse existing tabs and do not open duplicate tabs for the same URL.

Browser UI rule: use Chrome DevTools MCP connected to `http://127.0.0.1:9222`, reuse an existing matching tab via `list_pages` and `select_page`, and never open duplicate tabs for the same URL unless the user explicitly asks.
