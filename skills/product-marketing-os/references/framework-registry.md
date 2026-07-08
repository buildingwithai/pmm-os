# Framework Registry — the deliverable contract

The content-side twin of the launch kit's block contract: **the definitive catalog of PMM
frameworks this plugin produces deliverables from — and the only set.** If an artifact isn't
composed from a registry framework, it doesn't ship. The AI generates to these, the desks hydrate
them, and every one renders per the [deliverable standard](deliverable-standard.md) — as a
**one-pager** + a **working doc**.

Corpus grounded in a 4-stream research sweep (consulting standards · canonical frameworks · our
audit · in-the-wild one-pager formats): [`docs/research/pmm-quality-research.json`](../../../docs/research/pmm-quality-research.json).

## Anatomy of a registry entry

Every framework declares:
1. **When to use** — the routing trigger.
2. **Inputs** — which research desks hydrate it (the hard gate: no desk evidence ⇒ no deliverable).
3. **Template** — the framework's real sections/steps (not a paraphrase).
4. **One-pager format** — sections + length rule + what makes it get used (§ formats below).
5. **Rubric** — scored per the [deliverable scorecard](deliverable-standard.md#4-the-deliverable-scorecard-03-per-row-shippable--2433-no-row-below-2).
6. **Gold example** — a worked instance (the Plotline universe, `demo/plotline-launch/`), so generation targets a standard, not the mean.

Status: ✓ shipped (full template) · ◐ thin (present, needs assets) · ✕ missing (build).

---

## The catalog (60 frameworks · 10 disciplines)

### Positioning
| Framework | Status | Where / gap |
|---|---|---|
| April Dunford 10-step process | ✓ | positioning-canvas-template + worked example |
| Positioning statement formats (Moore, Onlyness) | ✓ | pmm-positioning-exercise |
| Ries & Trout principles | ✓ | library |
| Category design (Play Bigger) | ✓ | advanced chapters |

### Messaging
| Framework | Status | Where / gap |
|---|---|---|
| Message house | ✓ | core/04 + example — **template library dir ships empty (fill)** |
| Messaging hierarchy | ✓ | pmm-messaging-hierarchy |
| Value proposition canvas | ◐ | referenced; no worksheet asset |
| Benefit ladder / FAB laddering | ✓ | storytelling-frameworks.md |
| Voice & tone framework | ◐ | no template |
| Strategic narrative (Promised Land) | ✓ | advanced + narrative views |
| StoryBrand SB7 | ✓ | storytelling-frameworks.md (483 lines) |

### Personas & ICP
| Framework | Status | Where / gap |
|---|---|---|
| JTBD | ◐ | used everywhere, **no dedicated framework file** (forces/timeline, job stories) |
| Five Rings of Buying Insight | ✓ | personas library |
| B2B buyer persona template | ✓ | 7 templates incl. 30-min interview script |
| ICP (fit, anti-ICP, tiers, signals) | ✓ | icp-analysis-worksheet |

### GTM
| Framework | Status | Where / gap |
|---|---|---|
| GTM motion taxonomy | ✓ | plg-gtm-strategy selector |
| PLG framework (AHA/TTV, PQL/PQA) | ✓ | plg-readiness-template |
| Land & expand | ✓ | gtm library |
| Crossing the Chasm / adoption lifecycle | ✓ | library |
| Bowtie model | ◐ | mention only |
| Growth loops | ✓ | growth-loop designer |

### Launch
| Framework | Status | Where / gap |
|---|---|---|
| Launch tiers (T1–T3) | ✓ | launch-tier-assessment — **unadapted source refs (clean)** |
| Launch plan (canonical 11 sections) | ✓ | research-presentation-standard §4 |
| Launch runbook / T-minus checklist | ✓ | gtm library + kit checklist |
| Amazon PR/FAQ (Working Backwards) | ◐ | mention; no template |
| Post-launch learning loop | ✓ | post-launch-readout-template |

### Pricing
| Framework | Status | Where / gap |
|---|---|---|
| Van Westendorp PSM | ✓ | 375-line ready script |
| Gabor-Granger | ✕ | build (companion to PSM) |
| Choice-based conjoint | ✓ | core/02 |
| Value metric framework | ✓ | pricing library (complete: 12 core + 8 advanced + 10 templates) |
| Good-better-best packaging | ✓ | pricing library |
| SaaS pricing model taxonomy | ✓ | pricing library |

### Competitive
| Framework | Status | Where / gap |
|---|---|---|
| Sales battlecard | ✓ | battlecard-full-template + example |
| Win/loss program | ◐ | 706-line chapter + 328-line guide — **no skill routes to it** |
| Comparison matrix / us-vs-them pages | ✓ | pmm-competitive-landing-page |
| CI program structure & tiering | ✓ | CI library |
| ARR objection handling (Address-Reframe-Redirect) | ✓ | battlecard talk tracks |

### Content
| Framework | Status | Where / gap |
|---|---|---|
| Pillar-cluster / topic clusters | ✕ | **build — content strategy routed externally today** |
| Funnel content mapping (TOFU/MOFU/BOFU) | ◐ | mentions; no map template |
| Editorial calendar & content ops | ✕ | build |
| They Ask, You Answer / Big 5 | ✕ | build (feeds content examples) |
| AEO/GEO | ◐ | pmm-aeo-geo — no query-set/audit templates |

### Sales enablement (the deep set)
| Framework | Status | Where / gap |
|---|---|---|
| **VARS objection handling (Validate → Acknowledge → Reframe → Specify)** | ✕ | **P0 build — the house objection framework** |
| LAER / LAARC | ✕ | build alongside VARS |
| MEDDIC / MEDDPICC | ✓ | 1,010-line sales-methodologies chapter |
| Challenger + commercial teaching choreography | ✓ | same chapter |
| Command of the Message | ◐ | named; no value-framework template |
| Sandler + pain funnel | ✓ | same chapter |
| SPIN | ✓ | same chapter |
| BANT + variants | ✓ | same chapter |
| Gap Selling | ◐ | brief |
| Tell-Show-Tell demo narrative | ✕ | build (feeds pmm-sales-narrative) |
| Talk track template | ◐ | battlecard-embedded only; make standalone |
| Miller Heiman Blue Sheet | ◐ | brief |
| Sales Pitch Framework (Dunford) | ◐ | positioning-adjacent; no pitch template |
| *(program)* enablement charter/ROI/structure | ✓ | core chapters — **but no `sales-enablement` SKILL exists while other skills route to it (P0 bug)** |

### Research & synthesis
| Framework | Status | Where / gap |
|---|---|---|
| VoC synthesis | ◐ | skill exists; no theme-coding worksheet |
| JTBD switch/timeline interview | ✕ | build with the JTBD file |
| Minto Pyramid + SCQA | ✓ | research-presentation + deliverable standards |
| Affinity mapping (KJ) | ✕ | build (VoC companion) |
| Kano model | ✕ | build (P2) |

**Also missing from the corpus scan (P2 backlog):** STP/segmentation, PESO + PR/comms kit, analyst
relations program, ABM tiers (1:1/1:few/1:many), customer advocacy/reference program,
partner/channel marketing, community-led growth.

---

## One-pager formats (field-researched; bind to entries above)

Each format's full sections live in the research JSON; the length + use rules:

| Artifact | Length rule | What makes it used |
|---|---|---|
| Positioning one-pager (canvas) | 1 pg, 2-col canvas; 2–3 value themes w/ proof | Traceability alternative→attribute→theme; visible review date |
| Messaging house | 1 pg drawn as a house; roof ≤15 words; 3 pillars × 3–4 proofs | Proof under every pillar; customer-pain language; consistency test |
| Persona card | 1 pg each; 2–4 personas max; 80% buying insight | Behavioral fields that change copy; objections from real calls |
| ICP one-pager | 1 pg; 8–15 criteria with hard values | The anti-ICP/disqualifier section; closed-won evidence |
| Battlecard | 1 screen, no scroll; 90-second read | "We win when / we lose when" up top; sayable language |
| Launch-at-a-glance | 1 pg; owners + dates on every line | Evidence-based reasons ("lost 3 deals in 60 days"), not vibes |
| GTM strategy-on-a-page | 1 printable pg | Falsifiable commitments: one channel, one offer, numeric targets |
| Pricing one-pager | 1 pg tier grid + guardrails | Named approvers + give-gets, not "use judgment" |
| Campaign brief | 1 pg (2 max) | Problem-first; ONE message ≤15 words |
| Sales play / talk track card | 1 pg; findable in 10 s | Word-for-word sayable scripts + real call proof |
| Content strategy one-pager | 1 pg; 3–4 pillars max | Each content type has one job + one pipeline KPI |
| Win/loss readout | 10–15 slides + 1 pg/theme | Quantified frequency ("32% of losses, up from 18%") + verbatims |

---

## Where deliverables live in the workspace

The kit gains a **Deliverables zone** (sidebar: Overview · GTM readout · RESEARCH · STRATEGY ·
**DELIVERABLES**): each artifact = its one-pager view + a linked working doc, claims `@`-linked to
findings (backlinks close the claim → finding → source loop). `report-to-kit.mjs` hydrates them
from `report.json` + the ghost outline; exports emit docx/pdf per artifact.

## Build priorities

- **P0** — VARS + LAER (the house objection set) · create the missing `sales-enablement` skill
  (routed-to today, doesn't exist) · fill the empty messaging template library · the one-pager
  render layer + Deliverables zone.
- **P1** — JTBD framework file (+ switch interview) · route win/loss's existing depth through a
  skill · content-pillars/topic-cluster + Big-5 content strategy (with example content) ·
  Tell-Show-Tell + talk-track standalone templates · ghost-outline + scorecard gates (pmm-coach).
- **P2** — the corpus backlog: STP, PESO/PR kit, analyst relations, ABM, advocacy, partner,
  community-led, Kano, Gabor-Granger, affinity mapping.
