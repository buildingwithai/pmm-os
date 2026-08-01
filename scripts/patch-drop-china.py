#!/usr/bin/env python3
"""Idempotent PMM-OS patch: remove the China-market channels from the shipped code.

Applied after every upstream sync (sync-research-engines.sh calls this), because that
script does `rm -rf skills/last30days/scripts` and re-clones agent-reach's vendor tree.

`patch-agent-reach-trim.py` took the five China channels out of the ROUTING TABLE and
the docs. This one takes them out of the CODE — they were still shipping. Measured
2026-07-31: `npm pack --dry-run` puts 51 vendored agent-reach files in the published
tarball, five of them channel modules for platforms PMM OS will never call.

WHAT GOES

  last30days   the `xiaohongshu` source, end to end: lib/xiaohongshu_api.py plus 29
               call sites across pipeline, planner, ui, doctor, prescriptions, env,
               render, signals and normalize. It was requested-only and needed a
               self-hosted xiaohongshu-mcp service, so nothing here regresses for
               anyone: it was unreachable by default and is now absent.

  agent-reach  channels/{bilibili,v2ex,xiaohongshu,xiaoyuzhou,xueqiu}.py, their entries
               in the channel registry, their installers and the `xhs` branch of
               `agent-reach format` in cli.py, guides/setup-xiaohongshu.md, and
               scripts/transcribe_xiaoyuzhou.sh. The registry is the load-bearing one:
               doctor.py iterates get_all_channels(), so de-registering is what stops
               these appearing in `agent-reach doctor --json` at all.

  reach.sh     the `v2ex` verb.

WHAT STAYS, AND WHY

  lib/cjk.py stays. Its docstring cites Xiaohongshu and Bilibili as the motivation, so
  it reads like a China channel — it is not. It is CJK-aware tokenization used by
  relevance.py and dedupe.py for EVERY source: a Japanese reply on Reddit, a Korean
  TikTok caption, a Chinese product name in an English review. Without it, `str.split()`
  collapses any such string into one token and both relevance scoring and near-duplicate
  detection degrade for data that arrives through the platforms we do keep. Deleting it
  would also require surgery on two more modules to remove nothing anyone asked to lose.
  Its docstring is rewritten so it stops reading as a China feature.

  `agent-reach transcribe` stays. It is Whisper over any public audio URL — one of the
  four things this skill uniquely adds. Only the Xiaoyuzhou-specific wrapper goes.

HOW THIS IS MADE SAFE. Explicit removals (named functions, exact blocks) run first,
then a generic single-line drop for registry and dict entries, then THREE assertions:
every touched file still compiles, the engine still imports, and zero China tokens
remain anywhere in either engine. The last one is the point — a missed anchor fails the
patch loudly instead of leaving one dict entry pointing at a module that no longer exists.
"""
import pathlib
import py_compile
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
L30 = ROOT / "skills/last30days/scripts"
LIB = L30 / "lib"
AR = ROOT / "skills/agent-reach"
VENDOR = AR / "vendor/agent_reach"
MARK = "PMM-OS-NO-CHINA"

# Word-ish boundaries: `xhs` must not fire inside an unrelated identifier, and `bili`
# only counts as bili-cli / bilibili.
CHINA = re.compile(
    r"xiaohongshu|XiaoHongShu|Xiaohongshu|XHS_|\bxhs\b|\bXHS\b"
    r"|bilibili|Bilibili|\bbili-cli\b|\bbili\b|BilibiliChannel"
    r"|xueqiu|Xueqiu|XueqiuChannel|xiaoyuzhou|Xiaoyuzhou|XiaoyuzhouChannel"
    r"|v2ex|V2EX|V2EXChannel",
    re.I,
)

DELETE = [
    LIB / "xiaohongshu_api.py",
    VENDOR / "channels/bilibili.py",
    VENDOR / "channels/v2ex.py",
    VENDOR / "channels/xiaohongshu.py",
    VENDOR / "channels/xiaoyuzhou.py",
    VENDOR / "channels/xueqiu.py",
    VENDOR / "guides/setup-xiaohongshu.md",
    VENDOR / "scripts/transcribe_xiaoyuzhou.sh",
    # Upstream's own copies of the skill docs. patch-agent-reach-trim.py already
    # replaced the copies PMM OS actually loads; these are the originals it copies
    # FROM, and they ship to npm carrying every China section.
    VENDOR / "skill/references/social.md",
    VENDOR / "skill/references/video.md",
]

