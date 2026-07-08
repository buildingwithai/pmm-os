# Task classification taxonomy

Classify before acting.

## Work type

- Bug
- Regression
- Feature
- UX change
- Performance issue
- Security issue
- Privacy issue
- Data issue
- Build or dependency issue
- Environment issue
- Refactor
- Migration
- Release issue
- Production incident
- Unknown

## Product surface

- Web app
- Chrome extension
- Mobile app
- Backend
- API
- Database
- Data pipeline
- Internal tool
- CLI
- Multi-surface
- Unknown

## Failure shape

- Does not start
- Build fails
- Test fails
- Runtime crash
- UI wrong
- State wrong
- API wrong
- Data wrong
- Permission wrong
- Performance degraded
- Works locally but not deployed
- Works for one user or device but not another
- Intermittent or flaky
- Unknown

## Evidence quality

- Reproducible
- Intermittent
- Reported by user but not reproduced
- Inferred from logs
- Speculative
- Unknown

## Recommended first move

- If reproducible: inspect the smallest failing path.
- If intermittent: add instrumentation and compare known good vs bad cases.
- If vague feature: define success and non-scope.
- If high risk: create design and rollback plan before coding.
- If context is long: update Mission Control and create a handoff.
