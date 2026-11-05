# Pattern: Permission-Aware Actions

## User problem

A user can see an object but cannot perform every action on it. If the interface hides actions without explanation or presents controls that fail after activation, users cannot understand the product's permission model.

## Use when

- Capabilities vary by role, ownership, plan or resource state.
- A user can view information but only another role can change it.
- The action may be available after an explicit role or access change.

## Decide between hide, disable and explain

- **Hide** an action when revealing its existence would expose sensitive capabilities or create unnecessary noise, and the user has no legitimate reason to expect it.
- **Disable with explanation** when the action is relevant and the user benefits from knowing it exists but is unavailable in the current context.
- **Show an alternate path** when the user can request access, contact an owner or change role through a legitimate workflow.
- **Show the action** only when the current user is authorized and the resource state permits it.

Do not use a disabled button as the only explanation. Place the reason adjacent to the control or in a reliably accessible description.

## Interaction details

- Explain the rule in user language: "Only workspace owners can change billing", not "403: forbidden".
- Distinguish role restriction from temporary unavailability or plan limitation.
- Do not imply that clicking will work when authorization is known to be absent.
- Enforce authorization in the system/API as well as the UI. Client-side visibility is not a security boundary.
- If permissions can change during a session, handle stale access gracefully and preserve safe user input.

## Accessibility

Ensure disabled states and explanatory text are understandable to keyboard and assistive-technology users. Do not rely on color or hover-only tooltips to communicate restrictions.

## Trade-offs

Showing a restricted action can teach users about available capabilities but may clutter the interface. Hiding it reduces noise but can make the product appear inconsistent. Choose based on whether the user has a meaningful reason to expect or request that capability.

## Common failures

- Showing owner-only controls to every role and returning a generic error.
- Hiding actions with no explanation in workflows where users expect them.
- Treating UI hiding as authorization.
- Using the same disabled treatment for permission, loading and invalid-state reasons.
