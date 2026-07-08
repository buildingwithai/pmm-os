#!/usr/bin/env python3
"""Create an idkWidk artifact pack.

This script copies selected markdown templates into docs/idkwidk/<slug>/
and fills common placeholders. It has no third-party dependencies.
"""
from __future__ import annotations

import argparse
import datetime as dt
import re
import shutil
from pathlib import Path

RISK_TEMPLATES = {
    "tiny": ["ISSUE_BRIEF.md", "VERIFICATION_MATRIX.md"],
    "low": ["MISSION_CONTROL.md", "ISSUE_BRIEF.md", "IMPLEMENTATION_PLAN.md", "VERIFICATION_MATRIX.md", "SESSION_HANDOFF.md"],
    "medium": ["MISSION_CONTROL.md", "ISSUE_BRIEF.md", "INVESTIGATION_LOG.md", "PROBLEM_STATEMENT.md", "IMPLEMENTATION_PLAN.md", "VERIFICATION_MATRIX.md", "PARKED_ISSUES.md", "SESSION_HANDOFF.md"],
    "high": ["MISSION_CONTROL.md", "ISSUE_BRIEF.md", "INVESTIGATION_LOG.md", "PROBLEM_STATEMENT.md", "REQUIREMENTS_AND_ACCEPTANCE_CRITERIA.md", "TECHNICAL_DESIGN.md", "ADR.md", "IMPLEMENTATION_PLAN.md", "VERIFICATION_MATRIX.md", "RELEASE_PLAN.md", "ROLLBACK_KILL_SWITCH_PLAN.md", "RUNBOOK.md", "PARKED_ISSUES.md", "SESSION_HANDOFF.md"],
    "critical": ["MISSION_CONTROL.md", "ISSUE_BRIEF.md", "INVESTIGATION_LOG.md", "PROBLEM_STATEMENT.md", "TECHNICAL_DESIGN.md", "IMPLEMENTATION_PLAN.md", "VERIFICATION_MATRIX.md", "RELEASE_PLAN.md", "ROLLBACK_KILL_SWITCH_PLAN.md", "RUNBOOK.md", "POSTMORTEM.md", "PRODUCTION_VALIDATION.md", "PARKED_ISSUES.md", "SESSION_HANDOFF.md"],
    "major": ["MISSION_CONTROL.md", "ISSUE_BRIEF.md", "PROBLEM_STATEMENT.md", "TECHNICAL_DESIGN.md", "ADR.md", "REFACTOR_PLAN.md", "MIGRATION_PLAN.md", "IMPLEMENTATION_PLAN.md", "VERIFICATION_MATRIX.md", "RELEASE_PLAN.md", "ROLLBACK_KILL_SWITCH_PLAN.md", "RUNBOOK.md", "PRODUCTION_VALIDATION.md", "PARKED_ISSUES.md", "SESSION_HANDOFF.md"],
}

SECURITY_TEMPLATES = ["THREAT_MODEL.md", "PRIVACY_REVIEW.md"]
FEATURE_TEMPLATES = ["FEATURE_SPEC_PRD.md", "REQUIREMENTS_AND_ACCEPTANCE_CRITERIA.md"]
REFACTOR_TEMPLATES = ["REFACTOR_PLAN.md", "MIGRATION_PLAN.md"]


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "work-item"


def find_template_dir() -> Path:
    here = Path(__file__).resolve()
    candidates = [
        here.parent.parent / "assets" / "templates",
        Path.cwd() / "assets" / "templates",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError("Could not find assets/templates directory")


def render(text: str, values: dict[str, str]) -> str:
    for key, value in values.items():
        text = text.replace("{{" + key + "}}", value)
    return text


def main() -> int:
    parser = argparse.ArgumentParser(description="Create an idkWidk artifact pack")
    parser.add_argument("--name", required=True, help="Work item name")
    parser.add_argument("--type", default="unknown", choices=["bug", "feature", "refactor", "migration", "incident", "security", "privacy", "release", "unknown"], help="Work type")
    parser.add_argument("--risk", default="medium", choices=list(RISK_TEMPLATES.keys()), help="Risk level")
    parser.add_argument("--platform", default="unknown", help="Product surface, such as web-app, chrome-extension, mobile-app, api, backend")
    parser.add_argument("--owner", default="Unknown", help="Owner name")
    parser.add_argument("--objective", default="Unknown", help="Original objective")
    parser.add_argument("--out", default="docs/idkwidk", help="Output base directory")
    parser.add_argument("--include-security", action="store_true", help="Include threat model and privacy review")
    args = parser.parse_args()

    template_dir = find_template_dir()
    slug = slugify(args.name)
    out_dir = Path(args.out) / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    selected = list(RISK_TEMPLATES[args.risk])
    if args.type == "feature":
        selected.extend(FEATURE_TEMPLATES)
    if args.type in {"refactor", "migration"}:
        selected.extend(REFACTOR_TEMPLATES)
    if args.type in {"security", "privacy"} or args.include_security:
        selected.extend(SECURITY_TEMPLATES)

    # Preserve order and remove duplicates.
    selected = list(dict.fromkeys(selected))

    values = {
        "WORK_NAME": args.name,
        "WORK_TYPE": args.type,
        "RISK": args.risk,
        "PLATFORM": args.platform,
        "OWNER": args.owner,
        "DATE": dt.date.today().isoformat(),
        "ORIGINAL_OBJECTIVE": args.objective,
        "USER_GOAL": args.objective,
    }

    created = []
    for template_name in selected:
        src = template_dir / template_name
        if not src.exists():
            continue
        dst = out_dir / template_name
        content = render(src.read_text(encoding="utf-8"), values)
        dst.write_text(content, encoding="utf-8")
        created.append(dst)

    index = out_dir / "README.md"
    index.write_text("\n".join([
        f"# Artifact Pack: {args.name}",
        "",
        f"- Type: {args.type}",
        f"- Risk: {args.risk}",
        f"- Platform: {args.platform}",
        f"- Owner: {args.owner}",
        "",
        "## Created files",
        "",
        *[f"- {p.name}" for p in created],
        "",
    ]), encoding="utf-8")

    print(f"Created {len(created)} artifact files in {out_dir}")
    for path in created:
        print(f"- {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
