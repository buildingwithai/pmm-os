#!/usr/bin/env python3
"""Idempotent PMM-OS patch: trim agent-reach to the channels it can actually serve.

Applied after every upstream sync (sync-research-engines.sh calls this), because that
script overwrites SKILL.md from upstream and does `rm -rf skills/agent-reach/references`.

WHAT WAS WRONG. The vendored skill advertised 15 platforms. Measured 2026-07-30:

  - FIVE are China-market — xiaohongshu, bilibili, xueqiu, xiaoyuzhou, v2ex. The target
    user for a product-marketing plugin is not reading Xueqiu, and their CHINESE ERROR
    STRINGS were surfacing in PMM OS's own `npx pmm-os doctor` output.
  - Its YouTube was broken while ours worked. Its Reddit reported `absent` while
    last30days Reddit returned 20 items. Its Twitter was blocked while last30days X
    returned 21. Overlapping lanes, and agent-reach lost every one of them.
  - `references/social.md` was 1,185 CJK characters — the largest reference file in the
    plugin, describing three XiaoHongShu backends nobody here will call.
  - The CLI itself cannot fetch anything: its verbs are {setup, install, configure,
    doctor, uninstall, skill, format, transcribe, check-update, watch, version}. There
    is no `read` and no `search`. The thing that fetches is our own reach.sh.

After subtracting everything covered better elsewhere in PMM OS, what agent-reach
genuinely adds is FOUR things: LinkedIn, RSS, Exa (needs a key) and `transcribe`
(Whisper, needs a key). The docs said fifteen.

WHAT THIS PATCH DOES. Rewrites SKILL.md's body and replaces references/social.md and
references/video.md with trimmed English versions. The body is replaced wholesale
rather than by a dozen anchored substitutions — the platform list appears in the
frontmatter, the header, two standing rules, the routing table, the quick commands,
the login-backed section and the reference index, and eight anchors would rot on the
first upstream reword. The `<!-- PMM-OS-SETUP` block that sync appends is preserved.

NOT REMOVED, deliberately: `reach.sh v2ex` stays. It is our own verb over a public
keyless API, it works, and it costs nothing to keep — this trim is about what the
routing table PROMISES, not about deleting working code.
"""
import pathlib
import re
import sys

SKILL_DIR = pathlib.Path(__file__).resolve().parent.parent / "skills/agent-reach"
MARK = "PMM-OS-REACH-TRIM"
SETUP_ANCHOR = "<!-- PMM-OS-SETUP"

