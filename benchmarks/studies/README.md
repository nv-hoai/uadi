# Benchmark studies

This directory holds committed study records: the scored results, the blinded judge outputs and the analysis needed to interpret them. Raw run artifacts (project copies, transcripts, screenshots and mapping files) are kept locally under `benchmarks/runs/`, which is gitignored.

A study in this directory is not automatically evidence. Read its status and protocol assessment first:

- **Exploratory pilot** — can find process defects and generate hypotheses. It is not evidence that UADI works or fails.
- **Confirmatory study** — requires at least two pinned model families, three repetitions per task for each family, and at least two independent human reviewers per condition, with all raw evidence preserved.

The only study currently recorded is an [exploratory pilot](design-intelligence-pilot-2026-11/README.md). It met the pilot sample-size check but not the confirmatory multi-model or human-review checks. Its swapped-label control also found a strong candidate-position effect, so its condition deltas are not interpretable as a UADI effect.
