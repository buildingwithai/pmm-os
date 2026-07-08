# Third Party Notices

This plugin package adapts public marketing, PMM, GTM, campaign, coaching, product, PLG, OSP, and MCP patterns into a cohesive Codex plugin structure. Relevant workflows are represented as internal skills, references, templates, command shims, MCP tools, hooks, source adapters, or agent examples.

## Source repositories consulted

- coreyhaines31/marketingskills - original repository and base plugin target, MIT.
- pmalliance/product-marketing-skills - PMM skill taxonomy and shared context pattern, MIT.
- alirezarezvani/claude-skills - cross-agent skills, marketing, research, orchestration, and hooks patterns.
- open-strategy-partners/osp_marketing_tools - OSP MCP tool pattern and technical marketing methodology, Creative Commons Attribution-ShareAlike 4.0 International.
- Fearofsnakes/pmm-skillset - PMM artifact chain, message-market-fit, launch brief, battlecard, sales narrative, and feature announcement patterns, MIT.
- KarlRaf/gtm-starter-kit - GTM context repository, signal library, signal-to-sequence, and output organization patterns, MIT.
- nicold2017/pmm-skills - PMM foundation context, positioning, adaptive messaging, personas, launch, AEO, outreach, and sales enablement patterns, MIT.
- ag5493/pmm-coach - PMM coach modes: work reviewer, pressure test, stakeholder roleplay, and 30-60-90 planning, MIT.
- iamsaurabhsaha/campaign-brief-generator - 6-step campaign brief workflow, 14-section brief, templates, and quality checks, MIT.
- Luke2986/plg-gtm-expert - PLG and GTM strategy discovery, frameworks, templates, and metrics toolkit, MIT.
- kelegele/oh-my-pm - product lifecycle workflow system, 5-layer architecture, subagent model, PRD/prototype skills, and validation layer, MIT.
- VicUgochukwu/pmm-claude-toolkit - PMM slash-command workflows for battlecards, positioning, launch briefs, and pricing analysis, MIT.
- buildingwithai/skills - deep PMM framework library (positioning, messaging, competitive intelligence, personas, pricing/packaging, product launch, rollout, sales enablement, strategic thinking) with references, worksheets, templates, checklists, and glossaries, MIT (© buildingwithai). Folded into the shared framework library at `skills/product-marketing-os/references/library/`.

## Uploaded PMM reference documents

The bundled PMM references under `skills/product-marketing-os/references/` incorporate the launch activity list, naming guide, launch tiers, feature rollout process, and GTM hub documents supplied by the user in this chat.

The framework library under `skills/product-marketing-os/references/library/` is sourced from `buildingwithai/skills` (MIT); its per-domain `README.md` files are the upstream skill index files, demoted so they do not register as standalone skills, with the upstream MIT license preserved in this notice.

## Attribution note

Where this package reuses methodology ideas from these repositories, the integration files name the source pattern and keep the output as an adapted, productized workflow for this Codex plugin. Review upstream licenses before redistributing outside your own repository or marketplace.


## Adaptation note

The v5 package includes source adapter folders under `sources/adapted/` so each source is represented inside the plugin, not merely linked. OSP-derived workflows retain attribution notes because the upstream project states a Creative Commons Attribution-ShareAlike 4.0 International license.

## Vendored research engines

PMM OS bundles two independent research engines as first-class skills so research
works out-of-the-box on a marketplace install (no external pre-install required).
Both are MIT-licensed; their upstream LICENSE is preserved in each skill dir
(`LICENSE.upstream`) and they can be refreshed from upstream via
`scripts/sync-research-engines.sh`.

- **last30days** (`skills/last30days/`) — MIT © Matt Van Horn (mvanhorn),
  https://github.com/mvanhorn/last30days-skill. Vendored engine snapshot (v3.6.0):
  SKILL.md + scripts/ + lib/ + references/ + agents/. Self-contained Python (3.12+,
  zero pip deps). Demo assets, the optional Go MCP, and standalone hooks were not vendored.
- **Agent-Reach** (`skills/agent-reach/`) — MIT © Neo Reid (Panniantong),
  https://github.com/Panniantong/Agent-Reach. Vendored skill (SKILL.md + references)
  plus the installable `agent_reach` package source under `vendor/`. First run installs
  the CLI from the vendored source via `scripts/setup.sh` (Agent-Reach is not published
  to PyPI; vendoring avoids any PyPI/GitHub runtime dependency).
