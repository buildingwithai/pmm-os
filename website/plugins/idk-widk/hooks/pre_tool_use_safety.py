#!/usr/bin/env python3
import json, sys, os, re

def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return
    tool_input = payload.get("tool_input") or {}
    cmd = tool_input.get("command") if isinstance(tool_input, dict) else ""
    if not cmd:
        return
    if os.environ.get("IDKWIDK_ALLOW_RISKY") == "1":
        return
    severe = [
        r"rm\s+-rf\s+/(\s|$)",
        r"rm\s+-rf\s+\*",
        r"sudo\s+rm\s+-rf",
        r"git\s+push\s+--force",
        r"git\s+reset\s+--hard",
        r"git\s+clean\s+-fdx",
        r"chmod\s+-R\s+777",
        r"curl\b.*\|\s*(sh|bash)",
        r"wget\b.*\|\s*(sh|bash)",
        r"prisma\s+migrate\s+reset",
        r"drop\s+database",
        r"docker\s+system\s+prune",
    ]
    moderate = [
        r"npm\s+publish",
        r"vercel\s+.*--prod",
        r"firebase\s+deploy",
        r"railway\s+up",
        r"fly\s+deploy",
        r"gh\s+release",
    ]
    cwd = str(payload.get("cwd") or "")
    external_context = ".idkwidk/external-repos" in cwd or ".external-repos" in cwd or ".idkwidk/external-repos" in cmd or ".external-repos" in cmd
    install_cmd = re.search(r"\b(npm|pnpm|yarn|bun)\s+(install|i)\b", cmd, re.I) or re.search(r"\b(pip|poetry|uv|cargo|go)\s+(install|add|get|build|run)\b", cmd, re.I)
    if external_context and install_cmd:
        print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "additionalContext": "idkWidk warning: this command appears to install or run dependencies inside an external repo workspace. Treat external repos as untrusted. Inspect LICENSE, manifests, install scripts, postinstall hooks, env requirements, and network behavior first. Do not use secrets or production credentials. Prefer sandboxed execution and script-disabled install when feasible."}}))
        return

    for pat in severe:
        if re.search(pat, cmd, re.I | re.S):
            print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "idkWidk blocked a destructive or hard-to-reverse command. Explain the risk, preserve the original objective, and ask for explicit approval. To bypass intentionally, rerun with IDKWIDK_ALLOW_RISKY=1."}}))
            return
    for pat in moderate:
        if re.search(pat, cmd, re.I | re.S):
            print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "additionalContext": "idkWidk warning: this command may publish, deploy, or affect external users. Confirm release plan, rollback path, and verification before proceeding."}}))
            return

if __name__ == "__main__":
    main()
