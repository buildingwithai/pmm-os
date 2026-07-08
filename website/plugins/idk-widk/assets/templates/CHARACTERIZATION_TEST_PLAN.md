# Characterization Test Plan

## Purpose

Document actual observed behavior before changing risky or poorly understood code.

## Code or workflow under characterization

## Why characterization is needed

## Inputs to sample

## Outputs or side effects to observe

## Volatile values to scrub
- timestamps
- random IDs
- generated UUIDs
- environment-specific paths
- nondeterministic ordering
- external service data

## Characterization cases

| Case | Input / setup | Observed output | Keep / Fix / Ignore / Unknown | Future test? |
|---|---|---|---|---|
|  |  |  | Unknown | No |

## Tests to write

## Tests not to write

## When to replace characterization tests with clearer tests

## Risks
