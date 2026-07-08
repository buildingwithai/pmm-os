#!/usr/bin/env python3
"""Inventory images, GIFs, videos, and likely visual reference assets in a repo."""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".mp4", ".mov", ".webm", ".avi", ".mkv"}
SKIP_DIRS = {".git", "node_modules", "dist", "build", ".next", ".nuxt", "coverage", ".turbo", ".cache", ".idkwidk"}
LIKELY_REFERENCE_DIRS = {
    "docs",
    "doc",
    "screenshots",
    "screenshot",
    "examples",
    "example",
    "demo",
    "demos",
    "storybook",
    "stories",
    "public",
    "static",
    "assets",
    "media",
    "images",
    "img",
    "fixtures",
    "test",
    "tests",
    "__screenshots__",
    "__snapshots__",
}


def main() -> int:
    parser = argparse.ArgumentParser(description="Inventory visual assets in a repository.")
    parser.add_argument("path", nargs="?", default=".", help="Repo path to scan.")
    parser.add_argument("--out", default=".idkwidk/runtime-captures/visual-asset-inventory.json", help="JSON output path.")
    parser.add_argument("--markdown-out", default=".idkwidk/runtime-captures/SOURCE_REPO_VISUAL_ASSET_INVENTORY.md", help="Markdown output path.")
    args = parser.parse_args()

    root = Path(args.path).resolve()
    results: list[dict[str, object]] = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        current = Path(dirpath)
        for filename in filenames:
            path = current / filename
            if path.suffix.lower() not in EXTS:
                continue
            rel = path.relative_to(root)
            parts_lower = {part.lower() for part in rel.parts[:-1]}
            likely_ref = bool(parts_lower & LIKELY_REFERENCE_DIRS)
            try:
                size = path.stat().st_size
            except OSError:
                size = None
            results.append({
                "path": str(rel),
                "extension": path.suffix.lower(),
                "bytes": size,
                "likely_reference": likely_ref,
            })

    results.sort(key=lambda item: (not bool(item["likely_reference"]), str(item["path"])))
    out_path = Path(args.out)
    md_path = Path(args.markdown_out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps({"root": str(root), "assets": results}, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Source Repo Visual Asset Inventory",
        "",
        f"Root: `{root}`",
        "",
        "| Path | Type | Size | Likely reference |",
        "|---|---:|---:|---|",
    ]
    for item in results:
        size = item["bytes"] or ""
        likely = "yes" if item["likely_reference"] else "no"
        lines.append(f"| `{item['path']}` | {item['extension']} | {size} | {likely} |")
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Found {len(results)} visual assets")
    print(f"JSON: {out_path}")
    print(f"Markdown: {md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
