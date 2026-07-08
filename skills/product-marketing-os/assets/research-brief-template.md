# Research Brief — {product}

> The research front door: a ramble distilled into a product brief + a plan the engines
> can run. Produced by `pmm-research-brief`; drives `pmm-research-desk`. Hypotheses are
> marked `(hypothesis — verify)`; nothing here is asserted as fact until a desk sources it.

**Generated:** {YYYY-MM-DD} · **From:** {user input / docs / repo}

## Product Brief

- **Product:** {name (+ any prior name)}
- **What it is (one line):** {…}
- **What it does:** {the core job, in the user's terms}
- **Key capabilities:** {features deduped to capabilities — what it actually lets you do}
- **ICP hypothesis:** {segment · seniority · company type} `(hypothesis — verify)`
- **Market / category:** {…} `(hypothesis — verify)`
- **Goal / motion:** {launch · GTM · positioning · pricing · …}
- **Constraints:** {budget · timeline · brand · channel limits}
- **Unknowns to resolve by research:** {the specific gaps}

## Research Plan

**All ten desks are mandatory** — a complete PMM sweep is the floor for an impeccable
launch. You set each desk's *scope* (named entities so the engines have targets) and the
*run order* — you do **not** skip a discipline. Priority = run-order only: 🔴 now · 🟡 next · 🟢 foundation.

| Desk | Priority | Scope (named entities / segment / market) | Key questions | Engines / sources |
| --- | :---: | --- | --- | --- |
| Product | 🟢 | {confirm capabilities from {docs/repo}} | what does it actually do / differentiate | agent-reach (first-party reads) |
| Customer | 🔴 | segment = {…}; market = {…} | top pains · jobs · language · triggers | last30days ({topics}) + agent-reach (forum reads) |
| Competitive | 🔴 | {named competitors} | who wins/loses · pricing · gaps | reach.sh gh-search/read + last30days ({X vs Y}) |
| Market | 🔴 | category = {…} | why-now · forces · whitespace | last30days ({trend topics}) + agent-reach |
| Pricing | 🟡 | {competitors to benchmark} | value metric · comparables · WTP | agent-reach (pricing pages) |
| Channels | 🔴 | {communities/platforms} | where the ICP gathers · intent | last30days + agent-reach |
| Analyst/KOL | 🟡 | {category, ICP} | who shapes the narrative | agent-reach (profiles) |
| Events | 🔴 | {named events / fairs / conferences} | where the ICP is to table/sponsor/speak | agent-reach (event sites) + last30days |
| Reviews | 🔴 | {competitors × applicable review sites/stores} | dislikes · switching language · ratings trend | agent-reach (G2/Capterra/store/Glassdoor reads) |
| GTM/Launch | 🔴 | {comparable launches, motion} | how to launch impeccably · channels · activation | agent-reach (launch retros) + last30days |

## Run order

1. Product → Customer → Competitive → Reviews (the foundation spine)
2. Channels / Events / GTM-Launch (the go-to-market motion)
3. Market / Pricing / Analyst-KOL (rounding out the picture)
4. each desk = a sprint: mini-hypothesis in → findings + carry-forward out; the next
   desk reads `.agents/research/carry-forward.md` at scope time
5. each desk → `.agents/research/evidence.md` (sourced) → hydrates the rest of PMM OS

> Confirm before kicking off long/metered runs. Then: `pmm-research-desk` per planned desk,
> highest priority first.
