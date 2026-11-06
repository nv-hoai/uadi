# Worked example: first-run product onboarding

This example connects product evidence, UX critique, design decisions and a runnable interface. It is based on the repository's [first-run onboarding benchmark scenario](../../benchmarks/tasks/product-onboarding.md), not on claimed customer research.

## Run the prototype

From the repository root:

~~~bash
python3 -m http.server 8000
~~~

Open `http://localhost:8000/examples/product-onboarding/`.

The prototype is plain HTML, CSS and JavaScript: no dependencies, API, account or build step. It is an interaction example, not a production onboarding service. Project creation and invitations are simulated locally; nothing is persisted or sent.

## 1. Evidence synthesis

Start from what the task actually supplies. Do not upgrade assumptions into research findings.

| Evidence class | What we know | Design consequence |
|---|---|---|
| **Confirmed — scenario** | A workspace contains projects and members; Owners and Admins can create projects and invite/remove members | Project creation and role-aware invitations are legitimate parts of the flow |
| **Confirmed — scenario** | Members can work in projects but cannot manage workspace settings or billing | Explain role capabilities before assigning a role |
| **Confirmed — scenario** | Starter supports up to 5 members; inviting teammates is optional | Show the limit as context; never block a solo owner on invitations |
| **Confirmed — scenario** | Users may skip onboarding and return to setup later | Provide a visible skip path and avoid treating checklist completion as activation |
| **Confirmed — product goal** | Activation means reaching a first meaningful project, not completing a long checklist | Make project creation the primary path and invitations a secondary choice |
| **Assumption — prototype** | A project name is sufficient to demonstrate the first project outcome | Ask only for a name; keep project description optional |
| **Unknown — production behavior** | Whether partially completed setup is persisted across sessions | Do not claim resume works; a real implementation must verify persistence |
| **Unknown — product policy** | Invitation expiry, email delivery, seat counting and upgrade behavior | Do not invent these details or imply invitations were sent |

No analytics, interviews, conversion rates or customer quotes are supplied. The example makes no empirical claim about activation lift.

## 2. Design critique

A weak default onboarding pattern often treats setup as a checklist. Against the supplied facts, the highest-risk problems are:

| Priority | Critique | Evidence / confidence | Consequence |
|---|---|---|---|
| **P1 — blocker** | Requiring invitations before project creation | Direct conflict with the confirmed solo-user requirement; high confidence | Solo users cannot reach first value |
| **P1 — trust** | Offering role choices without explaining permissions | Role rules are explicit; high confidence | Owners may grant broader access than intended |
| **P2 — friction** | Asking for profile, integrations or preferences before a project exists | Those are not prerequisites in the scenario; high confidence | More work before the user can do useful work |
| **P2 — comprehension** | Showing a member limit without the plan context | Starter limit is confirmed; high confidence | Users cannot tell whether the limit is relevant |
| **P3 — polish** | Giving every setup task equal visual weight | Design judgment, not user evidence; medium confidence | The primary action competes with optional work |

Priorities are qualitative, not measured severity scores. The first two are addressed before visual refinements because they can block progress or create permission mistakes.

## 3. Design decisions

- **Project first:** the first screen asks for one required input. The description is optional because it is not a stated prerequisite.
- **Invite second, never mandatory:** invitation is a separate step with an explicit “Do this later” action.
- **Explain roles at decision time:** the role selector updates a plain-language permission explanation. The scenario's facts are shown without adding capabilities.
- **Expose the member limit in context:** “Up to 5 people” is visible beside the invitation decision, without inventing pricing or upgrade behavior.
- **Make skipping honest:** users can skip invitations or the entire demo. The interface does not claim setup was saved or a project was created on a server.
- **Keep the next action clear:** the completion state directs the user toward project work rather than restarting a checklist.

## 4. Implementation and interaction coverage

Open `index.html` to inspect the complete implementation. It uses semantic forms, associated labels, inline validation, keyboard-focus styling, an announced role explanation, responsive layout and explicit prototype-only messaging.

| Interaction | Implemented behavior |
|---|---|
| Empty project name | Blocks progression, announces the error and focuses the field |
| Valid project name | Advances to optional invitation |
| Member / Admin selection | Explains the corresponding capabilities |
| Invalid invitation email | Shows an actionable error; no invitation is sent |
| Skip invitation | Completes the local demo without an invite |
| Skip setup | Reaches a truthful “ready when you are” state |
| Back / restart | Returns to the earlier step or resets the local demo |

The prototype intentionally does **not** implement persistence, authentication, project APIs, email delivery, analytics or backend error simulation. Those require real product contracts.

## 5. Review and validation plan

The source implements the listed paths, but this repository change has not been browser-tested. Before treating it as production-ready:

1. Run the prototype at narrow and wide viewport sizes.
2. Complete the project path with a valid name and with an empty name.
3. Test invitation with blank, malformed and valid email input.
4. Switch roles and verify the permission explanation.
5. Skip invitations, skip the whole flow, go back and restart.
6. Test keyboard-only operation and a screen reader announcement of validation and role changes.
7. In a real product, verify persistence, authorization, invitation delivery and server error recovery against actual APIs.

## What this example demonstrates

Evidence sets the boundaries. Critique ranks the problems. Design decisions explain the trade-offs. The prototype makes the chosen path inspectable. Validation is reported separately from implementation, so a runnable demo is not mistaken for proof of usability or business impact.
