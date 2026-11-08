# Flow and States

**Load when:** the work spans multiple steps, roles, sessions or failure paths.

## Decision rules

1. Write the spine: **trigger → entry → context → decision → action → confirmation → next step**.
2. Add a branch only when it changes what the user sees, decides or can do: role/ownership, object state, entitlement, user choice, data quality, external dependency, time/concurrency, environment, first visit vs return.
3. Model handoffs: who acted, what the next person must see, how the first person knows it happened, and what happens if the task is interrupted.
4. Define exits and recovery: cancel before commitment, back without losing input, save/resume, undo, retry, escalate, and a safe state if the action fails partway.
5. Derive edge cases from variation axes; triage each as **design now, explain/guard, block for a decision, out of scope, or test later**. Do not invent states the system cannot distinguish.
6. Define states per region, not only per page: initial/loading, empty, ready, disabled/restricted, submitting, success, error, partial. Specify transitions and the action that remains available.

## Failure modes

- Designing a page instead of the journey; hiding the recovery path.
- Treating every edge case as a modal or an error message.
- A loading/error banner leaking into states where it does not apply.
- Silent failure, duplicate submission or lost input.

## Validation

Walk the spine and every branch that changes the interface. Confirm the primary action, consequence, confirmation and recovery are visible at the relevant viewport. If a state cannot be reached, say so.

**Source:** distilled from `intelligence/UX-REASONING-PLAYBOOK.md`.
