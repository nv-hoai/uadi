# Worked example: weekly delivery operations dashboard

This example applies the UADI workflow to the repository's [operations dashboard benchmark scenario](../../benchmarks/tasks/operations-dashboard.md). It covers a materially different task from the [onboarding example](../product-onboarding/README.md): investigation and comparison rather than guided setup.

All figures come from a fixed synthetic dataset in `data.js`. Nothing here is customer research, production telemetry or a claim about a real delivery network.

## Run the prototype

From the repository root:

~~~bash
python3 -m http.server 8000
~~~

Open `http://localhost:8000/examples/operations-dashboard/`.

The prototype is plain HTML, CSS and JavaScript: no dependencies, API, account or build step. The "Prototype controls" panel switches between data states; it makes no network request and persists nothing.

## 1. Evidence synthesis

The task supplies the product facts. The synthetic snapshot supplies plausible values so the interface can be evaluated. Keep the two separate.

| Evidence class | What we know | Design consequence |
|---|---|---|
| **Confirmed — scenario** | The dashboard covers order volume, on-time delivery rate and failed attempts | Those three metrics define the summary; no other metric is invented |
| **Confirmed — scenario** | On-time means delivered inside the promised window; failed means the attempt did not complete | Define the denominator explicitly: failed attempts are excluded from the on-time rate |
| **Confirmed — scenario** | Data may lag by up to 15 minutes | Show a snapshot timestamp and a refresh note next to the page title |
| **Confirmed — scenario** | Managers filter by range, region and status, compare equal-length periods and open matching orders | Filters, a comparison toggle and a drill-down share one state |
| **Confirmed — scenario** | No revenue, customer value, driver productivity, forecasts or root causes exist | Do not add revenue, prediction or cause labels |
| **Synthetic — prototype data** | Last week: 4,827 orders, 4,418 on time of 4,649 delivered (95.0%), 178 failed (3.7%) | Enough variation to test comparison, ties and drill-down |
| **Synthetic — prototype data** | East is lowest at 90.3%; previous period 88.6%; failed attempts up 47.7% | The insight block has a real, non-obvious signal to surface |
| **Assumption — prototype** | A failed attempt belongs to one order, so failed attempts can be labelled "failed orders" in the sample list | Keep the sample explicit; do not imply an exhaustive order export |
| **Unknown — production behavior** | Refresh cadence, late-arriving corrections, time zones, regional definitions | Do not claim reconciliation or live freshness; a real build must verify them |

The example makes no claim that 95.0% is good, bad or typical. Performance thresholds are product policy, not supplied evidence.

## 2. Design critique

The risky default for an operations dashboard is a wall of equally weighted numbers plus a line chart. Against the supplied facts, the main problems are:

| Priority | Critique | Evidence / confidence | Consequence |
|---|---|---|---|
| **P1 — trust** | Mixing failed attempts into the on-time denominator | Definitions are explicit; high confidence | Rate looks worse than the delivered-order rate the business means |
| **P1 — misleading comparison** | Comparing unequal periods or hiding the baseline | The scenario defines equal-length comparison; high confidence | A volume change can look like a quality change |
| **P1 — incomplete states** | Showing a blank panel for loading, stale, partial or failed data | Required states are explicit; high confidence | Managers cannot tell "no problems" from "no data" |
| **P2 — scanning** | Giving orders, failures and on-time rate equal visual weight | Design judgment; medium confidence | The health signal is slower to find at shift start |
| **P2 — drill-down** | Opening orders without carrying range, region and status | The scenario requires preserved context; high confidence | Users re-apply filters and may investigate the wrong slice |
| **P3 — chart honesty** | Truncated axes or colour-only status encoding | Constraint is explicit; high confidence | Small changes look dramatic and status is lost in greyscale |

The first three are fixed before visual polish because they change the meaning of the numbers.

## 3. Design decisions

- **One question at the top.** The lede asks whether delivery health is on track and where to investigate, so the page is organised around a decision rather than a data inventory.
- **On-time rate leads.** It is the largest metric. Failed attempts and orders are supporting context, not peers.
- **Definitions sit with the metrics.** Each card has a "How this is calculated" disclosure. The on-time denominator is delivered orders; failed attempts are excluded and called out again in the region note.
- **The insight names a region, not just a trend.** "East has the lowest on-time rate (90.3%)" is more actionable than "performance improved" when volume and failures move in opposite directions.
- **Comparison is explicit and reversible.** The toggle removes every delta chip, the previous-period legend and the previous series together, so the page never mixes compared and uncompared readings.
- **Zero-based bars, with a table fallback.** The chart compares failed-attempt counts, not rates, and states the previous-period count in the accessible description. Exact values are in "View the numbers".
- **Drill-down preserves the slice.** Opening orders from a region or the insight keeps the range, region and failed status; the orders panel restates all three in its subtitle.
- **States are distinct.** Stale data keeps the figures but warns; partial data excludes the missing day from both the current and comparison totals; error shows no figures at all; empty is different from a filter with no matches.
- **The demo controls are visibly not product UI.** They sit in a dashed panel labelled "Synthetic data · not product functionality".

