# External Repo Runtime Lab

Use this when an external repo should be cloned, run, and inspected rather than guessed from its README.

## Safe workspace

Use `.idkwidk/external-repos/` for cloned research repos and ignore that path in Git. Store runtime evidence and screenshots under `.idkwidk/runtime-captures/` unless the project has a better artifact path.

## Evidence order

1. License and manifest inspection.
2. Install and script safety review.
3. Local setup in a safe environment.
4. Runtime exploration through Chrome DevTools MCP connected to Chrome for Testing.
5. DOM, CSS, network, state, screenshot, and console capture.
6. Feature parity spec or clean-room behavior spec.
7. Integration decision.

## Required browser tool

Chrome DevTools MCP connected to `http://127.0.0.1:9222` is mandatory for live browser inspection in web UI and external repo parity work.

## Tab rule

Reuse existing tabs. Do not repeatedly open new tabs for the same URL.
