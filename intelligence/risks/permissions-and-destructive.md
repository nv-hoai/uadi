# Risk Card: Permissions and Destructive Actions

**Trigger:** actions differ by role or ownership, or an action removes data, access, money or service.

## Rules

- Model role **and** action. Distinguish "not allowed" from "not available yet" and explain who can resolve it instead of silently hiding the control.
- A disabled control keeps a visible reason and a path to the person who can act. Do not use permission hiding as the only explanation.
- For a destructive action, state the object, scope, consequence, timing and reversibility before commitment. Use a deliberate confirmation, not a pre-checked box.
- Separate the destructive action from routine edits and from the safe exit. Never make the destructive action the default focus or a disguised primary button.
- Provide undo or a recovery path when the product supports it; otherwise say plainly that the action cannot be undone.
- Confirm success from the actual result. Partial failure must identify what changed and what did not.

## Failure modes

- A member sees a broken or silently missing action.
- "Delete" without scope or recovery.
- A confirmation dialog where the primary button is also the destructive action and the safe exit is a tiny link.
- A bulk action that reports success before all items complete.

**Source:** distilled from `intelligence/patterns/permission-aware-actions.md` and `intelligence/patterns/destructive-actions.md`.
