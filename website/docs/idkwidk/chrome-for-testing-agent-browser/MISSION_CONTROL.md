# Mission Control: Chrome for Testing Agent Browser

## Original Objective

Change idkWidk Chrome DevTools MCP guidance so agent browser testing defaults to Chrome for Testing instead of the user's personal Chrome browser.

## Current User-Level Goal

Agents should use Chrome for Testing for agent browser work, keep Gmail/LinkedIn auth in the `Default` profile, load only the project dev extension, reuse tabs, and understand that `127.0.0.1:9222` is the DevTools control socket while the target app runs on its own app URL.

## Current Engineering Phase

Verified first pass.

## Task Classification

- Work type: Plugin behavior/config documentation and helper script
- Risk level: Level 2
- Platform: Codex plugin, Chrome DevTools MCP, agent browser Chrome extension testing
- Owner: Codex

## Current Hypothesis

The safest fix is to make Chrome for Testing the agent browser default while preserving Chrome DevTools MCP on `127.0.0.1:9222`. The plugin should stop saying "personal Chrome" as the default and instead say "Chrome for Testing for agent browser; regular Chrome is personal."

## Evidence Collected

| Evidence | Source | Confidence | Notes |
|---|---|---:|---|
| Chrome for Testing binary exists locally. | `/Users/jovannytovar/.cache/chrome-for-testing/chrome/mac_arm-148.0.7778.98/.../Google Chrome for Testing` | High | Matches requested `mac_arm-*` pattern. |
| Project dev extension folder exists. | `/Users/jovannytovar/pmm-clean/extensions/Job-Application-tracker/chrome-extension-dev` | High | This is the only extension folder currently configured as the default. |
| Existing plugin docs say to use active live/personal Chrome. | `plugins/idk-widk/references/*`, `skills/*`, README/INSTALL/templates | High | This conflicts with the new agent browser desired default. |

## Active Workstream

Update plugin guidance, templates, and helper tooling for Chrome for Testing Agent Browser.

## Blocking Issues

| Issue | Why it blocks | Owner | Status |
|---|---|---|---|
| None currently. | N/A | Codex | Clear |

## Side Quests and Parked Issues

| Issue | Classification | Notes |
|---|---|---|
| Proving Gmail account is signed into the testing profile. | Parked | Requires launching/inspecting browser state; current task is plugin guidance/config. |
| Changing Codex MCP server implementation. | Parked | MCP still connects to `http://127.0.0.1:9222`; browser launch is separate. |

## Decision Log

| Decision | Reason |
|---|---|
| Keep `--browser-url=http://127.0.0.1:9222`. | This is the DevTools control socket, not the product URL. |
| Add a launch helper script. | Agents should not hand-type a fragile Chrome for Testing command. |
| Use `~/Library/Application Support/Google/Chrome for Testing` with profile directory `Default`. | Matches the real Chrome for Testing profile already set up by the user. |
| Add a verifier for `9222`. | Prevents DevTools from silently connecting to regular Chrome when that process owns the port. |

## Files Touched

- `README.md`
- `plugins/idk-widk/.codex-plugin/plugin.json`
- `plugins/idk-widk/CHANGELOG.md`
- `plugins/idk-widk/INSTALL.md`
- `plugins/idk-widk/README.md`
- `plugins/idk-widk/config/idkwidk-visual-toolchain.config.toml`
- `plugins/idk-widk/hooks/session_start_context.py`
- `plugins/idk-widk/hooks/user_prompt_submit_intake.py`
- `plugins/idk-widk/references/*`
- `plugins/idk-widk/skills/*/SKILL.md`
- `plugins/idk-widk/assets/templates/*`
- `plugins/idk-widk/scripts/launch_chrome_for_testing_agent_browser.sh`
- `plugins/idk-widk/scripts/verify_chrome_for_testing_9222.py`

## Tests and Verification

- Passed: no product-specific browser-testing label remains in the touched plugin/docs.
- Passed: plugin JSON parse with `python3 -m json.tool`.
- Passed: marketplace JSON parse with `python3 -m json.tool`.
- Passed: skill YAML frontmatter parse with Ruby Psych.
- Passed: Python hook/script compile with `python3 -m py_compile`.
- Passed: shell launch helper syntax check with `bash -n`.
- Passed: local Chrome for Testing cache path exists.
- Passed: configured dev extension folder exists.

## Next Best Action

Commit and push the 0.6.2 Chrome for Testing agent browser update.

## Resume Prompt

Continue the Chrome for Testing Agent Browser plugin update. Replace personal Chrome default guidance with Chrome for Testing default guidance, preserve `127.0.0.1:9222` as the DevTools socket, validate plugin files, then commit and push.
