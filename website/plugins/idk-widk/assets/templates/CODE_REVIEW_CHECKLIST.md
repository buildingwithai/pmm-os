# Code Review Checklist: {{WORK_NAME}}

## Scope

- [ ] Diff matches the plan.
- [ ] No unrelated files changed.
- [ ] No silent refactor.

## Correctness

- [ ] Happy path covered.
- [ ] Edge cases covered.
- [ ] Failure path covered.
- [ ] Original bug path covered if this is a bug.

## Maintainability

- [ ] Names are clear.
- [ ] Logic is not duplicated.
- [ ] No unnecessary abstraction.
- [ ] No unnecessary dependency.

## Security and Privacy

- [ ] Auth and authorization checked if relevant.
- [ ] Secrets not exposed.
- [ ] Logs do not leak sensitive data.
- [ ] Public visibility and permissions checked.

## Verification

- [ ] Tests run.
- [ ] Manual flow checked if needed.
- [ ] Known gaps documented.
