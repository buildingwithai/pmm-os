# UsertourHome Specification

## Overview
- Target file: `src/components/usertour-home.tsx`
- Screenshot: `docs/design-references/usertour.io/desktop-full.png`
- Mobile screenshot: `docs/design-references/usertour.io/mobile-full.png`
- Interaction model: broad static homepage clone with hover states and FAQ disclosures.

## Visual System
- Font: GeistSans from the source page extraction.
- Body background: black with blue/violet aurora gradients.
- Text: white headings, muted blue-gray body copy.
- Primary color: violet button `#5b4cf6`.
- Cards: dark glass surfaces with `rgb(255 255 255 / 10%)` borders and subtle gradients.
- Main radius values: 8px buttons, 18-24px cards and media frames.

## Sections
- Header: fixed top bar, logo from `public/images/usertour/02-logo-light.svg`, centered nav, CTA.
- Hero: large headline, eyebrow, CTA group, local product-tour screenshot.
- Testimonial: quote card with avatar.
- Features: four broad feature bands using extracted live text and downloaded product screenshots.
- Tech stack: six cards with the extracted labels/descriptions.
- FAQ: six extracted questions, implemented with native disclosure rows.
- CTA: bottom background image with overlay and trust badges.
- Footer: extracted product/platform/resources/company link groups.

## Assets
- Logos: `public/images/usertour/01-logo-dark.svg`, `public/images/usertour/02-logo-light.svg`
- Hero/product tour: `public/images/usertour/03-tour-05.jpg`
- Avatar: `public/images/usertour/04-avastar-05.png`
- Feature images: `05-builder-02.png`, `06-theme.png`, `07-analytics.png`, `08-rules.png`
- CTA background: `09-bottom-bg.jpg`
- SEO icons: `public/seo/usertour/`

## Responsive Behavior
- Desktop: full nav, large hero, two-column feature grids, three-column tech grid.
- Tablet/mobile: nav hidden, stacked content, wrapped CTA buttons, horizontal hero tabs.
- Breakpoint: clone stacks major grids at `900px`; compact hero/header refinements at `520px`.
