# User Signal Brief: Next.js Boilerplate Website

Original raw request:
Use `guillim/nextjs-boilerplate.git` so the website displays the idkWidk website and plugin. Clone it, set it up, figure out the new architecture, include the blog post and everything the repo offers, and make a button that gives people instructions for using the plugin in Codex. Also explain whether users download the plugin, whether it appears inside Codex, and whether it can be featured.

User-level goal:
Turn the current small idkWidk website into a fuller product website with install instructions, docs, blog content, and a clear future SaaS architecture inspired by the boilerplate.

What the user believes is happening:
The current website is too thin. The boilerplate may provide the fuller website structure needed for public plugin distribution.

Evidence from text:
- User linked `https://github.com/guillim/nextjs-boilerplate.git`.
- User asked for clone/setup/investigation.
- User wants blog/docs/install instructions and plugin distribution clarity.

Evidence from images or files:
No screenshots were attached.

Screenshots reviewed:
None.

Direct requests:
- Clone and inspect the GitHub repo.
- Apply the repo's website architecture.
- Create a website that displays the plugin.
- Add instructions for Codex installation.
- Explain default Codex discovery and featured-plugin status.

Guesses and hypotheses:
- The boilerplate has useful SaaS routes and product structure.
- Its Stripe/Auth/Prisma services should not be made mandatory unless needed because that would add setup friction.
- The plugin is currently installable by adding the GitHub marketplace source in Codex, not by appearing in the default curated list.

Fears and constraints:
- Do not break the working website build.
- Do not add unnecessary service dependencies.
- Keep the UI as an app/product command center, not a card dashboard.

Implicit requirements:
- Provide a button or clear call-to-action that exposes Codex install steps.
- Add docs and blog surfaces.
- Preserve the SuperIsland notch work already in the website.
- Keep a plain-English explanation for non-technical users.

Task classification:
Product website architecture and implementation.

Risk level:
Medium. It touches public website structure, install copy, and plugin distribution truth.

Likely product surface:
`apps/website/app/page.tsx`, `apps/website/app/globals.css`, new route files under `apps/website/app/docs` and `apps/website/app/blog`.

What is proven:
- `guillim/nextjs-boilerplate` was cloned locally at `.um/references/nextjs-boilerplate`.
- That repo includes landing, auth, billing, dashboard/account, analytics, Mailgun, Prisma, Stripe, and Tailwind.
- The boilerplate README marks Blog and Documentation as coming soon.
- This repo already has plugin install truth in `README.md` and `plugins/idk-widk/.codex-plugin/plugin.json`.

What is suspected:
- A light transplant of architecture is safer than importing the entire dependency stack today.

What is unknown:
- Whether OpenAI has a public application path for featured Codex plugins that applies to this plugin today.

Questions to avoid asking because the repo can answer them:
- What plugin version is current? It is `idkWidk v0.3.0 (uploaded)`.
- What GitHub source should users add? It is `https://github.com/buildingwithai/idkWidk.git`.

One product-level question, only if needed:
None needed for this pass.

Rewritten engineering prompt:
Goal:
Adapt the current idkWidk website into a fuller SaaS/plugin website inspired by `guillim/nextjs-boilerplate`.

Context:
The boilerplate offers landing, auth, billing, dashboard, analytics, database, email, and future docs/blog patterns. This repo needs a public plugin website first, not a full paid SaaS backend today.

Evidence:
Current install instructions are in `README.md`; plugin metadata is in `plugins/idk-widk/.codex-plugin/plugin.json`; existing website is a Next.js app under `apps/website`.

Constraints:
Keep the site buildable without Prisma, Stripe, auth, or Mailgun env setup. Keep the app-shell and no-card-soup direction. Preserve the top island notch.

Risks:
Importing the entire boilerplate dependency stack would create avoidable build and environment failures.

What not to do:
Do not claim the plugin appears in Codex's default curated list. Do not claim it can be featured without OpenAI acceptance. Do not make users think they need to download a zip manually.

Investigation steps:
Clone the boilerplate, inspect its README, app routes, dependencies, and landing structure. Apply useful route architecture and content without adding unnecessary service dependencies.

Done when:
The site has a product landing page, Codex install instructions, architecture/future modules, docs route, blog route, and clear distribution truth.

Verification required:
Run `npm run build`; run a local browser screenshot or DOM check for the new routes.

Next safest action:
Implement the website routes and verify the build.
