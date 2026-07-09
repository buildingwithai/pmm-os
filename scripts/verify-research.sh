#!/usr/bin/env bash
# PMM OS research health check. Tells you EXACTLY what the two engines can do right
# now, and the free fixes to unlock more. Run from the repo root.
#   scripts/verify-research.sh          # status (fast, no network spend)
#   scripts/verify-research.sh --smoke  # + a real keyless micro-run to prove the path
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SMOKE=0; [ "${1:-}" = "--smoke" ] && SMOKE=1
ok(){ printf '  \033[32m✓\033[0m %s\n' "$1"; }
warn(){ printf '  \033[33m!\033[0m %s\n' "$1"; }
bad(){ printf '  \033[31m✗\033[0m %s\n' "$1"; }
have(){ command -v "$1" >/dev/null 2>&1; }

echo "── Environment ─────────────────────────────"
# resolve python 3.12+ (last30days requires it). uv-managed installs aren't on PATH.
PY=""
for c in python3.14 python3.13 python3.12 python3; do
  if have "$c" && "$c" -c 'import sys;exit(0 if sys.version_info>=(3,12) else 1)' 2>/dev/null; then PY="$c"; break; fi
done
if [ -z "$PY" ] && have uv; then PY="$(uv python find '>=3.12' 2>/dev/null || true)"; fi
if [ -n "$PY" ]; then ok "Python 3.12+ for last30days: $("$PY" --version 2>&1)"; else bad "Python 3.12+ NOT found — last30days needs it (brew install python@3.13 or 'uv python install 3.13')"; fi
have gh && { gh auth status >/dev/null 2>&1 && ok "gh CLI authed (agent-reach GitHub backend)" || warn "gh installed but not authed (run: gh auth login)"; } || warn "gh CLI missing (agent-reach GitHub backend) — brew install gh"
have yt-dlp && ok "yt-dlp present (agent-reach YouTube backend)" || warn "yt-dlp missing — agent-reach install --env=auto"
have curl && ok "curl present (Jina web-read backend)" || bad "curl missing"

echo "── last30days ──────────────────────────────"
if [ -n "$PY" ] && [ -f "$ROOT/skills/last30days/scripts/last30days.py" ]; then
  SRC="$("$PY" "$ROOT/skills/last30days/scripts/last30days.py" --diagnose 2>/dev/null | "$PY" -c 'import sys,json;
try:
 d=json.load(sys.stdin); print(",".join(d.get("available_sources",[])))
except: print("")' 2>/dev/null)"
  if [ -n "$SRC" ]; then ok "active sources: $SRC"; else warn "engine ran but no sources resolved (check config)"; fi
  case "$SRC" in *scrapecreators*|*tiktok*) ok "ScrapeCreators key present (TikTok/IG/Threads — paid; YouTube is FREE via yt-dlp regardless)";; *) warn "no ScrapeCreators key — only TikTok/IG/Threads need it (paid). Reddit/HN/GitHub/YouTube/X/web are free.";; esac
  case "$SRC" in *x*|*twitter*) ok "X/Twitter active (browser cookies or token)";; *) warn "X/Twitter off — it's FREE: just log into x.com in Chrome/Safari/Firefox (cookies auto-extracted), or set AUTH_TOKEN+CT0. macOS Safari needs Full Disk Access.";; esac
else
  bad "last30days engine not runnable (need Python 3.12+ and skills/last30days/scripts/last30days.py)"
fi

echo "── agent-reach (router) ────────────────────"
if have agent-reach; then
  ok "agent-reach CLI installed"
  agent-reach doctor --json 2>/dev/null | "$PY" -c 'import sys,json
try:
 d=json.load(sys.stdin)
 live=[k for k,v in d.items() if isinstance(v,dict) and v.get("status")=="ok"]
 need=[k for k,v in d.items() if isinstance(v,dict) and v.get("status")!="ok"]
 print("  live now:   "+", ".join(live)); print("  needs setup:"+", ".join(need))
except Exception as e: print("  (doctor unavailable)")' 2>/dev/null || warn "doctor failed"
else
  warn "agent-reach not installed — run: bash skills/agent-reach/scripts/setup.sh"
fi

# LinkedIn persistent service (optional; desks fall back to public-page reads without it)
if curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8371/mcp 2>/dev/null | grep -qE '^4(0[056]|29)$'; then
  ok "LinkedIn service: up (authenticated search available) — diagnose: bash scripts/linkedin-setup.sh status"
else
  warn "LinkedIn service: not running (optional — public-page reads still work). Setup: bash scripts/linkedin-setup.sh"
fi

if [ "$SMOKE" = "1" ]; then
  echo "── Smoke test (real keyless calls) ─────────"
  # 1) agent-reach keyless web read (Jina)
  if curl -s --max-time 20 "https://r.jina.ai/https://example.com" 2>/dev/null | grep -qi "example domain"; then ok "agent-reach web-read (Jina) returned content"; else bad "Jina web-read failed (network?)"; fi
  # 2) GitHub search
  if have gh && gh search repos "claude code" --limit 1 >/dev/null 2>&1; then ok "GitHub search returned"; else warn "GitHub search unavailable"; fi
  # 3) last30days real micro-run on keyless Reddit
  if [ -n "$PY" ]; then
    OUT="$(EXCLUDE_SOURCES=tiktok,instagram,youtube,threads,bluesky "$PY" "$ROOT/skills/last30days/scripts/last30days.py" "product analytics" --emit=compact --quick 2>/dev/null)"
    if printf '%s' "$OUT" | grep -q "Total evidence"; then ok "last30days returned ranked evidence ($(printf '%s' "$OUT" | grep -oE '[0-9]+ items' | head -1))"; else warn "last30days micro-run returned thin/no evidence (topic or network)"; fi
  fi
  # 4) ScrapeCreators CREDIT probe — a present key can still be out of credits (HTTP 402),
  #    which silently zeroes TikTok/IG/Threads. Touch one SC source and look for 402.
  if [ -n "$PY" ]; then
    SCERR="$(EXCLUDE_SOURCES=reddit,hackernews,polymarket,github,grounding,youtube "$PY" "$ROOT/skills/last30days/scripts/last30days.py" "test" --tiktok-hashtags=test --quick 2>&1 >/dev/null)"
    if printf '%s' "$SCERR" | grep -q "402"; then bad "ScrapeCreators key is OUT OF CREDITS (HTTP 402) → TikTok/IG/Threads return NOTHING. Top up at scrapecreators.com."; \
    elif printf '%s' "$SCERR" | grep -qiE 'tiktok|scrapecreators'; then ok "ScrapeCreators reachable (no 402)"; fi
  fi
fi

echo "────────────────────────────────────────────"
echo "FREE: Reddit · HN · Polymarket · GitHub · YouTube · X (log into x.com) · web · V2EX · Bilibili · RSS · TikTok (reach.sh tiktok @user reliable; tiktok-search <hashtag> free but FLAKY) · Instagram (reach.sh ig user / ig-search <hashtag>, needs login + local residential IP)."
echo "SC = reliable FALLBACK for TikTok/IG hashtag search (when the free flaky path fails) + Threads/Pinterest + YT comments. Run agent-reach/scripts/setup.sh to install the free stack (curl_cffi + instaloader + TikTokApi + webkit)."
