# Source Repository Map

This plugin is an adapted-source synthesis layer. It does not copy every byte from every upstream repository, but each relevant repository is now represented as internal skills, source adapters, references, templates, MCP tools, hooks, command shims, or agent examples.

## Integrated sources

| Source | What it contributes | Integration in this plugin |
|---|---|---|
| coreyhaines31/marketingskills | Broad marketing skill library for CRO, SEO, ads, email, analytics, copy, growth, sales enablement, pricing, launch, and related workflows | Base skills directory remains the execution layer for growth marketing and channel work |
| pmalliance/product-marketing-skills | Six PMM skills around shared product context, messaging, competitive intelligence, customer research, GTM, and pricing | Converted into the pmm-* skill layer and the product-marketing-os orchestrator |
| alirezarezvani/claude-skills | Large multi-domain skill library with marketing, product, research, personas, orchestration, and security patterns | Adapted into `agentic-marketing-orchestrator`, agent examples, hook patterns, MCP routing, and source adapter notes |
| open-strategy-partners/osp_marketing_tools | MCP-based technical marketing tools for value maps, metadata, editing codes, technical writing, and on-page SEO | Adapted into `osp-value-map`, `osp-content-optimizer`, `osp-technical-marketing`, OSP MCP recommendations, templates, and attribution notes |
| Fearofsnakes/pmm-skillset | Artifact-first PMM workflows: ICP, positioning audit, messaging hierarchy, message-market fit, VOC synthesis, launch brief, battle cards, sales narrative, feature announcement | Adapted into the artifact chain skills: ICP, positioning audit, messaging hierarchy, VOC synthesis, message-market fit, competitive landing page, battlecard, sales narrative, launch brief, and feature announcement |
| KarlRaf/gtm-starter-kit | GTM context files, account research, signal library, ICP scoring, signal-to-sequence workflows, and output conventions | Adapted into GTM account research, signal campaign, ICP scoring, weekly context update, and context architecture references |
| nicold2017/pmm-skills | PMM context foundation, positioning, personas, customer research, launch, AEO/GEO, outreach, and sales enablement | Adapted into adaptive messaging, personas, outreach, AEO/GEO, launch, sales enablement patterns, and PMM operating sequence |
| ag5493/pmm-coach | Roleplay, work review, 30-60-90 plan builder, and pressure testing for PMMs | Added as the pmm-coach skill and hook-driven review loop |
| iamsaurabhsaha/campaign-brief-generator | 6-step campaign brief wizard, 14-section brief framework, quality checker, templates, and .docx export concept | Added as the pmm-campaign-brief skill, campaign templates, and artifact factory output model |
| Luke2986/plg-gtm-expert | PLG and GTM strategy, structured discovery, PLG funnel, AHA moment, growth loops, PQL/PQA, pricing, and metrics toolkit | Added as `plg-gtm-strategy`, PLG MCP tools, and PLG metrics references |
| kelegele/oh-my-pm | Five-layer product lifecycle, subagents, scenario-driven PRDs, HTML prototypes, collaboration modes, quality gates, impact analysis, and feedback synthesis | Added as `product-lifecycle-os`, `prd-prototype-factory`, `post-launch-learning-loop`, product lifecycle MCP tools, and example agents |
| VicUgochukwu/pmm-claude-toolkit | PMM slash-command workflows for battlecards, positioning, launch briefs, and pricing analysis | Added as `.claude/commands/*`, `pmm-battlecard`, `pmm-positioning-exercise`, `pmm-launch-brief`, `pmm-pricing-analysis`, MCP builders, and artifact templates |

## Cohesion rule

All sources resolve into the same flow:

```text
Context -> Research -> Product Strategy -> PLG/GTM Strategy -> Positioning -> Messaging -> PRD/Prototype when needed -> Deliverables -> Coaching Review -> Production Plan -> Measurement -> Iteration
```

When there is overlap, the plugin should not run parallel versions of the same work. It should pick one primary workflow and borrow the best supporting checks from adjacent sources.

## Licensing note

Most referenced repositories are MIT or permissive. OSP Marketing Tools uses Creative Commons Attribution-ShareAlike 4.0. The plugin includes adapted OSP workflow skills and templates with attribution notes, and still recommends connecting to the upstream OSP MCP for live tool execution when available.
