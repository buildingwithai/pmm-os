# Privacy

PMM OS is a set of skills, hooks, and scripts that run locally inside Claude Code
or Codex. It is not a hosted service and has no backend of its own.

## What PMM OS collects

Nothing. There is no telemetry, no analytics, and no phone-home. The plugin does
not transmit your prompts, your product context, or your generated artifacts
anywhere.

## What stays on your machine

- Product context and deliverables you generate, written under your project
  (`.agents/`) or wherever you point the skills.
- Plugin payload and setup state under `~/.pmm-os/`.
- Research-engine configuration under `~/.config/last30days/`.

Deleting those directories removes everything PMM OS has stored.

## What talks to the network, and only when you ask it to

- **`last30days`** queries public endpoints for Reddit, Hacker News, Polymarket,
  GitHub, and — where you have configured access — X, YouTube, and TikTok. It sends
  your search terms to those services.
- **`agent-reach`** fetches URLs and platform content you ask it to read.
- **`npx pmm-os setup`** downloads Python packages and a headless browser. It is
  opt-in and tells you what it will install before doing it.
- **`npx pmm-os install`** invokes the `claude` CLI to register the plugin locally.

Your prompts go to Anthropic or OpenAI as part of normal Claude Code / Codex usage,
governed by their privacy policies — not by this plugin.

## Credentials

PMM OS never asks for passwords. The optional social-search setup reuses browser
sessions you are already signed in to; tokens stay in the research engine's own
config directory on your machine and are never transmitted to the author.

## Contact

Questions or concerns: https://github.com/buildingwithai/pmm-os/issues
