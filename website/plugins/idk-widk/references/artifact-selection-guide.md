# Artifact selection guide

## Always useful

### Issue brief

Use for every meaningful task.

Sections:

- Title
- Type
- Risk
- Owner
- User impact
- Expected behavior
- Actual behavior
- Acceptance criteria
- Verification evidence

### Verification evidence

Use for every task.

Sections:

- Checks run
- Results
- What was not checked
- Remaining risk

## Debugging artifacts

### Investigation log

Use when the cause is not obvious.

Sections:

- Timeline
- Evidence
- Repro steps
- Environment
- Hypotheses
- Attempts
- Results
- Hypotheses eliminated
- Next experiment

### Debugging ledger

Use for repeated attempts.

Sections:

- Attempt number
- Hypothesis
- Change or check
- Result
- What changed in confidence

## Planning artifacts

### Problem statement

Use for ambiguous bugs or features.

Sections:

- User problem
- Business problem
- Technical problem
- Scope
- Non-scope
- Success criteria
- Assumptions
- Open questions

### Technical design

Use for high-risk or architecture-impacting work.

Sections:

- Context
- Goals
- Non-goals
- Current state
- Proposed design
- Alternatives considered
- Tradeoffs
- Data model
- API or contract changes
- State and permissions
- Error handling
- Observability
- Test strategy
- Rollout
- Rollback
- Risks
- Open questions

### ADR

Use for important decisions.

Sections:

- Status
- Context
- Decision
- Alternatives
- Consequences
- Risks
- Follow-up

## Build artifacts

### Implementation plan

Use before non-trivial code changes.

Sections:

- Work slices
- File or module ownership
- Dependencies
- Tests per slice
- Rollback points
- Review order
- Done criteria

### Refactor plan

Use before broad structure changes.

Sections:

- Behavior to preserve
- Current structure
- Target structure
- Slices
- Characterization tests
- Migration path
- Rollback
- Cleanup

## Safety artifacts

### Threat model

Use for auth, permissions, secrets, public deployment, user data, or integrations.

Sections:

- Assets
- Actors
- Trust boundaries
- Entry points
- Abuse cases
- Threats
- Mitigations
- Residual risk
- Security tests

### Privacy review

Use when data is collected, stored, shared, logged, exported, or deleted.

Sections:

- Data types
- Purpose
- Access
- Retention
- User visibility
- Third parties
- Logs
- Deletion
- Risks
- Mitigations

## Release artifacts

### Release plan

Use for user-visible, risky, staged, app-store, extension, or production releases.

Sections:

- Owner
- Scope
- Environments
- Rollout stages
- Go/no-go criteria
- Monitoring
- Communication
- Support readiness
- Rollback

### Rollback and kill switch plan

Use for high-risk work.

Sections:

- Trigger
- Exact rollback path
- Kill switch path
- Data consequences
- Owner
- Validation after rollback

### Runbook

Use when support or on-call may need to respond.

Sections:

- Symptoms
- Dashboards
- Diagnosis
- Mitigation
- Rollback
- Escalation
- Known failure modes

## Learning artifacts

### Postmortem

Use for incidents, severe regressions, data loss, security issues, or failed releases.

Sections:

- Summary
- Impact
- Timeline
- Detection
- Mitigation
- Root causes
- Contributing factors
- What went well
- What went poorly
- Where we got lucky
- Action items
- Owners
- Due dates


## Behavior archaeology / regression recovery

Use when a product used to behave correctly and now behaves differently. Required artifacts for Level 2 or higher: `BEHAVIOR_ARCHAEOLOGY_BRIEF.md`, `EVIDENCE_BEHAVIOR_TABLE.md`, `REGRESSION_ANALYSIS_REPORT.md`, `SPEC_EXTRACTION_CONTRACT.md`, and a characterization, golden master, visual, contract, or regression test plan as appropriate. Only `Keep` and `Fix` rows from the evidence table should become durable tests.
