# Risk Card: Data Freshness and Comparison

**Trigger:** the interface shows metrics, status, waits, settlement, capacity or any data that can be stale, partial or compared.

## Rules

- Define each metric, unit, window and source before choosing a chart. State the data delay and the last-updated time; keep the age visible.
- Distinguish **loading, no data, empty result, partial, stale, delayed, offline, error** and "batch ran empty". Do not collapse them into one state.
- Never imply a forecast, guarantee, root cause or exact arrival time the product cannot support. Use ranges where precision is unavailable.
- Compare equal windows and label the comparison. Do not truncate axes, hide held/excluded amounts or use color alone for status.
- Selecting a metric or segment must preserve filter context when drilling into records. Say when the data is only partial.
- If the underlying data is unavailable, show the gap rather than substituting a plausible value.

## Failure modes

- A "live" indicator with no timestamp or freshness rule.
- A chart that hides excluded or held records.
- An exact wait or payout promise derived from an average.
- Empty and error rendered identically.

**Source:** distilled from `intelligence/patterns/metrics-and-data-visualization.md` and `intelligence/patterns/status-and-recovery.md`.
