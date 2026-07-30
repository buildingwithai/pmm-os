#!/usr/bin/env bash
# Leak scrub — blocks `npm publish` (prepublishOnly) and `git push` (pre-push hook).
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
#
# Scan set is EVERY TRACKED FILE, not the npm `files` whitelist. The 2026-07-08
# leak sat in a directory the old hardcoded SHIP_DIRS list didn't name, and it
# leaked via the public *repo*, which `npm publish` gates never see.
#
# Missing denylist FAILS. A scrub that passes because it checked nothing is
# worse than no scrub — that is how 3.0.0 shipped.
# Escape hatch for CI/contributors who have no denylist: PMM_OS_SCRUB_NO_DENYLIST=1
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DENYLIST="${PMM_OS_SCRUB_DENYLIST:-$HOME/.config/pmm-os/scrub-denylist.txt}"
FAIL=0

ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; FAIL=1; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }

echo "── leak scrub ($(git -C "$ROOT" ls-files | wc -l | tr -d ' ') tracked files) ──"

# git grep searches exactly the tracked set, is binary-safe, and is fast.
# ponytail: tracked-only. Untracked files can't reach GitHub, and npm `files`
# entries are all tracked here — verified by the payload check below.
scan() { git -C "$ROOT" grep -InE "$1" -- . 2>/dev/null; }

# 1. secrets (generic patterns — safe to be public)
HITS=$(scan '(sk-ant-[A-Za-z0-9_-]{10,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[bpors]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|npm_[A-Za-z0-9]{30,}|AIza[0-9A-Za-z_-]{30,}|sk-[A-Za-z0-9]{32,}|-----BEGIN [A-Z ]*PRIVATE KEY)' \
  | grep -viE 'twitter-client-base\.js' | head -5)   # known-public Twitter web token lives there
if [ -n "$HITS" ]; then bad "secret-pattern hits:"; printf '%s\n' "$HITS" | sed 's/^/      /'; else ok "secrets: clean"; fi

# 2+3. owner denylist (strategy terms + run fingerprints) — from the PRIVATE file
if [ -f "$DENYLIST" ]; then
  TERMS=$(grep -vE '^\s*(#|$)' "$DENYLIST" | paste -sd'|' -)
  if [ -n "$TERMS" ]; then
    HITS=$(git -C "$ROOT" grep -IliE "$TERMS" -- . 2>/dev/null | head -10)
    if [ -n "$HITS" ]; then
      bad "denylist hits (strategy/fingerprint terms) in tracked files:"
      printf '%s\n' "$HITS" | sed 's/^/      /'
    else
      ok "denylist ($(printf '%s' "$TERMS" | tr '|' '\n' | wc -l | tr -d ' ') terms): clean"
    fi
  else
    bad "denylist at $DENYLIST is EMPTY — classes 2+3 unchecked. Refusing."
  fi
elif [ "${PMM_OS_SCRUB_NO_DENYLIST:-0}" = "1" ]; then
  warn "PMM_OS_SCRUB_NO_DENYLIST=1 — strategy/fingerprint check deliberately skipped."
else
  bad "NO DENYLIST at $DENYLIST — classes 2+3 unchecked. Refusing to pass."
  warn "Create it (one extended-regex term per line, chmod 600), or set"
  warn "PMM_OS_SCRUB_NO_DENYLIST=1 if you are not the owner and have nothing to hide."
fi

# 4. personal / machine identifiers that shouldn't be in a public repo
HITS=$(scan '/(Users|home)/[a-z][a-z0-9_.-]+/' | grep -viE 'skills/(last30days|agent-reach)/' | head -5)
if [ -n "$HITS" ]; then bad "hardcoded home-directory paths:"; printf '%s\n' "$HITS" | sed 's/^/      /'; else ok "no hardcoded home paths"; fi

# 5. build artifacts and local files that must never be tracked
JUNK=$(git -C "$ROOT" ls-files | grep -Ei '\.pyc$|\.DS_Store$|(^|/)__pycache__/|(^|/)node_modules/|(^|/)\.env($|\.)' | head -10)
if [ -n "$JUNK" ]; then bad "junk/artifact files are tracked:"; printf '%s\n' "$JUNK" | sed 's/^/      /'; else ok "no tracked artifacts"; fi

# 6. files that exist locally but must never be tracked or shipped
for f in HANDOFF.md .env; do
  [ -f "$ROOT/$f" ] && ! git -C "$ROOT" check-ignore -q "$f" 2>/dev/null && bad "$f exists and is NOT gitignored"
done

# 7. every path npm claims to ship actually exists
MISSING=""
for p in $(node -e 'try{console.log((require("'"$ROOT"'/package.json").files||[]).join(" "))}catch(e){}' 2>/dev/null); do
  [ -e "$ROOT/${p%/}" ] || MISSING="$MISSING $p"
done
if [ -n "$MISSING" ]; then bad "package.json \"files\" references missing paths:$MISSING"; else ok "npm payload paths resolve"; fi

if [ "$FAIL" = "1" ]; then
  echo "✗ scrub FAILED — fix the hits above." >&2
  exit 1
fi
echo "✓ scrub passed."
