#!/usr/bin/env python3
"""Guardrails before shell, patch, and MCP tool calls."""

from __future__ import annotations

import json
import re
from _common import read_event

DESTRUCTIVE_PATTERNS = [
    r"\brm\s+-rf\s+/(\s|$)",
    r"\brm\s+-rf\s+~",
    r"\bsudo\s+rm\s+-rf\b",
    r"\bmkfs\b",
    r"\bdd\s+if=",
    r":\(\)\s*\{\s*:\|:",
]

SECRET_PATTERNS = [
    r"\bcat\s+\.env(\.|\s|$)",
    r"\bcat\s+.*(secret|token|password|credential|key).*(\.json|\.txt|\.env)?\b",
    r"\bgrep\b.*(OPENAI_API_KEY|API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY)",
    r"\bprintenv\b",
]

PRODUCTION_WRITE_TERMS = [
    "send", "publish", "launch", "activate", "pause", "delete", "archive", "refund",
    "charge", "cancel", "import", "sync", "invite", "broadcast", "create_campaign",
    "update_campaign", "create_contact", "update_contact", "send_email", "send_sms",
]

RISKY_SYSTEM_TERMS = [
    "ads", "mailchimp", "customer", "sendgrid", "resend", "hubspot", "salesforce",
    "stripe", "paddle", "crm", "campaign", "audience", "segment", "klaviyo", "postmark",
    "zapier", "webflow", "wordpress", "cms", "linkedin", "meta", "google_ads", "roadmap", "prd", "prototype", "release",
]


def deny(reason: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))


def add_context(text: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "additionalContext": text,
        }
    }))


def main() -> None:
    event = read_event()
    tool_name = str(event.get("tool_name", ""))
    tool_input = event.get("tool_input") or {}
    input_text = json.dumps(tool_input, sort_keys=True, default=str).lower()[:6000]

    if tool_name == "Bash":
        command = str(tool_input.get("command", ""))
        lowered = command.lower()
        for pattern in DESTRUCTIVE_PATTERNS:
            if re.search(pattern, lowered):
                deny("Blocked destructive shell command. Use a narrower, reviewed command instead.")
                return
        for pattern in SECRET_PATTERNS:
            if re.search(pattern, lowered, flags=re.IGNORECASE):
                deny("Blocked command that may expose secrets or credentials. Use a targeted redacted check instead.")
                return
        if re.search(r"(curl|wget).+\|\s*(sh|bash)", lowered):
            add_context("This command pipes remote code into a shell. Prefer downloading, inspecting, and pinning the script before execution.")
            return

    combined = (tool_name + " " + input_text).lower()
    if tool_name.startswith("mcp__"):
        if any(term in combined for term in PRODUCTION_WRITE_TERMS) and any(term in combined for term in RISKY_SYSTEM_TERMS):
            add_context(
                "This looks like a production marketing or revenue-system write. Confirm target account, workspace, audience, campaign, list, property, and dry-run or preview mode before proceeding."
            )
            return

    if tool_name in {"apply_patch", "Edit", "Write"}:
        if any(path in input_text for path in [".codex-plugin/plugin.json", ".mcp.json", "hooks/hooks.json"]):
            add_context("This edit touches plugin runtime configuration. Re-run JSON validation, hook compile checks, and the MCP smoke test before considering the plugin ready.")
            return


if __name__ == "__main__":
    main()
