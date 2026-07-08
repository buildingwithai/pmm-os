# Test Oracles and Behavior Contracts

A test oracle is the source of truth used to decide whether output is acceptable.

For regression recovery, the oracle is often mixed:

- Historical oracle: old behavior.
- Spec oracle: written requirement or acceptance criteria.
- User oracle: product owner/user decision.
- Visual oracle: screenshot or design reference.
- Log/trace oracle: runtime behavior evidence.
- Statistical/eval oracle: metrics or model evaluation for AI features.

The safest contract is built from multiple sources and includes confidence levels.

## Contract fields

- Behavior name.
- User value.
- Preconditions.
- Trigger.
- Expected result.
- Exceptions.
- Non-goals.
- Evidence sources.
- Classification: Keep, Fix, Ignore, Unknown.
- Test mapping.
- Reviewer or product owner.

## Warning

A characterization test can document actual behavior even when that behavior is wrong. Treat characterization as discovery first, contract second.
