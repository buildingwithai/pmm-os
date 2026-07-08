# Usertour Behavior Notes

Target: https://www.usertour.io/

## Browser Capture
- Browser: Microsoft Edge headless through Chrome DevTools Protocol.
- Desktop reference: `docs/design-references/usertour.io/desktop-full.png`
- Mobile reference: `docs/design-references/usertour.io/mobile-full.png`
- Raw extraction: `docs/research/usertour.io/extraction.json`

## Global Behavior
- Header is fixed at the top with transparent-to-dark treatment over the black hero.
- Main page uses a black background with blue/violet aurora gradients and glass-like UI surfaces.
- Primary interactions are standard link/button hover states, FAQ disclosure rows, and responsive layout changes.
- No required backend behavior was cloned. External actions remain visual links in the static clone.

## Responsive Behavior
- Desktop: centered max-width shell, horizontal navigation, two-column feature sections, three-column tech grid.
- Tablet: navigation is hidden; feature, testimonial, tech, and footer grids stack.
- Mobile: hero type reduces, buttons wrap, product tabs scroll horizontally, footer columns stack.

## Known Clone Choice
- The request asked for a broad clone, not a section-by-section slow pass. The implementation captures the visible content, visual system, assets, and page flow, while avoiding exact recreation of every hidden dropdown or production script.
