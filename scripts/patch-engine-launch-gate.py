#!/usr/bin/env python3
"""Inject a launch gate into the vendored last30days engine.

The PreToolUse guard (hooks/research_guard.py) catches every invocation it can
SEE. This catches the ones it cannot: a path assembled at runtime
(`p=last30; "${p}0days.py"`), a copy of the engine fetched from elsewhere, or any
host that runs hooks differently than we expect.

Verified 2026-07-30 against Codex's own generated schema
(codex-rs/hooks/schema/generated/pre-tool-use.command.output.schema.json): Codex
DOES support permissionDecision allow|deny|ask on preToolUse, so the guard is
real enforcement on both hosts and this gate is defense in depth rather than the
only line. Keeping it anyway — it costs nothing at runtime and covers the
regex-invisible cases.

This must be a patcher, not an edit: scripts/sync-research-engines.sh does
`rm -rf skills/last30days/scripts` and re-copies from upstream, so anything
written directly into the engine is erased on the next pull. Same idempotent,
anchor-guarded convention as patch-transcript-env-overrides.py.

Run:  python3 scripts/patch-engine-launch-gate.py [--check]
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENGINE = ROOT / "skills" / "last30days" / "scripts" / "last30days.py"

BEGIN = "# --- PMM-OS-LAUNCH-GATE (re-applied by scripts/patch-engine-launch-gate.py) ---"
END = "# --- END PMM-OS-LAUNCH-GATE ---"

# Exit 78 is EX_CONFIG. Deliberately not 1 or 2, so a gate refusal is
# distinguishable from a real engine error in logs and in the wrapper.
GATE = f'''{BEGIN}
# Direct invocation skips Python resolution, live source health, --search
# synthesis and the post-run receipt — every one of which exists because a
# silent bad run already happened. The wrapper sets PMM_OS_LAUNCH=1.
import os as _pmm_os
import sys as _pmm_sys

_PMM_INERT = ("--help", "-h", "--version", "--welcome", "--preflight", "--diagnose")
if _pmm_os.environ.get("PMM_OS_LAUNCH") != "1" and not any(
    _a in _pmm_sys.argv for _a in _PMM_INERT
) and not (len(_pmm_sys.argv) > 1 and _pmm_sys.argv[1] in ("setup", "doctor")):
    _pmm_sys.stderr.write(
        "last30days must be launched through PMM OS's wrapper:\\n"
        '  "$CLAUDE_PLUGIN_ROOT/bin/pmm-research" last30days "TOPIC" '
        '--depth deep --plan-file FILE\\n'
        "\\nDirect invocation skips:\\n"
        "  - Python resolution (this engine needs 3.12+; stock macOS ships 3.9)\\n"
        "  - live source health, and --search synthesised from what is actually up\\n"
        "  - the run receipt, which is the only thing that reports a degraded run\\n"
        "    (the engine exits 0 and can print 5/5 core sources while four\\n"
        "     sources returned nothing)\\n"
        "\\nSet PMM_OS_LAUNCH=1 to override deliberately.\\n"
    )
    raise SystemExit(78)
{END}
'''

ANCHOR = "ensure_supported_python()"


def current(text: str) -> str | None:
    if BEGIN not in text:
        return None
    return text[text.index(BEGIN): text.index(END) + len(END)]


def apply(check_only: bool = False) -> int:
    if not ENGINE.is_file():
        print(f"✗ engine not found at {ENGINE}")
        return 1
    text = ENGINE.read_text(encoding="utf-8")

    if BEGIN in text:
        if current(text) == GATE.strip():
            print("✓ launch gate already applied and current")
            return 0
        # Replace an older version of our own block rather than stacking.
        start, end = text.index(BEGIN), text.index(END) + len(END)
        text = text[:start] + GATE.strip() + text[end:]
        if check_only:
            print("✗ launch gate is stale — run without --check to update")
            return 1
        ENGINE.write_text(text, encoding="utf-8")
        print("✓ launch gate updated")
        return 0

    if check_only:
        print("✗ launch gate is NOT applied — run scripts/patch-engine-launch-gate.py")
        return 1

    if ANCHOR not in text:
        print(f"✗ anchor {ANCHOR!r} not found — the engine's startup shape changed. "
              "Re-read last30days.py before forcing this.")
        return 1

    # Immediately after the Python version check, so a wrong interpreter still
    # reports the interpreter problem first.
    i = text.index(ANCHOR) + len(ANCHOR)
    nl = text.index("\n", i) + 1
    ENGINE.write_text(text[:nl] + "\n" + GATE + text[nl:], encoding="utf-8")
    print(f"✓ launch gate injected after {ANCHOR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(apply(check_only="--check" in sys.argv))
