#!/usr/bin/env python3
"""Idempotent PMM-OS patch: ask YouTube for RECENT videos instead of filtering after.

Applied after every upstream sync (sync-research-engines.sh calls this), because that
script does `rm -rf skills/last30days/scripts` and would drop a direct edit.

THE PROBLEM. A last30days brief is a 30-day window, and YouTube search ranks by
relevance, not recency. Upstream ran `ytsearch{n}:{topic}` — an all-time search — and
then applied a SOFT filter in Python:

    recent = [i for i in items if i["date"] and i["date"] >= from_date]
    if len(recent) >= 3:
        items = recent
    else:
        _log(f"Found {len(items)} videos ({len(recent)} within date range, keeping all)")

Two defects and one design flaw:

1. NO UPPER BOUND. `>= from_date` only. A video dated AFTER `to_date` passes the
   filter — the window has one wall.

2. "KEEPING ALL" IS THE THIRD SIGHTING OF THIS BUG. Instagram Reels had it
   (patch-instagram-reels-search.py), TikTok had it (patch-tiktok-free-lane.py), and
   here it is again. YouTube's version is the mildest — it is logged, and evergreen
   YouTube content is often genuinely the best evidence for a topic — so this patch
   does NOT make it return empty. It marks the out-of-window items instead, so a
   receipt can see them, and orders in-window first so a cap never drops a fresh
   video in favour of a stale one.

3. A RELEVANCE FLOOR, because a search can return the WRONG TOPIC. See _drop_offtopic.

NOT DONE, AND DELIBERATELY SO: asking YouTube for the window at the source.

`_yt_search_url()` is built, tested and NOT WIRED IN. YouTube's results page takes an
upload-date facet in `sp`, yt-dlp consumes a results URL, and it works beautifully
when it works. Measured 2026-07-31, "ai note taker", window 2026-07-01..2026-07-31:

    ytsearch10 (upstream)   1 of 10 inside the window; results from 2024 and 2025
    sp=this-month           7 of 10 inside the window; all 10 from 2026

Seven times the in-window yield for one URL parameter — and then a full pipeline run
came back with Avengers trailers, X-Files, NBA 2K27 and House of the Dragon. That is
YouTube's TRENDING FEED: when the results URL does not resolve to a search, yt-dlp
falls through to a generic playlist and reports success. Those entries also carry a
different shape with no `video_id`, so the same run produced 86 videos, 0 transcripts
and 0 comments — silently, with an exit code of 0.

That is the fabricated-fact failure in its worst form: not stale evidence but evidence
about a different topic, and this repo exists to not ship that. So the search command
is left exactly as upstream wrote it, and the URL builder stays behind a test as a
measured lead for whoever picks this up. What it needs before it can be wired in is a
guard that can tell "these are search results" from "this is the trending feed" —
probably asserting the extractor key rather than trusting the item list.

Runnable check: scripts/test_youtube_recency.py (wired into the validator).
"""
import hashlib
import pathlib
import py_compile
import re
import sys
import tempfile

LIB = pathlib.Path(__file__).resolve().parent.parent / "skills/last30days/scripts/lib"
MARK = "PMM-OS-YT-RECENCY"

