# Content and Consequences

**Load when:** labels, consequences, validation, empty states or state messages carry the decision.

## Decision rules

1. Inventory content by moment: entry, choice, consequence, action, confirmation, error, recovery. Write the content before fixing the layout.
2. Name the decision and the action in the user's language: a verb that completes "I want to…", not an internal system term.
3. State who, what, when, cost and reversibility **before** commitment. Put the trial length, price, deadline and cancellation rule next to the action, not only in fine print.
4. Make state messages answer: what happened, what it means, what the user can do next. Distinguish not allowed, not available yet, failed, and nothing here.
5. Keep units, dates, limits and values exact. Say when a value is estimated, stale or unavailable; never imply precision the system does not have.
6. Write for realistic and awkward data: long names, zero/one/many, missing values, translation length and narrow screens.

## Failure modes

- "Submit", "Continue" or "Error" without the actual consequence.
- A destructive warning that is weaker than the routine action beside it.
- Success copy that claims persistence, payment or delivery before confirmation.
- Fine print holding the price, deadline or cancellation rule.

## Validation

Can a user answer "what happens if I do this, when, at what cost, and can I undo it?" from the visible copy? Read the primary flow aloud with realistic data.

**Source:** distilled from `intelligence/UX-REASONING-PLAYBOOK.md` (content sections).
