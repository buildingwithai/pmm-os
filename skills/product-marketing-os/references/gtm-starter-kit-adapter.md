# GTM Starter Kit Adapter

Use this adapter when marketing work depends on revenue context, account signals, or sales execution.

## Context architecture

Create or update these files under `.agents/marketing-os/context/` when relevant:

```text
profile.md                 Company, product, team, reference customers
icp-definition.md          ICP tiers, anti-ICP, qualification criteria
signal-library.md          Signals, scoring, detection, decay, suppression rules
positioning.md             Value pillars, competitor guardrails, what not to say
competitor-radar.md        Battlecards, win/loss, switching triggers
personas/                  Buyer and user profiles
```

## Signal workflow

```text
Signal fires
  -> validate source and recency
  -> score account against ICP
  -> research account and stakeholders
  -> choose persona and angle
  -> build sequence
  -> set suppression and compliance checks
  -> launch through outbound or CRM tool
  -> measure reply, meeting, pipeline, and signal lift
```

## Account research artifact

```markdown
# Account Research: [Company]
Date: [YYYY-MM-DD]
Signal score: [0-100]
Recommended action: [Immediate outreach / Sequence / Monitor / Skip]

## Snapshot
## Funding and growth
## Stakeholder map
## Active signals
## Competitive context
## The angle
**Why now:**
**Why us:**
**Hook:**
**Recommended sender:**

## Suggested next action
```

## Campaign output folder

```text
.agents/marketing-os/outputs/campaigns/YYYY-MM-DD-[campaign-name]/
├── brief.md
├── sequences/
│   ├── tier1.md
│   ├── tier2.md
│   └── tier3.md
├── metrics.md
└── results.md
```

## MCPs to connect

- CRM: HubSpot, Salesforce, Close
- Data enrichment: Clay, ZoomInfo, Apollo, Clearbit
- Outreach: Outreach, Lemlist, Instantly, Snov, Hunter
- Research: Exa, Google Search, LinkedIn-compatible data provider, company website crawler
- Measurement: GA4, Segment, Mixpanel, campaign platform reports

Use read-first access until the user explicitly asks to create or launch a campaign.
