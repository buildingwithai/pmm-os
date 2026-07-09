#!/usr/bin/env bash
# LinkedIn research channel — one-command setup, status, and repair.
#
#   bash scripts/linkedin-setup.sh            set up (import session + start service + register)
#   bash scripts/linkedin-setup.sh status     diagnose: never-configured / service-down / session-expired
#   bash scripts/linkedin-setup.sh reauth     refresh the session from your browser (after expiry)
#   bash scripts/linkedin-setup.sh stop       stop + unload the service
#
# Philosophy (same as reach.sh social-setup): PMM OS NEVER asks for your password.
# You stay logged into linkedin.com in your normal browser; this imports that
# session locally (validated, stored 0600 in ~/.linkedin-mcp/profile) and runs a
# small always-on local service the research desks call. Nothing leaves your machine.
set -u

PORT=8371
HOME_DIR="${HOME}"
LMCP_DIR="$HOME_DIR/.linkedin-mcp"
SERVE="$LMCP_DIR/bin/serve.sh"
PLIST="$HOME_DIR/Library/LaunchAgents/com.pmmos.linkedin-mcp.plist"
LABEL="com.pmmos.linkedin-mcp"
PKG="git+https://github.com/stickerdaniel/linkedin-mcp-server"
URL="http://127.0.0.1:$PORT/mcp"

ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; }

service_up() { curl -s -o /dev/null -w '%{http_code}' "$URL" 2>/dev/null | grep -qE '^4(0[056]|29)$'; }

need_uvx() {
  command -v uvx >/dev/null 2>&1 && return 0
  bad "uvx not found — install uv first:  curl -LsSf https://astral.sh/uv/install.sh | sh"
  return 1
}

import_session() {
  # Reads the LinkedIn session from your browser (Chrome first, then others).
  # Fails with a plain-English fix if you're not logged in anywhere.
  local browser out
  for browser in chrome brave edge firefox; do
    out=$(uvx --from "$PKG" mcp-server-linkedin --import-from-browser "$browser" --status 2>&1)
    if printf '%s' "$out" | grep -q "Imported and validated"; then
      ok "LinkedIn session imported from $browser (validated, stored locally in $LMCP_DIR/profile)"
      return 0
    fi
  done
  bad "No valid LinkedIn session found in Chrome/Brave/Edge/Firefox."
  echo    "    Fix (no password ever enters the plugin):"
  echo    "      1. Open your normal browser and log into https://www.linkedin.com"
  echo    "      2. Re-run:  bash scripts/linkedin-setup.sh"
  return 1
}

write_service() {
  mkdir -p "$LMCP_DIR/bin"
  cat > "$SERVE" <<EOF
#!/bin/sh
# Persistent LinkedIn MCP service for PMM OS research desks.
# Session lives in the persisted profile dir (imported from your browser) — no secrets here.
exec uvx --from $PKG \\
  mcp-server-linkedin --transport streamable-http --host 127.0.0.1 --port $PORT \\
  --path /mcp --eager-full-chromium --no-auto-import
EOF
  chmod +x "$SERVE"
  if [ "$(uname)" = "Darwin" ]; then
    cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>/bin/sh</string><string>$SERVE</string></array>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>$HOME_DIR/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string></dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$LMCP_DIR/server.log</string>
  <key>StandardErrorPath</key><string>$LMCP_DIR/server.err</string>
</dict>
</plist>
EOF
    launchctl unload "$PLIST" 2>/dev/null
    launchctl load "$PLIST" && ok "service installed + started (launchd, survives reboots)"
  else
    warn "non-macOS: start the service yourself (systemd/nohup):  nohup $SERVE >$LMCP_DIR/server.log 2>&1 &"
    nohup "$SERVE" > "$LMCP_DIR/server.log" 2>&1 &
    ok "service started in background (add a systemd unit to survive reboots)"
  fi
  local i
  for i in $(seq 1 15); do sleep 4; service_up && { ok "service answering on $URL"; return 0; }; done
  bad "service did not come up — check $LMCP_DIR/server.err"
  return 1
}

register_mcporter() {
  if ! command -v mcporter >/dev/null 2>&1; then
    warn "mcporter not found — the desks can still use LinkedIn public-page reads (Jina)."
    echo "    For full search tools:  npm i -g mcporter   (needs Node >= 20), then re-run this script."
    return 0
  fi
  if ! mcporter config list >/dev/null 2>&1; then
    warn "mcporter is installed but broken (usually a Node <20 mismatch)."
    echo "    Fix: reinstall with Node >= 20 on PATH:  npm i -g mcporter"
    return 0
  fi
  if mcporter config list 2>/dev/null | grep -qi '^linkedin'; then
    ok "mcporter: linkedin already registered"
  else
    mcporter config add linkedin "$URL" >/dev/null 2>&1 \
      && ok "mcporter: linkedin -> $URL registered" \
      || warn "could not auto-register — add manually:  mcporter config add linkedin $URL"
  fi
}

live_check() {
  command -v mcporter >/dev/null 2>&1 || { warn "skipping live check (no mcporter)"; return 0; }
  local out
  out=$(mcporter call 'linkedin.get_my_profile()' 2>&1)
  if printf '%s' "$out" | grep -qiE '"name"|"url"|profile'; then
    ok "live check passed — LinkedIn research is ACTIVE (authenticated as you)"
  elif printf '%s' "$out" | grep -qiE 'login (window|is still)|authentication'; then
    bad "SESSION EXPIRED or invalid."
    echo "    Fix: log into https://www.linkedin.com in your browser, then run:"
    echo "      bash scripts/linkedin-setup.sh reauth"
  else
    warn "live check inconclusive — first call after start can be slow; try:  bash scripts/linkedin-setup.sh status"
  fi
}

status() {
  echo "── LinkedIn research channel ──"
  if [ ! -d "$LMCP_DIR/profile" ]; then
    bad "NEVER CONFIGURED — no session has been imported yet."
    echo "    Fix:  bash scripts/linkedin-setup.sh   (log into linkedin.com in your browser first)"
    return 1
  fi
  if ! service_up; then
    bad "SERVICE DOWN — session exists but the local service isn't running."
    if [ "$(uname)" = "Darwin" ] && [ -f "$PLIST" ]; then
      echo "    Fix:  launchctl load $PLIST"
    else
      echo "    Fix:  nohup $SERVE >$LMCP_DIR/server.log 2>&1 &"
    fi
    return 1
  fi
  ok "service up on $URL"
  live_check
}

case "${1:-setup}" in
  status) status ;;
  stop)
    [ "$(uname)" = "Darwin" ] && launchctl unload "$PLIST" 2>/dev/null
    pkill -f mcp-server-linkedin 2>/dev/null
    ok "service stopped" ;;
  reauth)
    need_uvx || exit 1
    import_session || exit 1
    if [ "$(uname)" = "Darwin" ]; then launchctl kickstart -k "gui/$(id -u)/$LABEL" 2>/dev/null || { launchctl unload "$PLIST" 2>/dev/null; launchctl load "$PLIST"; }; else pkill -f mcp-server-linkedin 2>/dev/null; nohup "$SERVE" > "$LMCP_DIR/server.log" 2>&1 & fi
    sleep 8; live_check ;;
  setup|*)
    echo "── LinkedIn research channel — setup (no passwords, ever) ──"
    need_uvx || exit 1
    import_session || exit 1
    write_service || exit 1
    register_mcporter
    live_check
    echo
    echo "Done. Diagnose anytime:  bash scripts/linkedin-setup.sh status"
    ;;
esac
