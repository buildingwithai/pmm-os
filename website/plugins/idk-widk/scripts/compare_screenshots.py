#!/usr/bin/env python3
"""Compare two PNG/JPG screenshots and write a diff image plus JSON metrics.

This lightweight helper is for local visual evidence. It is not a replacement
for Chrome DevTools MCP screenshot evidence and local visual QA.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageChops


def main() -> int:
    parser = argparse.ArgumentParser(description="Compare two screenshots and produce a visual diff.")
    parser.add_argument("baseline", help="Baseline screenshot path.")
    parser.add_argument("candidate", help="Candidate screenshot path.")
    parser.add_argument("--out", default=".idkwidk/runtime-captures/visual-diff.png", help="Diff image output path.")
    parser.add_argument("--json-out", default=".idkwidk/runtime-captures/visual-diff.json", help="JSON metrics output path.")
    parser.add_argument("--threshold", type=int, default=0, help="Per-channel threshold 0-255. Default: 0.")
    args = parser.parse_args()

    baseline_path = Path(args.baseline)
    candidate_path = Path(args.candidate)
    out_path = Path(args.out)
    json_path = Path(args.json_out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.parent.mkdir(parents=True, exist_ok=True)

    base = Image.open(baseline_path).convert("RGBA")
    cand = Image.open(candidate_path).convert("RGBA")
    same_size = base.size == cand.size
    width = max(base.width, cand.width)
    height = max(base.height, cand.height)

    def pad(img: Image.Image) -> Image.Image:
        if img.size == (width, height):
            return img
        padded = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        padded.paste(img, (0, 0))
        return padded

    base_p = pad(base)
    cand_p = pad(cand)
    raw_diff = ImageChops.difference(base_p, cand_p)

    threshold = max(0, min(args.threshold, 255))
    pixels = list(raw_diff.getdata())
    diff_pixels = sum(1 for px in pixels if max(px[:3]) > threshold or px[3] > threshold)
    total_pixels = width * height
    ratio = diff_pixels / total_pixels if total_pixels else 0.0

    overlay = cand_p.copy().convert("RGBA")
    overlay_pixels = overlay.load()
    diff_pixels_data = raw_diff.load()
    for y in range(height):
        for x in range(width):
            px = diff_pixels_data[x, y]
            if max(px[:3]) > threshold or px[3] > threshold:
                orig = overlay_pixels[x, y]
                overlay_pixels[x, y] = (255, max(0, orig[1] // 3), max(0, orig[2] // 3), 255)
            else:
                orig = overlay_pixels[x, y]
                overlay_pixels[x, y] = (orig[0], orig[1], orig[2], max(90, orig[3] // 2))
    overlay.save(out_path)

    metrics = {
        "baseline": str(baseline_path),
        "candidate": str(candidate_path),
        "diff_image": str(out_path),
        "same_size": same_size,
        "baseline_size": list(base.size),
        "candidate_size": list(cand.size),
        "comparison_size": [width, height],
        "threshold": threshold,
        "diff_pixels": diff_pixels,
        "total_pixels": total_pixels,
        "diff_ratio": ratio,
    }
    json_path.write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(metrics, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
