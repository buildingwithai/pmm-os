#!/usr/bin/env python3
"""Create open-source research artifacts for idkWidk."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

TEMPLATES = [
    'OSS_RESEARCH_BRIEF.md',
    'REPO_EVALUATION_SCORECARD.md',
    'SOURCE_REPO_AUDIT.md',
    'OSS_INTEGRATION_DECISION_RECORD.md',
    'ADAPTATION_PLAN.md',
]


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r'[^a-z0-9]+', '-', value)
    return value.strip('-') or 'oss-research'


def main() -> int:
    parser = argparse.ArgumentParser(description='Create OSS research artifact pack.')
    parser.add_argument('--name', required=True, help='Work name, e.g. "calendar drag drop inspiration"')
    parser.add_argument('--repo', action='append', default=[], help='Candidate repo URL. Can be repeated.')
    parser.add_argument('--out-root', default='docs/idkwidk', help='Output root directory.')
    args = parser.parse_args()

    plugin_root = Path(__file__).resolve().parents[1]
    template_root = plugin_root / 'assets' / 'templates'
    out_dir = Path(args.out_root) / slugify(args.name) / 'oss'
    out_dir.mkdir(parents=True, exist_ok=True)

    for name in TEMPLATES:
        src = template_root / name
        dest = out_dir / name
        if not src.exists():
            continue
        if not dest.exists():
            content = src.read_text(encoding='utf-8')
            if name == 'OSS_RESEARCH_BRIEF.md' and args.repo:
                repo_lines = '\n'.join(f'- {repo}' for repo in args.repo)
                content += f'\n\n## Provided Candidate Repos\n\n{repo_lines}\n'
            dest.write_text(content, encoding='utf-8')

    print(f'Created OSS research artifacts in: {out_dir}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
