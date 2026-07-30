#!/usr/bin/env bash
# reach.sh — deterministic KEYLESS fetch wrapper for the research desks.
# agent-reach v1.5.0's CLI only installs/routes; it has no `read`/`search`. This is
# the tested entry point for the zero-config backends, so a desk fan-out can call
# stable commands instead of remembering curl/gh/yt-dlp flags. Works even before
# `agent-reach install` (uses curl/gh/yt-dlp directly).
#
#   reach.sh read <url>          # read any web page (Jina reader, keyless)
#   reach.sh gh-search <query>   # search GitHub repos (gh, needs auth)
#   reach.sh gh-read <owner/repo># repo summary + README (gh)
#   reach.sh yt <youtube-url>    # video transcript (yt-dlp)
#   reach.sh yt-comments <url>   # top comments, keyless (yt-dlp — no SC key needed)
#   reach.sh bsky <query>        # Bluesky search, keyless, no account
#   reach.sh tiktok <@user> [n]  # TikTok account's recent videos, keyless
#   reach.sh tiktok-video <url>  # one video: views/likes/comments/date/transcript
#   reach.sh ig <username>       # Instagram account timeline, keyless, no login
#   reach.sh v2ex                # V2EX hot topics (public API)
#   reach.sh doctor              # what's live (delegates to agent-reach if installed)
#   reach.sh selftest            # runnable check (read + gh, no keys)
set -uo pipefail
UA="agent-reach/1.0 (pmm-os)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_py_with(){ local m="$1" p; for p in python3.13 python3.12 python3.11 python3 python; do command -v "$p" >/dev/null 2>&1 && "$p" -c "import $m" 2>/dev/null && { echo "$p"; return 0; }; done; echo python3; return 1; }
# For stdlib-only helpers (ig_fetch.py): any interpreter will do, including the 3.9 that
# macOS ships. Deliberately NOT resolve_python.sh — that enforces 3.12+ for the last30days
# engine, and requiring it here would make a working free fetch look unavailable.
_py_any(){ local p; for p in python3 python3.13 python3.12 python; do command -v "$p" >/dev/null 2>&1 && { echo "$p"; return 0; }; done; echo python3; return 1; }

# instaloader ships a console script into a per-user bin dir that is often NOT on
# PATH (verified: module 4.15.1 imports fine while `command -v instaloader` fails).
# Checking only for the binary reported "not installed" for a working install and
# sent people to pip for something they already had. Prefer the CLI, fall back to
# the module entry point, which is the same code.
_insta() {
  # Prefer the console script; fall back to the module, which is the same code.
  if command -v instaloader >/dev/null 2>&1; then instaloader "$@"; return $?; fi
  local p
  for p in python3.13 python3.12 python3 python; do
    if command -v "$p" >/dev/null 2>&1 && "$p" -c 'import instaloader' 2>/dev/null; then
      "$p" -m instaloader "$@"; return $?
    fi
  done
  return 127
}
_has_insta() {
  command -v instaloader >/dev/null 2>&1 && return 0
  local p
  for p in python3.13 python3.12 python3 python; do
    command -v "$p" >/dev/null 2>&1 && "$p" -c 'import instaloader' 2>/dev/null && return 0
  done
  return 1
}

