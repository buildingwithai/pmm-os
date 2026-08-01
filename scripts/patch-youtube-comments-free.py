#!/usr/bin/env python3
"""Idempotent PMM-OS patch: YouTube comments are free, so stop charging for them.

Applied after every upstream sync (sync-research-engines.sh calls this), because
that script does `rm -rf skills/last30days/scripts` and would drop a direct edit.

THE INCONSISTENCY THIS CLOSES. `reach.sh yt-comments` reads a video's top comments
with yt-dlp: no key, no login, ~3s, with per-comment like counts. The last30days
engine reads the same comments through ScrapeCreators and gates them on
`SCRAPECREATORS_API_KEY AND 'youtube_comments' in INCLUDE_SOURCES` (env.py). Same
capability, same machine, same run — free in one lane and paid in the other. That
was a code gate, never a technical one.

Three changes:

1. `_fetch_comments_ytdlp()` — a keyless comment fetch, the same yt-dlp call
   reach.sh makes, returning the shape `_fetch_video_comments()` already returns
   so normalize/render/rerank see no difference.

2. `enrich_with_comments()` tries yt-dlp first and only reaches for the paid
   endpoint when the free one FAILED. It no longer returns early when there is no
   token — that early return is what made comments a paid feature.

3. `is_youtube_comments_available()` becomes: off if the user excluded it, on if
   yt-dlp is installed, otherwise the old key+INCLUDE_SOURCES rule for people who
   have a key but no yt-dlp.

THE EMPTY-vs-BLOCKED RULE, RUNNING BACKWARDS. Everywhere else in this repo the rule
is "never present a block as an empty result". Here it also runs the other way: when
yt-dlp exits 0 and the video genuinely has no comments, that is a FACT, and paying
ScrapeCreators to re-ask the same question buys a second `[]`. So the free lane
returns three distinct things — a list, `[]` (known empty), and `None` (unknown,
the fetch failed) — and only `None` opens the paid lane.

EXCLUDE_SOURCES=youtube_comments NOW ACTUALLY WORKS. SKILL.md documents it as the
off switch, but `is_youtube_comments_available()` never read EXCLUDE_SOURCES and
pipeline.py only applies that list to whole sources, never to `*_comments`. It was
a no-op against a default-off feature, which is why nobody noticed. Turning the
feature default-ON makes the off switch load-bearing, so it is wired up here.

Measured 2026-07-31 on youtube.com/watch?v=dQw4w9WgXcQ: 8 comments in 2.8s, keyless,
each with a real `like_count` (the pinned one at 280000) and a unix `timestamp`.

Runnable check: scripts/test_youtube_comments_free.py (wired into the validator).
"""
import pathlib
import py_compile
import re
import sys
import tempfile

LIB = pathlib.Path(__file__).resolve().parent.parent / "skills/last30days/scripts/lib"
MARK = "PMM-OS-YT-COMMENTS-FREE"

# ------------------------------------------------------------------ youtube_yt.py

