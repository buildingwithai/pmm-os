#!/usr/bin/env bash
# Linux / macOS terminal launcher for the Launch Kit editor.
cd "$(dirname "$0")" || exit 1
URL="http://127.0.0.1:4317/"
command -v node >/dev/null 2>&1 || { echo "Node.js required: https://nodejs.org"; exit 1; }
if command -v curl >/dev/null 2>&1 && curl -s -o /dev/null "$URL" 2>/dev/null; then echo "Already running: $URL"; else node kit-server.mjs & fi
# best-effort open
( command -v xdg-open >/dev/null 2>&1 && xdg-open "$URL" ) || ( command -v open >/dev/null 2>&1 && open "$URL" ) || echo "Open $URL in your browser."
wait
