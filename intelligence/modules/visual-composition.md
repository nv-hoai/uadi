# Visual Composition

**Load when:** creating a screen, changing hierarchy or establishing a visual direction.

## Decision rules

1. Read context first: existing pages, tokens, typography, density, brand, real content and responsive behavior. Preserve a coherent system unless it conflicts with usability, accessibility or the goal.
2. Choose a visual direction with a reason tied to product character and task. Define tone, density, type scale, color roles, radius, elevation and motion.
3. Compose one focal area and an eye path: page title → primary fact → consequence → primary action → supporting detail. Use alignment and spacing before decoration.
4. Apply the Principles of Art as functional rules — **balance** (symmetrical for comparison, asymmetrical for a single task), **contrast** (strongest for the consequence and primary action), **emphasis** (one focal point), **movement** (no backtracking; mobile preserves order), **pattern/repetition** (same intent looks the same), **rhythm** (scan → pause → act → confirm), **unity** (one radius/elevation/status language across states).
5. Make hierarchy visible through type roles, spacing, grouping and surface contrast. Keep labels near values and actions near consequences. Use cards only when separation adds meaning.
6. Design responsive composition: reorder for the task, keep the primary action and deadline visible, and avoid horizontal overflow at narrow widths.
7. View default, loading, empty, error, success, restricted and focus states as one system.

## Failure modes

- Equal-weight cards, multiple filled primary buttons, every heading bold.
- A decorative hero or banner outranking the action.
- A mobile layout that is a shrunken desktop or buries the consequence.
- Invented components that do not belong to the product.

## Validation

Name the focal point, balance type and accent budget. Trace the eye path in the initial viewport and at 390×844. Confirm the same grammar across states. Inspect the rendered result; source review cannot prove spacing, clipping or contrast.

**Source:** distilled from `intelligence/VISUAL-DESIGN-PLAYBOOK.md`.
