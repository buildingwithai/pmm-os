#!/usr/bin/env python3
"""Validate that a Mission Control file has required sections."""
from __future__ import annotations

import argparse
from pathlib import Path

REQUIRED = [
    "Original Objective",
    "Current User-Level Goal",
    "Current Engineering Phase",
    "Current Hypothesis",
    "Evidence Collected",
    "Active Workstream",
    "Blocking Issues",
    "Side Quests / Parked Issues",
    "Decision Log",
    "Files Touched or Likely Involved",
    "Tests and Verification",
    "Next Best Action",
    "Resume Prompt",
]


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate MISSION_CONTROL.md")
    parser.add_argument("path")
    args = parser.parse_args()

    path = Path(args.path)
    if not path.exists():
        print(f"Missing file: {path}")
        return 2

    text = path.read_text(encoding="utf-8")
    missing = [section for section in REQUIRED if section not in text]
    if missing:
        print("Mission Control is missing sections:")
        for section in missing:
            print(f"- {section}")
        return 1

    print("Mission Control contains all required sections.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
