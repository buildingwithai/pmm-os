#!/usr/bin/env python3
"""Inventory visual assets in a repository for idkWidk visual QA."""
from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

VISUAL_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.mp4', '.webm', '.mov'}
SKIP_DIRS = {'.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.turbo', '.cache', 'vendor'}
MD_IMAGE_RE = re.compile(r'!\[[^\]]*\]\(([^)]+)\)')
URL_RE = re.compile(r'https?://[^\s)]+')


def should_skip(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)


def main() -> int:
    parser = argparse.ArgumentParser(description='Collect visual references from a source repo.')
    parser.add_argument('repo_path', nargs='?', default='.', help='Repository path to scan.')
    parser.add_argument('--out', default='.idkwidk/visual-captures/visual-reference-inventory.json', help='Output JSON path.')
    parser.add_argument('--markdown', default=None, help='Optional markdown output path.')
    args = parser.parse_args()

    root = Path(args.repo_path).resolve()
    assets = []
    md_links = []

    for p in root.rglob('*'):
        rel = p.relative_to(root)
        if should_skip(rel):
            continue
        if p.is_file() and p.suffix.lower() in VISUAL_EXTS:
            assets.append({'path': str(rel), 'type': p.suffix.lower().lstrip('.')})
        if p.is_file() and p.suffix.lower() in {'.md', '.mdx'}:
            try:
                text = p.read_text(encoding='utf-8', errors='ignore')
            except Exception:
                continue
            for m in MD_IMAGE_RE.findall(text):
                md_links.append({'page': str(rel), 'image': m})
            for url in URL_RE.findall(text):
                if any(url.lower().split('?')[0].endswith(ext) for ext in VISUAL_EXTS):
                    md_links.append({'page': str(rel), 'image': url})

    data = {
        'scanned_at': datetime.now(timezone.utc).isoformat(),
        'repo_path': str(root),
        'assets': assets,
        'markdown_image_links': md_links,
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')

    if args.markdown:
        md = [
            '# Visual Reference Inventory',
            '',
            f'Repo: `{root}`',
            '',
            '## Assets',
            '',
            '| Path | Type |',
            '|---|---|',
        ]
        md += [f"| `{a['path']}` | {a['type']} |" for a in assets] or ['| None found | |']
        md += ['', '## Markdown image links', '', '| Page | Image |', '|---|---|']
        md += [f"| `{l['page']}` | `{l['image']}` |" for l in md_links] or ['| None found | |']
        mpath = Path(args.markdown)
        mpath.parent.mkdir(parents=True, exist_ok=True)
        mpath.write_text('\n'.join(md) + '\n', encoding='utf-8')

    print(f'Found {len(assets)} local visual assets and {len(md_links)} markdown image links.')
    print(f'Wrote {out}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
