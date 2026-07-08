# User Signal Brief: SuperIsland Notch

Original raw request:
Bring in `shobhit99/SuperIsland.git`, investigate it with idkWidk, and use it as the island/notch for the product. The top notch should replace the current modal. Keep the right-side sub-agent/agent working pad alone for now.

User-level goal:
Create a top-of-screen island notch experience that can become the main command surface for Quick Ping/idkWidk-style actions, instead of using a modal.

What the user believes is happening:
There is already some overlay behavior, but it is not enough. The product needs a real top notch island.

Evidence from text:
- User explicitly linked `https://github.com/shobhit99/SuperIsland.git`.
- User wants both SuperIsland capabilities/extensions and the current modal capabilities included.
- User specifically says to focus only on the top screen notch for now.

Evidence from images or files:
No screenshots were attached.

Screenshots reviewed:
None.

Direct requests:
- Investigate and explore SuperIsland.
- Use idkWidk process.
- Bring in the repo as reference.
- Make the top notch replace the modal direction.
- Leave the right-side agent working pad alone.

Guesses and hypotheses:
- The local repo may not have an existing modal in the website app.
- SuperIsland is probably not directly reusable as a React dependency because it is a macOS Swift application.
- The right integration is likely a repo-native React notch inspired by SuperIsland's compact/expanded/module model.

Fears and constraints:
- Do not turn the UI into a card dashboard.
- Do not disturb the right-side agent pad.
- Do not blindly copy outside repo code that does not fit this stack.

Implicit requirements:
- Keep the UI as a command-center/app-shell.
- Use rows, dividers, tabs, badges, and inspector panels.
- Preserve current product capabilities while moving the primary command entry point into a top notch.
- Capture what was learned from SuperIsland.

Task classification:
Feature integration with external repo research.

Risk level:
Medium. It touches visible product UI and imports concepts from a different technology stack.

Likely product surface:
`apps/website/app/page.tsx` and `apps/website/app/globals.css`.

What is proven:
- This checkout is a Next.js website under `apps/website`.
- SuperIsland is a macOS Swift app with an extension system, compact island, expanded island, full expanded surface, built-in modules, and JavaScript extension examples.

What is suspected:
- There is no existing React modal in this checkout to remove.
- The safest first implementation is a product-level notch prototype in the website.

What is unknown:
- Which exact existing modal the user means in another product repo or future Quick Ping surface.
- Whether this notch should later become a shared package, Chrome extension UI, or app-level component.

Questions to avoid asking because the repo can answer them:
- What stack is this repo? The repo shows Next.js for the website.
- Is SuperIsland React? The cloned repo shows it is Swift/macOS.

One product-level question, only if needed:
None needed for the first pass.

Rewritten engineering prompt:
Goal:
Build a top-of-screen island notch in the Next.js website that demonstrates the future modal replacement pattern.

Context:
The user wants SuperIsland's notch behavior and extension model adapted for this product, not a card dashboard. SuperIsland is a Swift/macOS app, so copy the behavior model, not the source implementation.

Evidence:
SuperIsland uses compact, expanded, and full expanded island states. Its extension docs define compact and expanded render targets, background refresh, settings, network, storage, notifications, media, and actions.

Constraints:
Keep the right-side agent pad/inspector alone. Use an app-shell layout. Avoid cards and nested cards.

Risks:
Copying Swift code into React would be the wrong seam. Replacing a modal that does not exist in this checkout could create fake work.

What not to do:
Do not build a card dashboard. Do not touch the right-side inspector. Do not add a heavy dependency just to mimic a pill.

Investigation steps:
Clone SuperIsland into `.um/references/SuperIsland`, inspect README, extension docs, and island view files, then implement a repo-native React notch.

Done when:
The website shows a compact top notch that expands into a command surface with module rows and extension capabilities, while the existing app shell remains intact.

Verification required:
Run the website build. If feasible, start the dev server and inspect the page in a browser.

Next safest action:
Implement a client-side `CommandIsland` in the website and style it as a top notch using the existing app-shell layout.
