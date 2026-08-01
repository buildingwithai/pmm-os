#!/usr/bin/env python3
"""Idempotent PMM-OS patch: stop spending ScrapeCreators credits on free TikTok data.

Applied after every upstream sync (sync-research-engines.sh calls this), because
that script does `rm -rf skills/last30days/scripts` and would drop a direct edit.

TikTok splits cleanly into two halves, and upstream paid for both:

    HYDRATION (free)   a creator's video list, per-video view/like/comment/repost
                       counts, dates, full captions, ASR transcripts  -> yt-dlp
    DISCOVERY (paid)   keyword and hashtag search, comment TEXT and per-comment
                       likes                                          -> ScrapeCreators

Two functions were on the wrong side of that line:

1. `_profile_videos()` spent a credit on GET /v3/tiktok/profile/videos. Measured
   2026-07-31: `yt-dlp --playlist-end 3 -J https://www.tiktok.com/@nasa` returned all
   three videos in 3.3s with view_count, like_count, comment_count, repost_count,
   timestamp, uploader, duration and the FULL description — every field `_parse_items`
   reads, for nothing.

2. `fetch_captions()` spent a credit per transcript on GET /v1/tiktok/video/transcript.
   Measured on the same account: `--write-subs --sub-langs all` returned a real
   349-byte WebVTT in 1.2s.

Both keep ScrapeCreators as the FALLBACK, so a keyed user is never worse off than
before — the key is just no longer the first thing reached for.

AND ONE DEFECT FOUND WHILE IN HERE, which is the same one the Instagram Reels patcher
exists to fix, in the same shape, in this file:

    else:
        _log(f"No videos within date range, keeping all {len(items)}")

When nothing fell inside [from_date, to_date], `search_tiktok()` kept every
out-of-window video and returned it with no error — videos of any age presented as
last-30-days evidence. That is the fabricated-fact failure this plugin exists to
prevent, and it was in main. Fixed here rather than filed, because it is three lines
in a function this patcher already has to hold open.

ON PRECISION: yt-dlp reports TikTok's own display-rounded counts (399 of 400 sampled
view counts ended in "00"), and so does ScrapeCreators — both read the same field, so
this patch changes nothing about accuracy. See skills/agent-reach/scripts/tt_fetch.py.

Runnable check: scripts/test_tiktok_free_lane.py (wired into the validator).
"""
import pathlib
import py_compile
import re
import sys
import tempfile

LIB = pathlib.Path(__file__).resolve().parent.parent / "skills/last30days/scripts/lib"
MARK = "PMM-OS-TT-FREE-LANE"

