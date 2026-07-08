#!/usr/bin/env python3
"""Compare two images for idkWidk visual QA.

Requires Pillow. If Pillow is unavailable, install with `python -m pip install pillow`.
Writes a simple diff image and prints pixel-level summary metrics.
"""
from __future__ import annotations

import argparse
from pathlib import Path


def main() -> int:
    try:
        from PIL import Image, ImageChops, ImageStat
    except Exception as exc:
        print('Pillow is required for image comparison. Install with: python -m pip install pillow')
        print(f'Import error: {exc}')
        return 2

    parser = argparse.ArgumentParser(description='Compare baseline and actual screenshots.')
    parser.add_argument('baseline')
    parser.add_argument('actual')
    parser.add_argument('--out', default='diff.png')
    args = parser.parse_args()

    base = Image.open(args.baseline).convert('RGBA')
    actual = Image.open(args.actual).convert('RGBA')
    if base.size != actual.size:
        print(f'Size mismatch: baseline={base.size}, actual={actual.size}')
        w = max(base.width, actual.width)
        h = max(base.height, actual.height)
        nb = Image.new('RGBA', (w, h), (0,0,0,0)); nb.paste(base, (0,0)); base = nb
        na = Image.new('RGBA', (w, h), (0,0,0,0)); na.paste(actual, (0,0)); actual = na
    diff = ImageChops.difference(base, actual)
    bbox = diff.getbbox()
    stat = ImageStat.Stat(diff)
    rms = sum(v*v for v in stat.rms) ** 0.5
    changed = 0
    pix = diff.getdata()
    for r,g,b,a in pix:
        if r or g or b or a:
            changed += 1
    total = diff.width * diff.height
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    diff.save(args.out)
    print(f'diff_written={args.out}')
    print(f'size={diff.size}')
    print(f'changed_pixels={changed}')
    print(f'total_pixels={total}')
    print(f'changed_percent={changed/total*100:.4f}')
    print(f'rms={rms:.4f}')
    print(f'bounding_box={bbox}')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
