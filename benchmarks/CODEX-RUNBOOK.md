# Codex Host Benchmark Runbook

This runbook turns the UADI benchmark suite into an executable, reproducible Codex study. It does **not** contain benchmark results. A run is only counted after Codex has actually completed the task and its output evidence has been saved.

## Current status

- Host selected: Codex.
- Benchmark tasks and scorer: available in this repository.
- Codex execution from this ChatGPT session: unavailable. This session can inspect and update the GitHub repository, but it cannot launch a Codex CLI process in the user's local environment.
- Therefore: this runbook prepares the experiment; it does not claim any Codex run has happened.

## Study design

### Pilot first

Run one paired comparison for each of the three tasks before investing in the full study:

1. `subscription-settings`
2. `product-onboarding`
3. `operations-dashboard`

For each task, run the same pinned Codex model and settings twice from the same starter snapshot:

- **Baseline:** no UADI skill installed or otherwise present in the project context.
- **Treatment:** install the UADI Codex skill into the treatment workspace using the installer below.

Randomize which condition runs first for each task. Use a fresh workspace for every run. Never run both conditions in the same workspace.

The pilot checks that the task, environment, time budget and scoring rubric are workable. Do not treat one pair per task as strong evidence. If the pilot is sound, expand to at least three paired repetitions per task (nine pairs total), as specified in [the benchmark protocol](README.md).

## 1. Pin and record the environment

Before the first run, record:

- Codex CLI version (`codex --version`).
- Exact model name/version selected in Codex.
- OS and runtime versions (`node --version`, `npm --version`).
- Repository commit used for the task files and UADI skill.
- Codex reasoning/settings, available tools and network access.
- Time budget per run (recommended pilot budget: 45 minutes).
- Date and timezone.

Keep these identical across baseline and treatment. Do not change model or reasoning settings midway through the study.

## 2. Prepare identical starter workspaces

Use the same blank React + TypeScript + Vite starter snapshot for every condition. Pin the exact starter commit and copy it into a new, independent directory for each run.

Do not use the UADI repository itself as the implementation workspace: it contains UADI source, documentation and examples that would leak treatment context into the baseline.

Each run directory should contain only:
- The pinned starter project.
- One benchmark task file copied from this repository's `benchmarks/` directory.
- No prior run outputs, screenshots, transcripts, design files or UADI documentation.

The task file is the complete task prompt. Give Codex the same file contents in both conditions. Do not mention which condition it is in the task prompt.

## 3. Configure the baseline

1. Create a fresh copy of the starter snapshot.
2. Verify that no UADI skill, UADI playbook or UADI-specific instructions are present in the project or user-level Codex configuration.
3. Copy the selected task file into the workspace, for example `BENCHMARK-TASK.md`.
4. Start Codex in that workspace with the pinned model/settings.
5. Ask Codex to complete the task in `BENCHMARK-TASK.md`, implement the experience, run available checks and record any checks it could not run.
6. Start the timer when the task is submitted; stop when Codex declares completion or the time budget expires.
7. Save the full transcript, final diff, screenshots, test output and elapsed time outside the workspace.

Do not silently remove existing Codex user instructions between runs. If user-level instructions contain UADI material, document that and use a clean, controlled Codex profile for both conditions.

## 4. Configure the UADI treatment

1. Create a second fresh copy of the exact same starter snapshot.
2. Install the UADI skill into this workspace:

   ```bash
   node /absolute/path/to/uadi/scripts/install-skill.mjs --agent codex --cwd /absolute/path/to/treatment-workspace
   ```

3. Verify that `.agents/skills/uadi/SKILL.md` exists and contains the UADI skill. Do not add any other UADI files manually.
4. Copy the exact same task file into the workspace.
5. Start Codex with the same model/settings/tools/time budget as the paired baseline.
6. Submit the same task instruction, run checks and capture the same evidence.
7. Save the full transcript, final diff, screenshots, test output and elapsed time.

If Codex does not discover project-local `.agents/skills/uadi/`, stop and record the discovery failure. Do not compensate by pasting UADI instructions into the prompt; that would test a different integration path.

## 5. Task instruction (identical in both conditions)

Use this exact instruction after placing the task file in the workspace:

> Read `BENCHMARK-TASK.md` fully. Understand the product facts, users, goals, constraints and unknowns before designing. Then complete the requested deliverables in this project. Implement a responsive, usable interface using the existing stack. Do not invent product capabilities or data. Run the checks that are available, inspect the result at relevant viewport sizes if browser tooling is available, and report what you actually verified versus what remains unverified. Work within the time budget. Do not modify the benchmark task or scoring rubric.

## 6. Randomization and blind review

For each task pair:
- Flip a coin (or use a recorded random seed) to decide whether baseline or treatment runs first.
- After both runs, copy evidence into two folders with neutral random labels (for example `K7M2` and `P4Q9`).
- Remove condition names from screenshots, transcripts and summaries where possible. Preserve original evidence separately for audit.
- Ask two reviewers to score each output independently using the rubric in [benchmarks/README.md](README.md).
- Reviewers must not know which output used UADI until both score sheets are locked.
- Use the same reviewer IDs for both conditions in a pair.

Reviewers score the actual product, not the presence of a design rationale or the number of generated documents. Rationale is useful only when it explains a visible product decision.

## 7. Evidence folder and result entry

Keep raw evidence private if it contains personal information. A suggested local folder:

```text
codex-benchmark/
  environment.md
  subscription-settings/
    pair-01/
      K7M2/
        transcript.md
        diff.patch
        screenshots/
        checks.txt
        timing.txt
      P4Q9/
        transcript.md
        diff.patch
        screenshots/
        checks.txt
        timing.txt
      reviewer-1.json
      reviewer-2.json
  product-onboarding/
  operations-dashboard/
  results.json
```

Add one paired result to a copy of [results.template.json](results.template.json) only after two independent reviewers have completed both score sheets. Keep raw evidence and reviewer notes available for audit. Do not fabricate scores for missing or incomplete runs.

## 8. Scoring and reporting

From the UADI repository root, run:

```bash
npm test
node scripts/score-benchmark.mjs /absolute/path/to/codex-benchmark/results.json
```

Report:
- Exact Codex version/model and environment.
- Number of completed pairs, tasks, reviewers and missing/failed runs.
- Baseline and UADI scores by task and dimension.
- Paired score deltas, reviewer disagreement and elapsed time.
- Implementation/test failures and important qualitative observations.
- Deviations from protocol and limitations.

The scorer is descriptive. It does not calculate statistical significance or prove causation. Do not claim improvement based on the pilot alone.

## Stop conditions

Stop and mark the pair invalid if:
- Model/version or settings differ between conditions.
- The starter snapshot differs.
- The baseline receives UADI instructions or artifacts.
- The treatment cannot discover the installed UADI skill.
- One condition receives extra tools, context or time.
- Evidence is missing or the run cannot be attributed to a condition.

Fix the setup and rerun the entire pair; do not patch only the weaker condition.
