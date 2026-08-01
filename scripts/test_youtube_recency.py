#!/usr/bin/env python3
"""One runnable check for YouTube recency. No network.

A last30days brief is a 30-day window and YouTube ranks by relevance, not recency.
Guards what scripts/patch-youtube-recency.py exists to fix:

  1. A SEARCH CAN RETURN THE WRONG TOPIC. yt-dlp falls through to YouTube's trending
     feed when a URL does not resolve to a search, and reports success. `_drop_offtopic`
     is the floor that stops Avengers trailers entering a note-taker brief.
     `_yt_search_url` is tested but NOT wired in — see the patcher for why.
  2. THE WINDOW HAD ONE WALL. `>= from_date` only, so a video dated after `to_date`
     passed a filter that was supposed to be a window.
  3. "KEEPING ALL" — the third sighting, after Instagram Reels and TikTok. Here it is
     kept deliberately (evergreen YouTube is often the best evidence) but the items
     are MARKED, and in-window ones sort first so a cap never drops a fresh video
     for a stale one.
"""
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ENGINE = ROOT / "skills/last30days/scripts"

BODY = r'''
import sys
sys.path.insert(0, SCRIPTS)
from lib import youtube_yt as yt
yt._log = lambda m: None

def ok(msg): print("  ok  " + msg)

W = ("2026-07-01", "2026-07-31")

# --- the search actually asks YouTube for the window ---------------------------
u = yt._yt_search_url("ai note taker", *W)
assert u.startswith("https://www.youtube.com/results?search_query=ai+note+taker")
assert "sp=" in u, u
assert yt._YT_SP["month"].replace("%3D", "%3D") in u or "EgIIBA" in u, u
ok("a 30-day window builds a results URL carrying YouTube's upload-date facet")

assert "EgIIAw" in yt._yt_search_url("x", "2026-07-25", "2026-07-31"), "<=8d -> week"
assert "EgIIBA" in yt._yt_search_url("x", *W), "30d -> month"
assert "EgIIBQ" in yt._yt_search_url("x", "2025-07-31", "2026-07-31"), ">45d -> year"
ok("the bucket follows the window width: week / month / year")

assert "EgIIBA" in yt._yt_search_url("x", "nope", "also-nope"), "bad dates must not crash"
assert "search_query=a%2Fb+%26c" in yt._yt_search_url("a/b &c", *W), yt._yt_search_url("a/b &c", *W)
ok("unparseable dates fall back to month, and the query is URL-encoded")

# --- the window has two walls now ----------------------------------------------
def v(d, vid="x"): return {"date": d, "video_id": vid}

out = yt._apply_window([v("2026-07-15"), v("2024-01-01"), v("2027-01-01"), v(None)], *W)
assert out[0]["date"] == "2026-07-15", [i["date"] for i in out]
assert out[0].get("out_of_window") is None, out[0]
assert all(i.get("out_of_window") for i in out[1:]), out
assert all(i.get("date_confidence") == "low" for i in out[1:]), out
ok("a video dated AFTER to_date is out of window — upstream compared one end only")
ok("a dateless video is out of window, not silently in it")

assert [i["date"] for i in yt._apply_window(
    [v("2024-01-01"), v("2026-07-15"), v("2023-01-01"), v("2026-07-02")], *W)][:2] \
    == ["2026-07-15", "2026-07-02"]
ok("in-window videos sort first, so a cap spends its budget on fresh ones")

# The mild case, on purpose: unlike Reels and TikTok this does NOT return empty.
stale = yt._apply_window([v("2024-01-01"), v("2023-05-05")], *W)
assert len(stale) == 2 and all(i["out_of_window"] for i in stale), stale
ok("zero in-window videos keeps the evergreen ones — but every one is MARKED")

assert yt._apply_window([], *W) == []
ok("an empty result is an empty list, not a crash")

# --- the relevance floor: a wrong result set is a FAILED search -----------------
def r(rel, title=""): return {"relevance": rel, "title": title, "date": "2026-07-15"}

trending = [r(0.0, "Avengers: Doomsday Trailer BREAKDOWN"), r(0.0, "House of the Dragon")]
assert yt._drop_offtopic(trending, "ai note taker") == []
ok("a result set that scores zero against the topic is DISCARDED, not returned")

mixed = [r(1.0, "Best AI Note Taker 2026"), r(0.0, "Avengers Trailer"), r(0.4, "Notetakers")]
kept = yt._drop_offtopic(mixed, "ai note taker")
assert [i["relevance"] for i in kept] == [1.0, 0.4], kept
ok("off-topic results are dropped while partial matches survive")

assert yt._drop_offtopic([], "x") == []
assert yt._drop_offtopic([{"title": "no relevance key"}], "x") == []
ok("a missing relevance score is treated as off-topic, not as a pass")

print("✓ all youtube-recency cases pass — the window has two walls, and a wrong topic is a failed search")
'''


def engine_python() -> str:
    r = subprocess.run(
        ["node", "-e",
         "import('./bin/lib/resolve-python.mjs').then(m=>"
         "console.log(JSON.stringify(m.resolvePython({allowInstall:false}))))"],
        cwd=ROOT, capture_output=True, text=True)
    try:
        return json.loads(r.stdout.strip()).get("path") or ""
    except Exception:
        return ""


py = engine_python()
if not py:
    print("SKIP: no Python 3.12+ resolved — cannot import the engine's lib/http.py")
    sys.exit(0)

p = subprocess.run([py, "-c", f"SCRIPTS = {json.dumps(str(ENGINE))}\n" + BODY],
                   capture_output=True, text=True)
print(p.stdout, end="")
if p.returncode != 0:
    print(p.stderr, file=sys.stderr)
sys.exit(p.returncode)
