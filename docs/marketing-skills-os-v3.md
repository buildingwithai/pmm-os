# PMM OS v3 Integration Plan

This update turns the plugin into a cohesive PMM, GTM, campaign, coaching, and artifact production system.

## What changed

- Added PMM Coach for feedback, roleplay, pressure testing, and 30-60-90 planning.
- Added Campaign Brief Builder using a 14-section campaign brief framework.
- Added Artifact Factory for multi-file deliverable packs, slides, docs, CSVs, image briefs, and HTML prototypes.
- Added GTM Signal Campaign workflows for account research and signal-triggered outbound.
- Added Message Market Fit and Feature Announcement workflows from artifact-first PMM patterns.
- Added OSP Technical Marketing Adapter for value maps, metadata, editing, technical writing, and on-page SEO.
- Added AEO/GEO strategy workflow for AI search visibility and LLM citation work.
- Expanded the bundled MCP server with campaign, coaching, artifact, signal, image, and OSP tools.
- Expanded hooks so prompts route into the right chain and high-stakes deliverables get a PMM Coach pass.

## Unified product chain

```text
Prompt
  -> UserPromptSubmit routing
  -> product-marketing-os or focused skill
  -> marketing-os MCP templates and recommendations
  -> artifact creation
  -> PMM Coach review
  -> final QA hook
  -> measurement and production handoff
```

## Default deliverable bundle for launches

1. Launch brief
2. Campaign brief
3. Messaging hierarchy
4. Launch blog or changelog
5. Email sequence
6. Social launch pack
7. Image generation briefs
8. Sales enablement one-pager
9. FAQ or objection handling
10. Deck outline
11. Measurement plan
12. PMM Coach review

## Version note

The plugin manifest version remains `2.1.0`.
