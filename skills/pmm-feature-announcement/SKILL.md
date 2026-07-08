---
name: pmm-feature-announcement
description: When the user wants to announce a feature, turn release notes into customer-facing copy, write launch emails, changelog entries, social posts, in-product messages, blog posts, or a multi-channel product announcement. Produces a narrative package that explains what customers can do now that they could not do before.
---

# PMM Feature Announcement

Release notes describe what changed. Feature announcements explain why anyone should care.

## Inputs

- Product spec or release notes
- Who benefits
- What they can do now
- Before state
- After state
- Announcement tier
- Channels
- Proof or early signal

## Workflow

1. Extract what matters
   - Capability
   - Before state
   - After state
   - Trigger moment
   - Magnitude

2. Classify announcement tier
   - Tier 1: marquee announcement
   - Tier 2: significant feature
   - Tier 3: incremental update

3. Find the narrative angle
   - The moment
   - The before/after
   - The unlock

4. Produce assets
   - Blog or changelog
   - Customer email
   - Social posts
   - In-product message
   - Sales or CS note
   - Optional image prompts

## Output

Produce every section as **finished copy**, not a header with a sentence under
it. Apply the PMM OS depth standard (see `../product-marketing-os/references/output-depth-standard.md` (and `pmm-content-writer` for word budgets)): each channel
hits its budget, and the blog/changelog is real writing, not a stub.

### Depth budget per section

| Section | Budget |
| --- | --- |
| Story extraction | the actual before/after + trigger + magnitude, in specifics — a named user type, the action they took, a number if you have one |
| Blog or changelog copy | **700–1,200 words, 3–5 H2s, ≥1 concrete example, a clear CTA** — run it through the `pmm-content-writer` rubric. A pure changelog entry can be 150–300w but must still say what's now *possible*. |
| Email copy | 120–220 words, one job, one CTA, plus a subject line and preview text |
| Social copy | 2–3 platform-specific posts, each one idea with a hook — not the same post reformatted |
| In-product copy | tight: headline ≤8 words, body ≤2 sentences, one action |
| Sales/CS internal note | the talk track, the one-line "what to say", and one likely objection + rebuttal |

Tier scales depth: a Tier 1 marquee blog targets the top of the range and adds
proof; a Tier 3 update can sit at the bottom. Never below the floor.

```markdown
# Feature Announcement Package

## Story extraction

## Tier and rationale

## Narrative angle

## Channel map

## Blog or changelog copy

## Email copy

## Social copy

## In-product copy

## Sales/CS internal note

## Image generation briefs

## Approval checklist
```

### Before you return (self-check)

- [ ] The blog/changelog section meets its word budget and passes the depth rubric — it is **not** an outline.
- [ ] Every channel's copy is finished and channel-specific; no single paragraph is reused across channels.
- [ ] Story extraction names a real before, after, and trigger — not "users wanted this".
- [ ] Each asset passes the "so what?" test for its target reader.

## Anti-patterns

- Returning section headers with a sentence under them instead of finished copy.
- Letting the blog section come out as a 250-word stub.
- Starting with "we are excited".
- Leading with internal architecture.
- Saying the feature is for everyone.
- Shipping the same copy to every channel.
- Missing the before and after.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`pmm-artifact-factory`](../pmm-artifact-factory/SKILL.md) — produce the multi-channel assets
- [`pmm-launch-kit`](../pmm-launch-kit/SKILL.md) — package it into a launch kit
- [`post-launch-learning-loop`](../post-launch-learning-loop/SKILL.md) — measure adoption
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`product-launch/01-launch-tier-framework.md`](../product-marketing-os/references/library/product-launch/references/core/01-launch-tier-framework.md) — tier scales the announcement depth
- [`product-launch/05-multi-channel-tactics.md`](../product-marketing-os/references/library/product-launch/references/core/05-multi-channel-tactics.md) — per-channel announcement tactics

