---
name: input-intake-interpreter
description: Use when the user rambles, is unsure what to ask, attaches screenshots or images, gives mixed product and engineering context, lists fears or guesses, or says they do not know what they do not know. Converts raw text and visual evidence into a clear engineering brief, prompt rewrite, task classification, risks, and next safe action.
license: Proprietary
compatibility: Designed for OpenAI Codex plugins and Agent Skills compatible coding agents.
metadata:
  version: "0.3.0"
  author: "Jovanny"
---

# idkWidk Input Intake Interpreter

## Purpose

Turn messy user input into useful engineering input. The user may ramble because they lack software engineering vocabulary. They may include screenshots, logs, files, hypotheses, fears, and partial next steps. Your job is to extract the actual goal and convert it into a senior-engineer-quality task brief.

## Intake order

1. Read the user's text first. Capture all references to images, files, screenshots, logs, errors, and UI states.
2. Inspect attachments in the order the user references them. If no order is given, inspect them in visible order and say how you mapped them.
3. Use visual understanding first. Use OCR only when exact text is necessary and cannot be read visually.
4. Separate user observations from user theories. Observations are evidence. Theories are hypotheses.
5. Separate user fears from requirements. Fears become risk constraints only when they are relevant.
6. Separate desired outcome from proposed implementation. The user may propose a technical path that is not the best path.
7. Create a concise Engineering Prompt and a Next Best Action.

## Output structure

For non-trivial tasks, produce or create `USER_SIGNAL_BRIEF.md` with:

```text
Original raw request:
User-level goal:
What the user believes is happening:
Evidence from text:
Evidence from images or files:
Screenshots reviewed:
Direct requests:
Guesses and hypotheses:
Fears and constraints:
Implicit requirements:
Task classification:
Risk level:
Likely product surface:
What is proven:
What is suspected:
What is unknown:
Questions to avoid asking because the repo can answer them:
One product-level question, only if needed:
Rewritten engineering prompt:
Next safest action:
```

## Rewritten engineering prompt standard

The rewritten prompt should include:

```text
Goal:
Context:
Evidence:
Constraints:
Risks:
What not to do:
Investigation steps:
Done when:
Verification required:
```

## Rules

Do not flatten uncertainty into false confidence.
Do not treat the user's brainstormed solution as the selected design.
Do not ask the user technical questions that can be answered by inspecting the repository.
Do not start coding until the real goal and evidence are clear enough for the risk level.
If images are central to the task, do not ignore them.
If exact UI text or error text matters, quote only the relevant short text and then paraphrase.
