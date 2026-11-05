# Workflow: Discover

## Purpose
Create a trustworthy snapshot of what is known, assumed, and still unknown before design decisions are made.

## Procedure
1. Read README, product docs, existing .uadi artifacts, relevant source code, and current feature context before asking questions.
2. Extract confirmed facts with provenance. Never promote an inference to a fact.
3. Record assumptions separately, including confidence and impact.
4. Identify unknowns and rank them by their impact on UX, scope, architecture, accessibility, and business outcomes.
5. Ask concise questions only for high-impact gaps. Bundle closely related questions only when it reduces effort.
6. If the owner chooses to proceed, record accepted assumptions explicitly.
7. Produce a DiscoveryResult and validate it against schemas/discovery-result.schema.json.

## Readiness
- READY: no material unknown blocks analysis.
- READY_WITH_ASSUMPTIONS: proceed only with clearly documented assumptions.
- BLOCKED: one or more high-impact unknowns require owner input.

## Guardrails
Do not ask for information already present. Do not invent research, analytics, personas, or customer evidence. Do not choose the visual direction during discovery.
