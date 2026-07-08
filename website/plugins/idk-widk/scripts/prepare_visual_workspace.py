#!/usr/bin/env python3
"""Prepare ignored idkWidk visual QA capture directories."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

DIRECTORIES = [
    '.idkwidk/visual-captures/',
    '.idkwidk/visual-captures/source/',
    '.idkwidk/visual-captures/target-before/',
    '.idkwidk/visual-captures/target-after/',
    '.idkwidk/visual-captures/diffs/',
    '.idkwidk/visual-captures/traces/',
    '.idkwidk/visual-baselines/',
]


def ensure_gitignore(root: Path) -> None:
    gi = root / '.gitignore'
    lines = gi.read_text(encoding='utf-8').splitlines() if gi.exists() else []
    changed = False
    for item in ['.idkwidk/visual-captures/', '.idkwidk/visual-baselines/']:
        if item not in lines:
            lines.append(item)
            changed = True
    if changed:
        gi.write_text('\n'.join(lines).rstrip() + '\n', encoding='utf-8')


def main() -> int:
    root = Path.cwd()
    for d in DIRECTORIES:
        (root / d).mkdir(parents=True, exist_ok=True)
    ensure_gitignore(root)
    manifest = root / '.idkwidk/visual-captures/visual-capture-manifest.json'
    if not manifest.exists():
        manifest.write_text(json.dumps({
            'created_at': datetime.now(timezone.utc).isoformat(),
            'purpose': 'Ignored visual QA captures for idkWidk runtime inspection. Promote only approved baselines into committed test snapshots.',
            'directories': DIRECTORIES,
        }, indent=2) + '\n', encoding='utf-8')
    print('Prepared ignored idkWidk visual QA workspace: .idkwidk/visual-captures/')
    print('Prepared ignored idkWidk visual baselines workspace: .idkwidk/visual-baselines/')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
