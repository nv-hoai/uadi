# UX Reasoning Playbook

A practical method for turning a product request into a coherent user experience. It covers the task flow, the edge cases that change the experience, the information model, the content and the states. Use the depth that the task deserves; this is not a mandatory document-generation process.

## 1. Frame the problem before drawing the screen

Write a short problem frame:

- **User:** who is doing the task, and in what role or situation?
- **Job:** what are they trying to accomplish?
- **Trigger:** what brought them here now?
- **Success:** what should they understand, decide or complete?
- **Constraints:** what is known about data, permissions, platform, policy and technology?

Also note the current workaround and what would make the user abandon the task. They often reveal more about the real friction than the requested screen does.

Separate facts from assumptions. Do not turn an assumption into a product requirement or invent research to fill a gap.

Ask a question only when its answer could materially change the experience. Otherwise state the assumption and continue.

## 2. Map the task flow, not just the page

A screen is one moment in a flow. Model the shortest trustworthy path from the user's starting point to a confirmed outcome. Then add only the branches that change what the user sees, decides or can do.

### Find the spine

Write the primary journey as a short sequence:

**Trigger → entry → context → decision → action → confirmation → next step**

For each moment, ask:

1. What does the user need to know before acting?
2. What decision must they make?
3. What action can they take?
4. What feedback confirms the result?
5. If the action fails, what can they do next?
6. Where does the user go when the task is finished or abandoned?

If a step does not help the user make progress or understand consequences, remove it or move it out of the primary path.

### Branch where the experience changes

A branch deserves design attention when it changes the interface, the copy or the available action. Common branch types:

| Branch | Questions to ask | Design consequence |
|---|---|---|
| Actor, role or ownership | Who is acting? Who owns the object? Can they delegate? | Different controls, explanations or handoff paths |
| Object state | Is the object new, active, paused, expired, archived or deleted? | Different primary action and state copy |
| Prerequisite or entitlement | Is setup complete? Does the plan include the capability? | Block, explain, or route to the prerequisite |
| User choice | Which path did the user choose? | Different fields, confirmation or next step |
| Data availability and quality | Is data loading, missing, partial, stale or invalid? | Loading, empty, partial and recovery states |
| External dependency | Is a provider, payment service or network unavailable? | Failure copy, retry or manual fallback |
| Time and concurrency | Does the action take effect now or later? Can another actor change the object first? | Effective dates, stale-state handling and conflict recovery |
| Environment and access | Is the user on a narrow screen, keyboard, slow connection or assistive technology? | Responsive and accessible behavior |
| Sequence and return | Is this a first visit, a return visit or a resumed task? | Continuity, saved state and changed-context warnings |

Do not diagram every internal code path. Branch only where the user's experience or decision changes.

### Model handoffs and continuity

Some tasks pass between people, roles or sessions. For each handoff, define:

- Who completed the previous step?
- What must the next person see to act without repeating work?
- How does the first person know the handoff happened?
- What happens if the next person is unavailable or the task is interrupted?

For interrupted or multi-session work, decide whether progress is saved, how the user returns to it, and how stale or changed data is shown. "Save draft" is not enough if the user cannot tell what was saved or whether it is still valid.

### Define exits and recovery

Every consequential flow needs a safe way out and a way back:

- Cancel before commitment, with a clear statement of what was and was not changed.
- Go back without losing entered values.
- Save and resume when the task is long or depends on information the user must gather.
- Undo or reverse when the product supports it.
- Retry when the failure is temporary; offer a different path when retry cannot work.
- Escalate to a person or documented support path when self-service recovery is impossible.
- Leave the object in a known safe state if the action fails partway through.

### Keep the flow compact

Use a numbered spine plus branch notes; a formal diagram is optional. For example:

```text
1. Open Security → 2. Load connection and plan → 3. Connect provider
   → 4. Require SSO → 5. Confirm scope, timing and recovery
   → 6. Enforced at next sign-in → 7. Turn off through a separate confirmation

Branches: role (Owner/Admin/Agent), plan (Scale/other), connection (none/connected),
enforcement (on/off), provider (available/unavailable), downgrade (unresolved).
```

### Worked flow trace: requiring SSO

A realistic trace shows how flow, edge cases and content depend on one another. The [SSO discovery example](../examples/sso-discovery/README.md) uses this flow.

