# PMM OS v5

v5 promotes the remaining referenced repositories into adapted, internal plugin components.

## New source-adapted layers

- PMM Claude Toolkit: battlecard, positioning, launch brief, pricing analysis, and Claude command shims.
- OSP Marketing Tools: value map, metadata, editing codes, technical writing, and on-page SEO workflows.
- Claude Skills architecture: orchestration, hook, MCP routing, and agent patterns.
- PMM Skillset: full artifact chain from ICP through sales narrative.
- GTM Starter Kit: account research, ICP scoring, signal campaigns, and weekly context update.
- PMM Skills: adaptive messaging, personas, outreach, AEO/GEO, launch, and enablement patterns.

## Cohesive product loop

Context -> research -> product and market strategy -> PMM strategy -> PLG or GTM motion -> artifact generation -> PMM Coach review -> tool handoff -> measurement -> iteration.

## Validation

Run:

```bash
python3 scripts/validate-marketing-os-plugin.py
python3 skills/pmm-artifact-factory/scripts/render_artifact_bundle.py --sample --out .agents/marketing-os/outputs/sample-pack
```
