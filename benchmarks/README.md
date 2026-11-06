# UADI Design Intelligence Benchmark

This benchmark asks whether UADI helps the same AI agent produce better product understanding, UX decisions and interface outcomes without disproportionate time or process overhead. It evaluates outcomes, not checklist compliance or artifact count.

## Task set

Use all three tasks for a representative evaluation:

1. [Subscription settings](subscription-settings.md) — permissions, billing, sensitive actions and responsive settings.
2. [First-run onboarding](tasks/product-onboarding.md) — activation, progressive disclosure, optional setup and role understanding.
3. [Operations dashboard](tasks/operations-dashboard.md) — metric comprehension, information density, comparisons and investigation flow.

The [subscription settings reference implementation](../examples/subscription-settings/README.md) is one example, not the expected visual answer. Do not show it to the agent during a benchmark run.

## Paired study protocol

A pair is one baseline run and one UADI run for the same task, model/version, agent settings, tool access, project snapshot and time budget. Never compare different models inside a pair.

### Minimum sample requirements

- **Exploratory pilot:** at least three paired repetitions on each of the three tasks (nine pairs) using one pinned model/version. This can find process defects and generate hypotheses only. It is not evidence that UADI works or fails, regardless of the score delta.
- **Confirmatory multi-model study:** at least three paired repetitions per task for each of at least two distinct model families (18 pairs minimum: 3 tasks × 2 model families × 3 repetitions). Use the same exact model/version within each pair; record the model family and exact version for every pair. Prefer different providers for model-family diversity. If a model/task cell is missing, report it and do not describe the study as meeting this minimum.
- **Do not pool away model differences:** report results by task and model family as well as the overall descriptive summary. One strong model/task cell must not conceal regressions in another.

For every pair:

1. Pin the host agent, exact model/version, settings, tool access, task prompt, time budget and clean project snapshot.
2. Start baseline and UADI from separate copies of the same snapshot. Do not let either condition inherit files, history or context from the other.
3. Randomize and balance condition order across repetitions; record the order in coordinator-only metadata.
4. Preserve prompts, transcripts, changed files, rendered screenshots and test outputs for both conditions.
5. Have reviewers score the delivered product, not whether the agent mentioned UADI or followed its playbook.
6. Record elapsed time and checks actually executed. Do not count unrun tests as passing.
7. Report missing runs, deviations, failed implementations and all exclusions. Never silently replace an inconvenient result.

### Review independence, repeated judging and labels

For a confirmatory result, use at least two human reviewers who did not produce either condition and who score independently. Two model calls, multiple models from one provider, or multiple calls in one session are not independent human reviewers. They may be used as supplementary exploratory judging only.

For an LLM-judge panel, run at least **three separate judge passes per pair**. Each pass must use a fresh context, the same complete evidence packet, the same rubric and the same candidate order; do not let judges see previous scores or notes. Use stable reviewer IDs (for example, J1, J2, J3) and retain each pass independently. Three passes from one model are repeated measurements, not three independent human reviewers and not a substitute for the human panel.

Prevent arm-label swaps by using the exact stable labels **Candidate A** and **Candidate B** in every prompt and in every evidence filename. Candidate A always means the contents of `blind/condition-a`; Candidate B always means `blind/condition-b`. Do not rename these candidates X/Y, infer their identity from content, or change the mapping between judge passes. The coordinator-only `mapping.json` maps those folders to baseline/UADI; judges must not receive it while condition blinding is required. Use [JUDGE-PROMPT.md](JUDGE-PROMPT.md) verbatim and attach the same manifest to all passes. After all scores are locked, the coordinator applies the private mapping once. Never ask a judge to guess which candidate is UADI.

Keep the condition-to-output mapping with a coordinator who does not score. The coordinator removes condition hints, verifies that the two candidate packets contain equivalent evidence types, and reveals the mapping only after all human scores and exploratory judge passes are locked.


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

Start with [results.template.json](results.template.json). It contains one clearly synthetic example pair to verify the scorer; replace the entire sample with real observations before reporting any result. Add one entry per paired run. Each pair must record task_id, model_family, exact model_version and repetition number. Each condition must contain elapsed time in seconds and at least two independent reviewer IDs with all seven 0–4 dimension scores. Keep study.model as a human-readable study-level summary; pair-level model fields are the source of truth for multi-model analysis.

The same reviewer IDs must appear in both conditions for a pair. Keep IDs anonymous (for example, R1 and R2); do not store personal information.

Run the scorer:

~~~bash
node scripts/score-benchmark.mjs benchmarks/my-study.json
npm test
~~~

The scorer reports weighted baseline/UADI means, paired score deltas, wins/ties/losses, per-dimension deltas and elapsed-time change. It also assesses the sample against the exploratory (9-pair) and confirmatory multi-model (18-pair) minimums and lists missing model/task/repetition coverage. This is a protocol check, not a statistical-significance test. It rejects incomplete scores, mismatched reviewer panels and malformed pairs. A negative time-change percentage means the UADI condition was faster; a positive value means it took longer.

## Interpretation and reporting

- Report pair count, task count, agent/model/version, reviewer count and project snapshot.
- Include per-task results and reviewer disagreement, not only the overall mean.
- Preserve raw outputs and evidence so another reviewer can inspect them.
- A higher quality score with much longer completion time may not be a practical win.
- The scorer provides descriptive arithmetic only. It does not calculate statistical significance, correct for reviewer bias or prove causation.
- Do not generalize from one model, one task set or one study.
- Do not claim UADI improves results until real paired runs have been completed and reviewed.

No empirical result is included in this repository yet. The benchmark tasks and scorer make evaluation repeatable; they are not evidence of improvement by themselves.
