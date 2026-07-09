#!/usr/bin/env python3
"""Idempotent PMM-OS patch: let the research gateway base-URL flow from the
config file into os.environ.

The last30days provider clients read XAI_BASE_URL / OPENAI_BASE_URL via
os.environ.get() ONLY (providers.py), but users configure everything in
~/.config/last30days/.env, which env.py loads into a `config` dict — not into
the process environment (the codebase notes this "hybrid pattern" in bluesky.py).

So a gateway URL placed in .env would never reach the client. This patch exports
the two base-URL keys from config -> os.environ at the end of get_config(), so
`pmm-os research-login` can wire the gateway purely by writing .env — no shell
export, no wrapper. Applied after every upstream sync by sync-research-engines.sh.
"""
import pathlib
import sys

ENV = pathlib.Path(__file__).resolve().parent.parent / "skills/last30days/scripts/lib/env.py"
MARK = "# PMM-OS-GATEWAY-EXPORT"

ANCHOR = (
    '                config[f"_{key}_SOURCE"] = "browser"\n'
    "\n"
    "    return config\n"
)

BLOCK = f'''                config[f"_{{key}}_SOURCE"] = "browser"

    {MARK} (re-applied by scripts/patch-gateway-base-url.py after upstream sync)
    import os as _os
    for _k in ("XAI_BASE_URL", "OPENAI_BASE_URL"):
        _v = config.get(_k)
        if _v and not _os.environ.get(_k):
            _os.environ[_k] = str(_v)

    return config
'''


def main() -> int:
    if not ENV.exists():
        print(f"skip (missing): {ENV}")
        return 0
    s = ENV.read_text()
    if MARK in s:
        print("already patched: env.py")
        return 0
    if ANCHOR not in s:
        print("ANCHOR NOT FOUND (upstream changed get_config — update patcher): env.py")
        return 1
    ENV.write_text(s.replace(ANCHOR, BLOCK, 1))
    print("patched: env.py (gateway base-URL config->environ export)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
