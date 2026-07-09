#!/usr/bin/env bash
# Pre-publish scrub — blocks `npm publish` (via prepublishOnly) until clean.
#
# Three leak classes, learned the hard way:
#   1. secrets/keys/tokens
#   2. private strategy content
#   3. run fingerprints in doc prose (example verbatims, entity lists, real
#      subreddit/handle/venue names from an owner's actual research runs)
#
# Classes 2+3 are owner-specific terms. They must NEVER be hardcoded here (this
# script is public — the denylist itself would be the leak). They live in a
# PRIVATE file outside the repo, one extended-regex term per line, # comments ok:
#     ~/.config/pmm-os/scrub-denylist.txt   (chmod 600)
# No denylist file => that check is SKIPPED WITH A LOUD WARNING, not silently.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DENYLIST="${PMM_OS_SCRUB_DENYLIST:-$HOME/.config/pmm-os/scrub-denylist.txt}"
FAIL=0

ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; FAIL=1; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }

echo "── pre-publish scrub ──"

# --- what would actually ship: respect the npm files whitelist ---
SHIP_DIRS=""
for d in bin skills hooks scripts .claude-plugin .codex-plugin .agents/plugins docs/images demo mcp config assets; do
  [ -e "$ROOT/$d" ] && SHIP_DIRS="$SHIP_DIRS $ROOT/$d"
done
SHIP_FILES="$ROOT/package.json $ROOT/README.md"
[ -f "$ROOT/THIRD_PARTY_NOTICES.md" ] && SHIP_FILES="$SHIP_FILES $ROOT/THIRD_PARTY_NOTICES.md"

# 1. secrets (generic patterns — safe to be public)
HITS=$(grep -rInE '(sk-ant-[A-Za-z0-9_-]{10,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[bpors]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|npm_[A-Za-z0-9]{30,}|AIza[0-9A-Za-z_-]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY)' \
  $SHIP_DIRS $SHIP_FILES 2>/dev/null \
  | grep -viE 'twitter-client-base\.js' | head -5)   # known-public Twitter web token lives there
if [ -n "$HITS" ]; then bad "secret-pattern hits:"; printf '%s\n' "$HITS" | sed 's/^/      /'; else ok "secrets: clean"; fi

# 2+3. owner denylist (strategy terms + run fingerprints) — from the PRIVATE file
if [ -f "$DENYLIST" ]; then
  TERMS=$(grep -vE '^\s*(#|$)' "$DENYLIST" | paste -sd'|' -)
  if [ -n "$TERMS" ]; then
    HITS=$(grep -rIliE "$TERMS" $SHIP_DIRS $SHIP_FILES 2>/dev/null | head -10)
    if [ -n "$HITS" ]; then
      bad "denylist hits (strategy/fingerprint terms) in files that would ship:"
      printf '%s\n' "$HITS" | sed 's/^/      /'
    else
      ok "denylist ($(printf '%s' "$TERMS" | tr '|' '\n' | wc -l | tr -d ' ') terms): clean"
    fi
  else
    warn "denylist file is empty — class 2+3 unchecked"
  fi
else
  warn "NO DENYLIST at $DENYLIST — strategy/fingerprint check SKIPPED."
  warn "Create it (one regex term per line, chmod 600) before publishing from this machine."
fi

# 4. gitignored-on-purpose files that must never ship
for f in HANDOFF.md .env; do
  [ -f "$ROOT/$f" ] && ! git -C "$ROOT" check-ignore -q "$f" 2>/dev/null && bad "$f exists and is NOT gitignored"
done
ok "handoff/env hygiene checked"

if [ "$FAIL" = "1" ]; then
  echo "✗ scrub FAILED — fix the hits above before publishing." >&2
  exit 1
fi
echo "✓ scrub passed."
