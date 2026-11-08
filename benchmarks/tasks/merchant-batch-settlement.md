# Benchmark Task: Merchant Batch Settlement Dashboard

Task version: 1.0.0

## Scenario
You are designing a settlement dashboard for a small marketplace. Merchants sell through the marketplace and are paid after each batch of orders settles. A merchant needs to know how much they will receive, when, what was deducted, and which orders are held back, without mistaking the dashboard for a bank statement.

## Product facts
- Batches settle every Monday and Thursday. A batch includes orders from the prior 2 business days.
- The payout amount equals order total minus marketplace fee (10% of order total) minus any refunded orders and return penalties.
- Some orders are held for 3 business days while a dispute is open; held orders are excluded from the next batch and shown separately.
- Data may be delayed by up to 1 hour; the dashboard must state this explicitly.
- Merchants can filter by batch, status (settled, pending, held), and product category. Selecting a batch opens its orders; selecting an order shows its fee breakdown.
- Merchants can export a batch as CSV. The dashboard cannot initiate a payout, change the fee, or release a hold.
- No dynamic pricing, forecasting, or customer lifetime data is available.

## Primary users and outcomes
The primary user is a small merchant reconciling payouts after a busy weekend. They need to understand which payouts are coming, which are held and why, how fees were calculated, and when money arrives. The dashboard must support reconciliation without overstating what it can conclude.

## Constraints and risks
- Define each amount, its units, and the settlement window in plain language; never imply the dashboard is a bank statement or that a payout is guaranteed.
- Never present a forecast, a guaranteed arrival date, or a dispute cause the product cannot support.
- Avoid misleading visualizations: truncated axes, color-only status encoding, or totals that hide held amounts.
- Keep filters understandable and preserve context when drilling into orders and fee breakdowns.
- Include loading, no-data, partial (holding order), stale, error, and export-failed states; distinguish "batch found, nothing held" from "no data returned".
- Do not invent payout automation, fee rules, or dispute outcomes.
- Use the supplied project's stack and design conventions when available.

## Task prompt
Design a dashboard that supports the merchant's reconciliation workflow. First explain the product context, the questions the merchant needs to answer, and the limits of the data. Then propose the information hierarchy, choose appropriate visualizations, and implement a responsive dashboard or provide a detailed specification if implementation is unavailable.

## Expected deliverables
- Product/settlement understanding with definitions, data limits, and freshness.
- Information architecture and primary reconciliation journey.
- Rationale for metric hierarchy, chart choices, and fee display.
- Responsive UI or detailed specification.
- Filter, drill-down, loading, no-data, partial, stale, and error states.
- Short review of misleading interpretations and unresolved risks.

## Reviewer questions
- Can a merchant identify what they will receive, when, and what is held back?
- Are fee calculations, exclusions, and settlement windows unambiguous?
- Do the visualizations support reconciliation rather than decorate the page?
- Is it impossible to mistake the dashboard for a bank statement or a guarantee of payout?
- Can users move from a batch to its orders and fee breakdown without losing context?
- Are no-data, partial, stale, and "batch ran empty" states distinguishable?
- Does the visual design balance scanning, comparison, and density without color-only status?
