# UADI Design Intelligence Benchmark

This benchmark asks whether UADI helps the same AI agent produce better product understanding, UX decisions and interface outcomes without disproportionate time or process overhead. It evaluates outcomes, not checklist compliance or artifact count.

## Task set

Use all three tasks for a representative evaluation:

1. [Subscription settings](subscription-settings.md) — permissions, billing, sensitive actions and responsive settings.
2. [First-run onboarding](tasks/product-onboarding.md) — activation, progressive disclosure, optional setup and role understanding.
3. [Operations dashboard](tasks/operations-dashboard.md) — metric comprehension, information density, comparisons and investigation flow.

The [subscription settings reference implementation](../examples/subscription-settings/README.md) is one example, not the expected visual answer. Do not show it to the agent during a benchmark run.

## Paired study protocol

For each task, run at least three paired repetitions (nine pairs total):

1. Pin one host agent, exact model/version, settings and tool access for the entire study.
2. Start every run from the same clean project snapshot for that task. Do not let one condition inherit files or context from the other.
3. Run one baseline condition without UADI and one treatment condition with the installed UADI skill. Keep task prompt and time budget identical.
4. Randomize condition order per pair. Reset the working directory between runs.
5. Preserve prompts, transcripts, changed files, rendered screenshots and test outputs for both conditions.
6. Have at least two reviewers independently score both outputs. Hide condition labels and randomize review order.
7. Reviewers score the delivered product, not whether the agent mentioned UADI or followed its playbook.
8. Record elapsed time and checks actually executed. Do not count unrun tests as passing.
9. Repeat for all tasks. Report missing runs, deviations and failed implementations.

Use the same reviewers for both conditions in a pair. Reviewers should score independently before discussing disagreements.\n\n**Reviewer independence:** for a confirmatory result, use at least two human reviewers who did not produce either condition and who score independently. Two model calls, two models from the same provider, or two agents in one session are useful exploratory reviewers but do not count as independent human reviewers; label such a study exploratory and do not present it as meeting the protocol. Keep the condition-to-output mapping with a coordinator who does not score. The coordinator randomizes anonymous output IDs, removes condition hints and reveals the mapping only after all scores are locked.\n\n**What reviewers may score:** provide the same evidence types for both conditions. `visual_hierarchy` requires rendered screenshots or a runnable preview at the same target viewport(s); a prose-only UDS is insufficient evidence. Do not infer typography, spacing or composition from tokens alone. If a task cannot produce rendered evidence, mark visual hierarchy as not assessable in the study report and do not compare the overall weighted scores as if all seven dimensions were observed. The current scorer requires all dimensions, so use the visual dimension only when equivalent rendered evidence is available.\n\n**Run artifacts:** keep private raw study data out of version control. A recommended local layout is `benchmarks/runs/<study-id>/<pair-id>/{baseline,uadi,blind}/` with `prompt.md`, `transcript.md`, `changed-files/`, `screenshots/`, `test-output/`, and a coordinator-only `mapping.json`. Put the scored aggregate in a separate `results.json`; retain the exact clean project snapshot and tool/model settings in the study metadata. Randomize the first condition for each pair with a recorded coin flip or seeded randomization, then reset to the clean snapshot before the second condition. Never reuse a working directory or agent context between conditions.

## Scoring rubric

Score each dimension from 0 to 4:

- **0 — Missing or harmful:** absent, misleading or actively makes the experience worse.
- **1 — Weak:** major gaps; user goals or interaction needs are poorly served.
- **2 — Adequate:** works at a basic level but has notable usability or coherence gaps.
- **3 — Strong:** clear, coherent and well suited to the task, with only minor gaps.
- **4 — Excellent:** thoughtful, polished, robust and clearly justified by the context.

| Dimension | Weight | What reviewers assess |
|---|---:|---|
| Product understanding | 15% | Correct users, goals, domain rules, constraints; facts separated from assumptions |
| UX reasoning | 20% | Task flow, information architecture, friction, edge cases and recovery |
| Design judgment | 15% | Contextual choices, alternatives, rationale and trade-offs |
| Visual hierarchy | 15% | Composition, scanability, typography, spacing, density and visual coherence |
| Interaction completeness | 15% | States, feedback, validation, permissions and predictable behavior |
| Accessibility and responsiveness | 10% | Semantics, keyboard, contrast and relevant viewport behavior |
| Implementation quality | 10% | Working result, maintainability and fit with project conventions |

Weighted score = sum of (dimension score / 4 × dimension weight). Maximum 100.

## Record and calculate results

Start with [results.template.json](results.template.json). It contains one clearly synthetic example pair to verify the scorer; replace the entire sample with real observations before reporting any result. Add one entry per paired run. Each condition must contain elapsed time in seconds and at least two independent reviewer IDs with all seven 0–4 dimension scores.

The same reviewer IDs must appear in both conditions for a pair. Keep IDs anonymous (for example, R1 and R2); do not store personal information.

Run the scorer:

~~~bash
node scripts/score-benchmark.mjs benchmarks/my-study.json
npm test
~~~

The scorer reports weighted baseline/UADI means, paired score deltas, wins/ties/losses, per-dimension deltas and elapsed-time change. It rejects incomplete scores, mismatched reviewer panels and malformed pairs. A negative time-change percentage means the UADI condition was faster; a positive value means it took longer.

## Interpretation and reporting

- Report pair count, task count, agent/model/version, reviewer count and project snapshot.
- Include per-task results and reviewer disagreement, not only the overall mean.
- Preserve raw outputs and evidence so another reviewer can inspect them.
- A higher quality score with much longer completion time may not be a practical win.
- The scorer provides descriptive arithmetic only. It does not calculate statistical significance, correct for reviewer bias or prove causation.
- Do not generalize from one model, one task set or one study.
- Do not claim UADI improves results until real paired runs have been completed and reviewed.

No empirical result is included in this repository yet. The benchmark tasks and scorer make evaluation repeatable; they are not evidence of improvement by themselves.
