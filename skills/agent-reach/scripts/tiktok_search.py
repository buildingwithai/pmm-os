#!/usr/bin/env python3
"""Free TikTok HASHTAG search via TikTokApi (drives real chromium/webkit via Playwright, so it
executes the JS TikTok uses to lazy-load results — which a plain scrape can't). No ScrapeCreators.

Setup (once):  pip install TikTokApi  &&  python -m playwright install webkit
Usage:  tiktok_search.py <hashtag-or-keyword> [count=15]

Anti-throttle (see research-engines.md "Social search — rate-limit strategy"):
  - browser="webkit" headless (TikTok bot-detects headless chromium, not webkit).
  - sleep_after between requests; retries BACK OFF (25s) instead of rapid-firing.
  - results CACHED ~6h in ~/.cache/pmm-os-social/ so re-running the same hashtag never re-hits.
  - set TIKTOK_MS_TOKEN (from a logged-in tiktok.com cookie) for far more reliable runs.
"""
import sys, os, asyncio, time, hashlib

CACHE_DIR = os.path.expanduser("~/.cache/pmm-os-social")
TTL = 6 * 3600


def _cache_file(q: str) -> str:
    os.makedirs(CACHE_DIR, exist_ok=True)
    return os.path.join(CACHE_DIR, f"tiktok-{hashlib.md5(q.encode()).hexdigest()[:12]}.txt")


async def run(q: str, count: int) -> list:
    from TikTokApi import TikTokApi
    q = q.lstrip("#").replace(" ", "")
    ms = os.environ.get("TIKTOK_MS_TOKEN")
    lines = []
    async with TikTokApi() as api:
        # webkit headless evades TikTok's headless-chromium detection (verified).
        await api.create_sessions(num_sessions=1, sleep_after=3, headless=True, browser="webkit",
                                  ms_tokens=[ms] if ms else None)
        async for video in api.hashtag(name=q).videos(count=count):
            d = getattr(video, "as_dict", {}) or {}
            st = d.get("stats", {}) or d.get("statsV2", {}) or {}
            desc = (d.get("desc") or "").replace("\n", " ")[:90]
            author = (d.get("author") or {}).get("uniqueId", "")
            vid = d.get("id") or getattr(video, "id", "")
            url = f"https://www.tiktok.com/@{author}/video/{vid}" if author and vid else ""
            lines.append(f"- {st.get('playCount', 0)}▶ {st.get('diggCount', 0)}❤ "
                         f"{st.get('commentCount', 0)}\U0001f4ac @{author}: {desc}"
                         + (f"  URL: {url}" if url else ""))
    lines.append(f"# TikTok #{q}: {len(lines)} videos (free, TikTokApi)")
    return lines


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: tiktok_search.py <hashtag-or-keyword> [count]", file=sys.stderr); return 2
    q = sys.argv[1]; count = int(sys.argv[2]) if len(sys.argv) > 2 else 15
    cf = _cache_file(q)
    if os.path.exists(cf) and time.time() - os.path.getmtime(cf) < TTL:
        sys.stdout.write(open(cf, encoding="utf-8").read())
        print(f"# (cached, <{TTL//3600}h old — not re-hitting TikTok)")
        return 0
    last = ""
    for attempt in range(3):
        try:
            lines = asyncio.run(run(q, count))
            if len(lines) > 1:  # got videos (last line is the count header)
                out = "\n".join(lines) + "\n"
                with open(cf, "w", encoding="utf-8") as fh:
                    fh.write(out)
                sys.stdout.write(out)
                return 0
            last = "empty response (bot-detected/rate-limited)"
        except Exception as e:
            last = f"{type(e).__name__}: {str(e)[:120]}"
        if attempt < 2:
            time.sleep(25)  # BACK OFF — never rapid-retry (that worsens throttling)
    print(f"TikTok search failed after 3 tries: {last}\n"
          "(needs Python 3.10+, TikTokApi, `playwright install webkit`. Set TIKTOK_MS_TOKEN for "
          "reliability; space runs out; SC is the fallback for at-scale discovery.)", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