YT_REPLACEMENT = f'''# {MARK} (re-applied by scripts/patch-youtube-comments-free.py after upstream sync)
_COMMENT_TIMEOUT = 45      # seconds; comment pagination is slower than a caption fetch
_COMMENT_OVERFETCH = 2     # some roots are blank/deleted; ask for more than we keep
# yt-dlp's max_comments is `total,max_parents,max_replies,max_replies_per_thread`, and
# the shape everyone copies — `N,all,N` — is a trap. Measured 2026-07-31 on
# dQw4w9WgXcQ: `20,all,20` returned 20 comments of which exactly ONE was top-level,
# the other 19 being replies to it. `20,20,0` returned 20 top-level comments. A brief
# built on the first form quotes a single thread's argument as "what viewers said".
_COMMENT_ARGS = "youtube:comment_sort=top;max_comments={{n}},{{n}},0"


def _parse_ytdlp_comments(raw: List[Dict[str, Any]],
                          max_comments: int) -> List[Dict[str, Any]]:
    """Map yt-dlp's comment dicts onto the shape _fetch_video_comments returns.

    normalize._remap_comments reads `likes` and `text` for YouTube, so the free and
    paid lanes MUST agree on those two keys or a keyless run silently renders every
    comment with score 0.
    """
    roots = [c for c in raw if isinstance(c, dict) and c.get("parent") == "root"]
    # Belt and braces over _COMMENT_ARGS: that arg form is what SHOULD keep replies
    # out, and its semantics are surprising enough (see above) to be worth not
    # trusting. A video whose top-level comments all got filtered but whose replies
    # did not is still better evidence than nothing, so only fall back when empty.
    pool = roots or [c for c in raw if isinstance(c, dict)]
    pool.sort(key=lambda c: c.get("like_count") or 0, reverse=True)
    out: List[Dict[str, Any]] = []
    for c in pool[:max_comments]:
        text = (c.get("text") or "").strip()
        if not text:
            continue
        out.append({{
            "author": str(c.get("author") or ""),
            "text": text[:400],
            "likes": c.get("like_count") or 0,
            # `_time_text` is a relative string ("1 year ago"); the unix timestamp is
            # the only one that survives into a dated brief.
            "date": dates.timestamp_to_date(c.get("timestamp")) or "",
        }})
    return out


def _fetch_comments_ytdlp(
    video_id: str,
    max_comments: int = 5,
) -> Optional[List[Dict[str, Any]]]:
    """Fetch a video's top comments keylessly with yt-dlp. No API key, no login.

    Returns THREE distinguishable things, because the difference decides whether
    the caller spends a ScrapeCreators credit:

        [{{...}}]  comments, highest-liked first
        []        yt-dlp succeeded and this video genuinely has none (comments
                  disabled, or nobody commented). A FACT. Paying to re-ask buys
                  a second empty list.
        None      the fetch FAILED — bot wall, 429, timeout, no binary. UNKNOWN,
                  which is the only case worth paying to resolve.

    ponytail: the SSH-egress lane (LAST30DAYS_YOUTUBE_SSH_HOST) is skipped rather
    than supported — yt-dlp writes the comments to a JSON file, and that file would
    land on the remote host where this process cannot read it. Ceiling: keyless
    comments are unavailable on SSH-routed runs, which fall through to the paid
    lane exactly as they did before. Upgrade path: mirror
    _fetch_transcript_ytdlp_via_ssh's `mktemp && ... && cat` pipeline.
    """
    if _ytdlp_ssh_host():
        return None
    fetched = max(max_comments * _COMMENT_OVERFETCH, max_comments)
    with tempfile.TemporaryDirectory() as temp_dir:
        cmd = [
            "yt-dlp",
            "--ignore-config",
            "--no-cookies-from-browser",
            "--skip-download",
            "--write-comments",
            "--write-info-json",
            "--no-write-subs",
            "--no-warnings",
            "--extractor-args", _COMMENT_ARGS.format(n=fetched),
            "-o", f"{{temp_dir}}/%(id)s",
            f"https://www.youtube.com/watch?v={{video_id}}",
        ]
        try:
            result = subproc.run_with_timeout(cmd, timeout=_COMMENT_TIMEOUT)
        except subproc.SubprocTimeout:
            _log(f"yt-dlp comments timed out after {{_COMMENT_TIMEOUT}}s for {{video_id}}")
            return None
        except FileNotFoundError:
            return None
        except OSError as exc:
            _log(f"yt-dlp comments could not start for {{video_id}}: {{exc}}")
            return None

        info = Path(temp_dir) / f"{{video_id}}.info.json"
        raw = None
        if info.is_file():
            try:
                raw = json.loads(info.read_text(encoding="utf-8")).get("comments")
            except (json.JSONDecodeError, OSError, UnicodeDecodeError) as exc:
                _log(f"yt-dlp wrote unreadable comment JSON for {{video_id}}: {{exc}}")
                raw = None

    if raw:
        return _parse_ytdlp_comments(raw, max_comments)
    if result.returncode == 0 and raw is not None:
        # Exit 0 AND a parsed (empty) comments list == genuinely no comments.
        return []
    # No file, unparseable, or a non-zero exit: yt-dlp did not answer the question.
    # Never call that "no comments" — that is the fabricated-fact failure, and here
    # it would also suppress the paid retry that could still get a real answer.
    stderr = (result.stderr or "").strip()
    _log(f"yt-dlp comments unavailable for {{video_id}} "
         f"(exit {{result.returncode}}): {{stderr.splitlines()[-1][:160] if stderr else 'no output'}}")
    return None


def enrich_with_comments(
    items: List[Dict[str, Any]],
    token: str = "",
    max_videos: int = 3,
    max_comments: int = 5,
) -> List[Dict[str, Any]]:
    """Enrich top YouTube videos with comment data — keyless first, paid as fallback.

    {MARK}: upstream opened with `if not items or not token`, which made comment
    text a paid feature for a lane yt-dlp serves free. `token` is now optional and
    only spent when the free fetch could not answer.

    Args:
        items: YouTube items from search_and_transcribe() or search_youtube_sc()
        token: Optional ScrapeCreators API key, used ONLY where yt-dlp failed
        max_videos: How many videos to enrich with comments
        max_comments: Max comments to keep per video

    Returns:
        Items list (mutated in place) with top_comments added to enriched items.
    """
    if not items or max_videos <= 0:
        return items

    ranked = sorted(items, key=_total_engagement, reverse=True)
    top_items = ranked[:max_videos]
    _log(f"Enriching comments for {{len(top_items)}} YouTube videos")

    from concurrent.futures import ThreadPoolExecutor, as_completed

    def _enrich_one(item: dict) -> Optional[str]:
        video_id = item.get("video_id", "")
        if not video_id:
            return None
        free = None
        try:
            free = _fetch_comments_ytdlp(video_id, max_comments)
        except Exception as exc:
            _log(f"Keyless comment fetch failed for {{video_id}}: {{exc}}")
        if free:
            item["top_comments"] = free
            return "free"
        if free == []:
            # Known-empty. Spending a credit here buys a second empty list.
            return None
        if not token:
            return None
        try:
            paid = _fetch_video_comments(video_id, token, max_comments)
            if paid:
                item["top_comments"] = paid
                return "paid"
        except Exception as exc:
            _log(f"Comment enrichment failed for {{video_id}}: {{exc}}")
        return None

    lanes = []
    with ThreadPoolExecutor(max_workers=min(4, len(top_items))) as executor:
        futures = {{executor.submit(_enrich_one, item): item for item in top_items}}
        for future in as_completed(futures):
            lane = future.result()
            if lane:
                lanes.append(lane)

    free_n = lanes.count("free")
    paid_n = lanes.count("paid")
    # Name the lane in the log: "3/3 enriched" hid whether the run spent 0 or 3
    # credits, which is the only number a BYO-key user is watching.
    _log(f"Enriched {{len(lanes)}}/{{len(top_items)}} videos with comments "
         f"({{free_n}} keyless via yt-dlp, {{paid_n}} via ScrapeCreators)")
    return items
'''

