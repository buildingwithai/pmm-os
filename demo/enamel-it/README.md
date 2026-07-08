# Enamel IT — full growth run (demo, services edition)

A complete PMM OS **growth run** for the fictional example company *Enamel IT*
(managed IT + HIPAA compliance for dental practices, Dallas–Fort Worth). Where the
[Plotline demo](../plotline-launch/) shows a global SaaS launch, this one shows what
the OS produces for a **geo-bound B2B service**: county-scoped research, local events
and channels desks, Google-review VoC (the Reviews Desk), retainer pricing, and a
referral engine in place of PLG.

All companies, people, reviews, and numbers in this kit are fictional and
illustrative.

## What's here

- `kit-content.json` — the single source of truth (context, personas, positioning,
  messaging, competitive, reviews desk, pricing, growth plan, referral engine,
  narrative, campaign, coach review).
- `enamel-launch-kit.html` — the built interactive app. Open it in a browser.
- *(generated)* `generated-docs/*.md` + `deck.md` — markdown mirrors + a Marp deck.
  Regenerable; git-ignored.

## Rebuild

```
node ../../skills/pmm-launch-kit/scripts/build-kit.mjs .
```
