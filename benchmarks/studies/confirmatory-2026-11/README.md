# Confirmatory study (preregistered, not yet run)

**Status: complete.** The study produced a machine-reviewed confirmatory result. The
preregistered design held (balanced schedule, independent judges, calibration, order
balance), but the superiority rule was **not** met: the paired 95% interval includes zero.
This is a dated machine-reviewed outcome, not a claim that UADI improves design quality.

## Outcome (scored from [`results.json`](results.json) + [`scorer-output.json`](scorer-output.json))

| Number | Value |
|---|---|
| Baseline mean weighted score | 80.6 |
| UADI mean weighted score | 86.4 |
| Mean paired delta (UADI − baseline) | **+5.8** |
| Paired 95% t interval | **−3.9 to +15.5** |
| Pairs won / tied / lost (UADI) | 13 / 0 / 5 |
| Position sensitivity (UADI as A vs as B) | +13.0 vs −1.4 |
| Order balance per task | balanced |
| Machine-review minimum | ✅ met |
| `confirmatory_minimum_met` | ✅ `true` |
| Pre-registered MDE (minimum effect) | 4.0 — observed mean 5.8 ≥ 4 ✅ |
| No task/family regression beyond −2 | ✅ (worst cell: subscription +0.1) |
| **Superiority rule (CI lower bound > 0)** | ❌ **not met** (−3.9) |

Per task: subscription +0.1, onboarding +9.0, dashboard +8.3. Per family: deepseek +5.1,
muse-spark +6.5. Positions still move the estimate ±7 points around zero; the balanced
schedule keeps the point estimate unbiased, but the residual position variance leaves the
CI spanning zero. The result is directional evidence of benefit with substantial uncertainty,
not a confirmed superiority claim.

## Limitations recorded during execution

- **Deviation 1**: execution became concurrent-recorded (6 pair-workers, per-pair order
  preserved) at 1/36 runs; timing is descriptive only, tokens are the recorded efficiency
  metric (baseline mean 19,094 / UADI 20,383 estimated tokens, +6.7%).
- **Deviation 2**: reviewer R2 replaced twice. `beam-free` had no image input and could not
  complete the rendered-evidence requirement; `claude-haiku-5-5` was withdrawn per user
  instruction; `mimo-v2.6-flash` passed calibration, the image probe (all screenshots
  viewed), and all 18 round-1 passes. The replacement happened before any score was used.
- **Duplicate packet blinding**: the duplicate packet's README named the candidate it
  duplicated. Both reviewers discovered this; their test-retest grades nevertheless matched
  their Candidate A grades (consistency observed, blind compromised for that side check).
- **One unverified visual score**: R2 on `operations-dashboard-r3`/candidate B had OCR-level
  content verification but no successful image rendering during that pass; flagged in the
  review record.
- **Token estimates** are output-size proxies (chars/4), not API token counts.
- **Wall time** is recorded as descriptives; 3 early runs missed `.run-start/.run-end` and
  use a file-mtime fallback; a few builds exceeded the 20-minute budget (up to ~41 min).
- **Benchmark, not SOTA certification**: results are scoped to the pinned models
  (`deepseek-v4.1-flash`, `muse-spark-1.3-contributor`) and window (November 2026).

Further execution details (deviations, tampered-score incidents during preparation, and the
run ledger) are in the study commit history and `benchmarks/runs/confirmatory-2026-11/`
(gitignored raw artifacts).

## Current state