SKILL_BODY = f'''---
name: agent-reach
description: >
  Use when the user wants to fetch or read something from a specific place on the
  internet — "read this URL", "search LinkedIn", "what's in this RSS feed",
  "transcribe this video", "search GitHub for X".

  Ten channels: web pages and RSS (Jina), Exa web/code search, LinkedIn and jobs,
  GitHub, YouTube, and the login-backed group (Twitter/X, Reddit, Facebook,
  Instagram) via OpenCLI. Run `agent-reach doctor --json` to see which backend
  serves each one right now.

  PREFER `last30days` for "what are people saying about X" — it is
  engagement-ranked and its Reddit/X/YouTube lanes measure stronger than these.
  Prefer `reach.sh` for TikTok, Instagram accounts, Bluesky and YouTube comments.
  This skill is for reach the other two do not have.

  NOT for: writing reports/analysis/translation (this skill only FETCHES);
  posting/commenting/liking (write operations).
metadata:
  openclaw:
    homepage: https://github.com/Panniantong/Agent-Reach
---

<!-- {MARK} (re-applied by scripts/patch-agent-reach-trim.py after upstream re-pull) -->

# Agent Reach — internet capability router

**Read this first: agent-reach's own CLI cannot fetch anything.** Its verbs are
`setup, install, configure, doctor, uninstall, skill, format, transcribe,
check-update, watch, version` — there is no `read` and no `search`. It is a plumbing
manager plus one real fetcher (`transcribe`). The commands below are the underlying
tools it installs and configures.

## What this skill uniquely adds

Everything else in PMM OS covers the rest better. These four have no other lane:

| Capability | Command | Needs |
|---|---|---|
| LinkedIn / jobs | see [references/career.md](references/career.md) | login state |
| RSS feeds | see [references/web.md](references/web.md) | nothing |
| Exa web/code search | `mcporter call 'exa.web_search_exa(...)'` | EXA_API_KEY |
| Audio/video transcription | `agent-reach transcribe URL` | Groq or OpenAI key |

Its Twitter, Reddit, YouTube and Instagram lanes **overlap and lose**: measured
2026-07-30, agent-reach's YouTube was broken while `reach.sh yt` worked, its Reddit
reported `absent` while last30days returned 20 items, and its Twitter was blocked
while last30days X returned 21. Reach for those two first.

## Standing rules (apply for the whole session)

1. **Health-check before acting**: for the login-backed platforms (Twitter / Reddit /
   Facebook / Instagram), run `agent-reach doctor --json` first and use the command
   group matching each platform's `active_backend`. Note that doctor reports whether a
   backend is INSTALLED, not whether a query returns data — treat `ok` as "plumbing is
   up", never as "this works".
2. **Announce what you use**: say "using agent-reach, platform X via backend Y" before
   starting.
3. **On failure, follow the retry chains in references/** — never guess commands.
4. **For broad research tasks**, run `last30days` and this skill and synthesize both —
   two independent source pools beat one.
5. **A block is never a fact.** If a fetch fails, say it failed. Never report an
   auth wall, a 429 or an empty extractor result as "no results for this topic".

## Routing table

| User intent | Category | Details |
|---------|------|---------|
| Web / code search (Exa) | search | [references/search.md](references/search.md) |
| Twitter/X, Reddit, Facebook, Instagram | social | [references/social.md](references/social.md) |
| Jobs / LinkedIn | career | [references/career.md](references/career.md) |
| GitHub / code | dev | [references/dev.md](references/dev.md) |
| Web pages / articles / RSS | web | [references/web.md](references/web.md) |
| YouTube / transcription | video | [references/video.md](references/video.md) |

## Zero-config quick commands

```bash
# Exa web search (needs EXA_API_KEY; the free MCP tier rate-limits to HTTP 429)
mcporter call 'exa.web_search_exa(query: "query", numResults: 5)'

# Read any web page
curl -s "https://r.jina.ai/URL"

# GitHub search
gh search repos "query" --sort stars --limit 10

# YouTube subtitles
yt-dlp --write-sub --skip-download -o "/tmp/%(id)s" "URL"
```

## Login-backed platforms (pick by doctor's active_backend)

```bash
# Twitter search (twitter-cli preferred; retry chain in social.md)
twitter search "query" -n 10

# Reddit (NO zero-config path — OpenCLI or rdt-cli, login required)
opencli reddit search "query" -f yaml   # desktop
rdt search "query" --limit 10            # legacy/server

# Facebook / Instagram (desktop OpenCLI, browser session)
opencli facebook search "query" -f yaml
opencli instagram user USERNAME -f yaml
```

## Environment check

```bash
# Channel availability + which backend serves each platform
agent-reach doctor --json
```

## Workspace rules

**Never create files in the agent workspace.** Use `/tmp/` for temporary output and
`~/.agent-reach/` for persistent data.

## Detailed references

- [Search](references/search.md) — Exa AI search
- [Social](references/social.md) — Twitter/X, Reddit, Facebook, Instagram
- [Career](references/career.md) — LinkedIn
- [Dev](references/dev.md) — GitHub CLI
- [Web](references/web.md) — Jina Reader, RSS
- [Video](references/video.md) — YouTube, Whisper transcription

## Configure a channel

If a channel needs setup, fetch the install guide:
https://raw.githubusercontent.com/Panniantong/agent-reach/main/docs/install.md

The user only provides cookies / one extension click; the agent does the rest.
'''

