#!/usr/bin/env python3
"""Idempotent PMM-OS patch: make Instagram Reels search actually search the window.

Applied after every upstream sync (sync-research-engines.sh calls this), because
that script does `rm -rf skills/last30days/scripts` and would drop a direct edit.

`search_instagram()` calls ScrapeCreators GET /v2/instagram/reels/search — a KEYWORD
search over Reels, and the one route in the whole stack that answers "give me a theme,
get back the related Reels". Two defects made it far weaker than the API it wraps.

1. THE DATE FILTER WAS DISCARDED WHEN IT WAS INCONVENIENT. The window filter ran
   client-side, and when NOTHING fell inside [from_date, to_date] the else-branch
   logged "keeping all N" and returned every out-of-range reel — no error, no gap
   marker, sorted by views like a normal result. A last30days brief would print reels
   of any age as last-30-days evidence. That is the fabricated-fact failure this
   plugin exists to prevent, and it was in main. An empty result you can see beats a
   number you cannot trust.

2. THE API'S OWN DATE FILTER WAS NEVER SENT. The endpoint documents
   `date_posted: last-hour|last-day|last-week|last-month|last-year` and `page` 1-11
   (12+ is a documented 400). Neither was passed, so the engine pulled page 1 of an
   ALL-TIME result set and threw almost all of it away client-side — spending its
   relevance budget rather than its credits, and capping `deep` (40 results) at
   whatever one unfiltered page happened to contain.

Fixed by replacing the function wholesale rather than by string surgery: the upstream
body is re-indented across the change, and six anchored substitutions would be far
more likely to rot than one function-shaped anchor.

ponytail: the client-side window filter is kept as well as the server one. `last-month`
is a coarse bucket and the brief's window is exact, so both are needed; the cost is one
list comprehension.

Verified against docs.scrapecreators.com/v2/instagram/reels/search.md on 2026-07-30:
`date_posted` enum, `page` 1-11, and a response carrying `taken_at`, `video_play_count`,
`video_view_count`, `like_count`, `comment_count`, `product_type: "clips"`.
"""
import pathlib
import py_compile
import re
import sys
import tempfile

LIB = pathlib.Path(__file__).resolve().parent.parent / "skills/last30days/scripts/lib"
MARK = "PMM-OS-IG-REELS-WINDOW"

REPLACEMENT = '''def search_instagram(
    topic: str,
    from_date: str,
    to_date: str,
    depth: str = "default",
    token: str = None,
) -> Dict[str, Any]:
    """Search Instagram Reels by KEYWORD via ScrapeCreators, inside the date window.

    PMM-OS-IG-REELS-WINDOW (re-applied by scripts/patch-instagram-reels-search.py
    after every upstream sync — see that file for what upstream got wrong).

    Args:
        topic: Search topic
        from_date: Start date (YYYY-MM-DD)
        to_date: End date (YYYY-MM-DD)
        depth: 'quick', 'default', or 'deep'
        token: ScrapeCreators API key

    Returns:
        Dict with 'items' list and optional 'error'. An empty window returns
        items=[] WITH an error string — never out-of-window reels.
    """
    if not token:
        return {"items": [], "error": "No SCRAPECREATORS_API_KEY configured"}

    config = DEPTH_CONFIG.get(depth, DEPTH_CONFIG["default"])
    core_topic = _extract_core_subject(topic)
    want = config["results_per_page"]

    _log(f"Searching Instagram reels for '{core_topic}' "
         f"(depth={depth}, want={want}, window={from_date}..{to_date})")

    def _page(query: str, page: int):
        """One request. Returns the raw list, or raises."""
        data = http.get(
            f"{SCRAPECREATORS_BASE}/v2/instagram/reels/search",
            params={"query": query, "date_posted": _IG_WINDOW, "page": page},
            headers=http.scrapecreators_headers(token),
            timeout=30,
            retries=2,
        )
        return data.get("reels") or data.get("items") or data.get("data") or []

    raw_items = []
    query = core_topic
    page = 1
    while len(raw_items) < want and page <= _IG_MAX_PAGE:
        try:
            batch = _page(query, page)
        except http.HTTPError as e:
            # SC's v2 reels search wraps Google Search and 500s frequently on
            # multi-token queries; single tokens hit the stable hashtag-page path.
            # Switch query form once, then keep going from the same page.
            if (getattr(e, "status_code", None) == 500 and " " in query
                    and query == core_topic):
                query = _to_hashtag_form(core_topic)
                _log(f"IG search 500 on '{core_topic}', retrying as '{query}'")
                continue
            if page == 1:
                _log(f"ScrapeCreators error: {e}")
                return {"items": [], "error": f"{type(e).__name__}: {e}"}
            _log(f"IG search stopped at page {page}: {e}")
            break
        except Exception as e:
            if page == 1:
                _log(f"ScrapeCreators error: {e}")
                return {"items": [], "error": f"{type(e).__name__}: {e}"}
            _log(f"IG search stopped at page {page}: {e}")
            break
        if not batch:
            break
        raw_items.extend(batch)
        page += 1

    if not raw_items:
        return {"items": [], "error":
                f"Instagram returned no reels for '{core_topic}' in the last month"}

    items = _parse_items(raw_items[:want], core_topic)

    # Exact window, on top of the server's coarse `last-month` bucket.
    in_range = [i for i in items if i["date"] and from_date <= i["date"] <= to_date]
    if not in_range:
        # A hole the receipt can see. Upstream returned everything here instead,
        # which put pre-window reels into last-30-days briefs as current evidence.
        _log(f"Discarded all {len(items)} reels — none inside {from_date}..{to_date}")
        return {"items": [], "error":
                f"no Instagram reels in {from_date}..{to_date} "
                f"({len(items)} returned, all outside the window)"}
    if len(in_range) < len(items):
        _log(f"Filtered {len(items) - len(in_range)} reels outside date range")
    items = in_range

    # Reels are ranked by plays, not likes.
    items.sort(key=lambda x: x["engagement"]["views"], reverse=True)
    _log(f"Found {len(items)} Instagram reels across {page - 1} page(s)")
    return {"items": items}
'''

