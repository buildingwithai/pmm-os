#!/usr/bin/env node
/**
 * Vendors the kit renderer pieces from the plugin (single source of truth:
 * skills/pmm-launch-kit/scripts/). Run after any kit-editor change:
 *   npm run sync:kit
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pluginScripts = join(here, "../../../../skills/pmm-launch-kit/scripts");
const dest = join(here, "../src/lib/cloud/kit");

// 1. block registry — byte-exact copy
const registry = readFileSync(join(pluginScripts, "block-registry.mjs"), "utf8");
writeFileSync(join(dest, "block-registry.mjs"),
  "// VENDORED from skills/pmm-launch-kit/scripts/block-registry.mjs — do not edit here.\n// Refresh with: npm run sync:kit\n" + registry);

// 2. kit stylesheet — as an exported TS string (Next can't import raw css text)
const css = readFileSync(join(pluginScripts, ".kit-style.css"), "utf8");
writeFileSync(join(dest, "kit-style.ts"),
  "// VENDORED from skills/pmm-launch-kit/scripts/.kit-style.css — do not edit here.\n// Refresh with: npm run sync:kit\nexport const KIT_CSS = " + JSON.stringify(css) + ";\n");

console.log("kit renderer vendored: block-registry.mjs + kit-style.ts");