# Top-level `def NAME(` .. next top-level def/decorator.
DROP_FUNCS = [
    (LIB / "doctor.py", "_xiaohongshu_record"),
    (LIB / "env.py", "get_xiaohongshu_api_base"),
    (LIB / "env.py", "is_xiaohongshu_available"),
    (VENDOR / "cli.py", "_install_xhs_deps"),
    (VENDOR / "cli.py", "_install_bili_deps"),
    (VENDOR / "cli.py", "_install_xiaoyuzhou_deps"),
    # Whole function, not just its `if args.platform == "xhs":` branch — removing the
    # branch header alone leaves its body dangling at the wrong indent, and the
    # function has no other branch to fall back to.
    (VENDOR / "cli.py", "_cmd_format"),
    # Its `def` line carries a China token, so the sweep would decapitate it and the
    # docstring rule would then protect the orphaned body. Named here so it goes whole.
    (VENDOR / "cli.py", "_configure_xhs_cookies"),
]

# Exact multi-line blocks. Each must appear exactly once or the patch refuses.
DROP_BLOCKS = [
    (LIB / "pipeline.py", '''    if requested_sources and "xiaohongshu" in requested_sources and env.is_xiaohongshu_available(config):
        available.append("xiaohongshu")
'''),
    (LIB / "pipeline.py", '''    if source == "xiaohongshu":
        return xiaohongshu_api.search_feeds(
            subquery.search_query,
            from_date,
            to_date,
            env.get_xiaohongshu_api_base(config),
            depth=depth,
        ), {}
'''),
    (LIB / "ui.py", '''        # Xiaohongshu (only show when configured)
        if has_xiaohongshu:
            lines.append(f"{Colors.DIM}│{Colors.RESET}  {Colors.GREEN}✅ Xiaohongshu{Colors.RESET} — API connected + logged in         {Colors.DIM}│{Colors.RESET}")

'''),
    (LIB / "ui.py", '''        if has_xiaohongshu:
            lines.append("│  ✅ Xiaohongshu — API connected + logged in         │")

'''),
    (LIB / "prescriptions.py", '''    _entry(
        "xiaohongshu", "service_unreachable",
        cause=(
            "xiaohongshu-mcp service is unreachable at XIAOHONGSHU_API_BASE "
            "(default http://host.docker.internal:18060)"
        ),
        fix_nl=(
            "start the xpzouying/xiaohongshu-mcp service and log in from its "
            "web UI, then point XIAOHONGSHU_API_BASE at the running instance "
            "if it is not on the default host/port"
        ),
        fix_cli="XIAOHONGSHU_API_BASE=http://localhost:18060",
        anchor="api-keys-env",
    ),
'''),
    # `agent-reach format` exists ONLY to pretty-print XiaoHongShu API output — its
    # one `choices` value is "xhs" and `_cmd_format` has one branch. With the channel
    # gone the whole subcommand can only fail, so parser, dispatch and body all go.
    (VENDOR / "cli.py", '''    # ── format ──
    p_format = sub.add_parser("format", help="Clean and format platform API output")
    p_format.add_argument("platform", choices=["xhs"], help="Platform to format (xhs)")

'''),
    (VENDOR / "cli.py", '''    elif args.command == "format":
        _cmd_format(args)
'''),
    # cookie_extract: three site descriptors and their three result blocks. Multi-line
    # dicts whose `{` and `}` lines carry no China token, so the sweep would strip the
    # middle and orphan the braces.
    (VENDOR / "cookie_extract.py", '''    {
        "name": "XiaoHongShu",
        "domains": [".xiaohongshu.com"],
        "cookies": None,  # None = grab all cookies as header string
        "config_key": "xhs",
    },
    {
        "name": "Bilibili",
        "domains": [".bilibili.com"],
        "cookies": ["SESSDATA", "bili_jct"],
        "config_key": "bilibili",
    },
    {
        "name": "Xueqiu",
        "domains": [".xueqiu.com", "xueqiu.com"],
        "cookies": None,  # grab all — xq_a_token + session cookies required
        "config_key": "xueqiu",
    },
'''),
    (VENDOR / "cookie_extract.py", '''    if "xhs" in extracted:
        cookie_str = extracted["xhs"].get("cookie_string", "")
        if cookie_str:
            config.set("xhs_cookie", cookie_str)
            n_cookies = len(cookie_str.split(";"))
            results_list.append(("XiaoHongShu", True, f"{n_cookies} cookies"))

    if "bilibili" in extracted:
        bc = extracted["bilibili"]
        if "SESSDATA" in bc:
            config.set("bilibili_sessdata", bc["SESSDATA"])
            if "bili_jct" in bc:
                config.set("bilibili_csrf", bc["bili_jct"])
            results_list.append(("Bilibili", True, "SESSDATA" +
                                 (" + bili_jct" if "bili_jct" in bc else "")))
        else:
            results_list.append(("Bilibili", False,
                                 f"No SESSDATA found. Make sure you're logged into bilibili.com in {browser}."))

    if "xueqiu" in extracted:
        cookie_str = extracted["xueqiu"].get("cookie_string", "")
        # Only save if xq_a_token is present — anonymous cookies are useless
        if cookie_str and "xq_a_token" in cookie_str:
            config.set("xueqiu_cookie", cookie_str)
            n_cookies = len(cookie_str.split(";"))
            results_list.append(("Xueqiu", True, f"{n_cookies} cookies (含 xq_a_token)"))
        elif cookie_str:
            results_list.append(("Xueqiu", False,
                                 f"找到 {len(cookie_str.split(';'))} 个 Cookie 但缺少 xq_a_token，"
                                 f"请先在 {browser} 中登录 xueqiu.com"))

'''),
]

