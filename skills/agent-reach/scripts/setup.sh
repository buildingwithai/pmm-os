#!/usr/bin/env bash
# Agent-Reach first-run setup for PMM OS. Idempotent. Installs from the VENDORED
# source (skills/agent-reach/vendor) so it works on a fresh marketplace install
# with no PyPI/GitHub dependency, then installs free backends + health-checks.
set -e
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VENDOR="$SKILL_DIR/vendor"
# --no-social-wire installs software only and does NOT read browser cookies (used by the
# auto-install hook; the cookie read stays an explicit `reach.sh social-setup`).
NO_SOCIAL_WIRE=0; [ "${1:-}" = "--no-social-wire" ] && NO_SOCIAL_WIRE=1
if ! command -v agent-reach >/dev/null 2>&1; then
  echo "Installing agent-reach from vendored source ($VENDOR)…"
  if   command -v pipx >/dev/null 2>&1; then pipx install "$VENDOR"
  elif command -v uv   >/dev/null 2>&1; then uv tool install "$VENDOR"
  else python3 -m pip install --user "$VENDOR"; fi
fi
echo "Installing free backends (bird CLI, yt-dlp, Jina, etc.)…"
agent-reach install --env=auto || true

# YouTube fix: recent YouTube needs a JS runtime for yt-dlp. agent-reach reports
# youtube as "needs setup" until this is configured. If node is present, wire it
# (cross-platform config path; idempotent).
if command -v node >/dev/null 2>&1; then
  ytcfg="$HOME/.config/yt-dlp/config"; mkdir -p "$(dirname "$ytcfg")"
  grep -qxF -- '--js-runtimes node' "$ytcfg" 2>/dev/null || printf '%s\n' '--js-runtimes node' >> "$ytcfg"
  echo "Configured yt-dlp JS runtime (node) → YouTube backend enabled."
else
  echo "Note: install Node for the YouTube backend (yt-dlp needs a JS runtime)."
fi

# Free TikTok + Instagram (incl. hashtag SEARCH), no ScrapeCreators:
#   curl_cffi   → yt-dlp impersonation (reliable TikTok user lookup)
#   instaloader → free Instagram (run on a LOCAL residential IP; one-time `instaloader --login`)
#   TikTokApi+webkit → free TikTok hashtag SEARCH (headless webkit evades TikTok's bot block)
if python3 -m pip install --quiet --user curl_cffi instaloader TikTokApi browser_cookie3 >/dev/null 2>&1; then
  python3 -m playwright install webkit >/dev/null 2>&1 || true
  echo "Installed curl_cffi + instaloader + TikTokApi(+webkit) → FREE TikTok/IG, incl. search:"
  echo "  reach.sh tiktok @user · tiktok-search <hashtag> · ig user · ig-search <hashtag>"
else
  echo "Tip: pip install curl_cffi instaloader TikTokApi && python3 -m playwright install webkit → free TikTok/IG search."
fi

echo "── agent-reach doctor ──"
agent-reach doctor --json 2>/dev/null || agent-reach doctor || true
echo "Live keyless now: GitHub, web-read (any URL), V2EX, Bilibili, RSS, YouTube."
echo "Login/key platforms (Reddit, XiaoHongShu, Exa) unlock via: agent-reach configure"
echo "Verify anytime: bash scripts/verify-research.sh --smoke"
echo
echo "════ Social research (X + Instagram + TikTok) — no passwords, reads your browser ════"
if [ "$NO_SOCIAL_WIRE" = "0" ]; then
  echo "Auto-wiring any sites you're already logged into…"
  bash "$(dirname "$0")/reach.sh" social-setup all 2>/dev/null || true
else
  echo "To wire X/Instagram/TikTok: log into the sites in your browser, then run  reach.sh social-setup"
fi
echo
bash "$(dirname "$0")/reach.sh" social-status 2>/dev/null || true
echo "Full guide: skills/product-marketing-os/references/social-auth-setup.md"
