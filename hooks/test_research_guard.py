#!/usr/bin/env python3
"""Self-check for the research guard.

Case 1 and case 2 are the two real failures this exists to prevent, verbatim.
Everything else guards the guard: it must not block ordinary work, and it must
not be evadable by the obvious tricks.

Run:  python3 hooks/test_research_guard.py
"""
import json
import subprocess
import sys
from pathlib import Path

HOOK = Path(__file__).parent / "research_guard.py"

# (label, tool_name, tool_input, should_block)
CASES = [
    # --- the two real failures ---
    ("REAL #1: invented flags", "Bash", {"command":
        "python3 skills/last30days/scripts/last30days.py 'AI notetakers' --sources reddit,hackernews --limit 6"}, True),
    ("REAL #2: --quick", "Bash", {"command":
        "bash skills/last30days/run.sh 'AI for product marketing' --quick --emit compact"}, True),

    # --- bypass attempts ---
    ("raw python path", "Bash", {"command": "python3 last30days.py 'x' --deep"}, True),
    ("bash -lc wrapper", "Bash", {"command": "bash -lc 'python3 last30days.py x --deep'"}, True),
    ("chained after cd", "Bash", {"command": "cd /tmp && python3 last30days.py x"}, True),
    ("inside a subshell", "Bash", {"command": "echo $(python3 last30days.py x)"}, True),
    ("write a helper script", "Write", {"content": "#!/bin/sh\npython3 last30days.py \"$1\" --quick\n"}, True),
    ("edit one in", "Edit", {"new_string": "python3 skills/last30days/scripts/last30days.py x"}, True),
    ("raw reach.sh", "Bash", {"command": "bash skills/agent-reach/scripts/reach.sh yt https://y"}, True),
    ("bare agent-reach", "Bash", {"command": "agent-reach install --env=auto"}, True),

    # --- must NOT block: inert reads ---
    ("--diagnose", "Bash", {"command": "bash skills/last30days/run.sh --diagnose"}, False),
    ("--preflight", "Bash", {"command": "python3 last30days.py --preflight"}, False),
    ("doctor --json", "Bash", {"command": "bash reach.sh doctor --json"}, False),
    ("social-status", "Bash", {"command": "bash reach.sh social-status"}, False),
    ("--help", "Bash", {"command": "python3 last30days.py --help"}, False),

    # --- must NOT block: the sanctioned path ---
    ("wrapper, correct", "Bash", {"command":
        '"$CLAUDE_PLUGIN_ROOT/bin/pmm-research" last30days "AI notetakers" --depth deep --plan-file /tmp/p.json'}, False),
    ("wrapper, reach lane", "Bash", {"command": "pmm-research reach yt https://youtube.com/watch?v=x"}, False),

    # --- but the wrapper does not launder a bad flag ---
    ("wrapper + --quick", "Bash", {"command": "pmm-research last30days x --quick"}, True),
    ("wrapper + --limit", "Bash", {"command": "pmm-research last30days x --limit 6"}, True),

    # --- must NOT block: ordinary unrelated work ---
    ("git status", "Bash", {"command": "git status --porcelain"}, False),
    ("npm test", "Bash", {"command": "npm test"}, False),
    ("reading the skill", "Bash", {"command": "cat skills/last30days/SKILL.md | head -20"}, False),
    ("writing a doc", "Write", {"content": "# Research notes\n\nWe used the last30days engine.\n"}, False),

    # --- the escape hatch works, deliberately ---
    ("escape hatch", "Bash", {"command": "PMM_OS_GUARD=off python3 last30days.py x --quick"}, False),
]


def run(tool_name: str, tool_input: dict) -> dict:
    p = subprocess.run(
        [sys.executable, str(HOOK)],
        input=json.dumps({"hook_event_name": "PreToolUse",
                          "tool_name": tool_name, "tool_input": tool_input}),
        capture_output=True, text=True,
    )
    assert p.returncode == 0, f"guard exited {p.returncode}: {p.stderr}"
    return json.loads(p.stdout) if p.stdout.strip() else {}


def main() -> int:
    failures = []
    for label, tool, inp, should_block in CASES:
        out = run(tool, inp).get("hookSpecificOutput", {})
        blocked = out.get("permissionDecision") == "deny"
        if blocked != should_block:
            failures.append(f"  {label}: expected {'BLOCK' if should_block else 'allow'}, got "
                            f"{'BLOCK' if blocked else 'allow'}")

    # The deny message has to be actionable, not just a refusal.
    reason = run("Bash", {"command": "python3 last30days.py x --sources reddit --limit 6"}) \
        .get("hookSpecificOutput", {}).get("permissionDecisionReason", "")
    for must in ("pmm-research", "--depth deep", "--plan-file", "--search", "not a flag"):
        if must not in reason:
            failures.append(f"  deny text is missing {must!r}")

    if failures:
        print(f"✗ {len(failures)} failed:")
        print("\n".join(failures))
        return 1
    print(f"✓ all {len(CASES)} guard cases pass, and the deny text is actionable")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
