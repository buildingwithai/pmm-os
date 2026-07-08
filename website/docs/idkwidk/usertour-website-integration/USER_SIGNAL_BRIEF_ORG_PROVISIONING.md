# User Signal Brief: Organization Provisioning

## User-Level Goal

The user wants the SaaS template to support a zero-to-one setup flow where a
trusted local agent can use organization-level credentials to create
project-specific resources for each new clone.

## What The User Believes Is Happening

- A user may have organization-level API tokens for providers like GitHub,
  Vercel, Convex, Clerk, and Codex.
- Those tokens should not be copied into the template.
- Tokens should survive across clones so setup only happens once per machine or
  workspace.
- The template should create project-specific provider resources from those
  saved organization credentials.

## Direct Requests

- Provide a safe place for organization keys.
- Make keys reusable across cloned templates.
- Make sure other users do not inherit the original user's secrets.
- Prepare for GitHub, Vercel, Convex, Clerk, and Codex-style setup.
- Let an agent take setup from zero to one.

## Fears And Constraints

- Do not leak personal or organization credentials.
- Do not duplicate secrets into the template.
- Do not require entering the same keys for every clone.
- Do not confuse organization-level tokens with project-specific env keys.

## Rewritten Engineering Prompt

Build a credential-safe provisioning foundation for the template. Store reusable
organization-level credentials outside the repo, keep clone-specific env files
gitignored, and document the path for provider adapters that create
project-specific GitHub, Vercel, Convex, Clerk, and Codex resources.

## Done When

- The repo has a vault CLI that stores secrets outside the repo.
- The repo has docs explaining first-time setup and per-clone setup.
- No real secrets are committed.
- Generated project env files contain placeholders only.
- The next provider-adapter work is clearly scoped.
