"""TikTok search via ScrapeCreators API for /last30days.

Uses ScrapeCreators REST API to search TikTok by keyword, extract engagement
metrics (views, likes, comments, shares), and fetch video transcripts.

Requires SCRAPECREATORS_API_KEY in config. 100 free API calls, then PAYG.
API docs: https://scrapecreators.com/docs
"""

import re
import sys
from typing import Any, Dict, List, Optional, Set

from . import dates, http, log

SCRAPECREATORS_BASE = "https://api.scrapecreators.com/v1/tiktok"

# Depth configurations: how many results to fetch / captions to extract
DEPTH_CONFIG = {
    "quick":   {"results_per_page": 10, "max_captions": 3},
    "default": {"results_per_page": 20, "max_captions": 5},
    "deep":    {"results_per_page": 40, "max_captions": 8},
}

# PMM-OS-ENV-OVERRIDE (re-applied by scripts/patch-transcript-env-overrides.py after upstream sync)
import os as _os
if _os.environ.get("LAST30DAYS_TRANSCRIPT_LIMIT", "").isdigit():
    for _d in DEPTH_CONFIG.values():
        _d["max_captions"] = int(_os.environ["LAST30DAYS_TRANSCRIPT_LIMIT"])
if _os.environ.get("LAST30DAYS_RESULTS_PER_PAGE", "").isdigit():
    for _d in DEPTH_CONFIG.values():
        _d["results_per_page"] = int(_os.environ["LAST30DAYS_RESULTS_PER_PAGE"])

# Max words to keep from each caption
CAPTION_MAX_WORDS = 500

from .query import infer_query_intent
from .relevance import token_overlap_relevance as _compute_relevance


def _extract_core_subject(topic: str) -> str:
    """Extract core subject from verbose query for TikTok search."""
    from .query import VIRAL_NOISE, extract_core_subject
    return extract_core_subject(topic, noise=VIRAL_NOISE)


def expand_tiktok_queries(topic: str, depth: str) -> List[str]:
    """Generate multiple TikTok search queries from a topic.

    Mirrors reddit.py's expand_reddit_queries() pattern:
    1. Extract core subject (strip noise words)
    2. Include original topic if different from core
    3. Add intent-specific OR-joined content-type variants
    4. Cap by depth: 1 for quick, 2 for default, 3 for deep

    Returns 1-3 query strings depending on depth.
    """
    core = _extract_core_subject(topic)
    queries = [core]

    # Include cleaned original topic as variant if different from core
    original_clean = topic.strip().rstrip('?!.')
    if core.lower() != original_clean.lower() and len(original_clean.split()) <= 8:
        queries.append(original_clean)

    qtype = infer_query_intent(topic)

    # Intent-specific TikTok content-type variants
    if qtype in ("breaking_news", "opinion"):
        queries.append(f"{core} edit OR reaction OR trend")
    elif qtype == "product":
        queries.append(f"{core} review OR haul OR unboxing")
    elif qtype == "comparison":
        queries.append(f"{core} vs OR compared OR which is better")
    elif qtype == "how_to":
        queries.append(f"{core} tutorial OR hack OR tip")
    else:
        queries.append(f"{core} edit OR reaction OR trend")

    # Deep depth: add viral content variant
    if depth == "deep":
        queries.append(f"{core} viral OR fyp OR trending")

    # Cap by depth budget
    caps = {"quick": 1, "default": 2, "deep": 3}
    cap = caps.get(depth, 2)
    return queries[:cap]


# PMM-OS-TT-FREE-LANE (re-applied by scripts/patch-tiktok-free-lane.py after upstream sync)
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
        _log(f"yt-dlp timed out after {timeout}s")
    except (FileNotFoundError, OSError) as exc:
        _log(f"yt-dlp could not start: {exc}")
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
    return {
        "aweme_id": str(entry.get("id") or ""),
        "desc": desc,
        "create_time": entry.get("timestamp"),
        "share_url": entry.get("webpage_url") or entry.get("url") or "",
        "author": {"unique_id": entry.get("uploader") or handle},
        "statistics": {
            "play_count": entry.get("view_count") or 0,
            "digg_count": entry.get("like_count") or 0,
            "comment_count": entry.get("comment_count") or 0,
            "share_count": entry.get("repost_count") or 0,
        },
        # yt-dlp has no structured hashtag list, so recover them from the caption —
        # `_parse_items` boosts relevance on these and they are otherwise lost.
        "text_extra": [{"hashtag_name": h} for h in re.findall(r"#(\w+)", desc)],
        # `video` is deliberately OMITTED, not filled in: SC reports duration in
        # milliseconds and yt-dlp in seconds. Nothing downstream reads it today, so
        # a missing value is honest where a 1000x-wrong one would lie in wait.
    }


