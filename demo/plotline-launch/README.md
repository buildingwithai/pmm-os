# Plotline — full launch run (demo)

A complete PMM OS **launch run** for the fictional example company *Plotline*
(self-serve product analytics), grounded in
[`../../skills/product-marketing-os/references/examples/00-product-context.md`](../../skills/product-marketing-os/references/examples/00-product-context.md).

This is the canonical demonstration that **a full launch ends with an interactive
launch kit** — and the source for the live demo embedded on the marketing site
(`website/apps/marketing/public/launch-kit/index.html`).

## What's here

- `kit-content.json` — the single source of truth (the whole launch: context,
  positioning, messaging, competitive, pricing, GTM, PLG, narrative, campaign,
  coach review).
- `plotline-launch-kit.html` — the built interactive app (sidebar · main ·
  inspector, ⌘K palette, present mode). Open it in a browser.
- *(generated)* `generated-docs/*.md` + `deck.md` — markdown mirrors + a Marp
  deck. Regenerable; git-ignored.

## Rebuild

No copying needed — run the generator against this folder:

```
node ../../skills/pmm-launch-kit/scripts/build-kit.mjs .
```

Emits `plotline-launch-kit.html` (named from `meta.wordmark`), the markdown
mirrors, and `deck.md`. Edit `kit-content.json` and rerun to update everything.
