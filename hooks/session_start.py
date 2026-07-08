#!/usr/bin/env python3
"""Add PMM OS context when Codex starts or resumes."""

from _common import emit_additional, read_context_excerpt, read_event


def _maybe_autosetup() -> str:
    """First session only: install the research engines (software) in the background.
    Idempotent (marker), non-blocking (detached Popen), and does NOT read browser cookies
    — wiring your X/IG/TikTok sessions stays an explicit `reach.sh social-setup`."""
    import os, pathlib, shutil, subprocess
    root = os.environ.get("CLAUDE_PLUGIN_ROOT") or os.environ.get("PLUGIN_ROOT")
    plugin = pathlib.Path(root) if root else pathlib.Path(__file__).resolve().parent.parent
    setup = plugin / "skills" / "agent-reach" / "scripts" / "setup.sh"
    marker = pathlib.Path.home() / ".pmm-os" / "research-setup"
    if marker.exists() or not setup.exists():
        return ""
    try:
        marker.parent.mkdir(parents=True, exist_ok=True)
        if shutil.which("agent-reach"):
            marker.write_text("preinstalled\n"); return ""
        log = open(marker.parent / "setup.log", "w")
        subprocess.Popen(["bash", str(setup), "--no-social-wire"], stdout=log,
                         stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, start_new_session=True)
        marker.write_text("started\n")
        return ("\n\nPMM OS first-run: installing the research engines (agent-reach + the free "
                "social-search stack) in the background — log at ~/.pmm-os/setup.log. When done, run "
                "`scripts/verify-research.sh` to confirm, then `skills/agent-reach/scripts/reach.sh "
                "social-setup` to wire your already-logged-in X / Instagram / TikTok browser sessions "
                "(no passwords needed).")
    except Exception:
        return "\n\nPMM OS: run `bash skills/agent-reach/scripts/setup.sh` once to install the research engines."


def main() -> None:
    read_event()
    context = read_context_excerpt()
    base = """
PMM OS is enabled.

Default operating sequence for marketing work:
1. If product, market, audience, or offer context is missing, start with $product-marketing-os or $pmm-product-context.
2. Route focused work to the narrowest skill: $pmm-messaging-positioning, $pmm-competitive-intelligence, $pmm-customer-research, $pmm-pricing-packaging, $pmm-go-to-market, $pmm-campaign-brief, $gtm-signal-campaign, $pmm-message-market-fit, $pmm-feature-announcement, $pmm-aeo-geo, $osp-technical-marketing, $plg-gtm-strategy, $product-lifecycle-os, $prd-prototype-factory, $post-launch-learning-loop, $cro, $copywriting, $seo-audit, $analytics, $ads, $emails, $sales-enablement, or $launch.
3. Use $pmm-artifact-factory when a project should result in deliverables, files, slides, docs, social packs, image prompts, or multiple assets.
4. Use $product-lifecycle-os for product planning, roadmap, PRD, prototype, release, and validation work. Use $plg-gtm-strategy for activation, growth loops, PQL/PQA, trial strategy, retention, and expansion work.
5. Use $pmm-coach when the user asks for feedback, pressure testing, roleplay, plan improvement, or when a high-stakes PMM artifact needs review.
6. Use the marketing-os MCP server for routing, templates, campaign brief skeletons, launch tier planning, naming scorecards, artifact bundle plans, image prompt packs, and MCP recommendations.
7. Treat ad platforms, email providers, CRMs, analytics accounts, payment systems, and CMS publishing as production systems. Prefer read-only, preview, and dry-run actions before writes.
8. Save strategic artifacts under .agents/marketing-os/ unless the user asks for a different location.
""".strip()
    if context:
        base += "\n\nExisting product marketing context found. Use this as source of truth when relevant:\n\n" + context
    base += _maybe_autosetup()
    emit_additional("SessionStart", base)


if __name__ == "__main__":
    main()
