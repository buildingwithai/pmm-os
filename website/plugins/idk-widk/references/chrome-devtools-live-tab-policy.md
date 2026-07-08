# Chrome DevTools Chrome for Testing Tab Policy

For browser-visible work, use Chrome DevTools MCP connected to Chrome for Testing at `http://127.0.0.1:9222`.

## Why

Regular Chrome is the user's personal browser. Chrome for Testing is the agent/debug browser. A persistent Chrome for Testing profile keeps Gmail/LinkedIn auth and extension state without touching personal tabs.

## Rules

1. Do not use the user's personal Chrome for agent browser testing unless the user explicitly overrides.
2. Start Chrome for Testing with `--remote-debugging-port=9222`, `--remote-debugging-address=127.0.0.1`, and the persistent testing profile.
3. Load only `/Users/jovannytovar/pmm-clean/extensions/Job-Application-tracker/chrome-extension-dev`.
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
