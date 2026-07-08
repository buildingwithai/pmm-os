#!/bin/bash
# Double-click to launch the Launch Kit editor (macOS).
cd "$(dirname "$0")" || exit 1
URL="http://127.0.0.1:4317/"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install it from https://nodejs.org (LTS), then double-click again."
  read -r -p "Press Return to close…" _; exit 1
fi
# already running? just open it.
if curl -s -o /dev/null "$URL" 2>/dev/null; then
  echo "Editor already running — opening $URL"; open "$URL"; exit 0
fi
echo "Starting Launch Kit editor…"
node kit-server.mjs &
SRV=$!
for i in $(seq 1 20); do curl -s -o /dev/null "$URL" 2>/dev/null && break; sleep 0.5; done
open "$URL"
echo "Editor at $URL  —  TipTap loads automatically when you click Edit."
echo "Close this window (or Ctrl-C) to stop the editor."
wait $SRV