# ------------------------------------------------------------------------ env.py

ENV_REPLACEMENT = f'''def is_youtube_comments_available(config: dict[str, Any]) -> bool:
    """Check if YouTube comment enrichment is available.

    {MARK} (re-applied by scripts/patch-youtube-comments-free.py after upstream
    sync — see that file for what upstream got wrong).

    Upstream required ``SCRAPECREATORS_API_KEY`` AND ``youtube_comments`` in
    ``INCLUDE_SOURCES``. Both were code gates on a capability yt-dlp serves free:
    ``reach.sh yt-comments`` in this same plugin reads the identical comments with
    no key at all. And ``INCLUDE_SOURCES`` lives in a file written once at setup and
    never revisited, so in practice the feature was off even for people paying for it.

    The order matters:
      1. EXCLUDE_SOURCES wins outright — it is the documented off switch (SKILL.md),
         and it never actually worked before because nothing read it here.
      2. yt-dlp installed -> free lane, no key, no opt-in string.
      3. Otherwise the old rule, for a keyed machine with no yt-dlp.
    """
    if 'youtube_comments' in _parse_exclude_sources(config):
        return False
    if is_ytdlp_available():
        return True
    if not config.get('SCRAPECREATORS_API_KEY'):
        return False
    return 'youtube_comments' in _parse_include_sources(config)
'''