PREAMBLE = f'''
# {MARK}/@STAMP@ (re-applied by scripts/patch-youtube-recency.py after upstream sync)
# YouTube's "Upload date" search facet, as the base64 protobuf `sp` values its own
# results page uses. yt-dlp consumes a results URL, so this costs one parameter.
_YT_SP = {{
    "week":  "EgIIAw%3D%3D",
    "month": "EgIIBA%3D%3D",
    "year":  "EgIIBQ%3D%3D",
}}


def _yt_search_url(topic: str, from_date: str, to_date: str) -> str:
    """A YouTube results URL filtered to roughly the requested window.

    Falls back to a plain `ytsearch:` term when the dates will not parse — a bad
    window must not take the whole search down with it.
    """
    from urllib.parse import quote_plus
    try:
        span = (dates.parse_date(to_date) - dates.parse_date(from_date)).days
    except Exception:
        span = 30
    bucket = "week" if span <= 8 else "month" if span <= 45 else "year"
    return (f"https://www.youtube.com/results?search_query={{quote_plus(topic)}}"
            f"&sp={{_YT_SP[bucket]}}")


def _drop_offtopic(items, core_topic: str, floor: float = 0.02):
    """Hard relevance floor. A search that returns the WRONG RESULT SET must not reach
    a brief, however it got there.

    Observed 2026-07-31 while building this patch: a run for "ai note taker" came back
    with Avengers trailers, Dhar Mann and House of the Dragon — YouTube's TRENDING
    FEED. A results URL that fails can fall through to a generic playlist, and yt-dlp
    reports that as a successful search. It is the fabricated-fact failure again, in
    its worst form: not stale evidence, but evidence about a different topic entirely.

    Token-overlap separation is total on the measured sample (1.000 for on-topic
    titles, 0.000 for trending ones), so the floor only has to be above zero. It is
    deliberately NOT tuned tighter than that — this is a guard against garbage, not a
    second relevance ranker, and the reranker downstream is the thing that sorts.
    """
    kept = [i for i in items if (i.get("relevance") or 0) > floor]
    dropped = len(items) - len(kept)
    if dropped and not kept:
        # Everything scored zero: the result set is about something else. Say so.
        _log(f"DISCARDED all {{dropped}} results — none mention '{{core_topic}}'. "
             f"A search that returns the wrong topic is a FAILED search, not evidence.")
    elif dropped:
        _log(f"Dropped {{dropped}} off-topic results (relevance <= {{floor}})")
    return kept


def _apply_window(items, from_date: str, to_date: str, log_prefix: str = ""):
    """Keep in-window videos first, and MARK the rest instead of hiding them.

    Upstream kept every out-of-window video whenever fewer than three fell inside,
    logged as "keeping all", with nothing on the items to say which was which — the
    same shape as the Instagram Reels and TikTok defects. Unlike those two this does
    not return empty: an evergreen YouTube video is often the best evidence a topic
    has, and dropping it would cost more than it protects. It labels instead.

    Also adds the UPPER bound. Upstream compared `>= from_date` only, so a video
    dated after `to_date` passed a filter that was supposed to be a window.
    """
    inside, outside = [], []
    for i in items:
        d = i.get("date")
        (inside if (d and from_date <= d <= to_date) else outside).append(i)
    for i in outside:
        # normalize._date_confidence reads this before computing its own, and render
        # surfaces it. An out-of-window item can still be quoted — it just can never
        # be quoted as something that happened in the window.
        i["date_confidence"] = "low"
        i["out_of_window"] = True
    if inside:
        _log(f"{{log_prefix}}{{len(inside)}} videos inside {{from_date}}..{{to_date}}"
             + (f"; {{len(outside)}} older kept and marked out-of-window" if outside else ""))
    else:
        _log(f"{{log_prefix}}NO videos inside {{from_date}}..{{to_date}} — "
             f"returning {{len(outside)}} older ones, all marked out-of-window")
    # In-window first so any downstream cap (transcripts, comments, rendering) spends
    # its budget on fresh videos before back-catalogue.
    return inside + outside
'''

# The soft filter, in both search paths. Identical text upstream; replaced with the
# shared helper so the two can never drift apart again.
OLD_SOFT_A = '''    # Soft date filter: prefer recent items but fall back to all if too few
    recent = [i for i in items if i["date"] and i["date"] >= from_date]
    if len(recent) >= 3:
        items = recent
        _log(f"Found {len(items)} videos within date range")
    else:
        _log(f"Found {len(items)} videos ({len(recent)} within date range, keeping all)")
'''
NEW_SOFT_A = f'''    # {MARK}: window both ends, mark what falls outside, fresh first.
    items = _apply_window(_drop_offtopic(items, core_topic), from_date, to_date, "yt-dlp: ")
'''

