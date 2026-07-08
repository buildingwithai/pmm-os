#!/usr/bin/env python3
import json, sys, re

def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return
    prompt = payload.get("prompt") or ""
    low = prompt.lower()
    signals = []
    if len(prompt.split()) > 120: signals.append("long prompt")
    for phrase in ["i don't know", "i dont know", "not sure", "i'm not sure", "i am not sure", "ramble", "screenshot", "image", "look at", "attached", "bug", "error", "broken", "scared", "afraid", "what i don't want", "what i dont want", "maybe", "i think", "used to work", "worked before", "used to", "old behavior", "old version", "regression", "changed", "go back", "restore", "january", "last month", "previously", "github", "repo", "repository", "clone", "fork", "mit license", "apache license", "bsd license", "gpl", "agpl", "license", "open source", "copy", "extract", "one-to-one", "1:1", "parity", "visual parity", "visual qa", "screenshot", "screenshots", "gif", "gifs", "video", "design", "looks", "look wrong", "ui", "dom", "css", "chrome devtools", "clean room", "clean-room", "reverse engineer", "vendor", "submodule", "subtree", "visual", "screenshot", "screenshots", "gif", "image", "design", "layout", "css", "dom", "color", "font", "chrome devtools", "looks wrong", "doesn't look", "does not look", "compare", "skill", "skills", "invoke", "must use", "before any response", "before any action", "routing", "workflow", "gate"]:
        if phrase in low: signals.append(phrase)
    if not signals:
        return
    ctx = "The user's prompt has idkWidk intake signals: " + ", ".join(sorted(set(signals))) + ". Before any action, response, file read, shell command, browser action, code edit, or clarification question, run the idkWidk routing check. If there is any reasonable chance an idkWidk workflow applies, activate the relevant workflow first. Before coding, parse the text first, inspect referenced images or files, separate observations from guesses, extract the real user-level goal, identify fears and constraints, and rewrite the request into a clear engineering prompt. Do not treat brainstormed implementation ideas as mandatory. If the user says something used to work, mentions old behavior, regression, a previous version, or wanting to go back, activate Behavior Archaeology: reconstruct old vs current behavior, build an evidence table, classify Keep/Fix/Ignore/Unknown, and only turn Keep/Fix behavior into tests. If the user mentions a GitHub repo, open source, clone, fork, MIT, GPL, license, feature extraction, one-to-one parity, clean room, vendor, submodule, or subtree, activate External Repo Runtime Lab and license-aware OSS routing: clone only into ignored .idkwidk/external-repos, inspect license and source safety, run the repo only when safe, capture runtime behavior, then choose Permissive OSS Feature Adoption or Clean Room Reimplementation. If the user mentions screenshots, GIFs, videos, visual QA, UI, DOM, CSS, Chrome DevTools, one-to-one visual parity, activate Visual Runtime QA: require Chrome DevTools MCP connected to Chrome for Testing for browser UI and Chrome extension runtime evidence, find source repo visual assets, capture baseline screenshots, validate setup, compare before/after or source/target screenshots, and do not claim visual completion without evidence. agent browser testing default: Regular Chrome is personal; Chrome for Testing is the agent/debug browser at http://127.0.0.1:9222; the target app still runs on its own app URL, often localhost:3000; reuse existing tabs and do not create duplicates."
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "UserPromptSubmit", "additionalContext": ctx}}))

if __name__ == "__main__":
    main()
