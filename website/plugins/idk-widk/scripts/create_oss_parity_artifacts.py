#!/usr/bin/env python3
"""Create idkWidk artifact pack for OSS feature parity or clean-room work."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

TEMPLATES = [
    'MISSION_CONTROL.md',
    'EXTERNAL_REPO_RUNTIME_LAB.md',
    'TOOLCHAIN_READINESS_CHECK.md',
    'SOURCE_REPO_VISUAL_ASSET_INVENTORY.md',
    'UI_SETUP_VALIDATION_CHECKLIST.md',
    'SCREENSHOT_CAPTURE_MANIFEST.md',
    'VISUAL_RUNTIME_QA_REPORT.md',
    'BEFORE_AFTER_VISUAL_DIFF_REPORT.md',
    'LICENSE_REUSE_DECISION_RECORD.md',
    'FEATURE_PARITY_SPEC.md',
    'VISUAL_BEHAVIOR_PARITY_MATRIX.md',
    'VISUAL_DIFF_REPORT.md',
    'VISUAL_PARITY_ACCEPTANCE_CRITERIA.md',
    'SCREENSHOT_BASELINE_REGISTER.md',
    'VISUAL_QA_PLAN.md',
    'RUNTIME_SETUP_SANITY_CHECK.md',
    'VISUAL_REFERENCE_INVENTORY.md',
    'FEATURE_EXTRACTION_MAP.md',
    'PERMISSIVE_OSS_ADOPTION_PLAN.md',
    'CLEAN_ROOM_BEHAVIOR_SPEC.md',
    'CLEAN_ROOM_IMPLEMENTATION_PLAN.md',
    'CONTAMINATION_LOG.md',
    'PARITY_ACCEPTANCE_CRITERIA.md',
    'THIRD_PARTY_NOTICES.md',
    'VENDORED_SOURCE_REGISTER.md',
    'UPSTREAM_PROVENANCE_MANIFEST.md',
    'RUNTIME_TRACE_SUMMARY.md',
    'VERIFICATION_MATRIX.md',
    'SESSION_HANDOFF.md',
]


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r'[^a-z0-9]+', '-', value)
    return value.strip('-') or 'oss-parity-work'


def main() -> int:
    parser = argparse.ArgumentParser(description='Create OSS parity or clean-room artifact pack.')
    parser.add_argument('--name', required=True, help='Work name, for example "Extract calendar drag feature".')
    parser.add_argument('--repo', help='Source repo URL.')
    parser.add_argument('--license', help='Known or suspected license.')
    parser.add_argument('--mode', choices=['permissive', 'clean-room', 'unknown'], default='unknown')
    parser.add_argument('--out', default='docs/idkwidk', help='Base output directory.')
    args = parser.parse_args()

    plugin_root = Path(__file__).resolve().parents[1]
    template_dir = plugin_root / 'assets' / 'templates'
    out_dir = Path.cwd() / args.out / slugify(args.name)
    out_dir.mkdir(parents=True, exist_ok=True)

    for name in TEMPLATES:
        src = template_dir / name
        if not src.exists():
            continue
        dest = out_dir / name
        if not dest.exists():
            text = src.read_text(encoding='utf-8')
            header = f'<!-- Created by idkWidk OSS parity workflow. Work: {args.name}. Mode: {args.mode}. Repo: {args.repo or "unknown"}. License: {args.license or "unknown"}. -->\n\n'
            dest.write_text(header + text, encoding='utf-8')

    print(f'Created OSS parity artifact pack: {out_dir}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
