#!/usr/bin/env bash
set -euo pipefail

CHROME_BINARY="${CHROME_FOR_TESTING_BINARY:-}"
if [[ -z "$CHROME_BINARY" ]]; then
  CHROME_BINARY="$(find "$HOME/.cache/chrome-for-testing/chrome" -path '*/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' -type f 2>/dev/null | sort -V | tail -1)"
fi

if [[ -z "$CHROME_BINARY" || ! -x "$CHROME_BINARY" ]]; then
  echo "Chrome for Testing binary was not found under $HOME/.cache/chrome-for-testing/chrome" >&2
  exit 1
fi

PROFILE_DIR="${AGENT_CHROME_FOR_TESTING_USER_DATA_DIR:-$HOME/Library/Application Support/Google/Chrome for Testing}"
PROFILE_NAME="${AGENT_CHROME_FOR_TESTING_PROFILE:-Default}"
EXTENSION_DIR="${AGENT_DEV_EXTENSION:-/Users/jovannytovar/pmm-clean/extensions/Job-Application-tracker/chrome-extension-dev}"

if [[ ! -d "$EXTENSION_DIR" ]]; then
  echo "project dev extension folder not found: $EXTENSION_DIR" >&2
  exit 1
fi

mkdir -p "$PROFILE_DIR"

PORT_PIDS="$(lsof -tiTCP:9222 -sTCP:LISTEN 2>/dev/null || true)"
if [[ -n "$PORT_PIDS" ]]; then
  PORT_PID_CSV="$(echo "$PORT_PIDS" | paste -sd, -)"
  PORT_COMMANDS="$(ps -p "$PORT_PID_CSV" -o command= 2>/dev/null || true)"
  if grep -q "Google Chrome for Testing" <<<"$PORT_COMMANDS"; then
    echo "Chrome for Testing already owns 127.0.0.1:9222."
    exit 0
  fi

  echo "Port 9222 is already in use by a non-Chrome-for-Testing process:" >&2
  echo "$PORT_COMMANDS" >&2
  if [[ -t 0 ]]; then
    read -r -p "Close that process and launch Chrome for Testing instead? [y/N] " answer
    case "$answer" in
      y|Y|yes|YES)
        kill $PORT_PIDS
        sleep 1
        ;;
      *)
        echo "Leaving existing process alone. Chrome for Testing was not launched." >&2
        exit 2
        ;;
    esac
  else
    echo "Not running interactively, so refusing to close it automatically." >&2
    exit 2
  fi
fi

exec "$CHROME_BINARY" \
  --remote-debugging-port=9222 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$PROFILE_DIR" \
  --profile-directory="$PROFILE_NAME" \
  --load-extension="$EXTENSION_DIR"
