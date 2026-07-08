#!/usr/bin/env bash
# PMM OS research store helper. Standardizes WHERE research lands so the rest of
# the plugin can hydrate from it. Run from the user's project root.
#
#   research-store.sh init                      # scaffold .agents/research/ + evidence.md
#   research-store.sh add <slug> <engine> <file># capture a run into runs/<date>-<slug>-<engine>.md
#   research-store.sh selftest                  # runnable check (no side effects on your project)
#
# Spec: skills/product-marketing-os/references/research-context-pipeline.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE="$SCRIPT_DIR/../skills/product-marketing-os/assets/research-evidence-template.md"
slugify() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-//;s/-$//'; }

store_init() {  # $1 = project root (default .)
  local root="${1:-.}"
  local base="$root/.agents/research"
  mkdir -p "$base/runs"
  if [ ! -f "$base/evidence.md" ]; then
    if [ -f "$TEMPLATE" ]; then cp "$TEMPLATE" "$base/evidence.md"
    else printf '# Research Evidence Ledger\n\n(template missing; see research-context-pipeline.md)\n' > "$base/evidence.md"; fi
    echo "created $base/evidence.md"
  else echo "$base/evidence.md already exists"; fi
  echo "store ready: $base/{evidence.md, runs/}"
}

store_add() {  # $1 slug  $2 engine  $3 file  [$4 root]
  local slug engine file root base dest
  slug="$(slugify "${1:?slug required}")"; engine="$(slugify "${2:?engine required}")"
  file="${3:?run file required}"; root="${4:-.}"; base="$root/.agents/research"
  [ -f "$file" ] || { echo "no such file: $file" >&2; return 1; }
  mkdir -p "$base/runs"
  dest="$base/runs/$(date +%F)-${slug}-${engine}.md"
  cp "$file" "$dest"
  echo "captured → $dest"
  echo "next: distill into $base/evidence.md (pmm-product-context), keep the source URL on every claim."
}

selftest() {
  local tmp; tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' RETURN
  store_init "$tmp" >/dev/null
  printf 'raw run\n' > "$tmp/run.txt"
  store_add "Acme Corp" "Last30Days" "$tmp/run.txt" "$tmp" >/dev/null
  local n; n="$(ls "$tmp/.agents/research/runs/"*-acme-corp-last30days.md 2>/dev/null | wc -l | tr -d ' ')"
  [ -f "$tmp/.agents/research/evidence.md" ] || { echo "FAIL: evidence.md not created"; return 1; }
  [ "$n" = "1" ] || { echo "FAIL: run not captured with dated/slugged name"; return 1; }
  echo "selftest OK (evidence.md scaffolded; run captured + slugged + dated)"
}

case "${1:-}" in
  init)     store_init "${2:-.}" ;;
  add)      shift; store_add "$@" ;;
  selftest) selftest ;;
  *) echo "usage: research-store.sh {init|add <slug> <engine> <file>|selftest}" >&2; exit 2 ;;
esac
