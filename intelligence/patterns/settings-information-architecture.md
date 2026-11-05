# Pattern: Settings Information Architecture

## User problem

Users arrive in settings to answer a specific question or change a specific part of their account. A flat list of unrelated controls makes them scan, interpret internal terminology and fear changing the wrong thing.

## Use when

- A product has several settings domains with different purposes.
- Users need to understand current configuration before changing it.
- Some settings have consequences, role restrictions or separate owners.

Avoid adding elaborate categories to a small settings surface with only a few related controls.

## Recommended structure

1. **Orient:** clear page title and a short explanation of scope.
2. **Show current state:** surface the facts users need to make a decision (for example current plan, renewal date or security status).
3. **Group by user intent:** profile, workspace, access, billing and notifications are examples—not mandatory categories.
4. **Separate risk:** destructive or high-consequence actions should not look like routine preferences.
5. **Make ownership clear:** identify which role can change a setting when this affects the user's next step.

## Interaction details

- Keep a stable navigation model when settings span multiple pages.
- Use descriptive section names, not internal system labels.
- Keep related values and their actions together.
- Show saved/unsaved state and explain when changes take effect.
- Preserve entered values if saving fails.
- Avoid making a user navigate away merely to discover a permission restriction.

## Responsive behavior

On narrow screens, replace a wide persistent settings sidebar with a compact section navigator or clear back-to-section flow. Keep section context visible. Do not compress a multi-column settings layout until labels and values become difficult to scan.

## Trade-offs

A single long page can be efficient for a small number of simple preferences. Separate pages improve focus for large or high-risk domains but add navigation cost. Choose based on task frequency, information volume and consequence—not a universal page-count rule.

## Common failures

- Grouping by backend service or organizational department.
- Showing decorative summary cards that push the actual settings below the fold.
- Mixing account deletion or cancellation into routine toggles.
- Using ambiguous labels such as "General" for unrelated controls.
