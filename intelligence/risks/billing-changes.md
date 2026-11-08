# Risk Card: Billing Changes

**Trigger:** changing plan, cadence, seats, payment method, cancellation or a price comparison that could be mistaken for a commitment.

## Rules

- Separate a display-only comparison from a change to the active subscription. Label the comparison plainly: browsing prices does not change billing.
- Never imply that a toggle, selected card or preview commits a change. The active plan, cadence, renewal date and committed price stay unchanged until an explicit change flow completes.
- Before confirmation, show: exact recurring price and interval, proration or credit (including zero), effective date, next renewal date, term change and what happens to existing access.
- If exact proration, dates or eligibility are unavailable, say so and do not present the change as ready to confirm.
- Cancellation states the end-of-access date and whether the current period is refunded. Do not hide it behind support.
- After success, update the summary from the confirmed result, not the preview. Do not claim success before persistence is confirmed.

## Failure modes

- A price toggle that looks like it changes the subscription.
- A confirmation that omits tax, proration or the next charge.
- Optimistic "Plan changed" copy before the provider confirms.
- A cancellation path that requires a support conversation when self-service is available.

**Source:** distilled from the former `SKILL.md` billing rules and `intelligence/patterns/destructive-actions.md`.