def _ytdlp_profile_videos(handle: str, count: int) -> Optional[List[Dict[str, Any]]]:
    """A creator's recent videos, free, via yt-dlp. None means the fetch failed.

    Zero entries is reported as a failure, not an empty account: a creator someone
    named in a research config having no videos at all is far less likely than a
    block, and calling a block an empty account is what puts a hole in a brief with
    nothing marking it. Same call the reach.sh desk makes (see tt_fetch.py).
    """
    url = f"https://www.tiktok.com/@{handle.lstrip('@')}"
    r = _tt_ytdlp(["--playlist-end", str(max(count, 1)), "-J", url],
                  _TT_PROFILE_TIMEOUT)
    if r is None or not (r.stdout or "").strip():
        return None
    try:
        entries = _json.loads(r.stdout).get("entries") or []
    except _json.JSONDecodeError:
        _log(f"yt-dlp returned unparseable JSON for @{handle} — extractor moved")
        return None
    # `tiktok:tag` is known to return [null] with exit 0; guard the profile lane too
    # so a null can never reach _parse_items.
    entries = [e for e in entries if isinstance(e, dict) and e.get("id")]
    if not entries:
        _log(f"yt-dlp returned 0 videos for @{handle} — treating as a failed fetch")
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
                       "-o", f"{tmp}/%(id)s", url], _TT_CAPTION_TIMEOUT)
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
            _log(f"could not read the VTT yt-dlp wrote for {url}: {exc}")
            return None
    return _clean_webvtt(raw) or None


def _log(msg: str):
    log.source_log("TikTok", msg, tty_only=False)


def _parse_date(item: Dict[str, Any]) -> Optional[str]:
    """Parse date from ScrapeCreators TikTok item to YYYY-MM-DD."""
    ts = item.get("create_time")
    if ts:
        try:
            return dates.timestamp_to_date(int(ts))
        except (ValueError, TypeError):
            pass
    return None


def _clean_webvtt(text: str) -> str:
    """Strip WebVTT timestamps and headers from transcript text."""
    if not text:
        return ""
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line.startswith('WEBVTT'):
            continue
        if re.match(r'^\d{2}:\d{2}', line):
            continue
        if '-->' in line:
            continue
        cleaned.append(line)
    return ' '.join(cleaned)


def _parse_items(raw_items: List[Dict[str, Any]], core_topic: str) -> List[Dict[str, Any]]:
    """Parse raw TikTok items into normalized dicts."""
    items = []
    for raw in raw_items:
        video_id = str(raw.get("aweme_id", ""))
        text = raw.get("desc", "")

        stats = raw.get("statistics") if isinstance(raw.get("statistics"), dict) else {}
        play_count = stats.get("play_count") if stats.get("play_count") is not None else 0
        digg_count = stats.get("digg_count") if stats.get("digg_count") is not None else 0
        comment_count = stats.get("comment_count") if stats.get("comment_count") is not None else 0
        share_count = stats.get("share_count") if stats.get("share_count") is not None else 0

        author_raw = raw.get("author")
        if isinstance(author_raw, dict):
            author_name = author_raw.get("unique_id", "")
        elif isinstance(author_raw, str):
            author_name = author_raw
        else:
            author_name = ""

        share_url = raw.get("share_url", "")
        text_extra = raw.get("text_extra") or []
        hashtag_names = [t.get("hashtag_name", "") for t in text_extra
                         if isinstance(t, dict) and t.get("hashtag_name")]

        video_raw = raw.get("video")
        duration = video_raw.get("duration") if isinstance(video_raw, dict) else None

        date_str = _parse_date(raw)

        # Compute relevance with hashtag boost
        relevance = _compute_relevance(core_topic, text, hashtag_names)

        # Build URL: prefer share_url, fallback to constructed URL
        url = share_url.split("?")[0] if share_url else ""
        if not url and author_name and video_id:
            url = f"https://www.tiktok.com/@{author_name}/video/{video_id}"

        items.append({
            "video_id": video_id,
            "text": text,
            "url": url,
            "author_name": author_name,
            "date": date_str,
            "engagement": {
                "views": play_count,
                "likes": digg_count,
                "comments": comment_count,
                "shares": share_count,
            },
            "hashtags": hashtag_names,
            "duration": duration,
            "relevance": relevance,
            "why_relevant": f"TikTok: {text[:60]}" if text else f"TikTok: {core_topic}",
            "caption_snippet": "",  # populated by fetch_captions
        })
    return items


