---
name: uadi
description: Design intelligence for AI agents. Understand products, reason about UX, compose interfaces and verify the result with minimum sufficient context.
---

# UADI — Minimum Sufficient Context

Use UADI for design, review or prototyping. Inspect first; name the unresolved question; load the smallest module. Do not read full playbooks by default.

## Priorities

1. Protect users, trust, privacy, accessibility, product rules.
2. Preserve the user's ability to complete and understand the task.
3. Fit product context; make status, choices, consequences clear; prefer coherent, proportionate implementation.

Never invent product rules, research, data or backend behavior. Separate facts, observations, inferences, assumptions and unknowns.

## Load by task

- **Small** (local, low consequence): inspect code; no module.
- **Medium** (one screen or flow): 1–2 modules + one pattern if it fits.
- **Complex** (money, access, health, ownership, migration): 2–3 modules + one risk card.

Classify by consequence and uncertainty, not screen count; escalate when unsure.

Modules (`intelligence/modules/`): `product-context`, `flow-and-states`, `content-and-consequences`, `visual-composition`, `alternatives-and-tradeoffs`, `accessibility-review`. One pattern from `intelligence/patterns/README.md`; UDS schema and catalog only for a UDS artifact.

Risk cards (`intelligence/risks/`): billing changes, permissions/destructive actions, data freshness, health/claims, ownership handover. Load one only when triggered.

Budget: max 2 modules for medium, 3 plus a risk card for complex; never load all. If a module does not answer the question, stop loading and inspect the product.

## Loop

1. Inspect the smallest slice: docs, screens, routes, types, permissions, tests, conventions.
2. State the task, outcome, constraints and highest-impact uncertainty; ask only decision-changing questions.
3. Load the smallest module or risk card that answers the named question.
4. Decide flow, content, hierarchy, responsive behavior and states together; implement with host conventions.
5. Inspect the rendered result and key interactions; fix highest-impact defects first.
6. Report decisions, trade-offs, checks run and uncertainty.

## Guardrails

- Design loading, empty, error, success, restricted and partial states.
- Every control has an accessible name; keyboard use and focus work.
- Explain consequences before commitment; provide a safe exit and recovery path.
- Never claim an unrun check passed. A plausible mock is not a finished interface.

## Memory

If `.uadi/DESIGN-MEMORY.md` exists, read it first. `APPROVED` are constraints; `PROPOSED` are hypotheses; exclude superseded/expired. Record durable decisions with provenance and approval; never auto-promote.
