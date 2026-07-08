# Agentic Skill Orchestration

Source pattern: alirezarezvani/claude-skills.

PMM OS adapts the cross-agent pattern into these roles:

| Agent | Use |
|---|---|
| marketing-researcher | Market, customer, competitive, and AEO research |
| product-lifecycle-orchestrator | Product lifecycle and PRD workflows |
| plg-growth-operator | Activation, PQL, PQA, growth loops, pricing motion |
| gtm-operator | Account research, signal campaigns, sales handoff |
| prototype-builder | HTML prototype and product artifact scaffolding |
| artifact-producer | Docs, slides, CSVs, image prompts, briefs |
| pmm-coach | Review, pressure test, feedback, stakeholder readiness |
| launch-qa | Final launch and production-readiness QA |

Rules:

1. Delegate bounded tasks only.
2. Keep synthesis in the main conversation.
3. Save workflow state before and after each chain.
4. Use read-only MCP mode first.
5. Run PMM Coach before high-stakes handoff.
