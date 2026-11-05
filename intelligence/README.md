# UADI Design Intelligence Library

This directory contains practical reasoning methods and reusable UX patterns for AI agents.

## Start with the playbook

Read [UX Reasoning Playbook](UX-REASONING-PLAYBOOK.md) when a task involves a meaningful user journey, a complex screen, multiple states or consequential decisions. For a small, local UI change, use judgment and keep the process lightweight.

## Pattern library

Patterns are decision aids, not templates to apply blindly. Each pattern explains when it fits, when it does not, the user problem it addresses, interaction details and common failure modes.

- [Settings information architecture](patterns/settings-information-architecture.md)
- [Permission-aware actions](patterns/permission-aware-actions.md)
- [Destructive actions](patterns/destructive-actions.md)
- [Status, empty states and recovery](patterns/status-and-recovery.md)

## How to use the library

1. Identify the user goal and the context.
2. Find a pattern that addresses the underlying problem.
3. Check its applicability and trade-offs.
4. Adapt it to the product's language, data, constraints and existing design system.
5. Review the complete flow, including failure and recovery.

Do not force a listed pattern when the product context calls for another solution. A justified deviation is better than a familiar but mismatched interface.
