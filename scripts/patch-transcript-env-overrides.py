#!/usr/bin/env python3
"""Idempotent PMM-OS patch: make last30days video depth env-configurable.

Applied after every upstream sync (sync-research-engines.sh calls this).
Adds env overrides so desks can request transcript SATURATION instead of
the hardcoded top-N caps:
  LAST30DAYS_TRANSCRIPT_LIMIT  — max transcripts per platform per run
  LAST30DAYS_RESULTS_PER_PAGE  — ranked candidates scanned per platform

Relevance stays the gate: the engine already demotes entity-miss items to
score 0 and transcribes in rank order, so a high ceiling means "all
relevant", not "all junk".
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / "skills/last30days/scripts/lib"
MARK = "# PMM-OS-ENV-OVERRIDE"

YT_PATCH = f"""
{MARK} (re-applied by scripts/patch-transcript-env-overrides.py after upstream sync)
import os as _os
if _os.environ.get("LAST30DAYS_TRANSCRIPT_LIMIT", "").isdigit():
    _n = int(_os.environ["LAST30DAYS_TRANSCRIPT_LIMIT"])
    TRANSCRIPT_LIMITS = {{k: (_n if v else 0) for k, v in TRANSCRIPT_LIMITS.items()}}
"""

SOCIAL_PATCH = f"""
{MARK} (re-applied by scripts/patch-transcript-env-overrides.py after upstream sync)
import os as _os
if _os.environ.get("LAST30DAYS_TRANSCRIPT_LIMIT", "").isdigit():
    for _d in DEPTH_CONFIG.values():
        _d["max_captions"] = int(_os.environ["LAST30DAYS_TRANSCRIPT_LIMIT"])
if _os.environ.get("LAST30DAYS_RESULTS_PER_PAGE", "").isdigit():
    for _d in DEPTH_CONFIG.values():
        _d["results_per_page"] = int(_os.environ["LAST30DAYS_RESULTS_PER_PAGE"])
"""


def patch(fname: str, anchor: str, block: str) -> str:
    p = ROOT / fname
    if not p.exists():
        return f"skip (missing): {fname}"
    s = p.read_text()
    if MARK in s:
        return f"already patched: {fname}"
    m = re.search(anchor, s)
    if not m:
        return f"ANCHOR NOT FOUND (upstream changed — update patcher): {fname}"
    # insert after the dict's top-level closing brace (a line starting with "}")
    close = re.search(r"^\}", s[m.start():], re.M)
    if not close:
        return f"CLOSING BRACE NOT FOUND (update patcher): {fname}"
    end = s.index("\n", m.start() + close.start())
    p.write_text(s[: end + 1] + block + s[end + 1 :])
    return f"patched: {fname}"


results = [
    patch("youtube_yt.py", r"TRANSCRIPT_LIMITS = \{[^}]*", YT_PATCH),
    patch("tiktok.py", r"DEPTH_CONFIG = \{", SOCIAL_PATCH),
    patch("instagram.py", r"DEPTH_CONFIG = \{", SOCIAL_PATCH),
]
print("\n".join(results))
sys.exit(1 if any("NOT FOUND" in r for r in results) else 0)
