# Evaluating Design Intelligence

UADI should be judged by the quality of the design outcomes it enables, not by process compliance or artifact count.

The [benchmark suite](../benchmarks/README.md) defines three representative tasks, a paired blind-review protocol, a weighted rubric, a results format and a local scorer.

## Evaluation principles

- Compare the same agent/model version, settings, tools and task context with and without UADI.
- Start each run from an identical clean project snapshot.
- Balance condition order per task and blind reviewers to the condition where practical. Do not randomize each pair independently and hope the block balances.
- Use the two-reviewer machine panel and repeat each task. Human review is optional.
- Score actual product outcomes, not whether an agent followed instructions.
- Include completion time, implementation defects and checks actually run.
- Preserve prompts, transcripts, artifacts, screenshots and reviewer notes.
- Report sample size, reviewer disagreement, limitations and remaining splits.

## Two-reviewer machine review

Every study uses the protocol in `docs/MACHINE-REVIEW.md`: two reviewers in separate sessions grade identical blinded packets, capture evidence crops, freeze round-1 scores before seeing each other, exchange evidence, and publish a final decision with disagreements. Reviewers may be LLM sessions. Human review is optional and recorded separately; it is not required.

The protocol is stronger than one LLM pass and weaker than independent human review. Reports must say which one they are.

A confirmatory study adds four controls: reviewer model families disjoint from the builders, calibration with seeded defects and a duplicate packet, non-default state captures at two viewports, and a pre-registered paired interval. The repository-only `benchmarks/CONFIRMATORY-STUDY.md` defines the design and `study:validate` checks it before runs start. The benchmark harness is not installed with the skill.

## What success means

Evidence should show stronger product understanding, UX reasoning, design judgment, visual hierarchy, interaction completeness, accessibility/responsiveness and implementation quality—without unnecessary process overhead.

Do not market benchmark results until real runs have been completed, documented and reviewed under the two-reviewer machine protocol. The included scorer calculates descriptive summaries and a paired interval; it does not establish statistical significance or causation.

## Capturing rendered evidence

Use `node scripts/capture-benchmark-evidence.mjs --project <project-dir> --out <evidence-dir>` to capture desktop and mobile screenshots plus axe and DOM checks. The script serves the project from a local static server and uses the React renderer's Playwright and axe-core installation, so install the renderer dependencies first (`cd renderers/react && npm ci`).

Use `node scripts/crop-evidence.mjs <source.png> <out.png> <WxH+X+Y>` to cut reviewer evidence crops.

## Recorded study

The Design Intelligence Pilot (see `benchmarks/studies/design-intelligence-pilot-2026-11/README.md`) is an exploratory pilot: nine pairs across the three tasks and one pinned model family.

A second study re-reviewed it with the two-reviewer machine panel: two blinded LLM reviewers, 110 evidence crops, frozen round-1 scores, an evidence exchange and a final decision. Its `evidence_tier` is `machine-reviewed-pilot`; it is not human review. See `benchmarks/studies/design-intelligence-pilot-2026-11/machine-review/README.md`.

The pilot's original swapped-label control found a strong candidate-position effect: in six of nine pairs the same label won after the candidate packets were swapped. The machine review showed a different order interaction, so neither panel's condition deltas should be treated as a clean UADI effect. A confirmatory study still needs a second pinned model family, a balanced candidate schedule, an independent judge family, held-out tasks and non-default state captures; independent human review is optional.
