#!/usr/bin/env bash
# Refresh the vendored research engines (last30days, Agent-Reach) from upstream.
# Run from the repo root: bash scripts/sync-research-engines.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

echo "→ last30days"
git clone --depth 1 https://github.com/mvanhorn/last30days-skill.git "$TMP/l30" >/dev/null 2>&1
rm -rf "$ROOT/skills/last30days/scripts" "$ROOT/skills/last30days/references" "$ROOT/skills/last30days/agents"
cp "$TMP/l30/skills/last30days/SKILL.md" "$ROOT/skills/last30days/SKILL.md"
cp -r "$TMP/l30/skills/last30days/scripts" "$ROOT/skills/last30days/scripts"
cp -r "$TMP/l30/skills/last30days/references" "$ROOT/skills/last30days/references" 2>/dev/null || true
cp -r "$TMP/l30/skills/last30days/agents" "$ROOT/skills/last30days/agents" 2>/dev/null || true
cp "$TMP/l30/LICENSE" "$ROOT/skills/last30days/LICENSE.upstream" 2>/dev/null || true

echo "→ Agent-Reach"
git clone --depth 1 https://github.com/Panniantong/Agent-Reach.git "$TMP/ar" >/dev/null 2>&1
cp "$TMP/ar/agent_reach/skill/SKILL_en.md" "$ROOT/skills/agent-reach/SKILL.md"
rm -rf "$ROOT/skills/agent-reach/references" "$ROOT/skills/agent-reach/vendor"
cp -r "$TMP/ar/agent_reach/skill/references" "$ROOT/skills/agent-reach/references"
mkdir -p "$ROOT/skills/agent-reach/vendor"
cp -r "$TMP/ar/agent_reach" "$ROOT/skills/agent-reach/vendor/agent_reach"
cp "$TMP/ar/pyproject.toml" "$TMP/ar/README.md" "$TMP/ar/LICENSE" "$TMP/ar/constraints.txt" "$ROOT/skills/agent-reach/vendor/" 2>/dev/null || true
cp "$TMP/ar/LICENSE" "$ROOT/skills/agent-reach/LICENSE.upstream" 2>/dev/null || true
# re-apply the PMM OS setup block (kept out of the verbatim upstream SKILL.md)
cat >> "$ROOT/skills/agent-reach/SKILL.md" <<'BLOCK'

<!-- PMM-OS-SETUP (re-applied by scripts/sync-research-engines.sh after upstream re-pull) -->
## Setup — first run (PMM OS)

If `agent-reach` is not on PATH, bootstrap it once: run **`bash scripts/setup.sh`**
(installs the upstream `agent-reach` CLI from the vendored source + its free backends
via `agent-reach install --env=auto`, then runs `agent-reach doctor`).
<!-- END PMM-OS-SETUP -->
BLOCK
echo "✓ synced. Review the diff, re-run the plugin validator, and commit."