def _hashtag_search(
    hashtag: str,
    token: str,
) -> List[Dict[str, Any]]:
    """Search TikTok by hashtag via ScrapeCreators.

    Args:
        hashtag: Hashtag name (without #)
        token: ScrapeCreators API key

    Returns:
        List of raw TikTok item dicts (aweme_info format).
    """
    _log(f"Hashtag search: #{hashtag}")
    try:
        data = http.get(
            f"{SCRAPECREATORS_BASE}/search/hashtag",
            params={"hashtag": hashtag},
            headers=http.scrapecreators_headers(token),
            timeout=30,
            retries=2,
        )
    except Exception as e:
        _log(f"Hashtag search error for #{hashtag}: {e}")
        return []

    raw_items = data.get("aweme_list") or data.get("data") or []
    _log(f"  -> {len(raw_items)} results for #{hashtag}")
    return raw_items


def _profile_videos(
    handle: str,
    token: str,
    count: int = 10,
) -> List[Dict[str, Any]]:
    """Fetch a TikTok creator's recent videos — yt-dlp first, ScrapeCreators second.

    PMM-OS-TT-FREE-LANE: upstream went straight to GET /v3/tiktok/profile/videos and spent a
    credit on data yt-dlp returns free (see scripts/patch-tiktok-free-lane.py).

    Args:
        handle: TikTok username (without @)
        token: ScrapeCreators API key, used only if the keyless fetch failed
        count: Max videos to return

    Returns:
        List of raw TikTok item dicts (aweme_info format), empty on total failure.
    """
    _log(f"Profile videos: @{handle}")
    if _ytdlp_available():
        free = _ytdlp_profile_videos(handle, count)
        if free:
            _log(f"  -> {len(free)} videos from @{handle} (free, yt-dlp — no credit)")
            return free
        _log(f"  keyless profile fetch failed for @{handle}"
             + ("; falling back to ScrapeCreators" if token else ""))
    if not token:
        return []

    profile_url = "https://api.scrapecreators.com/v3/tiktok/profile/videos"
    try:
        data = http.get(
            profile_url,
            params={"handle": handle, "sort_by": "latest"},
            headers=http.scrapecreators_headers(token),
            timeout=30,
            retries=2,
        )
    except Exception as e:
        _log(f"Profile videos error for @{handle}: {e}")
        return []

    raw_items = data.get("aweme_list") or data.get("data") or []
    _log(f"  -> {len(raw_items)} videos from @{handle} (ScrapeCreators, 1 credit)")
    return raw_items[:count]


def search_tiktok(
    topic: str,
    from_date: str,
    to_date: str,
    depth: str = "default",
    token: str = None,
) -> Dict[str, Any]:
    """Search TikTok via ScrapeCreators API.

    Args:
        topic: Search topic
        from_date: Start date (YYYY-MM-DD)
        to_date: End date (YYYY-MM-DD)
        depth: 'quick', 'default', or 'deep'
        token: ScrapeCreators API key

    Returns:
        Dict with 'items' list and optional 'error'.
    """
    if not token:
        return {"items": [], "error": "No SCRAPECREATORS_API_KEY configured"}

    config = DEPTH_CONFIG.get(depth, DEPTH_CONFIG["default"])
    core_topic = _extract_core_subject(topic)

    _log(f"Searching TikTok for '{core_topic}' (depth={depth}, count={config['results_per_page']})")

    try:
        data = http.get(
            f"{SCRAPECREATORS_BASE}/search/keyword",
            params={"query": core_topic, "sort_by": "relevance"},
            headers=http.scrapecreators_headers(token),
            timeout=30,
            retries=2,
        )
    except Exception as e:
        _log(f"ScrapeCreators error: {e}")
        return {"items": [], "error": f"{type(e).__name__}: {e}"}

    # Items are nested under aweme_info
    raw_entries = data.get("search_item_list") or data.get("data") or []
    raw_items = []
    for entry in raw_entries:
        if isinstance(entry, dict):
            info = entry.get("aweme_info", entry)
            raw_items.append(info)

    # Limit to configured count
    raw_items = raw_items[:config["results_per_page"]]

    # Parse items
    items = _parse_items(raw_items, core_topic)

    # Hard date filter
    in_range = [i for i in items if i["date"] and from_date <= i["date"] <= to_date]
    out_of_range = len(items) - len(in_range)
    if in_range:
        items = in_range
        if out_of_range:
            _log(f"Filtered {out_of_range} videos outside date range")
    else:
        # PMM-OS-TT-FREE-LANE: upstream kept every OUT-OF-WINDOW video here and returned it with
        # no error — videos of any age rendered as last-30-days evidence. Identical
        # in shape to the Instagram Reels defect (see patch-instagram-reels-search.py).
        # An empty result the receipt can see beats a number nobody can trust.
        _log(f"Discarded all {len(items)} videos — none inside {from_date}..{to_date}")
        return {"items": [], "error":
                f"no TikTok videos in {from_date}..{to_date} "
                f"({len(items)} returned, all outside the window)"}

    # Sort by views descending
    items.sort(key=lambda x: x["engagement"]["views"], reverse=True)

    _log(f"Found {len(items)} TikTok videos")
    return {"items": items}


