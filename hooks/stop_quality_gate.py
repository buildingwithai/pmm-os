#!/usr/bin/env python3
"""Light final QA for marketing deliverables."""

from __future__ import annotations

import json
import os
import re
from _common import read_event

# Hard research gate (research-first): a strategy deliverable may not ship until the
# research that must feed it exists in the evidence ledger. (msg_pattern, required
# ledger sections, desk name to run.)
LEDGER_PATH = os.path.join(".agents", "research", "evidence.md")
RESEARCH_GATE = [
    # A launch/GTM is the high bar: it requires the COMPREHENSIVE research sweep, not a slice.
    (r"\b(go-to-market|go to market|gtm plan|launch plan|rollout plan|launch brief)\b",
     ["## pains", "## competitive", "## market", "## channels", "## events", "## gtm"],
     "the full sweep — run pmm-research-brief (all 10 desks)"),
    (r"\b(positioning statement|message house|messaging house)\b", ["## pains", "## competitive", "## market"], "customer + competitive + market"),
    (r"\b(pricing tier|packaging tier|price tier|pricing recommendation|tier strategy)\b", ["## proof", "## competitive"], "pricing + competitive"),
    (r"\b(conference|sponsorship|field marketing|events desk|event target|booth)\b", ["## events"], "events"),
]
PROCEED_WITHOUT = re.compile(r"\b(without research|skip (the )?research|no research|proceed anyway|already (did|have|ran) (the )?research|don'?t research|ignore (the )?research)\b", re.I)


def _ledger_text() -> "str | None":
    try:
        with open(LEDGER_PATH, encoding="utf-8") as fh:
            return fh.read().lower()
    except OSError:
        return None


REQUIRED_BY_TOPIC = [
    (r"\b(launch|gtm|go-to-market|rollout)\b", ["audience", "owner", "timeline", "launch tier", "metric"]),
    (r"\b(campaign brief|campaign plan|creative brief)\b", ["objective", "audience", "insight", "smp", "channel", "metric", "raci"]),
    (r"\b(positioning|messaging|value prop|message house)\b", ["audience", "pain", "claim", "proof", "differentiator"]),
    (r"\b(pricing|packaging|tier|sku)\b", ["value metric", "segment", "package", "risk", "measurement"]),
    (r"\b(competitive|battlecard|competitor)\b", ["competitor", "positioning", "proof", "objection", "source"]),
    (r"\b(account research|icp scoring|target account|outreach)\b", ["fit", "signal", "why now", "next action", "source"]),
    (r"\b(value map|technical marketing|metadata|on-page seo|editing code|osp)\b", ["audience", "claim", "value", "proof", "metadata"]),
    (r"\b(cro|experiment|a/b|ab test)\b", ["hypothesis", "metric", "baseline", "variant", "decision rule"]),
    (r"\b(artifact|deliverable|asset pack|slides|docx|pptx|social posts|image prompts)\b", ["format", "audience", "purpose", "owner", "review"]),
    (r"\b(plg|activation|aha moment|growth loop|pql|pqa|retention|expansion)\b", ["segment", "metric", "baseline", "experiment", "decision rule"]),
    (r"\b(prd|requirements|prototype|roadmap|product lifecycle)\b", ["user", "problem", "scope", "acceptance criteria", "metric"]),
    (r"\b(post-launch|retrospective|impact analysis|feedback synthesis|iteration)\b", ["baseline", "target", "actual", "learning", "next action"]),
]

COACH_TRIGGERS = r"\b(feedback|critique|review|pressure test|improve|coach|stakeholder|leadership|exec|sales team|customer-facing)\b"


def _last_message_from_transcript(event: dict) -> str:
    """Fall back to the transcript when the payload has no last_assistant_message.

    Older clients send only `last_assistant_message_id`, so every check here
    silently no-opped. Reading the transcript makes the behavior the same on
    both payload shapes instead of depending on the client version.
    """
    path = event.get("transcript_path")
    if not path:
        return ""
    try:
        with open(path, encoding="utf-8") as fh:
            lines = fh.readlines()
    except OSError:
        return ""
    for line in reversed(lines[-400:]):
        try:
            entry = json.loads(line)
        except ValueError:
            continue
        if entry.get("type") != "assistant":
            continue
        content = (entry.get("message") or {}).get("content") or []
        text = "".join(c.get("text", "") for c in content if isinstance(c, dict))
        if text.strip():
            return text
    return ""


def main() -> None:
    event = read_event()
    if event.get("stop_hook_active"):
        return
    message = str(event.get("last_assistant_message") or "") or _last_message_from_transcript(event)
    prompt = str(event.get("prompt") or event.get("last_user_message") or "")
    lower = message.lower()
    combined = (prompt + "\n" + message).lower()
    if not lower.strip():
        return

    # Hard research gate first: don't let a substantial strategy deliverable ship
    # ungrounded. Fires only on produced deliverables, and only when the ledger is
    # absent or missing the section that must feed them.
    if len(message) > 500 and not PROCEED_WITHOUT.search(prompt):
        ledger = _ledger_text()
        for pattern, sections, desk in RESEARCH_GATE:
            if re.search(pattern, lower):
                missing = [s for s in sections if ledger is None or s not in ledger]
                if missing:
                    where = "does not exist" if ledger is None else ("has no " + ", ".join(missing))
                    # Advisory, not a block. Refusing to finish someone's first
                    # "help me launch my product" because they haven't run a
                    # ten-desk research sweep yet is how a plugin gets uninstalled.
                    # Say the deliverable is ungrounded; let them decide.
                    print(json.dumps({
                        "systemMessage": (
                            "PMM OS: this deliverable isn't grounded in research yet — "
                            "`.agents/research/evidence.md` " + where + ". Run `pmm-research-desk` (" + desk + ") "
                            "to fan the specialist question set across last30days + agent-reach, capture sourced "
                            "evidence into the ledger, then regenerate this grounded and cited. "
                            "Strategy built on guesses reads confident and is still wrong."
                        ),
                    }))
                    return
                break

    if re.search(COACH_TRIGGERS, combined) and "pmm coach" not in lower and "coach review" not in lower:
        print(json.dumps({
            "decision": "block",
            "reason": "Run one more PMM Coach pass. The user asked for feedback, improvement, stakeholder readiness, or a high-stakes review. Add a short coach review with top gaps and top revisions, then stop."
        }))
        return

    for pattern, required in REQUIRED_BY_TOPIC:
        if re.search(pattern, lower):
            missing = [term for term in required if term not in lower]
            if len(missing) >= 3:
                print(json.dumps({
                    "decision": "block",
                    "reason": "Run one more PMM OS QA pass. The answer appears to be a marketing deliverable but is missing several concrete fields: " + ", ".join(missing) + ". Add them, and make every section substantive — specific (named examples, segments, numbers), reasoned (the why and the trade-off), and evidenced (a proof or source per claim) — not a one-line label. Depth, not padding. Do not invent facts."
                }))
            return


if __name__ == "__main__":
    main()
