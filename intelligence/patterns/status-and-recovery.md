# Pattern: Status, Empty States and Recovery

## User problem

When data is missing, loading or failing, users cannot tell whether the product is working, whether they need to act or whether their previous work was saved.

## Use when

A screen depends on remote data, asynchronous actions, user-generated content, background processing or external services.

## Design the state from the system's actual behavior

- **Loading:** explain what is being loaded when the wait is meaningful. Use stable layout placeholders when they reduce layout shift; do not simulate progress without evidence.
- **Empty:** distinguish a genuinely new/empty account from no search results, filters excluding results, unavailable permissions or failed loading.
- **Ready:** show the data's freshness or scope when that affects decisions.
- **Submitting:** prevent accidental duplicate actions and make pending work visible.
- **Success:** confirm only what the system has confirmed; explain the next relevant step.
- **Error:** say what failed in user language, what remains unchanged and what the user can do.
- **Partial success:** identify which parts succeeded and which need attention instead of reporting a misleading all-or-nothing result.

## Empty-state structure

A useful empty state typically contains:
1. A plain-language description of what is absent.
2. A brief explanation when the reason is not obvious.
3. One relevant next action, if the user can take one.

Do not fill empty states with generic illustrations or calls to action that do not match the user's permissions or context.

## Recovery principles

- Preserve user input and completed work when possible.
- Make retry safe; use idempotent operations where supported.
- Do not offer retry when the underlying condition requires a different action.
- Keep error messages near the affected content or action.
- If a background operation continues after navigation, provide a trustworthy way to find its status.

## Accessibility and responsive behavior

Announce asynchronous status changes appropriately without repeatedly interrupting screen-reader users. Ensure messages remain visible at narrow widths and are not conveyed by color alone.

## Common failures

- Treating no results as a system error or vice versa.
- Showing a spinner indefinitely with no explanation.
- Claiming "Saved" before persistence is confirmed.
- Clearing a form after a failed submission.
- Providing "Try again" when the user must first fix permissions or input.

## Implementation example

The [operations dashboard example](../../examples/operations-dashboard/README.md) distinguishes loading, no records, no matches, error, partial and stale data in `app.js` and `index.html`. The [SSO discovery example](../../examples/sso-discovery/README.md) covers loading, load error and permission-denied states. The data is synthetic; no real network failure, retry or delayed backend response is exercised.
