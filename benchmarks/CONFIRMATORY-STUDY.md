# Confirmatory study — preregistered design

**Status: design only. No confirmatory result exists.** The pilot and its machine review are
screening evidence; they cannot support a claim that UADI improves design quality. This
document defines the design that can, and the validator that must pass before any run starts.

The redesign exists because the pilot and its machine review exposed six threats that a larger
sample alone would not fix:

| Threat in the pilot | Control in this design |
|---|---|
| Candidate order was confounded with task and repetition. UADI-as-A averaged −3.44; UADI-as-B averaged +4.13. | A precomputed, balanced A/B schedule per task. Order is reported, not assumed away. |
| Builders and judges shared one model family. | Reviewer families are disjoint from builder families. Same-family review is allowed only as a labeled limitation. |
| Judges were not calibrated. | Seeded defective/clean packets and a duplicate packet measure sensitivity and test-retest consistency. |
| Only default-state screenshots were judged. | Required interaction states at two viewports, with prototype chrome hidden. |
| Public tasks were the only tasks. | A held-out task suite, never used to edit guidance, gates agent-loop changes. |
| A +0.76 mean was reported without an interval. | A paired 95% interval and a pre-registered minimum detectable effect. |

## Design matrix

| Item | Requirement |
|---|---|
| Builder families | Two distinct pinned model families, identical agent/settings/time budget |
| Public tasks | The three benchmark archetypes: settings, onboarding, dashboard |
| Repetitions | Three per builder family per task |
| Pairs | 18 (2 families × 3 tasks × 3 repetitions) |
| Runs | 36 (one baseline and one UADI run per pair) |
| Candidate order | Per task: three UADI-as-A and three UADI-as-B pairs |
| Run order | Per task: three baseline-first and three UADI-first pairs |
| Held-out suite | At least three tasks, one per archetype, never used for guidance changes |
| Reviewers | Two per condition, separate blinded sessions, families disjoint from builders |
| Primary outcome | Paired weighted-score delta (UADI − baseline) |

The design deliberately balances order at the **task** level across the two builder families.
Three repetitions inside one family cannot split evenly, so the second family supplies the
other half of the block. Do not randomize each pair independently and hope the result balances.

Example for one task:

| Builder | Rep 1 | Rep 2 | Rep 3 |
|---|---|---|---|
| Family A | UADI = A, baseline first | UADI = B, UADI first | UADI = A, baseline first |
| Family B | UADI = B, UADI first | UADI = A, baseline first | UADI = B, UADI first |

That yields three A and three B pairs, and three baseline-first and three UADI-first runs.

## Preregister before running

1. Copy [`study-design.template.json`](study-design.template.json) to a study-specific file,
   or use the preregistered [`studies/confirmatory-2026-11/study-design.json`](studies/confirmatory-2026-11/study-design.json).
2. Fill in the builder families, exact versions, task versions, reviewer families, the
   study-level `frozen` hashes, time budget and decision rule. A pair can override a frozen
   value only to record a justified deviation. A design that still names placeholder families
   (`builder-a`/`builder-b`, `reviewer-a`/`reviewer-b`, `EXAMPLE_ONLY`) is reported as
   `BLOCKED (pending family selection)` and is not yet runnable.
3. Validate it:

   ```bash
   npm run study:validate -- benchmarks/studies/<study>/study-design.json
   ```

4. Commit the validated design before the first run. Any change after runs begin is a
   protocol deviation and must be reported.
5. In the scored results file, set `study.design_type` to `confirmatory` and record each pair's
   `uadi_position` and `baseline_run_position`. The scorer then reports position sensitivity and
   refuses to qualify an unbalanced schedule as confirmatory.

The validator enforces coverage, order balance, reviewer independence, calibration seeds,
state-capture declarations, version hashes, cost recording and the decision rule. When the
CLI runs, it also checks the task files themselves: every declared task must exist as
`benchmarks/tasks/<task_id>.md`, carry the canonical seven sections, declare the declared
`Task version: <version>`, and no held-out task identifier may appear in guidance or prompt
content. Frozen hashes must be `sha256:<64 hex digest>` values (a `REPLACE` placeholder is
a warning, not evidence). The validator does not prove that the reviewers stayed blind or
that every declared state screenshot exists; the coordinator still has to preserve and audit
the evidence bundle.

