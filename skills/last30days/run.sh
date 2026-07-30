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

# Shared resolver — one policy (config/python-policy.json), three bindings.
# Deliberately sourced from scripts/lib/, which sync-research-engines.sh does not
# delete; skills/last30days/scripts/ is wiped on every upstream pull.
. "$HERE/../../scripts/lib/resolve_python.sh"
PY="$(pmm_resolve_python "${PMM_ALLOW_PY_INSTALL:-}")" || exit 1

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
