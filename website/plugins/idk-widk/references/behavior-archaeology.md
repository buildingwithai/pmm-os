# Behavior Archaeology and Regression Recovery

Behavior archaeology is the practice of reconstructing what a product used to do from evidence: user memory, old commits, screenshots, logs, test snapshots, deployed builds, recordings, and current behavior.

Use it when the user says something used to work but no longer does, or when a product evolved away from a desired behavior.

## Core idea

The behavior contract is decided from evidence. It is not automatically discovered from old code, current code, screenshots, or user memory alone.

## Evidence sources

- User memory and product intent.
- Old known-good commit, release, tag, branch, backup, or deployment.
- Current code and live behavior.
- Screenshots, videos, logs, network traces, session replays, analytics, support tickets.
- Existing tests, golden files, snapshots, PRs, commits, issue comments, and design docs.
- Current product decision.

## The table that matters

For each behavior, classify it as:

- Keep: preserve this behavior.
- Fix: current behavior is wrong and must change.
- Ignore: observed behavior is accidental or obsolete.
- Unknown: not enough evidence or product intent.

Only Keep and Fix become tests.

## Common names

- Behavior archaeology: reconstructing old behavior.
- Regression analysis: comparing old vs current behavior.
- Spec extraction: turning evidence into a clear behavior contract.
- Acceptance criteria: plain-English desired outcomes.
- Characterization testing or pinning testing: tests documenting actual observed behavior.
- Approval testing, golden master testing, snapshot testing: output-capture tests that compare future output to an approved baseline.
- Visual regression testing: screenshot or visual comparison testing.
- Historical oracle: using prior behavior as a test oracle, while remembering prior behavior may not be correct.

## Senior-engineer rule

Never restore old code just because the user liked the old product. First reconstruct what mattered, then protect that behavior with the smallest clear tests.