**Spine:** Settings → Security → review connection → require SSO → confirm consequences and recovery → enforced → turn off later.

| Branch | Design response |
|---|---|
| Owner, Admin or Agent | Admin manages the connection; Owner enforces; Agent sees a permission-denied state |
| Plan includes SSO? | Explain the entitlement and the account-team path; do not sell inside security settings |
| Provider connected? | Block enforcement and explain the prerequisite |
| Enforcement already on? | Show the required state and a separate disable flow; do not reuse the enable control |
| Provider unavailable | The recovery link must exist before enforcement; support cannot bypass SSO |
| Plan downgrade while enforced | Product policy is unknown; record the assumption and ask rather than inventing behavior |

**Content that carries the flow:** the action is labelled **Require SSO**, not **Enable SSO**, because it changes every member's sign-in path. The dialog states scope, start time and the 24-hour session expiry. The confirmation stays disabled until the Owner downloads the recovery link and acknowledges that it was saved. The off state says that password sign-in returns and existing SSO sessions are not revoked.

**What to validate:** the Owner, Admin and Agent paths; no-provider, enforced, loading and error states; the recovery requirement; the disable confirmation; keyboard focus in the dialog; and the exact consequence copy with an Owner.

## 3. Find friction and rank it

Look for:

- Missing or ambiguous information at the moment of decision.
- Unclear ownership, permission or responsibility.
- Hidden consequences, irreversible actions or surprise costs.
- Repeated work, unnecessary navigation or avoidable memory burden.
- Unclear system status, silent failures or dead ends.
- Content that makes users interpret internal terminology.
- Flow-level friction: extra steps, forced handoffs, re-entry, waiting or context loss.

Rank issues using four questions rather than a false-precision score:

| Dimension | Ask |
|---|---|
| Reach | How many users or task attempts are affected? |
| Impact | How much does it obstruct the task or damage trust? |
| Frequency | How often is the situation likely to occur? |
| Confidence | Is this observed, specified or only hypothesized? |

Address severe blockers and trust risks before cosmetic improvements. State uncertainty where evidence is weak.

## 4. Derive edge cases systematically

An edge case is a realistic variation that changes what the user sees, decides or can do. It is not every imaginable failure. Derive them from the flow rather than waiting for someone to list them.

### Variation axes

| Axis | Questions to ask | Typical design response |
|---|---|---|
| Role and ownership extremes | Is there no owner, more than one owner, a last admin or delegated access? | Explain the rule, route to the right person, or block the action safely |
| Data volume and quality | Zero, one, many, long, duplicate, missing, stale or invalid records? | Empty, dense, partial, validation and recovery states |
| Object state and partial completion | Is setup half-finished, expired, archived or in conflict with another change? | Resume, repair, warning or safe default |
| Time and concurrency | Time zones, daylight saving, scheduled changes, retries or two actors editing at once? | Exact dates, effective times, stale-state checks and conflict recovery |
| Sequence and interruption | Back button, refresh, restored tab, resume later or a changed prerequisite? | Preserve work, revalidate context, explain what changed |
| External dependencies | Provider outage, timeout, rate limit, partial success or delayed webhook? | Failure copy, retry, manual fallback or pending state |
| Environment and access | Narrow screen, zoom, keyboard, screen reader, slow network or reduced motion? | Responsive layout, focus management and non-visual status |
| Policy, money and legal | Entitlement, proration, tax, retention, consent or regional rules? | Explain the rule or block for an explicit decision; do not guess |
| Language and locale | Translation length, right-to-left layout, date/number formats or local terminology? | Flexible layout, locale-aware values and translatable content |

### Triage edge cases

Not every edge case deserves the same treatment. Decide explicitly:

| Disposition | Use when | What to do |
|---|---|---|
| Design now | It changes the primary flow, safety or trust | Include it in the flow, states and content |
| Explain or guard | It is plausible and the user needs a safe message or prevention | Add validation, restriction, confirmation or recovery copy |
| Block for a decision | Product policy or backend behavior is unknown and could change the design | Record the question and its impact; do not invent behavior |
| Out of scope | It is real but not part of this change | Record it and the reason; do not imply it is handled |
| Test later | It cannot be resolved without data or a specific environment | State the uncertainty and the check that would resolve it |

