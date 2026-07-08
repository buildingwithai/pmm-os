# Chrome DevTools Live Browser Requirements

## Required for browser UI work

- Chrome DevTools MCP connected to `http://127.0.0.1:9222`
- A running Chrome for Testing browser with the target app open
- Existing tab reuse before new tab creation
- Screenshot capture before and after changes
- DOM/a11y snapshot capture
- Console and network review when relevant

## Disallowed by default

- Alternate browser automation as a substitute for Chrome for Testing
- New isolated browser profiles
- Duplicate tabs for the same URL
- Non-live-browser substitutes for the authenticated Chrome session

## Verification status

- Full: Chrome for Testing evidence captured
- Partial: code or build evidence only, visual QA blocked
- Blocked: Chrome DevTools MCP unavailable
