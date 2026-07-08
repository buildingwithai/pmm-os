# Vibe-coder failure modes and countermeasures

## 1. Prompt-loop debugging

Symptom: The user keeps saying "that did not work" and the AI keeps patching.

Countermeasures:

- Define expected behavior and actual behavior.
- Capture error messages and screenshots.
- Tag likely files.
- Run the smallest failing reproduction.
- Track attempts in a debugging ledger.
- Stop after three failed attempts and reset hypotheses.

## 2. Maintenance wall

Symptom: The prototype works, but every later change breaks something else.

Countermeasures:

- Add Mission Control.
- Create a system map.
- Add regression tests.
- Split work into small slices.
- Avoid broad rewrites.
- Create a refactor plan only when needed.

## 3. Context drift

Symptom: The conversation grows, the agent forgets the original objective, and the user does not know where they are.

Countermeasures:

- Maintain `MISSION_CONTROL.md`.
- Classify side quests.
- Create `SESSION_HANDOFF.md`.
- Use resume prompts.
- Reset context when debugging loops form.

## 4. Code degradation

Symptom: The AI subtly breaks established patterns or adds brittle workarounds.

Countermeasures:

- Review diffs frequently.
- Commit small slices.
- Run tests after each slice.
- Check for duplicate logic and unnecessary dependencies.
- Revert to last known good state when degradation is severe.

## 5. Feature creep

Symptom: The AI makes new features feel free, so the product grows faster than its design and tests.

Countermeasures:

- Define scope and non-scope.
- Limit one coherent feature slice at a time.
- Park non-blocking ideas.
- Require acceptance criteria.
- Create a release plan for user-visible work.

## 6. Refactor hell

Symptom: Splitting files, modularizing, or cleaning up code breaks the app.

Countermeasures:

- Map behavior to preserve.
- Add characterization tests.
- Separate behavior changes from structure changes.
- Use adapters or compatibility layers.
- Create a phased refactor plan.

## 7. Security and privacy blind spots

Symptom: The app exposes data, secrets, logs, preview URLs, admin paths, or user records.

Countermeasures:

- Treat public deployment as high risk.
- Check auth and authorization.
- Check privacy defaults and indexing.
- Check logs and secrets.
- Create threat model and privacy review for sensitive work.
- Define rollback and kill switch.

## 8. No verification

Symptom: The AI says "fixed" because the code changed.

Countermeasures:

- Require verification evidence.
- Map requirements to tests.
- Run focused checks first.
- State what was not verified.
- Add regression tests for real bugs.
