# Benchmark Task: Capacity Investigation Across a Host Fleet

Task version: 1.0.0

## Scenario
You are designing a capacity investigation dashboard for a hosting product. Infrastructure engineers use it to find which hosts are approaching or exceeding capacity, determine whether the pressure is caused by new workloads or slow growth, and decide where to act next. The dashboard must be honest about how old the data is and must not imply predictions the product cannot make.

## Product facts
- The fleet has 240 hosts. Each host can be in one of four states: healthy, warning, critical or offline.
- The product tracks CPU utilization, memory utilization and disk utilization per host, updated every 60 seconds; data shown on screen may be up to 2 minutes old.
- Warning means any utilization above 80%; critical means any utilization above 92%.
- Engineers can group hosts by region (us-east, eu-west, ap-south) and by host class (compute, memory, storage).
- Engineers can compare the selected window with the previous window of equal length.
- Selecting a host group or a chart segment opens the matching hosts list; selecting a host opens its utilization trend.
- There are roughly 14 days of history. The product does not forecast future capacity and cannot state a date at which a host will run out.
- No cost, power, temperature or application-level performance data is available.

## Primary users and outcomes
The primary user is an infrastructure engineer investigating capacity pressure during a shift. They need to identify how many hosts are at risk, which region and host class carries the risk, whether pressure is new or sustained, and which specific hosts to act on first. The dashboard must support that investigation without overstating what the data can conclude.

## Constraints and risks
- Define each utilization metric, its units, the freshness of the data and the thresholds in plain language; never imply live data.
- Never present a forecast, an exhaustion date or a cause the product cannot support; when history is shorter than the window being compared, say so.
- Avoid misleading visualizations: truncated axes, color-only status encoding, or aggregations that hide how many hosts are in the risk state.
- Keep filters understandable and keep drill-down context: the hosts list and host trend must preserve the active region, class, state and time window.
- Include loading, no-data, partial/failed host, stale and empty-filter states; distinguish "hosts found, none at risk" from "no data returned".
- Do not invent metrics, forecasts, root causes or remediation automation.
- Use the supplied project's stack and design conventions when available.

## Task prompt
Design a dashboard that supports the engineer's capacity investigation workflow. First explain the product context, the questions the engineer needs to answer and the limits of the data. Then propose the information hierarchy, choose appropriate visualizations, and implement a responsive dashboard or provide a detailed specification if implementation is unavailable.

## Expected deliverables
- Product and capacity understanding with definitions, data limitations and freshness.
- Information architecture and primary investigation journey.
- Rationale for metric hierarchy, chart choices, threshold display and comparison behavior.
- Responsive UI or detailed specification.
- Filter, drill-down, loading, no-data, partial, stale and error states.
- Short review of misleading interpretations and unresolved risks.

## Reviewer questions
- Can an engineer identify how many hosts are at risk and which region and host class carry the risk?
- Are utilization definitions, units, thresholds, freshness and comparison windows unambiguous?
- Do the visualizations support the investigation rather than decorate the page?
- Is it impossible to mistake the dashboard for a forecast, or to read an exhaustion date into it?
- Can users move from a fleet signal to the specific hosts and a host trend without losing context?
- Are no-data, partial, stale and "no hosts at risk" states distinguishable?
- Does the visual design balance scanning, comparison and density without color-only status?
