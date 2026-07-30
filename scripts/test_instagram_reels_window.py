#!/usr/bin/env python3
"""One runnable check for the patched Instagram Reels keyword search. No network.

Guards the two defects scripts/patch-instagram-reels-search.py exists to fix:
  1. an empty date window returned every out-of-window reel, unlabelled — stale posts
     presented as last-30-days evidence
  2. `date_posted` and `page` were never sent, so the engine pulled page 1 of an
     all-time result set

Needs the engine interpreter (3.12+), so it resolves it the same way everything else
does rather than assuming `python3` is new enough — on stock macOS it is 3.9 and
lib/http.py fails to import on `int | None`.
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
from lib import instagram as ig

class FakeHTTPError(Exception):
    status_code = 500
ig.http.HTTPError = FakeHTTPError

def reel(code, date, plays, views):
    return {"shortcode": code, "caption": {"text": f"ai note takers {code}"},
            "taken_at": date, "video_play_count": plays, "video_view_count": views,
            "like_count": 10, "comment_count": 2, "owner": {"username": "someone"},
            "product_type": "clips", "video_duration": 30.0}

def ok(msg):
    print("  ok  " + msg)

W = ("2026-07-01", "2026-07-31")
calls = []

# --- the window and pagination actually reach the API -------------------------
def paged(url, params=None, **kw):
    calls.append(dict(params))
    return {"page1": {"reels": [reel("A", "2026-07-20T00:00:00.000Z", 100, 60),
                                reel("B", "2026-07-25T00:00:00.000Z", 900, 500)]},
            "page2": {"reels": [reel("C", "2026-07-28T00:00:00.000Z", 300, 200)]},
            }.get(f"page{params.get('page', 1)}", {"reels": []})

ig.http.get = paged
r = ig.search_instagram("what people say about AI note takers", *W, depth="deep", token="k")
assert r.get("error") is None, r
assert len(r["items"]) == 3, r
assert all(c.get("date_posted") == "last-month" for c in calls), \
    "the API's own date filter was never sent: " + repr(calls)
assert [c.get("page") for c in calls] == [1, 2, 3], \
    "must page through the window, not take page 1 of all time: " + repr(calls)
ok("date_posted=last-month on every call; pages walked until empty")

assert r["items"][0]["engagement"]["views"] == 900, "must rank by plays, descending"
eng = r["items"][0]["engagement"]
assert eng["plays"] == 900 and eng["video_views"] == 500, eng
ok("plays and views stay distinct (the API reports different numbers for each)")

# --- THE ONE THAT MATTERS ----------------------------------------------------
calls.clear()
def stale(url, params=None, **kw):
    calls.append(dict(params))
    return {"reels": [reel("OLD", "2023-01-05T00:00:00.000Z", 9999, 9999)]} \
        if params.get("page", 1) == 1 else {"reels": []}
ig.http.get = stale
r = ig.search_instagram("ai note takers", *W, depth="quick", token="k")
assert r["items"] == [], "out-of-window reels must NEVER be returned: " + repr(r)
assert "no Instagram reels in 2026-07-01..2026-07-31" in r["error"], r
ok("an empty window returns items=[] WITH an error — never stale reels")

# --- partial failure must not discard what already worked --------------------
def flaky(url, params=None, **kw):
    if params.get("page", 1) == 1:
        return {"reels": [reel("A", "2026-07-20T00:00:00.000Z", 100, 60)]}
    raise RuntimeError("boom")
ig.http.get = flaky
r = ig.search_instagram("ai note takers", *W, depth="deep", token="k")
assert len(r["items"]) == 1 and r.get("error") is None, r
ok("a page-2 failure keeps page 1 instead of discarding the run")

def dead(url, params=None, **kw):
    raise RuntimeError("connection refused")
ig.http.get = dead
r = ig.search_instagram("x", *W, token="k")
assert r["items"] == [] and "connection refused" in r["error"], r
ok("a page-1 failure reports the error rather than returning silence")

# --- the documented 500-on-multi-token quirk ---------------------------------
calls.clear()
n = {"i": 0}
def five_hundred(url, params=None, **kw):
    calls.append(dict(params)); n["i"] += 1
    if n["i"] > 8:
        return {"reels": []}
    if " " in params["query"]:
        raise FakeHTTPError()
    return {"reels": [reel("H", "2026-07-20T00:00:00.000Z", 5, 5)]} \
        if params.get("page", 1) == 1 else {"reels": []}
ig.http.get = five_hundred
r = ig.search_instagram("ai note takers", *W, depth="quick", token="k")
assert len(r["items"]) == 1, r
assert " " not in calls[1]["query"], calls[:2]
assert len(calls) < 8, "must switch query form once, not retry forever: " + repr(calls)
ok("a 500 on a multi-token query switches to hashtag form once, then proceeds")

# --- degenerate inputs -------------------------------------------------------
ig.http.get = lambda *a, **k: {"reels": []}
r = ig.search_instagram("ai note takers", *W, token="k")
assert r["items"] == [] and "no reels" in r["error"], r
ok("zero results from the API is an error, not an empty success")

assert ig.search_instagram("x", *W)["error"].startswith("No SCRAPECREATORS")
ok("no key -> a named error, not a crash")

print("✓ all instagram reels-window cases pass — stale reels can never reach a brief")
'''


def engine_python() -> str:
    """Same resolver bin/pmm-research uses — config/python-policy.json is the spec."""
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

src = f"SCRIPTS = {json.dumps(str(ENGINE))}\n" + BODY
p = subprocess.run([py, "-c", src], capture_output=True, text=True)
print(p.stdout, end="")
if p.returncode != 0:
    print(p.stderr, file=sys.stderr)
sys.exit(p.returncode)
