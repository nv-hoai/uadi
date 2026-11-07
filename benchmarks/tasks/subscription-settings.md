# Benchmark Task: Subscription Settings Experience

Task version: 1.0.0

## Scenario
You are working on a B2B SaaS product used by small companies. Workspace owners manage a paid subscription. The current settings page is a dense form with unclear plan limits and a destructive cancellation action mixed into the main settings.

## Product facts
- A Free plan for up to 3 members.
- A Pro plan for up to 20 members.
- A Business plan for up to 100 members.
- Monthly and annual billing.
- A workspace owner role that can change billing.
- Members who can view plan details but cannot change billing.

## Primary users and outcomes
Workspace owners need to quickly understand:
1. Which plan they are on.
2. What they pay and when the next payment occurs.
3. Whether their workspace is approaching a member limit.
4. How to change plan or billing period.
5. How to update payment details and find invoices.
6. What happens if they cancel.

The business wants plan upgrades to be understandable and trustworthy, without dark patterns or accidental cancellations.

## Constraints and risks
- The experience must work on desktop and mobile.
- Do not invent payment provider APIs or claim a payment succeeded.
- Cancellation must be clearly separated from routine billing actions and require a deliberate confirmation.
- Explain plan limits and billing consequences in plain language.
- Respect role-based access: non-owners see billing information but cannot perform owner-only actions.
- Include loading, empty, error, success and disabled states where relevant.
- Use the host project's existing stack and design conventions if a project is supplied. If no codebase is supplied, provide a framework-neutral specification and a clear prototype.

## Task prompt
Design the subscription settings experience for this product.

First understand the user goals and constraints. Identify the highest-risk UX problems. Propose a coherent information architecture and explain important decisions. Then implement a responsive experience or, if implementation is unavailable, provide a sufficiently detailed specification and interaction states.

Do not add features outside the scenario unless you explain why they are necessary. Do not use deceptive urgency, hidden cancellation paths or fabricated customer research.

## Expected deliverables
- Brief product/UX analysis with assumptions called out.
- Information architecture and primary owner journey.
- Key design decisions and trade-offs.
- Responsive screen or working prototype.
- Owner and non-owner behavior.
- Important interaction and error states.
- Short quality review noting unresolved risks.

## Reviewer questions
- Can an owner identify plan, price and renewal date quickly?
- Are member usage and plan limits understandable?
- Is upgrade/downgrade behavior understandable before commitment?
- Is cancellation discoverable but protected against accidental activation?
- Can a non-owner understand their permissions?
- Does the mobile layout preserve the task hierarchy?
- Are errors and loading states designed rather than ignored?
- Does the visual design feel trustworthy and appropriate for a billing context?
