#!/usr/bin/env python3
"""One runnable check for the free YouTube comment lane. No network, no key.

Guards what scripts/patch-youtube-comments-free.py exists to fix, plus the two ways
the fix could quietly go wrong:

  1. THE GATE. Comment enrichment required a ScrapeCreators key AND an opt-in string
     in a file nobody hand-edits — for comments `reach.sh yt-comments` reads free.
  2. THE OFF SWITCH. SKILL.md documents `EXCLUDE_SOURCES=youtube_comments`, and
     nothing read it. Harmless while the feature was default-off; load-bearing now.
  3. THE SHAPE. normalize._remap_comments reads `likes`/`text` for YouTube. If the
     free lane returned yt-dlp's own `like_count`/`text`, every keyless comment
     would render with score 0 and no test would notice.
  4. KNOWN-EMPTY IS NOT UNKNOWN. yt-dlp exiting 0 on a video with comments off is a
     FACT; paying ScrapeCreators to re-ask buys a second empty list. Only a real
     failure (None) may open the paid lane.

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
import json, os, pathlib, sys
sys.path.insert(0, SCRIPTS)
from lib import env, subproc, youtube_yt as yt

def ok(msg):
    print("  ok  " + msg)

# --- the gate: free when yt-dlp is there, off when the user says off ------------
def gate(ytdlp, **cfg):
    env.is_ytdlp_available = lambda: ytdlp
    return env.is_youtube_comments_available(cfg)

assert gate(True) is True, "yt-dlp installed must be enough — that is the whole patch"
ok("yt-dlp installed -> comments on with no key and no INCLUDE_SOURCES")

assert gate(True, SCRAPECREATORS_API_KEY="k",
            EXCLUDE_SOURCES="youtube_comments") is False
assert gate(True, EXCLUDE_SOURCES=" YouTube_Comments ,x") is False, \
    "EXCLUDE_SOURCES is parsed case-insensitively and trimmed"
ok("EXCLUDE_SOURCES=youtube_comments is a real off switch, and beats a live key")

assert gate(False, SCRAPECREATORS_API_KEY="k",
            INCLUDE_SOURCES="youtube_comments") is True
assert gate(False, SCRAPECREATORS_API_KEY="k") is False
assert gate(False, INCLUDE_SOURCES="youtube_comments") is False
assert gate(False) is False
ok("no yt-dlp -> the old key+INCLUDE_SOURCES rule still holds, unchanged")

# --- the shape normalize expects ------------------------------------------------
def c(text, likes, parent="root", ts=1785169549):
    return {"text": text, "like_count": likes, "parent": parent,
            "author": "@someone", "timestamp": ts, "_time_text": "1 year ago"}

got = yt._parse_ytdlp_comments([c("quiet", 3), c("loud", 900), c("mid", 40)], 5)
assert [x["likes"] for x in got] == [900, 40, 3], got
assert set(got[0]) == {"author", "text", "likes", "date"}, got[0]
assert got[0]["date"] == "2026-07-27", got[0]
ok("yt-dlp's like_count/text/timestamp map onto likes/text/date, highest-liked first")

long_one = yt._parse_ytdlp_comments([c("x" * 900, 1)], 5)[0]
assert len(long_one["text"]) == 400, len(long_one["text"])
ok("comment text is truncated to 400 chars, same as the paid lane")

roots = yt._parse_ytdlp_comments([c("a reply", 999, parent="UgzABC"), c("a root", 1)], 5)
assert [x["text"] for x in roots] == ["a root"], roots
only_replies = yt._parse_ytdlp_comments([c("a reply", 999, parent="UgzABC")], 5)
assert [x["text"] for x in only_replies] == ["a reply"], only_replies
ok("replies yield to top-level comments, but are used when there are no roots")

assert yt._parse_ytdlp_comments([c("   ", 5), c("real", 1)], 5)[0]["text"] == "real"
assert yt._parse_ytdlp_comments([], 5) == []
ok("blank comments are dropped; an empty input is an empty list, not a crash")

# --- the three states: list / known-empty / unknown -----------------------------
def fake_ytdlp(comments=None, rc=0, write=True, raise_with=None):
    """Stand in for yt-dlp: writes the info.json it would write, into its own -o dir."""
    calls = []
    def run(cmd, *, timeout, **kw):
        calls.append(cmd)
        if raise_with:
            raise raise_with
        if write:
            out = [a for a in cmd if a.endswith("/%(id)s")][0]
            vid = cmd[-1].rsplit("=", 1)[-1]
            body = {"id": vid}
            if comments is not None:
                body["comments"] = comments
            pathlib.Path(out).with_name(vid + ".info.json").write_text(json.dumps(body))
        return subproc.SubprocResult(returncode=rc, stdout="", stderr="ERROR: boom" if rc else "")
    subproc.run_with_timeout = run
    return calls

fake_ytdlp([c("hello", 7)])
assert [x["text"] for x in yt._fetch_comments_ytdlp("vid1", 5)] == ["hello"]
ok("a successful keyless fetch returns real comments")

fake_ytdlp([])
assert yt._fetch_comments_ytdlp("vid1", 5) == [], "exit 0 + no comments is a FACT"
ok("comments disabled (exit 0, empty list) returns [] — a known empty, not a gap")

fake_ytdlp(None, rc=1, write=False)
assert yt._fetch_comments_ytdlp("vid1", 5) is None, "a failed fetch is UNKNOWN, never []"
ok("a non-zero exit returns None — a block is never laundered into 'no comments'")

fake_ytdlp(None, rc=0, write=False)
assert yt._fetch_comments_ytdlp("vid1", 5) is None
ok("exit 0 with no file written is also unknown, not empty")

fake_ytdlp(raise_with=subproc.SubprocTimeout("slow"))
assert yt._fetch_comments_ytdlp("vid1", 5) is None
fake_ytdlp(raise_with=FileNotFoundError("yt-dlp"))
assert yt._fetch_comments_ytdlp("vid1", 5) is None
ok("a timeout and a missing binary are both unknown, and neither raises")

calls = fake_ytdlp([c("hi", 1)])
os.environ["LAST30DAYS_YOUTUBE_SSH_HOST"] = "macmini"
assert yt._fetch_comments_ytdlp("vid1", 5) is None and not calls, \
    "SSH egress writes the JSON on the remote host — documented ceiling, must not pretend"
os.environ.pop("LAST30DAYS_YOUTUBE_SSH_HOST")
ok("SSH-routed runs skip the keyless lane instead of reading a file that isn't there")

# --- enrich_with_comments: who pays, and when ----------------------------------
def items(n=2):
    return [{"video_id": f"v{i}", "engagement": {"views": 100 - i}} for i in range(n)]

paid_calls = []
yt._fetch_video_comments = lambda vid, token, mx: (
    paid_calls.append(vid) or [{"author": "@sc", "text": "paid", "likes": 1, "date": ""}])

fake_ytdlp([c("free comment", 5)])
paid_calls.clear()
out = yt.enrich_with_comments(items(), max_videos=2)          # NO token at all
assert all(i["top_comments"][0]["text"] == "free comment" for i in out), out
assert not paid_calls
ok("comments arrive with no token whatsoever — the regression this patch closes")

fake_ytdlp(None, rc=1, write=False)
paid_calls.clear()
out = yt.enrich_with_comments(items(1), token="k", max_videos=1)
assert paid_calls == ["v0"], paid_calls
assert out[0]["top_comments"][0]["text"] == "paid"
ok("a FAILED keyless fetch falls through to ScrapeCreators when a key exists")

fake_ytdlp([])
paid_calls.clear()
out = yt.enrich_with_comments(items(1), token="k", max_videos=1)
assert not paid_calls, "a known-empty must not spend a credit to be told the same thing"
assert "top_comments" not in out[0]
ok("a known-empty video never spends a credit")

fake_ytdlp([c("free comment", 5)])
paid_calls.clear()
yt.enrich_with_comments(items(1), token="k", max_videos=1)
assert not paid_calls, "the free lane won; the key must stay unspent"
ok("a working keyless lane never spends the key")

calls = fake_ytdlp([c("free comment", 5)])
yt.enrich_with_comments(items(6), token="k", max_videos=2)
assert len(calls) == 2, f"max_videos must bound the fetches, got {len(calls)}"
ok("max_videos bounds how many videos are fetched")

assert yt.enrich_with_comments([], token="k") == []
assert yt.enrich_with_comments(items(1), max_videos=0)[0].get("top_comments") is None
ok("no items / max_videos=0 are no-ops, not crashes")

print("✓ all youtube-comment cases pass — comments are free, and an empty is never a guess")
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
