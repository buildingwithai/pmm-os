# idkWidk Hook Strategy

Plugin hooks are optional. They are useful when the user wants idkWidk behavior to feel persistent without manually invoking it on every turn.

Included hooks:

- `SessionStart`: adds idkWidk working context and points Codex to any existing Mission Control file.
- `UserPromptSubmit`: detects rambling, uncertain, or screenshot-based prompts and adds intake-interpreter context.
- `PreToolUse`: blocks or warns on risky shell commands such as destructive cleanup, force push, hard reset, or pipe-to-shell installers.
- `Stop`: asks Codex to add verification or handoff details before ending when it claims something is done without proof.

Hooks are guardrails, not a replacement for engineering judgment.
