# Benchmark Task: Returning to an Abandoned First-Run Setup

Task version: 1.0.0

## Scenario
You are designing the return experience for a B2B collaboration product used by small teams. A workspace owner created a workspace two weeks ago, started first-run setup, created the workspace name and chose a plan, then left before creating a project. They have no projects, no members and no completed work. The product must welcome them back, honor what they already did, and move them to a first useful outcome without re-asking completed steps or pretending the workspace is fresh.

## Product facts
- The workspace exists and is named "Harbor Studio". The owner already chose the Starter plan (up to 5 members) and saw the plan description.
- The workspace has zero projects, zero other members and no activity history beyond account creation.
- The owner's account carries a "setup incomplete" state: they skipped project creation and left. The product knows the workspace name and plan but has no project details.
- No external integrations, imports or templates are available in this scenario.
- Inviting teammates is optional. A solo owner must be able to reach a useful first project without inviting anyone.
- The owner can leave again and return later; partial progress is kept between visits.
- The Starter member limit applies. The product does not invent pricing, upgrades or procurement behavior.
- Members (once added) work in projects but cannot manage workspace settings, billing or plan choice.

## Primary users and outcomes
The primary user is a returning workspace owner who may be confused about what they already did, what remains, and whether starting over is safer than continuing. They need to see their prior progress accurately, resume at the point of abandonment, and create their first project. The product goal is activation through a first meaningful project, not completion of a checklist they already partly finished.

## Constraints and risks
- Do not re-ask for the workspace name or plan the owner already provided; show what is done and let them change it if they want.
- Do not mark completed steps as pending, and do not restart the owner at step one. Making them repeat finished setup will feel broken.
- Keep the return path short and skippable: resume, create a project, continue. Do not gate the project on invitations.
- Explain role capabilities before the owner invites anyone; do not imply invited members can manage settings or billing.
- Include validation, loading, success, invitation-failure and leave-again states. Include an empty state that distinguishes "no projects yet, setup incomplete" from a fresh workspace.
- Do not invent analytics, research, integrations, templates or backend behavior.
- Use the supplied project's stack and design system when a codebase is provided.

## Task prompt
Design the return experience for this owner. First decide what the product should say and show on return, what to honor from prior progress, what to let them change, and what the smallest path to a first project is. Then design and implement a responsive experience or provide a detailed framework-neutral specification if implementation is unavailable.

## Expected deliverables
- Compact product model with facts, assumptions and unknowns separated.
- Return journey: restored context, confirmed prior progress, first-project creation, optional invitation.
- Rationale for what is honored, changed or skipped, and how interruption is handled.
- Responsive UI or detailed specification.
- Empty, validation, loading, success and recoverable error states.
- Short review of re-activation risks and unresolved product questions.

## Reviewer questions
- Does the experience honor the owner's existing progress instead of restarting them?
- Can the owner tell what is done, what remains and what changed since they left?
- Can a solo owner reach a useful first project without inviting anyone?
- Does it avoid re-asking for the workspace name and plan?
- Are role capabilities and the Starter limit understandable before action?
- Can the owner leave and return again without losing progress?
- Does the experience avoid unnecessary setup and fabricated capabilities?
