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
#   reach.sh v2ex                # V2EX hot topics (public API)
#   reach.sh doctor              # what's live (delegates to agent-reach if installed)
#   reach.sh selftest            # runnable check (read + gh, no keys)
set -uo pipefail
UA="agent-reach/1.0 (pmm-os)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_py_with(){ local m="$1" p; for p in python3.13 python3.12 python3.11 python3 python; do command -v "$p" >/dev/null 2>&1 && "$p" -c "import $m" 2>/dev/null && { echo "$p"; return 0; }; done; echo python3; return 1; }

read_url(){ curl -fsS --max-time 30 -A "$UA" "https://r.jina.ai/${1:?url required}"; }
gh_search(){ command -v gh >/dev/null || { echo "gh CLI not installed" >&2; return 127; }; gh search repos "${1:?query required}" --sort stars --limit "${2:-10}"; }
gh_read(){ command -v gh >/dev/null || { echo "gh CLI not installed" >&2; return 127; }; gh repo view "${1:?owner/repo required}" 2>/dev/null; }
yt(){ command -v yt-dlp >/dev/null || { echo "yt-dlp not installed (agent-reach install --env=auto)" >&2; return 127; }
  local d; d="$(mktemp -d)"; yt-dlp --skip-download --write-auto-sub --write-sub --sub-format vtt --sub-langs "en.*,en" -o "$d/%(id)s" "${1:?url required}" >/dev/null 2>&1 || true
  cat "$d"/*.vtt 2>/dev/null | sed -E '/-->/d;/^WEBVTT/d;/^[0-9]+$/d;/^$/d' | awk '!seen[$0]++'; rm -rf "$d"; }
v2ex(){ curl -fsS --max-time 15 -A "$UA" "https://www.v2ex.com/api/topics/hot.json"; }

# TikTok — FREE via yt-dlp (tiktok:user). Look up a known creator/competitor account.
# (Hashtag/keyword SEARCH is not free here — yt-dlp's tiktok:tag is broken; that needs SC.)
tiktok(){ command -v yt-dlp >/dev/null || { echo "yt-dlp not installed (agent-reach install --env=auto)" >&2; return 127; }
  local u="${1:?@user or url required}"; case "$u" in http*) ;; @*) u="https://www.tiktok.com/$u";; *) u="https://www.tiktok.com/@$u";; esac
  yt-dlp --flat-playlist --playlist-end "${2:-15}" -J "$u" 2>/dev/null | python3 -c "import sys,json
try:
 d=json.load(sys.stdin); ents=d.get('entries') or []
 print(f'# TikTok: {len(ents)} recent posts (free, yt-dlp)')
 for e in ents: print('-', (e.get('title') or e.get('id') or '').replace(chr(10),' ')[:120])
except Exception: print('# TikTok: no data (private/blocked, or install curl_cffi)')"; }

# Instagram — free via instaloader, but IG blocks datacenter IPs + rate-limits, so this
# only works on a LOCAL/residential IP (never a cloud/Vercel backend), ideally logged in.
ig(){ local u="${1:?user or url required}"; u="${u#@}"
  if command -v instaloader >/dev/null 2>&1; then
    echo "# Instagram @$u via instaloader (local residential IP; log in via 'instaloader --login=USER' for reliability)"
    instaloader --no-pictures --no-videos --no-metadata-json --quiet --count "${2:-12}" --post-filter="True" -- "-$u" 2>&1 | head -25 || \
      instaloader --no-pictures --no-videos --quiet --count "${2:-12}" "$u" 2>&1 | head -25
  else
    echo "instaloader not installed (the free IG tool): pip install instaloader. NOTE: IG blocks datacenter IPs and rate-limits hard — run on a LOCAL residential IP, not a cloud/Vercel backend, and log in for anything beyond a few requests." >&2; return 127
  fi; }

# TikTok HASHTAG/keyword SEARCH — FREE via TikTokApi (Playwright webkit). No ScrapeCreators.
tiktok_search(){ "$(_py_with TikTokApi)" "$SCRIPT_DIR/tiktok_search.py" "$@"; }
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
  command -v instaloader >/dev/null 2>&1 || { echo "instaloader not installed — run setup.sh first." >&2; return 127; }
  local u="${1:?Usage: reach.sh ig-login YOUR_IG_USERNAME}"
  echo "Signing into Instagram as @$u. instaloader will prompt for your password (handled by"
  echo "instaloader directly, stored as an encrypted session — PMM OS never sees it)."
  echo "Run this on a residential IP; a secondary account is recommended."
  instaloader --login="$u"
}

doctor(){
  if command -v agent-reach >/dev/null 2>&1; then agent-reach doctor "${1:-}" ; return; fi
  echo "agent-reach not installed — keyless probe:"
  command -v gh    >/dev/null && echo "  gh: present"    || echo "  gh: missing"
  command -v yt-dlp>/dev/null && echo "  yt-dlp: present" || echo "  yt-dlp: missing"
  curl -fsS --max-time 10 -o /dev/null "https://r.jina.ai/https://example.com" 2>/dev/null && echo "  jina web-read: reachable" || echo "  jina web-read: unreachable"
}

selftest(){
  local fail=0
  read_url "https://example.com" 2>/dev/null | grep -qi "example domain" && echo "✓ read (Jina)" || { echo "✗ read"; fail=1; }
  if command -v gh >/dev/null 2>&1; then gh_search "claude code" 1 >/dev/null 2>&1 && echo "✓ gh-search" || echo "! gh-search (auth?)"; else echo "! gh not installed"; fi
  return $fail
}

case "${1:-}" in
  read) shift; read_url "$@";;
  gh-search) shift; gh_search "$@";;
  gh-read) shift; gh_read "$@";;
  yt) shift; yt "$@";;
  tiktok) shift; tiktok "$@";;
  tiktok-search) shift; tiktok_search "$@";;
  ig|instagram) shift; ig "$@";;
  ig-search) shift; ig_search "$@";;
  social-status) social_status;;
  social-setup) shift; social_setup "${1:-all}";;
  ig-login) shift; ig_login "$@";;
  v2ex) v2ex;;
  doctor) shift; doctor "${1:-}";;
  selftest) selftest;;
  *) echo "usage: reach.sh {read <url>|gh-search <q> [n]|gh-read <owner/repo>|yt <url>|tiktok <@user> [n]|tiktok-search <hashtag> [n]|ig <user> [n]|ig-search <hashtag> [n]|social-status|social-setup [x|ig|tiktok|all]|ig-login <user>|v2ex|doctor|selftest}" >&2; exit 2;;
esac
