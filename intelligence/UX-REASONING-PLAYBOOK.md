# UX Reasoning Playbook

A practical method for turning a product request into a coherent user experience. Use the depth that the task deserves; this is not a mandatory document-generation process.

## 1. Frame the problem before drawing the screen

Write a short problem frame:

- **User:** who is doing the task, and in what role or situation?
- **Job:** what are they trying to accomplish?
- **Trigger:** what brought them here now?
- **Success:** what should they understand, decide or complete?
- **Constraints:** what is known about data, permissions, platform, policy and technology?

Separate facts from assumptions. Do not turn an assumption into a product requirement or invent research to fill a gap.

Ask a question only when its answer could materially change the experience. Otherwise state the assumption and continue.

## 2. Map the task, not just the page

Describe the shortest trustworthy path from the user's starting point to success:

1. What does the user need to know before acting?
2. What decision must they make?
3. What action can they take?
4. What feedback confirms the result?
5. If the action fails, what can they do next?

For multi-step work, identify entry points, decision points, exits and recovery paths. Remove steps that do not help the user make progress or understand consequences.

## 3. Find friction and rank it

Look for:
- Missing or ambiguous information at the moment of decision.
- Unclear ownership, permission or responsibility.
- Hidden consequences, irreversible actions or surprise costs.
- Repeated work, unnecessary navigation or avoidable memory burden.
- Unclear system status, silent failures or dead ends.
- Content that makes users interpret internal terminology.

Rank issues using four questions rather than a false-precision score:

| Dimension | Ask |
|---|---|
| Reach | How many users or task attempts are affected? |
| Impact | How much does it obstruct the task or damage trust? |
| Frequency | How often is the situation likely to occur? |
| Confidence | Is this observed, specified or only hypothesized? |

Address severe blockers and trust risks before cosmetic improvements. State uncertainty where evidence is weak.

## 4. Choose an information and interaction model

Group information by the user's mental model and decisions, not by database tables or internal teams.

For each group, decide:
- What must be visible immediately?
- What can be progressively disclosed?
- What belongs together because users compare or act on it together?
- What should be separated because it has different risk or permission?
- What is the primary action, and what is secondary?

Prefer one clear primary action per decision context. Do not hide important status, costs, limits or consequences behind vague labels.

## 5. Design the full state model

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

Do not add artificial states that the system cannot actually distinguish. Match messages to real backend and product behavior.

## 6. Make the content do UX work

Use labels that describe the user's concepts and actions. Prefer concrete verbs and explain consequences before commitment.

- Put units, billing periods, dates and limits next to the values they qualify.
- Distinguish current state from a proposed change.
- Avoid success language until the system confirms success.
- Make errors actionable; preserve user input when possible.
- Explain unavailable actions without exposing sensitive information.

## 7. Check the visual hierarchy against the task

A user should be able to scan and answer:
- Where am I?
- What is the current state?
- What matters most?
- What can I do next?
- What happens if I do it?

Use size, position, spacing, grouping and contrast to express importance. Reserve strong emphasis for genuinely important information or actions. Avoid giving every card, metric or button equal visual weight.

## 8. Validate the riskiest assumptions

Choose checks that match the design risk:
- Walk through the primary journey with realistic content.
- Test a restricted role as well as the privileged role.
- Inspect destructive and recovery paths.
- Check keyboard operation, focus, labels and semantics.
- Inspect narrow and wide viewports.
- Use a browser preview to catch actual layout and interaction defects when available.

Record what was tested and what remains uncertain. A design review is not evidence that a flow works; a checklist is not a substitute for running the interface.

## 9. Recommend with trade-offs

When more than one approach is viable, compare only meaningfully different options. Explain:
- Which user problem each option solves best.
- What it makes easier or harder.
- Its operational, accessibility or trust risks.
- Why the recommendation fits the current evidence.

Recommend one direction when context supports it. Do not manufacture alternatives for a trivial task.

## Lightweight output format

For substantial work, a concise design note is usually enough:

1. Problem and user goal.
2. Key assumptions and constraints.
3. Main journey and information hierarchy.
4. Highest-risk UX issues.
5. Chosen approach and trade-offs.
6. Important states and responsive behavior.
7. Validation performed and open questions.

Use UDS or other structured artifacts only when the design intent needs to persist, be compared or be reused.
