# Design Quality Checklist

Use this checklist to improve design outcomes. It is a reasoning aid, not a mandatory release pipeline; adapt it to the scope and risk of the task.

## Product and UX

- Is the target user and their primary goal understood?
- Does the design support the most important user task directly?
- Is the primary task flow mapped from trigger to confirmed outcome, including handoffs and recovery?
- Are high-impact edge cases identified and either handled, explained or explicitly out of scope?
- Is the information architecture understandable?
- Are important decisions, friction points and assumptions visible?
- Is content written in the user's language, with consequences, units and next steps where they matter?
- Do state messages say what happened, what it means and what the user can do next?
- Are empty, loading, error, success and disabled states considered?
- Are materially different alternatives compared on the same criteria, with must-pass gates and uncertainty visible?
- Does the rationale state the decision, evidence, rejected alternatives and who bears each trade-off?

## Visual and interaction quality

- Is the hierarchy clear at a glance?
- Are typography, spacing, color and alignment intentional and consistent?
- Are primary and secondary actions distinguishable?
- Is content realistic, concise and useful?
- Do interactions provide clear feedback?
- Does the visual language fit this product rather than defaulting to a generic template?

## Accessibility and responsive behavior

- Is the interface usable with keyboard navigation, visible focus and no traps?
- Are semantics, names, labels, contrast and focus states appropriate?
- Every icon-only or image-only control exposes an accessible name that matches its action (for example `aria-label="Delete project"`). A bare button containing only an icon or glyph is never acceptable; an unlabeled interactive element is a critical defect, not a minor nit.
- Does the layout work at relevant viewport sizes, zoom and reflow?
- Are touch targets and text sizes usable?
- Have motion and other potentially exclusionary patterns been considered?
- Was assistive technology tested where available, and are untested areas disclosed?

For a deeper review, use the [Accessibility and Interaction Review](ACCESSIBILITY-AND-INTERACTION-REVIEW.md). An automated scan is not proof of accessibility.

## Implementation quality

- Does the implementation follow the existing project conventions?
- Are existing components and tokens reused appropriately?
- Does the prototype build and run when execution tools are available?
- Were important flows and states inspected?
- Are any known limitations or untested areas disclosed?

## Lightweight technical validation

Run only checks relevant to the change:
- Schema validation when structured UDS or other artifacts are created. For UDS, use the bundled `schemas/design-specification.schema.json` and `component-catalog/catalog.json`; the `npm run validate` command is available in the UADI repository, not automatically in host projects.
- Typecheck/build when implementation code changes.
- Browser or component tests when interactions or layout change.
- Accessibility tooling when available.
- Visual comparison when a meaningful baseline exists.

Never claim a check passed unless it was actually run. Prefer the project's existing test and review process over adding a new release mechanism.
