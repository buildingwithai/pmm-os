#!/usr/bin/env python3
"""One runnable check for ig_fetch.py's failure classification. No network.

The bug this exists to prevent: instaloader turned Instagram's 403 into
"Profile nasa does not exist" and printed it to stdout, where an agent copied it
into a research brief as a fact. Every assertion below is about NOT doing that —
a block must stay a block, and it must never reach stdout.
"""
import io
import sys
import urllib.error
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import ig_fetch  # noqa: E402


def _raise(code):
    def boom(req, **kw):
        raise urllib.error.HTTPError(req.full_url, code, f"HTTP {code}", {}, None)
    return boom


def _serve(body):
    class R:
        status = 200
        def read(self, *a): return body.encode()
        def __enter__(self): return self
        def __exit__(self, *a): return False
    return lambda req, **kw: R()


def check(desc, cond):
    assert cond, f"FAILED: {desc}"
    print(f"  ok  {desc}")


def expect(exc, fn):
    try:
        fn()
    except exc:
        return True
    except Exception as e:                     # noqa: BLE001
        raise AssertionError(f"raised {type(e).__name__}, wanted {exc.__name__}") from e
    raise AssertionError(f"raised nothing, wanted {exc.__name__}")


orig = ig_fetch.urllib.request.urlopen
try:
    # A block is a block. Never NoSuchAccount — that is the fabricated-fact bug.
    for code in (401, 429, 302, 403, 500):
        ig_fetch.urllib.request.urlopen = _raise(code)
        expect(ig_fetch.Blocked, lambda: ig_fetch.fetch("nasa"))
    check("401/429/302/403/500 all raise Blocked, never NoSuchAccount", True)

    ig_fetch.urllib.request.urlopen = _raise(404)
    expect(ig_fetch.NoSuchAccount, lambda: ig_fetch.fetch("nasa"))
    check("404 (and only 404) raises NoSuchAccount", True)

    ig_fetch.urllib.request.urlopen = _serve('{"status":"ok"}')
    expect(ig_fetch.ShapeChanged, lambda: ig_fetch.fetch("nasa"))
    check("a 200 with no 'items' key raises ShapeChanged, not an empty result", True)

    # An empty first page is a failed fetch, not an empty account — exit 2, and the
    # explanation goes to stderr so it can never be mistaken for data.
    ig_fetch.urllib.request.urlopen = _serve('{"items":[]}')
    check("a 200 with items:[] returns [] from fetch()", ig_fetch.fetch("nasa") == [])
    sys.argv = ["ig_fetch.py", "nasa"]
    out, errbuf = io.StringIO(), io.StringIO()
    real = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = out, errbuf
    try:
        rc = ig_fetch.main()
    finally:
        sys.stdout, sys.stderr = real
    check("empty first page exits 2, not 0", rc == 2)
    check("nothing is written to stdout on a failed fetch", out.getvalue() == "")
    check("the reason is on stderr", "failed fetch" in errbuf.getvalue())

    ig_fetch.urllib.request.urlopen = _serve(
        '{"items":[{"code":"AAA","like_count":5,"comment_count":1,'
        '"caption":{"text":"hello\\nworld"}}]}')
    items = ig_fetch.fetch("nasa")
    check("a real page parses", len(items) == 1 and items[0]["code"] == "AAA")
finally:
    ig_fetch.urllib.request.urlopen = orig

print("✓ all ig_fetch classification cases pass — a block never becomes a fact")
