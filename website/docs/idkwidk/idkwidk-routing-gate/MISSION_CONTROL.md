# Mission Control: idkWidk Routing Gate

## Original Objective

Implement an idkWidk-owned version of the strict skill-use discipline shown in the user's pasted Superpowers instructions.

## Current User-Level Goal

Make idkWidk force agents to route prompts into the right idkWidk workflow before they act.

## Current Engineering Phase

Verified first pass.

## Task Classification

- Work type: Plugin behavior and instruction design
- Risk level: Level 2
- Platform: Codex plugin skill and hook files
- Owner: Codex

## Current Hypothesis

The right implementation is not to copy the Superpowers text. The right implementation is an idkWidk-native routing gate that maps prompt signals to idkWidk workflows: Intake, Debugging, Behavior Archaeology, Feature Specification, Mission Control, External Repo Runtime Lab, Visual Runtime QA, Security Guardrails, Refactor Safety, and Verification Release.

## Evidence Collected

| Evidence | Source | Confidence | Notes |
|---|---|---:|---|
| Main idkWidk skill already defines classification, Mission Control, intake, behavior archaeology, OSS, visual QA, and verification behavior. | `plugins/idk-widk/skills/idk-widk/SKILL.md` | High | Needed a hard pre-action routing gate. |
| Session-start hook injects idkWidk context into Codex sessions. | `plugins/idk-widk/hooks/session_start_context.py` | High | Good place to remind agents before work begins. |
| Prompt-submit hook detects messy, bug, repo, and visual signals. | `plugins/idk-widk/hooks/user_prompt_submit_intake.py` | High | Good place to add skill/routing signal detection. |

## Active Workstream

Ship a minimal plugin update that makes routing discipline explicit and discoverable.

## Blocking Issues

| Issue | Why it blocks | Owner | Status |
|---|---|---|---|
| None currently known. | N/A | Codex | Clear |

## Side Quests and Parked Issues

| Issue | Classification | Notes |
|---|---|---|
| Building a separate Superpowers-compatible skill engine. | Parked | User asked for our own idkWidk version, not a copy. |
| Changing all individual skill versions. | Parked | Main plugin version and main skill version are enough for this scoped change. |

## Decision Log

| Decision | Reason |
|---|---|
| Add a routing gate to the main idkWidk skill. | This is the durable instruction agents will read. |
| Strengthen hooks instead of adding a new runtime system. | Hooks already inject context at the right time. |
| Bump plugin version to 0.6.1. | This is a behavior/instruction release after 0.6.0. |

## Files Touched

- `plugins/idk-widk/skills/idk-widk/SKILL.md`
- `plugins/idk-widk/hooks/session_start_context.py`
- `plugins/idk-widk/hooks/user_prompt_submit_intake.py`
- `plugins/idk-widk/.codex-plugin/plugin.json`
- `plugins/idk-widk/CHANGELOG.md`
- `docs/idkwidk/idkwidk-routing-gate/MISSION_CONTROL.md`

## Tests and Verification

- Passed: JSON manifest parse with `python3 -m json.tool`.
- Passed: marketplace JSON parse with `python3 -m json.tool`.
- Passed: skill YAML frontmatter parse with Ruby Psych.
- Passed: Python hook and script compilation with `python3 -m py_compile`.

## Next Best Action

Commit and push the 0.6.1 plugin update, then refresh the local plugin cache if needed.

## Resume Prompt

Continue the idkWidk routing gate release. Verify plugin metadata, hook syntax, and YAML frontmatter, then commit and push the 0.6.1 plugin update.
