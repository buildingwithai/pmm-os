#!/usr/bin/env python3
"""Prepare an ignored external repo runtime lab.

Creates `.idkwidk/external-repos/`, `.idkwidk/runtime-captures/`, and
`.idkwidk/tmp/`, and `.idkwidk/visual-baselines/`, ensures those paths are ignored by Git, optionally clones a
repository, checks out a ref, records provenance, and prints next safety steps.

Examples:
  python scripts/prepare_external_repo_lab.py
  python scripts/prepare_external_repo_lab.py --repo https://github.com/owner/repo.git
  python scripts/prepare_external_repo_lab.py --repo https://github.com/owner/repo.git --ref v1.2.3
  python scripts/prepare_external_repo_lab.py --repo https://github.com/owner/repo.git --full-history
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

DEFAULT_WORKSPACE = '.idkwidk/external-repos'
DEFAULT_CAPTURES = '.idkwidk/runtime-captures'
DEFAULT_TMP = '.idkwidk/tmp'
DEFAULT_VISUAL_CAPTURES = '.idkwidk/visual-baselines'
MANIFEST = '.idkwidk/upstream-provenance-manifest.json'


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
        match = re.match(r'.*[:/]([^/]+)/([^/]+)$', cleaned)
        if not match:
            return re.sub(r'[^a-zA-Z0-9_.-]+', '-', cleaned).strip('-') or 'repo'
        parts = [match.group(1), match.group(2)]
    if len(parts) >= 2:
        return f"{parts[-2]}__{parts[-1]}"
    return re.sub(r'[^a-zA-Z0-9_.-]+', '-', cleaned).strip('-') or 'repo'


def ensure_gitignore(root: Path, ignored: list[str]) -> None:
    gitignore = root / '.gitignore'
    existing = gitignore.read_text(encoding='utf-8').splitlines() if gitignore.exists() else []
    changed = False
    for item in ignored:
        normalized = item.rstrip('/') + '/'
        if normalized not in existing:
            existing.append(normalized)
            changed = True
    if changed:
        gitignore.write_text('\n'.join(existing).rstrip() + '\n', encoding='utf-8')


def read_manifest(path: Path) -> dict:
    if not path.exists():
        return {'repos': []}
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except json.JSONDecodeError:
        return {'repos': []}


def main() -> int:
    parser = argparse.ArgumentParser(description='Prepare ignored idkWidk external repo runtime lab.')
    parser.add_argument('--repo', help='Git repository URL to clone.')
    parser.add_argument('--ref', help='Branch, tag, or commit to check out.')
    parser.add_argument('--workspace', default=DEFAULT_WORKSPACE, help=f'Ignored workspace directory. Default: {DEFAULT_WORKSPACE}')
    parser.add_argument('--captures', default=DEFAULT_CAPTURES, help=f'Ignored runtime capture directory. Default: {DEFAULT_CAPTURES}')
    parser.add_argument('--full-history', action='store_true', help='Clone full history instead of shallow clone.')
    parser.add_argument('--force', action='store_true', help='Allow using an existing non-empty clone path.')
    args = parser.parse_args()

    root = Path.cwd()
    workspace = root / args.workspace
    captures = root / args.captures
    tmp = root / DEFAULT_TMP
    visual_captures = root / DEFAULT_VISUAL_CAPTURES
    for p in [workspace, captures, tmp, visual_captures]:
        p.mkdir(parents=True, exist_ok=True)

    ensure_gitignore(root, [args.workspace, args.captures, DEFAULT_TMP, DEFAULT_VISUAL_CAPTURES])

    manifest_path = root / MANIFEST
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest = read_manifest(manifest_path)

    if not args.repo:
        print(f'Prepared ignored external repo workspace: {workspace}')
        print(f'Prepared ignored runtime captures directory: {captures}')
        print('No repo provided. Use --repo to clone an external repository.')
        return 0

    slug = repo_slug(args.repo)
    dest = workspace / slug
    if dest.exists() and any(dest.iterdir()) and not args.force:
        print(f'Error: destination already exists and is not empty: {dest}', file=sys.stderr)
        return 2

    if not dest.exists() or not any(dest.iterdir()):
        clone_cmd = ['git', 'clone']
        if not args.full_history:
            clone_cmd += ['--depth', '1']
        clone_cmd += [args.repo, str(dest)]
        result = run(clone_cmd)
        if result.returncode != 0:
            print(result.stderr, file=sys.stderr)
            return result.returncode

    if args.ref:
        result = run(['git', 'fetch', '--tags', '--depth', '1', 'origin', args.ref], cwd=dest)
        # Fetch may fail for commit hashes or already present refs. Checkout is the real test.
        result = run(['git', 'checkout', args.ref], cwd=dest)
        if result.returncode != 0:
            print(result.stderr, file=sys.stderr)
            return result.returncode

    sha_result = run(['git', 'rev-parse', 'HEAD'], cwd=dest)
    sha = sha_result.stdout.strip() if sha_result.returncode == 0 else None
    branch_result = run(['git', 'branch', '--show-current'], cwd=dest)
    branch = branch_result.stdout.strip() if branch_result.returncode == 0 else None

    entry = {
        'repo': args.repo,
        'local_path': str(dest.relative_to(root)),
        'requested_ref': args.ref,
        'branch': branch,
        'commit': sha,
        'cloned_at': datetime.now(timezone.utc).isoformat(),
        'purpose': 'ignored runtime lab and source audit only until a license-aware decision says otherwise',
        'next_steps': [
            'Inspect LICENSE, NOTICE, manifests, lockfiles, scripts, and env requirements.',
            'Do not run install scripts with secrets or production credentials.',
            'Create EXTERNAL_REPO_RUNTIME_LAB.md and RUNTIME_SETUP_HEALTHCHECK.md before copying or integrating code.',
            'Use Chrome DevTools MCP connected to the Chrome for Testing on http://127.0.0.1:9222 to capture source runtime screenshots before claiming visual parity.'
        ]
    }
    manifest.setdefault('repos', []).append(entry)
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')

    print(f'Cloned external repo into ignored workspace: {dest}')
    print(f'Commit: {sha or "unknown"}')
    print(f'Runtime captures directory: {captures}')
    print(f'Visual baselines directory: {visual_captures}')
    print(f'Provenance manifest: {manifest_path}')
    print('Next: inspect license, manifests, install scripts, and environment requirements before running the app.')
    print('Then: verify the correct app/package is running, capture screenshots, DOM, CSS, console, and network evidence with Chrome DevTools MCP connected to the Chrome for Testing before extracting features.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
