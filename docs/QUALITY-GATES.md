# Design Quality Checklist

This checklist helps an agent and human reviewer improve design outcomes. It is not a mandatory release pipeline, does not require signed attestations, and does not need all items for every small task.

## Product and UX

- Is the target user and their primary goal understood?
- Does the design support the most important user task directly?
- Is the information architecture understandable?
- Are important decisions, friction points and assumptions visible?
- Are empty, loading, error, success and disabled states considered?

## Visual and interaction quality

- Is the hierarchy clear at a glance?
- Are typography, spacing, color and alignment intentional and consistent?
- Are primary and secondary actions distinguishable?
- Is content realistic, concise and useful?
- Do interactions provide clear feedback?
- Does the visual language fit this product rather than defaulting to a generic template?

## Accessibility and responsive behavior

- Is the interface usable with keyboard navigation?
- Are semantics, labels, contrast and focus states appropriate?
- Does the layout work at relevant viewport sizes?
- Are touch targets and text sizes usable?
- Have motion and other potentially exclusionary patterns been considered?

## Implementation quality

- Does the implementation follow the existing project conventions?
- Are existing components and tokens reused appropriately?
- Does the prototype build and run when execution tools are available?
- Were important flows and states inspected?
- Are any known limitations or untested areas disclosed?

## Lightweight technical validation

Run only checks relevant to the change:
- Schema validation when structured UDS or other artifacts are created.
- Typecheck/build when implementation code changes.
- Browser or component tests when interactions or layout change.
- Accessibility tooling when available.
- Visual comparison when a meaningful baseline exists.

Never claim a check passed unless it was actually run. A checklist is a reasoning aid, not proof of execution.

## Advanced assurance (optional)

Teams with stricter release requirements may separately adopt the advanced runtime utilities, evidence ledger, signed attestations, ten-gate release contract and continuous governance documentation. These are optional extensions and are not prerequisites for using UADI.
