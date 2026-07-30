# Security

## Reporting

Email jovannytovar18@gmail.com or open a
[security advisory](https://github.com/buildingwithai/pmm-os/security/advisories/new).
Please don't file a public issue for a vulnerability. Expect a reply within a week.

## What this plugin runs on your machine

Worth knowing before you install:

- **Python on every prompt.** Six hooks (`hooks/*.py`) fire on session start, prompt
  submit, subagent start, tool use, and stop. They read the event on stdin and print
  JSON. They make no network calls.
- **One hook can block a tool call.** `pre_tool_use_policy.py` asks for confirmation on
  commands that look like they'd print a credential, and denies a short list of
  destructive shell patterns. It fails open — a crash never blocks you.
- **Research engines reach the network when you invoke them.** `last30days` queries
  public Reddit/HN/Polymarket/GitHub endpoints; `agent-reach` fetches URLs you name.
  Neither runs on its own.
- **`npx pmm-os setup` installs software** — Python packages and a headless browser. It
  is opt-in, prints what it will do, and requires `--yes`.

No telemetry, no analytics, no data leaves your machine except the searches you ask for.
See [PRIVACY.md](PRIVACY.md).

## Reviewing before you trust it

```bash
cat hooks/hooks.json           # what runs, and on which events
ls hooks/*.py                  # the whole hook surface — 6 files, no dependencies
npx pmm-os doctor              # what's installed and what it found
```

On Codex, plugin hooks stay inactive until you explicitly review and trust them.
