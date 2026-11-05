# Product Understanding Playbook

Understand the product before deciding what its interface should do. The goal is a useful working model of the product—not a long discovery report.

Use this playbook for new features, unfamiliar codebases, complex journeys or changes whose UX depends on business rules. For a small visual adjustment with clear context, inspect the relevant area and keep moving.

## 1. Inspect evidence before asking questions

Start with the material already available:

- Product briefs, README files, help content, release notes and existing decisions.
- Current screens, navigation, onboarding and important user journeys.
- Routes, components, domain types, API contracts, validation rules and permissions.
- Tests, fixtures, seed data and realistic examples.
- Existing design tokens, component libraries and content conventions.
- Analytics, support themes or research notes only when they are actually available.

Prefer observed behavior and explicit product rules over guesses. Existing UI is evidence of what was implemented, not proof that the experience is correct. Code structure explains implementation; it does not automatically explain the user's mental model.

Do not read every file indiscriminately. Follow the task through the smallest set of relevant screens, modules and tests. Respect repository security boundaries and never expose secrets.

## 2. Build a compact product model

Answer the parts that matter to the task:

| Area | Understand |
|---|---|
| Product promise | What value does the product provide, and why would someone choose it? |
| Users and roles | Who uses it, in what situation, with what permissions and expertise? |
| Jobs and triggers | What are users trying to accomplish, and what causes them to do it now? |
| Domain concepts | What are the important objects, states, relationships and terms? |
| Core journeys | What do users do before, during and after this feature? |
| Business model | What creates value, cost, revenue, limits or operational obligations? |
| Success | What user outcome and business outcome should improve? |
| Constraints | What is fixed by policy, brand, platform, data, technology or time? |

Do not fill every row for every task. Include only context that can change the design.

## 3. Understand the user's real task

For the primary user, establish:

- **Situation:** where they are, what they know and what prompted the task.
- **Motivation:** the outcome they want, not merely the screen they requested.
- **Current alternative:** how they solve it today, including workarounds.
- **Decision:** what they must understand or choose.
- **Completion:** what observable result tells them the task succeeded.
- **Anxiety or risk:** what could cost time, money, access, trust or important data.

Distinguish the user's language from internal product terminology. Translate internal states and system concepts into terms users can understand.

## 4. Map roles, objects and rules

Before designing controls, identify the domain rules that affect the experience:

- Which roles can view, create, change, approve or remove each resource?
- Who owns an object, and can ownership change?
- Which states can an object enter, and which transitions are allowed?
- What limits, billing rules, dependencies or prerequisites affect an action?
- Which changes are immediate, scheduled, reversible or irreversible?
- What happens to related users, records or access when an object changes?

Represent only rules supported by evidence. If behavior is unknown, mark it as an open question instead of inventing a backend capability or product policy.

## 5. Separate facts, assumptions and unknowns

Use explicit confidence labels in notes:

- **Confirmed:** directly stated by the user or supported by authoritative product behavior or documentation.
- **Observed:** visible in the current implementation or supplied evidence, but not necessarily an intended rule.
- **Assumption:** a plausible working hypothesis used to make progress.
- **Unknown:** information not available yet.

For important assumptions, record what would change if they were false. Never invent user research, analytics, customer quotes, conversion rates or business policies.

## 6. Ask only decision-changing questions

Ask a question when different answers would lead to meaningfully different UX, permissions, content, states or implementation.

Prioritize questions by:
1. Impact if answered incorrectly.
2. How likely the answer is to change the design.
3. Whether reliable evidence can be inspected instead of asking the user.

Ask the smallest useful question, preferably at the moment the answer is needed. Do not make the user complete a broad questionnaire just because a template has empty fields. If the uncertainty is low-risk, state an assumption and continue.

## 7. Connect product understanding to design decisions

For each important decision, be able to explain:

- Which user goal or product rule it supports.
- Which evidence or assumption it relies on.
- What other plausible approach was considered.
- What trade-off or risk it introduces.
- How the result could be checked.

A feature request is not automatically the right solution. If the requested UI conflicts with the underlying user goal, explain the conflict and recommend a better path.

## Lightweight product brief

For substantial work, keep a compact note:

1. Product and feature purpose.
2. Primary user, role and situation.
3. User job and success outcome.
4. Relevant domain objects, states and rules.
5. Business and technical constraints.
6. Confirmed facts, assumptions and important unknowns.
7. UX implications and questions that could change the design.

Use the existing project context or discovery artifact when it helps preserve this information. Do not create a new document for every small task.

## Example

The [subscription settings reference example](../examples/subscription-settings/README.md) shows product rules becoming interface decisions: plan limits become seat usage, role permissions shape available actions, billing cadence becomes a comparison control, and cancellation consequences are explained before commitment. Its sample prices and account details are illustrative—not product facts.
