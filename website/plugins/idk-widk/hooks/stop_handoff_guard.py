#!/usr/bin/env python3
import json, sys, re

def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return
    if payload.get("stop_hook_active"):
        print(json.dumps({"continue": True}))
        return
    msg = payload.get("last_assistant_message") or ""
    low = msg.lower()
    claims_done = any(w in low for w in ["done", "fixed", "implemented", "completed", "finished", "created", "updated"])
    has_verification = any(w in low for w in ["verified", "verification", "tested", "test", "build", "lint", "typecheck", "not run", "remaining risk", "remaining risks"])
    claims_visual = any(w in low for w in ["visual parity", "looks correct", "ui is correct", "design matches", "screenshot", "dom", "css", "devtools"])
    has_visual_evidence = any(w in low for w in ["screenshot", "screen shot", "visual diff", "devtools", "dom", "computed style", "browser evidence", "visual qa"])
    if claims_done and claims_visual and not has_visual_evidence:
        print(json.dumps({"decision": "block", "reason": "Before stopping, add idkWidk visual QA evidence: screenshots or browser evidence, DOM/CSS/runtime notes if relevant, what matched, what differed, what was not visually verified, and the next safest action."}))
    elif claims_done and not has_verification:
        print(json.dumps({"decision": "block", "reason": "Before stopping, add an idkWidk verification and handoff summary: what changed, what was verified, what was not verified, remaining risks, and the next safest action."}))
    else:
        print(json.dumps({"continue": True}))

if __name__ == "__main__":
    main()
