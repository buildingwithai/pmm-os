# Persistence and Context Compaction

A plugin gives Codex reusable skills and optional hooks. It does not magically preserve all chat context forever. idkWidk uses durable files to keep state recoverable:

- `MISSION_CONTROL.md` preserves original objective, phase, blockers, decisions, files, tests, and next action.
- `SESSION_HANDOFF.md` records what happened before stopping.
- `CONTEXT_COMPACTION_BRIEF.md` summarizes state when the conversation gets long.
- `AGENTS.md` stores durable behavior rules that load with the project.

For best reliability, combine installed plugin plus global `~/.codex/AGENTS.md` plus repo-level `AGENTS.md`.
