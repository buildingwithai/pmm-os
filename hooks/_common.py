#!/usr/bin/env python3
"""Shared helpers for PMM OS hooks."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

CONTEXT_FILES = (
    ".agents/product-marketing.md",
    ".agents/product-marketing-context.md",
    ".agents/marketing-os/messaging.md",
    ".agents/marketing-os/launch-plan.md",
    ".claude/product-marketing.md",
    ".claude/product-marketing-context.md",
)


def read_event() -> dict[str, Any]:
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            return {}
        data = json.loads(raw)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def emit_additional(event_name: str, text: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": event_name,
            "additionalContext": text,
        }
    }))


def find_project_root() -> Path:
    cwd = Path.cwd().resolve()
    for candidate in (cwd, *cwd.parents):
        if (candidate / ".git").exists():
            return candidate
    return cwd


def read_context_excerpt(limit: int = 6000) -> str:
    root = find_project_root()
    chunks: list[str] = []
    for rel in CONTEXT_FILES:
        path = root / rel
        if path.is_file():
            try:
                content = path.read_text(encoding="utf-8", errors="replace").strip()
            except OSError:
                continue
            if content:
                chunks.append(f"## {rel}\n{content[:limit]}")
        if sum(len(c) for c in chunks) >= limit:
            break
    return "\n\n".join(chunks)[:limit]


def collect_text(value: Any, limit: int = 12000) -> str:
    pieces: list[str] = []

    def walk(item: Any) -> None:
        if len("\n".join(pieces)) > limit:
            return
        if isinstance(item, str):
            pieces.append(item)
        elif isinstance(item, dict):
            for subvalue in item.values():
                walk(subvalue)
        elif isinstance(item, list):
            for subvalue in item:
                walk(subvalue)

    walk(value)
    return "\n".join(pieces)[:limit]
