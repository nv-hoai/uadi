# Pattern: Onboarding and Activation

## User problem

New users need to reach a meaningful first outcome while learning enough to proceed confidently. Onboarding fails when it optimizes for setup completion, feature tours or data collection instead of helping users make progress.

## Start with the activation outcome

Define activation as an observable user outcome that demonstrates real value—not a page view, checklist completion or invitation sent.

Before designing steps, establish:
- The user's role, trigger and immediate job.
- The smallest meaningful outcome they can reach.
- What must be true before that outcome is possible.
- Which setup tasks are genuinely prerequisites versus optional improvements.
- What evidence can confirm completion.

If activation is not defined by product evidence, state a working hypothesis. Do not invent conversion targets or claim a step improves retention without measurement.

## Design the shortest trustworthy path

1. Orient the user: explain where they are and what they can accomplish.
2. Ask only for information needed to reach the first outcome.
3. Let users do meaningful work before requesting optional setup.
4. Explain choices at the moment they matter, not in a front-loaded tour.
5. Confirm the result and make the next useful action clear.

Remove steps that do not reduce risk, enable the outcome or help the user understand a consequential choice.

## Make optional work genuinely optional

- Do not require invitations, integrations, profile completion or preferences unless the core task depends on them.
- Provide a clear skip or defer action and explain what can be completed later.
- Preserve progress when users leave and return, if the product supports persistence.
- Do not imply that skipped setup is complete.
- Offer a relevant next step after the first outcome instead of restarting the setup checklist.

If a prerequisite is real, explain why it is needed and what the user can do if they cannot complete it.

## Teach through the task

Prefer contextual guidance beside the relevant control over a generic feature tour. Explain unfamiliar concepts in the language users need to make the current decision.

- Show role capabilities before a user assigns roles.
- Explain plan limits before users encounter them.
- Use examples that reflect the actual product domain.
- Avoid asking users to configure options whose defaults are safe and reversible.
- Distinguish sample/demo data from the user's real data.

## Design the state and return model

Consider the states the product can actually support:

| State | Design response |
|---|---|
| New | Give one clear starting action and a concise value proposition |
| In progress | Show meaningful progress without turning every optional task into a blocker |
| Skipped / deferred | Preserve a visible route back to unfinished setup |
| Blocked | Explain the prerequisite, permission or limit and the legitimate resolution |
| Success | Confirm the first outcome and point to the next useful action |
| Interrupted | Restore progress where supported; otherwise explain what must be repeated |
| Empty result | Explain what is missing and how to create or find it |

Do not promise save-and-resume, automatic imports or background completion unless the product supports them.

## Measure without confusing activity for value

Choose a small set of observable events tied to the activation hypothesis:
- Start of the onboarding journey.
- Completion of the meaningful first outcome.
- Time to that outcome.
- Abandonment or blocking point.
- Optional setup completion, reported separately from activation.

Define event meaning and denominator before comparing variants. Segment by relevant role or entry path when evidence supports it. Do not optimize invitation rate or checklist completion if doing so makes the first outcome harder to reach.

## Accessibility and responsive behavior

- Make skip, continue and back actions keyboard reachable and clearly named.
- Announce step or completion changes to assistive technology.
- Keep progress understandable without color alone.
- Avoid time-limited steps and interaction patterns that prevent users from pausing.
- Reflow forms and task steps for narrow screens without hiding the primary action.

## Common failures

- Treating account setup as the user's goal.
- Requiring invitations before a solo user can get value.
- Showing a long checklist with no meaningful prioritization.
- Hiding skip or defer controls.
- Teaching every feature before the user needs it.
- Losing progress after interruption.
- Measuring setup activity as if it proved product value.
- Claiming activation or retention improvements without real evidence.

## Trade-offs

A shorter path can reduce friction but may defer information users need to make a safe choice. Progressive disclosure reduces initial load but can hide important constraints. Checklists can orient users but become coercive when optional work is presented as required. Choose based on prerequisite reality, user risk and observed behavior.