PREAMBLE = f'''
# {MARK} (re-applied by scripts/patch-tiktok-free-lane.py after upstream sync)
# TikTok hydration is free via yt-dlp; only DISCOVERY and comment TEXT cost credits.
import json as _json
import tempfile as _tempfile
from pathlib import Path as _Path

from . import subproc

_TT_PROFILE_TIMEOUT = 120   # full per-video metadata, ~1.1s/video measured
_TT_CAPTION_TIMEOUT = 45


def _ytdlp_available() -> bool:
    from shutil import which
    return which("yt-dlp") is not None


def _tt_ytdlp(args: List[str], timeout: int):
    """Run yt-dlp, or return None if it could not be run to completion."""
    try:
        return subproc.run_with_timeout(["yt-dlp", "--ignore-config",
                                         "--no-warnings", *args], timeout=timeout)
    except subproc.SubprocTimeout:
        _log(f"yt-dlp timed out after {{timeout}}s")
    except (FileNotFoundError, OSError) as exc:
        _log(f"yt-dlp could not start: {{exc}}")
    return None


def _as_aweme(entry: Dict[str, Any], handle: str) -> Dict[str, Any]:
    """Map one yt-dlp TikTok entry onto the ScrapeCreators aweme shape.

    Emitting the aweme shape rather than a parsed item means `_parse_items` — with
    its relevance scoring, hashtag boost and URL fallback — stays the single place
    that decides what a TikTok item is, for both lanes.

    `description` is the FULL caption; `title` is TikTok's truncated copy of it. The
    old reach.sh printed `title` while discarding `description`, which is how a
    damaged field ended up being the only one shown.
    """
    desc = entry.get("description") or entry.get("title") or ""
    return {{
        "aweme_id": str(entry.get("id") or ""),
        "desc": desc,
        "create_time": entry.get("timestamp"),
        "share_url": entry.get("webpage_url") or entry.get("url") or "",
        "author": {{"unique_id": entry.get("uploader") or handle}},
        "statistics": {{
            "play_count": entry.get("view_count") or 0,
            "digg_count": entry.get("like_count") or 0,
            "comment_count": entry.get("comment_count") or 0,
            "share_count": entry.get("repost_count") or 0,
        }},
        # yt-dlp has no structured hashtag list, so recover them from the caption —
        # `_parse_items` boosts relevance on these and they are otherwise lost.
        "text_extra": [{{"hashtag_name": h}} for h in re.findall(r"#(\\w+)", desc)],
        # `video` is deliberately OMITTED, not filled in: SC reports duration in
        # milliseconds and yt-dlp in seconds. Nothing downstream reads it today, so
        # a missing value is honest where a 1000x-wrong one would lie in wait.
    }}


def _ytdlp_profile_videos(handle: str, count: int) -> Optional[List[Dict[str, Any]]]:
    """A creator's recent videos, free, via yt-dlp. None means the fetch failed.

    Zero entries is reported as a failure, not an empty account: a creator someone
    named in a research config having no videos at all is far less likely than a
    block, and calling a block an empty account is what puts a hole in a brief with
    nothing marking it. Same call the reach.sh desk makes (see tt_fetch.py).
    """
    url = f"https://www.tiktok.com/@{{handle.lstrip('@')}}"
    r = _tt_ytdlp(["--playlist-end", str(max(count, 1)), "-J", url],
                  _TT_PROFILE_TIMEOUT)
    if r is None or not (r.stdout or "").strip():
        return None
    try:
        entries = _json.loads(r.stdout).get("entries") or []
    except _json.JSONDecodeError:
        _log(f"yt-dlp returned unparseable JSON for @{{handle}} — extractor moved")
        return None
    # `tiktok:tag` is known to return [null] with exit 0; guard the profile lane too
    # so a null can never reach _parse_items.
    entries = [e for e in entries if isinstance(e, dict) and e.get("id")]
    if not entries:
        _log(f"yt-dlp returned 0 videos for @{{handle}} — treating as a failed fetch")
        return None
    return [_as_aweme(e, handle.lstrip("@")) for e in entries[:count]]


def _ytdlp_caption(url: str) -> Optional[str]:
    """One video's ASR transcript, free, via yt-dlp. None if there isn't one.

    `--ignore-no-formats-error` is required, not defensive: ~8% of TikTok videos exit
    1 with "No video formats found!" while the subtitles are sitting right there.
    """
    if not url:
        return None
    with _tempfile.TemporaryDirectory() as tmp:
        r = _tt_ytdlp(["--skip-download", "--ignore-no-formats-error",
                       "--write-subs", "--sub-langs", "all", "--sub-format", "vtt",
                       "-o", f"{{tmp}}/%(id)s", url], _TT_CAPTION_TIMEOUT)
        if r is None:
            return None
        vtts = sorted(_Path(tmp).glob("*.vtt"))
        if not vtts:
            return None
        # On a non-English video TikTok also exposes an `eng-US` track with identical
        # timestamps — a MACHINE TRANSLATION, not the audio. Prefer the original when
        # there is a choice, so a translation is never quoted as what someone said.
        original = [p for p in vtts if ".eng-US." not in p.name]
        try:
            raw = (original or vtts)[0].read_text(encoding="utf-8", errors="replace")
        except OSError as exc:
            _log(f"could not read the VTT yt-dlp wrote for {{url}}: {{exc}}")
            return None
    return _clean_webvtt(raw) or None
'''

# ---- _profile_videos: try free first, keep the paid call as the fallback ---------

