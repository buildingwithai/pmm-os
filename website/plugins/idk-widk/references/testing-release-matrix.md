# Testing and release matrix

## Match test type to risk

| Change type | Minimum verification |
|---|---|
| Copy or visual tweak | Manual check, screenshot if useful |
| Isolated component | Unit test or component test, manual check |
| State flow | Unit tests, integration test, manual flow |
| API behavior | Unit tests, contract tests, integration tests |
| Auth or permissions | Auth tests, negative tests, manual role checks |
| Data migration | Migration test, rollback test, validation query |
| Chrome extension | Manifest check, content script test, service worker or background flow, message passing, permissions |
| Mobile app | Device or simulator check, permissions, lifecycle, offline or cache, platform version |
| Production release | Smoke test, monitoring, rollback, release notes |

## Verification status labels

- Passed
- Failed
- Blocked
- Not run
- Not applicable
- Risk accepted

## Release gates

Do not release high-risk work until:

- Acceptance criteria pass.
- Known high risks are mitigated or accepted.
- Rollback or kill switch is known.
- Monitoring exists.
- Support path is ready.
- Production validation plan exists.

## Production validation

Track:

- Error rate
- Crash rate
- Latency
- Conversion or task completion
- Support tickets
- Logs and alerts
- Data integrity
- Rollback triggers
