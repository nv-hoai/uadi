# UADI Design Intelligence Benchmark

This benchmark asks whether UADI helps the same AI agent produce better product understanding, UX decisions and interface outcomes without disproportionate time or process overhead. It evaluates outcomes, not checklist compliance or artifact count.

## Task set

Use all three tasks for a representative evaluation:

1. [Subscription settings](tasks/subscription-settings.md) — permissions, billing, sensitive actions and responsive settings.
2. [First-run onboarding](tasks/product-onboarding.md) — activation, progressive disclosure, optional setup and role understanding.
3. [Operations dashboard](tasks/operations-dashboard.md) — metric comprehension, information density, comparisons and investigation flow.

The [subscription settings reference implementation](../examples/subscription-settings/README.md), [worked onboarding example](../examples/product-onboarding/README.md) and [worked operations dashboard example](../examples/operations-dashboard/README.md) are reference implementations, not the expected visual answers. Do not show them to the agent during a benchmark run.

## Paired study protocol

A pair is one baseline run and one UADI run for the same task, model/version, agent settings, tool access, project snapshot and time budget. Never compare different models inside a pair.

### Minimum sample requirements

- **Exploratory pilot:** at least three paired repetitions on each of the three tasks (nine pairs) using one pinned model/version. This can find process defects and generate hypotheses only. It is not evidence that UADI works or fails, regardless of the score delta.
- **Confirmatory multi-model study:** at least three paired repetitions per task for each of at least two distinct model families (18 pairs minimum: 3 tasks × 2 model families × 3 repetitions). Use the same exact model/version within each pair; record the model family and exact version for every pair. Prefer different providers for model-family diversity. If a model/task cell is missing, report it and do not describe the study as meeting this minimum.
- **Do not pool away model differences:** report results by task and model family as well as the overall descriptive summary. One strong model/task cell must not conceal regressions in another.

For every pair:

1. Pin the host agent, exact model/version, settings, tool access, task prompt, time budget and clean project snapshot.
2. Start baseline and UADI from separate copies of the same snapshot. Do not let either condition inherit files, history or context from the other.
3. Randomize and balance condition order across repetitions; record the order in coordinator-only metadata. For a preregistered study, pass `--study-design` to `benchmark:prepare`: the scaffold then enforces the pair's precomputed `uadi_position` and `baseline_run_position` instead of rolling dice per pair.
4. Preserve prompts, transcripts, changed files, rendered screenshots and test outputs for both conditions.
5. Have reviewers score the delivered product, not whether the agent mentioned UADI or followed its playbook.
6. Record elapsed time and checks actually executed. Do not count unrun tests as passing.
7. Report missing runs, deviations, failed implementations and all exclusions. Never silently replace an inconvenient result.

### Review protocol: two-reviewer machine panel

Every study reported from this repository uses the two-reviewer machine review in `docs/MACHINE-REVIEW.md`. The short version:

1. Prepare two identical blinded packets per pair (Candidate A/B) with no condition names, workspace paths, transcripts or `mapping.json`.
2. Two reviewers grade independently in separate sessions, capture at least two evidence crops per candidate per pair, and write a cited rationale for every dimension.
3. Freeze round 1 by hashing every result before either reviewer sees the other.
4. Exchange scores and evidence. Each reviewer either maintains a score with evidence or revises it because the other evidence changed the judgment.
5. Agreed integer scores are final. One-point splits are averaged and flagged; two-point splits need an optional chair.
6. Reveal the condition mapping only after discussion files are written, then publish scores, splits and evidence.

Reviewers may be LLM sessions. Record `"type": "llm"` and `"independent": true` only when the session had no shared context and no access to the mapping. Human review is optional, recorded separately with `"type": "human"`, and is **not required** for a machine-reviewed study. The scorer's `machine_review_minimum_met` gate requires at least two independent reviewers per condition of either type; `confirmatory_minimum_met` additionally requires two pinned model families. `evidence_tier` reports where the study stands.

Use the exact stable labels **Candidate A** and **Candidate B** in every prompt and evidence filename. Candidate A always means the contents of `blind/condition-a`; Candidate B always means `blind/condition-b`. Do not rename them, infer their identity from content, or change the mapping between passes. Use [JUDGE-PROMPT.md](JUDGE-PROMPT.md) verbatim and give every reviewer the same manifest. The coordinator keeps `mapping.json`, verifies that both packets contain equivalent evidence types, and reveals the mapping once, after scores are frozen.

### Confirmatory study design

A confirmatory study must be preregistered and validated before the first run. Use
[`CONFIRMATORY-STUDY.md`](CONFIRMATORY-STUDY.md) and
[`study-design.template.json`](study-design.template.json):

```bash
npm run study:validate -- benchmarks/studies/<study>/study-design.json
```

The design adds the controls the pilot lacked: balanced Candidate A/B order per task, reviewer
families disjoint from the builders, calibration seeds and a duplicate packet, held-out tasks,
required interaction-state screenshots, version hashes and a paired 95% interval with a
pre-registered minimum detectable effect. The validator is a preflight check, not a result.

### Deterministic gates (agent-loop inner loop)

