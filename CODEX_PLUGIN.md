# Codex Plugin Plan: PMM OS v4

This package turns the repository into a product-like Codex plugin while keeping the plugin manifest version at `2.1.0`. The existing Claude plugin metadata is left untouched.

## Product loop

```text
Prompt
  -> UserPromptSubmit hook routes the request
  -> product-marketing-os or a focused skill picks the workflow
  -> marketing-os MCP retrieves templates, source references, and tool recommendations
  -> focused skills create artifacts
  -> pmm-artifact-factory creates multi-file bundles when useful
  -> pmm-coach reviews and pressure-tests high-stakes deliverables
  -> PreToolUse protects production marketing systems
  -> PostToolUse interprets failures and nudges next actions
  -> Stop hook catches missing PMM fields before the turn ends
```

## Layers

1. Skills: existing Marketing Skills plus the product marketing orchestrator and PMM, PLG, product lifecycle, PRD, prototype, GTM, campaign, coaching, artifact, OSP, AEO, and signal workflows.
2. Resources: launch tiers, rollout process, launch activity list, naming guide, GTM hub, PLG metrics, product lifecycle architecture, PRD/prototype workflow, campaign brief framework, source integration map, visual artifact guide, and reusable templates.
3. MCP: a bundled read-only `marketing-os` server for routing, skill lookup, templates, launch planning, campaign briefs, PLG planning, product lifecycle planning, PRD/prototype planning, artifact bundle planning, image prompts, signal workflows, naming scorecards, and MCP recommendations.
4. Hooks: session loading, prompt routing, subagent context, production tool guardrails, failure interpretation, and final quality gates.
5. Artifact production: a zero-dependency script that can scaffold `.md`, `.docx`, `.pptx`, `.csv`, and `.json` files from a JSON spec.

## Added skills

```text
skills/product-marketing-os/
skills/pmm-product-context/
skills/pmm-messaging-positioning/
skills/pmm-competitive-intelligence/
skills/pmm-customer-research/
skills/pmm-go-to-market/
skills/pmm-pricing-packaging/
skills/pmm-campaign-brief/
skills/pmm-artifact-factory/
skills/pmm-coach/
skills/gtm-signal-campaign/
skills/osp-technical-marketing/
skills/pmm-message-market-fit/
skills/pmm-feature-announcement/
skills/pmm-aeo-geo/
skills/plg-gtm-strategy/
skills/product-lifecycle-os/
skills/prd-prototype-factory/
skills/post-launch-learning-loop/
```

## Key files

```text
.codex-plugin/plugin.json
.agents/plugins/marketplace.json
.mcp.json
THIRD_PARTY_NOTICES.md
assets/icon.svg
assets/logo.svg
mcp/marketing-os-server.js
mcp/EXTERNAL_MCP_GUIDE.md
hooks/hooks.json
hooks/session_start.py
hooks/user_prompt_submit.py
hooks/pre_tool_use_policy.py
hooks/post_tool_use_review.py
hooks/subagent_start.py
hooks/stop_quality_gate.py
skills/pmm-artifact-factory/scripts/render_artifact_bundle.py
docs/marketing-skills-os-v3.md
docs/marketing-skills-os-v4.md
examples/codex-agents/*.toml
```

## Local validation

Run this from the repository root after applying the patch:

```bash
python3 -m json.tool .codex-plugin/plugin.json >/dev/null
python3 -m json.tool .agents/plugins/marketplace.json >/dev/null
python3 -m json.tool .mcp.json >/dev/null
python3 -m json.tool hooks/hooks.json >/dev/null
python3 -m py_compile hooks/*.py skills/pmm-artifact-factory/scripts/render_artifact_bundle.py
node --check mcp/marketing-os-server.js
python3 scripts/validate-marketing-os-plugin.py
python3 skills/pmm-artifact-factory/scripts/render_artifact_bundle.py --sample --out .agents/marketing-os/outputs/sample-pack
cat <<'JSON' | PLUGIN_ROOT="$PWD" node mcp/marketing-os-server.js
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke-test","version":"0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized","params":{}}
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"route_marketing_workflow","arguments":{"task":"Launch a new product and create campaign brief slides social posts and image prompts"}}}
JSON
```

## Version policy

Do not bump the plugin version unless you want to publish a formal release. This package keeps `2.1.0` in `.codex-plugin/plugin.json`.


## v5 adapted-source expansion

The plugin now includes first-class adapted skills for PMM Claude Toolkit, OSP Marketing Tools, Claude Skills orchestration patterns, PMM Skillset artifact chain, GTM Starter Kit account workflows, and PMM Skills adaptive messaging/outreach patterns. See `ADAPTED_REPOSITORY_MANIFEST.md` and `sources/adapted/`.
