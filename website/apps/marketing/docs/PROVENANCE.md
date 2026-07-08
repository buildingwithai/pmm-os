# Marketing App Provenance

## Source

- Repo: `https://github.com/buildingwithai/usertour-website-template.git`
- Source commit inspected: `b9515b5`
- Local lab path: `.idkwidk/external-repos/buildingwithai__usertour-website-template`
- Adopted target path: `apps/marketing`

## License

The source package declares `MIT` in `package.json`.

The source `LICENSE` file is MIT and includes:

```text
Copyright (c) 2025 JCodesMore
```

Keep the license file in this app while source-derived files remain present.

## Runtime Evidence

Source checks run in the ignored lab clone:

```sh
npm install
npm run build
npm run lint
npm run typecheck
```

Source runtime evidence was captured with Chrome DevTools on:

```text
http://localhost:3240/
http://localhost:3240/blog
http://localhost:3240/blog/event-driven-user-onboarding
```

Screenshots and snapshots are stored under:

```text
.idkwidk/runtime-captures/usertour-website-integration/
```

## Integration Decision

The source was adopted as a separate `apps/marketing` app instead of replacing
`apps/website`. This keeps the existing website plumbing and old handoff routes
available while making the new marketing/blog/docs/pricing front end runnable as
its own SaaS public surface.
