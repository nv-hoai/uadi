---
name: uadi
description: Design intelligence for AI agents. Understand products, reason about UX, explore design directions, create specifications and build better interfaces.
---

# UADI — Design Intelligence

Use UADI when the user asks you to design, improve, review or prototype a product experience or interface.

## Start here
Read this file, then read [Design Intelligence](docs/DESIGN-INTELLIGENCE.md). Load only the relevant workflow or reference when needed. Do not make the user configure UADI infrastructure.

## Default behavior
1. **Understand the task.** Inspect the existing product, code, conventions and context before asking questions.
2. **Clarify only what matters.** Ask concise questions when missing information would materially change the design. Otherwise state reasonable assumptions and proceed.
3. **Reason about users and outcomes.** Identify user needs, primary tasks, business goals, constraints and likely friction.
4. **Make design decisions.** Choose patterns based on the problem, not habit. Explain important rationale and trade-offs.
5. **Explore when valuable.** For substantial or ambiguous work, propose 2–3 genuinely different directions. For small changes, do not manufacture alternatives.
6. **Specify before complex implementation.** Capture structure, hierarchy, content, states, responsive behavior and interactions in UDS when it improves clarity or reuse.
7. **Build and inspect.** Use the host agent's normal tools and project conventions. Preview the result when possible.
8. **Evaluate and improve.** Review usability, hierarchy, consistency, accessibility, responsiveness and edge cases. Fix meaningful issues before handing off.

## Design principles
- Solve the user's problem before decorating the interface.
- Prefer clear information hierarchy and purposeful simplicity.
- Make primary actions obvious and secondary actions quiet.
- Design empty, loading, error, success and disabled states—not only the happy path.
- Use realistic content; avoid placeholder-heavy layouts.
- Respect the project's existing design system unless there is a reason to improve it.
- Make responsive behavior intentional.
- Accessibility is part of design quality, not a final cosmetic pass.
- Explain uncertainty; do not invent user research or claim unperformed tests.

## Practical UX reasoning
For substantial journeys or complex screens, use the [UX Reasoning Playbook](intelligence/UX-REASONING-PLAYBOOK.md). Consult the [pattern library](intelligence/patterns/README.md) when a pattern matches the user problem; adapt it to context rather than copying it mechanically. Keep small tasks lightweight.

## Working with artifacts
Use UDS, schemas, templates and the component catalog when they help preserve intent or consistency. Do not create every possible artifact for a trivial task. Keep useful project decisions in the repository so another agent or session can continue.

## Human direction
The user owns product and design decisions. Present consequential trade-offs and ask for direction when needed. Never claim the user approved something they did not approve.

## Validation
Use the lightweight checklist in [QUALITY-GATES.md](docs/QUALITY-GATES.md) as a review aid. Run schema, build, browser or accessibility checks when relevant and available. Report what was actually checked; never imply that a checklist or test passed without running it.

## Portability
Use the host agent's existing filesystem, terminal, editor and preview tools. Do not require a specific model, framework, backend, database, MCP server or hosted UADI service.
