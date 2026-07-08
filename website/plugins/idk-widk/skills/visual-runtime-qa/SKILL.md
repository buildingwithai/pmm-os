---
name: visual-runtime-qa
description: Use when a task involves browser UI behavior, visual parity, source-repo feature extraction, frontend regression, layout/design bugs, screenshots, DOM/CSS/network inspection, or before/after visual verification. Requires Chrome DevTools MCP connected to Chrome for Testing browser on http://127.0.0.1:9222.
license: Proprietary
compatibility: Designed for OpenAI Codex plugins and Agent Skills compatible coding agents. Requires Chrome DevTools MCP connected to a running debuggable Chrome instance.
metadata:
  version: "0.6.0"
  author: "Jovanny"
---

# Visual Runtime QA

## Purpose

Give idkWidk eyes in the real browser session. For any UI, frontend, source-repo parity, or browser-rendered feature, verify the actual rendered product instead of trusting code inspection or README screenshots.

This skill prevents the common AI failure where the agent clones or reimplements a complex product, produces a broken or oversimplified UI, and calls it done because the code compiled.

## Trigger conditions

Use this skill when the user mentions or implies:

```text
visual QA
screenshot
looks wrong
make it look like this
one-to-one parity
clone this feature
copy this UI
source repo runtime lab
frontend bug
layout bug
CSS bug
DOM
Chrome DevTools
active Chrome tab
Chrome for Testing browser
before and after
regression in appearance
```

## Mandatory Chrome for Testing rule

For browser UI tasks, Chrome DevTools MCP connected to Chrome for Testing instance is mandatory.

Use the configured MCP server:

```text
chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222
```

For agent browser testing, do not use the user's personal Chrome unless the user explicitly overrides this rule. Use Chrome for Testing with the persistent agent browser testing profile.

If Chrome DevTools MCP is unavailable or cannot connect to the live browser, stop and say what must be enabled. You may continue only with code inspection or planning, and you must mark visual QA as blocked.

## No duplicate tabs rule

Before opening or navigating a page:

1. Use `list_pages`.
2. Select the existing matching tab when one exists.
3. Use `select_page` with `bringToFront=true`.
4. Use `navigate_page` on that selected tab for reloads, retries, route changes, and same-site navigation.
5. Use `new_page` only if no suitable tab exists or the user explicitly asks for a new tab.

Never create a pile of duplicate tabs for the same URL. Never close user tabs without explicit approval.

## Visual QA workflow

### 1. Define what must be visually proven

Create or update `VISUAL_QA_PLAN.md`:

```text
Feature or screen:
Routes / pages:
User flows:
Reference source:
Viewports:
States to capture:
Success criteria:
Chrome DevTools MCP connection:
Known risks:
```

### 2. Capture upstream or historical references

For external repos, inspect README images, GIFs, videos, docs, examples, storybooks, screenshots, and demo routes. Also run the repo when safe and capture controlled screenshots from the Chrome for Testing tab.

Create or update `UPSTREAM_MEDIA_EVIDENCE.md` and `VISUAL_SNAPSHOT_MANIFEST.md`.

### 3. Capture target baseline before making changes

Before editing code, capture the current target app state from the Chrome for Testing tab:

```text
.idkwidk/runtime-captures/<task>/target-before/<viewport>/<route>.png
```

Record route, viewport, timestamp, commit, browser, selected page ID, and state setup.

### 4. Implement the smallest safe change

Do not rewrite the app because the UI looks wrong. Fix the smallest code path unless the implementation plan explicitly calls for a larger refactor.

### 5. Capture target after-change screenshots

After implementation, use the same Chrome for Testing tab and capture the same routes, states, and viewports:

```text
.idkwidk/runtime-captures/<task>/target-after/<viewport>/<route>.png
```

### 6. Compare

Compare upstream or historical reference, target before, and target after.

Use Chrome DevTools MCP evidence:

```text
- screenshot comparison
- DOM or accessibility snapshot comparison
- computed style comparison for key elements
- CSS variable/token comparison
- console message review
- network/API review when behavior depends on data
```

Create or update `VISUAL_DIFF_REPORT.md`.

### 7. Decide

Classify each visual or behavioral row:

```text
Match
Acceptable difference
Mismatch - must fix
Mismatch - intentional
Unknown
```

Do not call one-to-one parity complete unless all material rows are `Match` or `Acceptable difference` with a recorded reason.

## Setup failure rule

If the external source repo renders as a blank page, a single trivial HTML file, missing CSS, missing assets, wrong route, wrong product, broken build, or obviously incomplete UI, create `RUNTIME_SETUP_DIAGNOSTIC.md`.

Do not use the broken render as the reference.

## Required final answer for visual tasks

End with:

```text
Chrome DevTools MCP live connection:
Tab reused:
New tabs opened:
Screenshots captured:
What matches:
What does not match:
Console/network issues:
Visual QA status:
Remaining risk:
Next safe action:
```