# cli.py holds China tokens inside multi-line string and list literals, where dropping
# the line would leave an unterminated call. These run BEFORE the line sweep so nothing
# hazardous is left for it. (Learned by the compile guard rejecting exactly that.)
CLI_REWRITES = [
    ('''                           help="Comma-separated optional channels to install "
                                "(twitter,xiaoyuzhou,xueqiu,xiaohongshu,"
                                "reddit,facebook,instagram,bilibili,linkedin,all)")''',
     '''                           help="Comma-separated optional channels to install "
                                "(twitter,reddit,facebook,instagram,linkedin,all)")'''),
    ('''                                 "twitter-cookies", "youtube-cookies",
                                 "xhs-cookies"],''',
     '''                                 "twitter-cookies", "youtube-cookies"],'''),
    ('''        "xiaoyuzhou":  _install_xiaoyuzhou_deps,
        "xiaohongshu": _install_xhs_deps,
''', ""),
    ('''        "bilibili":    _install_bili_deps,
''', ""),
    ('''    COOKIE_CHANNELS = {"twitter", "xueqiu", "bilibili"}''',
     '''    COOKIE_CHANNELS = {"twitter"}'''),
    ('''            requested_channels = set(CHANNEL_INSTALLERS.keys()) | {"xueqiu", "linkedin"}''',
     '''            requested_channels = set(CHANNEL_INSTALLERS.keys()) | {"linkedin"}'''),
    ('''   agent-reach install --channels=twitter,xiaohongshu,reddit,facebook,instagram,...''',
     '''   agent-reach install --channels=twitter,reddit,facebook,instagram,...'''),
    ('''        # this key at runtime — agents read it back and export HTTP(S)_PROXY
        # before invoking upstream tools (see docs/install.md). The legacy
        # bilibili_proxy key is kept in sync for older configs.
        config.set("proxy", value)
        config.set("bilibili_proxy", value)''',
     '''        # this key at runtime — agents read it back and export HTTP(S)_PROXY
        # before invoking upstream tools (see docs/install.md).
        config.set("proxy", value)'''),
]

# Substring rewrites: a China mention inside something that stays.
REWRITES = [
    (LIB / "cjk.py",
     "break token-overlap scoring and Jaccard de-duplication for Chinese sources\n(Xiaohongshu, Bilibili).",
     "break token-overlap scoring and Jaccard de-duplication for any CJK text that\n"
     "arrives through the sources we do keep -- a Japanese reply on Reddit, a Korean\n"
     "TikTok caption, a Chinese product name inside an English review. This module is\n"
     "text handling, not a platform integration."),
    (LIB / "render.py",
     '"polymarket", "grounding", "xiaohongshu", "github"',
     '"polymarket", "grounding", "github"'),
    (VENDOR / "cookie_extract.py",
     "Extracts: Twitter, XiaoHongShu, Bilibili cookies in one shot.",
     "Extracts: Twitter cookies in one shot."),
    (VENDOR / "cookie_extract.py",
     '''            "twitter": {"auth_token": "xxx", "ct0": "yyy"},
            "xhs": {"cookie_string": "a=1; b=2; ..."},
            "bilibili": {"SESSDATA": "xxx", "bili_jct": "yyy"},''',
     '''            "twitter": {"auth_token": "xxx", "ct0": "yyy"},'''),
    (VENDOR / "cookie_extract.py",
     'f"Make sure you\'re logged into Twitter, XiaoHongShu, etc. in {browser}.")]',
     'f"Make sure you\'re logged into Twitter in {browser}.")]'),
    (AR / "scripts/setup.sh",
     'echo "Live keyless now: GitHub, web-read (any URL), V2EX, Bilibili, RSS, YouTube."\n'
     'echo "Login/key platforms (Reddit, XiaoHongShu, Exa) unlock via: agent-reach configure"',
     'echo "Live keyless now: GitHub, web-read (any URL), RSS, YouTube."\n'
     'echo "Login/key platforms (Reddit, LinkedIn, Exa) unlock via: agent-reach configure"'),
    (VENDOR / "backends/__init__.py",
     "(e.g. OpenCLI covers xiaohongshu/reddit/bilibili/twitter through one",
     "(e.g. OpenCLI covers reddit/twitter/facebook/instagram through one"),
]

