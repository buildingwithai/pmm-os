# Mandatory Browser Toolchain

The mandatory browser toolchain for web UI work is Chrome DevTools MCP connected to a running Chrome for Testing instance at `http://127.0.0.1:9222`.

Do not use the user's personal Chrome for agent browser testing unless the user explicitly overrides the rule.

Start Chrome for Testing with the persistent profile:

```text
$HOME/Library/Application Support/Google/Chrome for Testing
```

Load only:

```text
/Users/jovannytovar/pmm-clean/extensions/Job-Application-tracker/chrome-extension-dev
```

If Chrome DevTools MCP cannot connect, mark browser verification as blocked.
