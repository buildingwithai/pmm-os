---
name: prd-prototype-factory
description: Use when the user needs a PRD, requirements document, product spec, user stories, acceptance criteria, success metrics, UI flow, wireframe, mockup, HTML prototype, or prototype brief. Supports iteration, new feature, and 0-1 product scenarios, then hands off to GTM and artifact generation.
---

# PRD Prototype Factory

You turn product ideas into implementation-ready PRDs and review-ready prototype artifacts.

## Source pattern

This skill adapts the scenario-driven PRD and HTML prototype workflow from `kelegele/oh-my-pm`, then connects it to PMM OS so product definitions become GTM-ready deliverables.

## Scenario detection

First identify the scenario:

| Scenario | Use when | Required inputs |
|---|---|---|
| Iteration update | Existing feature is being improved | Current feature, current UI state, iteration goal |
| New feature | New module inside an existing product | Product architecture, design constraints, entry point |
| 0-1 product | New product or standalone experience | Target user, problem, alternatives, constraints, reference products |

If the scenario is unclear, infer a default and state the assumption. Do not block unless the missing information prevents a useful PRD.

## Information gap analysis

Before drafting the PRD, list missing information and mark each item:

- Known
- Inferred
- Needs user input
- Safe to defer

Do not invent product facts. Use placeholders for unknowns.

## PRD contents

A complete PRD should include:

1. Problem and opportunity
2. Target user and use case
3. Goals and non-goals
4. User stories
5. Functional requirements
6. Non-functional requirements
7. User flow
8. Acceptance criteria
9. Success metrics
10. Analytics events
11. Dependencies
12. Risks and open questions
13. Launch and GTM implications

## Prototype modes

| Mode | Output | Use when |
|---|---|---|
| Wireframe | Low fidelity structure | Flow is uncertain |
| Mockup | Higher fidelity static visual | Stakeholders need to see layout and hierarchy |
| Interactive HTML | Single-file HTML prototype | The user needs a demoable artifact |

## HTML prototype rules

When creating HTML prototypes:

- Use one self-contained HTML file when possible.
- Prefer semantic structure and clear accessibility labels.
- Include visible states for empty, loading, success, and error when relevant.
- Do not depend on private assets or credentials.
- If using a CDN, clearly label it as optional and replaceable.
- Save under `.agents/marketing-os/outputs/[project]/prototype.html` unless the user asks otherwise.

## Output bundle

For a full request, create:

```text
prd.md
acceptance-criteria.md
analytics-events.md
prototype-brief.md
prototype.html or prototype-outline.md
launch-and-gtm-implications.md
```

## Handoff chain

After the PRD is drafted:

1. Run `product-lifecycle-os` quality gates.
2. Run `pmm-messaging-positioning` if the PRD changes product narrative.
3. Run `pmm-go-to-market` if the change needs rollout or launch support.
4. Run `pmm-artifact-factory` if the user needs files, slides, docs, social, or images.
5. Run `pmm-coach` before sharing with executives, product leadership, sales, or customers.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`product-lifecycle-os`](../product-lifecycle-os/SKILL.md) — fits inside the lifecycle
- [`pmm-go-to-market`](../pmm-go-to-market/SKILL.md) — hand the spec to GTM
- [`pmm-artifact-factory`](../pmm-artifact-factory/SKILL.md) — generate prototype assets
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Apply the [PMM OS output-depth standard](../product-marketing-os/references/output-depth-standard.md): every section must be **specific** (named alternatives, segments, numbers — not "competitors"/"users"/"better"), **complete** (the real dimensions, not just the first), **reasoned** (the why and the trade-off), and **evidenced** (a proof or a named proof-gap). Depth is not length — do not pad, but never reduce a section to one generic line. Self-check each section before returning.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`strategic-thinking/03-strategy-development-process.md`](../product-marketing-os/references/library/strategic-thinking/core/03-strategy-development-process.md) — tie requirements to strategy
- [`strategic-thinking/04-strategic-decision-making.md`](../product-marketing-os/references/library/strategic-thinking/core/04-strategic-decision-making.md) — make scope decisions defensibly

