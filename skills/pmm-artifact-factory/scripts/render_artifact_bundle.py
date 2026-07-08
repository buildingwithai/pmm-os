#!/usr/bin/env python3
"""Render a basic marketing artifact bundle from JSON.

This script intentionally uses only the Python standard library. It creates:
- README.md
- campaign-brief.md
- social-posts.csv
- image-prompts.json
- campaign-brief.docx, minimal Word-compatible document
- deck-outline.pptx, minimal PowerPoint-compatible deck
- prd.md
- plg-metrics.json
- product-lifecycle-state.json
- post-launch-readout.md
- prototype.html
- battlecard.md
- positioning.md
- pricing-analysis.md
- account-research.md
- osp-value-map.md

Usage:
  python3 render_artifact_bundle.py --sample --out .agents/marketing-os/outputs/sample-pack
  python3 render_artifact_bundle.py --spec spec.json --out .agents/marketing-os/outputs/my-pack
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import zipfile
from pathlib import Path
from typing import Any


def sample_spec() -> dict[str, Any]:
    return {
        "project": "Example Product Launch",
        "campaign_brief": {
            "Campaign Name": "Example Product Launch",
            "Background and Context": "Describe why this launch matters now.",
            "Objective": "Achieve a measurable adoption target within a defined launch window.",
            "Target Audience": "Primary ICP and buying committee.",
            "Key Insight": "The human truth behind the campaign.",
            "Positioning Statement": "For [audience], [product] is the [category] that [benefit].",
            "Key Messages": "1. Message one\n2. Message two\n3. Message three",
            "Single-Minded Proposition": "One clear promise.",
            "Channel Plan": "Email, social, blog, in-product, sales enablement.",
            "Content Deliverables": "Brief, emails, posts, deck, one-pager, image prompts.",
            "Timeline": "Pre-launch, launch week, post-launch.",
            "Budget": "TBD.",
            "Success Metrics and KPIs": "Activation, pipeline, conversion, adoption.",
            "RACI and Approvals": "PMM accountable, Product consulted, Marketing Ops responsible for launch ops.",
        },
        "social_posts": [
            {"channel": "LinkedIn", "post_type": "Problem-led", "copy": "Your old workflow was built for a smaller problem. This launch changes that.", "cta": "Read the launch brief"},
            {"channel": "X", "post_type": "Before-after", "copy": "Before: manual process. After: one guided workflow.", "cta": "See what changed"},
        ],
        "image_prompts": [
            {"asset": "Launch hero", "prompt": "Create a clean B2B SaaS launch hero showing a before-and-after workflow transformation.", "aspect_ratio": "16:9"},
            {"asset": "Social graphic", "prompt": "Create a simple product announcement graphic with a bold headline area and abstract workflow elements.", "aspect_ratio": "1:1"},
        ],
        "prd": {
            "Problem and opportunity": "Describe the customer problem and why now.",
            "Target user and use case": "Define the primary user and workflow.",
            "Goals and non-goals": "List measurable goals and explicit exclusions.",
            "User stories": "As a [user], I want [capability], so I can [outcome].",
            "Acceptance criteria": "Given [context], when [action], then [expected result].",
            "Success metrics": "Activation, adoption, conversion, retention, or revenue metric.",
            "Launch and GTM implications": "Describe required messaging, enablement, docs, and rollout support."
        },
        "plg_metrics": {
            "north_star": "TBD",
            "activation_event": "TBD",
            "time_to_value_target": "TBD",
            "pql_signals": ["Activated", "Invited teammate", "Hit usage threshold"]
        },
        "product_lifecycle_state": {
            "current_stage": "strategy",
            "completed_stages": ["perception"],
            "quality_gate": "strategy_to_design",
            "mode": "copilot"
        },
        "post_launch_readout": {
            "Executive summary": "Summarize launch performance against objectives.",
            "Metric scorecard": "Baseline vs target vs actual.",
            "Qualitative feedback": "Top customer, sales, support, and internal themes.",
            "Next iteration plan": "Action, owner, metric, deadline, decision rule."
        },
        "prototype": {
            "title": "Example Prototype",
            "description": "Simple HTML prototype scaffold for stakeholder review."
        },
        "battlecard": {
            "Threat level": "TBD",
            "Their pitch": "Summarize competitor positioning.",
            "Where they win": "List strengths with evidence.",
            "Where they lose": "List weaknesses and talk tracks.",
            "Counter-positioning": "Acknowledge, reframe, prove, close.",
            "What not to say": "Claims that need guardrails."
        },
        "positioning": {
            "Competitive alternatives": "Status quo, direct competitors, indirect alternatives.",
            "Unique attributes": "Capabilities alternatives lack.",
            "Value themes": "Benefits tied to proof.",
            "Target segment": "Who cares most and why.",
            "Market category": "Frame of reference that makes the value obvious."
        },
        "pricing_analysis": {
            "Pricing landscape": "Competitor model, tiers, value metric, and free tier.",
            "Feature gating": "What is free, paid, enterprise, or add-on.",
            "Recommendations": "Model, tier structure, risk, and validation test."
        },
        "account_research": {
            "Company snapshot": "Target account summary.",
            "Active signals": "Signals and score contribution.",
            "Why now": "Specific trigger.",
            "Why us": "Specific fit.",
            "Hook": "First outreach line."
        },
        "osp_value_map": {
            "Tagline": "TBD",
            "Position statements": "Market, technical, UX, and business.",
            "Personas": "Personas and needs.",
            "Value cases": "Outcomes and proof needed.",
            "Feature hierarchy": "Feature to value case map."
        },
        "slides": [
            {"title": "Launch overview", "bullets": ["What is launching", "Who it is for", "Why now"]},
            {"title": "Audience and problem", "bullets": ["Primary ICP", "Current pain", "Trigger moment"]},
            {"title": "Plan and metrics", "bullets": ["Channels", "Owners", "Success metrics"]},
        ],
    }


def write_md(path: Path, title: str, sections: dict[str, str]) -> None:
    lines = [f"# {title}", ""]
    for key, value in sections.items():
        lines += [f"## {key}", str(value).strip(), ""]
    path.write_text("\n".join(lines), encoding="utf-8")


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    fields = sorted({k for row in rows for k in row.keys()})
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def write_html_prototype(path: Path, proto: dict[str, Any]) -> None:
    title = html.escape(str(proto.get("title", "Prototype")))
    description = html.escape(str(proto.get("description", "Prototype scaffold")))
    path.write_text(f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>body{{font-family:system-ui,-apple-system,sans-serif;margin:0;background:#f8fafc;color:#111827}}header{{background:white;border-bottom:1px solid #e5e7eb;padding:24px 32px}}main{{padding:32px;display:grid;gap:16px;max-width:960px;margin:auto}}.card{{background:white;border:1px solid #e5e7eb;border-radius:12px;padding:20px}}button{{border:0;border-radius:8px;padding:10px 14px;background:#111827;color:white}}</style>
</head>
<body>
  <header><h1>{title}</h1><p>{description}</p></header>
  <main>
    <section class="card"><h2>Primary workflow</h2><p>Replace this scaffold with the core user flow.</p><button>Primary action</button></section>
    <section class="card"><h2>States to validate</h2><ul><li>Empty</li><li>Loading</li><li>Success</li><li>Error</li></ul></section>
  </main>
</body>
</html>
""", encoding="utf-8")


