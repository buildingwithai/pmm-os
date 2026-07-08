# Install idkWidk

idkWidk stands for "I don't know what I don't know." It is a Codex plugin for non-engineers and AI-assisted builders who want senior engineering process, Mission Control, open-source research, behavior recovery, license-aware reuse, and visual runtime QA.

## Personal install

Unzip the plugin and copy the plugin folder to your Codex plugins directory.

```bash
mkdir -p ~/.codex/plugins
rm -rf ~/.codex/plugins/idk-widk
cp -R idk-widk ~/.codex/plugins/idk-widk
mkdir -p ~/.agents/plugins
```

Create or update `~/.agents/plugins/marketplace.json`:

```json
{
  "name": "idkwidk-marketplace",
  "interface": {
    "displayName": "idkWidk"
  },
  "plugins": [
    {
      "name": "idk-widk",
      "source": {
        "source": "local",
        "path": "./.codex/plugins/idk-widk"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Development"
    }
  ]
}
```

Restart Codex, open Plugins, choose the idkWidk marketplace, and install `idkWidk`.

## Repo marketplace install

Use the repo starter package if you want a GitHub repo that others can add as a marketplace. It contains:

```text
.agents/plugins/marketplace.json
plugins/idk-widk/
```

In Codex, add the GitHub repo as a marketplace. Use `main` as the Git ref and leave sparse paths blank unless you know exactly what paths to include.

## Persistent guidance

For behavior that persists across projects, copy:

```text
assets/templates/AGENTS_GLOBAL_TEMPLATE.md
```

to:

```text
~/.codex/AGENTS.md
```

For project-specific behavior, copy:

```text
assets/templates/AGENTS_PROJECT_TEMPLATE.md
```

to the repo root as:

```text
AGENTS.md
```

## Optional plugin hooks

idkWidk includes plugin hooks. They are off unless plugin hooks are enabled in Codex.

Add this to `~/.codex/config.toml`:

```toml
[features]
plugin_hooks = true
```

Restart Codex and review the hooks when prompted.

## Required visual/runtime setup for v0.6.2

For agent browser/UI parity work, idkWidk expects Chrome DevTools MCP connected to Chrome for Testing on port 9222. The plugin bundles `.mcp.json`, and the manifest points to it with `mcpServers`.

Enable the plugin-bundled Chrome DevTools MCP server in `~/.codex/config.toml` if Codex requires explicit enablement:

```toml
[plugins."idk-widk".mcp_servers.chrome-devtools]
enabled = true
default_tools_approval_mode = "prompt"
```

The plugin MCP config uses:

```text
--browser-url=http://127.0.0.1:9222
```

Manual fallback if needed:

```bash
codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222 --no-usage-statistics --no-performance-crux --redactNetworkHeaders=true --experimentalPageIdRouting
```

You must start Chrome for Testing so the DevTools endpoint is reachable at `http://127.0.0.1:9222`. A quick check is:

```bash
plugins/idk-widk/scripts/verify_chrome_for_testing_9222.py
```

Agent browser default launch:

```bash
plugins/idk-widk/scripts/launch_chrome_for_testing_agent_browser.sh
```

If another process owns `9222`, the launcher asks before closing it in an interactive shell. In non-interactive runs, it refuses to close anything automatically.

Equivalent macOS command:

```bash
/Users/jovannytovar/.cache/chrome-for-testing/chrome/mac_arm-*/chrome-mac-arm64/Google\ Chrome\ for\ Testing.app/Contents/MacOS/Google\ Chrome\ for\ Testing \
  --remote-debugging-port=9222 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$HOME/Library/Application Support/Google/Chrome for Testing" \
  --profile-directory="Default" \
  --load-extension="/Users/jovannytovar/pmm-clean/extensions/Job-Application-tracker/chrome-extension-dev"
```

Log into Gmail/LinkedIn once in that Chrome for Testing profile. The expected signed-in testing profile is `jovannnytovar@gmail.com`. Reuse that profile for idkWidk sessions.

`127.0.0.1:9222` is the DevTools control socket, not the product website. The target app still runs on its own app URL, often `localhost:3000` for local development.

For agent browser testing, do not use the user's personal Chrome unless the user explicitly overrides this rule. Use Chrome for Testing with the persistent agent browser testing profile.

## Starter prompts

```text
Use idkWidk. I am not a software engineer. Treat my message as raw input, classify the task, extract the real goal, inspect any screenshots or files, and do not start coding until the evidence and next safe step are clear.
```

```text
Use idkWidk Chrome for Testing Visual QA. Use Chrome DevTools MCP connected to Chrome for Testing at http://127.0.0.1:9222. Reuse the existing tab instead of opening duplicates. Capture screenshots, DOM/CSS evidence, console/network checks, and before/after comparison before claiming visual parity.
```

## Common commands

Prepare an ignored external repo workspace:

```bash
python plugins/idk-widk/scripts/prepare_external_repo_lab.py --repo https://github.com/owner/repo.git --ref main
```

Create OSS parity or clean-room artifact pack:

```bash
python plugins/idk-widk/scripts/create_oss_parity_artifacts.py --name "Extract source feature" --repo https://github.com/owner/repo.git --mode unknown
```

Create visual QA artifacts:

```bash
python plugins/idk-widk/scripts/create_visual_qa_artifacts.py --name "Feature visual parity" --repo https://github.com/owner/repo.git --flow "main workflow"
```

Inventory images, GIFs, videos, and visual references in a source repo:

```bash
python plugins/idk-widk/scripts/inventory_visual_assets.py .idkwidk/external-repos/owner__repo
```

Compare two screenshots locally:

```bash
python plugins/idk-widk/scripts/compare_visual_snapshots.py baseline.png candidate.png --out .idkwidk/runtime-captures/diff.png
```
