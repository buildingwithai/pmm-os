#!/usr/bin/env python3
"""Validate the PMM OS plugin package.

Every check here exists because the corresponding bug actually shipped:

  - the old validator never looked at .claude-plugin/ at all, which is how a
    plugin that bricked Claude Code got published twice
  - hooks.json used ${PLUGIN_ROOT}, a variable no host defines
  - the routing table named 22 skills that were never in the plugin
  - manifests carried four different version numbers
  - package.json "files" pointed at directories that weren't shipped

No network access required, except the optional `claude plugin validate`.
Run: python3 scripts/validate-marketing-os-plugin.py
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FAILURES: list[str] = []


def check(label: str, problems: list[str]) -> None:
    if problems:
        FAILURES.extend(problems)
        print(f"  \033[31m✗\033[0m {label}")
        for p in problems[:8]:
            print(f"      {p}")
    else:
        print(f"  \033[32m✓\033[0m {label}")


def load(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


MANIFESTS = [
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ".codex-plugin/plugin.json",
    ".agents/plugins/marketplace.json",
    "hooks/hooks.json",
    "package.json",
]


def check_json_parses() -> None:
    bad = []
    for m in MANIFESTS:
        try:
            load(m)
        except Exception as exc:
            bad.append(f"{m}: {exc}")
    check("manifests parse", bad)


def check_versions() -> None:
    def ver(path, key=None):
        d = load(path)
        return d["plugins"][0]["version"] if key == "plugin0" else d.get("version")

    seen = {
        "package.json": ver("package.json"),
        ".claude-plugin/plugin.json": ver(".claude-plugin/plugin.json"),
        ".codex-plugin/plugin.json": ver(".codex-plugin/plugin.json"),
        ".claude-plugin/marketplace.json": ver(".claude-plugin/marketplace.json", "plugin0"),
        ".agents/plugins/marketplace.json": ver(".agents/plugins/marketplace.json", "plugin0"),
    }
    distinct = set(seen.values())
    check(f"all manifests agree on version ({seen['package.json']})",
          [] if len(distinct) == 1 else [f"{k} = {v}" for k, v in seen.items()])


def check_plugin_root_var() -> None:
    """${PLUGIN_ROOT} is not a Claude Code substitution. It expands to empty,
    python exits 2, and Claude Code reads exit 2 as 'block'."""
    bad = []
    for path in ROOT.rglob("*.json"):
        if any(p in path.parts for p in ("node_modules", ".git", "skills")):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r"(?<!CLAUDE_)\$\{PLUGIN_ROOT\}|%PLUGIN_ROOT%", text):
            bad.append(f"{path.relative_to(ROOT)}: {m.group(0)} — use ${{CLAUDE_PLUGIN_ROOT}}")
    check("no bare ${PLUGIN_ROOT} in manifests", bad)


def check_hook_targets() -> None:
    """Every hook command must point at a file that exists, and must run."""
    bad = []
    hooks = load("hooks/hooks.json")["hooks"]
    env = {**os.environ, "CLAUDE_PLUGIN_ROOT": str(ROOT), "PYTHONDONTWRITEBYTECODE": "1"}
    payload = json.dumps({
        "session_id": "validate", "transcript_path": os.devnull, "cwd": str(ROOT),
        "hook_event_name": "Validate", "prompt": "launch my product",
        "tool_name": "Bash", "tool_input": {"command": "ls"},
    })
    for event, matchers in hooks.items():
        for matcher in matchers:
            for hook in matcher["hooks"]:
                cmd = hook["command"]
                script = re.search(r"/hooks/(\w+\.py)", cmd)
                if script and not (ROOT / "hooks" / script.group(1)).is_file():
                    bad.append(f"{event}: hooks/{script.group(1)} does not exist")
                    continue
                r = subprocess.run(["sh", "-c", cmd], input=payload, env=env,
                                   capture_output=True, text=True, timeout=30)
                if r.returncode != 0:
                    bad.append(f"{event}: exit {r.returncode} — {(r.stderr or '').strip()[:120]}")
                elif "Traceback" in (r.stderr or ""):
                    # `|| exit 0` makes a crashing hook look healthy by exit code.
                    # A NameError shipped this way once already.
                    last = (r.stderr or "").strip().splitlines()[-1]
                    bad.append(f"{event}: crashed despite exit 0 — {last[:120]}")
                elif r.stdout.strip():
                    try:
                        json.loads(r.stdout)
                    except ValueError:
                        bad.append(f"{event}: stdout is not JSON — {r.stdout.strip()[:80]}")
    check("every hook resolves, runs, and exits 0", bad)


def check_skills() -> tuple[int, set[str]]:
    bad: list[str] = []
    names: set[str] = set()
    for skill in sorted((ROOT / "skills").glob("*/SKILL.md")):
        text = skill.read_text(encoding="utf-8")
        match = re.match(r"^---\n([\s\S]*?)\n---", text)
        if not match:
            bad.append(f"{skill.parent.name}: missing YAML frontmatter")
            continue
        name = re.search(r"^name:\s*([a-z0-9-]+)\s*$", match.group(1), flags=re.M)
        desc = re.search(r"^description:\s*(.+)$", match.group(1), flags=re.M)
        if not name:
            bad.append(f"{skill.parent.name}: missing valid name")
        elif name.group(1) != skill.parent.name:
            bad.append(f"{skill.parent.name}: name does not match directory")
        else:
            names.add(name.group(1))
        if not desc:
            bad.append(f"{skill.parent.name}: missing description")
        elif len(desc.group(1)) > 1024:
            bad.append(f"{skill.parent.name}: description exceeds 1024 chars")
    check(f"{len(names)} skills have valid frontmatter", bad)
    return len(names), names


def check_skill_crossrefs(skill_names: set[str]) -> None:
    """SKILL.md files told the model to use 16 skills that were never in this
    plugin, and pointed at an MCP server that no longer exists. Both silently
    degrade every run, so both are assertions now."""
    bad = []
    prose_placeholders = {"candidate", "path", "arguments"}
    for md in sorted((ROOT / "skills").glob("*/SKILL.md")):
        text = md.read_text(encoding="utf-8")
        for m in re.finditer(r"\$([a-z][a-z0-9-]{2,})\b", text):
            name = m.group(1)
            if name not in skill_names and name not in prose_placeholders:
                bad.append(f"{md.parent.name}: routes to ${name}, which has no skills/{name}/SKILL.md")
        if re.search(r"marketing-os` MCP|mcp__marketing-os|the `marketing-os` (server|MCP)", text):
            bad.append(f"{md.parent.name}: references the removed marketing-os MCP server")
    check("SKILL.md cross-references resolve", sorted(set(bad)))


def check_routes(skill_names: set[str]) -> None:
    src = (ROOT / "hooks" / "user_prompt_submit.py").read_text(encoding="utf-8")
    body = src.split("ROUTES = [", 1)[1].split("\n]", 1)[0]
    routed = {n for n in re.findall(r'"([a-z0-9-]+)"', body)}
    check("routing table names only real skills",
          [f"{n} is routed to but has no skills/{n}/SKILL.md" for n in sorted(routed - skill_names)])


def check_skill_count_claims(count: int) -> None:
    bad = []
    for path in ("README.md", "package.json", ".claude-plugin/plugin.json"):
        text = (ROOT / path).read_text(encoding="utf-8")
        for m in re.finditer(r"\b(\d+)\+?\s+(?:PMM[/, ]|GTM[/, ]|product-marketing\s+)*skills\b", text, re.I):
            claimed = int(m.group(1))
            if claimed > count or (claimed < count and "+" not in m.group(0)):
                bad.append(f"{path}: claims '{m.group(0).strip()}' but {count} skills exist")
    check(f"skill-count claims match reality ({count})", bad)


def check_npm_payload() -> None:
    bad = [f"package.json files: {p} does not exist"
           for p in load("package.json").get("files", [])
           if not p.startswith("!") and not (ROOT / p.rstrip("/")).exists()]
    check("package.json \"files\" paths all exist", bad)


def check_tarball_contents() -> None:
    """`files` overrides .gitignore, so gitignored junk can still ship —
    65 stale .pyc from the vendored engine went out in 3.0.1 and 3.0.2."""
    try:
        r = subprocess.run(["npm", "pack", "--dry-run", "--json", "--ignore-scripts"],
                           cwd=ROOT, capture_output=True, text=True, timeout=180)
        entries = [f["path"] for f in json.loads(r.stdout)[0]["files"]]
    except Exception as exc:
        print(f"  \033[33m!\033[0m npm payload contents not checked ({type(exc).__name__})")
        return
    junk = [e for e in entries
            if re.search(r"\.pyc$|__pycache__/|\.DS_Store$|(^|/)\.env($|\.)", e)]
    check(f"npm tarball is clean ({len(entries)} files)", junk[:8])


def check_agent_descriptors(skill_names: set[str]) -> None:
    """Codex reads interface.display_name; anything else auto-titlecases the slug."""
    bad = []
    for name in sorted(skill_names):
        p = ROOT / "skills" / name / "agents" / "openai.yaml"
        if not p.is_file():
            bad.append(f"{name}: no agents/openai.yaml")
            continue
        text = p.read_text(encoding="utf-8")
        if "interface:" not in text or "display_name:" not in text:
            bad.append(f"{name}: not in OpenAI's interface: schema")
        if "mcp__marketing-os" in text:
            bad.append(f"{name}: references the deleted marketing-os MCP server")
    check("agent descriptors use the documented schema", bad)


def check_compiles() -> None:
    bad = []
    py = sorted((ROOT / "hooks").glob("*.py")) + \
         [ROOT / "skills/pmm-artifact-factory/scripts/render_artifact_bundle.py"]
    for f in py:
        r = subprocess.run([sys.executable, "-m", "py_compile", str(f)],
                           capture_output=True, text=True,
                           env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
        if r.returncode != 0:
            bad.append(f"{f.relative_to(ROOT)}: {r.stderr.strip()[:120]}")
    for f in sorted((ROOT / "skills/pmm-launch-kit/scripts").glob("*.mjs")):
        r = subprocess.run(["node", "--check", str(f)], capture_output=True, text=True)
        if r.returncode != 0:
            bad.append(f"{f.relative_to(ROOT)}: {r.stderr.strip()[:120]}")
    check("python and node sources compile", bad)


def check_receipt_gate_selftest() -> None:
    """Ring 4 is the last thing between a degraded run and a turn that calls it
    complete. It also must not fire on ordinary work."""
    t = ROOT / "hooks" / "test_stop_receipt_gate.py"
    if not t.is_file():
        check("Stop receipt-gate self-check", ["hooks/test_stop_receipt_gate.py is missing"])
        return
    r = subprocess.run([sys.executable, str(t)], capture_output=True, text=True,
                       env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
    check("Stop receipt-gate self-check", [] if r.returncode == 0 else [r.stdout.strip()[:400]])


def check_launch_gate() -> None:
    """sync-research-engines.sh deletes the engine's scripts/ wholesale, so the
    gate has to be re-applied by a patcher. Assert it is currently applied."""
    r = subprocess.run([sys.executable, str(ROOT / "scripts" / "patch-engine-launch-gate.py"), "--check"],
                       capture_output=True, text=True)
    check("engine launch gate applied", [] if r.returncode == 0 else [r.stdout.strip()[:200]])


def check_guard_selftest() -> None:
    """The guard is the only thing standing between a model and a silent bad
    research run. If its fixtures rot, we lose that without noticing."""
    t = ROOT / "hooks" / "test_research_guard.py"
    if not t.is_file():
        check("research guard self-check", ["hooks/test_research_guard.py is missing"])
        return
    r = subprocess.run([sys.executable, str(t)], capture_output=True, text=True,
                       env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
    check("research guard self-check", [] if r.returncode == 0 else [r.stdout.strip()[:400]])


def check_ig_fetch_selftest() -> None:
    """ig_fetch replaced a path that reported Instagram's 403 as "Profile does not
    exist" — a block laundered into a fact an agent would write into a brief. These
    fixtures are what stop that regressing."""
    t = ROOT / "skills" / "agent-reach" / "scripts" / "test_ig_fetch.py"
    if not t.is_file():
        check("Instagram fetch self-check", ["skills/agent-reach/scripts/test_ig_fetch.py is missing"])
        return
    r = subprocess.run([sys.executable, str(t)], capture_output=True, text=True,
                       env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
    check("Instagram fetch self-check", [] if r.returncode == 0
          else [(r.stdout + r.stderr).strip()[:400]])


def check_tt_fetch_selftest() -> None:
    """TikTok display-rounds counts above ~10k, so printing them as exact integers
    invents precision TikTok never measured. Also pins that a failed fetch can never
    render as an empty account."""
    t = ROOT / "skills" / "agent-reach" / "scripts" / "test_tt_fetch.py"
    if not t.is_file():
        check("TikTok fetch self-check", ["skills/agent-reach/scripts/test_tt_fetch.py is missing"])
        return
    r = subprocess.run([sys.executable, str(t)], capture_output=True, text=True,
                       env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
    check("TikTok fetch self-check", [] if r.returncode == 0
          else [(r.stdout + r.stderr).strip()[:400]])


def check_health_synthesis() -> None:
    """--search and INCLUDE_SOURCES are both derived from the health document. If either
    derivation drifts, a run silently loses sources (--search is a HARD filter) or loses
    comment text (every *_comments opt-in defaults to off)."""
    t = ROOT / "bin" / "lib" / "health.selftest.mjs"
    if not t.is_file():
        check("health synthesis self-check", ["bin/lib/health.selftest.mjs is missing"])
        return
    r = subprocess.run(["node", str(t)], capture_output=True, text=True, cwd=ROOT)
    check("health synthesis self-check", [] if r.returncode == 0
          else [(r.stdout + r.stderr).strip()[:400]])


def check_ig_reels_window() -> None:
    """Upstream's search_instagram() returned every OUT-OF-WINDOW reel whenever none
    fell inside the window — a Jan-2023 reel presented as last-30-days evidence, with
    no error set. The patcher fixes it; this proves the patch is applied and correct."""
    t = ROOT / "scripts" / "test_instagram_reels_window.py"
    if not t.is_file():
        check("IG reels date-window self-check", ["scripts/test_instagram_reels_window.py is missing"])
        return
    r = subprocess.run([sys.executable, str(t)], capture_output=True, text=True,
                       env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
    check("IG reels date-window self-check", [] if r.returncode == 0
          else [(r.stdout + r.stderr).strip()[:400]])


def check_youtube_comments_free() -> None:
    """YouTube comment enrichment was gated on a paid key for comments yt-dlp reads
    free — and the documented `EXCLUDE_SOURCES=youtube_comments` off switch was a
    no-op. Both matter more now the feature is default-on."""
    t = ROOT / "scripts" / "test_youtube_comments_free.py"
    if not t.is_file():
        check("YouTube free-comments self-check", ["scripts/test_youtube_comments_free.py is missing"])
        return
    r = subprocess.run([sys.executable, str(t)], capture_output=True, text=True,
                       env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
    check("YouTube free-comments self-check", [] if r.returncode == 0
          else [(r.stdout + r.stderr).strip()[:400]])


def check_policy_selftest() -> None:
    t = ROOT / "hooks" / "test_pre_tool_use_policy.py"
    if not t.is_file():
        check("PreToolUse policy self-check", ["hooks/test_pre_tool_use_policy.py is missing"])
        return
    r = subprocess.run([sys.executable, str(t)], capture_output=True, text=True,
                       env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
    check("PreToolUse policy self-check", [] if r.returncode == 0 else [r.stdout.strip()[:400]])


MIN_CLI = (2, 1, 143)   # displayName landed here; older CLIs reject it as unknown


def check_official_validator() -> None:
    """The one check whose absence let a broken manifest ship twice.

    Only trusts a CLI new enough to know the current schema — an older `claude`
    on PATH reports valid fields as errors, and a much older one hangs.
    """
    claude = shutil.which("claude")
    version = None
    if claude:
        try:
            r = subprocess.run([claude, "--version"], capture_output=True, text=True, timeout=30)
            m = re.search(r"(\d+)\.(\d+)\.(\d+)", r.stdout or "")
            version = tuple(int(x) for x in m.groups()) if m else None
        except (subprocess.TimeoutExpired, OSError):
            version = None

    if version is None or version < MIN_CLI:
        found = ".".join(map(str, version)) if version else "not found"
        print(f"  \033[33m!\033[0m official manifest validation skipped (claude {found}, "
              f"need >= {'.'.join(map(str, MIN_CLI))})")
        print("      run: npx -y @anthropic-ai/claude-code@latest plugin validate .")
        return

    try:
        r = subprocess.run([claude, "plugin", "validate", str(ROOT)],
                           capture_output=True, text=True, timeout=120)
    except subprocess.TimeoutExpired:
        check("claude plugin validate", ["timed out after 120s"])
        return
    out = (r.stdout or "") + (r.stderr or "")
    check("claude plugin validate", [] if "Validation passed" in out else [out.strip()[:300]])


def main() -> None:
    print("── PMM OS plugin validation ──")
    check_json_parses()
    check_versions()
    check_plugin_root_var()
    check_hook_targets()
    count, names = check_skills()
    check_routes(names)
    check_skill_crossrefs(names)
    check_skill_count_claims(count)
    check_npm_payload()
    check_tarball_contents()
    check_agent_descriptors(names)
    check_compiles()
    check_policy_selftest()
    check_guard_selftest()
    check_receipt_gate_selftest()
    check_ig_fetch_selftest()
    check_ig_reels_window()
    check_youtube_comments_free()
    check_health_synthesis()
    check_tt_fetch_selftest()
    check_launch_gate()
    check_official_validator()

    if FAILURES:
        print(f"\n✗ {len(FAILURES)} problem(s).")
        raise SystemExit(1)
    print("\n✓ PMM OS plugin validation passed.")


if __name__ == "__main__":
    main()
