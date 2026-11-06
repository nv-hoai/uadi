# Pattern: Destructive Actions

## User problem

Some actions permanently remove information, access, money or service. Users need to understand the consequence and retain control without being trapped in a dark pattern.

## Use when

An action is difficult or impossible to reverse, affects other people, ends a paid service or causes material data loss.

Do not add a confirmation dialog to every minor reversible action. Excessive confirmation trains users to dismiss warnings.

## Recommended flow

1. **Discoverable entry point:** make the action findable; do not conceal cancellation or deletion.
2. **Consequence preview:** state exactly what changes, when it takes effect and what is retained or lost.
3. **Relevant choice:** offer a safer alternative only when it genuinely addresses the user's need; never make it a barrier.
4. **Deliberate confirmation:** distinguish the final action from the safe exit. Use a clear action label such as "Cancel subscription" rather than "Continue".
5. **Confirmed result:** show the actual resulting state and effective date only after the system confirms it.

Require stronger confirmation only when the risk warrants it. Typed confirmation can be appropriate for exceptional, high-impact deletion, but is excessive for ordinary reversible changes.

## Dialog content

A useful confirmation answers:
- What will happen?
- When will it happen?
- What will the user lose or retain?
- Can it be undone, and how?
- What happens to collaborators or dependent resources?

Avoid vague warnings such as "Are you sure?" without a consequence.

## Failure and recovery

- If the request fails, keep the current state and explain that the action did not complete.
- Prevent duplicate submissions while the request is pending.
- Do not show a success state optimistically for consequential actions.
- Provide a recovery path when reversal is supported and be honest when it is not.

## Accessibility

Use a correctly labelled dialog when a modal is justified. Keep keyboard focus within it, return focus to the trigger on close, and make the safe exit clear. A non-modal confirmation may be better when it preserves context without interrupting the task.

## Trust rule

The destructive path must be as understandable and direct as the non-destructive path. Do not hide cancellation behind repeated retention offers, confusing labels or unnecessary contact steps.

## Implementation example

The [subscription settings example](../../examples/subscription-settings/README.md) shows a cancellation confirmation that states the effective date, plan change and access consequence. The [SSO discovery example](../../examples/sso-discovery/README.md) shows a separate enforcement-off confirmation that explains the password and session behavior. Both simulate the result locally and do not mutate a real subscription or workspace.
