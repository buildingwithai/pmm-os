# Input Intake Interpreter

idkWidk assumes the user may not know what information matters. Long or messy messages are treated as raw signal. The agent should extract:

- the user-level goal
- direct evidence
- image and screenshot clues
- guesses and hypotheses
- fears and constraints
- proposed solutions that may or may not be correct
- the actual engineering task
- the safest next action

The agent should rewrite the request into an engineering prompt but should not erase uncertainty.

## Image handling

Read text references first, then inspect images in the referenced order. Use OCR only when exact text is needed and visual reading is insufficient.

## Output

For larger tasks, create `USER_SIGNAL_BRIEF.md`, `ENGINEERED_PROMPT.md`, and `MULTIMODAL_EVIDENCE_BRIEF.md`.