- `study-design.json` — the preregistered design: 2 builder families × 3 public tasks × 3 repetitions = 18 pairs (36 runs), balanced Candidate A/B and run order per task, independent reviewer families, calibration seeds and a duplicate packet, held-out tasks, required state capture at two viewports, paired 95% interval, 4-point pre-registered minimum effect.
- Held-out tasks are authored (`held-out-billing-recovery`, `held-out-activation-recovery`, `held-out-capacity-investigation`) and marked `ready`. They are never used to edit guidance.
- Frozen hashes are real digests (see `hash_inputs` in the manifest for exactly what each covers).
- Model families are **selected** (`selection_status: "selected"`):
  - Builder A: `deepseek` (`deepseek-v4.1-flash` via `opencode-go`)
  - Builder B: `muse-spark` (`muse-spark-1.3-contributor` via `opencode-go`)
  - Reviewers: `crouton-alpha` (`crouton-alpha-free`) and `beam` (`beam-free`), both disjoint from the builders
  - Agent for all runs: OpenCode subagent, identical tools and time budget in both conditions (same as the pilot)
- The three public task files and the three held-out task files live in `benchmarks/tasks/`, each declaring its task version and carrying the canonical seven sections. The validator checks them and fails on a missing file, a missing section, a version mismatch, or a held-out identifier appearing in guidance or prompt content.

## Preregistration

The design, balanced schedule, frozen hashes and 4-point minimum detectable effect are
committed before the first run. Any change after runs begin is a protocol deviation and
will be reported.

### Protocol deviation 1 — concurrent execution (recorded before unblinding)

Execution mode changed from `sequential` to `concurrent-recorded` at 1/36 runs: parallel pair-workers (3, later 6) run concurrently, each taking one pair at a time and running its two conditions in the preregistered order (per `mapping.json`). The outcome comparisons,
candidate order, blinding and scoring are unaffected; wall-clock timing is now
interpreted as descriptive only, and token spend is the recorded efficiency metric
(recorded for every run, per `execution.record_tokens`). The deviation was made before
any score was computed and without regard to any result.

### Protocol deviation 2 — reviewer R2 replaced (recorded before any score used)

`beam-free` (initial R2) reported in its round-1 passes that its model has **no image input** and therefore scored `visual_hierarchy` from layout code only, flagged `UNVERIFIED`. Rubric rule 4 requires rendered-screenshot viewing for that dimension, so R2 was replaced by `claude-haiku-5-5` (family `claude`) before the calibration and scoring steps. All beam round-1 outputs were discarded (never used in any score) and the replacement R2 passed the calibration packets under the same procedure as R1. The preregistered reviewer slots and the disjoint-from-builder rule are unchanged.

Recorded calibration outcome: both reviewer sessions that judged the round-1 packets caught all three seeded critical defects (`accessible-name`, `claim-behavior-mismatch`, `sort-order-mismatch`). One caveat: the "clean" calibration packet was too thin to test over-flagging — judges flagged legitimate issues in a minimal stub — so over-flagging is evaluated from round-1 reviewer splits instead.

## Reviewer calibration (must pass before the real packets)

[`calibration/`](calibration/calibration-manifest.json) holds four author-built packets:
three seeded with known critical defects (`accessible-name`, `claim-behavior-mismatch`,
`sort-order-mismatch`) and one clean packet.

1. Each reviewer (crouton-alpha-free and, after deviation 2, claude-haiku-5-5) grades all four packets with the same
   blind judge prompt, in its own session, without seeing the manifest.
2. The coordinator then compares the graded rationales against the manifest:
   - **Calibrated**: the reviewer caught each seeded defect they were judging for.
   - **Not calibrated**: a reviewer who misses a seeded defect is removed for the
     affected dimension (and their scores for that dimension are not used).
   - **Over-flagging**: a critical defect cited on the clean packet counts against
     calibration.
3. After the first real pair is built, duplicate one real packet under a different label
   and have both reviewers re-grade it. The duplicate measures test-retest consistency
   and is excluded from the main analysis.

Calibration results are recorded in the study record before any score is frozen.

## How to make it runnable

Already validated: `npm run study:validate -- benchmarks/studies/confirmatory-2026-11/study-design.json`
prints `run status: ready to run`. (If any hashed file changes before the first run,
re-freeze the hashes and re-validate.)

## Tracking

- Design: issue #52 (closed by PR #53).
- Execution: issue #48.
