# Chrome DevTools Chrome for Testing Policy

For browser-visible work, use Chrome DevTools MCP connected to Chrome for Testing at `http://127.0.0.1:9222`.

Regular Chrome is the user's personal browser. Chrome for Testing is the agent/debug browser.

## Why

agent browser testing needs Gmail/LinkedIn auth, extension state, feature flags, local storage, and repeatable tabs without disturbing the user's personal Chrome. A persistent Chrome for Testing profile keeps those testing cookies while isolating agent work from the user's normal browser.

Use this persistent testing profile:

```text
$HOME/Library/Application Support/Google/Chrome for Testing
```

The expected signed-in profile is:

```text
jovannnytovar@gmail.com
```

## Rules

1. Do not use the user's personal Chrome for agent browser testing unless the user explicitly overrides.
2. Start Chrome for Testing with `--remote-debugging-port=9222` and `--remote-debugging-address=127.0.0.1`.
3. Load only the project dev extension folder: `/Users/jovannytovar/pmm-clean/extensions/Job-Application-tracker/chrome-extension-dev`.
4. Before navigating, call `list_pages`.
5. Reuse an existing matching tab with `select_page`.
6. Use `navigate_page` on the selected tab for reloads and route changes.
7. Use `new_page` only when no suitable tab exists or the user asks for a new tab.
8. Never create duplicate tabs for the same URL.
9. Never close tabs without permission.

## Required evidence

- Before screenshot
- After screenshot
- DOM/a11y snapshot
- Console review
- Network review where behavior depends on requests
- Visual comparison summary
