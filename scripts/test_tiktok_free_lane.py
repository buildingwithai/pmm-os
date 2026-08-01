#!/usr/bin/env python3
"""One runnable check for TikTok's free hydration lane. No network, no key.

Guards what scripts/patch-tiktok-free-lane.py exists to fix:

  1. THE CREDITS. `_profile_videos()` and `fetch_captions()` paid ScrapeCreators for a
     creator's video list and for ASR transcripts — both of which yt-dlp returns free.
     The assertions that matter are the negative ones: with yt-dlp working, the paid
     endpoint must not be touched at all.
  2. THE WINDOW. `search_tiktok()` kept every OUT-OF-WINDOW video when none fell inside
     it, and returned them with no error — videos of any age as last-30-days evidence.
     Identical in shape to the Instagram Reels defect, in a different file.
  3. THE SHAPE. yt-dlp's entries are mapped onto ScrapeCreators' aweme shape so
     `_parse_items` stays the one place that decides what a TikTok item is. If that
     mapping drifts, a keyless run silently loses dates, engagement or hashtags.
  4. BLOCKED IS NOT EMPTY. Zero videos from yt-dlp is reported as a failed fetch, not
     as an empty account.

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
import json, pathlib, sys
sys.path.insert(0, SCRIPTS)
from lib import subproc, tiktok as tt

def ok(msg):
    print("  ok  " + msg)

# Capture the engine's own log instead of letting it interleave with the results —
# and so the receipt lines can be asserted on, since "how many credits did that
# spend" is the question this whole patch exists to answer.
LOGS = []
tt._log = LOGS.append

W = ("2026-07-01", "2026-07-31")

def entry(vid, ts=1785169549, views=820100, desc="a caption #space #nasa"):
    return {"id": vid, "description": desc, "title": desc[:12] + "...",
            "timestamp": ts, "webpage_url": f"https://www.tiktok.com/@nasa/video/{vid}",
            "uploader": "nasa", "view_count": views, "like_count": 71600,
            "comment_count": 8126, "repost_count": 1385, "duration": 13}

# --- the aweme mapping _parse_items depends on ---------------------------------
a = tt._as_aweme(entry("777"), "nasa")
assert a["aweme_id"] == "777" and a["create_time"] == 1785169549
assert a["desc"] == "a caption #space #nasa", "must use description, NOT the truncated title"
assert a["statistics"] == {"play_count": 820100, "digg_count": 71600,
                           "comment_count": 8126, "share_count": 1385}, a["statistics"]
ok("yt-dlp entries map onto the aweme shape, full caption and all four counts")

item = tt._parse_items([a], "nasa space")[0]
assert item["date"] == "2026-07-27", item["date"]
assert item["author_name"] == "nasa"
assert item["engagement"]["views"] == 820100
assert item["url"] == "https://www.tiktok.com/@nasa/video/777"
assert item["hashtags"] == ["space", "nasa"], item["hashtags"]
ok("_parse_items reads the mapped shape unchanged — date, author, url, hashtags")

assert "video" not in a, "duration must be OMITTED (SC uses ms, yt-dlp seconds)"
assert tt._parse_items([a], "x")[0]["duration"] is None
ok("duration is left None rather than filled in with the wrong unit")

assert tt._as_aweme({"id": "1"}, "someone")["author"]["unique_id"] == "someone"
assert tt._as_aweme({"id": "1"}, "someone")["text_extra"] == []
ok("a sparse entry degrades to empty fields, not a KeyError")

# --- yt-dlp profile listing: three outcomes ------------------------------------
def fake_ytdlp(stdout="", rc=0, raise_with=None, files=None):
    """Stand in for yt-dlp, patched BELOW _tt_ytdlp so its own guards are exercised.

    `files` writes subtitle files into whatever -o directory the caller chose.
    """
    calls = []
    def run(cmd, *, timeout, **kw):
        calls.append(cmd)
        assert cmd[:3] == ["yt-dlp", "--ignore-config", "--no-warnings"], cmd[:3]
        if raise_with:
            raise raise_with
        if files is not None:
            out = [a for a in cmd if a.endswith("/%(id)s")][0]
            for name in files:
                pathlib.Path(out).with_name(name).write_text(
                    "WEBVTT\n\n00:00:00.020 --> 00:00:01.460\n" + name.split(".")[1])
        return subproc.SubprocResult(returncode=rc, stdout=stdout, stderr="")
    subproc.run_with_timeout = run
    tt._ytdlp_available = lambda: True
    return calls

fake_ytdlp(json.dumps({"entries": [entry("a"), entry("b")]}))
assert [x["aweme_id"] for x in tt._ytdlp_profile_videos("nasa", 5)] == ["a", "b"]
assert len(tt._ytdlp_profile_videos("nasa", 1)) == 1, "count must bound the result"
ok("a working keyless profile fetch returns aweme-shaped videos, bounded by count")

for bad, why in ((json.dumps({"entries": []}), "0 videos"),
                 (json.dumps({"entries": [None]}), "[null] entries (the tiktok:tag bug)"),
                 ("not json at all", "unparseable JSON"),
                 ("", "no output")):
    fake_ytdlp(bad)
    assert tt._ytdlp_profile_videos("nasa", 5) is None, why
ok("0 videos / [null] / bad JSON / no output are all a FAILED fetch, never an empty account")

for exc in (subproc.SubprocTimeout("slow"), FileNotFoundError("yt-dlp"), OSError("nope")):
    fake_ytdlp(raise_with=exc)
    assert tt._ytdlp_profile_videos("nasa", 5) is None
ok("a timeout, a missing binary and a spawn failure are all None, and none raise")

# --- _profile_videos: who pays -------------------------------------------------
paid = []
def fake_http_get(url, params=None, **kw):
    paid.append(url)
    return {"aweme_list": [{"aweme_id": "sc1", "desc": "from scrapecreators"}]}
tt.http.get = fake_http_get

fake_ytdlp(json.dumps({"entries": [entry("a")]}))
paid.clear()
assert [x["aweme_id"] for x in tt._profile_videos("nasa", "k")] == ["a"]
assert not paid, "the free lane worked; the key must stay unspent"
ok("a working yt-dlp means the paid profile endpoint is never called")

fake_ytdlp("")
paid.clear()
assert [x["aweme_id"] for x in tt._profile_videos("nasa", "k")] == ["sc1"]
assert paid and "v3/tiktok/profile/videos" in paid[0]
ok("a failed keyless fetch falls back to ScrapeCreators when a key exists")

fake_ytdlp("")
paid.clear()
assert tt._profile_videos("nasa", "") == [] and not paid
tt._ytdlp_available = lambda: False
paid.clear()
assert tt._profile_videos("nasa", "") == [] and not paid
ok("no key and no yt-dlp is an empty list, not a crash and not a paid call")

# --- transcripts ---------------------------------------------------------------
fake_ytdlp(files=["777.eng-US.vtt", "777.spa.vtt"])
got = tt._ytdlp_caption("https://www.tiktok.com/@nasa/video/777")
assert got == "spa", f"a machine-translated eng-US track must not beat the original: {got}"
fake_ytdlp(files=["777.eng-US.vtt"])
assert tt._ytdlp_caption("https://www.tiktok.com/@nasa/video/777") == "eng-US"
ok("the original-language track wins; eng-US is used only when it is the only one")

fake_ytdlp(files=[])
assert tt._ytdlp_caption("https://www.tiktok.com/@nasa/video/777") is None
fake_ytdlp(raise_with=subproc.SubprocTimeout("slow"))
assert tt._ytdlp_caption("https://www.tiktok.com/@nasa/video/777") is None
assert tt._ytdlp_caption("") is None
ok("no subtitle file, a timeout, and an empty url are all None")

# --- fetch_captions: description, then free ASR, then paid ---------------------
def vids(n=2):
    return [{"video_id": f"v{i}", "text": f"caption {i}",
             "url": f"https://www.tiktok.com/@nasa/video/v{i}"} for i in range(n)]

fake_ytdlp(files=["v.spoken.vtt"])
paid.clear(); LOGS.clear()
caps = tt.fetch_captions(vids(2), token="k", depth="quick")
assert caps == {"v0": "spoken", "v1": "spoken"}, caps
assert not paid, "free transcripts must not be re-bought"
assert any("2 spoken transcripts free via yt-dlp, 0 via ScrapeCreators" in m
           for m in LOGS), LOGS
ok("yt-dlp transcripts supersede the description and cost nothing")
ok("the receipt names the lane — '2 free, 0 via ScrapeCreators', not just '2/2'")

fake_ytdlp(files=[])
tt.http.get = lambda url, params=None, **kw: (
    paid.append(url) or {"transcript": "WEBVTT\n\n00:00:01.000 --> 00:00:02.000\npaid words"})
paid.clear()
caps = tt.fetch_captions(vids(1), token="k", depth="quick")
assert caps == {"v0": "paid words"}, caps
assert len(paid) == 1 and "video/transcript" in paid[0]
ok("ScrapeCreators is called only for the videos yt-dlp could not answer for")

fake_ytdlp(files=[])
paid.clear()
assert tt.fetch_captions(vids(1), depth="quick") == {"v0": "caption 0"}
assert not paid, "no token must mean no paid call, and still a usable caption"
ok("with no key at all, the description still comes through")

fake_ytdlp(files=["v.long.vtt"])
tt._ytdlp_caption = lambda url: "word " * (tt.CAPTION_MAX_WORDS + 50)
long_cap = tt.fetch_captions(vids(1), depth="quick")["v0"]
assert long_cap.endswith("...") and len(long_cap.split()) == tt.CAPTION_MAX_WORDS
ok(f"captions are trimmed to {tt.CAPTION_MAX_WORDS} words")

assert tt.fetch_captions([], token="k") == {}
ok("no items is an empty dict, not a crash")

# --- creator-seeded discovery is now a zero-credit lane --------------------------
fake_ytdlp(json.dumps({"entries": [entry("c1"), entry("c2")]}))
paid.clear()
tt.http.get = lambda url, params=None, **kw: (paid.append(url) or {"search_item_list": []})
r = tt.search_and_enrich("nasa", *W, depth="quick", token="", creators=["nasa"])
got = [i["video_id"] for i in r["items"]]
assert got == ["c1", "c2"], got
assert not paid, "a creator lane with no token must not touch ScrapeCreators at all"
ok("--tiktok-creators works with NO key and spends nothing — free discovery")

# --- the window defect ---------------------------------------------------------
tt._ytdlp_available = lambda: False
def sc_search(payload):
    tt.http.get = lambda url, params=None, **kw: payload
def aweme(vid, ts):
    e = entry(vid, ts=ts); a = tt._as_aweme(e, "nasa"); return {"aweme_info": a}

# 2023-01-05 and 2024-06-01 — the exact shape of the Instagram Reels defect.
sc_search({"search_item_list": [aweme("old1", 1672876800), aweme("old2", 1717200000)]})
r = tt.search_tiktok("nasa", *W, token="k")
assert r["items"] == [], "out-of-window videos must NEVER be returned"
assert "outside the window" in (r.get("error") or ""), r
ok("a window with nothing in it returns [] WITH an error — never stale videos")

sc_search({"search_item_list": [aweme("old1", 1672876800), aweme("new1", 1785169549)]})
r = tt.search_tiktok("nasa", *W, token="k")
assert [i["video_id"] for i in r["items"]] == ["new1"] and not r.get("error"), r
ok("a mixed result keeps only what is inside the window")

assert tt.search_tiktok("nasa", *W)["error"].startswith("No SCRAPECREATORS")
sc_search({"search_item_list": []})
assert tt.search_tiktok("nasa", *W, token="k")["items"] == []
ok("no key -> a named error; no results -> an empty list, neither a crash")

print("✓ all tiktok free-lane cases pass — hydration costs nothing, and a window is a window")
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
