# Research synthesis: vibe-coder failure modes

This plugin was designed around two bodies of evidence:

1. Established software engineering practices: secure development, testing, release engineering, incident review, architecture decision records, risk-based lifecycle practices, and delivery metrics.
2. Observed vibe-coding failure modes from community discussions, especially Reddit threads where non-engineers and AI-assisted builders describe what breaks in practice.

## Repeated community patterns

The same problems appear repeatedly:

- Maintenance wall: prototypes are easy, but fixes and extensions become fragile when the user does not understand the codebase.
- Prompt-loop debugging: users keep prompting until something works, sometimes for hours, without a disciplined debugging process.
- Context pollution: repeated failed attempts can cause the agent to tunnel on its own earlier mistakes.
- Side-quest drift: a small bug reveals another issue, then another, and the original objective is forgotten.
- Feature creep: AI makes features feel free, so projects accumulate behavior faster than the owner can understand or test.
- Refactor hell: modularizing or splitting generated code can break the app when behavior was not mapped first.
- Code degradation: AI subtly breaks established patterns, introduces anti-patterns, or builds on unstable changes.
- Missing tests: users cannot tell whether a fix works beyond the immediate visible symptom.
- Weak release discipline: there is no rollback plan, kill switch, monitoring, or production validation.
- Security and privacy gaps: public defaults, missing auth, leaked private data, exposed logs, and misunderstood permissions.
- Lack of durable context: no Mission Control, session handoff, or permanent project instructions.

## Design response

This plugin responds with:

- Task classification before coding.
- Risk scaling so small bugs stay lightweight and high-risk work gets rigor.
- Mission Control to preserve the original objective.
- Side Quest Governor to classify new issues as blocking, parked, or discarded.
- Beginner Engineering Coach to make senior engineering legible to non-engineers.
- Debugging Governor to prevent endless prompt loops.
- Artifact Generator to create the right documents with strong sections.
- Refactor Safety to prevent broad unsafe rewrites.
- Security and Privacy Guardrails for auth, data, secrets, and public exposure.
- Verification and Release discipline before claiming success.

## Sources to review

- OpenAI Codex skills docs: https://developers.openai.com/codex/skills
- OpenAI Codex plugins docs: https://developers.openai.com/codex/plugins
- OpenAI Codex plugin build docs: https://developers.openai.com/codex/plugins/build
- OpenAI Codex best practices: https://developers.openai.com/codex/learn/best-practices
- OpenAI Codex AGENTS.md docs: https://developers.openai.com/codex/guides/agents-md
- NIST SSDF: https://csrc.nist.gov/projects/ssdf
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Google SRE postmortem culture: https://sre.google/sre-book/postmortem-culture/
- Google SRE canarying releases: https://sre.google/workbook/canarying-releases/
- DORA metrics: https://dora.dev/guides/dora-metrics/
- Reddit threads in r/vibecoding, r/ChatGPTCoding, and r/cursor about maintenance, prompt-loop debugging, technical debt, refactor hell, and AI code degradation.
