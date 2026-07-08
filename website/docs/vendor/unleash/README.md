# Unleash Vendored Source

Source: https://github.com/Unleash/unleash

License: Apache-2.0

Local fork source used for this slice:

- `.external-repos/unleash`

Vendored/adapted files in this template:

- `apps/website/app/lib/vendor/unleash/feature-naming.ts`

What changed:

- The original Unleash naming-validation logic was adapted into a small framework-independent module.
- Unleash internal model imports were removed.
- The result types were narrowed to the native idkWidk feature-flag admin module.
- Storage is not Unleash/Postgres. Storage is the template's Convex boundary.
- Auth is not Unleash auth. Auth is the template's Clerk boundary.

What was not copied:

- Unleash server, migrations, workers, frontend app, strategy engine, enterprise logic, or database schema.

Why:

- This template needs a built-in feature flag admin surface, not a full second feature-flag server.
- Apache-2.0 allows adaptation with license preservation. The license copy is stored in this folder.