# ----------------------------------------------------------------------- SKILL.md
# The agent reads this line at runtime to decide whether to expect comments at all.
# Left stale, every keyless run would be told comments need a key it does not have.
SKILL = LIB.parent.parent / "SKILL.md"
OLD_DOC = ("(default-on once a ScrapeCreators key is set; "
           "suppress via `EXCLUDE_SOURCES=youtube_comments`)")
NEW_DOC = ("(default-on and FREE — read with yt-dlp, no key; falls back to "
           "ScrapeCreators only where the keyless fetch failed; "
           "suppress via `EXCLUDE_SOURCES=youtube_comments`)")


def replace_function(src: str, name: str, replacement: str, what: str):
    """Swap one top-level function, from its `def` to the next top-level def/decorator.

    Function-shaped anchors rather than string surgery: the bodies here are
    re-indented and re-flowed across the change, and a dozen anchored substitutions
    would rot on the first upstream reformat.
    """
    start = re.search(rf"^def {name}\(", src, re.M)
    if not start:
        return None, f"ANCHOR NOT FOUND (def {name}) in {what} — upstream changed, update patcher"
    nxt = re.search(r"^(def |@)", src[start.end():], re.M)
    end = start.end() + nxt.start() if nxt else len(src)
    return src[:start.start()] + replacement + "\n\n" + src[end:], None


def write_if_valid(path: pathlib.Path, src: str) -> bool:
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as t:
        t.write(src)
    try:
        py_compile.compile(t.name, doraise=True, cfile=tempfile.mktemp())
    except py_compile.PyCompileError as e:
        print(f"PATCH WOULD PRODUCE INVALID PYTHON — {path.name} not written: {e}")
        return False
    finally:
        pathlib.Path(t.name).unlink(missing_ok=True)
    path.write_text(src)
    return True


def main() -> int:
    if "--check" in sys.argv:
        for name in ("youtube_yt.py", "env.py"):
            p = LIB / name
            if not p.is_file() or MARK not in p.read_text():
                print(f"NOT APPLIED: {MARK} missing from {name} "
                      f"— run scripts/patch-youtube-comments-free.py")
                return 1
        if SKILL.is_file() and OLD_DOC in SKILL.read_text():
            print("NOT APPLIED: SKILL.md still says comments need a ScrapeCreators key")
            return 1
        print(f"applied: {MARK} in youtube_yt.py, env.py and SKILL.md")
        return 0

    yt, env = LIB / "youtube_yt.py", LIB / "env.py"
    if not yt.exists() or not env.exists():
        print(f"skip (missing engine lib): {LIB}")
        return 0

    yt_src, env_src = yt.read_text(), env.read_text()
    if MARK in yt_src and MARK in env_src:
        print("already patched: youtube_yt.py, env.py")
        return 0

    yt_src, err = replace_function(yt_src, "enrich_with_comments", YT_REPLACEMENT, "youtube_yt.py")
    if err:
        print(err)
        return 1
    # `Path` is imported (pathlib.Path) and used by the transcript lane already;
    # assert it rather than assume, since a missing name only fails at call time.
    for need in ("from pathlib import Path", "import json", "import tempfile",
                 "from . import dates, http, log, subproc"):
        if need not in yt_src:
            print(f"MISSING IMPORT in youtube_yt.py: {need!r} — update patcher")
            return 1

    env_src, err = replace_function(env_src, "is_youtube_comments_available",
                                    ENV_REPLACEMENT, "env.py")
    if err:
        print(err)
        return 1
    for need in ("def _parse_exclude_sources", "def is_ytdlp_available"):
        if need not in env_src:
            print(f"MISSING HELPER in env.py: {need!r} — update patcher")
            return 1

    if not write_if_valid(yt, yt_src) or not write_if_valid(env, env_src):
        return 1

    # Prose, so a miss is a warning rather than a hard failure — the code is already
    # correct at this point, and an upstream reword must not block the sync.
    if SKILL.is_file():
        doc = SKILL.read_text()
        if OLD_DOC in doc:
            SKILL.write_text(doc.replace(OLD_DOC, NEW_DOC))
        elif NEW_DOC not in doc:
            print("  ! SKILL.md: the comment-tier sentence moved — reword it by hand")

    print("patched: youtube_yt.py (keyless comment lane), env.py (gate is free + EXCLUDE_SOURCES)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
