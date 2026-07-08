# idkWidk Marketing App

This is the Usertour-style marketing website for the idkWidk SaaS template. It includes the home page, feature page, blog listing, individual blog pages, pricing, docs, support, and footer legal routes.

The dashboard/backend app lives separately in `apps/dashboard`. Run both apps when you want to see the public front end and SaaS dashboard together.

## Routes

- `/` - home page with hero, product sections, feature cards, FAQ, and CTA
- `/features` - deeper feature overview
- `/blog` - blog home page
- `/blog/[slug]` - individual article layout
- `/pricing` - pricing cards and comparison table
- `/docs` - documentation shell
- `/support` - support destination
- `/about`, `/privacy`, `/terms`, `/license` - footer destinations

## Local Setup

```bash
npm install
npm run dev -- --port 3020
```

Open `http://127.0.0.1:3020/` in the browser.

## Checks

```bash
npm run build
npm run lint
npm run typecheck
```

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Lucide React icons

## Notes

This project started from an AI website cloning workflow and was then cleaned into its own private Usertour website template repository. The current code is meant to be a working template and visual reference, not the original Usertour production source code.

See `docs/PROVENANCE.md` for the source repo, commit, and license evidence used when adopting this app into the idkWidk template.
