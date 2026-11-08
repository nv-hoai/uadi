# Accessibility Review

**Load when:** the change adds interaction, navigation, forms, modals, data display or responsive behavior.

## Decision rules

1. Set scope: the flows, states and viewports you will actually inspect. State what you cannot test.
2. Review the rendered interface, not only source. Use keyboard, zoom/reflow and the accessibility tree where tools permit.
3. Keyboard: every action reachable, logical order, visible focus, no traps, Escape closes overlays, focus returns to the trigger.
4. Semantics and names: one main landmark, sensible headings, labels associated with fields, accessible names on icon-only controls, errors linked to inputs, status announced.
5. Visual access: contrast, non-color status cues, 200% zoom/reflow, touch target size, readable line length and no clipped text.
6. States and recovery: loading, empty, error, success, disabled/restricted and focus states are perceivable and announced; no optimistic success before persistence.
7. Responsive and input modes: narrow viewport, touch, keyboard, reduced motion; content order remains understandable after stacking.
8. Record what was checked, with method and environment. Automated scans are not proof of accessibility.

## Failure modes

- Bare icon buttons with no accessible name.
- Placeholder-only labels.
- Color-only status or error.
- Focus lost after a dialog closes or content updates.
- Claiming WCAG compliance from an axe run alone.

## Validation

Can you complete the primary flow with the keyboard alone, understand every status without color, and recover from an error? If not tested, say so.

**Source:** distilled from `docs/ACCESSIBILITY-AND-INTERACTION-REVIEW.md`.
