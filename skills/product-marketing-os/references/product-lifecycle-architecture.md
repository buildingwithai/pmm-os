# Product Lifecycle Architecture Adapter

## Source

Adapted from `kelegele/oh-my-pm`.

The useful pattern is a five-layer product management workflow: Perception, Strategy, Design, Delivery, and Validation. It also contributes subagent-style research delegation, human-AI collaboration modes, quality gates, scenario-driven PRDs, HTML prototypes, and impact analysis.

## Integration into PMM OS

Use `product-lifecycle-os` when the user asks for product planning, not only marketing. This includes roadmap, PRD, product strategy, prototype, release planning, and post-launch validation.

## Five-layer loop

```text
Perception: market, customer, competitor, data, requirement gaps
Strategy: positioning, roadmap, prioritization, tradeoffs
Design: PRD, user stories, acceptance criteria, prototype
Delivery: requirement review, project plan, release readiness, GTM handoff
Validation: impact analysis, feedback synthesis, iteration plan
```

## Cohesion with PMM

PMM OS should not split product work and PMM work. It should translate each product layer into a PMM artifact when needed.

| Product layer | PMM/GTM counterpart |
|---|---|
| Perception | Customer research, competitive intelligence, ICP, segmentation |
| Strategy | Positioning, messaging, pricing, GTM narrative |
| Design | PRD implications, feature announcement, launch tier |
| Delivery | Launch brief, campaign brief, enablement, rollout checklist |
| Validation | Post-launch readout, PMM coach review, iteration plan |

## Quality gates

1. Perception to Strategy: target user, problem, alternatives, and market context exist.
2. Strategy to Design: positioning, priority, and success criteria exist.
3. Design to Delivery: PRD has scope, user stories, acceptance criteria, and metrics.
4. Delivery to Validation: release plan, owners, risks, and instrumentation exist.
5. Validation to Iteration: results are compared to baseline and target.
