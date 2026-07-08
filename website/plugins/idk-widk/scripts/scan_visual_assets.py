#!/usr/bin/env python3
"""Scan a repository for visual references used by idkWidk visual runtime QA."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.bmp'}
VIDEO_EXTS = {'.mp4', '.mov', '.webm', '.m4v'}
TEXT_EXTS = {'.md', '.mdx', '.html', '.htm', '.css', '.scss', '.sass', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.json'}
SKIP_DIRS = {'.git', 'node_modules', 'dist', 'build', '.next', '.turbo', '.cache', 'coverage'}


def should_skip(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)


def main() -> int:
    parser = argparse.ArgumentParser(description='Scan a repo for screenshots, GIFs, videos, Storybook/demo hints, and visual snapshots.')
    parser.add_argument('path', nargs='?', default='.', help='Repo path to scan.')
    parser.add_argument('--out', help='Optional JSON output path.')
    args = parser.parse_args()

    root = Path(args.path).resolve()
    assets = []
    references = []
    hints = []

    for p in root.rglob('*'):
        if should_skip(p.relative_to(root) if p.is_relative_to(root) else p):
            continue
        if not p.is_file():
            continue
        rel = str(p.relative_to(root))
        ext = p.suffix.lower()
        if ext in IMAGE_EXTS or ext in VIDEO_EXTS:
            assets.append({'path': rel, 'type': 'video' if ext in VIDEO_EXTS else 'image', 'ext': ext})
        if ext in TEXT_EXTS:
            try:
                text = p.read_text(encoding='utf-8', errors='ignore')[:200000]
            except Exception:
                continue
            for m in re.finditer(r'!\[[^\]]*\]\(([^)]+)\)|(?:src|href)=["\']([^"\']+)["\']', text):
                target = m.group(1) or m.group(2)
                if target and any(target.lower().split('?')[0].endswith(e) for e in IMAGE_EXTS | VIDEO_EXTS):
                    references.append({'file': rel, 'target': target})
            low = text.lower()
            for word in ['screenshot', 'screenshots', 'storybook', 'demo', 'playground', 'visual regression', 'tohavescreenshot', 'cypress', '__image_snapshots__']:
                if word in low:
                    hints.append({'file': rel, 'hint': word})
                    break

    result = {'root': str(root), 'asset_count': len(assets), 'reference_count': len(references), 'hint_count': len(hints), 'assets': assets[:1000], 'references': references[:1000], 'hints': hints[:500]}
    if args.out:
        out = Path(args.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(result, indent=2))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