def fetch_captions(
    video_items: List[Dict[str, Any]],
    token: str = "",
    depth: str = "default",
) -> Dict[str, str]:
    """Fetch transcripts for the top N TikTok videos — keyless first, paid second.

    PMM-OS-TT-FREE-LANE: upstream spent one ScrapeCreators credit per transcript on
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
        return {}

    top_items = video_items[:max_captions]
    _log(f"Enriching captions for {len(top_items)} videos")

    def _trim(text: str) -> str:
        words = text.split()
        return ' '.join(words[:CAPTION_MAX_WORDS]) + '...' if len(words) > CAPTION_MAX_WORDS else text

    captions = {}

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
                _log(f"Keyless transcript failed for {item['video_id']}: {e}")
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
                    f"{SCRAPECREATORS_BASE}/video/transcript",
                    params={"url": url},
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
                _log(f"Transcript fetch failed for {vid}: {e}")

    got = sum(1 for v in captions.values() if v)
    # Name the lane: "3/5 captions" hid whether a run spent 0 or 5 credits.
    _log(f"Got captions for {got}/{len(top_items)} videos "
         f"({len(spoken)} spoken transcripts free via yt-dlp, {paid} via ScrapeCreators)")
    return captions


def search_and_enrich(
    topic: str,
    from_date: str,
    to_date: str,
    depth: str = "default",
    token: str = None,
    hashtags: List[str] | None = None,
    creators: List[str] | None = None,
) -> Dict[str, Any]:
    """Full TikTok search: find videos, then fetch captions for top results.

    Uses expand_tiktok_queries() to generate multiple search queries,
    runs ScrapeCreators for each, and merges/deduplicates results by video ID.

    Args:
        topic: Search topic (raw topic, not planner's narrowed query)
        from_date: Start date (YYYY-MM-DD)
        to_date: End date (YYYY-MM-DD)
        depth: 'quick', 'default', or 'deep'
        token: ScrapeCreators API key
        hashtags: Optional list of TikTok hashtags to search (without #)
        creators: Optional list of TikTok creator handles to fetch videos from

    Returns:
        Dict with 'items' list. Each item has a 'caption_snippet' field.
    """
    core_topic = _extract_core_subject(topic)
    seen_ids: Set[str] = set()
    items: List[Dict[str, Any]] = []
    last_error = None

    # Step 0a: Hashtag search (high-signal, runs first)
    if hashtags and token:
        for hashtag in hashtags:
            raw_items = _hashtag_search(hashtag, token)
            parsed = _parse_items(raw_items, core_topic)
            for item in parsed:
                vid = item.get("video_id", "")
                if vid and vid not in seen_ids:
                    seen_ids.add(vid)
                    items.append(item)

    # Step 0b: Creator profile videos (high-signal)
    if creators and token:
        for creator in creators:
            raw_items = _profile_videos(creator, token)
            parsed = _parse_items(raw_items, core_topic)
            for item in parsed:
                vid = item.get("video_id", "")
                if vid and vid not in seen_ids:
                    seen_ids.add(vid)
                    items.append(item)

    # Step 1: Multi-query keyword search — run ScrapeCreators for each expanded query
    queries = expand_tiktok_queries(topic, depth)
    for q in queries:
        search_result = search_tiktok(q, from_date, to_date, depth, token)
        if search_result.get("error"):
            last_error = search_result["error"]
        for item in search_result.get("items", []):
            vid = item.get("video_id", "")
            if vid and vid not in seen_ids:
                seen_ids.add(vid)
                items.append(item)

    # Sort merged results by views descending
    items.sort(key=lambda x: x.get("engagement", {}).get("views", 0), reverse=True)

    if not items:
        return {"items": [], "error": last_error}

    # Step 2: Fetch captions for top N
    captions = fetch_captions(items, token, depth)

    # Step 3: Attach captions to items
    for item in items:
        vid = item["video_id"]
        caption = captions.get(vid)
        if caption:
            item["caption_snippet"] = caption

    return {"items": items, "error": last_error}


def parse_tiktok_response(response: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse TikTok search response to normalized format.

    Returns:
        List of item dicts ready for normalization.
    """
    return response.get("items", [])


def _tiktok_total_engagement(item: Dict[str, Any]) -> int:
    """Total engagement for ranking which posts deserve comment enrichment."""
    eng = item.get("engagement", {})
    return (eng.get("views", 0) or 0) + (eng.get("likes", 0) or 0) + (eng.get("comments", 0) or 0)


def enrich_with_comments(
    items: List[Dict[str, Any]],
    token: str,
    max_posts: int = 3,
    max_comments: int = 5,
) -> List[Dict[str, Any]]:
    """Enrich top TikTok posts with comment data from ScrapeCreators.

    For the top N posts by engagement, fetches comments via the SC API
    and attaches them as a ``top_comments`` field on each item. Mirrors
    youtube_yt.enrich_with_comments.

    Args:
        items: TikTok items from search_tiktok()
        token: ScrapeCreators API key
        max_posts: How many posts to enrich with comments
        max_comments: Max comments to keep per post

    Returns:
        Items list (mutated in place) with top_comments added to enriched items.
    """
    if not items or not token or max_posts <= 0:
        return items

    ranked = sorted(items, key=_tiktok_total_engagement, reverse=True)
    top_items = ranked[:max_posts]
    _log(f"Enriching comments for {len(top_items)} TikTok posts")

    from concurrent.futures import ThreadPoolExecutor, as_completed

    def _enrich_one(item: dict) -> bool:
        post_url = item.get("url", "")
        if not post_url:
            return False
        try:
            comments = _fetch_post_comments(post_url, token, max_comments)
            if comments:
                item["top_comments"] = comments
                return True
        except Exception as exc:
            _log(f"Comment enrichment failed for {post_url}: {exc}")
        return False

    enriched_count = 0
    with ThreadPoolExecutor(max_workers=min(4, len(top_items))) as executor:
        futures = {executor.submit(_enrich_one, item): item for item in top_items}
        for future in as_completed(futures):
            if future.result():
                enriched_count += 1

    _log(f"Enriched {enriched_count}/{len(top_items)} posts with comments")
    return items


def _fetch_post_comments(
    post_url: str,
    token: str,
    max_comments: int = 5,
) -> List[Dict[str, Any]]:
    """Fetch comments for a single TikTok post via ScrapeCreators.

    SC endpoint: GET /v1/tiktok/video/comments?url=<video_url>
    Response shape: { comments: [{text, user.nickname, digg_count, create_time, ...}], cursor, total }

    Args:
        post_url: Canonical TikTok post URL (share_url form works)
        token: ScrapeCreators API key
        max_comments: Maximum comments to return

    Returns:
        List of comment dicts with author, text, digg_count (likes), date.
        Empty list on any error — comment failures never crash the pipeline.
    """
    try:
        data = http.get(
            f"{SCRAPECREATORS_BASE}/video/comments",
            params={"url": post_url, "trim": "true"},
            headers=http.scrapecreators_headers(token),
            timeout=30,
            retries=2,
        )
    except Exception as exc:
        _log(f"Comment fetch error for {post_url}: {exc}")
        return []

    raw_comments = data.get("comments") or data.get("data") or []
    # Sort by digg_count desc so normalize sees the highest-signal first.
    raw_comments = sorted(
        raw_comments,
        key=lambda c: c.get("digg_count", 0) or 0,
        reverse=True,
    )
    out: List[Dict[str, Any]] = []
    for c in raw_comments[:max_comments]:
        text = c.get("text") or ""
        if not text:
            continue
        user = c.get("user") if isinstance(c.get("user"), dict) else {}
        # Prefer unique_id (the @handle) over nickname (display name) so
        # downstream render can cite @handle consistently across platforms.
        author = user.get("unique_id") or user.get("nickname") or ""
        create_time = c.get("create_time")
        date_str = ""
        if create_time:
            try:
                date_str = dates.timestamp_to_date(int(create_time)) or ""
            except (ValueError, TypeError):
                date_str = ""
        out.append({
            "author": author,
            "text": text[:400],
            "digg_count": c.get("digg_count", 0) or 0,
            "date": date_str,
        })
    return out
