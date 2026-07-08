# idkWidk Template And Codex Plugin Starter

This repo contains the idkWidk Codex plugin, the SaaS template provisioning
plugin, and a repo-local marketplace file.

## Start Here

For this SaaS template, the first command is:

```bash
npm run setup:factory -- --project <project-slug>
```

Plain English version: this is the new-project factory. It opens the local
credential setup path, stores reusable provider access outside the repo, and
runs read-only provider checks. It still does not create live GitHub, Vercel,
Convex, Clerk, or Codex resources without the existing explicit confirmation
flags.

For agents and plugin-driven setup, the safest control-center command is:

```bash
npm run setup:agent -- --profile personal --project <project-slug>
npm --silent run setup:agent -- --profile personal --project <project-slug> --json
```

Plain English version: this reads the existing setup state, chooses the next
safe action, and tells the agent whether it can continue alone or needs the
user to enter something like a provider token or production domain. It does not
create provider resources, call provider APIs, or print secrets.

The lower-level front-door command is:

```bash
npm run setup:bootstrap -- --project <project-slug>
```

`setup:bootstrap` is an easy-to-remember alias for the template front door. The
same flow is also available as:

```bash
npm run setup:project -- --project <project-slug>
```

That is the lowest-lift front door. It defaults to the `personal` profile and
routes a person or agent into credential setup, read-only checks, live guarded
setup, audit, status, and release verification.

For a new computer or a new person installing the template, use the onboarding
shortcut:

```bash
npm run setup:onboard -- --project <project-slug>
```

Plain English version: this opens the credential wizard first, stores reusable
provider access in the local vault/keychain, then runs read-only provider checks.
It still does not create live provider resources without the existing explicit
confirmation flags.

If this is a brand-new clone and dependencies are missing, run:

```bash
npm run setup:project -- --project <project-slug> --install --confirm-install
```

The lower-level start command is:

```bash
npm run setup:start -- --profile personal --project <project-slug>
```

The lowest-lift guided path is:

```bash
npm run setup:walkthrough -- --profile personal --project <project-slug>
```

Plain English version: this checks whether this computer already has the safe
local provider setup. It does not create GitHub, Vercel, Convex, Clerk, or Codex
resources. It does not print secrets. It tells a person or agent the next safe
command.

On a new computer, or if the guide says credentials are missing, run:

```bash
npm run setup:credentials -- --profile personal --project <project-slug>
```

To store credentials and immediately run read-only provider checks:

```bash
npm run setup:credentials -- --profile personal --project <project-slug> --verify
```

To see the provider token checklist without exposing secret values:

```bash
npm run setup:tokens -- --profile personal
npm --silent run setup:tokens -- --profile personal --json
```

After credentials are stored locally, run read-only provider checks:

```bash
npm run setup:bootstrap -- --profile personal --project <project-slug> --check-access
npm run setup:walkthrough -- --profile personal --project <project-slug> --check-access
```

When you want the next exact action without rereading the full setup output,
run:

```bash
npm run setup:next -- --profile personal --project <project-slug>
npm --silent run setup:next -- --profile personal --project <project-slug> --json
```

When an agent or plugin needs a safe setup snapshot it can read without
scraping console text, run:

```bash
npm run setup:status -- --profile personal --project <project-slug>
npm --silent run setup:status -- --profile personal --project <project-slug> --json
```

When an agent or plugin needs one combined snapshot with local machine health,
provider status, the setup plan, and the production checklist command, run:

```bash
npm run setup:snapshot -- --profile personal --project <project-slug>
npm --silent run setup:snapshot -- --profile personal --project <project-slug> --json
```

When an agent or plugin needs the ordered provider setup ladder, run:

```bash
npm run setup:plan -- --profile personal --project <project-slug> --dry-run
npm --silent run setup:plan -- --profile personal --project <project-slug> --dry-run --json
```

To check the local machine, CLIs, keychain, and ignore rules before doing live
provider work:

```bash
npm run setup:doctor -- --profile personal
npm --silent run setup:doctor -- --profile personal --json
```

To see what is stored in the repo vs on this computer:

```bash
npm run setup:locations
```

To see the current requirement-level completion report:

```bash
npm run setup:audit -- --profile personal --project <project-slug>
```

To see the implementation-plan completion checklist, including what is done,
blocked, and still guided:

```bash
npm run setup:completion -- --profile personal --project <project-slug>
npm --silent run setup:completion -- --profile personal --project <project-slug> --json
```

Before handing the local setup plugin to another user or a future marketplace
flow, run the metadata and non-publishing package checks:

```bash
npm run setup:vault-metadata:verify
npm run setup:plugin:package -- --check
```

When the only thing left is production auth and deployment protection, use:

```bash
npm run setup:production -- --profile personal --project <project-slug>
npm --silent run setup:production -- --profile personal --project <project-slug> --json
```

If you already know the production domain you own and can manage DNS for, store
it through the helper:

```bash
npm run setup:production -- --profile personal --project <project-slug> --domain <your-production-domain>
```

Organization tokens stay in the OS keychain. Project env files and provisioning
state stay local and gitignored.

If setup does not look right, use:

```text
docs/idkwidk/usertour-website-integration/PROVISIONING_TROUBLESHOOTING.md
```

## Codex marketplace path

```text
.agents/plugins/marketplace.json
```

## Plugin path

```text
plugins/idk-widk
plugins/idkwidk-template-provisioner
```

## Version

The plugin manifest is at `0.6.2`. This package uses Chrome DevTools MCP connected to Chrome for Testing at `http://127.0.0.1:9222`, treats regular Chrome as the user's personal browser, treats Chrome for Testing as the agent/debug browser, loads only the project dev extension, and keeps the idkWidk routing gate so agents choose the right workflow before acting.
