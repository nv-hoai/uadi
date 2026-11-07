# Benchmark Task: Operations Performance Dashboard

Task version: 1.0.0

## Scenario
You are designing a weekly operations dashboard for a logistics SaaS product. Operations managers use it to spot delivery problems, understand whether performance is improving and drill into affected orders.

## Product facts
- The dashboard covers order volume, on-time delivery rate and failed delivery attempts.
- On-time delivery means an order was delivered within its promised delivery window.
- A failed delivery means a delivery attempt did not complete successfully.
- Data may be delayed by up to 15 minutes.
- Managers can filter by date range, region and delivery status.
- They can compare the selected period with the immediately preceding period of equal length.
- Selecting a metric or chart segment can lead to the matching orders list.
- No revenue, customer lifetime value or driver productivity data is available.
- No predictive forecasts or root-cause classifications are available.

## Primary users and outcomes
The primary user is an operations manager starting a shift or weekly review. They need to understand delivery health, notice meaningful deterioration, compare periods, identify affected regions or statuses, and open relevant orders to investigate.

## Constraints and risks
- Define metric units, date ranges and comparison baselines clearly.
- Do not imply live data; communicate the possible 15-minute delay.
- Avoid misleading visualizations, truncated axes or color-only status encoding.
- Keep filters understandable and preserve context when drilling into orders.
- Include loading, no-data, partial/stale data, error and empty-result states.
- Do not invent metrics, forecasts, causes or backend capabilities.
- Use the supplied project's stack and design conventions when available.

## Task prompt
Build a dashboard that supports the manager's real decision and investigation workflow. First explain the product context and the decisions the user needs to make. Then propose the information hierarchy, choose appropriate visualizations and implement a responsive dashboard or provide a detailed specification if implementation is unavailable.

## Expected deliverables
- Product/metric understanding with definitions and data limitations.
- Information architecture and primary investigation journey.
- Rationale for metric hierarchy, chart choices and comparison behavior.
- Responsive UI or detailed specification.
- Filter, drill-down, loading, stale/partial, no-data and error states.
- Short review of misleading interpretations and unresolved risks.

## Reviewer questions
- Can a manager identify delivery health and the most important change quickly?
- Are metric definitions, units, time ranges and comparisons unambiguous?
- Do charts support the actual decision rather than decorate the page?
- Is the 15-minute data delay visible without creating unnecessary alarm?
- Can users move from a signal to the relevant orders without losing context?
- Are no-data, stale, partial and error states distinguishable?
- Does the visual design balance scanning, comparison and information density?
