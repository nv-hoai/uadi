# Design Decisions Playbook

A method for exploring meaningfully different directions, comparing them on the same evidence and explaining why one is recommended. Use it when a decision is consequential or ambiguous; a small local change usually needs only a focused rationale.

## 1. Decide whether alternatives are warranted

Explore alternatives when:

- The consequence is high or reversal is costly.
- The problem, user group or policy is ambiguous.
- Different information architectures or task flows are plausible.
- Stakeholders value different outcomes.
- The current approach is a default or habit rather than evidence.
- The requested solution may not solve the underlying job.

Do not manufacture alternatives when:

- A small, local change fits an established pattern.
- A hard constraint leaves one viable path.
- The owner explicitly asks for one direction and the trade-offs are understood.
- The "alternatives" would differ only in color, copy or decoration.

If you present one direction, still state the main trade-off and the alternative you rejected.

## 2. Frame the decision

Write a short decision frame:

- **Decision question:** one sentence describing what must be chosen.
- **Owner and affected people:** who decides, and who experiences the result.
- **Must-pass gates:** safety, policy, accessibility, compatibility, entitlement or other non-negotiables.
- **Comparison criteria:** what matters, and how much relative to the others.
- **Constraints and non-goals:** what the decision must not change.
- **Evidence, assumptions and unknowns:** what is known and what could change the answer.
- **Reversibility and cost of being wrong:** how hard it is to undo and who pays for a mistake.

Separate "must be true" from "we prefer". A direction that fails a must-pass gate is not a candidate, regardless of how appealing it is.

## 3. Generate materially different directions

Directions should differ in how the user understands or completes the task, not in surface styling. Useful axes:

| Axis | Different directions might choose |
|---|---|
| Information architecture | Overview first versus progressive disclosure; one page versus steps |
| Task flow | Self-service versus assisted; immediate versus scheduled; single actor versus handoff |
| Interaction model | Inline versus modal; table versus cards; bulk versus per-item |
| Defaults and automation | Manual control versus safe defaults; opt-in versus opt-out |
| Permissions | One role versus two-person control; centralized versus delegated |
| Recovery | Undo versus confirmation versus a support path |
| Density | Scan-heavy versus focus-heavy |
| Build approach | Existing component versus a new pattern; reuse versus custom |

For each direction, define:

- The user problem it solves best.
- The primary flow and where it differs.
- The conditions under which it is a good fit.
- Its main cost or risk.
- What evidence would make it the better choice.

Include the status quo or "do the minimum" option when it is a real alternative. Do not present a deliberately weak strawman. Two or three coherent directions are usually enough; more increases comparison cost without adding decision value.

## 4. Compare on the same evidence

Use one comparison table with the same criteria for every direction. A compact shape:

| Criterion | Why it matters | Direction A | Direction B | Direction C |
|---|---|---|---|---|
| Must-pass gate | Consequence of failure | Pass / fail | Pass / fail | Pass / fail |
| User outcome | How directly it completes the job | Strong / weak + reason | Strong / weak + reason | Strong / weak + reason |
| Risk and recovery | What can go wrong and how it is repaired | ... | ... | ... |
| Cost and effort | Implementation, operations and support | ... | ... | ... |
| Confidence | Quality of the evidence behind the judgment | High / medium / low | High / medium / low | High / medium / low |

- Check must-pass gates first; mark a direction **not viable** if it fails.
- Use qualitative judgments with a reason, not a false-precision score.
- Separate user benefit from implementation effort and operational cost.
- Mark unknown evidence as unknown; do not fill it with optimism.
- Compare against the same requirements, constraints and user tasks.
- Include accessibility, trust, security, reversibility and maintenance where relevant.
- Show who bears each cost: end user, admin, support, engineering or finance.
- State the confidence behind each important judgment.

A weighted score can summarize a comparison, but it must not hide a failed gate or an unknown that could reverse the decision.

## 5. Write rationale that can be inspected

A useful rationale answers:

