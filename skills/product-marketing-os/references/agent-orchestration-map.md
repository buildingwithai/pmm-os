# Agent Orchestration Map

## Purpose

This map keeps PMM OS cohesive when a task needs more than one agent or skill.

## Agent roles

| Agent | Primary job | Good outputs |
|---|---|---|
| marketing-researcher | Market, category, customer, competitor research | Research brief, sources, opportunity map |
| product-lifecycle-orchestrator | Full PM loop from perception to validation | Product lifecycle plan, quality gates, workflow state |
| plg-growth-operator | PLG activation, growth loops, PQL/PQA, metrics | PLG readiness, metric tree, experiments |
| gtm-operator | GTM campaign, signal, outbound, sales assist | Campaign plan, sequence, account research |
| artifact-producer | Docs, decks, CSVs, image prompts, HTML prototype scaffolds | Multi-file artifact bundle |
| launch-qa | Launch readiness and final QA | Gap list, risk register, ship or hold recommendation |
| pmm-coach | Feedback, pressure testing, stakeholder readiness | Scorecard, objections, revision plan |

## Default orchestration

```text
Researcher -> Product lifecycle -> PMM strategy -> PLG/GTM strategy -> Artifact producer -> PMM coach -> Launch QA -> Measurement loop
```

## When to use subagents

Use subagents for bounded research or QA tasks that can run separately from the main deliverable. Keep strategy synthesis in the main thread unless the user asks for a full multi-agent workflow.
