# idkWidk Template Provisioner

This plugin is a thin Codex wrapper around the template's normal setup scripts.
It does not store provider tokens and it does not hide provider mutations inside
plugin code.

Start with:

```bash
npm run setup:agent -- --profile personal --project <project-slug>
npm --silent run setup:agent -- --profile personal --project <project-slug> --json
npm run setup:factory -- --project <project-slug>
```

Plain English version: `setup:agent` is the safe control-center command for
agents and plugin-driven setup. It reads the existing setup state, chooses the
next safe action, and says whether the agent can continue alone or needs user
input. It does not create provider resources, call provider APIs, or print
secrets.

Plain English version: this is the new-project factory. It opens credential
setup, keeps reusable provider access in the local vault/keychain, and runs
read-only provider checks. It still does not create live provider resources
without the existing confirmation flags.

The lower-level front-door command is:

```bash
npm run setup:bootstrap -- --project <project-slug>
```

`setup:bootstrap` is the easy-to-remember alias for the same front-door flow:

```bash
npm run setup:project -- --project <project-slug>
```

That command is the single front door. It defaults to the `personal` profile,
explains where credentials live, runs the guided walkthrough, prints an audit
and status snapshot, and can optionally run credential setup, live guarded
setup, or release verification.

For a new computer or a new person installing the template, use:

```bash
npm run setup:onboard -- --project <project-slug>
```

That shortcut opens credential setup and then runs read-only provider checks.
It still does not create GitHub, Vercel, Convex, or Clerk resources without the
existing confirmation flags.

For a brand-new clone that needs dependencies installed:

```bash
npm run setup:project -- --project <project-slug> --install --confirm-install
```

The lower-level start command is:

```bash
npm run setup:start -- --profile personal --project <project-slug>
```

For the lowest-lift guided path, use:

```bash
npm run setup:walkthrough -- --profile personal --project <project-slug>
```

On a new computer, or before reusable provider tokens are stored, run:

```bash
npm run setup:credentials -- --profile personal --project <project-slug>
```

To verify the stored provider access immediately after setup:

```bash
npm run setup:credentials -- --profile personal --project <project-slug> --verify
```

After provider credentials are stored locally:

```bash
npm run setup:bootstrap -- --profile personal --project <project-slug> --check-access
npm run setup:walkthrough -- --profile personal --project <project-slug> --check-access
```

To see the next exact setup action without rereading the full guide:

```bash
npm run setup:next -- --profile personal --project <project-slug>
```

To give another agent or plugin a safe, machine-readable setup snapshot:

```bash
npm run setup:status -- --profile personal --project <project-slug>
npm --silent run setup:status -- --profile personal --project <project-slug> --json
```

To give another agent or plugin the safe provider setup ladder:

```bash
npm run setup:plan -- --profile personal --project <project-slug> --dry-run
npm --silent run setup:plan -- --profile personal --project <project-slug> --dry-run --json
```

To check the local machine, CLIs, keychain, and ignore rules before live
provider work:

```bash
npm run setup:doctor -- --profile personal
npm --silent run setup:doctor -- --profile personal --json
```

To explain what is cloned, what stays in the OS keychain, and what another user
must set up on their own computer:

```bash
npm run setup:locations
```

To print the requirement-level completion audit:

```bash
npm run setup:audit -- --profile personal --project <project-slug>
```

To print the implementation-plan completion checklist for humans or agents:

```bash
npm run setup:completion -- --profile personal --project <project-slug>
npm --silent run setup:completion -- --profile personal --project <project-slug> --json
```

When the remaining work is Clerk production auth and Vercel production env
sync, use:

```bash
npm run setup:production -- --profile personal --project <project-slug>
npm --silent run setup:production -- --profile personal --project <project-slug> --json
```

The guide prints the next safe command. Live provider creation still requires
explicit confirmation flags.

If the human wants Codex to offer live setup steps one at a time, run:

```bash
npm run setup:walkthrough -- --profile personal --project <project-slug> --live
```

The walkthrough still asks before each provider mutation and uses the existing
guarded `vault:*` commands.

For Clerk development keys, do not paste keys into chat. After Clerk CLI login
and app selection, use:

```bash
npm run vault:metadata -- --profile personal --provider clerk --key applicationId --value <app-id>
npm run vault:clerk -- --profile personal --project <project-slug> --pull-dev-env --confirm-dev-env
```

For Clerk production, the plugin uses the official interactive CLI because a
real domain and DNS records are required:

```bash
npm run setup:production -- --profile personal --project <project-slug>
npm --silent run setup:production -- --profile personal --project <project-slug> --json
npm run setup:production -- --profile personal --project <project-slug> --domain <your-production-domain>
npm run setup:production -- --profile personal --project <project-slug> --deploy-prod --confirm-prod-deploy
```

Before publishing or handing the template to another user, run:

```bash
npm run setup:vault-metadata:verify
npm run setup:plugin:verify
npm run setup:plugin-discovery:verify
npm run setup:plugin:package -- --check
npm run setup:fresh-clone:verify
npm run setup:release:verify -- --profile personal --project <project-slug>
```

That command clones the committed repo into a temporary folder and checks that
the setup guide still works without the original user's local profile.

If setup fails or a provider looks confusing, use:

```text
docs/idkwidk/usertour-website-integration/PROVISIONING_TROUBLESHOOTING.md
```
