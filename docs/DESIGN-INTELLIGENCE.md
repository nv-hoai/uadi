# UADI Design Intelligence — Canonical Core

UADI improves design decisions and delivered interfaces. This document is the single source of truth for its durable principles. Playbooks explain how to apply them; patterns offer contextual solutions; examples demonstrate them; benchmarks test their value.

## Principles

1. **Start with the outcome.** Design for the user's real task and the product's legitimate purpose—not for the requested screen, feature list or visual novelty alone.
2. **Stay grounded in reality.** Base decisions on product rules, user context and inspectable evidence. Distinguish facts, observations, inferences, assumptions and unknowns. Never invent research, policy, data or system behavior.
3. **Make the next decision clear.** Give users the information, structure and feedback they need to understand their situation, choose confidently and make progress. Make consequences and recovery paths legible.
4. **Design the whole experience.** Treat content, interactions, states, permissions, edge cases and responsive behavior as one system. Do not optimize only the happy path or a single viewport.
5. **Include people by default.** Make accessibility, understandable language, keyboard use, readable hierarchy and inclusive behavior part of the design—not a finishing pass.
6. **Use purposeful craft.** Make visual hierarchy, composition and interaction serve meaning. Fit the product's context and design system; prefer coherence and simplicity over decoration, novelty or unnecessary complexity.
7. **Verify what matters.** Inspect the implemented experience and test consequential behavior when tools permit. State exactly what was checked, what remains uncertain and what evidence would change the decision.

## Resolve trade-offs

Use this order when choices conflict:

1. Protect users, trust, privacy, accessibility and valid product rules.
2. Preserve the user's ability to complete and understand the task.
3. Fit the product context and communicate status, choices and consequences clearly.
4. Prefer coherent, maintainable and proportionate implementation.
5. Add polish or novelty only when it strengthens the experience.

A lower priority never justifies violating a higher one. If a critical rule or user outcome is unknown, surface the uncertainty; do not silently invent an answer.

## Apply, don't recite

Use the smallest amount of process that can resolve the actual risk. Read the relevant [methods](../intelligence/README.md), select a [pattern](../intelligence/patterns/README.md) only when it fits, and use [quality gates](QUALITY-GATES.md) as focused checks. Do not copy these principles into task artifacts; show how a specific decision applies them.

For substantial decisions, preserve a concise chain:

**Evidence → user/task implication → problem → decision and trade-off → implementation → validation.**

For small, low-risk changes, local context plus a focused review is enough. More documentation is not evidence of better design.

## Related guidance

- [Agent entry point](../SKILL.md)
- [Product Understanding](../intelligence/PRODUCT-UNDERSTANDING-PLAYBOOK.md)
- [UX Reasoning](../intelligence/UX-REASONING-PLAYBOOK.md)
- [Design Decisions](../intelligence/DESIGN-DECISIONS-PLAYBOOK.md)
- [Visual Design](../intelligence/VISUAL-DESIGN-PLAYBOOK.md)
- [Pattern library](../intelligence/patterns/README.md)
- [Accessibility and interaction review](ACCESSIBILITY-AND-INTERACTION-REVIEW.md)
- [Benchmark protocol](BENCHMARKING.md)