SOCIAL_MD = f'''<!-- {MARK}: trimmed by scripts/patch-agent-reach-trim.py. Upstream's version was
     275 lines covering XiaoHongShu (three backends), Bilibili and V2EX as well —
     China-market channels this plugin does not route. See that script for why. -->

# Social & community

Twitter/X, Reddit, Facebook, Instagram. All four are **login-backed** — there is no
zero-config path to any of them. Run `agent-reach doctor --json` first and use the
group matching each platform's `active_backend`.

**Before reaching here:** `last30days` covers X and Reddit with engagement ranking and
measured stronger on both, and `reach.sh ig <user>` reads Instagram accounts keylessly.
Use this file for what those cannot do.

## Twitter/X (twitter-cli)

### Stable commands

```bash
twitter feed -n 20                   # home timeline (most stable)
twitter tweet URL_OR_ID              # one tweet, with replies
twitter article URL_OR_ID            # long-form / X Article
twitter user-posts @username -n 20   # a user's timeline
twitter user @username               # profile
```

### Less stable

```bash
twitter search "query" -n 10   # X moves its GraphQL endpoints often; 404s happen
twitter likes                  # since 2024, own likes only — platform limit
```

### Retry chain when `search` fails (in order, stop on success)

1. Retry once — intermittent failures are common.
2. `pipx upgrade twitter-cli && twitter search "query" -n 10`
3. Desktop fallback, reusing the browser session:
   `opencli twitter search "query" -f yaml`
4. Route around it with the stable commands: `twitter feed`, `twitter user-posts`.

> **Install:** `pipx install twitter-cli` (v0.8.5+).
> **Auth:** export `TWITTER_AUTH_TOKEN` + `TWITTER_CT0` from a cookie export.
> Automatic extraction does not work under SSH/Docker/headless.
> **IP risk:** do not call this from a VPS or datacenter IP, especially
> followers/following — accounts get banned. Residential or local only.
> **Output:** prefer `--yaml` or `--json`.

## Reddit (multi-backend, login required)

**No zero-config path exists.** The anonymous `.json` endpoints return 403, and
official API approval has been effectively closed to new personal projects since
2025-11. Both backends rely on a logged-in session.

```bash
# Backend A — OpenCLI (desktop; reuses the Chrome session)
opencli reddit search "query" -f yaml
opencli reddit read POST_ID -f yaml
opencli reddit subreddit LocalLLaMA -f yaml
opencli reddit hot -f yaml
opencli reddit subreddit-info LocalLLaMA -f yaml

# Backend B — rdt-cli (server/legacy; upstream frozen since 2026-03)
rdt search "query" --limit 10
rdt read POST_ID
rdt sub python --limit 20
```

> Backend A needs Chrome open and logged into reddit.com.
> Backend B: `pipx install 'git+https://github.com/public-clis/rdt-cli.git'` (PyPI is
> behind; needs v0.4.2+), then `rdt login` before searching.
> Holders of a pre-2025-11 Reddit script app can use PRAW against the official API
> (100 QPM free). **Do not send new users down that path** — approval is manual and
> personal projects are declined.

## Facebook (OpenCLI, login required)

```bash
opencli facebook search "query" -f yaml
opencli facebook profile zuck -f yaml
opencli facebook feed --limit 10 -f yaml
opencli facebook groups --limit 20 -f yaml
```

> Needs Chrome open with the OpenCLI extension and a facebook.com login. Do not
> suggest Jina/Exa/Graph API as the default path. Groups reads only the group LIST and
> recent activity visible to the current account — not arbitrary group posts.

## Instagram (OpenCLI, login required)

```bash
opencli instagram search "query" -f yaml     # USER search, not post keyword search
opencli instagram profile nasa -f yaml
opencli instagram user nasa --limit 12 -f yaml
opencli instagram explore --limit 20 -f yaml
```

> Needs Chrome open with the OpenCLI extension and an instagram.com login. Do not fall
> back to instaloader — it is unstable here (cookies/401/429), and anonymously it
> reports Instagram's 403 as "Profile does not exist", which is a block dressed as a
> fact. For a named account, prefer `reach.sh ig <username>`: keyless, no login.
> On 429 / login required, have the user re-login in Chrome and slow down.
'''

