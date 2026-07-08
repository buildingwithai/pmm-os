# Events & Conferences — ranked field-marketing target list

> Artifact of the **Events Desk** (`references/research-desks/events.md`), hydrated by
> `.agents/research/evidence.md` → `## Events & field marketing`. Ranked by a transparent
> relevance score. Every row carries a source; gated/unknown cells are marked, never invented.

**Product:** {product} · **ICP:** {segment} · **Market:** {market} · **Window:** {launch window}
**Generated:** {YYYY-MM-DD} · **Runs:** {events run files}

| Rank | Event | Date(s) | Location | Format | Audience (size · seniority · ICP-fit) | Relevance | Est. pipeline/MQL | Motion | Cost band | Key deadlines | Competitors present | Source |
| ---: | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| 1 | [{event}]({url}) | {dates} | {city} | {in-person/virtual} | {size} · {seniority} · {high/med/low} | {0-100} | {high/med/low + why} | {sponsor/speak/booth/dinner} | {$ band or "unknown (gated)"} | {CFP/sponsor/early-bird} | {names or —} | {url} |

**Why the top picks rank where they do:** {1–2 lines per top event — the factors that drove the score}.

**Verify before committing budget:** {events with `unknown (gated)` cost/audience cells, deadlines that are close, single-source claims}.

---

## CSV (export as `events.csv`)

```csv
rank,event,url,date,location,format,audience_size,seniority,icp_fit,relevance,pipeline_potential,motion,cost_band,deadlines,competitors_present,source_url
1,{event},{url},{date},{location},{in-person|virtual},{size},{seniority},{high|med|low},{0-100},{high|med|low},{sponsor|speak|booth|dinner},{band|unknown},{deadlines},{names|none},{source_url}
```

## Relevance scoring (show your work)

```
relevance = 0.30·ICP_fit + 0.25·pipeline_track_record + 0.15·audience_size
          + 0.15·timing_fit + 0.10·cost_efficiency + 0.05·competitor_presence
```

Each sub-score 0–100 from the evidence. Don't fabricate precision — if pipeline track
record is unknown, score it conservatively and say so in the "why" note.