# `agent-reach transcribe` is a keeper, so its setup guide gets an English rewrite
# rather than deletion. The other three vendored guides cover channels documented in
# skills/agent-reach/references/ already.
GROQ_GUIDE = """# Groq Whisper setup (for `agent-reach transcribe`)

Speech-to-text for audio and video with no captions. Groq has a free tier that is ample
for research use. `transcribe` is one of the four things agent-reach uniquely adds, so
this is the one vendored guide worth keeping.

## Check whether it is already configured

```bash
agent-reach doctor | grep -i "groq\\|whisper"
```

## Configure

```bash
agent-reach configure groq-key gsk_xxx      # free: https://console.groq.com/keys
agent-reach configure openai-key sk-xxx     # alternative; `auto` falls back groq -> openai
```

## Verify

```bash
curl -s https://api.groq.com/openai/v1/models \\
  -H "Authorization: Bearer $GROQ_API_KEY" -o /dev/null -w "%{http_code}"
```

`200` means the key works. Anything else is a failed check, not a missing transcript.

## What to tell the user

> Transcribing audio needs a Groq API key, which is free:
> 1. Open https://console.groq.com
> 2. Sign up with Google or email
> 3. "API Keys" -> "Create API Key"
> 4. Paste it back here

## Caveats

Output is machine ASR. Never quote it as verbatim speech, and never present a translated
track as the original audio. `transcribe` accepts a public http(s) URL or a local audio
file only -- for a search result, pick a concrete video URL first.
"""

# Files whose remaining single-line China mentions (registry rows, dict entries,
# list members, imports) are dropped wholesale after the explicit passes above.
LINE_SWEEP = [
    LIB / "pipeline.py", LIB / "planner.py", LIB / "ui.py", LIB / "doctor.py",
    LIB / "signals.py", LIB / "normalize.py", LIB / "render.py",
    LIB / "env.py", LIB / "permission_preflight.py",
    VENDOR / "channels/__init__.py", VENDOR / "cli.py", VENDOR / "cookie_extract.py",
]

PY_FILES = LINE_SWEEP + [LIB / "env.py", LIB / "prescriptions.py", LIB / "cjk.py"]


def drop_func(src: str, name: str):
    """Remove one top-level function, signature through body.

    Line-based, not regex-based, and deliberately so. The regex form the other
    patchers use — search `^(def |@|...)` in `src[match.end():]` — matches at OFFSET
    ZERO for a single-line signature, because `^` with re.M matches the start of the
    search string. It deletes `def name(` and leaves `config):` dangling. The compile
    guard caught it; nothing shipped. A function here ends at the next line that starts
    in column 0 with real content that is not a closing bracket, which also survives a
    multi-line signature (its continuations are indented).
    """
    lines = src.splitlines(keepends=True)
    start = next((i for i, ln in enumerate(lines)
                  if ln.startswith(f"def {name}(")), None)
    if start is None:
        return None
    end = len(lines)
    for i in range(start + 1, len(lines)):
        ln = lines[i]
        if ln.strip() and not ln[0].isspace() and not ln.startswith((")", "]", "}")):
            end = i
            break
    return "".join(lines[:start] + lines[end:])


