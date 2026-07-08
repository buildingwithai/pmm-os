# Channels Desk

**Lens:** demand-gen lead. The job: find where the ICP actually gathers and pays attention
— the communities, newsletters, podcasts, subreddits, Slacks, and search terms — ranked
by reach × fit × effort, so the GTM motion spends where the buyers are.

**Inputs:** `{product}`, `{ICP/segment}`, `{market}`. Best run after the Customer Desk
(it tells you who; this finds where).

## Question set (the demand-gen lead's brief)

1. Which **communities** (subreddits, Slack/Discord, forums) does the ICP live in?
2. Which **newsletters / blogs / podcasts** do they actually read/listen to?
3. What **search terms / questions** do they type (intent — for SEO/AEO)?
4. Which **social platforms** + creators drive the conversation in this space?
5. What **content formats** earn engagement here (vs. fall flat)?
6. Where do competitors get traction (channels worth contesting)?
7. **Effort vs payoff** — which channels are reachable for our size/budget?

## Engine fan-out (decompose, run in parallel)

| Question | `agent-reach` | `last30days` |
| --- | --- | --- |
| 1 communities | search `"best communities for {ICP role}"`; read round-ups; check subreddit sizes | topic `"where do {ICP} hang out"` |
| 2 newsletters/podcasts | search + read "best {space} newsletters/podcasts" lists | topic `"best {category} newsletter / podcast"` |
| 3 search intent | (use the host's WebSearch for query/PAA mining) | topic `"how do I {job}"` (the questions people ask) |
| 4 platforms/creators | fetch creator profiles; agent-reach social search | topic `"{category}"` (which platforms/creators surface) |
| 6 competitor channels | read where competitors post / are discussed | topic `"{competitor}"` (where they show up) |

Run = **2–4 `last30days` topics + ~10–15 `agent-reach` reads/searches**.

## Evidence target

`## ICP signals` (channels & where-they-gather) + a `## Channels & KOLs` block in the
ledger, sourced (subscriber/member counts where available, marked if estimated).

## Artifact (hydrated)

**Channel / community map** — a ranked table: Channel · Type · Reach (size) · ICP fit ·
Effort · Recommended play · Source. Built on the audience/stakeholder pattern from
[`account-research-template.md`](../../assets/account-research-template.md) and the
GTM signal approach in `gtm-signal-campaign`. Renders as a `v-channels` table; exports
`channels.csv`. Ranking: `reach × ICP_fit × reachability`.

## Flow

`{ICP}+{market}` → this question set → engine fan-out → `## ICP signals` / `## Channels & KOLs`
→ ranked channel map → feeds `pmm-go-to-market`, `pmm-campaign-brief`, `gtm-signal-campaign`,
`pmm-aeo-geo` (search intent), and the Analyst/Influencer Desk.
