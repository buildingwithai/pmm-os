#!/usr/bin/env python3
"""Instagram named-account timeline — logged-out, keyless, no cookies.

Replaces the instaloader path, which had two defects that made it worse than
useless inside an unattended agent:

  1. It never fetched a profile at all. reach.sh passed `-- "-$user"`, and
     instaloader documents `-- -shortcode` as "download the post with the given
     shortcode" — so `reach.sh ig nasa` asked Instagram for a POST whose
     shortcode is "nasa". Broken independent of any blocking.
  2. Anonymously it raises ProfileNotExistsException("Profile nasa does not
     exist.") when Instagram returns 403. Verified on this machine. That is a
     block reported as a fact, printed to stdout, which an agent then writes into
     a research brief. A fabricated fact is the worst possible failure here.

This uses the logged-out web endpoint with the public web app id. Measured
2026-07-30: HTTP 200 with real posts for @nasa, @natgeo and @nike, no cookies.

Legal posture: logged-OFF public data only. Meta Platforms v. Bright Data
(N.D. Cal. 2024) held Meta's terms govern logged-IN use; this never authenticates.
Not legal advice — see RESEARCH-ETHICS.md.

Usage:  ig_fetch.py <username> [count]
Exit:   0 with posts · 2 blocked/rate-limited · 3 no such account · 4 shape changed
"""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request

# The public web client id Instagram's own logged-out web app sends. If Meta
# rotates it this call starts returning 302/401 — loudly, which is the point.
APP_ID = "936619743392459"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/122.0 Safari/537.36")


def fetch(username: str, count: int = 12) -> list[dict]:
    url = (f"https://www.instagram.com/api/v1/feed/user/{username}/username/"
           f"?count={max(1, min(count, 50))}")
    # Referer matters: some HTTP clients get a deterministic 400 on this exact URL
    # without it (Node's fetch does; curl and urllib do not). Send it always.
    req = urllib.request.Request(url, headers={
        "X-IG-App-ID": APP_ID, "User-Agent": UA, "Accept": "application/json",
        "Referer": f"https://www.instagram.com/{username}/",
    })
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            if resp.status != 200:
                raise Blocked(f"HTTP {resp.status}")
            payload = json.load(resp)
    except urllib.error.HTTPError as e:
        # 302 -> login wall, 401/429 -> throttled, 404 -> gone. All unambiguous.
        if e.code in (301, 302, 401, 429):
            raise Blocked(f"HTTP {e.code} — Instagram is throttling or walling this IP") from e
        if e.code == 404:
            raise NoSuchAccount(username) from e
        raise Blocked(f"HTTP {e.code}") from e
    except urllib.error.URLError as e:
        raise Blocked(f"network: {e.reason}") from e

    if "items" not in payload:
        raise ShapeChanged("response has no 'items' key — endpoint contract moved")
    return payload["items"] or []


class Blocked(RuntimeError):
    pass


class NoSuchAccount(RuntimeError):
    pass


class ShapeChanged(RuntimeError):
    pass


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: ig_fetch.py <username> [count]", file=sys.stderr)
        return 64
    user = sys.argv[1].lstrip("@")
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 12

    try:
        items = fetch(user, count)
    except Blocked as e:
        # LOUD. Never print a claim about the account to stdout on a block.
        print(f"# Instagram @{user}: BLOCKED — {e}. This is NOT evidence the account "
              f"is empty or missing.", file=sys.stderr)
        return 2
    except NoSuchAccount:
        print(f"# Instagram: no account @{user} (HTTP 404).", file=sys.stderr)
        return 3
    except ShapeChanged as e:
        print(f"# Instagram: {e}. The free endpoint needs updating.", file=sys.stderr)
        return 4

    if not items:
        # Page 0 empty is a failure until proven otherwise, not a result.
        print(f"# Instagram @{user}: 0 posts on the first page — treat as a failed "
              f"fetch, not an empty account.", file=sys.stderr)
        return 2

    print(f"# Instagram @{user}: {len(items)} recent posts (free, logged-out web endpoint)")
    for it in items:
        cap = ((it.get("caption") or {}).get("text") or "").replace("\n", " ")[:150]
        code = it.get("code") or ""
        print(f"- {it.get('like_count', '?')}L {it.get('comment_count', '?')}C"
              + (f" [{it.get('play_count')}plays]" if it.get("play_count") else "")
              + f": {cap}"
              + (f"  URL: https://www.instagram.com/p/{code}/" if code else ""))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)
