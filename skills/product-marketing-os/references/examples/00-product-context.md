# Product Context — Plotline *(gold-standard example)*

*Fictional company, used across the PMM OS worked examples. The shared context
every other deliverable reads first.*

## What it is

**Plotline** is product analytics for teams who don't write SQL. You ask a
question in plain English — "where do trial users drop off before they invite a
teammate?" — and get a funnel, a cohort, or a chart back in seconds. Events are
captured automatically (no engineering tickets to add tracking), and metric
definitions are shared, so marketing, product, and the exec team argue about
*what to do* instead of *whose number is right*.

## Who it's for

- **Best-fit:** PM, growth, and product-marketing owners at **20–200-person B2B
  SaaS** companies that have a product worth instrumenting but **no dedicated
  data team** (or a data team so backed up that a "quick question" takes days).
- **Anti-fit:** data-mature orgs that already run a warehouse + dbt + a BI tool
  and want a modeling layer (Plotline is not that), and pre-PMF teams with no
  usage yet (nothing to analyze).

## The problem today

The person who needs the answer (a PM or marketer) is not the person who can get
it (a data analyst with SQL and warehouse access). So every question becomes a
ticket in a queue. Decisions get made on gut, or wait a week. Meanwhile the
"powerful" tools (Vista Analytics, Pulse) were bought, half-instrumented, and
abandoned because they needed a data person to maintain — shelfware.

## Why now

Series A/B SaaS teams are under pressure to show efficient growth, but headcount
(especially data) is frozen. The job-to-be-done — "let the people closest to the
problem answer their own data questions" — is suddenly a survival skill, not a
nice-to-have.

## Proof we can point to (and gaps)

- **Have:** median time-to-first-answer for a new user is **4 minutes** vs. an
  internal benchmark of ~2 days through a data-team queue (onboarding telemetry).
- **Have:** 71% of weekly active Plotline users are **non-technical** (no SQL).
- **Gap (needs sourcing):** a named customer logo + a quantified retention/winrate
  outcome. Currently anecdotal — flagged for a case study.

## Key facts for downstream work

- Category we're framing: **product analytics** (not web analytics, not BI).
- Top alternatives: **Vista Analytics** (enterprise suite), **Pulse**
  (mid-market point tool), **a SQL analyst + the data queue**, and **spreadsheets
  / gut**.
- Pricing today: usage-based on **monthly tracked users (MTU)**, free tier for
  one product up to 10k MTU.
- Voice: plain-spoken, a little anti-jargon, pro-"do it yourself." Never "leverage
  data-driven synergies."
