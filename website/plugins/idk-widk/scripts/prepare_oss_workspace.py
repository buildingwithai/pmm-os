#!/usr/bin/env python3
"""Prepare an ignored workspace for open-source research clones.

This script creates `.external-repos/`, ensures it is ignored by Git, and optionally
clones a GitHub or Git repository into a provenance-friendly directory name.

Examples:
  python scripts/prepare_oss_workspace.py
  python scripts/prepare_oss_workspace.py --repo https://github.com/owner/repo.git
  python scripts/prepare_oss_workspace.py --repo https://github.com/owner/repo.git --ref main
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse


def run(cmd: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, cwd=cwd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)


def repo_slug(repo_url: str) -> str:
    cleaned = repo_url.rstrip('/')
    if cleaned.endswith('.git'):
        cleaned = cleaned[:-4]
    parsed = urlparse(cleaned)
    if parsed.scheme and parsed.netloc:
        parts = parsed.path.strip('/').split('/')
    else:
        # Supports git@github.com:owner/repo.git
        match = re.match(r'.*[:/]([^/]+)/([^/]+)$', cleaned)
        if not match:
            return re.sub(r'[^a-zA-Z0-9_.-]+', '-', cleaned).strip('-') or 'repo'
        parts = [match.group(1), match.group(2)]
    if len(parts) >= 2:
        return f"{parts[-2]}__{parts[-1]}"
    return re.sub(r'[^a-zA-Z0-9_.-]+', '-', cleaned).strip('-') or 'repo'


def ensure_gitignore(root: Path, ignored_path: str) -> None:
    gitignore = root / '.gitignore'
    existing = gitignore.read_text().splitlines() if gitignore.exists() else []
    if ignored_path not in existing:
        with gitignore.open('a', encoding='utf-8') as f:
            if existing and existing[-1].strip():
                f.write('\n')
            f.write(f'{ignored_path}\n')


def main() -> int:
    parser = argparse.ArgumentParser(description='Prepare ignored OSS research clone workspace.')
    parser.add_argument('--repo', help='Repository URL to clone.')
    parser.add_argument('--ref', help='Branch, tag, or commit to check out after cloning.')
    parser.add_argument('--workspace', default='.external-repos', help='Ignored workspace directory. Default: .external-repos')
    parser.add_argument('--force', action='store_true', help='Allow cloning into an existing empty directory.')
    args = parser.parse_args()

    root = Path.cwd()
    workspace = root / args.workspace
    workspace.mkdir(parents=True, exist_ok=True)
    ensure_gitignore(root, f'{args.workspace.rstrip("/")}/')

    manifest_path = workspace / 'oss-research-manifest.json'
    manifest = {'repos': []}
    if manifest_path.exists():
        try:
            manifest = json.loads(manifest_path.read_text())
        except json.JSONDecodeError:
            manifest = {'repos': []}

    if not args.repo:
        print(f'Prepared ignored OSS research workspace: {workspace}')
        print('No repo provided. Use --repo to clone a source repo.')
        return 0

    slug = repo_slug(args.repo)
    dest = workspace / slug
    if dest.exists() and any(dest.iterdir()) and not args.force:
        print(f'Error: destination already exists and is not empty: {dest}', file=sys.stderr)
        return 2

    if not dest.exists():
        clone_cmd = ['git', 'clone', args.repo, str(dest)]
        result = run(clone_cmd)
        if result.returncode != 0:
            print(result.stderr, file=sys.stderr)
            return result.returncode

    checked_out = None
    if args.ref:
        result = run(['git', 'checkout', args.ref], cwd=dest)
        if result.returncode != 0:
            print(result.stderr, file=sys.stderr)
            return result.returncode
        checked_out = args.ref

    sha_result = run(['git', 'rev-parse', 'HEAD'], cwd=dest)
    sha = sha_result.stdout.strip() if sha_result.returncode == 0 else None

    entry = {
        'repo': args.repo,
        'local_path': str(dest.relative_to(root)),
        'requested_ref': args.ref,
        'checked_out': checked_out,
        'commit': sha,
        'cloned_at': datetime.now(timezone.utc).isoformat(),
        'purpose': 'research-only clone unless an OSS Integration Decision Record says otherwise',
    }
    manifest.setdefault('repos', []).append(entry)
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')

    print(f'Cloned research repo into ignored workspace: {dest}')
    print(f'Commit: {sha or "unknown"}')
    print(f'Manifest: {manifest_path}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
