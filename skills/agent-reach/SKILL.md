---
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

<!-- PMM-OS-REACH-TRIM (re-applied by scripts/patch-agent-reach-trim.py after upstream re-pull) -->

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

<!-- PMM-OS-SETUP (re-applied by scripts/sync-research-engines.sh after upstream re-pull) -->
## Setup — first run (PMM OS)

If `agent-reach` is not on PATH, bootstrap it once: run **`bash scripts/setup.sh`**
(installs the upstream `agent-reach` CLI from the vendored source + its free backends
via `agent-reach install --env=auto`, then runs `agent-reach doctor`).
<!-- END PMM-OS-SETUP -->
