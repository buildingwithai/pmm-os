# Mission Control: Next.js Boilerplate Website

## Original Objective

Use `guillim/nextjs-boilerplate` as the reference for a fuller idkWidk product website with install instructions, docs, blog content, and clear Codex plugin distribution guidance.

## Current User-Level Goal

Make the website explain the plugin, show how to install it in Codex, and give the project a clearer future SaaS architecture.

## Current Engineering Phase

Verified first pass

## Task Classification

- Work type: Product website architecture and implementation
- Risk level: Medium
- Platform: Next.js website
- Owner: Codex

## Current Hypothesis

The safest architecture is a light transplant: use the boilerplate's route/product structure, but do not add Prisma/Auth/Stripe/Mailgun as required dependencies until the website actually needs accounts, billing, or email.

## Evidence Collected

| Evidence | Source | Confidence | Notes |
|---|---|---|---|
| Boilerplate cloned | `.um/references/nextjs-boilerplate` | High | Commit `6a45468` on `main` |
| Boilerplate includes SaaS modules | README and file tree | High | Landing, auth, billing, dashboard, Prisma, Stripe, Mailgun, analytics |
| Blog/docs are not fully shipped in boilerplate | README | High | Both are marked coming soon |
| Current plugin install path exists | `README.md` | High | Add GitHub marketplace source in Codex |
| Current plugin manifest exists | `plugins/idk-widk/.codex-plugin/plugin.json` | High | Version `0.3.0` |
| Public OpenAI docs do not show a self-serve featured plugin switch | Official OpenAI Codex docs/search | Medium | Treat featured placement as OpenAI-curated/approval-dependent |

## Active Workstream

Create the fuller website while preserving the existing SuperIsland notch and keeping the site buildable.

## Blocking Issues

| Issue | Why it blocks | Owner | Status |
|---|---|---|---|
| None active | Static website architecture can be implemented now | Codex | Clear |

## Side Quests / Parked Issues

| Issue | Why parked | Revisit when | Status |
|---|---|---|---|
| Full Auth/Prisma/Stripe transplant | Would add env and database setup before needed | When accounts or payments are real requirements | Parked |
| Featured Codex plugin placement | Depends on OpenAI acceptance/curation, not local code | When there is a submission process to follow | Parked |
| Blog CMS | Boilerplate does not ship one; static blog is enough now | When multiple posts need authoring workflow | Parked |

## Decision Log

| Date | Decision | Why | Consequence |
|---|---|---|---|
| 2026-05-19 | Clone boilerplate under `.um/references` | Inspect it without mixing source trees | Reference stays local and ignored |
| 2026-05-19 | Use architecture, not full dependency stack | Keep site buildable and focused | Add routes/content now; park heavy SaaS services |

## Files Touched or Likely Involved

| File or area | Reason | Status |
|---|---|---|
| `apps/website/app/page.tsx` | Main product site | Complete |
| `apps/website/app/globals.css` | Product/docs/blog layout | Complete |
| `apps/website/app/docs/page.tsx` | Install docs | Complete |
| `apps/website/app/blog/page.tsx` | Blog route and first post | Complete |
| `docs/idkwidk/nextjs-boilerplate-site/*` | idkWidk process state | Complete |

## Tests and Verification

| Check | Status | Evidence | Notes |
|---|---|---|---|
| Boilerplate clone | Complete | Commit `6a45468` | Reference only |
| Website build | Complete | `npm run build` in `apps/website` | Routes generated: `/`, `/docs`, `/blog` |
| Browser route check | Complete | `/tmp/idkwidk-home-boilerplate.png`, `/tmp/idkwidk-docs-boilerplate.png`, `/tmp/idkwidk-blog-boilerplate.png` | Each route rendered with install source and distribution truth |
| Official docs spot-check | Complete | OpenAI Codex docs/help pages | No public self-serve featured-plugin control found |

## Next Best Action

Wire real account, billing, email, and database services only when those become product requirements.

## Resume Prompt

```text
Continue Next.js Boilerplate Website. Read docs/idkwidk/nextjs-boilerplate-site/MISSION_CONTROL.md first. Preserve the original objective: use guillim/nextjs-boilerplate as architecture reference for a fuller idkWidk plugin website, keep the site buildable, explain Codex install and plugin discovery truth, update evidence, classify side quests, and verify before claiming done.
```