def sweep_lines(src: str):
    """Drop China lines that are self-contained — registry rows, dict entries, imports.

    Textual line-dropping is not safe on Python, and the compile guard proved it twice:
    a `"xhs-cookies"],` line also CLOSED a list literal, and a docstring's opening line
    mentioned xhs, so removing it left the rest of the docstring parsing as code. Two
    structural rules fix both, and anything they cannot handle is listed explicitly in
    DROP_BLOCKS / CLI_REWRITES instead:

      1. Never touch a line inside a MULTI-LINE string. Single-line strings are fair
         game — that is what a dict entry or list element is.
      2. Only drop a line whose own brackets balance, so it cannot be opening or
         closing something the surrounding code still needs.

    Returns (new_source, refusal_reason). A file that will not tokenize is refused
    rather than swept blind.
    """
    import io
    import tokenize

    protected = set()
    try:
        for tok in tokenize.generate_tokens(io.StringIO(src).readline):
            if tok.type == tokenize.STRING and tok.end[0] > tok.start[0]:
                protected.update(range(tok.start[0], tok.end[0] + 1))
    except (tokenize.TokenError, IndentationError, SyntaxError) as exc:
        return src, f"will not tokenize ({exc}) — fix the explicit passes first"

    out = []
    for i, ln in enumerate(src.splitlines(keepends=True), 1):
        if not CHINA.search(ln) or i in protected:
            out.append(ln)
            continue
        balanced = (ln.count("(") == ln.count(")") and ln.count("[") == ln.count("]")
                    and ln.count("{") == ln.count("}"))
        if balanced:
            continue                      # dropped
        out.append(ln)                    # unbalanced: leave it for an explicit rule
    return "".join(out), None


def main() -> int:
    if "--check" in sys.argv:
        leftovers = scan()
        if leftovers:
            print(f"NOT APPLIED: {len(leftovers)} China reference(s) still in shipped code "
                  f"(first: {leftovers[0]}) — run scripts/patch-drop-china.py")
            return 1
        print(f"applied: {MARK} — no China-market channel code in either engine")
        return 0

    if not LIB.is_dir():
        print(f"skip (missing engine): {LIB}")
        return 0

    # Idempotence is asserted, not tracked in a stamp file: if nothing matches the
    # scan there is nothing to remove, whatever a marker might claim.
    if not scan():
        print("already purged: no China-market channel code in either engine")
        return 0

    edited = {}

    for p in DELETE:
        if p.exists():
            p.unlink()

    for path, name in DROP_FUNCS:
        if not path.is_file():
            continue
        src = edited.get(path, path.read_text(encoding="utf-8"))
        out = drop_func(src, name)
        if out is None:
            if name in src:
                print(f"ANCHOR NOT FOUND (def {name}) in {path.name} — update patcher")
                return 1
            continue                      # already gone
        edited[path] = out

    for path, block in DROP_BLOCKS:
        if not path.is_file():
            continue
        src = edited.get(path, path.read_text(encoding="utf-8"))
        n = src.count(block)
        if n == 0:
            continue                      # already gone
        if n != 1:
            print(f"ANCHOR NOT UNIQUE ({n}x) in {path.name} — update patcher:\n"
                  f"    {block.strip().splitlines()[0][:80]}")
            return 1
        edited[path] = src.replace(block, "")

    for path, old, new in REWRITES:
        if not path.is_file():
            continue
        src = edited.get(path, path.read_text(encoding="utf-8"))
        if old in src:
            edited[path] = src.replace(old, new)
        elif new not in src:
            print(f"ANCHOR NOT FOUND in {path.name} — update patcher: {old[:60]!r}")
            return 1

    cli = VENDOR / "cli.py"
    if cli.is_file():
        src = edited.get(cli, cli.read_text(encoding="utf-8"))
        for old, new in CLI_REWRITES:
            if old in src:
                src = src.replace(old, new)
            elif new and new not in src:
                print(f"ANCHOR NOT FOUND in cli.py — update patcher: {old.strip()[:70]!r}")
                return 1
        edited[cli] = src

    for path in LINE_SWEEP:
        if not path.is_file():
            continue
        src = edited.get(path, path.read_text(encoding="utf-8"))
        out, refused = sweep_lines(src)
        if refused:
            print(f"REFUSING to sweep {path.name}: {refused}")
            return 1
        edited[path] = out

    for name in ("setup-keychain.sh", "setup-pass.sh"):
        p = L30 / name
        if p.is_file():
            src = edited.get(p, p.read_text(encoding="utf-8"))
            edited[p] = "".join(ln for ln in src.splitlines(keepends=True)
                                if not CHINA.search(ln))

    guide = VENDOR / "guides/setup-groq.md"
    if guide.is_file():
        guide.write_text(GROQ_GUIDE, encoding="utf-8")

    # reach.sh: our own verb, not upstream's. The usage line NAMES every verb, so a
    # blind sweep deletes it along with v2ex and an unknown verb then exits 0 silently
    # — a dispatcher that succeeds at doing nothing, which is the failure this repo
    # exists to prevent. Rewrite it first, then sweep what is left.
    sh = AR / "scripts/reach.sh"
    if sh.is_file():
        src = sh.read_text(encoding="utf-8")
        src = src.replace("|ig-login <user>|v2ex|doctor|selftest}",
                          "|ig-login <user>|doctor|selftest}")
        src = "".join(ln for ln in src.splitlines(keepends=True)
                      if not (CHINA.search(ln) and "v2ex" in ln.lower()))
        if "usage: reach.sh" not in src:
            print("reach.sh lost its usage line — an unknown verb would exit 0 silently")
            return 1
        edited[sh] = src

    for path, src in edited.items():
        if path.suffix == ".py":
            with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False,
                                             encoding="utf-8") as t:
                t.write(src)
            try:
                py_compile.compile(t.name, doraise=True, cfile=tempfile.mktemp())
            except py_compile.PyCompileError as e:
                print(f"PATCH WOULD PRODUCE INVALID PYTHON — {path.name} not written: {e}")
                return 1
            finally:
                pathlib.Path(t.name).unlink(missing_ok=True)
        path.write_text(src, encoding="utf-8")

    shutil.rmtree(LIB / "__pycache__", ignore_errors=True)

    leftovers = scan()
    if leftovers:
        print(f"INCOMPLETE — {len(leftovers)} China reference(s) survived the patch:")
        for x in leftovers[:12]:
            print(f"    {x}")
        return 1

    if not engine_imports():
        return 1

    print("purged: xiaohongshu source, 5 vendored channels + their installers, "
          "reach.sh v2ex (cjk.py kept — it is text handling, not a platform)")
    return 0


