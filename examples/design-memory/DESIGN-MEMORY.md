# Design memory — harbor-studio

Updated: 2026-11-08T00:00:00.000Z · Active approved entries: 4

Approved entries are constraints. Proposed entries are hypotheses, not requirements. Superseded and expired entries are excluded.

## Constraints

- **DM-001** Only workspace owners can change billing or cancel the subscription. — Role model in the product brief; members may view plan details only. (OWNER: product-brief.md#roles)

## Decisions

- **DM-002** [FEATURE: subscription-settings] Cancellation lives in its own section with a consequence review, separate from routine settings. — Prevents accidental cancellation and makes the end-of-access date explicit. (OWNER: design-review-2026-11-04)

## Rejected directions

- **DM-003** [FEATURE: subscription-settings] Do not use a monthly/annual price toggle as the commitment control. — The toggle looks like it changes billing before the user confirms; use a review step instead. (OWNER: design-review-2026-11-04)

## Open questions

- **DM-004** [FEATURE: subscription-settings] What happens when a workspace above the Free seat limit cancels? — The product rule is unknown; do not invent a downgrade path or data-retention behavior. (REPO: product-brief.md#limits)

## Proposed — not constraints

- **DM-005** Consider annual billing for the Pro plan later; no decision has been made.

_Generated from `design-memory.json`; do not edit this brief by hand._
