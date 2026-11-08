# Risk Card: Ownership Handover

**Trigger:** transferring workspace, account or resource ownership, or resolving an ownerless/last-admin state.

## Rules

- A resource has exactly one owner at all times. Do not allow silent, instant or proxy takeover.
- The new owner must explicitly accept. State the deadline, what is locked during the window, what happens on expiry and who can cancel.
- Show the current owner, proposed owner, effective time and access changes. Billing access moves only on completion; the previous owner must not lose it early or retain it afterward.
- Keep billing changes locked for both parties while a handover is pending; routine work continues.
- Record started, cancelled, accepted, expired and completed events in an audit log visible to owners and admins.
- Members see status only and cannot start, accept or cancel. Expired, rejected and invalid-recipient states must be designed, not treated as errors.

## Failure modes

- A transfer that completes without the recipient accepting.
- An ownerless workspace or a last admin who cannot hand over.
- Billing access retained by the previous owner after completion.
- A member seeing controls they cannot use.

**Source:** distilled from `benchmarks/tasks/workspace-handover.md` and `intelligence/patterns/permission-aware-actions.md`.