## Reviewer independence and calibration

Reviewers must not share a model family with either builder. If a different family is not
available, the study is still useful as a screening review, but it cannot be reported as a
confirmatory machine study.

Each reviewer also completes a calibration pass before the real packets:

- at least two seeded packets with known critical defects (`accessible-name`,
  `claim-behavior-mismatch`, `sort-order-mismatch`),
- at least one clean packet to catch over-flagging,
- one duplicate real packet under a different label to measure test-retest consistency.

Record whether each critical seed was caught. A reviewer who misses a seeded critical defect
is not calibrated for that dimension. The duplicate packet is excluded from the main analysis;
it exists to make judge noise visible.

## Evidence capture

Default screenshots are not enough. Capture both viewports and the states the task actually
implements:

- viewports: `390x844` and `1280x900`;
- states: default, loading, empty, error, success and restricted;
- task-specific states where relevant: dialog, validation, partial success, past due,
  downgraded/blocked, filtered empty;
- prototype controls hidden or moved outside the captured region so they do not obscure
  product evidence;
- the checks file and transcript for every run.

If a state is missing, record it as missing. Do not infer interaction completeness from prose.
This matters because the pilot could see UADI's state coverage in source but not in the rendered
evidence that drove visual scoring.

## Held-out suite

The three public tasks are for development and comparability with the pilot. The held-out suite
is for acceptance:

- at least one task per archetype;
- authored and validated before the study;
- never used to edit UADI guidance, prompts or rubric anchors;
- run when a guidance change is proposed, to detect overfitting to the public tasks.

A change that improves public tasks but regresses the held-out suite is rejected.

## Precision and decision rule

The machine review's pair deltas had a standard deviation of about 7.5 points (the earlier
panel's was 9.6). Under the lower assumption, a paired 95% interval has an expected half-width
of roughly:

| Pairs | Expected half-width |
|---:|---:|
| 9 | 4.9 points |
| 18 | 3.5 points |
| 24 | 3.0 points |
| 36 | 2.5 points |

Pre-register a minimum detectable effect at least as large as the expected half-width. With 18
pairs, a 3-point effect is at the edge of what the design can distinguish; the template uses
4 points. If the project needs a smaller effect, add pairs or reduce judge noise.

A superiority claim requires all of:

1. the machine-review minimum is met;
2. two qualified builder families are covered;
3. candidate order is balanced per task;
4. reviewer calibration passed;
5. the paired 95% interval lower bound is above zero;
6. the observed mean delta reaches the pre-registered minimum effect;
7. no task or model family regresses by more than the pre-registered margin.

Report the overall interval, every task, every model family, every dimension, reviewer
disagreement, position sensitivity and cost. Never pool away a family or task. If the interval
includes zero, the result is inconclusive, not a small win.

## Execution and reproducibility

- Run pairs sequentially by default. If concurrency is unavoidable, record it and treat timing
  as descriptive only.
- Enforce the same time budget in both conditions; record wall time, tokens and cost.
- Freeze the snapshot, prompt, skill and protocol hashes in the design.
- Keep separate clean project copies for each condition.
- Preserve transcripts, changed files, screenshots, checks and the coordinator-only mapping.

## How this connects to the agent loop

The public tasks and the confirmatory design are for **evidence**. The held-out suite and the
deterministic gates are for **agent improvement**:

1. an agent proposes the smallest guidance or harness change;
2. deterministic gates run on the public tasks (minutes);
3. the held-out suite runs on the same change (the acceptance test);
4. the confirmatory protocol runs only when a publishable claim is needed.

The installed skill does not carry the benchmark harness. It remains portable; this design is
repository-side evidence infrastructure.

## Related

- [Benchmark protocol](README.md)
- [Two-reviewer machine review](../docs/MACHINE-REVIEW.md)
- [Benchmark and learning loop](../docs/DESIGN-INTELLIGENCE-ARCHITECTURE.md#5-benchmark-and-learning-loop)
- [Tracking issue #48](https://github.com/nv-hoai/uadi/issues/48) and the redesign issue #52.