## 4. Implementation and interaction coverage

Open `index.html`, `app.js`, `data.js` and `styles.css` to inspect the complete implementation. It uses semantic landmarks, labelled controls, a live region for filter/state announcements, a skip link, visible focus styles, reduced-motion support and a responsive layout.

| Interaction | Implemented behavior |
|---|---|
| Date range | Last week, previous week or last 4 weeks; chart buckets switch from days to weeks |
| Region filter | Recomputes summary, chart, region table and insight; single-region views show one region row |
| Compare toggle | Adds or removes all deltas, the previous legend and the previous bar series together |
| Metric / region drill-down | Opens the orders panel with the current range, region and status |
| Status filter | All, on time, late, failed or in transit; shows the in-view count and sample rows |
| Loading | Skeleton cards, `aria-busy`, then an automatic return to ready |
| Load error | No stale figures; "Try again" returns through loading to ready |
| No data | Explains the difference from an empty filter result and offers range/region resets |
| Partial data | Warns that East Sunday is missing, marks the region row and excludes the day from totals |
| Stale snapshot | Keeps figures but warns they may have changed |
| In-transit empty result | Explains that a completed week has no in-transit orders and offers to clear the filter |
| Sample-order list | States that rows are a sample and how many in-view orders they represent |
| Keyboard flow | Skip link, native buttons/selects/checkbox/details, focus move to the orders heading and back to the summary |

The prototype intentionally does **not** implement authentication, persistence, real APIs, refresh scheduling, exports, root-cause analysis or forecasts.

### Honest summarisation details

- Tied peaks are reported together ("The highest days were Wed 28 and Fri 30 (31 each)") rather than picking one arbitrarily.
- Signs are written once ("up 7.1%"), not doubled ("up +7.1%").
- Singular and plural counts are handled ("1 sample row", "2 sample rows").
- Sample order dates are derived from the selected range, and delivered times are consistent with the promised window.

## 5. Review and validation performed

Validated on 2026-11-06 with Playwright 1.64.1 (Chromium revision 1248) against the local static server.

| Check | Result |
|---|---|
| Browser console / page errors | None on the ready, filtered, drilled-down, error, empty, partial and stale paths |
| axe-core WCAG 2.1 A/AA (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) | 0 violations on the ready summary at 1280×900 and 375×812, and on the orders panel |
| Document horizontal overflow | 0 at 1280, 768 and 375 CSS px (`scrollWidth` equals `clientWidth`) |
| Ready figures | 95.0% on-time, 178 failed, 4,827 orders; previous period 93.1% and 135 failed |
| East drill-down | 90.3%, 65 failed, 1,242 orders; +1.8 pts, failures +47.7% (+21), orders +12.7% |
| Comparison off | 0 delta chips, 0 previous legends, chart states comparison is off |
| Error → retry | Error card, loading skeleton, then ready; demo select returns to "ready" |
| Empty → reset | Empty card; reset returns to last week/all regions and syncs the control |
| Partial | 4,703 orders and 173 failed (East Sunday excluded); region row marked "Partial · 6/7 days" |
| Stale | Figures retained with a 38-minute-old warning |
| In transit | Empty-result message inside the orders panel, with a clear-filter action |
| Keyboard | Skip link focuses `main`; Enter opens orders and focuses the orders heading; "Back to summary" returns focus to the summary; Enter changes range; Space toggles compare; Enter opens the demo panel |
| Responsive chart | Desktop 7-day chart and mobile two-line day labels remain legible; zero-based ticks stay round |

Only Chromium was tested. No screen reader, real API, network failure, timezone change or high-volume dataset was exercised.

## 6. Limitations and misleading interpretations

- **Synthetic data.** The numbers are constructed, not sampled. They demonstrate interaction and comparison behavior, not delivery performance.
- **No causal claim.** East's lower rate may invite a root-cause story; the interface deliberately says where to look, not why.
- **Partial handling is a prototype rule.** Excluding the missing day from both periods avoids comparing different coverage, but a production product needs a documented late-arrival policy.
- **Small sample list.** Five rows per region are illustrative; the panel states that it is not the full order list and does not paginate.
- **No thresholds.** Green/amber styling marks relative position, not an agreed service-level target.
- **Mobile table.** The region table scrolls horizontally below 640px with a visible hint and a keyboard-focusable scroll region. A production build could restructure it into stacked rows.
- **Demo controls are not product UI.** Data-state switching exists only to make the states inspectable.

## What this example demonstrates

The evidence table separates supplied facts from synthetic values and unknowns. The critique ranks meaning-changing risks above styling. The decisions explain the metric hierarchy, comparison rules, zero-based chart and context-preserving drill-down. The implementation makes those choices inspectable, and validation is reported with its limits so a working prototype is not mistaken for proof of product impact.
