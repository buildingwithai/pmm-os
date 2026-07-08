# idkWidk

**idkWidk** stands for **I don't know what I don't know**.

It is a Codex plugin for non-engineers and AI-assisted builders who need the agent to behave more like a senior engineering team: classify messy requests, preserve the original objective, debug systematically, research open-source examples, recover old behavior after regressions, choose the right artifact templates, avoid silent refactors, and verify work before calling it done.

## What idkWidk does

- Turns rambling prompts, screenshots, fears, guesses, and product goals into an engineering brief.
- Keeps `MISSION_CONTROL.md` so the original objective does not get lost during side quests.
- Uses a risk-scaled engineering lifecycle for bugs, features, refactors, incidents, migrations, and releases.
- Searches and audits GitHub/open-source repos instead of reinventing the wheel.
- Clones external repos only into ignored `.idkwidk/external-repos/` workspaces.
- Supports permissive OSS feature adoption with provenance, notices, adapters, and parity tests.
- Supports clean-room reimplementation for restrictive, unclear, missing-license, GPL/AGPL, or source-available repos.
- Reconstructs old behavior with Behavior Archaeology when something used to work and now changed.
- Requires Chrome for Testing visual runtime QA for UI work so Codex does not claim success from code alone.

## v0.6.1: idkWidk routing gate

Agents must choose the relevant idkWidk workflow before acting when a request involves raw intake, bugs, regressions, features, multi-step work, GitHub or open-source repos, browser-visible UI, security/privacy, refactors, or verification.

## v0.6.2: Chrome for Testing Agent Browser default

For browser-visible work, idkWidk now treats Chrome DevTools MCP connected to Chrome for Testing as mandatory.

Regular Chrome is the user's personal browser. Chrome for Testing is the agent/debug browser.

The plugin MCP config connects to:

```text
http://127.0.0.1:9222
```

`127.0.0.1:9222` is not the product website. It is the local DevTools control socket agents use to inspect tabs, console logs, network requests, service workers, DOM, and extension state. The target app still runs on its own app URL, often `localhost:3000` for local development.

For agent browser testing, do not use the user's personal Chrome unless the user explicitly overrides this rule. Use Chrome for Testing with the persistent agent browser testing profile.

Start it with:

```bash
plugins/idk-widk/scripts/launch_chrome_for_testing_agent_browser.sh
```

Verify that port `9222` is owned by Chrome for Testing, not regular Chrome:

```bash
plugins/idk-widk/scripts/verify_chrome_for_testing_9222.py
```

If another process owns `9222`, the launch helper asks before closing it in an interactive shell. In non-interactive runs, it refuses to close anything automatically.

That uses:

```text
$HOME/Library/Application Support/Google/Chrome for Testing
```

The expected signed-in testing profile is `jovannnytovar@gmail.com`.

## No duplicate tabs rule

For browser UI testing, idkWidk must reuse tabs.

Before navigating anywhere, the agent should:

```text
1. call list_pages
2. select an existing matching tab when one exists
3. bring that tab to front
4. reload or navigate that selected tab
5. open a new tab only when no suitable tab exists or the user asks for it
```

It should not create ten tabs for the same URL. It should not close your tabs without your approval.

## Main skills

```text
idk-widk
input-intake-interpreter
mission-control
debugging-governor
behavior-archaeology
open-source-intelligence
external-repo-runtime-lab
permissive-oss-feature-adoption
clean-room-reimplementation
visual-runtime-qa
chrome-devtools-live-tab
artifact-generator
feature-specification
refactor-safety
security-privacy-guardrails
verification-release
```

## Important artifact templates

```text
MISSION_CONTROL.md
SESSION_HANDOFF.md
USER_SIGNAL_BRIEF.md
ENGINEERED_PROMPT.md
BEHAVIOR_ARCHAEOLOGY_BRIEF.md
EVIDENCE_BEHAVIOR_TABLE.md
SPEC_EXTRACTION_CONTRACT.md
EXTERNAL_REPO_RUNTIME_LAB.md
LICENSE_REUSE_DECISION_RECORD.md
FEATURE_PARITY_SPEC.md
CLEAN_ROOM_BEHAVIOR_SPEC.md
CHROME_DEVTOOLS_LIVE_TAB_CHECKLIST.md
TAB_REUSE_LEDGER.md
VISUAL_QA_PLAN.md
SOURCE_REPO_VISUAL_ASSET_INVENTORY.md
RUNTIME_SETUP_HEALTHCHECK.md
SCREENSHOT_CAPTURE_MANIFEST.md
VISUAL_BEHAVIOR_PARITY_MATRIX.md
VISUAL_RUNTIME_QA_REPORT.md
VERIFICATION_MATRIX.md
```

## Typical prompt

```text
Use idkWidk. I am not a software engineer. Treat my message as messy raw input, classify the task, extract the real goal, inspect any screenshots or files, and do not start coding until the evidence and next safe step are clear.
```

For visual/source parity:

```text
Use idkWidk Chrome for Testing Visual QA and External Repo Runtime Lab. Clone the repo into the ignored workspace, inspect license and setup safety, scan README/docs/GIFs/images for visual references, run the app if safe, connect Chrome DevTools MCP to Chrome for Testing at http://127.0.0.1:9222, reuse existing tabs, capture screenshots and DOM/CSS/console/network evidence, then compare source and target before claiming parity.
```

## Install

See `INSTALL.md`.
