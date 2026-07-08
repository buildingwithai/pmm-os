#!/usr/bin/env python3
"""Scan an external repo for screenshots, GIFs, videos, SVGs, and README media links."""
from __future__ import annotations
import argparse, json, re
from pathlib import Path

MEDIA_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp4', '.webm', '.mov', '.avif'}
README_NAMES = {'readme.md', 'readme.mdx', 'readme.txt'}
IMG_MD_RE = re.compile(r'!\[[^\]]*\]\(([^)]+)\)')
HTML_MEDIA_RE = re.compile(r'<(?:img|video|source)[^>]+(?:src|poster)=["\']([^"\']+)["\']', re.I)

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('repo_path')
    parser.add_argument('--out', default='UPSTREAM_MEDIA_EVIDENCE.generated.json')
    args = parser.parse_args()
    root = Path(args.repo_path).resolve()
    if not root.exists():
        raise SystemExit(f'Repo path does not exist: {root}')
    files = []
    readme_links = []
    for p in root.rglob('*'):
        if '.git' in p.parts:
            continue
        if p.is_file() and p.suffix.lower() in MEDIA_EXTS:
            files.append({
                'path': str(p.relative_to(root)),
                'extension': p.suffix.lower(),
                'size_bytes': p.stat().st_size,
            })
        if p.is_file() and p.name.lower() in README_NAMES:
            text = p.read_text(errors='ignore')
            for match in IMG_MD_RE.findall(text) + HTML_MEDIA_RE.findall(text):
                readme_links.append({'readme': str(p.relative_to(root)), 'link': match})
    result = {'repo_path': str(root), 'media_files': files, 'readme_media_links': readme_links}
    Path(args.out).write_text(json.dumps(result, indent=2))
    print(json.dumps({'media_files': len(files), 'readme_media_links': len(readme_links), 'out': args.out}, indent=2))

if __name__ == '__main__':
    main()
