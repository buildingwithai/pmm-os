# Example prompts

## General bug

```text
Use idkWidk. I am not a software engineer. The app is doing <actual behavior>, but I expected <expected behavior>. First classify the problem and investigate before changing code.
```

## Stuck in a loop

```text
$vibe-debugging-governor I have tried several fixes and each one creates a new bug. Stop the loop, summarize what is proven and unknown, and create a debugging ledger before changing more code.
```

## Side quest drift

```text
$mission-control We started fixing <original objective>, but now we have several side issues. Rebuild Mission Control, classify each issue as blocking or parked, and tell me the next best action.
```

## Fuzzy feature

```text
$feature-specification I want users to be able to <goal>. Turn this into a product and engineering spec with acceptance criteria, implementation slices, and verification plan.
```

## Refactor

```text
$refactor-safety This codebase is messy and the AI wants to split files and reorganize components. Create a safe refactor plan that preserves behavior and avoids a broad rewrite.
```

## Security sensitive

```text
$security-privacy-guardrails This feature touches user data and public deployment. Create the threat model, privacy review, and rollback plan before implementation.
```

## Release

```text
$verification-release Before we ship, create a verification matrix and release plan. Tell me what is verified, what is not verified, and what risk remains.
```


## Rambling prompt intake

```text
Use idkWidk Input Intake Interpreter. I am going to ramble and attach screenshots. Read my text first, inspect the images in the order I reference them, separate facts from guesses, and rewrite this into an engineering prompt before doing anything.
```


## Chrome for Testing Visual QA

```text
Use idkWidk Chrome for Testing Visual QA. Use Chrome DevTools MCP connected to Chrome for Testing at http://127.0.0.1:9222. Reuse the current tab if it already matches the URL. Do not open duplicate tabs. Capture before/after screenshots, DOM/CSS evidence, console/network checks, and a visual comparison before calling the UI verified.
```
