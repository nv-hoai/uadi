# UADI Design Intelligence Benchmark

This benchmark tests whether UADI improves an agent's design work—not whether it follows more steps.

## Run a paired comparison

1. Choose one host agent and model. Keep model version, tool access, temperature/settings and task context the same.
2. Run the task once without UADI and once with UADI. Start each run from the same clean project snapshot.
3. Randomize which output is reviewed first. Remove labels that reveal which run used UADI.
4. Have at least two reviewers score each output independently using the rubric below.
5. Record elapsed time, tool calls if available, implementation result and checks actually run.
6. Compare scores and reviewer notes. Do not claim an improvement from a single run; repeat with multiple tasks and runs.

Use the task in [subscription-settings.md](subscription-settings.md). A working [reference implementation](../examples/subscription-settings/README.md) is available to inspect its interaction model and rationale; do not treat it as the only acceptable design.

## Scoring rubric

Score each dimension from 0 to 4:

- **0 — Missing or harmful:** absent, misleading or actively makes the experience worse.
- **1 — Weak:** major gaps; user goals or interaction needs are poorly served.
- **2 — Adequate:** works at a basic level but has notable usability or coherence gaps.
- **3 — Strong:** clear, coherent and well suited to the task, with only minor gaps.
- **4 — Excellent:** thoughtful, polished, robust and clearly justified by the context.

| Dimension | Weight | What reviewers assess |
|---|---:|---|
| Product understanding | 15% | Correctly identifies users, goals, constraints and business context |
| UX reasoning | 20% | Task flow, information architecture, friction, edge cases |
| Design judgment | 15% | Appropriate choices, meaningful trade-offs, rationale |
| Visual hierarchy | 15% | Scanability, typography, spacing, density and visual coherence |
| Interaction completeness | 15% | States, feedback, validation, recovery and predictable behavior |
| Accessibility and responsiveness | 10% | Keyboard, semantics, contrast and relevant viewport behavior |
| Implementation quality | 10% | Working result, maintainability and fit with existing conventions |

Weighted score = sum of (dimension score / 4 × dimension weight). Maximum 100.

## Results template

| Run | Product | UX | Judgment | Visual | Interaction | A11y/responsive | Implementation | Weighted total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Without UADI | | | | | | | | |
| With UADI | | | | | | | | |

Also record:
- Host agent and model/version.
- Run date and project snapshot identifier.
- Reviewer notes and highest-impact defects.
- Time to first useful result and total completion time.
- Tests actually executed and their outcomes.

## Interpretation

A higher score is not automatically a win if it required disproportionate time or produced unnecessary artifacts. Review quality, task completion and effort together. Report sample size and variation. Keep raw outputs so results can be independently inspected.

This is an evaluation protocol, not a claim that UADI already outperforms a baseline.
