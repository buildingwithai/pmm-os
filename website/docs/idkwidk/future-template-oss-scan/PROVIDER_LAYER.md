# Provider Layer Implementation

Date: 2026-05-20

## Goal
Create a thin provider layer for the future template so optional lifecycle tools can be turned on without making them required dependencies.

## Rule
The template owns small interfaces and setup instructions. External products own their own databases, workers, dashboards, and deployment.

## Provider Categories

| Category | Default shape | Providers |
| --- | --- | --- |
| Analytics | Optional service | None, Plausible, OpenPanel, Rybbit |
| Feature flags | Optional service | Unleash |
| Feedback | Optional service | Formbricks |
| Support | Optional service | Chatwoot |
| CRM | Optional service | Twenty |
| Scheduling | Adapter | Cal.com |
| Attribution | Adapter | Dub |
| Observability | Optional service | Highlight, OpenReplay |
| Deployment | Recipe | Vercel, Dokploy |

## Environment Keys

```bash
NEXT_PUBLIC_ANALYTICS_PROVIDER=none
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
NEXT_PUBLIC_OPENPANEL_CLIENT_ID=
NEXT_PUBLIC_RYBBIT_ENDPOINT=

FEATURE_FLAGS_PROVIDER=off
UNLEASH_URL=
UNLEASH_CLIENT_KEY=

FEEDBACK_PROVIDER=off
NEXT_PUBLIC_FORMBRICKS_ENVIRONMENT_ID=

SUPPORT_PROVIDER=off
NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=

CRM_PROVIDER=off
TWENTY_API_URL=
TWENTY_API_KEY=

SCHEDULING_PROVIDER=off
NEXT_PUBLIC_CAL_LINK=

ATTRIBUTION_PROVIDER=off
DUB_API_KEY=
DUB_WORKSPACE_ID=

OBSERVABILITY_PROVIDER=off
NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID=
NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY=

DEPLOYMENT_TARGET=vercel
```

## Implementation Boundary
- Add provider metadata to app code so the template can show what is available.
- Add runtime adapters only when a product route actually needs the provider.
- Do not import SDKs until the feature needs them.
- Do not copy AGPL/custom licensed service code into the core app.
- Keep all optional services replaceable through environment variables.

## Health Check Behavior
- `off`: the provider is intentionally disabled.
- `configured`: every required environment key exists on the server.
- `missing`: one or more required environment keys are missing.

The health check only sends status and key names to the browser. It does not send secret values.

## Adapter Interfaces Added

The first callable adapters live in `apps/website/app/lib/adapters/`.

| Adapter | File | Providers | Current behavior |
| --- | --- | --- | --- |
| Feature flags | `feature-flags.ts` | off, Unleash | Returns template defaults through one `isEnabled` function. |
| Scheduling | `scheduling.ts` | off, Cal.com | Builds a booking URL when `NEXT_PUBLIC_CAL_LINK` exists. |
| Attribution | `attribution.ts` | off, Dub | Returns the original URL or adds UTM parameters for Dub mode. |
| Feedback | `feedback.ts` | off, Formbricks | Describes and queues survey prompt events without importing a survey SDK. |
| Support | `support.ts` | off, Chatwoot | Creates a safe chat identity boundary without loading the widget directly. |
| CRM | `crm.ts` | off, Twenty | Normalizes lead data before any CRM sync API is installed. |

These are intentionally no-SDK adapters. Real SDK/API calls should be added behind these interfaces only when a product route needs them.

## Next Implementation Slices
1. Add dashboard route stubs for plan portal and provider toggle actions.
2. Add real SDK/API implementations only after a product route needs them.
3. Add provider-specific smoke tests once SDK-backed routes exist.

## Provider-Specific Recipes Added

The dynamic provider route now has deeper recipes for:

- Formbricks: feedback surveys and in-product research.
- Chatwoot: support chat and shared inbox handoff.
- Twenty: CRM sync target for customers, companies, and leads.
- Cal.com: booking links for demos, onboarding, and customer success.
- Dub: campaign and referral attribution links.

These recipes explain product use, installation boundaries, environment examples, setup steps, verification checks, and owner notes.
