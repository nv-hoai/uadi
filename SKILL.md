---
name: uadi
description: Design intelligence for AI agents. Understand products, reason about UX, explore design directions and create better interfaces.
---

# UADI — Design Intelligence

Use UADI when the user asks you to design, improve, review or prototype a product experience or interface.

## Start here
Read the [canonical Design Intelligence core](docs/DESIGN-INTELLIGENCE.md). It is the source of truth for durable principles and trade-off priorities. For substantial or unfamiliar work, load only the relevant methods from `intelligence/`: Product Understanding for unclear product context, UX Reasoning for journeys and interactions, Design Decisions for alternatives and trade-offs, and Visual Design for composition. Consult patterns selectively. Do not make the user configure UADI infrastructure.

## Operating loop
1. Inspect the smallest relevant slice of the existing product: docs, screens, routes, domain types, permissions, tests and design conventions.
2. Establish the user's real task, desired outcome and constraints before choosing an interface.
3. Separate supplied facts, observed behavior, inferences, assumptions and unknowns. Never invent research, analytics, policy or backend behavior.
4. Ask only questions whose answers could materially change the design; otherwise state a proportionate assumption and proceed.
5. Identify the highest-impact task, comprehension, trust and accessibility risks. Prioritize root causes over cosmetic symptoms.
6. Choose a context-appropriate interaction model and pattern. Explore distinct alternatives only when the problem is substantial or ambiguous.
7. Design the task flow, content, hierarchy, visual composition, responsive behavior and important states as one experience.
8. Implement using the host project's conventions. Use UDS when it helps preserve, compare or reuse intent—not as mandatory paperwork.
9. Inspect the rendered result and exercise consequential interactions when tools are available. Fix the highest-impact defects first.
10. Report decisions, trade-offs, checks actually performed and remaining uncertainty.

## Consequential billing changes
- Distinguish a display-only pricing comparison from a change to the active billing cadence. Label comparison controls plainly and state that browsing prices does not change the subscription.
- Never imply that a display toggle commits a subscription change. The active plan, cadence, renewal date and committed price remain unchanged until an explicit change flow is completed.
- Route a real billing-cadence change through review and confirmation. Show the exact recurring price and interval, any prorated charge or credit (including zero when applicable), effective date, next renewal date and relevant term change. If exact proration or dates are unavailable, say so and do not present the change as ready to confirm.
- After success, update the active subscription summary from the confirmed result, not from a preview toggle.

## Guidance and validation
- [Product Understanding](intelligence/PRODUCT-UNDERSTANDING-PLAYBOOK.md): investigate product, users, roles, domain rules and constraints.
- [UX Reasoning](intelligence/UX-REASONING-PLAYBOOK.md): map task flows, decisions, handoffs, edge cases, content, states and recovery.
- [Design Decisions](intelligence/DESIGN-DECISIONS-PLAYBOOK.md): explore materially different directions, compare them and explain rationale and trade-offs.
- [Visual Design](intelligence/VISUAL-DESIGN-PLAYBOOK.md): establish hierarchy, composition, density and visual consistency.
- [Pattern library](intelligence/patterns/README.md): select and adapt a solution only when its context fits.
- [Quality gates](docs/QUALITY-GATES.md): choose checks relevant to the change; never claim an unrun check passed.
- [Accessibility and interaction review](docs/ACCESSIBILITY-AND-INTERACTION-REVIEW.md): review keyboard, semantics, states, responsive behavior and assistive technology honestly.

Use the host agent's normal tools and project conventions. Validate UDS with the bundled schema when relevant; the `npm run validate` command is available in the UADI repository, not automatically in host projects. Do not assume the host project has UADI scripts or dependencies.

For UDS, use the bundled schemas and component catalog when installed under the skill directory (`schemas/` and `component-catalog/`). A minimal valid example is available at `examples/minimal/design-specification.json`. Do not create a specification for a trivial change; preserve useful decisions in the host project when another agent or session needs them.

## Human direction and portability
The user owns product and design decisions. Present consequential trade-offs and ask for direction when needed; never infer approval from silence. Keep useful project decisions in the repository when appropriate. Use the host agent's existing filesystem, terminal, editor and preview tools. Do not require a specific model, framework, backend, database, MCP server or hosted UADI service.
