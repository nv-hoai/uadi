# Pattern: Data Tables and Filtering

## User problem

Users need to find, compare, monitor or act on multiple records. A data view fails when it exposes too many fields, hides important differences, loses the user's place after a change, or makes bulk actions feel unsafe.

## Use when

- Users compare attributes across many records.
- Scanning, sorting, filtering or selecting records is a frequent task.
- Column relationships matter more than an individual record's visual presentation.

Choose a list for sequential, low-comparison content. Choose cards when each item is a distinct object with a small number of meaningful attributes or actions. Do not default to cards merely because the viewport is narrow.

## Design the information model

1. Identify the user's most common question: find one record, compare records, monitor status or act on a group.
2. Put identifying information and the attributes needed for that task first.
3. Keep labels, units, date ranges and status meanings explicit.
4. Distinguish record identity from mutable attributes.
5. Expose secondary details progressively instead of turning every row into a dashboard.

Every visible column should support a real decision or task. Remove columns that merely mirror internal data structures.

## Filtering, sorting and search

- Use search for known or partially known identifiers and names.
- Use filters for attributes users understand and can predict.
- Show active filters and make them easy to remove individually or clear together.
- Keep the result count and empty-result state understandable.
- Make sort direction and sorted column perceivable, including to assistive technology.
- Preserve filters and sort when users inspect a record and return, unless the product has a clear reason not to.
- Avoid controls that silently apply contradictory or ambiguous filter logic.

For complex filter builders, explain whether conditions combine with AND or OR and summarize the active query in plain language.

## Selection and bulk actions

- Separate row navigation from row selection; do not make an entire row ambiguously clickable.
- Make the scope of selection clear: current page, filtered results or all records.
- Show how many records are selected.
- Place bulk actions near the selection context and name their scope.
- Confirm only actions with meaningful risk or difficult recovery; do not add confirmation to every harmless operation.
- For partial success, report which records succeeded and which need attention.
- Preserve selection when an operation fails if it is safe to retry.

## States that matter

| State | Useful behavior |
|---|---|
| Initial / loading | Preserve the table structure where possible; communicate loading without implying there are no records. |
| No records | Explain why the collection is empty and provide a legitimate first action if one exists. |
| No matches | State that current search or filters returned no matches; offer to clear or adjust them. |
| Error | Explain whether data is stale, unavailable or an action failed; provide a retry path when safe. |
| Partial results | Identify what is missing rather than presenting incomplete data as complete. |
| Restricted | Explain unavailable actions without exposing records the user is not allowed to see. |

Do not reuse one generic empty state for a new account, no search matches and a failed data request.

## Responsive behavior

- Keep the attributes needed for the primary task visible at narrow widths.
- Allow horizontal scrolling only when the table remains understandable and the scroll affordance is discoverable.
- Consider a labeled key-value row layout for small datasets when comparison across columns is not essential.
- Offer a record detail view for secondary attributes rather than shrinking text or hiding critical values.
- Keep row actions reachable without hover.
- Avoid turning every row into a tall card when users need to compare values down a column.

## Accessibility

- Use semantic table markup with header cells and appropriate row/column associations for tabular data.
- Provide accessible names for sort controls and expose the current sort state.
- Ensure selection controls have row-specific labels.
- Do not communicate status, selection or trend through color alone.
- Keep keyboard focus visible and predictable when filtering, paging or updating rows.

## Trade-offs

Dense tables improve comparison and scanning for expert workflows but increase cognitive load. Cards improve individual-item comprehension but often weaken cross-item comparison. Pagination limits rendering and supports orientation; virtualized lists can improve performance but require careful keyboard and assistive-technology behavior. Choose based on task frequency, dataset size and comparison needs.

## Common failures

- Showing every available field as a column.
- Using color-only status indicators or icon-only actions without names.
- Clearing filters after every navigation or failed request.
- Making row selection and row navigation conflict.
- Labeling a filtered zero-result view as if the account has no data.
- Showing a bulk action without communicating which records it affects.

## Implementation example

The [operations dashboard example](../../examples/operations-dashboard/README.md) implements a filterable region table, contextual drill-down and an in-view sample list in `app.js` and `index.html`. It preserves the selected range, region and status when opening orders. The dataset is synthetic and the table is not paginated or virtualized.
