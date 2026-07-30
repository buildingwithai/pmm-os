#!/usr/bin/env python3
"""Add PMM OS context when Codex starts or resumes."""

from _common import emit_additional, read_context_excerpt, read_event


def _research_engine_notice() -> str:
    """Tell the user the research engines need a one-time setup. Do NOT run it.

    This used to fire a detached Popen on first session with no prompt, which
    pip-installed four packages, downloaded a playwright WebKit build (hundreds
    of MB), and appended a line to the user's global ~/.config/yt-dlp/config.
    Installing software on someone's machine because they enabled a marketing
    plugin is not a reasonable default, however convenient. It is now opt-in.
    """
    import pathlib, shutil
    if shutil.which("agent-reach") or (pathlib.Path.home() / ".pmm-os" / "research-setup").exists():
        return ""
    return ("\n\nResearch engines are not installed yet. `last30days` works zero-config "
            "(Reddit/HN/Polymarket/GitHub). For the full sweep — video transcripts, web "
            "reading, and the other platforms — run `npx pmm-os setup` once. It installs "
            "Python packages and a headless browser, so it asks first.")


def main() -> None:
    read_event()
    context = read_context_excerpt()
    base = """
PMM OS is enabled.

Default operating sequence for marketing work:
1. If product, market, audience, or offer context is missing, start with $product-marketing-os or $pmm-product-context.
2. Route focused work to the narrowest skill: $pmm-messaging-positioning, $pmm-competitive-intelligence, $pmm-customer-research, $pmm-pricing-packaging, $pmm-go-to-market, $pmm-campaign-brief, $gtm-signal-campaign, $pmm-message-market-fit, $pmm-feature-announcement, $pmm-aeo-geo, $osp-technical-marketing, $plg-gtm-strategy, $product-lifecycle-os, $prd-prototype-factory, $post-launch-learning-loop, $pmm-content-writer, or $sales-enablement.
3. Use $pmm-artifact-factory when a project should result in deliverables, files, slides, docs, social packs, image prompts, or multiple assets.
4. Use $product-lifecycle-os for product planning, roadmap, PRD, prototype, release, and validation work. Use $plg-gtm-strategy for activation, growth loops, PQL/PQA, trial strategy, retention, and expansion work.
5. Use $pmm-coach when the user asks for feedback, pressure testing, roleplay, plan improvement, or when a high-stakes PMM artifact needs review.
6. Templates, canvases, and scorecards live on disk at skills/product-marketing-os/assets/ and references/ — read them directly.
7. Treat ad platforms, email providers, CRMs, analytics accounts, payment systems, and CMS publishing as production systems. Prefer read-only, preview, and dry-run actions before writes.
8. Save strategic artifacts under .agents/marketing-os/ unless the user asks for a different location.
""".strip()
    if context:
        base += "\n\nExisting product marketing context found. Use this as source of truth when relevant:\n\n" + context
    base += _research_engine_notice()
    emit_additional("SessionStart", base)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass          # a hook crash must never block the user
    raise SystemExit(0)