- Prevent the error before writing a better error message.
- Distinguish "not allowed", "not available yet", "failed" and "nothing here".
- Preserve user work when an edge case interrupts the task.
- Do not add artificial states that the system cannot actually distinguish.
- Walk the edge case as a real task, not as a footnote to the happy path.
- If the edge case exposes a policy gap, ask one decision-changing question instead of choosing silently.

## 5. Choose an information and interaction model

Group information by the user's mental model and decisions, not by database tables or internal teams.

For each group, decide:

- What must be visible immediately?
- What can be progressively disclosed?
- What belongs together because users compare or act on it together?
- What should be separated because it has different risk or permission?
- What is the primary action, and what is secondary?

Prefer one clear primary action per decision context. Do not hide important status, costs, limits or consequences behind vague labels.

## 6. Design the full state model

For every important action or data region, consider the states that actually apply:

| State | Design question |
|---|---|
| Initial / loading | What can be shown before data is ready? Can the user understand what is happening? |
| Empty | Why is there no data, and what useful next step exists? |
| Ready | What information and actions are available? |
| Disabled / restricted | Why is this unavailable, and who can resolve it? |
| Submitting | Is duplicate submission prevented and progress communicated? |
| Success | What changed, and what should the user expect next? |
| Error | What failed, what was preserved, and how can the user recover? |
| Partial | Did some work succeed while other work failed? |

- Define state per region, not only per page. A page can be ready while one card is still loading or restricted.
- Define transitions: what causes each state, what the user sees, and which action remains available.
- Distinguish initial loading from refresh, empty from no results, disabled from restricted, and partial success from failure.
- Do not add artificial states that the system cannot actually distinguish. Match messages to real backend and product behavior.

## 7. Make content do UX work

Content is not decoration added after layout. Labels, consequences and state messages are how users understand what the system will do. Write the content for each decision moment before finalizing the layout; if the content cannot be made clear, the interaction is probably unclear too.

### Inventory content by moment

| Moment | Content job | Example |
|---|---|---|
| Entry | Orient the user: where they are, what this page controls and what state they are in | "Security" + "SSO is required for all members." |
| Choice | Name the decision and options in user language | "Require SSO" rather than "Enable security" |
| Consequence | State who, what, when, cost and reversibility before commitment | "Every member will sign in through Okta starting at their next sign-in." |
| Action | Use a verb that completes "I want to…" | "Download recovery link", not "Submit" |
| Progress | Say what is happening and whether the user can leave | "Saving… You can close this panel; we will notify you." |
| Success | Confirm what changed and what happens next | "SSO is now required. Existing sessions expire within 24 hours." |
| Failure | Say what failed, what was preserved and what to do | "We couldn't connect. Your current settings are unchanged. Check the URL and try again." |
| Empty or restricted | Explain why there is no data or no action, and who can resolve it | "Only Owners can require SSO. You can manage the connection." |
| Handoff or notification | Tell the next person what they need and the first person what happened | "Sent to the workspace Owner for approval." |

### Name concepts and actions clearly

- Use the user's term for the object, not the database or internal team name.
- Use one term consistently; do not alternate between "workspace", "account" and "organization" unless they are genuinely different.
- Prefer concrete verbs: "Remove member" is clearer than "Update"; "Require SSO" is clearer than "Enable security".
- Make the action label match the result. A button that says "Continue" should not be the final destructive action.
- Distinguish current state from the proposed change: "Currently monthly" versus "Switch to yearly".
- Avoid vague labels such as "Manage", "Configure" or "Submit" when a specific verb is available.
- Explain unfamiliar terms once, in place; do not rely on a separate glossary.

### Explain consequences before commitment

For any consequential action, answer:

- What exactly will change?
- Who or what is affected?
- When does it take effect?
- Is it reversible, and how?
- What does it cost, including proration, tax or plan change?
- What will be preserved or lost?
- What must the user do before or after?

Put the consequence next to the control, not in a help article. Separate a preview from a commitment. Do not imply that browsing options changes the current state.

### Write state messages that help

A useful message usually contains:

1. What happened or what is true.
2. What it means for the user's task.
3. What the user can do next, if anything.
4. What was preserved, when relevant.