def docx_xml(title: str, sections: dict[str, str]) -> str:
    paras = [f"<w:p><w:r><w:t>{html.escape(title)}</w:t></w:r></w:p>"]
    for key, value in sections.items():
        paras.append(f"<w:p><w:r><w:t>{html.escape(key)}</w:t></w:r></w:p>")
        for line in str(value).splitlines() or [""]:
            paras.append(f"<w:p><w:r><w:t>{html.escape(line)}</w:t></w:r></w:p>")
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>%s<w:sectPr/></w:body></w:document>""" % "".join(paras)


def write_docx(path: Path, title: str, sections: dict[str, str]) -> None:
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>""")
        z.writestr("_rels/.rels", """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>""")
        z.writestr("word/document.xml", docx_xml(title, sections))


def slide_xml(title: str, bullets: list[str]) -> str:
    text = title + "\n" + "\n".join(f"- {b}" for b in bullets)
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/><p:sp><p:nvSpPr><p:cNvPr id="2" name="Text"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:t>{html.escape(text)}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>"""


def write_pptx(path: Path, slides: list[dict[str, Any]]) -> None:
    if not slides:
        slides = [{"title": "Deck Outline", "bullets": ["Add slides"]}]
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as z:
        overrides = "".join(f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>' for i in range(1, len(slides)+1))
        z.writestr("[Content_Types].xml", f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>{overrides}</Types>""")
        z.writestr("_rels/.rels", """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>""")
        slide_ids = "".join(f'<p:sldId id="{256+i}" r:id="rId{i}"/>' for i in range(1, len(slides)+1))
        z.writestr("ppt/presentation.xml", f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:sldIdLst>{slide_ids}</p:sldIdLst><p:sldSz cx="12192000" cy="6858000" type="wide"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>""")
        rels = "".join(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>' for i in range(1, len(slides)+1))
        z.writestr("ppt/_rels/presentation.xml.rels", f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{rels}</Relationships>""")
        for i, slide in enumerate(slides, start=1):
            z.writestr(f"ppt/slides/slide{i}.xml", slide_xml(str(slide.get("title", f"Slide {i}")), list(slide.get("bullets", []))))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--spec", type=Path)
    parser.add_argument("--sample", action="store_true")
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    if args.sample:
        spec = sample_spec()
    elif args.spec:
        spec = json.loads(args.spec.read_text(encoding="utf-8"))
    else:
        raise SystemExit("Provide --sample or --spec spec.json")

    out = args.out
    out.mkdir(parents=True, exist_ok=True)
    project = str(spec.get("project", "Marketing Artifact Bundle"))
    brief = dict(spec.get("campaign_brief", {}))

    write_md(out / "campaign-brief.md", project, brief)
    if spec.get("prd"):
        write_md(out / "prd.md", f"PRD: {project}", dict(spec.get("prd", {})))
    if spec.get("post_launch_readout"):
        write_md(out / "post-launch-readout.md", f"Post Launch Readout: {project}", dict(spec.get("post_launch_readout", {})))
    if spec.get("prototype"):
        write_html_prototype(out / "prototype.html", dict(spec.get("prototype", {})))
    if spec.get("battlecard"):
        write_md(out / "battlecard.md", f"Battlecard: {project}", dict(spec.get("battlecard", {})))
    if spec.get("positioning"):
        write_md(out / "positioning.md", f"Positioning: {project}", dict(spec.get("positioning", {})))
    if spec.get("pricing_analysis"):
        write_md(out / "pricing-analysis.md", f"Pricing Analysis: {project}", dict(spec.get("pricing_analysis", {})))
    if spec.get("account_research"):
        write_md(out / "account-research.md", f"Account Research: {project}", dict(spec.get("account_research", {})))
    if spec.get("osp_value_map"):
        write_md(out / "osp-value-map.md", f"OSP Value Map: {project}", dict(spec.get("osp_value_map", {})))
    if spec.get("plg_metrics"):
        (out / "plg-metrics.json").write_text(json.dumps(spec.get("plg_metrics", {}), indent=2), encoding="utf-8")
    if spec.get("product_lifecycle_state"):
        (out / "product-lifecycle-state.json").write_text(json.dumps(spec.get("product_lifecycle_state", {}), indent=2), encoding="utf-8")
    write_docx(out / "campaign-brief.docx", project, brief)
    write_csv(out / "social-posts.csv", list(spec.get("social_posts", [])))
    (out / "image-prompts.json").write_text(json.dumps(spec.get("image_prompts", []), indent=2), encoding="utf-8")
    write_pptx(out / "deck-outline.pptx", list(spec.get("slides", [])))
    (out / "README.md").write_text(f"# {project}\n\nGenerated artifact bundle. Review all files before publishing.\n", encoding="utf-8")
    print(json.dumps({"out": str(out), "files": sorted(p.name for p in out.iterdir())}, indent=2))


if __name__ == "__main__":
    main()
