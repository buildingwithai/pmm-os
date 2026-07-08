#!/usr/bin/env python3
"""Compatibility wrapper for idkWidk media inventory.

Scans a repo for image/GIF/video evidence and writes a markdown inventory. This
is kept as a stable command name for docs and older prompts.
"""
from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path

MEDIA_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.mp4', '.webm', '.mov', '.m4v'}
SKIP_DIRS = {'.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.turbo', '.cache', '.idkwidk', 'vendor'}
REFERENCE_HINTS = {'docs', 'screenshots', 'screenshot', 'examples', 'demo', 'demos', 'storybook', 'stories', 'fixtures', 'test', 'tests', '__screenshots__', '__snapshots__', 'cypress'}


def classify(rel: Path) -> str:
    parts = {p.lower() for p in rel.parts[:-1]}
    stem = rel.stem.lower()
    if parts & REFERENCE_HINTS or any(h in stem for h in ['screenshot', 'snapshot', 'demo']):
        return 'visual reference evidence'
    if {'public', 'assets', 'static', 'media', 'images', 'img'} & parts:
        return 'implementation asset'
    return 'unknown'


def main() -> int:
    parser = argparse.ArgumentParser(description='Inventory repo media assets for idkWidk visual QA.')
    parser.add_argument('--repo-path', required=True, help='Local repo path to scan.')
    parser.add_argument('--out', default='MEDIA_ASSET_INVENTORY.md', help='Markdown output path.')
    parser.add_argument('--json-out', help='Optional JSON output path.')
    args = parser.parse_args()

    repo = Path(args.repo_path).resolve()
    if not repo.exists():
        raise SystemExit(f'Repo path not found: {repo}')

    items = []
    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        current = Path(root)
        for filename in files:
            p = current / filename
            if p.suffix.lower() not in MEDIA_EXTS:
                continue
            rel = p.relative_to(repo)
            try:
                size = p.stat().st_size
            except OSError:
                size = None
            items.append({
                'path': str(rel),
                'type': p.suffix.lower().lstrip('.'),
                'size_bytes': size,
                'classification': classify(rel),
            })

    items.sort(key=lambda x: (x['classification'], x['path']))
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True) if out.parent != Path('.') else None
    lines = [
        '# Media Asset Inventory',
        '',
        f'Repo path: `{repo}`',
        f'Generated at: {datetime.now(timezone.utc).isoformat()}',
        '',
        '| Asset | Type | Size | Classification | License-sensitive? | Can copy? | Notes |',
        '|---|---|---:|---|---:|---:|---|',
    ]
    for item in items:
        lines.append(f"| `{item['path']}` | {item['type']} | {item['size_bytes'] or ''} | {item['classification']} | unknown | unknown |  |")
    if not items:
        lines.append('| No media assets found |  |  |  |  |  |  |')
    lines += [
        '',
        '## Review rules',
        '',
        '- This inventory is evidence, not permission to copy.',
        '- Mark assets as reusable only after license review.',
        '- Use documentation/demo media to understand expected behavior and appearance.',
        '- Use implementation assets only if the license and integration decision permit reuse.',
    ]
    out.write_text('\n'.join(lines) + '\n', encoding='utf-8')

    if args.json_out:
        jout = Path(args.json_out)
        jout.parent.mkdir(parents=True, exist_ok=True) if jout.parent != Path('.') else None
        jout.write_text(json.dumps({'repo_path': str(repo), 'generated_at': datetime.now(timezone.utc).isoformat(), 'items': items}, indent=2) + '\n', encoding='utf-8')

    print(f'Found {len(items)} media assets. Wrote {out}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