VIDEO_MD = f'''<!-- {MARK}: trimmed by scripts/patch-agent-reach-trim.py. Upstream's version also
     covered Bilibili and Xiaoyuzhou podcasts — China-market channels this plugin does
     not route. See that script for why. -->

# Video & audio

YouTube metadata and subtitles, plus Whisper transcription for anything without them.

**Before reaching here:** `reach.sh yt <url>` and `reach.sh yt-comments <url>` already
wrap the YouTube commands below, and `last30days` pulls YouTube search + transcripts +
comments keylessly as part of a normal run. Use this file for the transcription lane,
which is the part nothing else covers.

## YouTube (yt-dlp)

```bash
# Metadata
yt-dlp --dump-json "URL"

# Subtitles, no video download
yt-dlp --write-sub --write-auto-sub --sub-lang "en" --skip-download -o "/tmp/%(id)s" "URL"
cat /tmp/VIDEO_ID.*.vtt

# Search
yt-dlp --dump-json "ytsearch5:query"

# Top-level comments
yt-dlp --write-comments --skip-download --write-info-json \\
  --extractor-args "youtube:comment_sort=top;max_comments=20,20,0" \\
  -o "/tmp/%(id)s" "URL"
# comments land in the .info.json `comments` field
```

> **`max_comments=N,all,N` IS A TRAP.** The four fields are
> `total,max_parents,max_replies,max_replies_per_thread`. Measured 2026-07-31 on
> `dQw4w9WgXcQ`: `20,all,20` returned 20 comments of which exactly ONE was top-level —
> the other 19 were replies to it. `20,20,0` returned 20 real top comments. Filter on
> `parent == "root"` as well; a reply is not a top comment.
> **Subtitles:** uploaded tracks extract reliably; auto-generated ones repeat lines
> across cues and need post-processing.
> **Comments:** `--write-comments` scrapes the web player, not the Data API. Some
> comments are missed. yt-dlp exiting 0 with none means the video has none; a non-zero
> exit means the fetch FAILED and must not be reported as "no comments".

## Whisper transcription (the lane nothing else covers)

```bash
agent-reach transcribe "https://www.youtube.com/watch?v=VIDEO_ID"
agent-reach transcribe ./local_audio.mp3 -o /tmp/transcript.txt
```

> Accepts a public http(s) URL or a local audio file only. With `ytsearch5:`, pick a
> concrete video URL from the yt-dlp results first, then transcribe that.
> **Needs a key:** `agent-reach configure groq-key gsk_xxx` (free, console.groq.com) or
> `agent-reach configure openai-key sk-xxx`. Default `auto` falls back groq -> openai.
> **Needs ffmpeg:** `brew install ffmpeg`, then `agent-reach install --env=auto`.
> Output is machine ASR. Never quote it as verbatim speech, and never present a
> translated track as the original audio.
'''

CAREER_MD = f'''<!-- {MARK}: translated and trimmed by scripts/patch-agent-reach-trim.py. -->

# Career — LinkedIn and jobs

**This is one of the four things agent-reach uniquely adds.** Nothing else in PMM OS
reaches LinkedIn.

```bash
# A person's profile
mcporter call 'linkedin-scraper.get_person_profile(linkedin_url: "https://linkedin.com/in/username")'

# People search
mcporter call 'linkedin-scraper.search_people(keyword: "AI engineer", limit: 10)'

# A company profile
mcporter call 'linkedin-scraper.get_company_profile(linkedin_url: "https://linkedin.com/company/xxx")'

# Job search
mcporter call 'linkedin-scraper.search_jobs(keyword: "software engineer", limit: 10)'
```

> **Needs a logged-in session.** The scraper reuses LinkedIn login state; without it
> every call returns an auth error. That is a BLOCK, not an empty result — never
> report "no LinkedIn presence" from a failed fetch.

### Fallback when the MCP server is unavailable

```bash
curl -s "https://r.jina.ai/https://linkedin.com/in/username"
```

> Jina reads the logged-out public view, which is a fraction of the profile. Say which
> one you used; the two are not interchangeable evidence.

### Related, but not this lane

`last30days` has its own keyless **jobs** source (public ATS boards — Greenhouse, Lever
and friends). For hiring signals as a market indicator, prefer that: it is free, needs
no login, and returns structured postings. Use LinkedIn here for named people and
companies.
'''

