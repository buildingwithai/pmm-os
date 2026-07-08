# PMM OS v4 Integration Plan

This update expands v3 from a PMM and GTM artifact system into a more complete product, PLG, GTM, campaign, coaching, and artifact operating system.

## What changed

- Added `plg-gtm-strategy` for product-led growth, activation, AHA moments, time to value, growth loops, PQL/PQA, trial strategy, retention, expansion, and metrics.
- Added `product-lifecycle-os` for the five-layer product loop: Perception, Strategy, Design, Delivery, Validation.
- Added `prd-prototype-factory` for scenario-driven PRDs, user stories, acceptance criteria, analytics events, prototype briefs, and HTML prototype scaffolds.
- Added `post-launch-learning-loop` for launch readouts, feedback synthesis, metric scorecards, PMM coach critique, and iteration planning.
- Added example Codex agents for product lifecycle orchestration, PLG growth operation, and prototype building.
- Expanded the bundled MCP server with PLG, product lifecycle, PRD, prototype, growth loop, and post-launch tools.
- Expanded hooks so PLG, product management, PRD, prototype, roadmap, and validation prompts route into the correct skill chain.
- Expanded the artifact factory sample bundle with PRD, PLG metrics, lifecycle state, post-launch readout, and prototype scaffold files.

## Unified product chain

```text
Prompt
  -> UserPromptSubmit routing
  -> product-marketing-os or focused skill
  -> product lifecycle or PLG branch if needed
  -> marketing-os MCP templates and recommendations
  -> PRD, prototype, launch, campaign, or artifact pack
  -> PMM Coach review
  -> final QA hook
  -> measurement and iteration loop
```

## New skill set

```text
skills/plg-gtm-strategy/
skills/product-lifecycle-os/
skills/prd-prototype-factory/
skills/post-launch-learning-loop/
```

## New MCP tools

```text
plg_readiness_assessment
plg_metrics_map
growth_loop_designer
pm_lifecycle_plan
prd_plan_builder
prototype_brief_builder
post_launch_learning_plan
agent_orchestration_map
```

## Default deliverable bundle for a serious product launch

1. Product lifecycle plan
2. Product context
3. Research summary
4. Positioning and messaging
5. PLG or GTM motion map
6. PRD and acceptance criteria
7. Prototype brief or HTML prototype scaffold
8. Launch brief
9. Campaign brief
10. Email sequence
11. Social pack
12. Image prompts
13. Sales enablement one-pager
14. Measurement plan
15. Post-launch learning report
16. PMM Coach review

## Version note

The plugin manifest version remains `2.1.0`.
