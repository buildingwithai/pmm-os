#!/usr/bin/env python3
"""Self-check for the PreToolUse guardrails.

The original patterns hard-denied `cat src/styles/tokens.css`, `cat monkey-patch.js`,
`grep -rn token src/`, and `printenv NODE_ENV` — everyday commands, blocked outright.
This pins both directions: real secret reads still get flagged, ordinary work does not.

Run:  python3 hooks/test_pre_tool_use_policy.py
"""
import json
import subprocess
import sys
from pathlib import Path

HOOK = Path(__file__).parent / "pre_tool_use_policy.py"

# (command, should_be_flagged)
CASES = [
    # --- must NOT be flagged: ordinary commands that the old regexes denied ---
    ("cat src/styles/tokens.css", False),
    ("cat design-tokens.json", False),
    ("cat monkey-patch.js", False),
    ("grep -rn token src/", False),
    ("grep -i password README.md", False),
    ("printenv NODE_ENV", False),
    ("echo $PATH", False),
    ("cat package.json", False),
    ("head -20 docs/keystone.md", False),
    ("git log --oneline", False),
    # --- must be flagged: genuine secret exposure ---
    ("cat .env", True),
    ("cat .env.local", True),
    ("cat ~/.aws/credentials", True),
    ("cat ~/.ssh/id_rsa", True),
    ("cat certs/server.pem", True),
    ("cat config/secrets.json", True),
    ("grep OPENAI_API_KEY .", True),
    ("grep -rn STRIPE_SECRET_KEY src/", True),
    ("printenv", True),
    ("env", True),
    # --- destructive: flagged regardless ---
    ("rm -rf /", True),
    ("sudo rm -rf /var", True),
]


def run(command: str) -> dict:
    event = {"hook_event_name": "PreToolUse", "tool_name": "Bash",
             "tool_input": {"command": command}}
    p = subprocess.run([sys.executable, str(HOOK)], input=json.dumps(event),
                       capture_output=True, text=True)
    assert p.returncode == 0, f"hook exited {p.returncode} for {command!r}: {p.stderr}"
    return json.loads(p.stdout) if p.stdout.strip() else {}


def main() -> int:
    failures = []
    for command, should_flag in CASES:
        out = run(command).get("hookSpecificOutput", {})
        flagged = out.get("permissionDecision") in {"deny", "ask"}
        if flagged != should_flag:
            failures.append(
                f"  {command!r}: expected {'flagged' if should_flag else 'allowed'}, "
                f"got {out.get('permissionDecision', 'allowed')}"
            )

    # A crash must never block the user — that is what bricked the plugin.
    assert run("cat .env").get("hookSpecificOutput", {}).get("permissionDecision") == "ask", \
        "secret reads should ask, not deny — a marketing plugin shouldn't hard-block"

    if failures:
        print(f"✗ {len(failures)}/{len(CASES)} failed:")
        print("\n".join(failures))
        return 1
    print(f"✓ all {len(CASES)} policy cases pass")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
