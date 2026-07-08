#!/usr/bin/env python3
"""Add follow-up context after common marketing tool outcomes."""

from __future__ import annotations

import re
from _common import collect_text, read_event


def add_context(text: str) -> None:
    print({
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": text,
        }
    })

# Use json explicitly to avoid Python repr.
import json

def emit(text: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": text,
        }
    }))


def main() -> None:
    event = read_event()
    text = collect_text(event).lower()

    if re.search(r"\b(401|403|unauthorized|forbidden|invalid_grant|invalid token|permission denied)\b", text):
        emit("The last tool call appears to have an auth or permission failure. Check OAuth scopes, account selection, workspace permissions, and the local integration guide before retrying.")
        return

    if re.search(r"\b(429|rate limit|quota exceeded|too many requests)\b", text):
        emit("The last tool call appears rate-limited. Prefer pagination, narrower date ranges, cached exports, or a delayed retry strategy.")
        return

    if re.search(r"\b(invalid audience|invalid campaign|invalid customer|list not found|property not found|not found)\b", text):
        emit("The last marketing platform call may reference a missing or invalid resource. Verify account, property, audience, campaign, list, or customer IDs before continuing.")
        return

    if re.search(r"\b(ga4|analytics|funnel|conversion|event|experiment|a/b|ab test)\b", text):
        emit("Marketing measurement note: connect any findings to a metric, baseline, segment, owner, and decision rule before recommending a launch or experiment decision.")
        return

    if re.search(r"\b(email|audience|segment|campaign|ads|ad group|budget|crm|contact)\b", text):
        emit("Production marketing note: before any write action, keep a preview or dry-run artifact and record the target account, audience, campaign, list, and rollback plan.")
        return


if __name__ == "__main__":
    main()
