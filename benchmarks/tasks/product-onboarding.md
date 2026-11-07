# Benchmark Task: First-Run Product Onboarding

Task version: 1.0.0

## Scenario
You are designing first-run onboarding for a B2B collaboration product used by small teams. A workspace owner has just created an account and needs to reach a useful first outcome without being forced through setup that may not apply.

## Product facts
- A workspace contains projects and members.
- Roles are Owner, Admin and Member.
- The Owner controls billing and workspace deletion.
- Owners and Admins can create projects and invite or remove members.
- Members can work in projects but cannot manage workspace settings or billing.
- The Starter plan supports up to 5 members; the Team plan supports up to 25.
- Inviting teammates is optional. A solo user must be able to create a project and continue.
- The user can skip onboarding and return to setup later.
- No external integrations or automatic data imports are available in this scenario.

## Primary users and outcomes
The primary user is a new workspace owner, often setting up the product while also trying to complete real work. They need to understand the workspace, create their first project, optionally invite teammates, understand roles and limits, and know what to do next.

The product goal is activation through a first meaningful project—not completion of a long checklist. Do not make invitations a prerequisite for solo progress.

## Constraints and risks
- Keep the first-run path short and skippable.
- Explain role capabilities before the user assigns roles.
- Show the Starter member limit without inventing pricing or upgrade behavior.
- Avoid asking for information that can be collected when it becomes relevant.
- Include validation, loading, success, invitation failure and return-later states.
- Do not invent analytics, customer research, integrations or backend behavior.
- Use the supplied project's stack and design system when a codebase is provided.

## Task prompt
Understand the product and the new owner's context. Identify the smallest useful path to first value, decide what belongs in onboarding versus later setup, and explain the important trade-offs. Then design and implement a responsive onboarding experience or provide a detailed framework-neutral specification if implementation is unavailable.

## Expected deliverables
- Compact product model with facts, assumptions and unknowns separated.
- Primary journey and rationale for what is included, deferred or skippable.
- Project creation and optional invitation flow, including role explanation.
- Responsive UI or detailed specification.
- Empty, validation, loading, success and recoverable error states.
- Short review of activation risks and unresolved product questions.

## Reviewer questions
- Can a solo owner reach a useful project without inviting anyone?
- Does the flow explain why each requested input is needed?
- Are role capabilities and member limits understandable before action?
- Can the user skip and resume without losing progress?
- Does the experience avoid unnecessary setup and fabricated capabilities?
- Is the next step after onboarding obvious?
- Does the visual hierarchy make the path feel manageable rather than bureaucratic?
