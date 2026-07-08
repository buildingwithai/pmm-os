# Provider Scope Guide

## Goal

Use the smallest useful organization permissions for setup. A setup token should
be powerful enough to create this project's resources, but not broader than
needed.

## GitHub

Use GitHub access only for repository setup.

Needed abilities:

- Create a repository in the selected owner or organization.
- Read repository metadata.
- Push the initial template code, if the user approves.
- Configure repository secrets only when the Vercel/GitHub workflow needs them.

Avoid:

- Full account access when organization-scoped access is available.
- Tokens that can delete repositories unless cleanup automation explicitly needs
  that and the user approves.

## Vercel

Use Vercel access only for project setup and deployment configuration.

Needed abilities:

- Create or link a project in the selected team.
- Read team/project metadata.
- Set project environment variables.
- Trigger or inspect deployments.

Avoid:

- Sharing one token across unrelated organizations.
- Storing Vercel organization tokens in `.env.local`.

## Convex

Use Convex access only to create or link this template's backend deployment.

Needed abilities:

- Create or select a Convex project.
- Create development and production deployments when supported.
- Read the generated deployment URL/name.

Avoid:

- Putting organization access tokens in app runtime env.
- Treating local development deployments as production.

## Clerk

Use Clerk access only to create and configure this app's auth boundary.

Needed abilities:

- Create or select a Clerk application.
- Configure allowed origins and redirect URLs.
- Read project-specific publishable and secret keys.

Avoid:

- Copying keys from another app.
- Enabling public production sign-in before redirect URLs and allowed origins are
  correct.

## Codex

Codex setup may not behave like a normal provider API. Prefer the secure setup
flow available in Codex or OpenAI tooling instead of inventing a fake token flow.

Needed abilities:

- Store user-approved workspace metadata.
- Document the workspace setup steps.
- Use official secure key setup flows when available.

Avoid:

- Claiming Codex project/workspace creation is automated unless a real supported
  API or tool is wired and verified.

## Agent Rule

If a token's required scope is unclear, stop at dry-run and ask the user to
confirm the provider and organization. Do not guess with a broader token.
