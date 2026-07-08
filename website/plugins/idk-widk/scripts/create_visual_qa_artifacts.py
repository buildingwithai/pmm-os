#!/usr/bin/env python3
"""Create idkWidk visual runtime QA artifact pack."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

TEMPLATES = [
    "MISSION_CONTROL.md",
    "BROWSER_TOOLCHAIN_REQUIREMENTS.md",
    "VISUAL_QA_PLAN.md",
    "SOURCE_REPO_VISUAL_ASSET_INVENTORY.md",
    "RUNTIME_SETUP_HEALTHCHECK.md",
    "VISUAL_BASELINE_CAPTURE.md",
    "VISUAL_BEHAVIOR_PARITY_MATRIX.md",
    "SCREENSHOT_DIFF_REPORT.md",
    "VISUAL_PARITY_ACCEPTANCE_REPORT.md",
    "PARITY_ACCEPTANCE_CRITERIA.md",
    "RUNTIME_TRACE_SUMMARY.md",
    "VERIFICATION_MATRIX.md",
    "SESSION_HANDOFF.md",
]


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "visual-qa-work"


def ensure_gitignore(path: Path, entries: list[str]) -> None:
    existing = path.read_text(encoding="utf-8").splitlines() if path.exists() else []
    changed = False
    for entry in entries:
        if entry not in existing:
            existing.append(entry)
            changed = True
    if changed:
        path.write_text("\n".join(existing).rstrip() + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Create visual runtime QA artifact pack.")
    parser.add_argument("--name", required=True, help="Work name, for example 'Calendar board visual parity'.")
    parser.add_argument("--repo", help="Source repo URL, if any.")
    parser.add_argument("--flow", help="Flow/screen to verify.")
    parser.add_argument("--out", default="docs/idkwidk", help="Base output directory.")
    args = parser.parse_args()

    plugin_root = Path(__file__).resolve().parents[1]
    template_dir = plugin_root / "assets" / "templates"
    out_dir = Path.cwd() / args.out / slugify(args.name)
    out_dir.mkdir(parents=True, exist_ok=True)

    for name in TEMPLATES:
        src = template_dir / name
        if not src.exists():
            continue
        dest = out_dir / name
        if not dest.exists():
            header = (
                f"<!-- Created by idkWidk Visual Runtime QA. Work: {args.name}. "
                f"Repo: {args.repo or 'none'}. Flow: {args.flow or 'unknown'}. -->\n\n"
            )
            dest.write_text(header + src.read_text(encoding="utf-8"), encoding="utf-8")

    capture_dir = Path.cwd() / ".idkwidk" / "runtime-captures" / slugify(args.name)
    for subdir in [
        "source/assets",
        "source/flows",
        "candidate/before",
        "candidate/after",
        "diffs",
        "traces",
        "reports",
    ]:
        (capture_dir / subdir).mkdir(parents=True, exist_ok=True)

    ensure_gitignore(Path.cwd() / ".gitignore", [".idkwidk/runtime-captures/", ".idkwidk/tmp/"])

    print(f"Created visual QA artifact pack: {out_dir}")
    print(f"Created ignored capture workspace: {capture_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