| State | Include | Avoid |
|---|---|---|
| Loading | What is loading and whether the user can leave | A spinner with no context |
| Empty | Why it is empty and one legitimate next step | A generic illustration or an action the user cannot take |
| Restricted | Which rule applies and who can resolve it | A disabled button with no reason |
| Submitting | That the action is in progress and duplicate submission is prevented | An optimistic success message |
| Success | The confirmed result, effective time and next step | "Done!" before the system confirms |
| Error | What failed, what is unchanged and how to recover | "Something went wrong" or a raw error code |
| Partial | Which parts succeeded and which need attention | An all-or-nothing success or failure message |

Use the patterns for [status and recovery](patterns/status-and-recovery.md), [forms and validation](patterns/forms-and-validation.md) and [destructive actions](patterns/destructive-actions.md) for the detailed interaction treatment.

### Keep values, dates and limits honest

- Put units, billing periods and limits next to the value they qualify.
- Show exact dates when the user must plan around them; use relative time only when it is unambiguous.
- State the time zone for deadlines and scheduled changes.
- Distinguish "unknown", "not available", "zero" and "not applicable".
- Do not round in a way that changes the decision; if you round, say so.
- Show the current value and the proposed value together for a change.
- Avoid implying precision the system does not have.

### Keep tone and terminology consistent

- Prefer direct, calm, non-blaming language. Describe the system's behavior rather than accusing the user.
- Front-load the important information; put the next step before the explanation.
- Keep sentences short enough to scan, but do not strip out consequences.
- Avoid ALL CAPS, jargon, idioms and humor in error or security contexts.
- Make messages work when translated: avoid concatenated strings, ambiguous pronouns and text embedded in images.
- Check the longest plausible label and the narrowest viewport; do not let a button label or error truncate the meaning.

### Check content with realistic and awkward data

Review the interface with:

- The longest names, labels and values the product allows.
- Zero, one, many and missing records.
- A restricted role and a first-time user.
- A failed request and a partial success.
- A date in another time zone and a value the system cannot calculate.
- The actual terminology used by support, sales and the product.

Read the primary flow aloud. If a sentence does not tell the user what happened or what to do next, rewrite it or remove it.

## 8. Check the visual hierarchy against the task

A user should be able to scan and answer:

- Where am I?
- What is the current state?
- What matters most?
- What can I do next?
- What happens if I do it?

Use size, position, spacing, grouping and contrast to express importance. Reserve strong emphasis for genuinely important information or actions. Avoid giving every card, metric or button equal visual weight.

## 9. Validate the riskiest assumptions

Choose checks that match the design risk:

- Walk through the primary journey with realistic content.
- Walk each high-impact branch and edge case from Section 4.
- Test a restricted role as well as the privileged role.
- Test a first-time user and a returning user where continuity matters.
- Inspect destructive, failure, partial and recovery paths.
- Check content with long, empty, missing and error data.
- Check keyboard operation, focus, labels, semantics and announcements.
- Inspect narrow and wide viewports, zoom and reduced motion.
- Use a browser preview to catch actual layout and interaction defects when available.

Record the method, environment, result and limits for each check. A design review is not evidence that a flow works; a checklist is not a substitute for running the interface.

## 10. Recommend with trade-offs

When more than one approach is viable, compare only meaningfully different options. Explain:

- Which user problem each option solves best.
- What it makes easier or harder.
- Its operational, accessibility or trust risks.
- Why the recommendation fits the current evidence.
- Which edge cases remain unresolved, and what decision would resolve them.

Recommend one direction when context supports it. Do not manufacture alternatives for a trivial task.

## Lightweight output format

For substantial work, a concise design note is usually enough:

1. Problem and user goal.
2. Key assumptions and constraints.
3. Task-flow spine and consequential branches or handoffs.
4. Highest-risk edge cases and how each is handled or deferred.
5. Information hierarchy and content decisions.
6. Chosen approach and trade-offs.
7. Important states and responsive behavior.
8. Validation performed and open questions.

Use UDS or other structured artifacts only when the design intent needs to persist, be compared or be reused.

## Quick failure modes

- Designing the requested screen without the task flow.
- Mapping only the happy path and treating edge cases as afterthoughts.
- Inventing backend behavior, policy or recovery to make a flow look complete.
- Hiding a restriction instead of explaining it.
- Writing labels and error messages after the layout is fixed.
- Using "Submit", "Continue" or "Are you sure?" where a specific action and consequence are needed.
- Showing success before the system confirms it.
- Treating color as the only signal of state or permission.
- Adding steps, confirmations or handoffs that do not reduce a real risk.
- Claiming a flow was validated when only the source was reviewed.