- What decision was made, and for whom?
- Which evidence and requirements drove it?
- Which alternatives were considered?
- Why the chosen direction fits better than the others.
- What trade-offs are accepted, and who bears them.
- What remains uncertain or would change the decision.
- What was actually validated.

Avoid:

- "Best practice" without context.
- Claims of user preference, research or analytics that were not collected.
- Listing only benefits.
- Rationalizing a decision that was already made.
- Treating a prototype as proof of usability or business impact.

Rationale is a decision record, not marketing copy.

## 6. Make trade-offs explicit

Write trade-offs as benefit/cost pairs:

| Benefit | Cost | Who bears it | When it appears | Mitigation or condition |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

Consider categories:

- User effort, comprehension and trust.
- Accessibility and inclusion.
- Security, privacy and policy.
- Operational and support burden.
- Implementation and maintenance.
- Cost, revenue and plan entitlement.
- Time to ship and reversibility.

A trade-off is not "we can improve it later" unless there is a concrete plan and the current cost is acceptable. Some costs are not tradeable: violating a safety, accessibility or policy requirement is not justified by convenience.

## 7. Choose and record

- Recommend one direction when the evidence supports it; otherwise present the decision to the owner.
- State the recommendation in one sentence, then the strongest reason.
- Name the rejected directions and the reason each lost.
- Record material assumptions and the evidence that would change the recommendation.
- Keep proposals immutable and versioned. A new decision creates a new revision; it does not rewrite history.
- Approval is explicit. Generating or recommending a proposal is not approval.

When using `design-proposal.schema.json`, keep the decision record aligned:

- `direction` names the bet in one sentence.
- `rationale.summary` explains why it fits the evidence.
- `rationale.target_users` and `rationale.ux_strategy` capture who it serves and how it works.
- `tradeoffs` holds benefit/cost pairs, not vague caveats.
- `approval_status` stays `PENDING` until a human owner decides.

A proposal is not a comparison table by itself. Keep the comparison and the rejected directions in the surrounding decision note.

## 8. Validate the decision

Prototype or test the riskiest assumption, not every detail:

- The differentiator between directions.
- The primary flow with realistic content.
- The most consequential branch or edge case.
- A restricted role, failure, recovery and interruption.
- The content that carries the decision.
- The rendered result at relevant viewports.

Record what was tested, in what environment, with what result and what remains uncertain. If validation contradicts the rationale, revise the decision instead of defending it.

## 9. Worked comparison: SSO enforcement

The [SSO discovery example](../examples/sso-discovery/README.md) compares three permission models. A compact version:

| Criterion | One toggle | Owner-only | Two-person control |
|---|---|---|---|
| Admin autonomy | High | Low | Medium |
| Risk of workspace lockout | High | Medium | Lower |
| Matches published help center | No | No | Partly |
| Recovery clarity | Low | Medium | Higher |
| Implementation change | Small | Small | Moderate |
| Trust in the decision | Low | Medium | Higher |

The evidence did not support choosing unilaterally. Discovery asked who may enforce SSO and what recovery exists. The example's simulated owner chose two-person control: Admins configure, Owners enforce, and an Owner-only recovery link exists before enforcement. The trade-off is slower admin work and an extra Owner step; the benefit is a lower lockout risk and a clearer accountability boundary. The rationale is inspectable in the [design brief](../examples/sso-discovery/artifacts/02-resolved/design-brief.md).

## Lightweight output format

For a substantial decision:

1. Decision question and owner.
2. Must-pass gates and comparison criteria.
3. Two or three materially different directions.
4. Comparison table with evidence and uncertainty.
5. Recommendation and rationale.
6. Trade-offs and who bears them.
7. Validation performed and what would change the decision.

For a small change, one paragraph covering the decision, the main alternative and the trade-off is enough.

## Common failure modes

- Generating color variants and calling them alternatives.
- Presenting a strawman to make the preferred option look inevitable.
- Comparing directions against different criteria or evidence.
- Using invented scores, research or precision to settle a judgment call.
- Listing benefits without costs or naming who bears them.
- Hiding a failed must-pass gate behind a weighted average.
- Treating the owner's silence as approval.
- Defending a decision after validation contradicts it.
