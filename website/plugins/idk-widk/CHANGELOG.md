
## 0.6.2 - Chrome for Testing agent browser default

- Changed Chrome DevTools MCP guidance to use Chrome for Testing as the agent/debug browser default instead of the user's personal Chrome.
- Standardized the persistent Chrome for Testing profile at `$HOME/Library/Application Support/Google/Chrome for Testing` with profile directory `Default`.
- Added `scripts/launch_chrome_for_testing_agent_browser.sh` to launch Chrome for Testing on `127.0.0.1:9222`.
- Clarified that `127.0.0.1:9222` is the DevTools control socket, not the product website.
- Removed product-specific wording from the browser testing guidance.

## 0.6.1 - idkWidk routing gate

- Added an idkWidk-native Intake and Skill Routing Gate to the main skill.
- Requires agents to choose the relevant idkWidk workflow before responding, reading files, running commands, editing code, browsing, or asking clarifying questions when any idkWidk workflow reasonably applies.
- Strengthened session-start and prompt-submit hook context so raw, bug, feature, repo, UI, security, refactor, and release requests route into the right workflow first.
- Added plugin metadata for workflow routing and skill-selection discipline.


## 0.6.0 - Visual Runtime QA and mandatory Chrome DevTools MCP for repo labs

### 0.6.0 Chrome for Testing correction

- Keeps plugin version at 0.6.0.
- Removes Chrome DevTools MCP from the browser UI testing path.
- Requires Chrome DevTools MCP to connect to the active Chrome for Testing instance at `http://127.0.0.1:9222`.
- Adds tab reuse discipline: `list_pages` before navigation, reuse existing tabs, and do not open duplicate tabs for the same URL.
- Removes the isolated Chrome profile setting from the MCP config so the workflow targets the user live debug browser.



- Added `visual-runtime-qa` skill.
- Treats Chrome DevTools MCP as required for external repo runtime labs involving web or Chrome extension UI.
- Adds source repo visual asset discovery for README screenshots, GIFs, videos, docs images, demos, Storybook, and visual snapshots.
- Adds runtime setup validation so the agent proves the source app is actually running correctly before feature extraction.
- Adds before/after screenshot capture and visual diff artifacts.
- Adds scripts for visual asset scanning, visual QA artifact creation, and optional image comparison.

# v0.6.0 - Mandatory Visual Runtime QA

- Added `visual-runtime-qa` skill.
- Made Chrome DevTools MCP mandatory in the idkWidk workflow for browser-rendered work.
- Added visual reference inventory, runtime setup sanity check, visual QA plan, screenshot baseline register, visual parity criteria, and visual diff report templates.
- Added scripts to prepare ignored visual capture workspaces, collect visual assets from source repos, and create visual QA artifact packs.
- Updated external repo runtime, permissive OSS adoption, clean-room reimplementation, and verification workflows with visual evidence gates.
- Updated hooks to detect visual/screenshot/DOM/CSS/design prompts and activate Visual Runtime QA.

# Changelog


## 0.6.0

- Added External Repo Runtime Lab skill for ignored cloning, setup safety review, local runtime exploration, browser inspection, DOM/CSS/network capture, screenshots, and traces.
- Added Permissive OSS Feature Adoption skill for MIT/BSD/ISC/Apache-compatible feature extraction with notices, provenance, adapter boundaries, and parity tests.
- Added Clean Room Reimplementation skill for restrictive, unclear, missing, source-available, or incompatible licenses.
- Added templates for runtime lab, feature parity spec, permissive adoption plan, license reuse decision record, clean-room behavior spec, contamination log, feature extraction map, parity acceptance criteria, visual behavior parity matrix, upstream provenance, and runtime trace summaries.
- Added `prepare_external_repo_lab.py` and `create_oss_parity_artifacts.py` helper scripts.
- Updated hooks to detect GitHub repo links, cloning, feature extraction, one-to-one parity, and clean-room language.
- Added optional plugin-scoped Chrome DevTools MCP configuration for runtime lab browser inspection.


## 0.3.0

- Renamed plugin to `idkWidk`, with stable plugin identifier `idk-widk`.
- Added Input Intake Interpreter for rambling, uncertain, screenshot-based, and multimodal prompts.
- Added User Signal Brief, Engineered Prompt, Multimodal Evidence Brief, and Context Compaction Brief templates.
- Added persistence guidance for global and project `AGENTS.md`.
- Added optional plugin hooks for session context, prompt intake signals, risky command checks, and verification handoff enforcement.
- Kept the original heart icon assets.

## 0.2.0

- Added Open Source Intelligence mode.
- Added OSS integration strategy decision system.
- Added OSS research, repo audit, and license-related templates.
- Added `.external-repos/` research workspace helper.

## 0.1.x

- Initial engineering lifecycle plugin.
- Mission Control, debugging governor, artifact generator, verification, release, security, and refactor safety skills.


## 0.4.0

- Renamed and expanded regression recovery into Behavior Archaeology mode.
- Added `behavior-archaeology` skill.
- Added evidence behavior table, spec extraction contract, regression analysis report, characterization test plan, golden master approval test plan, historical behavior decision record, and regression prevention templates.
- Added helper script `create_behavior_archaeology_artifacts.py`.
- Updated main idkWidk skill and plugin metadata with behavior archaeology prompts and capabilities.
- Hook intake now detects old-behavior/regression language and nudges Codex into Behavior Archaeology.
