# Benchmark Task: Workspace Owner Handover

Task version: 1.0.0

## Scenario
You are designing owner handover for a small-team collaboration workspace. The current owner is leaving the company and must transfer workspace ownership to a senior admin. The workspace has billing, 8 members, and 2 admins. The transfer must be deliberate: no silent takeover, no lockout, and a clear audit path.

## Product facts
- Only the current owner and admins can start a handover. The new owner must be an existing admin with a verified email.
- Handover requires the new owner to accept by email within 72 hours. Until acceptance, the current owner remains owner and can cancel the request.
- After acceptance, the new owner becomes owner and the previous owner becomes an admin. Billing access moves to the new owner; the previous owner loses billing access immediately at transfer.
- During the 72-hour window, billing changes are locked for both parties; project work continues normally.
- Every handover event (started, cancelled, accepted, completed, expired) is recorded in a workspace audit log visible to owners and admins.
- A workspace must always have exactly one owner. The owner cannot be removed without completing handover first.
- No automatic reassignment, proxy acceptance, or backdating is available.

## Primary users and outcomes
The primary user is the current owner who wants a clean, reversible handover, and the new owner who must understand what they are accepting. Secondary users are admins who watch status and members who should see only that nothing has broken. The workspace must never be left ownerless or silently transferred.

## Constraints and risks
- Do not allow silent or instant takeover; require the new owner's explicit acceptance and state the 72-hour deadline, locking behavior, and consequence of expiry in plain language.
- Do not let the current owner lose billing access before acceptance, nor let them retain it after completion.
- Respect role-based access: members see status only and cannot start, accept, or cancel a handover.
- Include loading, empty (no pending handover), error (new owner not an admin / unverified email), success, expired, and restricted (member attempting owner actions) states.
- Keep the experience usable on desktop and mobile; deadline and primary action must survive stacking.
- Do not invent HR workflows, legal agreements, or backend behavior beyond the facts above.
- Use the host project's existing stack and design conventions when a codebase is provided.

## Task prompt
Design the owner handover experience for this product. First identify what each party needs to know and do, in what order, and what must never happen. Then design and implement a responsive experience or provide a detailed framework-neutral specification if implementation is unavailable.

## Expected deliverables
- Compact product model with facts, assumptions and unknowns separated.
- Primary journey: start, pending, accept, complete, expiry, cancel.
- Rationale for locking, audit visibility, and role behavior at each step.
- Responsive UI or detailed specification.
- Validation, loading, success, expired, and restricted states.
- Short review of lockout and misunderstanding risks.

## Reviewer questions
- Can the current owner understand what will happen, by when, and how to cancel?
- Is it unmistakable that transfer is not complete until the new owner accepts?
- Are billing access changes stated exactly (no early loss, no retained access)?
- Can a member understand the status without being able to act?
- Are admin-only and owner-only actions protected?
- Do expired, cancelled, and error states feel designed rather than left to defaults?
- Does the mobile layout keep the deadline and primary action visible?
