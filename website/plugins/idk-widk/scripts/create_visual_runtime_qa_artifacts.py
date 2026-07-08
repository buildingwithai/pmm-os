#!/usr/bin/env python3
"""Create idkWidk visual runtime QA artifacts for a task."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

TEMPLATES = [
    'MISSION_CONTROL.md',
    'TOOLING_READINESS_CHECKLIST.md',
    'BROWSER_TOOLCHAIN_REQUIREMENTS.md',
    'VISUAL_RUNTIME_QA_PLAN.md',
    'VISUAL_QA_PLAN.md',
    'SCREENSHOT_BASELINE_PLAN.md',
    'SCREENSHOT_CAPTURE_LEDGER.md',
    'SOURCE_REPO_VISUAL_ASSET_INVENTORY.md',
    'SOURCE_VISUAL_ASSET_INVENTORY.md',
    'MEDIA_ASSET_INVENTORY.md',
    'RUNTIME_SETUP_HEALTHCHECK.md',
    'RUNTIME_SETUP_VALIDATION.md',
    'RUNTIME_SETUP_VALIDATION_REPORT.md',
    'VISUAL_DIFF_REPORT.md',
    'SOURCE_TARGET_VISUAL_DIFF.md',
    'VISUAL_PARITY_REVIEW.md',
    'VISUAL_BEHAVIOR_PARITY_MATRIX.md',
    'PARITY_ACCEPTANCE_CRITERIA.md',
    'PLAYWRIGHT_VISUAL_REGRESSION_PLAN.md',
    'VERIFICATION_MATRIX.md',
    'SESSION_HANDOFF.md',
]


def slugify(name: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-') or 'visual-qa'


def ensure_gitignore(root: Path) -> None:
    gi = root / '.gitignore'
    existing = gi.read_text(encoding='utf-8').splitlines() if gi.exists() else []
    changed = False
    for item in ['.idkwidk/runtime-captures/', '.idkwidk/visual-captures/', '.idkwidk/visual-baselines/', '.idkwidk/tmp/']:
        if item not in existing:
            existing.append(item)
            changed = True
    if changed:
        gi.write_text('\n'.join(existing).rstrip() + '\n', encoding='utf-8')


def main() -> int:
    parser = argparse.ArgumentParser(description='Create idkWidk visual runtime QA artifact pack.')
    parser.add_argument('--name', required=True, help="Work name, for example 'Adopt Kanban board UI'.")
    parser.add_argument('--reference', help='Reference source: repo URL, old build, screenshot, design, or current live URL.')
    parser.add_argument('--target', help='Target route, app, feature, or local URL.')
    parser.add_argument('--out', default='docs/idkwidk', help='Base output directory.')
    args = parser.parse_args()

    plugin_root = Path(__file__).resolve().parents[1]
    template_dir = plugin_root / 'assets' / 'templates'
    root = Path.cwd()
    slug = slugify(args.name)
    out = root / args.out / slug
    out.mkdir(parents=True, exist_ok=True)

    for filename in TEMPLATES:
        src = template_dir / filename
        if not src.exists():
            continue
        dest = out / filename
        if not dest.exists():
            header = (
                f'<!-- Created by idkWidk Visual Runtime QA. '
                f'Work: {args.name}. Reference: {args.reference or "unknown"}. Target: {args.target or "unknown"}. -->\n\n'
            )
            dest.write_text(header + src.read_text(encoding='utf-8'), encoding='utf-8')

    captures = root / '.idkwidk' / 'runtime-captures' / slug
    for sub in ['source', 'target-before', 'target-after', 'diffs', 'traces', 'reports']:
        (captures / sub).mkdir(parents=True, exist_ok=True)
    ensure_gitignore(root)

    visual_evidence = out / 'visual-evidence'
    visual_evidence.mkdir(parents=True, exist_ok=True)

    print(f'Created visual QA artifacts in {out}')
    print(f'Created durable visual evidence directory in {visual_evidence}')
    print(f'Created ignored capture folders under {captures}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
