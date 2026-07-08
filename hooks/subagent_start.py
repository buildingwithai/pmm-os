#!/usr/bin/env python3
"""Give subagents the marketing operating rules without forcing them to edit."""

from _common import emit_additional, read_event


def main() -> None:
    event = read_event()
    agent_type = str(event.get("agent_type", "subagent"))
    context = f"""
PMM OS subagent context for {agent_type}:
- Stay inside your assigned lane and return evidence, gaps, and proposed next actions.
- Use product context and PMM artifacts from .agents/ when present.
- For marketing systems, do not recommend a write unless you can name the target account, workspace, audience, campaign, list, or property.
- Prefer concise artifacts the parent agent can merge into a launch plan, PLG diagnosis, PRD, prototype brief, messaging doc, analytics plan, validation readout, or enablement package.
""".strip()
    emit_additional("SubagentStart", context)


if __name__ == "__main__":
    main()
