# Confirmatory study (preregistered, not yet run)

**Status: design only — no runs exist.** This directory holds the preregistered manifest for the confirmatory study defined in [`benchmarks/CONFIRMATORY-STUDY.md`](../../CONFIRMATORY-STUDY.md). The pilot's machine review (+0.76 with a paired 95% interval of −5.0 to +6.5) cannot be read as a condition effect, so this study exists to produce a result that can.

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

## How to make it runnable

Already validated: `npm run study:validate -- benchmarks/studies/confirmatory-2026-11/study-design.json`
prints `run status: ready to run`. (If any hashed file changes before the first run,
re-freeze the hashes and re-validate.)

## Tracking

- Design: issue #52 (closed by PR #53).
- Execution: issue #48.
