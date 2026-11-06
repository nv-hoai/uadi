# Pattern: Metrics and Data Visualization

## User problem

Users need to interpret data, notice meaningful change and decide what to do next. A dashboard fails when it displays many metrics without clarifying their meaning, reliability, comparison or connection to an actionable investigation.

## Start with the decision

Before choosing charts, answer:
- Who is using this view, and what decision are they making?
- What signal would change that decision?
- What comparison or context is required to interpret the signal?
- What action or detail should be available after the user notices it?

Organize the view around the user's decision and investigation path—not the database schema, available chart library or number of metrics.

## Define each metric before displaying it

For every important metric, establish a compact contract:

| Field | Specify |
|---|---|
| Meaning | Plain-language definition of what is counted or measured |
| Unit | Count, percentage, duration, currency or other unit |
| Calculation | Numerator, denominator and exclusions where relevant |
| Scope | Population, status, region or other included records |
| Time | Time zone, aggregation interval and selected range |
| Comparison | Baseline period or target, including how it is calculated |
| Freshness | Last updated time and known delay |
| Source/limitation | Known gaps, estimates or unavailable dimensions |

Do not invent a definition from a label. If a metric's calculation or scope is unknown, mark it as an assumption and avoid implying precision.

## Build a hierarchy, not a metric gallery

A useful information order is often:

1. Overall status or the primary outcome.
2. The most decision-relevant changes and exceptions.
3. Context needed to explain those changes.
4. Breakdown or trend views for investigation.
5. The underlying records or next action.

Show only metrics that help the current user understand or act. Keep supporting metrics visually subordinate. Avoid giving every tile equal weight or adding charts merely to fill space.

## Choose a visual form that matches the question

- **Trend over time:** line chart when sequence and change matter; label intervals and missing periods.
- **Compare categories:** sorted bars for magnitude comparisons; keep category labels readable.
- **Part-to-whole:** use a stacked bar or simple proportion when parts form a meaningful whole. Avoid pie/donut charts with many similar categories.
- **Distribution:** histogram, box plot or clearly grouped ranges when spread matters; do not reduce a distribution to an average alone.
- **Relationship:** scatter plot when the relationship between two numeric variables is relevant; do not imply causation.
- **Exact lookup or action:** use a table when users need precise values, sorting, filtering or row-level actions.
- **Single important value:** show the value with unit, scope, time range and relevant comparison—not an isolated number.

Use zero baselines for bar charts unless a clearly disclosed analytical reason requires otherwise. Do not truncate axes or change scales in ways that exaggerate differences.

## Make comparisons honest

- State the selected period and comparison period explicitly.
- Compare like-for-like intervals and scopes.
- Show absolute values alongside percentage change when relative change could mislead.
- Explain whether a target, prior period or benchmark is the reference.
- Distinguish zero, unavailable, not applicable and not yet reported.
- Do not infer causes from correlation or a change in a metric.
- Avoid red/green as the only encoding of good or bad; direction depends on the metric.

## Connect signals to investigation

When users need to act on a metric:
- Make the interaction and destination predictable.
- Carry the selected time range, filters and category into the detail view.
- Preserve a clear route back to the original context.
- Explain when a chart segment is not interactive.
- Keep table and chart summaries consistent with the same underlying scope.

Do not make a chart look clickable unless it leads to a supported action.

## Design for imperfect data

Represent data quality as part of the experience:

| Condition | Design response |
|---|---|
| Loading | Preserve layout and identify what is being loaded when useful |
| No records | Distinguish a true zero from no data or unavailable data |
| Stale | Show last-updated time and explain relevant delay |
| Partial | Identify the affected scope or missing source |
| Error | State what could not be loaded and offer a safe recovery |
| Filtered empty | Show active filters and make clearing or adjusting them easy |

Do not silently combine incomplete periods with complete ones. Do not show a live-status treatment when data is delayed.

## Accessibility and responsive behavior

- Provide text summaries for important chart insights.
- Use labels, patterns or direct annotations in addition to color.
- Ensure keyboard users can reach chart controls and equivalent underlying data.
- Keep axes, legends and units readable at narrow widths.
- Reflow or simplify visualizations deliberately; do not compress labels until they are unusable.
- Provide a table or other accessible equivalent when the chart alone cannot communicate exact values.

## Review questions

- Can the user identify the most important signal quickly?
- Are definitions, units, scope, time range and freshness clear?
- Does the chart type answer the intended question?
- Could the scale, aggregation or comparison mislead?
- Can the user investigate the signal without losing context?
- Are missing, stale, partial and zero data distinguishable?
- Can the same insight be understood without relying on color or pointer interaction?

## Common failures

- Choosing charts before understanding the decision.
- Showing unlabeled values or percentages without denominators.
- Comparing unequal time windows or different populations.
- Using truncated axes to dramatize small changes.
- Treating missing data as zero.
- Implying live data when updates are delayed.
- Displaying too many equally prominent metrics.
- Making chart interactions that lose filters or context.
- Claiming a metric explains why an outcome changed.

## Trade-offs

More context improves interpretation but competes for screen space. Dense tables support exact work but slow pattern recognition. Aggregation improves scanning but can hide outliers. Real-time updates can help operational response but may add noise and performance cost. Choose the simplest representation that supports the actual decision and disclose the limits of the data.
