# PMM OS — Skill Authoring Standard

Every PMM OS skill follows this so the whole plugin reads as **one product**, not
40 prompts glued together. When you add or edit a skill, match this.

## Voice

- **Operator second person.** Address the model that will run the skill: "You
  turn X into Y." Not "Use this when the user wants…" (that belongs in the
  `description`), not "This skill helps users…" (third person).
- **One opening line** under the H1: what you produce + the bar. Make it specific
  and a little opinionated — e.g. "Release notes describe what changed; you
  explain why anyone should care." A flat restatement of the title is wasted.
- **Plain language over jargon.** Name the framework, then use it; don't hide
  behind it. Short sentences. No "leverage synergies."

## Frontmatter

```yaml
---
name: <kebab-case, matches folder>
description: <what it produces + when to use it — this is the trigger, write it for matching>
---
```

The `description` is the routing signal. Lead with the user-facing triggers
("When the user wants …"), then what it produces. Acronyms spelled where helpful.

## Canonical section order

Use these headings, in this order. Omit a section if it truly doesn't apply;
don't invent synonyms for one that does.

1. `# Title Case Name` — acronyms uppercased (PMM, GTM, OSP, PLG, ICP, VOC).
2. **(opening line)** — operator voice, one or two sentences.
3. `## When to use` *(optional)* — only if it adds triggers beyond the description.
4. `## Inputs` *(optional)* — what you need before starting; what to ask for if missing.
5. `## Workflow` — numbered steps. (Not "Process".)
6. `## Output` — the concrete deliverable: the file/artifact and its sections.
7. `## Quality bar` — the self-check / definition of done. Name the failure mode.
8. `## Hand off to` — the next skills in the chain (see below).
9. `## Frameworks & deep references` — the library slice this skill applies.
10. `## Depth` — the pointer to the output-depth standard.

## The chain (`## Hand off to`)

PMM OS is a chain, not a menu. Every skill names what comes next so a request
doesn't dead-end at advice:

> context → research (VoC, personas, ICP) → positioning → messaging →
> pricing / launch / GTM → artifacts → **PMM Coach review** → measurement → iteration

Each `## Hand off to` lists 2–4 downstream skills with *why*, and ends with the
universal review step: hand customer- or exec-facing work to `pmm-coach` before
it ships.

## House rules for output

- **Ground in context.** Read `pmm-product-context` / `.agents/product-marketing.md`
  first; never invent product facts.
- **Make an artifact.** Produce the named file/deliverable, not a chat answer.
- **Apply the depth standard.** Specific, complete, reasoned, evidenced; depth ≠ length.
- **Name proof gaps.** If a claim has no evidence, say what evidence is needed.
- **Hand off.** End by pointing to the next step.
