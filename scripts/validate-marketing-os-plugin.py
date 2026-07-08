#!/usr/bin/env python3
"""Validate the PMM OS plugin package.

Runs lightweight checks only. No network access required.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd))
    subprocess.run(cmd, cwd=ROOT, check=True)


def check_json(path: str) -> None:
    with (ROOT / path).open(encoding="utf-8") as f:
        json.load(f)
    print(f"ok json: {path}")


def check_skills() -> None:
    bad: list[str] = []
    for skill in sorted((ROOT / "skills").glob("*/SKILL.md")):
        text = skill.read_text(encoding="utf-8")
        match = re.match(r"^---\n([\s\S]*?)\n---", text)
        if not match:
            bad.append(f"{skill}: missing YAML frontmatter")
            continue
        name = re.search(r"^name:\s*([a-z0-9-]+)\s*$", match.group(1), flags=re.M)
        desc = re.search(r"^description:\s*(.+)$", match.group(1), flags=re.M)
        if not name:
            bad.append(f"{skill}: missing valid name")
        elif name.group(1) != skill.parent.name:
            bad.append(f"{skill}: name does not match directory")
        if not desc:
            bad.append(f"{skill}: missing description")
        elif len(desc.group(1)) > 1024:
            bad.append(f"{skill}: description exceeds 1024 chars")
    if bad:
        raise SystemExit("\n".join(bad))
    print("ok skills")


def main() -> None:
    check_json(".codex-plugin/plugin.json")
    check_json(".agents/plugins/marketplace.json")
    check_json(".mcp.json")
    check_json("hooks/hooks.json")
    check_skills()
    run([sys.executable, "-m", "py_compile", *map(str, sorted((ROOT / "hooks").glob("*.py"))), "skills/pmm-artifact-factory/scripts/render_artifact_bundle.py"])
    run(["node", "--check", "mcp/marketing-os-server.js"])
    print("PMM OS plugin validation passed.")


if __name__ == "__main__":
    main()