PROFILE_REPLACEMENT = f'''def _profile_videos(
    handle: str,
    token: str,
    count: int = 10,
) -> List[Dict[str, Any]]:
    """Fetch a TikTok creator's recent videos — yt-dlp first, ScrapeCreators second.

    {MARK}: upstream went straight to GET /v3/tiktok/profile/videos and spent a
    credit on data yt-dlp returns free (see scripts/patch-tiktok-free-lane.py).

    Args:
        handle: TikTok username (without @)
        token: ScrapeCreators API key, used only if the keyless fetch failed
        count: Max videos to return

    Returns:
        List of raw TikTok item dicts (aweme_info format), empty on total failure.
    """
    _log(f"Profile videos: @{{handle}}")
    if _ytdlp_available():
        free = _ytdlp_profile_videos(handle, count)
        if free:
            _log(f"  -> {{len(free)}} videos from @{{handle}} (free, yt-dlp — no credit)")
            return free
        _log(f"  keyless profile fetch failed for @{{handle}}"
             + ("; falling back to ScrapeCreators" if token else ""))
    if not token:
        return []

    profile_url = "https://api.scrapecreators.com/v3/tiktok/profile/videos"
    try:
        data = http.get(
            profile_url,
            params={{"handle": handle, "sort_by": "latest"}},
            headers=http.scrapecreators_headers(token),
            timeout=30,
            retries=2,
        )
    except Exception as e:
        _log(f"Profile videos error for @{{handle}}: {{e}}")
        return []

    raw_items = data.get("aweme_list") or data.get("data") or []
    _log(f"  -> {{len(raw_items)}} videos from @{{handle}} (ScrapeCreators, 1 credit)")
    return raw_items[:count]
'''

# ---- fetch_captions: yt-dlp transcripts, SC only where yt-dlp came back empty ----

CAPTIONS_REPLACEMENT = f'''def fetch_captions(
    video_items: List[Dict[str, Any]],
    token: str = "",
    depth: str = "default",
) -> Dict[str, str]:
    """Fetch transcripts for the top N TikTok videos — keyless first, paid second.

    {MARK}: upstream spent one ScrapeCreators credit per transcript on
    GET /v1/tiktok/video/transcript. yt-dlp returns the same ASR track free.

    Strategy:
      1. the video description as the baseline caption (always free, always there)
      2. yt-dlp's ASR transcript, which supersedes it
      3. ScrapeCreators, ONLY for the videos yt-dlp could not answer for

    Args:
        video_items: Items from search_tiktok()
        token: Optional ScrapeCreators API key
        depth: Depth level for the caption limit

    Returns:
        Dict mapping video_id -> caption text (truncated to CAPTION_MAX_WORDS).
    """
    config = DEPTH_CONFIG.get(depth, DEPTH_CONFIG["default"])
    max_captions = config["max_captions"]

    if not video_items:
        return {{}}

    top_items = video_items[:max_captions]
    _log(f"Enriching captions for {{len(top_items)}} videos")

    def _trim(text: str) -> str:
        words = text.split()
        return ' '.join(words[:CAPTION_MAX_WORDS]) + '...' if len(words) > CAPTION_MAX_WORDS else text

    captions = {{}}

    # Pass 1: the description. Free, and the only thing available for the many
    # short-form videos that are on-screen text over music with no speech at all.
    for item in top_items:
        text = item.get("text", "")
        if text:
            captions[item["video_id"]] = _trim(text)

    # Pass 2: yt-dlp's ASR transcript (free). Machine ASR — never quote as verbatim.
    spoken = set()
    if _ytdlp_available():
        for item in top_items:
            try:
                transcript = _ytdlp_caption(item.get("url", ""))
            except Exception as e:
                _log(f"Keyless transcript failed for {{item['video_id']}}: {{e}}")
                transcript = None
            if transcript:
                captions[item["video_id"]] = _trim(transcript)
                spoken.add(item["video_id"])

    # Pass 3: ScrapeCreators, only where the free lane produced nothing.
    paid = 0
    if token:
        for item in top_items:
            vid = item["video_id"]
            url = item.get("url", "")
            if vid in spoken or not url:
                continue
            try:
                data = http.get(
                    f"{{SCRAPECREATORS_BASE}}/video/transcript",
                    params={{"url": url}},
                    headers=http.scrapecreators_headers(token),
                    timeout=15,
                    retries=1,
                )
                transcript = data.get("transcript")
                if transcript:
                    if isinstance(transcript, list):
                        transcript = " ".join(str(s) for s in transcript)
                    transcript = _clean_webvtt(transcript)
                    if transcript:
                        captions[vid] = _trim(transcript)
                        paid += 1
            except Exception as e:
                _log(f"Transcript fetch failed for {{vid}}: {{e}}")

    got = sum(1 for v in captions.values() if v)
    # Name the lane: "3/5 captions" hid whether a run spent 0 or 5 credits.
    _log(f"Got captions for {{got}}/{{len(top_items)}} videos "
         f"({{len(spoken)}} spoken transcripts free via yt-dlp, {{paid}} via ScrapeCreators)")
    return captions
'''

