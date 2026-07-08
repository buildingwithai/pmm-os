# No README-Only Rule

An agent must not claim a repo solves the problem or recommend copying its approach after reading only the README.

## Required evidence before recommendation

At minimum, inspect:

1. Root tree.
2. Manifest and lock files.
3. Source entry points.
4. Relevant feature implementation files.
5. Examples or demos.
6. Tests or fixtures.
7. License.
8. Recent activity, releases, issues, or PRs if available.

## Confidence labels

Use these labels:

- High confidence: README, source, tests/examples, license, and recent activity inspected.
- Medium confidence: README, source, and license inspected, but tests or activity incomplete.
- Low confidence: only README/docs inspected or source access unavailable.

Never hide low confidence.