OLD_SOFT_B = '''    # Soft date filter
    recent = [i for i in items if i["date"] and i["date"] >= from_date]
    if len(recent) >= 3:
        items = recent
        _log(f"Found {len(items)} videos within date range")
    else:
        _log(f"Found {len(items)} videos ({len(recent)} within date range, keeping all)")
'''
NEW_SOFT_B = f'''    # {MARK}: window both ends, mark what falls outside, fresh first.
    items = _apply_window(_drop_offtopic(items, core_topic), from_date, to_date,
                          "ScrapeCreators: ")
'''

OLD_CMD = '''    # yt-dlp search with full metadata (no --flat-playlist so dates are real).
    # NOTE: --dateafter intentionally omitted — YouTube search returns
    # relevance-sorted results and strict date filtering returns 0 for
    # evergreen topics. Python soft filter (below) handles date filtering.
    cmd = [
        "yt-dlp",
        "--ignore-config",
        "--no-cookies-from-browser",
        f"ytsearch{count}:{core_topic}",'''
NEW_CMD = f'''    # {MARK}: ask YouTube's results page for the window instead of searching all
    # time and discarding client-side. Measured on "ai note taker", July 2026:
    # ytsearch10 put 1 of 10 inside the window, this puts 7 of 10. --dateafter is
    # still omitted deliberately — it filters yt-dlp's OUTPUT, so it would shrink an
    # all-time result set to nothing rather than fetch a different one.
    cmd = [
        "yt-dlp",
        "--ignore-config",
        "--no-cookies-from-browser",
        "--playlist-end", str(count),
        _yt_search_url(core_topic, from_date, to_date),'''


def main() -> int:
    p = LIB / "youtube_yt.py"
    stamp = f"{MARK}/" + hashlib.sha256(
        "".join([PREAMBLE, NEW_SOFT_A, NEW_SOFT_B]).encode()).hexdigest()[:8]

    if "--check" in sys.argv:
        if not p.is_file() or stamp not in p.read_text():
            print(f"NOT APPLIED (or stale): {MARK} — run scripts/patch-youtube-recency.py")
            return 1
        print(f"applied: {MARK} in youtube_yt.py")
        return 0

    if not p.exists():
        print(f"skip (missing): {p}")
        return 0
    s = p.read_text()
    if MARK in s:
        if stamp in s:
            print("already patched: youtube_yt.py (recency)")
            return 0
        print("STALE: youtube_yt.py carries an older version of this patch.\n"
              "  git checkout HEAD -- skills/last30days/scripts/lib/youtube_yt.py && \\\n"
              "  python3 scripts/patch-transcript-env-overrides.py && \\\n"
              "  python3 scripts/patch-youtube-comments-free.py && \\\n"
              "  python3 scripts/patch-youtube-recency.py")
        return 1

    for old, new, what in ((OLD_SOFT_A, NEW_SOFT_A, "yt-dlp soft filter"),
                           (OLD_SOFT_B, NEW_SOFT_B, "ScrapeCreators soft filter")):
        if s.count(old) != 1:
            print(f"ANCHOR NOT UNIQUE ({s.count(old)}x) — update patcher: {what}")
            return 1
        s = s.replace(old, new)

    anchor = re.search(r"^def _log\(", s, re.M)
    if not anchor:
        print("ANCHOR NOT FOUND (def _log) — update patcher")
        return 1
    # After _log so the helpers can use it, and after `dates` is imported.
    nxt = re.search(r"^(def |@)", s[anchor.end():], re.M)
    cut = anchor.end() + nxt.start()
    s = (s[:cut] + PREAMBLE.replace("@STAMP@", stamp.split("/")[1]).lstrip("\n")
         + "\n\n" + s[cut:])

    if "from . import dates" not in s and "dates," not in s:
        print("MISSING IMPORT: `dates` — update patcher")
        return 1

    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as t:
        t.write(s)
    try:
        py_compile.compile(t.name, doraise=True, cfile=tempfile.mktemp())
    except py_compile.PyCompileError as e:
        print(f"PATCH WOULD PRODUCE INVALID PYTHON — not written: {e}")
        return 1
    finally:
        pathlib.Path(t.name).unlink(missing_ok=True)

    p.write_text(s)
    print("patched: youtube_yt.py (a window with two walls, out-of-window marked, relevance floor)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
