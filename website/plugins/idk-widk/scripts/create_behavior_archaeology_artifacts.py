#!/usr/bin/env python3
"""Create idkWidk behavior archaeology artifact pack."""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from shutil import copyfile

TEMPLATES = [
    "MISSION_CONTROL.md",
    "BEHAVIOR_ARCHAEOLOGY_BRIEF.md",
    "EVIDENCE_BEHAVIOR_TABLE.md",
    "REGRESSION_ANALYSIS_REPORT.md",
    "SPEC_EXTRACTION_CONTRACT.md",
    "CHARACTERIZATION_TEST_PLAN.md",
    "GOLDEN_MASTER_APPROVAL_TEST_PLAN.md",
    "HISTORICAL_BEHAVIOR_DECISION_RECORD.md",
    "REGRESSION_PREVENTION_PLAN.md",
    "VERIFICATION_MATRIX.md",
    "SESSION_HANDOFF.md",
]


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "behavior-archaeology"


def main() -> int:
    parser = argparse.ArgumentParser(description="Create idkWidk behavior archaeology documents.")
    parser.add_argument("--name", required=True, help="Name of the regression or behavior recovery task")
    parser.add_argument("--output-root", default="docs/idkwidk", help="Root docs directory")
    parser.add_argument("--known-good", default="", help="Known-good commit/tag/date/build, if known")
    parser.add_argument("--known-bad", default="current", help="Known-bad/current reference")
    args = parser.parse_args()

    plugin_root = Path(__file__).resolve().parents[1]
    template_dir = plugin_root / "assets" / "templates"
    slug = slugify(args.name)
    out_dir = Path(args.output_root) / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    for name in TEMPLATES:
        src = template_dir / name
        if src.exists():
            dst = out_dir / name
            if not dst.exists():
                copyfile(src, dst)

    index = out_dir / "README.md"
    if not index.exists():
        index.write_text(
            f"# {args.name}\n\n"
            f"Behavior archaeology artifact pack.\n\n"
            f"Known-good reference: {args.known_good or 'Unknown'}\n\n"
            f"Known-bad/current reference: {args.known_bad}\n\n"
            "Start with BEHAVIOR_ARCHAEOLOGY_BRIEF.md and EVIDENCE_BEHAVIOR_TABLE.md.\n"
        )

    print(f"Created behavior archaeology artifacts in {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