Between iterations, agents run deterministic gates on the built deliverable instead of
waiting for the full confirmatory protocol:

```bash
npm run quality:gates -- --dir benchmarks/runs/<study>/<pair>/<condition>
```

The gates check accessible control names, axe critical/serious violations, mobile overflow
at `390x844`, required interaction states, viewport screenshot evidence, and that
`analysis.md` success claims actually have test-output evidence. Static gates run anywhere;
browser gates reuse the renderer environment when available and report themselves as
skipped otherwise — a skipped gate is never evidence. The same gates run in CI on a fixture
deliverable (`tests/fixtures/quality-gates/good`).

### Running a build

The canonical procedure for a benchmark build is:

1. Read the task brief, design and implement the deliverable.
2. Capture evidence with the shipped script — **never write your own screenshot code**:

   ```bash
   npm run evidence:capture -- --dir <project-dir> --out <run-dir>/evidence/screenshots
   ```

   It writes `<viewport>-<state>.png` at `390x844` and `1280x900` and activates states
   through the page's own controls (hash, state select, or state button). If a state
   cannot be activated it says so and exits 1; make the state reachable and re-run.
3. Run the gates and keep the JSON alongside the evidence:

   ```bash
   npm run quality:gates -- --dir <run-dir> --json > <run-dir>/evidence/quality-gates.json
   ```
4. Record only checks that were actually run. A success claim without test-output
   evidence fails the claim-behavior gate.

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

Start with [results.template.json](results.template.json). It contains one clearly synthetic example pair to verify the scorer; replace the entire sample with real observations before reporting any result. Add one entry per paired run. Each pair must record task_id, model_family, exact model_version and repetition number. Each condition must contain elapsed time in seconds and at least two reviewers with all seven 0–4 dimension scores; each reviewer must declare `id`, `type` (`human` or `llm`) and `independent` (boolean), plus optional `provenance`. Keep study.model as a human-readable study-level summary; pair-level model fields are the source of truth for multi-model analysis. For a confirmatory design, also record `uadi_position` (`A` or `B`) and `baseline_run_position` (`1` or `2`) so the scorer can report position sensitivity and order balance. Record per-condition `tokens` (estimated tokens consumed by the run, e.g. transcript + deliverables at chars/4) so efficiency is scored on token spend rather than wall time alone. Set `study.design_type` to `confirmatory` (or `confirmatory-machine`) so an unbalanced schedule cannot qualify as confirmatory.

The same reviewer IDs must appear in both conditions for a pair, with the same `type` and `independent` values. Keep IDs anonymous (for example, R1 and R2); do not store personal information.

Run the scorer:

~~~bash
node scripts/score-benchmark.mjs benchmarks/my-study.json
npm test
~~~

The scorer reports weighted baseline/UADI means, paired score deltas, wins/ties/losses, per-dimension deltas and elapsed-time change. When a run records `tokens`, it also reports token spend (mean/median and change) — token spend is the efficiency metric; wall time varies with throughput and timeouts and is reported as a median. It also reports a paired 95% t interval, position sensitivity and order balance. It assesses the sample against the exploratory (9-pair) and confirmatory multi-model (18-pair) minimums and lists missing model/task/repetition coverage. Confirmatory qualification requires at least two independent reviewers per condition (`machine_review_minimum_met`, human or LLM) plus two qualifying model families. `human_review_minimum_met` is an optional higher tier, and `evidence_tier` summarizes where the study stands. This is a protocol check, not a statistical-significance test. It rejects incomplete scores, mismatched reviewer panels, missing reviewer provenance and malformed pairs. A negative time-change percentage means the UADI condition was faster; a positive value means it took longer.

## Interpretation and reporting

- Report pair count, task count, agent/model/version, reviewer count and project snapshot.
- Include per-task results and reviewer disagreement, not only the overall mean.
- Preserve raw outputs and evidence so another reviewer can inspect them.
- A higher quality score with much longer completion time may not be a practical win.
- The scorer provides descriptive arithmetic only. It does not calculate statistical significance, correct for reviewer bias or prove causation.
- Do not generalize from one model, one task set or one study.
- Do not claim UADI improves results until real paired runs have been completed and reviewed.

## Recorded studies

- [Design Intelligence Pilot (exploratory)](studies/design-intelligence-pilot-2026-11/README.md) — nine pairs across the three tasks with one pinned model family. It met the exploratory sample-size check.
- [Two-reviewer machine review of the pilot](studies/design-intelligence-pilot-2026-11/machine-review/README.md) — two blinded LLM reviewers, 110 evidence crops, frozen round-1 scores, an evidence exchange and a final decision. Evidence tier: `machine-reviewed-pilot`. Not human review.

No human-reviewed or two-model-family confirmatory result has been recorded. The benchmark tasks and scorer make evaluation repeatable; they are not evidence of improvement by themselves. The confirmatory study design is preregistered in [`CONFIRMATORY-STUDY.md`](CONFIRMATORY-STUDY.md) and tracked by [#48](https://github.com/nv-hoai/uadi/issues/48) and [#52](https://github.com/nv-hoai/uadi/issues/52); it becomes evidence only after the runs and review are complete.
