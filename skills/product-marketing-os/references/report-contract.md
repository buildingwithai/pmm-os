# Report Contract — the typed interface between research and the dashboard

`report.json` and `deliverables.json` are how a research run survives the chat: the desk
runner ([`pmm-research-desk`](../../pmm-research-desk/SKILL.md)) writes them, the generator
([`report-to-kit.mjs`](../../pmm-launch-kit/scripts/report-to-kit.mjs)) reads them, the
launch kit renders them. If a field isn't in this contract, the dashboard never sees it —
so the runner writes to this shape, exactly.

## The flow runs report.json → report-to-kit.mjs → kit-content.json, in place

Per its own header: `node report-to-kit.mjs <target-dir>` reads
`<dir>/.agents/research/report.json` (the structured report) **and** the existing
`<dir>/kit-content.json`, then rewrites `kit-content.json` in place. The report supplies
the **meat** (cited findings, insight → evidence → implication, per desk); the existing
kit supplies the **artifacts** (its table/rows blocks — matrix, battlecards, pricing
table), which are preserved and placed *after* the meat. It composes the two-altitude desk
views (Briefing + Full research report + Artifact + Gaps), the events table, the GTM
readout (`v-gtm-readout`), the Evidence Appendix (`v-evidence`), and — when
`deliverables.json` is present — the one-pager suite. **Idempotent**: re-running
regenerates from `report.json` + the preserved artifacts.

## report.json holds five top-level keys

At `.agents/research/report.json`:

```jsonc
{
  "desks":  [ /* desk objects, below */ ],
  "events": [ { "event": "", "url": "", "area": "", "date": "", "quarter": "", "audience": "", "fit": "" } ],
  "gtm":    { /* SCQA readout, below */ },
  "verify": { "checked": 60, "suspect": [ { "url": "", "reason": "" } ] },
  "counts": { "events": 30, "desks": 8, "citations": 73 }
}
```

`verify` is the citation spot-check (an empty `suspect` renders as "check passed");
`counts` is the run's own tally, echoed in the generator's log line.

## A desk is cited findings plus its verdict against the hypothesis

Desk `id` must be one the generator maps to a kit view — `product`, `customer`,
`competitive`, `market`, `pricing`, `channels`, `analysts`, `gtmdesk`. An unmapped id is
silently skipped (the events desk lands via the top-level `events[]`, not a desk object).

```jsonc
{
  "id": "competitive",
  "title": "Competitive Desk",
  "objective": "",                    // what this desk set out to answer
  "method": "",                       // engines + calls it ran
  "briefingBluf": "",                 // the bottom line, one paragraph (Briefing altitude)
  "highlights": [ "" ],               // 3–6 bullets under the BLUF
  "findings": [ {
    "insight": "",                    // the action-titled claim
    "evidence": [ /* evidence items, below */ ],
    "implication": ""                 // the so-what
  } ],
  "analysis": "",                     // optional closing synthesis
  "gaps": "",                         // gated/unknown + the adversarial-pass log (renders as the Gaps callout)
  "hypothesisVerdict": "supported",   // NEW, optional: supported | refuted | mixed — vs. hypothesis.md
  "adversarialPass": {                // NEW, optional: the explicit search AGAINST the main finding
    "searched": "what was searched",
    "found": "supports | refutes | nothing-found — plus the one-line detail"
  }
}
```

`hypothesisVerdict` records how the desk's findings scored against the day-1 hypothesis in
`.agents/research/hypothesis.md`; `adversarialPass` is the structured twin of the
adversarial log that also goes in `gaps` (which is what renders today — never omit it there).

## An evidence item is one cited quote or number, typed and dated

```jsonc
{
  "q": "the verbatim quote or the specific number",   // REQUIRED — items without q are dropped
  "who": "who said it / where it appeared",
  "src": "reddit | x | web | github | …",
  "url": "https://…",                                  // only URLs that literally appeared in a run file
  "metric": "the comparator / measurement context",
  "date": "2026-07-01",                                // NEW, optional: capturedAt — the run date, YYYY-MM-DD
  "claimType": "fact",                                 // NEW, optional: fact | estimate | assumption
  "shot": "evidence-shots/customer-r-pm-20260708.png"  // NEW, optional: screenshot of the source, path relative to the kit file
}
```

`shot` renders as a thumbnail under the quote in the kit (click = full size) and as an
image in the markdown mirror. Capture discipline lives in the desk runner: screenshot
**public content only**, keep the source URL + capture date in the record (the filename
carries `<desk>-<slug>-<YYYYMMDD>`), and store PNGs in `.agents/research/evidence-shots/`
(copied next to the kit on build).

The generator currently copies `q · who · src · url · metric` into the kit's `evidence`
blocks; `date` and `claimType` ride in `report.json` (and the ledger) as the audit trail
until the renderer surfaces them. **Additive only** — old reports without the new fields
stay valid, and the new fields must never replace the sourcing the old ones carry.

## gtm is the answer-first SCQA readout

```jsonc
{
  "situation": "", "complication": "", "question": "", "answer": "",
  "segmentation": [ { "segment": "", "priority": "", "why": "" } ],
  "positioning": "", "motion": "",
  "plan": { "pre": [ "" ], "launch": [ "" ], "post": [ "" ] },
  "metrics": [ { "stage": "", "metric": "" } ],
  "risks":  [ { "risk": "", "mitigation": "" } ],
  "asks":   [ "" ]
}
```

Renders as the stakeholder readout (`v-gtm-readout`), recommendation first — per the
[research presentation standard](research-presentation-standard.md).

## deliverables.json carries the one-pager suite

At `.agents/research/deliverables.json` — either `{ "deliverables": [ … ] }` or a bare
array. Each item (skipped unless it has `id` + `blocks`):

```jsonc
{
  "id": "positioning",              // deterministic — views become v-op-<id> / v-wd-<id>
  "title": "", "artifact": "",       // artifact = the registry framework it instantiates
  "governingThought": "",            // the one-sentence answer, rendered first
  "reviewed": "2026-07-01",          // optional visible review date
  "ghostTitles": [ "" ],             // optional: the approved ghost outline it was built from
  "blocks": [ /* registry blocks — the one-pager */ ],
  "working": [ /* registry blocks — the linked working doc (optional) */ ]
}
```

One-pager views land under the **Deliverables** sidebar group; a `working` doc gets its own
view, linked from the page (not the sidebar). Rules for what goes in them:
[deliverable-standard §2](deliverable-standard.md).

## The gates bind here

The Plan gate means `report.json` never exists without `.agents/research/hypothesis.md` +
`issue-tree.md` preceding it; the source gate means no evidence item ships untyped or
unsourced ([deliverable-standard §5](deliverable-standard.md)). A report that violates the
contract doesn't get patched downstream — the desk run gets fixed.