PREAMBLE = f'''
# {MARK} (re-applied by scripts/patch-instagram-reels-search.py after upstream sync)
# SC's date_posted enum; "last-month" is the only value that covers a 30-day brief.
_IG_WINDOW = "last-month"
_IG_MAX_PAGE = 11          # page 12 or greater is a documented HTTP 400
'''

# Upstream coalesced plays and views into one number. The API's own sample returns
# 21808 views next to 46018 plays for the same reel, so two briefs could silently be
# measuring different things. Plays stay the ranking metric; views ride alongside.
OLD_PC = ('        play_count = raw.get("video_play_count") or '
          'raw.get("video_view_count") or raw.get("play_count") or 0')
NEW_PC = (f'        # {MARK}: plays != views (docs sample: 21808 views, 46018 plays).\n'
          '        play_count = raw.get("video_play_count") or raw.get("play_count") or 0\n'
          '        view_count = raw.get("video_view_count") or 0\n'
          '        if not play_count:\n'
          '            play_count = view_count')
OLD_ENG = '''                "views": play_count,
                "likes": like_count,
                "comments": comment_count,'''
NEW_ENG = '''                "views": play_count,
                "plays": play_count,
                "video_views": view_count,
                "likes": like_count,
                "comments": comment_count,'''


def main() -> int:
    p = LIB / "instagram.py"
    if not p.exists():
        print(f"skip (missing): {p}")
        return 0
    s = p.read_text()
    if MARK in s:
        print("already patched: instagram.py")
        return 0

    # Anchor 1: the whole function, from its def to the next top-level def/EOF.
    start = re.search(r"^def search_instagram\(", s, re.M)
    if not start:
        print("ANCHOR NOT FOUND (def search_instagram) — upstream changed, update patcher")
        return 1
    nxt = re.search(r"^(def |@)", s[start.end():], re.M)
    end = start.end() + nxt.start() if nxt else len(s)
    s = s[: start.start()] + REPLACEMENT + "\n\n" + s[end:]

    # Anchor 2: the module constants, after DEPTH_CONFIG's closing brace.
    dc = re.search(r"^DEPTH_CONFIG = \{", s, re.M)
    if not dc:
        print("ANCHOR NOT FOUND (DEPTH_CONFIG) — update patcher")
        return 1
    close = re.search(r"^\}", s[dc.start():], re.M)
    if not close:
        print("ANCHOR NOT FOUND (DEPTH_CONFIG close) — update patcher")
        return 1
    cut = s.index("\n", dc.start() + close.start())
    s = s[: cut + 1] + PREAMBLE + s[cut + 1:]

    # Anchor 3 + 4: keep plays and views distinct through _parse_items.
    for old, new, what in ((OLD_PC, NEW_PC, "play/view coalescing"),
                           (OLD_ENG, NEW_ENG, "engagement dict")):
        if s.count(old) != 1:
            print(f"ANCHOR NOT UNIQUE ({s.count(old)}x) — update patcher: {what}")
            return 1
        s = s.replace(old, new)

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
    print("patched: instagram.py (server-side window + pagination + honest empty window)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