SEARCH_MD = f'''<!-- {MARK}: translated and trimmed by scripts/patch-agent-reach-trim.py.
     The upstream file also compared Exa against a Chinese search MCP that this plugin
     does not ship — pointing the model at tooling that is not installed. -->

# Search — Exa

**This is one of the four things agent-reach uniquely adds.** Strong on English
technical content and code.

```bash
mcporter call 'exa.web_search_exa(query: "query", numResults: 5)'
mcporter call 'exa.get_code_context_exa(query: "code question", tokensNum: 3000)'
```

| Use | Call |
|-----|------|
| Web search | `web_search_exa(query: "...", numResults: 5)` |
| Code / repo context | `get_code_context_exa(query: "...", tokensNum: 3000)` |

> **The free MCP tier rate-limits, and `agent-reach doctor` cannot see it.** Measured
> 2026-07-30: doctor reported `exa_search: ok` while the exact call above returned
> HTTP 429, "You've hit Exa's free MCP rate limit". Doctor proves the backend is
> INSTALLED, never that a query returns data. Set `EXA_API_KEY` for a real quota, and
> treat a 429 as a failed fetch — never as "nothing found on this topic".

## When to use something else

| Need | Better lane |
|-----|---------|
| Read one known URL | `curl -s https://r.jina.ai/URL` (free, keyless) |
| What people are SAYING about X | `last30days` — engagement-ranked, not relevance-ranked |
| Repositories and code | `gh search` — see [dev.md](dev.md) |
'''

WEB_MD = f'''<!-- {MARK}: translated and trimmed by scripts/patch-agent-reach-trim.py.
     The upstream file's tool-comparison table named MCP servers this plugin does not
     ship. -->

# Web pages and RSS

RSS is one of the four things agent-reach uniquely adds. Page reading is free and
keyless via Jina.

## Any web page (Jina Reader)

```bash
curl -s "https://r.jina.ai/URL"
curl -s "https://r.jina.ai/https://example.com/article"
```

Free, keyless, and the default for most pages. `reach.sh read <url>` wraps this.

## Web Reader (MCP) — when output format matters

```bash
mcporter call 'web-reader.webReader(url: "https://example.com")'
mcporter call 'web-reader.webReader(url: "https://example.com", retain_images: true)'
mcporter call 'web-reader.webReader(url: "https://example.com", return_format: "text")'
```

## RSS (feedparser)

```python
python3 -c "
import feedparser
for e in feedparser.parse('FEED_URL').entries[:5]:
    print(f'{{e.title}} — {{e.link}}')
"
```

For blogs, newsrooms, changelogs and podcasts. This is the lane nothing else here has.

| Need | Tool |
|-----|---------|
| A normal page | Jina Reader (`curl r.jina.ai`) |
| Images or an exact output format | web-reader MCP |
| A feed | feedparser |

> A paywall, a 403 or a Cloudflare challenge is a BLOCK. Jina returns a short body or
> an error page rather than the article; check the length before quoting it, and say
> the page was unreachable rather than summarising the interstitial.
'''

