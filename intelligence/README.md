# UADI Design Intelligence Library

This directory contains practical reasoning methods and reusable UX patterns for AI agents. Read selectively; the goal is better decisions, not more documents.

## Start with the problem

- [Product Understanding Playbook](PRODUCT-UNDERSTANDING-PLAYBOOK.md) — build a grounded model of users, product value, domain rules and constraints before choosing UI.
- [UX Reasoning Playbook](UX-REASONING-PLAYBOOK.md) — map task flows, handoffs, friction, edge cases, content, information architecture and interaction states.
- [Design Decisions Playbook](DESIGN-DECISIONS-PLAYBOOK.md) — explore materially different directions, compare them fairly and explain rationale and trade-offs.
- [Visual Design Playbook](VISUAL-DESIGN-PLAYBOOK.md) — turn task priority and product character into hierarchy, composition and a coherent visual system.

For a small local change, inspect the relevant code and existing conventions; do not run every playbook end to end.

## Pattern library

Patterns are decision aids, not templates to apply blindly. Each pattern explains when it fits, the user problem it addresses, interaction details, common failure modes and a runnable implementation example.

- [Settings information architecture](patterns/settings-information-architecture.md)
- [Permission-aware actions](patterns/permission-aware-actions.md)
- [Destructive actions](patterns/destructive-actions.md)
- [Status, empty states and recovery](patterns/status-and-recovery.md)
- [Data tables and filtering](patterns/data-tables-and-filtering.md)
- [Forms and validation](patterns/forms-and-validation.md)

## How to use the library

1. Identify the user goal and product context.
2. Read only the playbook or pattern relevant to the design risk.
3. Check applicability and trade-offs; do not copy a pattern mechanically.
4. Adapt it to product language, real data, constraints and the existing design system.
5. Review the complete flow, including failure, recovery and responsive behavior.

A justified deviation is better than a familiar but mismatched interface.
