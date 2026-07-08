# Risk scaling

Use the lightest safe process.

## Level 0: Tiny change

Examples:

- Text typo.
- Small CSS tweak.
- Obvious one-line display issue.

Required:

- Short issue note.
- Change summary.
- Basic verification evidence.

## Level 1: Small local change

Examples:

- Isolated component bug.
- Minor UI behavior.
- Small validation change.

Required:

- Issue brief.
- Repro notes.
- Implementation notes.
- Verification checklist.

## Level 2: Medium cross-file change

Examples:

- State bug.
- API behavior change.
- Browser compatibility issue.
- Chrome extension message flow.
- Mobile screen flow.

Required:

- Mission Control.
- Investigation log.
- Problem statement.
- Implementation plan.
- Verification matrix.
- Session handoff.

## Level 3: High-risk change

Examples:

- Auth.
- Payments.
- Permissions.
- User data.
- Schema migration.
- External API.
- Production bug.
- App-store or extension release risk.

Required:

- Level 2 artifacts.
- Technical design.
- ADR when decisions are important.
- Threat model or privacy review when relevant.
- Release plan.
- Rollback and kill switch plan.
- Runbook.

## Level 4: Major refactor or platform change

Examples:

- Rewrite subsystem.
- Replace API.
- Split service.
- Database migration.
- Large architecture change.

Required:

- Level 3 artifacts.
- Current-state map.
- Target-state design.
- Migration plan.
- Phased refactor plan.
- Cleanup plan.
- Post-release validation.

## Critical incident

Examples:

- Outage.
- Data loss.
- Security vulnerability.
- Widespread production regression.

Required:

- Incident timeline.
- Mitigation plan.
- Root-cause analysis.
- Postmortem.
- Action item tracker.
- Regression tests.
- Monitoring updates.
