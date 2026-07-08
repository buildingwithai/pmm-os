#!/usr/bin/env python3
import json, sys, os
from pathlib import Path

def read_json():
    try:
        return json.load(sys.stdin)
    except Exception:
        return {}

def find_mission_control(cwd: Path):
    candidates = []
    for name in ["MISSION_CONTROL.md", "SESSION_HANDOFF.md", "CONTEXT_COMPACTION_BRIEF.md"]:
        candidates.extend(cwd.rglob(name))
    # avoid external repos and node_modules
    filtered = [p for p in candidates if ".external-repos" not in p.parts and "external-repos" not in p.parts and "node_modules" not in p.parts and ".git" not in p.parts]
    return sorted(filtered, key=lambda p: len(str(p)))[:3]

def main():
    payload = read_json()
    cwd = Path(payload.get("cwd") or os.getcwd())
    context = [
        "idkWidk is enabled. For coding, product, bug, feature, refactor, open-source research, or ambiguous tasks, classify first, preserve the original objective, separate facts from hypotheses, and verify before claiming done.",
        "Before any action, response, file read, shell command, browser action, code edit, or clarification question, run the idkWidk routing check. If there is any reasonable chance an idkWidk workflow applies, activate the relevant workflow first.",
        "Routing order: Input Intake for raw/rambling/screenshot prompts; Debugging Governor or Behavior Archaeology for bugs/regressions; Feature Specification for fuzzy features; Mission Control for multi-step work; External Repo Runtime Lab plus license-aware routing for GitHub/open-source/parity work; Visual Runtime QA for browser-visible UI; Security Guardrails for auth/privacy/secrets; Refactor Safety for rewrites; Verification Release before claiming done.",
        "agent browser testing default: Regular Chrome is the user's personal browser; Chrome for Testing is the agent/debug browser. Start Chrome for Testing on 127.0.0.1:9222 with the persistent profile at $HOME/Library/Application Support/Google/Chrome for Testing and load only /Users/jovannytovar/pmm-clean/extensions/Job-Application-tracker/chrome-extension-dev. The expected signed-in testing profile is jovannnytovar@gmail.com.",
        "Remember: 127.0.0.1:9222 is the DevTools control socket, not the product website. the target app still runs on its normal app URL, such as localhost:3000. Reuse existing Chrome for Testing tabs and do not create duplicate tabs.",
        "If the user's prompt is rambling or screenshot-based, use the Input Intake Interpreter before coding.",
        "For multi-step work, maintain MISSION_CONTROL.md and classify new issues as blocking, parked, or discarded.",
        "When the user provides a GitHub repo or wants feature parity from open source, use External Repo Runtime Lab first, then route to Permissive OSS Feature Adoption or Clean Room Reimplementation based on license posture.",
    ]
    try:
        found = find_mission_control(cwd)
        if found:
            context.append("Existing idkWidk state files found: " + ", ".join(str(p.relative_to(cwd)) for p in found))
            sample = found[0].read_text(encoding="utf-8", errors="ignore")[:1800]
            context.append("Use this existing state file as durable context if relevant:\n" + sample)
    except Exception as e:
        context.append(f"Could not scan for idkWidk state files: {e}")
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "\n\n".join(context)}}))

if __name__ == "__main__":
    main()