# ---- the stale-window defect, identical in shape to the IG Reels one -------------

OLD_WINDOW = '''    else:
        _log(f"No videos within date range, keeping all {len(items)}")

    # Sort by views descending
    items.sort(key=lambda x: x["engagement"]["views"], reverse=True)

    _log(f"Found {len(items)} TikTok videos")
    return {"items": items}'''

NEW_WINDOW = f'''    else:
        # {MARK}: upstream kept every OUT-OF-WINDOW video here and returned it with
        # no error — videos of any age rendered as last-30-days evidence. Identical
        # in shape to the Instagram Reels defect (see patch-instagram-reels-search.py).
        # An empty result the receipt can see beats a number nobody can trust.
        _log(f"Discarded all {{len(items)}} videos — none inside {{from_date}}..{{to_date}}")
        return {{"items": [], "error":
                f"no TikTok videos in {{from_date}}..{{to_date}} "
                f"({{len(items)}} returned, all outside the window)"}}

    # Sort by views descending
    items.sort(key=lambda x: x["engagement"]["views"], reverse=True)

    _log(f"Found {{len(items)}} TikTok videos")
    return {{"items": items}}'''


def replace_function(src: str, name: str, replacement: str):
    start = re.search(rf"^def {name}\(", src, re.M)
    if not start:
        return None, f"ANCHOR NOT FOUND (def {name}) — upstream changed, update patcher"
    nxt = re.search(r"^(def |@)", src[start.end():], re.M)
    end = start.end() + nxt.start() if nxt else len(src)
    return src[:start.start()] + replacement + "\n\n" + src[end:], None


def main() -> int:
    p = LIB / "tiktok.py"
    if "--check" in sys.argv:
        if not p.is_file() or MARK not in p.read_text():
            print(f"NOT APPLIED: {MARK} missing from tiktok.py "
                  f"— run scripts/patch-tiktok-free-lane.py")
            return 1
        print(f"applied: {MARK} in tiktok.py")
        return 0

    if not p.exists():
        print(f"skip (missing): {p}")
        return 0
    s = p.read_text()
    if MARK in s:
        print("already patched: tiktok.py")
        return 0

    for name, repl in (("_profile_videos", PROFILE_REPLACEMENT),
                       ("fetch_captions", CAPTIONS_REPLACEMENT)):
        s, err = replace_function(s, name, repl)
        if err:
            print(err)
            return 1

    if s.count(OLD_WINDOW) != 1:
        print(f"ANCHOR NOT UNIQUE ({s.count(OLD_WINDOW)}x) — update patcher: "
              f"search_tiktok's out-of-window branch")
        return 1
    s = s.replace(OLD_WINDOW, NEW_WINDOW)

    # The new helpers must land after DEPTH_CONFIG (they read it) and after the
    # env-override block that rewrites it, but before the first function that calls
    # them. Anchoring on `def _log(` puts them exactly there.
    anchor = re.search(r"^def _log\(", s, re.M)
    if not anchor:
        print("ANCHOR NOT FOUND (def _log) — update patcher")
        return 1
    s = s[:anchor.start()] + PREAMBLE.lstrip("\n") + "\n\n" + s[anchor.start():]

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
    print("patched: tiktok.py (free profile + transcript lanes, honest empty window)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
