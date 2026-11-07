# Benchmark studies

This directory holds committed study records: the scored results, the blinded reviewer outputs and the analysis needed to interpret them. Raw run artifacts (project copies, transcripts, screenshots and mapping files) are kept locally under `benchmarks/runs/`, which is gitignored.

A study in this directory is not automatically evidence. Read its status and protocol assessment first:

- **Exploratory pilot** — can find process defects and generate hypotheses. It is not evidence that UADI works or fails.
- **Machine-reviewed study** — the pilot minimum plus the two-reviewer machine panel in `docs/MACHINE-REVIEW.md`: separate blinded sessions, evidence crops, frozen round-1 scores, an evidence exchange and a final decision. Screening-grade; not human review.
- **Confirmatory study** — requires at least two pinned model families, three repetitions per task for each family, and the machine-review minimum. Human review is optional and recorded separately.

Two records exist:

- [Design Intelligence Pilot](design-intelligence-pilot-2026-11/README.md) — exploratory pilot, one model family.
- [Two-reviewer machine review](design-intelligence-pilot-2026-11/machine-review/README.md) — the standard machine panel applied to the pilot. `evidence_tier: machine-reviewed-pilot`.

The pilot's swapped-label control found a strong candidate-position effect, and the later machine panel found an order interaction in the opposite direction. Neither panel isolates a clean UADI effect, so no condition delta should be read as evidence of improvement or harm.
