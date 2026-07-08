# Visual Runtime QA

Visual Runtime QA is the idkWidk workflow for proving that a browser/UI feature actually looks and behaves correctly at runtime.

Core rule: agent browser UI work is not done until the agent has runtime evidence from Chrome DevTools MCP connected to Chrome for Testing at `http://127.0.0.1:9222`. A build result is not visual proof.

## Required evidence

- Screenshot evidence.
- DOM or accessibility snapshot evidence.
- Computed style evidence when layout or parity matters.
- Console and network evidence when setup, hydration, routing, or assets might be wrong.
- Before/after comparison for changes.
- Source/reference vs candidate comparison for parity work.

## Tool policy

Chrome DevTools MCP connected to Chrome for Testing is mandatory for browser UI work, source repo runtime lab work, and parity work when browser runtime inspection is needed.

Do not use the user's personal Chrome for agent browser testing unless the user explicitly overrides this rule. Use the persistent Chrome for Testing profile so Gmail/LinkedIn auth can stay signed in across sessions.

## Failure pattern this prevents

A repo README shows a complex product, but the agent starts the wrong package and sees a single blank or simple HTML page. Without visual evidence, the agent may copy the wrong thing or build a toy version. Visual Runtime QA forces a setup healthcheck before implementation.
