#!/usr/bin/env python3
"""TikTok account listing + single-video hydration — free, keyless, via yt-dlp.

Replaces the inline one-liner in reach.sh, which asked yt-dlp for a JSON object
carrying view_count, like_count, comment_count, repost_count, timestamp, duration and
description — and then printed only `title`. Every engagement number was fetched and
thrown on the floor, and `title` is TikTok's truncated description, so the one field it
did print was the damaged copy of one it discarded.

What is FREE here (measured 2026-07-30 against @nasa/video/7667244788046892319):
    view_count 747900 · like_count 66600 · comment_count 7612 · repost_count 1292
    timestamp/upload_date · duration · uploader · description · subtitles
What is NOT free at any effort: comment TEXT, likes per comment, and keyword/hashtag
DISCOVERY. Those need ScrapeCreators. See RESEARCH-ETHICS.md and research-engines.md.

Two verified silent-failure modes this guards:
  1. ~8% of videos exit 1 with "No video formats found!" while the metadata is sitting
     right there. --ignore-no-formats-error is REQUIRED, not defensive.
  2. yt-dlp exits 0 whether captions exist or not, so transcript presence must be
     asserted on the subtitles dict, never inferred from the return code.

Usage:  tt_fetch.py account <@user|url> [count]
        tt_fetch.py video <url>
Exit:   0 ok · 2 fetch failed · 3 nothing returned · 64 usage
"""
from __future__ import annotations

import json
import subprocess
import sys

# TikTok display-rounds anything at or above ~10k before it ever reaches the API: 399 of
# 400 sampled view counts ended in "00". So 747900 means "747.9K, give or take 50" and
# printing it as an exact integer invents four digits of precision. Comment and repost
# counts appear exact at all magnitudes.
ROUND_ABOVE = 10_000


def approx(n) -> str:
    if not isinstance(n, int) or n < ROUND_ABOVE:
        return str(n if n is not None else "?")
    if n >= 1_000_000:
        return f"~{n / 1_000_000:.1f}M"
    return f"~{n / 1_000:.1f}K"


def run(args: list[str]) -> tuple[int, str, str]:
    p = subprocess.run(["yt-dlp", *args], capture_output=True, text=True, timeout=180)
    return p.returncode, p.stdout, p.stderr


def fail(msg: str, code: int = 2) -> int:
    print(f"# TikTok: {msg}", file=sys.stderr)
    return code


def account(target: str, count: int) -> int:
    url = target if target.startswith("http") else \
        f"https://www.tiktok.com/{target if target.startswith('@') else '@' + target}"
    rc, out, err = run(["--flat-playlist", "--playlist-end", str(count), "-J", url])
    if rc != 0 or not out.strip():
        # Never launder this into "no data". A blocked fetch and an empty account are
        # different facts, and only one of them belongs in a research brief.
        return fail(f"yt-dlp failed (exit {rc}) for {url} — NOT evidence the account is "
                    f"empty.\n  {err.strip().splitlines()[-1] if err.strip() else ''}")
    try:
        entries = (json.loads(out).get("entries") or [])
    except json.JSONDecodeError:
        return fail("yt-dlp returned unparseable JSON — the extractor contract moved.")
    # tiktok:tag returns [null]; guard here too so a null can never reach the output.
    entries = [e for e in entries if isinstance(e, dict)]
    if not entries:
        return fail(f"0 videos for {url} — treat as a failed fetch, not an empty account.", 3)

    print(f"# TikTok {url}: {len(entries)} recent videos (free, yt-dlp — no key)")
    for e in entries:
        # --flat-playlist is cheap but sparse; per-video stats need the video mode below.
        print(f"- {e.get('url') or e.get('id')}"
              + (f"  {approx(e.get('view_count'))} views" if e.get("view_count") else "")
              + f": {(e.get('description') or e.get('title') or '').replace(chr(10), ' ')[:140]}")
    print("# (per-video engagement + transcript: reach.sh tiktok-video <url>)")
    return 0


def video(url: str) -> int:
    # subtitles and metadata MUST be requested in the same invocation — asking for
    # --write-info-json without a subs flag returns subtitles: {} on videos that have them.
    rc, out, err = run(["--skip-download", "--ignore-no-formats-error",
                        "--write-subs", "--sub-langs", "all", "-J", url])
    if not out.strip():
        last = err.strip().splitlines()[-1] if err.strip() else ""
        # yt-dlp reports a nonexistent video id as "Your IP address is blocked from
        # accessing this post". That string is NOT proof of an IP block, and reporting
        # it as one sends people to fix a network that is fine.
        if "blocked from accessing" in last:
            last += "  (this message also appears for a video id that does not exist)"
        return fail(f"no metadata for {url} (exit {rc}).\n  {last}")
    try:
        d = json.loads(out)
    except json.JSONDecodeError:
        return fail("yt-dlp returned unparseable JSON — the extractor contract moved.")

    subs = d.get("subtitles") or {}
    print(f"# TikTok {url}")
    print(f"  posted:    {d.get('upload_date') or '?'}   duration: {d.get('duration') or '?'}s"
          f"   by @{d.get('uploader') or '?'}")
    print(f"  views:     {approx(d.get('view_count'))}"
          f"   likes: {approx(d.get('like_count'))}"
          f"   comments: {d.get('comment_count', '?')}"
          f"   reposts: {d.get('repost_count', '?')}")
    if isinstance(d.get("view_count"), int) and d["view_count"] >= ROUND_ABOVE:
        print("  note:      views/likes above ~10k are TikTok's own display-rounded "
              "figures, not exact telemetry")
    print(f"  caption:   {(d.get('description') or '').replace(chr(10), ' ')[:300]}")

    # Presence is asserted on the dict, never on rc — rc is 0 either way.
    if not subs:
        print("  transcript: NONE — this video has no ASR track. yt-dlp does no OCR, so "
              "on-screen-text-over-music videos (common in B2B) yield nothing here.")
    else:
        langs = ", ".join(subs)
        auto = " (machine ASR — never quote as verbatim speech)"
        print(f"  transcript: available in {langs}{auto}")
        # Non-English videos also expose a machine-TRANSLATED eng-US track with identical
        # timestamps. Print the language so nobody quotes a translation as a quote.
        if "eng-US" in subs and len(subs) > 1:
            print("  note:      eng-US on a non-English video is a MACHINE TRANSLATION, "
                  "not the original audio")
    print("# comment TEXT and per-comment likes are NOT available free — that needs "
          "ScrapeCreators.")
    return 0


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__.split("Usage:")[1], file=sys.stderr)
        return 64
    mode, target = sys.argv[1], sys.argv[2]
    if mode == "account":
        return account(target, int(sys.argv[3]) if len(sys.argv) > 3 else 15)
    if mode == "video":
        return video(target)
    print(f"unknown mode: {mode}", file=sys.stderr)
    return 64


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except FileNotFoundError:
        raise SystemExit(fail("yt-dlp not installed — npx pmm-os setup", 127))
    except subprocess.TimeoutExpired:
        raise SystemExit(fail("yt-dlp timed out after 180s", 2))
    except KeyboardInterrupt:
        raise SystemExit(130)
