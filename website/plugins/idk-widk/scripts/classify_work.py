#!/usr/bin/env python3
"""Suggest risk level and artifacts for a coding task.

This is a lightweight heuristic helper. It is not a replacement for agent judgment.
"""
from __future__ import annotations

import argparse
import re

HIGH_TERMS = [
    "auth", "login", "password", "token", "oauth", "permission", "admin", "role",
    "payment", "billing", "stripe", "subscription", "invoice", "database", "schema",
    "migration", "user data", "personal", "medical", "financial", "secret", "api key",
    "production", "deploy", "rollback", "public", "privacy", "security", "extension permission",
]

MAJOR_TERMS = [
    "rewrite", "refactor", "rearchitecture", "architecture", "migrate", "replace", "split service",
    "large", "whole app", "modularize", "component split", "database migration",
]

MEDIUM_TERMS = [
    "api", "state", "cross-file", "browser", "mobile", "chrome extension", "integration",
    "webhook", "cache", "queue", "background", "service worker", "content script",
]


def classify(description: str, platform: str) -> tuple[str, list[str]]:
    text = f"{description} {platform}".lower()
    reasons = []
    if any(term in text for term in MAJOR_TERMS):
        reasons.append("large structural or migration language detected")
        return "major", reasons
    if any(term in text for term in HIGH_TERMS):
        reasons.append("security, privacy, data, production, auth, or payment risk detected")
        return "high", reasons
    if any(term in text for term in MEDIUM_TERMS):
        reasons.append("cross-surface or integration risk detected")
        return "medium", reasons
    if len(re.findall(r"\w+", text)) < 12:
        reasons.append("small or under-specified task")
        return "low", reasons
    reasons.append("defaulting to medium because task is non-trivial")
    return "medium", reasons


def artifacts_for(risk: str) -> list[str]:
    mapping = {
        "low": ["ISSUE_BRIEF.md", "IMPLEMENTATION_PLAN.md", "VERIFICATION_MATRIX.md"],
        "medium": ["MISSION_CONTROL.md", "INVESTIGATION_LOG.md", "PROBLEM_STATEMENT.md", "IMPLEMENTATION_PLAN.md", "VERIFICATION_MATRIX.md", "SESSION_HANDOFF.md"],
        "high": ["MISSION_CONTROL.md", "TECHNICAL_DESIGN.md", "ADR.md", "THREAT_MODEL.md or PRIVACY_REVIEW.md if relevant", "RELEASE_PLAN.md", "ROLLBACK_KILL_SWITCH_PLAN.md", "RUNBOOK.md", "VERIFICATION_MATRIX.md"],
        "major": ["MISSION_CONTROL.md", "TECHNICAL_DESIGN.md", "ADR.md", "REFACTOR_PLAN.md", "MIGRATION_PLAN.md", "IMPLEMENTATION_PLAN.md", "VERIFICATION_MATRIX.md", "RELEASE_PLAN.md", "ROLLBACK_KILL_SWITCH_PLAN.md", "SESSION_HANDOFF.md"],
    }
    return mapping[risk]


def main() -> int:
    parser = argparse.ArgumentParser(description="Classify a vibe-coding task")
    parser.add_argument("--description", required=True)
    parser.add_argument("--platform", default="unknown")
    args = parser.parse_args()

    risk, reasons = classify(args.description, args.platform)
    print(f"Suggested risk: {risk}")
    print("Reasons:")
    for reason in reasons:
        print(f"- {reason}")
    print("Suggested artifacts:")
    for artifact in artifacts_for(risk):
        print(f"- {artifact}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
