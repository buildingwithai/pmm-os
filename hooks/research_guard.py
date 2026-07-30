#!/usr/bin/env python3
"""Block any research-engine invocation that isn't the sanctioned one.

Why this exists: a model (me, twice, in production-like conditions) called the
last30days engine wrong and BOTH failures were silent.

  1. Invented `--sources reddit,hackernews --limit 6`. argparse printed usage,
     exit 2, and the run continued as if nothing happened.
  2. Used `--quick` instead of `--deep --plan`. Got 5 items from 2 sources and
     reported it as normal. The correct call returns 129 items from 6 sources.

Nothing in the engine can stop either one. LAW 7 ("--plan is MANDATORY") has no
runtime check at all, and every degraded run exits 0.

A PreToolUse hook CANNOT rewrite tool_input — only allow/deny/ask. So this denies
and hands back the corrected command; the model's retry is the redirect. That's
better than a silent rewrite: it sees the correct form and learns it.

Registered as a SECOND entry in the PreToolUse array. Claude Code runs every
matching hook and the most restrictive decision wins, so this composes with
pre_tool_use_policy.py without touching it.
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

CONTRACT = Path(__file__).resolve().parent.parent / "config" / "engine-contract.json"


def _load() -> dict:
    try:
        return json.loads(CONTRACT.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _texts(tool_name: str, tool_input: dict) -> list[str]:
    """Everything that could carry an engine call.

    Write/Edit are included deliberately: "write a helper script that shells the
    engine, then run it" is otherwise a clean bypass, and the second step looks
    like `bash tmp.sh` with no fingerprint in it.
    """
    if tool_name == "Bash":
        return [str(tool_input.get("command", ""))]
    if tool_name in {"Write", "Edit", "apply_patch", "NotebookEdit"}:
        return [
            str(tool_input.get("content", "")),
            str(tool_input.get("new_string", "")),
            str(tool_input.get("input", "")),
        ]
    return []


def _is_inert(text: str, contract: dict) -> bool:
    """Read-only calls that are useful and cannot produce a bad research run."""
    return any(tok in text for tok in contract.get("inert_allow", []))


def diagnose(text: str, contract: dict) -> str:
    """One line naming what is wrong with THIS command.

    Ordered most-specific first so the model gets the actionable complaint rather
    than the generic one.
    """
    for rule in contract.get("diagnostics", []):
        m = re.search(rule["match"], text)
        if m:
            says = rule["says"]
            for i, g in enumerate(m.groups() or (), start=1):
                says = says.replace("{%d}" % i, g or "")
            return says
    return "raw engine invocation outside the sanctioned wrapper."


def classify(tool_name: str, tool_input: dict, contract: dict) -> tuple[str, str]:
    """-> (decision, reason). decision in {"allow", "deny"}."""
    if not contract:
        return "allow", ""   # never block because our own config failed to load

    for text in _texts(tool_name, tool_input):
        if not text:
            continue
        if contract.get("escape_hatch_env", "PMM_OS_GUARD=off") in text:
            return "allow", ""
        if not any(re.search(fp, text) for fp in contract.get("fingerprints", [])):
            continue
        if _is_inert(text, contract):
            return "allow", ""
        if re.search(contract.get("sanctioned_pattern", r"pmm-research"), text):
            # Going through the wrapper. The wrapper does its own arg validation;
            # still catch the two flags that are wrong under any spelling.
            for rule in contract.get("diagnostics", []):
                if rule["id"] in {"invented-flags", "quick-on-research"} and re.search(rule["match"], text):
                    return "deny", _render(contract, diagnose(text, contract))
            return "allow", ""
        return "deny", _render(contract, diagnose(text, contract))
    return "allow", ""


def _render(contract: dict, diagnosis: str) -> str:
    return "\n".join(contract.get("deny_template", [])).replace("{DIAGNOSIS}", diagnosis)


def main() -> None:
    try:
        event = json.load(sys.stdin)
    except Exception:
        return
    decision, reason = classify(
        str(event.get("tool_name", "")), event.get("tool_input") or {}, _load()
    )
    if decision == "deny":
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": reason,
            }
        }))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass          # a guard that crashes must never block the user
    raise SystemExit(0)
