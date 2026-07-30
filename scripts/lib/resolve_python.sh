#!/usr/bin/env bash
# Shell binding for config/python-policy.json. Source it, then call pmm_resolve_python.
#
#   . "$(dirname "$0")/../scripts/lib/resolve_python.sh"     # adjust depth as needed
#   PY="$(pmm_resolve_python)" || exit 1
#
# Deliberately NOT inside skills/last30days/scripts/ — sync-research-engines.sh
# does `rm -rf` on that directory, which would delete this on the next upstream pull.
#
# Keeps the policy's probe order: 3.13 and 3.12 before 3.14, because the engine
# declares a floor of 3.12 and no ceiling, and nothing above 3.13 is tested.
# Stock macOS ships 3.9, so "nothing suitable on PATH" is the common case.

pmm_resolve_python() {
  local allow_install="${1:-}"
  local here policy min probe
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  policy="$here/../../config/python-policy.json"

  _pmm_ok() { [ -x "$(command -v "$1" 2>/dev/null)" ] && \
    "$1" -c 'import sys; sys.exit(0 if sys.version_info >= (3,12) else 1)' 2>/dev/null; }

  # An explicit override that is wrong should FAIL, not be quietly ignored.
  if [ -n "${L30D_PYTHON:-}" ]; then
    if _pmm_ok "$L30D_PYTHON"; then printf '%s' "$L30D_PYTHON"; return 0; fi
    echo "✗ L30D_PYTHON=$L30D_PYTHON is not Python 3.12+" >&2
    return 1
  fi

  # Read the probe order from the policy when python/jq can parse it; fall back to
  # the same literal order so this still works with no interpreter at all.
  probe="python3.13 python3.12 python3.14 python3.15 python3 python"
  if command -v python3 >/dev/null 2>&1 && [ -f "$policy" ]; then
    probe="$(python3 -c '
import json,sys
try: print(" ".join(json.load(open(sys.argv[1]))["probeOrder"]))
except Exception: print("python3.13 python3.12 python3.14 python3.15 python3 python")
' "$policy" 2>/dev/null || echo "$probe")"
  fi

  for c in $probe; do
    if _pmm_ok "$c"; then command -v "$c"; return 0; fi
  done

  if command -v uv >/dev/null 2>&1; then
    local p; p="$(uv python find '>=3.12' 2>/dev/null || true)"
    if [ -n "$p" ] && _pmm_ok "$p"; then printf '%s' "$p"; return 0; fi
    if [ "$allow_install" = "--allow-install" ]; then
      echo "→ no Python 3.12+ found; fetching 3.13 via uv (~28MB, once)…" >&2
      uv python install 3.13 >&2 || true
      p="$(uv python find '>=3.12' 2>/dev/null || true)"
      if [ -n "$p" ] && _pmm_ok "$p"; then printf '%s' "$p"; return 0; fi
    fi
  fi

  cat >&2 <<'EOF'
✗ No Python 3.12+ found, and the research engine requires it.

  Install one:
    brew install python@3.13          (macOS)
    winget install Python.Python.3.13 (Windows)
    sudo apt install python3.13       (Linux)
    uv python install 3.13            (any platform, if you have uv)

  Or point at an existing one:  L30D_PYTHON=/path/to/python3.13
EOF
  return 1
}
