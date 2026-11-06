---
name: uadi
description: Design intelligence for AI agents. Understand products, reason about UX, explore design directions and create better interfaces.
---

# UADI — Design Intelligence

Use UADI when the user asks you to design, improve, review or prototype a product experience or interface.

## Start here
Read this file, then [Design Intelligence](docs/DESIGN-INTELLIGENCE.md). For substantial or unfamiliar work, load the relevant playbooks from `intelligence/`: product understanding before UX decisions, UX reasoning for journeys and interaction, and visual design before implementation. Consult only relevant patterns. Do not make the user configure UADI infrastructure.

## Default behavior
1. **Understand the product.** Inspect relevant product docs, current UI, routes, domain types, permissions, tests and design conventions before asking questions. Build a compact model of users, jobs, product rules and success outcomes.
2. **Separate evidence.** Distinguish confirmed facts, observed implementation, assumptions and unknowns. Never invent research, analytics, business policies or backend behavior.
3. **Clarify only what matters.** Ask concise questions when missing information would materially change the experience. Otherwise state a reasonable assumption and proceed.
4. **Reason about users and outcomes.** Identify the real user task, business goal, constraints, decision points, friction and recovery paths.
5. **Make design decisions.** Choose patterns based on the problem, not habit. Explain important rationale and trade-offs.
6. **Explore when valuable.** For substantial or ambiguous work, propose 2–3 genuinely different directions. For small changes, do not manufacture alternatives.
7. **Design the visual experience.** Establish hierarchy, composition, typography, spacing, color roles and responsive behavior that fit the product and content. Avoid generic dashboard or card-heavy defaults.
8. **Specify before complex implementation.** Capture structure, hierarchy, content, states, responsive behavior and interactions in UDS when it improves clarity or reuse.
9. **Build and inspect.** Use the host agent's normal tools and project conventions. Preview the actual result when possible; inspect narrow and wide layouts and important interactions.
10. **Evaluate and improve.** Review usability, visual hierarchy, consistency, accessibility, responsiveness and edge cases. Fix meaningful issues before handoff.

## Billing cadence and consequential changes

- Distinguish a **display-only pricing comparison** from a change to the user's active billing cadence. Label comparison controls plainly (for example, "Compare monthly and annual prices") and state that browsing prices does not change the subscription.
- Never imply that changing a display toggle commits a subscription change. The active plan, billing cadence, renewal date and committed price must remain unchanged until the user completes an explicit change flow.
- A real billing-cadence change is consequential: route it through a review-and-confirm step before committing. The review must show the exact new recurring price and interval, any prorated charge or credit (including zero when applicable), the effective date, the next renewal date and any relevant term change. If exact proration or dates are unavailable, say so and do not present the change as ready to confirm.
- Example: a "Compare monthly / annual" toggle may reprice plan-comparison cards but must be labeled as a preview and must not mutate the active subscription. A separate "Change billing cadence" action opens a review showing the exact amount, proration and effective date; only explicit confirmation submits the change. After success, update the active subscription summary from the confirmed result, not from the preview toggle.

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

## Practical reasoning
- Use [Product Understanding](intelligence/PRODUCT-UNDERSTANDING-PLAYBOOK.md) when the product, users, roles or business rules are unclear.
- Use the [UX Reasoning Playbook](intelligence/UX-REASONING-PLAYBOOK.md) for meaningful journeys, complex screens or consequential interactions.
- Use [Visual Design](intelligence/VISUAL-DESIGN-PLAYBOOK.md) when setting or improving visual direction and composition.
- Consult the [pattern library](intelligence/patterns/README.md) when a pattern matches the user problem; adapt it to context rather than copying it mechanically.
- Keep small tasks lightweight; do not produce every artifact or run every checklist for a minor change.

## Working with artifacts
Use UDS and the bundled schemas and component catalog when they help preserve intent or consistency. The installer places these contracts under the skill directory (`schemas/` and `component-catalog/`); a minimal valid UDS example is available at `examples/minimal/design-specification.json`. Validate from the UADI repository with `npm run validate -- <artifact.json>`; in a host project, use its available JSON Schema validator and the bundled schema. Do not assume the host project has UADI scripts or dependencies. Do not create every possible artifact for a trivial task. Keep useful project decisions in the repository so another agent or session can continue.

## Human direction
The user owns product and design decisions. Present consequential trade-offs and ask for direction when needed. Never claim the user approved something they did not approve.

## Validation
Use the lightweight checklist in [QUALITY-GATES.md](docs/QUALITY-GATES.md) as a review aid. Run schema, build, browser or accessibility checks when relevant and available. Report what was actually checked; never imply that a checklist or test passed without running it.

## Portability
Use the host agent's existing filesystem, terminal, editor and preview tools. Do not require a specific model, framework, backend, database, MCP server or hosted UADI service.
