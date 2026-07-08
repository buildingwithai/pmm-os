#!/usr/bin/env python3
"""Free Instagram HASHTAG search via instaloader (no ScrapeCreators).

IG blocks anonymous hashtag search (403 login_required) and blocks datacenter IPs, so:
  1. Run on a LOCAL residential IP (never a cloud/Vercel backend).
  2. Log in ONCE (saves a reusable session):  instaloader --login=YOUR_IG_USERNAME
     Use a secondary account and keep volume low — IG may flag aggressive scraping.

Anti-throttle (see research-engines.md "Social search — rate-limit strategy"):
  - IG allows ~200 requests/hour; re-invoking resets rate tracking → 429, so DON'T loop this
    rapidly. Results are CACHED ~6h in ~/.cache/pmm-os-social/ to avoid re-hitting.
  - instaloader's built-in RateController paces requests; we keep a single instance per call.

Usage: ig_search.py <hashtag> [count=12] [login_user]
"""
import sys, os, glob, time, hashlib, random

CACHE_DIR = os.path.expanduser("~/.cache/pmm-os-social")
TTL = 6 * 3600


def _cache_file(q: str) -> str:
    os.makedirs(CACHE_DIR, exist_ok=True)
    return os.path.join(CACHE_DIR, f"ig-{hashlib.md5(q.encode()).hexdigest()[:12]}.txt")


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: ig_search.py <hashtag> [count] [login_user]", file=sys.stderr); return 2
    tag = sys.argv[1].lstrip("#")
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 12
    user = sys.argv[3] if len(sys.argv) > 3 else None
    cf = _cache_file(tag)
    if os.path.exists(cf) and time.time() - os.path.getmtime(cf) < TTL:
        sys.stdout.write(open(cf, encoding="utf-8").read())
        print(f"# (cached, <{TTL//3600}h old — not re-hitting Instagram)")
        return 0
    try:
        import instaloader
    except ImportError:
        print("instaloader not installed: pip install instaloader", file=sys.stderr); return 127
    L = instaloader.Instaloader(quiet=True, download_pictures=False, download_videos=False,
                                download_comments=False, save_metadata=False)
    sess_dir = os.path.expanduser("~/.config/instaloader")
    candidates = [user] if user else [os.path.basename(f).replace("session-", "")
                                       for f in glob.glob(os.path.join(sess_dir, "session-*"))]
    for u in [c for c in candidates if c]:
        try:
            L.load_session_from_file(u); break
        except Exception:
            continue
    def _hashtag_posts(h):
        # Instagram keeps changing the hashtag endpoint: get_posts() and get_top_posts()
        # currently KeyError ('more_available'/'medias'); get_posts_resumable() still works.
        import itertools
        for meth in ("get_posts_resumable", "get_top_posts", "get_posts"):
            fn = getattr(h, meth, None)
            if not fn:
                continue
            try:
                it = iter(fn()); first = next(it)
                return itertools.chain([first], it)
            except StopIteration:
                return iter(())
            except Exception:
                continue
        raise RuntimeError("no working hashtag listing method (Instagram API change — update instaloader)")

    try:
        h = instaloader.Hashtag.from_name(L.context, tag)
        lines = [f"# Instagram #{tag}: {getattr(h, 'mediacount', '?')} total posts (free, instaloader)"]
        for i, p in enumerate(_hashtag_posts(h)):
            cap = (p.caption or "").replace("\n", " ")[:100]
            sc = getattr(p, "shortcode", "")
            url = f"https://www.instagram.com/p/{sc}/" if sc else ""
            lines.append(f"- {p.likes}❤ {p.comments}\U0001f4ac @{p.owner_username}: {cap}"
                         + (f"  URL: {url}" if url else ""))
            if i + 1 >= count:
                break
            time.sleep(random.uniform(3, 7))  # best practice: 3-7s between requests (on top of RateController)
        out = "\n".join(lines) + "\n"
        with open(cf, "w", encoding="utf-8") as fh:
            fh.write(out)
        sys.stdout.write(out)
        return 0
    except Exception as e:
        name = type(e).__name__
        if "Login" in name or "login_require" in str(e) or "403" in str(e):
            print("Instagram requires login. Run once on a residential IP:\n"
                  "  instaloader --login=YOUR_IG_USERNAME\n"
                  "(secondary account; keep volume low; don't re-invoke rapidly — IG caps ~200 req/hr).",
                  file=sys.stderr)
            return 2
        print(f"IG search failed: {name}: {str(e)[:120]}", file=sys.stderr); return 1


if __name__ == "__main__":
    raise SystemExit(main())
