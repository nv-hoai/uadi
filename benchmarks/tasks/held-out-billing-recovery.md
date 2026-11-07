# Benchmark Task: Payment Recovery After a Failed Renewal

Task version: 1.0.0

## Scenario
You are designing the recovery experience for a B2B SaaS product used by small companies. A workspace owner's card expired on renewal day, their most recent payment failed, and the account has entered a grace period. The product keeps the workspace usable while recovery is pending, but it must make the failure, the deadline and the consequences unmistakable without using fear or deceptive urgency.

## Product facts
- The workspace is on the Pro plan at $48 per month, billed monthly. The last invoice, INV-2041, failed when the stored card was declined as expired.
- The account enters a 7-day grace period after the failed payment. During the grace period the workspace stays usable and the owner is notified by email and in-product.
- After the grace period, existing projects become read-only for Members and workspace settings are locked until billing is resolved. Owners can still view billing and sign in.
- The account can be recovered at any time during the grace period by updating the payment method and re-attempting the failed invoice.
- Updating the card does not automatically retry the failed invoice; the owner must confirm the retry.
- A workspace owner can change payment details and retry billing. Members see the billing status banner and plan details but cannot update payment details or retry.
- The product does not store full card numbers; only the last four digits and the expiry month are shown.
- The product cannot take a payment on the user's behalf or claim a payment succeeded before the provider confirms it.

## Primary users and outcomes
The primary user is a workspace owner who discovers the failure after the fact — possibly days later. They need to understand what failed, how long they have, what updating the payment method will and will not do, and how to confirm the account is back to good standing. A secondary user is a Member who sees the read-only state and needs to understand why their work is not being saved without being able to fix it.

## Constraints and risks
- Communicate the failure reason, the remaining grace days and the exact consequences of expiry in plain language; do not invent provider error codes or a guaranteed outcome.
- Make the required action obvious and minimal: update the card, then confirm the retry. Do not bury recovery under plan-change or invoice-history screens.
- Show card details only as the last four digits and expiry; never imply the product saw or stored the full number, and never claim payment succeeded before confirmation.
- Respect role-based access: non-owners see the status and explanation but cannot perform owner-only recovery actions.
- Include loading, card-validation error, retry-in-progress, success, retry-failed-again and restricted (post-grace) states. Include an empty state for workspaces with no failed invoices.
- Keep the experience usable on desktop and mobile; the deadline and primary action must survive stacking.
- Do not invent payment provider APIs, dunning email content or automatic collection behavior beyond what is stated above.
- Use the supplied project's stack and design conventions when a codebase is provided.

## Task prompt
Design the payment-recovery experience for this product. First identify what an owner who returns days after the failure needs to know and do, in what order, and what must never be implied. Then design and implement a responsive recovery flow or provide a detailed framework-neutral specification if implementation is unavailable.

## Expected deliverables
- Compact product model with facts, assumptions and unknowns separated.
- Owner recovery journey: failure explanation, deadline, card update, retry confirmation, confirmation of good standing.
- Read-only Member view of the same state, with accurate, non-alarming copy.
- Responsive UI or detailed specification.
- Validation, in-progress, success, retry-failed-again, restricted and no-failed-invoices states.
- Short review of trust and misunderstanding risks, and unresolved product questions.

## Reviewer questions
- Can an owner understand what failed, why, and by when they must act?
- Is the recovery action minimal, ordered and confirmed before any success is claimed?
- Are the consequences of missing the deadline stated without deception or false urgency?
- Can a Member understand why their work is read-only without being able to take an owner action?
- Are card details represented honestly (last four digits, expiry) and shown as unconfirmed until confirmed?
- Do validation, retry and restricted states feel designed rather than left to defaults?
- Does the mobile layout keep the deadline and the primary action visible?