DEV_MD = f'''<!-- {MARK}: translated and trimmed by scripts/patch-agent-reach-trim.py.
     The upstream file's tool-comparison table named MCP servers this plugin does not
     ship. -->

# Dev — GitHub CLI

`gh` covers repos, issues, PRs, Actions, releases and the raw API. `reach.sh gh-search`
and `reach.sh gh-read` wrap the common cases; `last30days` also has its own GitHub
source, engagement-ranked.

```bash
# Auth
gh auth login
gh auth status

# Search
gh search repos "query" --sort stars --limit 10
gh search code "query" --language python

# Repos
gh repo view owner/repo
gh repo clone owner/repo
gh repo fork owner/repo --clone
gh repo sync owner/repo

# Issues
gh issue list -R owner/repo --state open
gh issue view 123 -R owner/repo
gh issue create -R owner/repo --title "Title" --body "Body"

# Pull requests
gh pr list -R owner/repo --state open
gh pr view 123 -R owner/repo
gh pr checks 123 --repo owner/repo

# Actions / CI
gh run list --repo owner/repo --limit 10
gh run view <run-id> --repo owner/repo --log-failed
gh workflow list --repo owner/repo

# Releases
gh release list -R owner/repo

# Raw API
gh api /user
gh api repos/owner/repo

# JSON output (best for an agent)
gh issue list --repo owner/repo --json number,title --jq '.[] | "\\(.number): \\(.title)"'
```

> **Unauthenticated GitHub search is 60 requests/hour and returns HTTP 403 past it.**
> `gh auth login`, or set `GITHUB_TOKEN`. A 403 here is a rate limit, not an empty
> repository landscape.
'''

DROP_REFERENCES = ("social.md", "video.md", "career.md", "search.md", "web.md", "dev.md")
REPLACEMENTS = {
    "social.md": SOCIAL_MD, "video.md": VIDEO_MD, "career.md": CAREER_MD,
    "search.md": SEARCH_MD, "web.md": WEB_MD, "dev.md": DEV_MD,
}


def main() -> int:
    skill = SKILL_DIR / "SKILL.md"
    if "--check" in sys.argv:
        problems = []
        if not skill.is_file() or MARK not in skill.read_text(encoding="utf-8"):
            problems.append("SKILL.md is not trimmed")
        for name in DROP_REFERENCES:
            p = SKILL_DIR / "references" / name
            if not p.is_file() or MARK not in p.read_text(encoding="utf-8"):
                problems.append(f"references/{name} is not trimmed")
        if problems:
            print("NOT APPLIED: " + "; ".join(problems)
                  + " — run scripts/patch-agent-reach-trim.py")
            return 1
        print(f"applied: {MARK} in SKILL.md and {len(DROP_REFERENCES)} reference files")
        return 0

    if not skill.is_file():
        print(f"skip (missing): {skill}")
        return 0

    text = skill.read_text(encoding="utf-8")
    if MARK in text:
        print("already trimmed: agent-reach")
        return 0

    # Keep the setup block sync appends before this patcher runs; replace the rest.
    idx = text.find(SETUP_ANCHOR)
    tail = "\n" + text[idx:] if idx != -1 else ""
    if idx == -1:
        print("  ! no PMM-OS-SETUP block found — sync did not append it, or it moved")
    if not re.match(r"^---\nname: agent-reach\n", text):
        print("ANCHOR NOT FOUND (agent-reach frontmatter) — upstream changed, update patcher")
        return 1
    skill.write_text(SKILL_BODY + tail, encoding="utf-8")

    refs = SKILL_DIR / "references"
    refs.mkdir(parents=True, exist_ok=True)
    for name, body in REPLACEMENTS.items():
        (refs / name).write_text(body, encoding="utf-8")

    # Every reference is now PMM OS-authored English. Upstream's were Chinese, which
    # made the four channels that justify this skill unreadable to its target user,
    # and two of them pointed at MCP servers this plugin does not ship.
    stray = [p.name for p in sorted(refs.glob("*.md"))
             if p.name not in REPLACEMENTS
             and re.search(r"[一-鿿]", p.read_text(encoding="utf-8"))]
    if stray:
        print(f"  ! upstream added CJK reference file(s) this patcher does not cover: "
              f"{', '.join(stray)} — translate or drop them")

    print(f"trimmed: agent-reach SKILL.md + {len(REPLACEMENTS)} reference files "
          "(5 China-market channels dropped, 15-platform claim corrected)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
