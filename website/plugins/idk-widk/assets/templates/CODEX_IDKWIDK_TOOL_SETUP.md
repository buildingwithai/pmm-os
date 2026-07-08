# idkWidk Chrome DevTools MCP Setup

idkWidk browser UI testing uses Chrome DevTools MCP connected to your active Chrome for Testing.

## MCP server

```json
{
  "mcp_servers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--browser-url=http://127.0.0.1:9222",
        "--no-usage-statistics",
        "--no-performance-crux",
        "--redactNetworkHeaders=true",
        "--experimentalPageIdRouting"
      ]
    }
  }
}
```

## Start Chrome with remote debugging

macOS example:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.idkwidk/chrome-debug-profile"
```

Then open the app in that Chrome window and log in if needed.

## Verify

```bash
curl http://127.0.0.1:9222/json/version
```

## Rules

- Reuse existing tabs.
- Do not open duplicate tabs for the same URL.
- Use `list_pages` before navigating.
- Use `select_page` before `navigate_page`.
- For agent browser testing, do not use the user's personal Chrome unless the user explicitly overrides this rule. Use Chrome for Testing with the persistent agent browser testing profile.
