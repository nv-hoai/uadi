# B/C efficiency pilot — Stage 4

**Status: pilot complete, not confirmatory.** The optimized runtime (C) scored +9.48 points over the pre-Stage-2 skill (B), paired 95% interval +2.68 to +16.28, 5/6 pairs won. The lower bound is above the −2 non-inferiority margin, but the pilot is underpowered for a worst-case zero effect (11% power at n=6; about 82 pairs would be needed). Read the [results](RESULTS.md) before using any claim. This study is separate from the Stage 5 C/A cross-domain advantage question.

## Hypotheses

- **Primary (non-inferiority):** the paired weighted-score delta C − B has a 95% interval whose lower bound is above **−2 points**. A lower bound at or below −2 is not non-inferior; a wide interval is inconclusive.
- **Secondary (efficiency):** C consumes less UADI context than B at task time. Stage 2 wrapper probes and the static runtime profile provide the measured context evidence; this pilot does not log every builder read.
- **Not claimed:** superiority of C over B, or any field/usability benefit.

## Design

| Item | Value |
|---|---|
| Builder | `opencode-go/deepseek-v4.1-flash` |
| Conditions | B: skill at commit `83a686f` (pre-Stage-2); C: current `standard` profile |
| Tasks | `subscription-settings`, `product-onboarding`, `operations-dashboard` |
| Repetitions | 2 per task (6 pairs) |
| Snapshot | pilot static project |
| Prompt | same task brief + shared run instructions + skill paragraph; only the installed skill differs |
| Candidate labels | C is Candidate A on odd repetitions, B on even repetitions |
| Reviewers | two independent LLM reviewers, blinded packets, same seven-dimension rubric |
| Primary analysis | paired C − B weighted score, paired 95% t interval |
| Decision rule | non-inferior if lower bound > −2; otherwise inconclusive or fail |

An initial build was discarded after the harness placed `prompt.md` outside the project directory, so some builders worked from the snapshot README instead of the exact task. The harness was fixed to place `prompt.md` inside each project, all six pairs were rebuilt, and only the rebuilt runs are scored. No discarded build entered review.

## Review protocol

- Each pair is packed twice: `review/<pair>/r1/` and `review/<pair>/r2/`, each with `inputs/condition-a` and `inputs/condition-b`.
- Candidate A/B mapping stays in the coordinator-only pair `mapping.json`.
- Reviewers score all seven dimensions 0–4 with file/screenshot citations, list critical defects and write `result.json`.
- Round-1 scores are hashed before exchange; any later change is recorded.
- One-point splits are averaged and flagged; two-point splits require a chair. Report all splits.

## Evidence

- Builds and screenshots: `benchmarks/runs/efficiency-bc-2026-11/` (gitignored).
- Deterministic gates: `evidence/quality-gates.json` per condition.
- Capture activation: `evidence/capture-report.json` per condition.
- Reviewer results: `review/<pair>/<reviewer>/result.json`.
- Scored study: `results.json` and `scorer-output.json` in this directory.

## Limitations

- One builder family and six pairs; this is a pilot, not a powered confirmatory study.
- Two repetitions per task cannot support the confirmatory 18-pair minimum.
- No per-build context log; context efficiency is measured by the Stage 2 wrapper probes and static profiles. Do not attribute per-build cost differences without that data.
- LLM review is machine review, not human review.
- The snapshot is a static prototype, not a production codebase.

## Decision

Record one of: **retain** (non-inferior and the efficiency evidence is credible), **revise** (a quality or context regression is attributable to the runtime), or **run a larger study** (interval too wide to decide). Do not claim efficiency if quality non-inferiority fails.

## Related

- [Stage 0/2 context baseline](../../../docs/CONTEXT-EFFICIENCY.md)
- [Stage 2 context smoke test](../../context-smoke/README.md)
- [Benchmark scoring](../../README.md)
- [Machine review](../../../docs/MACHINE-REVIEW.md)
