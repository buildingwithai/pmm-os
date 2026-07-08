---
name: chrome-devtools-live-tab
description: Use when idkWidk must inspect, test, screenshot, or compare a agent browser UI using Chrome DevTools MCP connected to Chrome for Testing on http://127.0.0.1:9222, while reusing existing tabs and avoiding duplicate tabs.
license: Proprietary
compatibility: Designed for OpenAI Codex plugins and Agent Skills compatible coding agents. Requires Chrome DevTools MCP connected to a running debuggable Chrome instance.
metadata:
  version: "0.6.2"
  author: "Jovanny"
---

# Chrome DevTools Chrome for Testing Discipline

## Purpose

Make agent browser testing happen in Chrome for Testing instead of the user's personal Chrome. Use Chrome DevTools MCP connected to the running Chrome for Testing instance at `http://127.0.0.1:9222`.

Plain English: regular Chrome is the user's personal browser. Chrome for Testing is the agent/debug browser.

This skill prevents three failures:

1. The agent disturbs the user's personal Chrome tabs.
2. The agent opens many duplicate tabs of the same URL.
3. The agent opens a new unauthenticated browser and fails on login or bot detection.
4. The agent claims UI success without screenshots, DOM/CSS evidence, console checks, or network checks from the actual testing page.

## Mandatory tool rule

For browser-visible work, use Chrome DevTools MCP connected to Chrome for Testing. Do not use the user's personal Chrome unless the user explicitly overrides this rule.

If Chrome DevTools MCP cannot connect to Chrome for Testing, stop and report the setup blocker. Continue only with planning or code inspection, and mark browser verification as blocked.

## Connection expectation

The plugin MCP config uses:

```text
--browser-url=http://127.0.0.1:9222
```

Chrome for Testing must already be running with remote debugging enabled on that same port, or the Chrome DevTools MCP connection will fail.

For agent browser, start Chrome for Testing with:

```bash
plugins/idk-widk/scripts/launch_chrome_for_testing_agent_browser.sh
```

That helper launches:

```text
Chrome for Testing
--remote-debugging-port=9222
--remote-debugging-address=127.0.0.1
--user-data-dir="$HOME/Library/Application Support/Google/Chrome for Testing"
--profile-directory="Default"
--load-extension="/Users/jovannytovar/pmm-clean/extensions/Job-Application-tracker/chrome-extension-dev"
```

The persistent testing profile should be signed in as `jovannnytovar@gmail.com`.

`127.0.0.1:9222` is the DevTools control socket. It is not the product website. The target app still runs on its own app URL, often `localhost:3000` for local development.

## Tab reuse rule

Before navigating anywhere:

1. Call `list_pages`.
2. Look for an existing tab with the same exact URL, same route, or same origin.
3. Use `select_page` with `bringToFront=true` for the best matching tab.
4. Use `navigate_page` on the selected tab to reload, go to a route, or retry.
5. Use `new_page` only when no suitable tab exists or the user explicitly asks for a new tab.

Do not create repeated tabs for the same URL. Do not close user tabs unless the user explicitly approves it.

## Chrome for Testing visual QA sequence

For UI work:

1. Select the existing Chrome for Testing tab.
2. Capture a baseline screenshot with `take_screenshot`.
3. Capture an accessibility or DOM snapshot with `take_snapshot`.
4. Inspect important runtime details with `evaluate_script` when needed.
5. Check console messages with `list_console_messages`.
6. Check network activity with `list_network_requests` when behavior depends on requests.
7. Make the code change.
8. Return to the same tab and reload with `navigate_page` type `reload` or navigate the selected tab to the target route.
9. Capture after screenshot and after snapshot.
10. Compare before/after or source/target evidence before claiming success.

## Completion rule

For browser UI work, report:

```text
Chrome DevTools MCP connected to Chrome for Testing:
Remote debugging URL:
Tab reused:
New tabs opened:
Screenshots captured:
DOM/a11y snapshot captured:
Console checked:
Network checked:
Visual comparison result:
Remaining verification gaps:
```

If any item is not done, say so directly.
