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

# Match the FILE ARGUMENT, not the whole command line. Matching the line meant
# `cat src/styles/tokens.css` and `cat monkey-patch.js` were both hard-denied
# ("token", "key" as substrings). Basename-anchored, so a path can't smuggle a
# match in from a directory name either.
READ_COMMANDS = r"cat|bat|less|more|head|tail|strings|xxd|od|nl"
SECRET_FILE_RE = re.compile(
    r"(^|/)("
    r"\.env(\.[\w-]+)?"
    r"|credentials|\.netrc|\.pgpass|\.htpasswd"
    r"|id_(rsa|dsa|ecdsa|ed25519)"
    r"|[\w.-]*(secret|password|credential)s?[\w.-]*\.(json|ya?ml|txt|env|ini|conf|pem)"
    r"|[\w.-]*\.(pem|p12|pfx|key)"
    r")$",
    re.IGNORECASE,
)
# Case-SENSITIVE, full identifier. `grep -rn token src/` is an everyday command;
# `grep OPENAI_API_KEY` is not.
# An ALL-CAPS compound identifier (>=1 underscore) containing a secret word
# anywhere in it, so STRIPE_SECRET_KEY and OPENAI_API_KEY both match.
SECRET_IDENT_RE = re.compile(
    r"\bgrep\b[^|;]*"
    r"\b(?=[A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL))"
    r"[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b"
)
# Only a bare dump. `printenv NODE_ENV` asks for one non-secret variable.
BARE_ENV_DUMP_RE = re.compile(r"(^|[;&|]\s*)(printenv|env)\s*($|[;&|])")

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


def decide(decision: str, reason: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": decision,
            "permissionDecisionReason": reason,
        }
    }))


def deny(reason: str) -> None:
    decide("deny", reason)


def ask(reason: str) -> None:
    """Surface it and let the user judge. A marketing plugin has no business
    hard-denying a command it merely finds suspicious."""
    decide("ask", reason)


def add_context(text: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "additionalContext": text,
        }
    }))


def _reads_secret_file(command: str) -> bool:
    """True if a read command targets a secret-shaped filename."""
    for m in re.finditer(rf"\b({READ_COMMANDS})\s+((?:-\S+\s+)*)(\S+)", command):
        arg = m.group(3).strip("\"'")
        if SECRET_FILE_RE.search(arg):
            return True
    return False


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
        # Note: match against `command`, not `lowered` — SECRET_IDENT_RE is
        # deliberately case-sensitive so lowercase `token` doesn't trip it.
        if _reads_secret_file(command) or SECRET_IDENT_RE.search(command) \
                or BARE_ENV_DUMP_RE.search(command):
            ask("This command may print a secret or credential. Approve it if that's intended, "
                "or narrow it to the specific non-secret value you need.")
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
    try:
        main()
    except Exception:
        pass          # a hook crash must never block the user
    raise SystemExit(0)
