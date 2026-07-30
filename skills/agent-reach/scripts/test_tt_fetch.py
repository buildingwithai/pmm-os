#!/usr/bin/env python3
"""One runnable check for tt_fetch.py's number formatting and failure classification.

No network — yt-dlp is stubbed. Two things are pinned:

  1. TikTok display-rounds counts at/above ~10k before they ever reach the API (399 of
     400 sampled view counts ended in "00"). Printing 747900 as an exact integer invents
     four digits of precision that TikTok never measured, so it must render as ~747.9K.
  2. A failed fetch must never look like an empty account — the same rule ig_fetch.py
     enforces, and the reason the old inline version was replaced.
"""
import io
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import tt_fetch  # noqa: E402


def check(desc, cond, detail=""):
    assert cond, f"FAILED: {desc}{chr(10) + '        ' + str(detail) if detail else ''}"
    print(f"  ok  {desc}")


def capture(fn, *a):
    out, errbuf = io.StringIO(), io.StringIO()
    real = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = out, errbuf
    try:
        rc = fn(*a)
    finally:
        sys.stdout, sys.stderr = real
    return rc, out.getvalue(), errbuf.getvalue()


A = tt_fetch.approx
check("counts under 10k print exactly (TikTok does not round them)",
      A(946) == "946" and A(9999) == "9999", (A(946), A(9999)))
check("counts at/above 10k are marked approximate",
      A(747900) == "~747.9K" and A(10000) == "~10.0K", (A(747900), A(10000)))
check("millions render as M", A(2900000) == "~2.9M", A(2900000))
check("None never prints as 0 — a missing count is not zero engagement", A(None) == "?")

# --- failures must not look like empty ----------------------------------------
tt_fetch.run = lambda args: (1, "", "ERROR: Unable to extract secondary user ID")
rc, out, err = capture(tt_fetch.account, "nasa", 5)
check("a yt-dlp failure exits 2, not 0", rc == 2, rc)
check("nothing reaches stdout on a failed account fetch", out == "", out)
check("the reason says it is NOT evidence of an empty account",
      "NOT evidence the account is empty" in err, err)

# tiktok:tag returns {"entries":[null]} with EXIT 0 — a null counted as a result.
tt_fetch.run = lambda args: (0, json.dumps({"entries": [None]}), "")
rc, out, err = capture(tt_fetch.account, "nasa", 5)
check("a [null] entry list is a failed fetch, not one video", rc == 3, rc)
check("no null ever reaches stdout", out == "", out)

tt_fetch.run = lambda args: (0, "not json at all", "")
rc, out, err = capture(tt_fetch.account, "nasa", 5)
check("unparseable JSON is reported as a contract change", rc == 2 and "contract" in err, err)

# --- video mode ---------------------------------------------------------------
tt_fetch.run = lambda args: (0, json.dumps({
    "view_count": 747900, "like_count": 66600, "comment_count": 7612,
    "repost_count": 1292, "upload_date": "20260727", "duration": 13,
    "uploader": "nasa", "description": "Drop your questions below",
    "subtitles": {}}), "")
rc, out, _ = capture(tt_fetch.video, "https://www.tiktok.com/@nasa/video/1")
check("video mode succeeds", rc == 0, rc)
check("an absent subtitles dict is reported as NO transcript",
      "transcript: NONE" in out, out)
check("the rounding caveat is printed when counts are rounded",
      "display-rounded" in out, out)
check("comment text is named as unavailable, so nobody assumes it is just missing",
      "comment TEXT and per-comment likes are NOT available free" in out, out)

# rc is 0 whether captions exist or not, so presence must be read off the dict.
tt_fetch.run = lambda args: (0, json.dumps({
    "view_count": 500, "subtitles": {"fra-FR": [{}], "eng-US": [{}]}}), "")
rc, out, _ = capture(tt_fetch.video, "u")
check("a multi-language subtitle set flags eng-US as a machine TRANSLATION",
      "MACHINE TRANSLATION" in out, out)
check("small counts print without the rounding caveat",
      "display-rounded" not in out, out)

# yt-dlp reports a nonexistent id as an IP block. Do not send people to fix a fine network.
tt_fetch.run = lambda args: (1, "", "ERROR: Your IP address is blocked from accessing this post")
rc, out, err = capture(tt_fetch.video, "u")
check("the misleading IP-block message is annotated, not repeated verbatim",
      "does not exist" in err, err)

print("✓ all tt_fetch cases pass — no invented precision, no failure dressed as emptiness")
