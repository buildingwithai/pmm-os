<!-- PMM-OS-REACH-TRIM: trimmed by scripts/patch-agent-reach-trim.py. Upstream's version was
     275 lines, most of it three backends for one China-market platform plus two more
     this plugin does not route. See that script for why. -->

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