read_url(){ curl -fsS --max-time 30 -A "$UA" "https://r.jina.ai/${1:?url required}"; }
gh_search(){ command -v gh >/dev/null || { echo "gh CLI not installed" >&2; return 127; }; gh search repos "${1:?query required}" --sort stars --limit "${2:-10}"; }
gh_read(){ command -v gh >/dev/null || { echo "gh CLI not installed" >&2; return 127; }; gh repo view "${1:?owner/repo required}" 2>/dev/null; }
# Distinguishes "this video has no captions" from "yt-dlp failed". Those used to be
# byte-identical — `|| true` plus discarded stderr meant a 429 rate-limit and a
# caption-less video both produced empty stdout and exit 0, so a stalled research
# run looked like a thin topic.
yt(){ command -v yt-dlp >/dev/null || { echo "yt-dlp not installed (agent-reach install --env=auto)" >&2; return 127; }
  local d err rc; d="$(mktemp -d)"; err="$d/.stderr"
  yt-dlp --skip-download --write-auto-sub --write-sub --sub-format vtt --sub-langs "en.*,en" \
    -o "$d/%(id)s" "${1:?url required}" >/dev/null 2>"$err"; rc=$?
  if [ "$rc" -ne 0 ]; then
    echo "# YouTube: yt-dlp failed (exit $rc) — this is NOT 'no captions'." >&2
    grep -iE "429|rate.?limit|sign in|bot|unavailable|private|geo" "$err" | head -3 >&2 \
      || tail -3 "$err" >&2
    rm -rf "$d"; return "$rc"
  fi
  if ! ls "$d"/*.vtt >/dev/null 2>&1; then
    echo "# YouTube: no captions available for this video (yt-dlp succeeded)."
    rm -rf "$d"; return 0
  fi
  cat "$d"/*.vtt | sed -E '/-->/d;/^WEBVTT/d;/^[0-9]+$/d;/^$/d' | awk '!seen[$0]++'; rm -rf "$d"; }
v2ex(){ curl -fsS --max-time 15 -A "$UA" "https://www.v2ex.com/api/topics/hot.json"; }

# YouTube COMMENTS — free, keyless. The engine gates comment enrichment behind
# SCRAPECREATORS_API_KEY (lib/env.py:854), which is not a technical requirement:
# yt-dlp reads the same comment API. Verified 2026-07-30 (5 comments, no key).
yt_comments(){ command -v yt-dlp >/dev/null || { echo "yt-dlp not installed (agent-reach install --env=auto)" >&2; return 127; }
  local n="${2:-20}" d rc; d="$(mktemp -d)"
  yt-dlp --skip-download --write-comments --write-info-json --no-write-sub \
    --extractor-args "youtube:comment_sort=top;max_comments=$n,all,$n" \
    -o "$d/c" "${1:?url required}" >/dev/null 2>"$d/.err"; rc=$?
  if [ "$rc" -ne 0 ] || [ ! -f "$d/c.info.json" ]; then
    echo "# YouTube comments: yt-dlp failed (exit $rc) — NOT 'no comments'." >&2
    tail -3 "$d/.err" >&2; rm -rf "$d"; return "${rc:-1}"
  fi
  "$(_py_any)" -c '
import json,sys
d=json.load(open(sys.argv[1])); c=d.get("comments") or []
if not c: print("# YouTube: comments disabled or none on this video (yt-dlp succeeded)."); raise SystemExit(0)
print("# YouTube comments on %s: %d (free, yt-dlp — no API key)" % (d.get("title","?")[:60], len(c)))
for x in sorted(c, key=lambda k: k.get("like_count") or 0, reverse=True):
    print("- %sL: %s" % (x.get("like_count", 0), (x.get("text") or "").replace(chr(10)," ")[:180]))
' "$d/c.info.json"; rm -rf "$d"; }

# Bluesky — free, keyless, no account. The AppView serves search unauthenticated.
# NOTE: it must be api.bsky.app; public.api.bsky.app returns 403 for searchPosts.
bsky(){ local q="${1:?query required}" n="${2:-25}"
  curl -fsS --max-time 20 -A "$UA" -G "https://api.bsky.app/xrpc/app.bsky.feed.searchPosts" \
    --data-urlencode "q=$q" --data-urlencode "limit=$n" --data-urlencode "sort=top" \
  | "$(_py_any)" -c '
import json,sys
try: d=json.load(sys.stdin)
except Exception: print("# Bluesky: no JSON back — endpoint moved or blocked.", file=sys.stderr); raise SystemExit(2)
p=d.get("posts") or []
if not p: print("# Bluesky: 0 results — treat as a failed fetch, not an empty topic.", file=sys.stderr); raise SystemExit(2)
print("# Bluesky: %d posts (free, keyless)" % len(p))
for x in p:
    r=x.get("record") or {}
    print("- %sL %sR @%s: %s  URL: https://bsky.app/profile/%s/post/%s" % (
        x.get("likeCount",0), x.get("repostCount",0), x["author"]["handle"],
        (r.get("text") or "").replace(chr(10)," ")[:160],
        x["author"]["handle"], (x.get("uri") or "").rsplit("/",1)[-1]))
'; }

# TikTok — FREE, keyless, via yt-dlp. See tt_fetch.py for what the old inline version
# did: it fetched every engagement number and printed only `title`, which is TikTok's
# TRUNCATED description — the damaged copy of a field it discarded. Its `except
# Exception: print('# TikTok: no data')` also turned a block into a benign-looking line.
tiktok(){ "$(_py_any)" "$SCRIPT_DIR/tt_fetch.py" account "$@"; }
# One video: views, likes, comments, reposts, date, caption, transcript availability.
tiktok_video(){ "$(_py_any)" "$SCRIPT_DIR/tt_fetch.py" video "$@"; }

# Instagram accounts — FREE, keyless, no login, no instaloader. See ig_fetch.py for why
# the instaloader path was deleted: it passed `-- "-$u"`, which instaloader documents as
# "the post with this shortcode", so it never requested a profile at all; and anonymously
# it turns IG's 403 into "Profile nasa does not exist" — a block laundered into a fact.
ig(){ "$(_py_any)" "$SCRIPT_DIR/ig_fetch.py" "$@"; }

# TikTok HASHTAG/keyword SEARCH — measured 0%, and it costs ~90s per attempt to say so.
# TikTokApi, Playwright and webkit are all installed here and the browser does spawn; the
# response is empty every time ("They are detecting you're a bot"), 18/18 internal retries
# across 6 runs. yt-dlp agrees independently — it ships `tiktok:tag` marked CURRENTLY
# BROKEN, and that route returns {"entries":[null],"playlist_count":0} with EXIT 0, which
# is how a null result gets counted as a result.
#
# So it fails fast instead of burning a minute and a half to fail slow. PMM_OS_TRY_FREE_TT=1
# runs it anyway — kept because TikTok's detection does change, and the day it starts
# working again someone should be able to find out cheaply.
tiktok_search(){
  if [ "${PMM_OS_TRY_FREE_TT:-}" != "1" ]; then
    echo "TikTok hashtag/keyword search has no working free path (measured 0/6 runs," >&2
    echo "18/18 retries: 'TikTok returned an empty response... detecting you're a bot')." >&2
    echo "  discovery  -> needs SCRAPECREATORS_API_KEY (or: use YouTube/Reddit/Bluesky, all free)" >&2
    echo "  accounts   -> reach.sh tiktok @user          (free, works)" >&2
    echo "  one video  -> reach.sh tiktok-video <url>    (free, works)" >&2
    echo "  re-test it -> PMM_OS_TRY_FREE_TT=1 $0 tiktok-search $*" >&2
    return 3
  fi
  "$(_py_with TikTokApi)" "$SCRIPT_DIR/tiktok_search.py" "$@"
}
# Instagram HASHTAG search — FREE via instaloader (needs one-time login, residential IP).
ig_search(){ "$(_py_with instaloader)" "$SCRIPT_DIR/ig_search.py" "$@"; }

# Auto-wire X + Instagram + TikTok from the browser sessions you're already logged into
# (no passwords — reads your own cookies locally). Run after logging into the sites.
social_setup(){ "$(_py_with browser_cookie3)" "$SCRIPT_DIR/social_setup.py" "${1:-all}"; }

# Show what's signed in (X = browser cookie, IG = instaloader session) + how to fix.
social_status(){
  echo "── Social channel sign-in (X + Instagram + TikTok) ──"
  echo "  ▶ EASIEST: stay logged into x.com / instagram.com / tiktok.com in your browser, then run:"
  echo "       $0 social-setup        (reads your browser sessions, wires all three — no passwords)"
  echo
  if ls "$HOME/.config/instaloader/"session-* >/dev/null 2>&1; then
    echo "  ✓ Instagram: signed in ($(ls "$HOME/.config/instaloader/"session-* 2>/dev/null | xargs -n1 basename | sed 's/session-//' | tr '\n' ' '))"
  else
    echo "  ✗ Instagram: not signed in → log into instagram.com in your browser + run social-setup,"
    echo "     or (alt) $0 ig-login YOUR_IG_USERNAME. Use a secondary account on a residential IP."
  fi
  if grep -q '^AUTH_TOKEN=' "$HOME/.config/last30days/.env" 2>/dev/null; then
    echo "  ✓ X/Twitter: wired (token in ~/.config/last30days/.env)"
  else
    echo "  ✗ X/Twitter: log into x.com in your browser + run social-setup (cookie auto-read, no password)."
  fi
}

# One-time Instagram login. instaloader prompts for YOUR password (it goes to instaloader and
# is stored as an encrypted session — never to PMM OS). The USER runs this in their own terminal.
ig_login(){
  _has_insta || { echo "instaloader not installed — run setup.sh first." >&2; return 127; }
  local u="${1:?Usage: reach.sh ig-login YOUR_IG_USERNAME}"
  echo "Signing into Instagram as @$u. instaloader will prompt for your password (handled by"
  echo "instaloader directly, stored as an encrypted session — PMM OS never sees it)."
  echo "Run this on a residential IP; a secondary account is recommended."
  _insta --login="$u"
}

# ALWAYS --json. Two reasons, both load-bearing:
#   1. `agent-reach doctor ""` (what `${1:-}` expanded to with no flag) is an argparse
#      error — exit 2. The command the docs tell agents to run has never worked.
#   2. Text mode calls _install_skill(), which rewrites ~/.claude/skills/agent-reach/,
#      ~/.agents/skills/ and ~/.openclaw/skills/ — with the upstream Chinese SKILL.md
#      unless LANG is English. A health check must not mutate installed skills.
# --json returns before that side effect. We pretty-print locally instead.
doctor(){
  if command -v agent-reach >/dev/null 2>&1; then
    local out; out="$(agent-reach doctor --json 2>/dev/null)"
    if [ -n "$out" ] && command -v python3 >/dev/null 2>&1; then
      printf '%s' "$out" | python3 -c '
import json,sys
try: d=json.load(sys.stdin)
except Exception: sys.exit(1)
ICON={"ok":"OK","warn":"! ","off":". ","error":"X "}
for k,v in sorted(d.items(), key=lambda kv:(kv[1].get("status","z"),kv[0])):
    st=v.get("status","?")
    icon=ICON.get(st,"? ")
    be=v.get("active_backend") or "-"
    print("  %s %-14s %-6s via %s" % (icon,k,st,be))
n=sum(1 for v in d.values() if v.get("status")=="ok")
print("")
print("  %d/%d channels ok. OpenCLI-backed channels report ok for plumbing only —" % (n,len(d)))
print("  login state is unknown until the first real call.")
' && return
    fi
    [ -n "$out" ] && { printf '%s\n' "$out"; return; }
  fi
  echo "agent-reach not installed — keyless probe:"
  command -v gh    >/dev/null && echo "  gh: present"    || echo "  gh: missing"
  command -v yt-dlp>/dev/null && echo "  yt-dlp: present" || echo "  yt-dlp: missing"
  curl -fsS --max-time 10 -o /dev/null "https://r.jina.ai/https://example.com" 2>/dev/null && echo "  jina web-read: reachable" || echo "  jina web-read: unreachable"
}

selftest(){
  local fail=0
  # Assert on OUR contract (a 2xx and a non-trivial body), never on a third party's
  # page text. Grepping "example domain" false-failed on a network that serves a
  # different example.com — the same bug this repo had in health.mjs:probeGrounding.
  [ "$(read_url "https://example.com" 2>/dev/null | wc -c)" -gt 80 ] && echo "✓ read (Jina)" || { echo "✗ read"; fail=1; }
  bsky "product marketing" 3 >/dev/null 2>&1 && echo "✓ bsky (keyless)" || { echo "✗ bsky"; fail=1; }
  if command -v gh >/dev/null 2>&1; then gh_search "claude code" 1 >/dev/null 2>&1 && echo "✓ gh-search" || echo "! gh-search (auth?)"; else echo "! gh not installed"; fi
  return $fail
}

case "${1:-}" in
  read) shift; read_url "$@";;
  gh-search) shift; gh_search "$@";;
  gh-read) shift; gh_read "$@";;
  yt) shift; yt "$@";;
  yt-comments) shift; yt_comments "$@";;
  bsky|bluesky) shift; bsky "$@";;
  tiktok) shift; tiktok "$@";;
  tiktok-video) shift; tiktok_video "$@";;
  tiktok-search) shift; tiktok_search "$@";;
  ig|instagram) shift; ig "$@";;
  ig-search) shift; ig_search "$@";;
  social-status) social_status;;
  social-setup) shift; social_setup "${1:-all}";;
  ig-login) shift; ig_login "$@";;
  v2ex) v2ex;;
  doctor) shift; doctor "${1:-}";;
  selftest) selftest;;
  *) echo "usage: reach.sh {read <url>|gh-search <q> [n]|gh-read <owner/repo>|yt <url>|yt-comments <url> [n]|bsky <query> [n]|tiktok <@user> [n]|tiktok-video <url>|tiktok-search <hashtag> [n]|ig <user> [n]|ig-search <hashtag> [n]|social-status|social-setup [x|ig|tiktok|all]|ig-login <user>|v2ex|doctor|selftest}" >&2; exit 2;;
esac
