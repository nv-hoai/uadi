# UADI Design Intelligence Library

This directory contains the runtime reasoning modules, trigger-only risk cards and reference material. Read selectively; the goal is better decisions, not more documents.

## Runtime modules

Load only the module that answers the unresolved design question.

- [Product Context](modules/product-context.md) — users, goals, roles, rules, constraints and unknowns.
- [Flow and States](modules/flow-and-states.md) — journeys, branches, handoffs, edge cases, recovery and states.
- [Content and Consequences](modules/content-and-consequences.md) — labels, consequences, state messages and realistic data.
- [Visual Composition](modules/visual-composition.md) — direction, hierarchy, Principles of Art, responsive composition and visual states.
- [Alternatives and Trade-offs](modules/alternatives-and-tradeoffs.md) — when to explore, how to compare and how to record a decision.
- [Accessibility Review](modules/accessibility-review.md) — keyboard, semantics, visual access, states and honest reporting.

## Risk cards

Load one only when the task triggers it.

- [Billing changes](risks/billing-changes.md)
- [Permissions and destructive actions](risks/permissions-and-destructive.md)
- [Data freshness and comparison](risks/data-freshness.md)
- [Health and persuasive claims](risks/health-and-claims.md)
- [Ownership handover](risks/ownership-handover.md)

## Pattern library

Patterns are decision aids, not templates to apply blindly. Each explains when it fits, the user problem, interaction details, failure modes and a runnable example.

- [Pattern index](patterns/README.md)

## Reference playbooks

These preserve deeper rationale, worked traces and examples. They are **reference**, not the default runtime path. Load a section only when a module is not enough; do not read a full playbook by default.

- [Product Understanding](PRODUCT-UNDERSTANDING-PLAYBOOK.md)
- [UX Reasoning](UX-REASONING-PLAYBOOK.md)
- [Design Decisions](DESIGN-DECISIONS-PLAYBOOK.md)
- [Visual Design](VISUAL-DESIGN-PLAYBOOK.md)

## How to use the library

1. Identify the user goal, product context and unresolved design question.
2. Load one runtime module, plus one risk card when triggered.
3. Consult one pattern only if it addresses a diagnosed need.
4. Inspect the product and adapt to its language, data and conventions.
5. Review the complete flow, including failure, recovery, accessibility and responsive behavior.

A justified deviation is better than a familiar but mismatched interface.
