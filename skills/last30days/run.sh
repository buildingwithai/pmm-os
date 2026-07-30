#!/usr/bin/env bash
# Run the last30days engine under a Python it can actually use.
#
# Why this exists: the engine needs Python 3.12+. Stock macOS ships 3.9, so
# `python3 last30days.py ...` prints "requires Python 3.12+" and stops — even on
# machines that already have a newer Python sitting in uv or Homebrew. The
# fallback used to be prose in SKILL.md that the model had to notice and follow;
# this makes it mechanical.
#
#   bash skills/last30days/run.sh "<topic>" [engine flags...]
#
# Resolution order: an explicit L30D_PYTHON, then the newest python3.N on PATH,
# then a uv-managed interpreter, then uv's ability to fetch one (~28MB, once).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ENGINE="$HERE/scripts/last30days.py"
[ -f "$ENGINE" ] || { echo "✗ engine missing at $ENGINE" >&2; exit 1; }

ok_py() { [ -x "$1" ] && "$1" -c 'import sys; sys.exit(0 if sys.version_info >= (3,12) else 1)' 2>/dev/null; }

PY="${L30D_PYTHON:-}"
if [ -n "$PY" ] && ! ok_py "$PY"; then
  echo "✗ L30D_PYTHON=$PY is not Python 3.12+" >&2; exit 1
fi

if [ -z "$PY" ]; then
  for c in python3.13 python3.12 python3.14 python3; do
    p="$(command -v "$c" 2>/dev/null || true)"
    [ -n "$p" ] && ok_py "$p" && { PY="$p"; break; }
  done
fi

# uv keeps interpreters outside PATH; ask it before downloading anything.
if [ -z "$PY" ] && command -v uv >/dev/null 2>&1; then
  p="$(uv python find '>=3.12' 2>/dev/null || true)"
  [ -n "$p" ] && ok_py "$p" && PY="$p"
  if [ -z "$PY" ]; then
    echo "→ no Python 3.12+ found; fetching one via uv (about 28MB, one time)…" >&2
    uv python install 3.13 >&2 || true
    p="$(uv python find '>=3.12' 2>/dev/null || true)"
    [ -n "$p" ] && ok_py "$p" && PY="$p"
  fi
fi

if [ -z "$PY" ]; then
  cat >&2 <<'EOF'
✗ last30days needs Python 3.12+ and none was found.
  Install one of:
    brew install python@3.13          (macOS)
    uv python install 3.13            (any platform, if you have uv)
    winget install Python.Python.3.13 (Windows)
  Or point at an existing one:  L30D_PYTHON=/path/to/python3.13
EOF
  exit 1
fi

# The engine prints "Research quality: 5/5 core sources" even when TikTok,
# Instagram, Threads and Pinterest all returned nothing because the
# ScrapeCreators key is out of credit (HTTP 402). Four silent zeros read as a
# thin topic rather than an unpaid bill, so surface it.
TMP_ERR="$(mktemp)"
trap 'rm -f "$TMP_ERR"' EXIT
set +e
"$PY" "$ENGINE" "$@" 2> >(tee "$TMP_ERR" >&2)
CODE=$?
set -e
if grep -q "402: Payment Required" "$TMP_ERR" 2>/dev/null; then
  blocked=$(grep -oE '\[(TikTok|Instagram|Threads|Pinterest|YouTube)\][^:]*: HTTP 402' "$TMP_ERR" \
            | grep -oE '\[[A-Za-z]+\]' | tr -d '[]' | sort -u | paste -sd', ' -)
  cat >&2 <<EOF

⚠️  Sources returned nothing because the ScrapeCreators key is out of credit (HTTP 402):
      ${blocked:-TikTok, Instagram, Threads, Pinterest}
    The engine still reports "core sources" as healthy — these are counted as bonus,
    so a zero here looks like a thin topic rather than an unpaid bill.
    Top up or rotate SCRAPECREATORS_API_KEY in ~/.config/last30days/.env
EOF
fi
exit $CODE
