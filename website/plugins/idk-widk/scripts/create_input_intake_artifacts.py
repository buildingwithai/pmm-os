#!/usr/bin/env python3
"""Create idkWidk intake artifacts for messy user input."""
from pathlib import Path
import argparse, re

def slugify(text: str) -> str:
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip().lower()).strip("-")
    return text or "idkwidk-intake"

def main():
    parser = argparse.ArgumentParser(description="Create idkWidk input intake artifacts")
    parser.add_argument("--name", required=True)
    parser.add_argument("--out", default="docs/idkwidk")
    args = parser.parse_args()
    base = Path(args.out) / slugify(args.name)
    base.mkdir(parents=True, exist_ok=True)
    files = {
        "USER_SIGNAL_BRIEF.md": "# User Signal Brief\n\n## Original Raw Request\n\n## User-Level Goal\n\n## Evidence From Text\n\n## Evidence From Images or Files\n\n## Guesses and Hypotheses\n\n## Fears and Constraints\n\n## Rewritten Engineering Prompt\n\n## Next Safest Action\n",
        "ENGINEERED_PROMPT.md": "# Engineered Prompt\n\n## Goal\n\n## Context\n\n## Evidence\n\n## Constraints\n\n## Risks\n\n## Done When\n\n## Verification Required\n",
        "MULTIMODAL_EVIDENCE_BRIEF.md": "# Multimodal Evidence Brief\n\n## Images or Screenshots Reviewed\n\n## What the Visual Evidence Shows\n\n## Remaining Visual Uncertainty\n"
    }
    for name, content in files.items():
        path = base / name
        if not path.exists():
            path.write_text(content, encoding="utf-8")
    print(base)
if __name__ == "__main__":
    main()
