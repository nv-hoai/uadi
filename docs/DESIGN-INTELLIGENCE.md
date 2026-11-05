# UADI Design Intelligence

UADI exists to improve the design decisions an AI agent makes—not to add process for its own sake.

## 1. Product understanding

Start by inspecting the relevant product evidence: product documentation, existing screens, domain types, routes, permissions, tests, content and design conventions. Understand the user, their situation, the job they need to complete, the product's value, important domain rules and what success means.

Separate confirmed facts from observed implementation, assumptions and unknowns. Existing UI is evidence of current behavior, not proof of intended behavior. Do not invent research, analytics or business policy. Ask only questions whose answers could materially change the design.

Use the [Product Understanding Playbook](../intelligence/PRODUCT-UNDERSTANDING-PLAYBOOK.md) when product context or domain rules are unclear.

## 2. UX reasoning

For substantial tasks, use the practical [UX Reasoning Playbook](../intelligence/UX-REASONING-PLAYBOOK.md) and select contextual guidance from the [pattern library](../intelligence/patterns/README.md). These are decision aids, not mandatory templates.

Reason from user goals through tasks and interaction:

- What does the user need to know at this moment?
- What is the primary task and next best action?
- What decisions or cognitive load are being imposed?
- Where can confusion, delay, error or abandonment occur?
- What happens for empty, loading, error, success and edge states?
- Does the flow support accessibility and different viewport sizes?

Prefer fixing root causes over adding UI decoration.

## 3. Design judgment

A good design decision is contextual and explainable.

When comparing directions, describe:
- The core idea and intended user benefit.
- Why it fits the product and audience.
- Key trade-offs and risks.
- What is deliberately excluded.
- What evidence or feedback would change the decision.

Offer multiple directions when they represent real strategic or interaction differences—not superficial color variations. Recommend one when the available context supports a clear choice.

## 4. Visual intelligence

Use visual choices to communicate meaning and hierarchy. Establish a clear information and action hierarchy; use deliberate typography, spacing and alignment; assign semantic color roles; balance density with scanning; and use composition, grouping and contrast to clarify relationships.

Fit the visual language to the product, audience, content and task. Avoid generic dashboard aesthetics, repetitive card grids and decorative effects that compete with information. Make responsive adaptation intentional rather than merely shrinking desktop layouts.

Use the [Visual Design Playbook](../intelligence/VISUAL-DESIGN-PLAYBOOK.md) when setting a direction or improving composition. Inspect the rendered interface when preview tools are available; source review alone cannot verify visual behavior.

## 5. Design execution

Translate reasoning into a usable result:

1. Define the information architecture and primary flow.
2. Specify layout, content hierarchy, components and interactions.
3. Include important states and responsive behavior.
4. Reuse the project's components and tokens where appropriate.
5. Implement using the project's framework and conventions.
6. Inspect the rendered result and correct visible or interaction problems.

UDS is useful when intent needs to be preserved, compared or reused. It is not paperwork required for every small UI change.

## 6. Learning from feedback

Treat feedback as information about user needs and design fit. Classify it as a correction, preference, new constraint or changed requirement. Update the current work and preserve durable project-level patterns only when they are genuinely reusable.

## Decision priority

When trade-offs arise, prioritize:

1. User task success and comprehension.
2. Product fit and consistency with user expectations.
3. Accessibility and inclusive interaction.
4. Clear visual hierarchy and interaction feedback.
5. Maintainability and implementation simplicity.
6. Decorative novelty.

## What good looks like

A strong UADI result should make it easier to answer:
- Why is this the right experience for these users?
- Which product facts and rules support the design?
- What user problem does each important element solve?
- What alternatives were considered?
- What trade-offs were accepted?
- How does the interface behave outside the happy path?
- Was the rendered result inspected, and what was actually validated?
