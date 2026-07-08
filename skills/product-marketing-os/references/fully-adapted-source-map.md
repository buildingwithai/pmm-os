# Fully Adapted Source Map

This file records the upstream repositories that are now represented as adapted skills, references, assets, commands, agents, MCP tools, or hooks inside PMM OS.

| Upstream | Adapted into |
|---|---|
| pmalliance/product-marketing-skills | `pmm-product-context`, `pmm-messaging-positioning`, `pmm-competitive-intelligence`, `pmm-customer-research`, `pmm-go-to-market`, `pmm-pricing-packaging` |
| Fearofsnakes/pmm-skillset | `pmm-icp-definition`, `pmm-positioning-audit`, `pmm-messaging-hierarchy`, `pmm-message-market-fit`, `pmm-voc-synthesis`, `pmm-competitive-landing-page`, `pmm-battlecard`, `pmm-sales-narrative`, `pmm-feature-announcement`, `pmm-launch-brief` |
| KarlRaf/gtm-starter-kit | `gtm-account-research`, `gtm-signal-campaign`, `gtm-icp-scoring`, `gtm-weekly-context-update` |
| nicold2017/pmm-skills | `pmm-adaptive-messaging`, `pmm-personas`, `pmm-customer-research`, `pmm-aeo-geo`, `pmm-outreach`, `pmm-launch-brief`, `pmm-sales-enablement` through base skills |
| ag5493/pmm-coach | `pmm-coach` and Stop hook review loop |
| iamsaurabhsaha/campaign-brief-generator | `pmm-campaign-brief`, `pmm-artifact-factory`, campaign brief templates, quality checks, docx export path |
| Luke2986/plg-gtm-expert | `plg-gtm-strategy`, PLG references, PLG MCP tools |
| kelegele/oh-my-pm | `product-lifecycle-os`, `prd-prototype-factory`, `post-launch-learning-loop`, lifecycle MCP tools, example agents |
| open-strategy-partners/osp_marketing_tools | `osp-value-map`, `osp-content-optimizer`, `osp-technical-marketing`, OSP MCP recommendations, OSP templates |
| alirezarezvani/claude-skills | `agentic-marketing-orchestrator`, agent examples, hook patterns, MCP routing, validation patterns |
| VicUgochukwu/pmm-claude-toolkit | `.claude/commands/*`, `pmm-battlecard`, `pmm-positioning-exercise`, `pmm-launch-brief`, `pmm-pricing-analysis` |

Cohesion rule: these are not parallel products. They all resolve into the same chain: context -> research -> strategy -> artifacts -> coach review -> execution handoff -> measurement -> iteration.
