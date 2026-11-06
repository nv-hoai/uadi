# Evaluating Design Intelligence

UADI should be judged by the quality of the design outcomes it enables, not by process compliance or artifact count.

The [benchmark suite](../benchmarks/README.md) defines three representative tasks, a paired blind-review protocol, a weighted rubric, a results format and a local scorer.

## Evaluation principles

- Compare the same agent/model version, settings, tools and task context with and without UADI.
- Start each run from an identical clean project snapshot.
- Randomize condition order and blind reviewers to the condition where practical.
- Use at least two independent human reviewers and repeat each task.
- Score actual product outcomes, not whether an agent followed instructions.
- Include completion time, implementation defects and checks actually run.
- Preserve prompts, transcripts, artifacts, screenshots and reviewer notes.
- Report sample size, limitations and disagreements.

## What success means

Evidence should show stronger product understanding, UX reasoning, design judgment, visual hierarchy, interaction completeness, accessibility/responsiveness and implementation quality—without unnecessary process overhead.

Do not market benchmark results until real runs have been completed, documented and independently reviewed. The included scorer calculates descriptive summaries; it does not establish statistical significance or causation.

## Capturing rendered evidence

Use `node scripts/capture-benchmark-evidence.mjs --project <project-dir> --out <evidence-dir>` to capture desktop and mobile screenshots plus axe and DOM checks. The script serves the project from a local static server and uses the React renderer's Playwright and axe-core installation, so install the renderer dependencies first (`cd renderers/react && npm ci`).

## Recorded study

The Design Intelligence Pilot (see `benchmarks/studies/design-intelligence-pilot-2026-11/README.md`) is an exploratory pilot: nine pairs across the three tasks, one pinned model family, three blinded LLM judge passes per pair and no independent human reviewers. It met the pilot sample-size check but not the confirmatory multi-model or human-review minimum.

A swapped-label control found a strong candidate-position effect: in six of nine pairs the same label won after the candidate packets were swapped. Treat the pilot's condition scores as confounded, not as evidence that UADI improves or harms outcomes. A confirmatory study must add independent human reviewers, a second model family and balanced candidate order.
