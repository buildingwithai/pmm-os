# Repo Evaluation Scorecard

Use this scorecard before using a repo as a dependency, implementation model, vendored source, fork, submodule, subtree, or subsystem.

Score each category 0 to 5.

| Category | Score | Notes |
|---|---:|---|
| Problem fit |  | Same problem or adjacent? |
| Stack fit |  | Same language, framework, platform, runtime? |
| Activity |  | Recent commits, releases, issue/PR activity? |
| Adoption |  | Stars, forks, downloads, dependents, users? |
| Source clarity |  | Organized source, examples, exports, docs? |
| Testability |  | Tests, demos, fixtures, CI? |
| License fit |  | Permissive, copyleft, no license, unknown? |
| Security posture |  | Dependency health, auth/data handling, Scorecard/SCA signals? |
| Integration cost |  | How much adaptation or migration needed? |
| Reversibility |  | Easy to remove or swap? |

## Decision bands

- 42 to 50: strong candidate, still verify source and license.
- 32 to 41: useful candidate, likely needs adapter or partial adoption.
- 22 to 31: reference only unless there is a strong reason.
- Under 22: do not integrate without a specific exception.

## Red flags

- No license or unclear license.
- No tests for the part you need.
- Abandoned project or stale release.
- Large dependency tree for a small feature.
- Poor error handling, auth handling, or permission handling.
- README promises do not match source.
- Hard-coded secrets, unsafe eval, weak validation, broad browser permissions, or dangerous install scripts.
