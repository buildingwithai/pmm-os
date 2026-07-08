# Adapted Repository Manifest

PMM OS now adapts the referenced repositories as internal plugin components instead of leaving them as external references only.

## Adapted repos

| Repository | Plugin adaptation |
|---|---|
| VicUgochukwu/pmm-claude-toolkit | Four command workflows, four skills, command shims, MCP builders, artifact templates |
| open-strategy-partners/osp_marketing_tools | OSP value map, content optimizer, metadata builder, editing-code review, on-page SEO checklist, attribution notes |
| alirezarezvani/claude-skills | Agentic orchestration skill, source adapter, hook and MCP routing patterns, agent templates |
| Fearofsnakes/pmm-skillset | Full PMM artifact chain skills, templates, routing, MCP builders |
| KarlRaf/gtm-starter-kit | Account research, ICP scoring, weekly context update, signal campaign workflow |
| nicold2017/pmm-skills | Adaptive messaging, personas, outreach, AEO/GEO, launch and sales enablement patterns |
| pmalliance/product-marketing-skills | PMM context and core PMM strategy skill layer |
| ag5493/pmm-coach | PMM Coach review, pressure test, roleplay, 30-60-90 planning, Stop hook review |
| iamsaurabhsaha/campaign-brief-generator | Campaign brief, quality checker, templates, docx export path |
| Luke2986/plg-gtm-expert | PLG and GTM strategy, metrics, growth loops, PQL/PQA |
| kelegele/oh-my-pm | Product lifecycle, PRD, prototype, post-launch learning, agents and quality gates |

## Runtime locations

- Skills: `skills/`
- Source adapters: `sources/adapted/`
- References: `skills/product-marketing-os/references/`
- Templates: `skills/product-marketing-os/assets/`
- Local MCP server: `mcp/marketing-os-server.js`
- Hooks: `hooks/`
- Agent examples: `examples/codex-agents/`
- Validation: `scripts/validate-marketing-os-plugin.py`

## Cohesion contract

Every adapted source must resolve into the same product loop:

`context -> research -> strategy -> artifact -> PMM Coach review -> execution handoff -> measurement -> iteration`.
