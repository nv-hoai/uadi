# Two-reviewer machine review — Design Intelligence Pilot

**Status: machine-reviewed pilot. Not human review, not confirmatory.**

This re-review applies the repository's standard [two-reviewer machine protocol](../../../../docs/MACHINE-REVIEW.md) to the nine pilot pairs. Two blinded LLM reviewers graded the same Candidate A/B packets in separate sessions, captured 110 evidence crops, froze their round-1 scores, exchanged evidence and produced final scores before the condition mapping was revealed.

## Panel

| Item | Value |
|---|---|
| Reviewers | R1 and R2, separate blinded sessions |
| Reviewer model | same family as the builder (`deepseek-v4.1-flash`) |
| Pairs | 9 (3 tasks × 3 repetitions) |
| Decisions | 126 dimension judgments (9 pairs × 2 candidates × 7 dimensions) |
| Evidence | 110 crops across desktop and mobile |
| Round-1 freeze | SHA-256 of all 18 result files before discussion |
| Discussion | every round-1 disagreement answered; maintain or revise only with cited evidence |
| Final rule | agreed integers final; one-point splits averaged and flagged; no two-point splits |
| Human reviewers | none |
| Evidence tier | `machine-reviewed-pilot` |

## Result

| Measure | Baseline | UADI | Change |
|---|---:|---:|---:|
| Mean weighted score | 87.64 | 88.40 | **+0.76** |
| Pairs won / lost | — | 4 / 5 | — |
| Split dimension judgments | — | 11 of 126 | — |

### By task

| Task | Baseline | UADI | Delta | UADI wins / losses |
|---|---:|---:|---:|---:|
| Subscription settings | 86.67 | 87.50 | +0.83 | 2 / 1 |
| First-run onboarding | 89.38 | 95.21 | +5.83 | 2 / 1 |
| Operations dashboard | 86.88 | 82.50 | −4.38 | 0 / 3 |

### By dimension

Scores are on the 0–4 rubric scale.

| Dimension | Weight | Baseline | UADI | Delta |
|---|---:|---:|---:|---:|
| Product understanding | 15% | 3.78 | 3.94 | +0.17 |
| UX reasoning | 20% | 3.72 | 3.67 | −0.06 |
| Design judgment | 15% | 3.61 | 3.78 | +0.17 |
| Visual hierarchy | 15% | 3.06 | 3.22 | +0.17 |
| Interaction completeness | 15% | 4.00 | 3.67 | −0.33 |
| Accessibility and responsiveness | 10% | 2.72 | 2.72 | 0.00 |
| Implementation quality | 10% | 3.22 | 3.39 | +0.17 |

## What changed from the earlier LLM panel

The earlier panel used three same-family judge passes and a swapped-label control. It reported baseline 86.76 / UADI 86.94 and the same onboarding > subscription > operations ordering, but with different task magnitudes. This panel reported subscription as slightly positive and onboarding as a smaller positive.

That disagreement is a reason to treat both as screening signals, not as a stable effect.

## Position sensitivity

The condition mapping was randomized, so UADI was Candidate A in some pairs and Candidate B in others.

| UADI position | Pairs | Mean delta (UADI − baseline) |
|---|---:|---:|
| Candidate A | 4 | −3.44 |
| Candidate B | 5 | +4.13 |

The direction is the opposite of the earlier pilot's Candidate-A preference. With nine pairs and uneven task composition, this is an order interaction or a composition effect, not a clean condition effect. It reinforces the main limitation: neither panel isolates UADI's contribution.

## What the panel supports

- The protocol is executable end to end with two independent sessions, evidence crops, a freeze, an evidence exchange and a published final decision.
- Every score has a cited rationale, and 115 of 126 judgments survived discussion without a split.
- The onboarding task remains the most consistently positive cell across both panels; the operations dashboard remains the most negative.
- The two panels disagree on magnitude and on subscription, so no task result should be marketed.

## What it does not support

- A claim that UADI improves design quality.
- A claim that UADI harms design quality.
- A human-quality or usability claim. Both reviewers are LLM sessions.
- A confirmatory claim: only one model family was tested, and the reviewers share that family.

## Artifacts

- [`results.json`](results.json) — scorer input with R1/R2 final scores and run durations.
- [`scorer-output.json`](scorer-output.json) — full scorer output; `evidence_tier` is `machine-reviewed-pilot`.
- [`review/`](review/) — reviewer round-1 results, discussion files, evidence crops, freeze and discussion summary.
- [`../../../../docs/MACHINE-REVIEW.md`](../../../../docs/MACHINE-REVIEW.md) — the standing protocol.

Reproduce the panel summary:

```bash
node scripts/validate-peer-review.mjs \
  --review <review-dir> \
  --runs benchmarks/runs/design-intelligence-pilot-2026-11
```

## Limitations

1. Both reviewers are LLM sessions of the same model family that built the candidates.
2. Separate sessions are not independent people.
3. Blinding is textual; residual stylistic hints may remain.
4. Visual scoring used default-state desktop and mobile screenshots only.
5. Eleven one-point splits were averaged; that is a decision rule, not consensus.
6. The pilot ran with one model family, so `confirmatory_minimum_met` is false.
7. No statistical test was performed; all values are descriptive.