def scan() -> list[str]:
    """Every China reference left in code PMM OS ships. The whole point of the patch."""
    out = []
    for base in (L30, AR):
        for p in sorted(base.rglob("*")):
            if not p.is_file() or "__pycache__" in p.parts:
                continue
            if p.suffix not in (".py", ".sh", ".md", ".json", ".toml", ".yaml", ".mjs"):
                continue
            # Upstream's own README/pyproject describe the package we vendored; they are
            # attribution, not routing, and THIRD_PARTY_NOTICES says never to strip those.
            if p.name in ("README.md", "pyproject.toml", "LICENSE.upstream",
                          "constraints.txt", "SKILL.md", "SKILL_en.md"):
                if "vendor" in p.parts:
                    continue
            try:
                text = p.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            for i, ln in enumerate(text.splitlines(), 1):
                if CHINA.search(ln):
                    out.append(f"{p.relative_to(ROOT)}:{i}: {ln.strip()[:90]}")
    return out


def engine_imports() -> bool:
    """The engine must still import after 29 call sites came out of nine modules."""
    py = resolve_python()
    if not py:
        print("  ! no Python 3.12+ resolved — engine import check skipped")
        return True
    code = (f"import sys; sys.path.insert(0, {str(L30)!r});"
            "from lib import pipeline, ui, doctor, env, render, signals, normalize,"
            " planner, prescriptions, cjk, relevance, dedupe;"
            "assert 'xiaohongshu' not in pipeline.MOCK_AVAILABLE_SOURCES;"
            "assert 'xiaohongshu' not in ui.SOURCE_COMPLETION_META;"
            "print('ok')")
    r = subprocess.run([py, "-c", code], capture_output=True, text=True, timeout=120)
    if r.returncode != 0 or "ok" not in r.stdout:
        print("ENGINE NO LONGER IMPORTS after the purge — not safe to ship:")
        print((r.stderr or r.stdout).strip()[:600])
        return False
    return True


def resolve_python() -> str:
    r = subprocess.run(
        ["node", "-e",
         "import('./bin/lib/resolve-python.mjs').then(m=>"
         "console.log(JSON.stringify(m.resolvePython({allowInstall:false}))))"],
        cwd=ROOT, capture_output=True, text=True)
    try:
        import json
        return json.loads(r.stdout.strip()).get("path") or ""
    except Exception:
        return ""


if __name__ == "__main__":
    sys.exit(main())
