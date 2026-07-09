# Customer Desk

**Lens:** customer researcher (Adele Revella / JTBD school). The job: surface what a
**specific segment in a specific market** actually wants, fears, and says — in their own
words — and turn it into personas and an ICP. **Parametric:** always scoped to
`{segment} × {market} × {product}`, never "users" in general. Hard-gate dependency for
positioning/messaging/GTM.

**Inputs:** `{product}`, `{ICP/segment}` (role · seniority · company type), `{market}`,
optional `{existing customers / call notes / reviews}`.

## Question set (the researcher's brief)

1. **Jobs** — what is this segment trying to get done (functional, social, emotional)?
2. **Pains** — top frustrations with the status quo, in their own words (verbatim)?
3. **Gains** — what does a win look like; what would make them switch?
4. **Triggers** — what event makes them go looking for a solution?
5. **Buying behavior** — who's in the committee, how do they evaluate, what objections?
6. **Language** — the exact phrases they use for the problem (for messaging)?
7. **Where they are** — communities/channels they trust (hands off to the Channels Desk)?
8. **Anti-signals** — who looks similar but churns / shouldn't be targeted (negative persona)?

**Platform matrix (walk every cell or log the skip):** Reddit · X · HN · web/SERP · review sites (dislike fields) · GitHub (if dev-adjacent); YouTube search-titles only — transcripts excluded (rate-limit sink). Query archetypes: pain vents · "switched to" · "how do you handle" · regret threads.

## Engine fan-out (decompose, run in parallel)

| Question | `agent-reach` | `last30days` |
| --- | --- | --- |
| 1–2 jobs/pains | search + read forum/Reddit/community threads where the segment vents; read review sites | topic `"{problem} {segment}"`, `"why {segment} hate {status-quo}"` (engagement-ranked pains + quotes) |
| 3 gains/switch | read "switched to / finally fixed" threads | topic `"best {category} for {segment}"` (what they recommend) |
| 4 triggers | read complaint/"how do you handle X" threads | topic `"{trigger event}"` |
| 5 buying | read buyer threads, RFP/eval discussions | — |
| 6 language | harvest verbatim phrasing across all of the above | (the quotes the engine returns) |
| 8 anti-signals | search churn/"regret buying {category}" | topic `"regret {category}"` |

Run = **2–4 `last30days` topics (scoped to the segment) + ~10–20 `agent-reach` reads**.

**last30days targeting is mandatory** — always pass `--subreddits={the segment's real
communities}` and a tight, entity-anchored topic. A bare generic topic returns entity-miss
NOISE (measured on a live run: an untargeted consumer-domain topic came back as horror-movie
reviews + Kubernetes docs; the same topic with the segment's four real subreddits returned a
335-upvote on-topic thread). Resolve the segment's subreddits FROM THE BRIEF's scope —
they are an input derived from `{segment}`, never a fixed list.

## Evidence target

`## Pains & VoC` (verbatim, sourced, segment-tagged) + `## ICP signals` in the ledger.

## Artifacts (the skill's real templates, hydrated)

1. **Persona one-pager(s)** — [`library/personas/assets/templates/persona-one-pager.md`](../library/personas/assets/templates/persona-one-pager.md)
   (Profile · Goals · Pain Points · Buying Behavior · Objections · Messaging Guidance ·
   Quote · Quick Reference Card). Renders as the `v-personas` view + inspector cards.
2. **ICP definition** — [`library/positioning/assets/icp-analysis-worksheet.md`](../library/positioning/assets/icp-analysis-worksheet.md)
   (fit criteria, top-20% patterns, anti-ICP). Renders as an ICP scorecard.
3. **Pain / VoC board** — ranked pains with verbatim quotes + sources. Renders as a `v-pains` table.
4. *(when relevant)* **Negative persona** — [`library/personas/assets/templates/negative-persona-template.md`](../library/personas/assets/templates/negative-persona-template.md).

Methodology: [`library/personas/core/01-research-interviews.md`](../library/personas/core/01-research-interviews.md)
+ `02-creating-personas.md`; the [`value-proposition-canvas`](../library/positioning/assets/value-proposition-canvas.md) Jobs/Pains/Gains.

## Flow

`{segment}×{market}×{product}` → this question set → engine fan-out → `## Pains & VoC` +
`## ICP signals` → persona one-pagers + ICP + pain board → feeds positioning, messaging,
personas, message-market-fit, the Channels Desk.
