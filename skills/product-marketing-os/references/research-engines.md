# PMM OS — Research Engines: what works, and how to verify it

Honest capability map for the two engines, verified by real runs. **Run the health
check first** so you know what's live before you promise depth:

```bash
bash scripts/verify-research.sh --smoke
```

It reports active sources per engine and the free fixes to unlock more.

## Full depth = 1:1 parity with the source repos

The engines are vendored **byte-for-byte** (last30days: 66/66 lib modules + engine +
SKILL.md identical; agent-reach: package identical, all 14 channels). So the depth
*ceiling* equals the original repos. **Parity is a usage discipline, not a code gap** —
you only reach it by driving the full contract:

| | Throttled (don't) | Full contract (do — 1:1) |
| --- | --- | --- |
| last30days flags | bare topic, `--quick` | `--plan` + `--subreddits` + `--x-handle`/`--x-related` + `--github-user`/`--github-repo` + `--tiktok-hashtags` + `--ig-creators`, **no `--quick`** |
| last30days sources hit | **1–3 of 9** | **9 of 9** (the flags activate TikTok/IG/X/Threads) |
| last30days output | 1–8 clusters | **10–15 clusters**, dozens of items + comments |
| agent-reach | `reach.sh read` ×2–3 | the recipe's **~15–30 calls** across the relevant channels |

*(Numbers measured on real engine runs: `--quick` = 1 source /
1 item; no-`--quick` + partial flags = 3 sources / 8 clusters; full flags = 8 clusters /
**22 items**.)* A "couple of reads" is **not** a desk run. The runner enforces this.

**Attempts ≠ returns — watch the credentials.** Full flags make the engine *attempt* all 9
sources, but what actually returns depends on each source having working credentials:
- **ScrapeCreators `HTTP 402: Payment Required` = the key is OUT OF CREDITS.** This silently
  zeroes TikTok / Instagram / Threads / YouTube-comments (in the proof run, all SC sources
  returned 0 on 402, so the 22 items came from the keyless GitHub/Reddit/YouTube). Top up at
  scrapecreators.com — `has_scrapecreators: true` only means the key is *present*, not funded.
- **X/Twitter** needs a browser login (`--x-handle` alone isn't enough).
- **Reddit public JSON** can 403 (anti-bot) and fall back to the keyless path.

Run `verify-research.sh --smoke` — it now flags an SC 402. **Record any zeroed source in the
ledger** so a deliverable doesn't silently miss social sentiment.

## last30days — engagement-ranked, last-30-days

One topic per run (or one A-vs-B comparison); fans out internally across sources.
Needs **Python 3.12+**.

| Source | Cost | How |
| --- | --- | --- |
| Reddit, Hacker News, Polymarket, GitHub, web | **free, keyless** | works out of the box |
| **YouTube** (search + transcripts) | **free, keyless** | via **yt-dlp** — *no API key* (only YouTube *comments* need SC) |
| **X / Twitter** | **free, just log in** | be logged into **x.com in a browser** (Chrome/Brave/Safari/Firefox) → cookies auto-extracted. Fallbacks: `AUTH_TOKEN`+`CT0` env, or `XAI_API_KEY`/`XQUIK_API_KEY` |
| **TikTok** — creator (reliable) **and hashtag SEARCH** (flaky) | **free** | `reach.sh tiktok @user` (yt-dlp — reliable). `reach.sh tiktok-search <hashtag>` (TikTokApi + Playwright **webkit** — *verified: returned 30 real #jobsearch videos*, but **probabilistic**: TikTok rate-limits per IP, so it intermittently returns empty — it retries 3×, rerun if it fails). Headless **chromium** is always blocked; headless **webkit** sometimes gets through. For heavy/at-scale TikTok discovery, SC is the reliable fallback. |
| **Instagram** — profile **and hashtag search** | **free, local-IP + login** | `reach.sh ig user` / `reach.sh ig-search <hashtag>` (instaloader). One-time `instaloader --login=YOU`; **residential IP only** (never cloud/Vercel); use a secondary account, low volume. |
| Threads, Pinterest, YouTube *comments* | paid (SC) | `SCRAPECREATORS_API_KEY` (100 free then PAYG) — the only things left that need SC. |
| Bluesky, TruthSocial | free, token | app password / token |

**You don't need ScrapeCreators for the core platforms — not even TikTok/IG search.** Free
now covers Reddit, HN, Polymarket, GitHub, **YouTube**, **X (logged-in browser)**, the open
web, **TikTok (by creator + hashtag search)**, **Instagram (by profile + hashtag search,
local IP + login)**, plus agent-reach's web/V2EX/Bilibili/RSS. **SC is reduced to Threads,
Pinterest, YouTube comments — plus a *reliable fallback* for TikTok/IG hashtag search when the
free (flaky) path keeps failing.** Run `setup.sh` to install the free search stack
(`curl_cffi` + `instaloader` + `TikTokApi` + Playwright `webkit`).

**The TikTok-search trick:** TikTok detects and empties headless *chromium* but not headless
*webkit* — `tiktok_search.py` uses `browser="webkit"`. If a run returns 0, retry (TikTok is
flaky) or use `headless=False`.

## Social search — rate-limit strategy (don't get throttled)

Researched from instaloader docs + issues (#1285, #1226, #2501) and TikTokApi. **Golden rule
for both: low frequency, one persistent session, and CACHE — never rapid-fire the same query**
(that's what throttled our test).

**Instagram (instaloader) — a hard number: ~200 requests/hour** (75 for some types), tracked
over an 11-minute sliding window.
- **Re-invoking is the #1 cause of bans.** Each new `instaloader` run *resets* its rate
  tracking → 429. Keep ONE instance alive; let its built-in `RateController` pace it.
- **Reuse the login session file** (`instaloader --login=USER` saves one; it doesn't expire).
- Proven cadence: **random 3–8s between requests; pause ~100–150s after ~100 requests.**
- 401 "please wait": no VPN, a real current user-agent, fresh session, a handful per run, don't
  re-invoke within minutes. For volume: rotate residential proxies per profile.

**TikTok (TikTokApi) — behavioral, no published number.** Headless *webkit* passes where
chromium fails, but it's probabilistic.
- `sleep_after>=3`, a few `num_sessions`, and a **real `ms_token`** (set `TIKTOK_MS_TOKEN` from a
  logged-in tiktok.com cookie) is far more reliable than guest.
- **Space runs out + cache** — don't hit the same hashtag repeatedly in a short window. Retry
  with a 20–30s backoff, never rapid retries. For reliable at-scale discovery, SC is the fallback.

**What PMM OS does about it:** `tiktok_search.py` / `ig_search.py` **cache results (~6h TTL)** in
`~/.cache/pmm-os-social/`, so a desk re-running the same hashtag reuses the last pull instead of
re-hitting; retries back off (not rapid); IG reuses its session + paces itself. So a desk's
social calls stay well under the limits by default.

**X login on macOS:** Chrome/Brave cookie extraction works (Keychain-decrypted); Safari needs
the running terminal/app to have **Full Disk Access**. If X shows "off," confirm you're logged
into x.com in a supported browser, or set `AUTH_TOKEN`/`CT0`.

## agent-reach — breadth-first router (it installs + routes; it does NOT fetch itself)

agent-reach v1.5.0's CLI is `setup / install / configure / doctor` — it has no
`read`/`search`. Fetching is done by the backends it installs. Use
[`skills/agent-reach/scripts/reach.sh`](../../agent-reach/scripts/reach.sh) as the
deterministic keyless interface.

| Platform | Status | Backend / unlock |
| --- | --- | --- |
| GitHub | **keyless** ✓ | `gh` (auth: `gh auth login`) |
| Web (any URL) | **keyless** ✓ | Jina reader (`reach.sh read <url>`) |
| V2EX, RSS, Bilibili | **keyless** ✓ | public APIs / feedparser |
| YouTube | keyless after 1 line | `yt-dlp` + Node; `setup.sh` configures `--js-runtimes node` |
| Twitter, Reddit, XiaoHongShu, LinkedIn | login | `agent-reach configure` (browser cookies) |
| Exa web search | key | `EXA_API_KEY` (free 1,000/mo) |

First run: `bash skills/agent-reach/scripts/setup.sh` (installs the CLI from the vendored
source + the backends + the yt-dlp fix). Then `reach.sh selftest` confirms the keyless path.

## The reliable keyless research surface (works on a fresh install)

Even with **zero keys/logins**, a desk can do real work:

- **last30days:** Reddit + Hacker News + Polymarket + GitHub (engagement-ranked).
- **agent-reach via `reach.sh`:** read any URL, search/read GitHub, V2EX, RSS, YouTube transcripts.

That covers competitor/product/dev/community research end-to-end. Social sentiment depth
(TikTok/IG/X/Reddit-logged-in) is the paid/login upgrade — surfaced honestly by the health
check, never silently dropped.

## How the desk runner should use this

1. `verify-research.sh` (or `reach.sh doctor`) → know what's live.
2. Drive the keyless backends deterministically via `reach.sh` (read/gh/yt/v2ex) + one
   `last30days` topic per entity.
3. If a desk needs a source that's `needs setup`, **say so in the evidence ledger** (mark
   the gap) rather than skipping it silently — then point the user at the one-line fix.

## Don't let one source hang the run (the YouTube + broad-X failure modes)

Two real failures from a live run, and the fix for each:

- **YouTube transcripts stall a run.** `yt-dlp` subtitle fetches get HTTP 429 /
  "confirm you're not a bot" and burn the (bounded, ~3×30s) retry budget *per video* — and
  when two heavy topics are blobbed into one fire-and-forget background job, the stalled one
  leaves a **0-byte output** that looks "hung overnight." Fix: **select sources per desk** —
  for text-pain desks (customer/competitive/market/pricing) pass
  `--search=reddit,x,github,web` (**no `youtube`**; transcripts add little to pain/competitor
  text). Include `youtube` only for creator/channel desks. **Always** wrap the call in
  `timeout 420 …` and write **one topic per file** — never two heavy topics in one
  unmonitored background blob.
- **Broad X queries return noise.** A free-text topic like
  `waiting on data team for product analytics answers slow` matches any tweet with those
  common words → sports/politics/junk (entity-miss). Fix: **tightly target X** — real
  `--x-handle`/`--x-related` + **quoted exact phrases** (`"flying blind"`,
  `"waiting on the data team"`), never a keyword bag. The recipe names the handles + phrases.
