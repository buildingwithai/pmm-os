# Runtime Toolchain

For agent browser UI work, the runtime toolchain is Chrome DevTools MCP connected to Chrome for Testing at `http://127.0.0.1:9222`.

Regular Chrome is the user's personal browser. Chrome for Testing is the agent/debug browser.

Start Chrome for Testing with:

```bash
/Users/jovannytovar/.cache/chrome-for-testing/chrome/mac_arm-*/chrome-mac-arm64/Google\ Chrome\ for\ Testing.app/Contents/MacOS/Google\ Chrome\ for\ Testing \
  --remote-debugging-port=9222 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$HOME/Library/Application Support/Google/Chrome for Testing" \
  --profile-directory="Default" \
  --load-extension="/Users/jovannytovar/pmm-clean/extensions/Job-Application-tracker/chrome-extension-dev"
```

The profile should be the persistent agent browser testing profile signed in as `jovannnytovar@gmail.com`.

`127.0.0.1:9222` is not the product website. It is the local DevTools control socket agents use to inspect tabs, console logs, network requests, service workers, DOM, and extension state. The target app still runs on its own app URL, often `localhost:3000` for local development.

## Required use

Use Chrome DevTools MCP for:

- screenshots
- DOM or accessibility snapshots
- computed CSS and layout inspection
- console messages
- network requests
- storage and route state when relevant
- source repo setup validation
- before/after visual comparison

## Chrome for Testing rule

The agent should not use the user's personal Chrome for agent browser testing. It should connect to the Chrome for Testing debug endpoint and inspect that isolated testing browser context.

Load only the dev extension folder:

```text
/Users/jovannytovar/pmm-clean/extensions/Job-Application-tracker/chrome-extension-dev
```

## Tab reuse

Before navigation, use `list_pages`, select the existing matching tab, and then reload or navigate that selected tab. Use a new tab only when no suitable tab exists or the user explicitly asks for one.

## Blocked state

If Chrome DevTools MCP cannot connect to `http://127.0.0.1:9222`, mark browser verification as blocked. Continue only with planning or code inspection.
