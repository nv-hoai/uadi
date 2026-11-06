# Design Intelligence Pilot — Paired Benchmark Study

**Status: exploratory pilot. Not confirmatory evidence of improvement.**

This study ran the same pinned model with and without UADI on all three benchmark tasks. It met the benchmark's exploratory pilot sample-size check (nine pairs: three tasks × three repetitions) but not the confirmatory requirements for two model families or independent human reviewers.

More importantly, a swapped-label control found a strong candidate-position effect. The condition deltas below are therefore **confounded and should not be read as a UADI effect**. The pilot's main value is methodological: it exercised the full protocol, preserved the evidence, and exposed a judging bias that a confirmatory study must control.

## What was run

| Item | Value |
|---|---|
| Tasks | Subscription settings, first-run onboarding, operations dashboard |
| Repetitions | 3 per task |
| Pairs | 9 (18 isolated runs) |
| Agent | OpenCode general subagent, identical tool access and settings |
| Model | `deepseek-v4.1` / exact version `deepseek-v4.1-flash`, pinned across every run |
| Baseline | Empty static scaffold, no design skill or reference implementation |
| Treatment | The same scaffold plus the portable UADI skill installed at `.agents/skills/uadi/` |
| Snapshot | Empty static project (`index.html`, `styles.css`, `app.js`, `README.md`), copied separately for every run |
| Task prompts | The exact prompts in [`benchmarks/`](../../README.md), with identical delivery instructions |
| Run order | Randomized and recorded per pair; conditions ran concurrently in waves (a deviation) |
| Duration | Recorded from each run's own `.run-start` and `.run-end` timestamps |
| Rendered evidence | 1280×900 desktop and 390×844 mobile full-page screenshots, plus axe and DOM checks |
| Review | 3 blinded LLM judge passes per pair (27 total), randomized candidate mapping |
| Human review | None. This is the main confirmatory gap. |

The treatment prompt named the installed skill; the baseline prompt stated that no design skill was installed. Both prompts told the agent to work only in its project directory, use no network, deliver `index.html`, `styles.css`, `app.js` and `analysis.md`, and not claim unrun checks.

Judges received sanitized packets containing the task brief, analysis, implementation, desktop/mobile screenshots and automated checks. Condition names, absolute paths and skill references were removed. Judges never received `mapping.json`.

## Results at a glance

All scores are weighted on the benchmark's 100-point rubric. Higher is better.

| Measure | Baseline | UADI | Change |
|---|---:|---:|---:|
| Mean weighted score | 86.76 | 86.94 | **+0.19** |
| Pairs won | — | 4 | — |
| Pairs tied | — | 0 | — |
| Pairs lost | — | 5 | — |
| Mean duration | 36.5 min | 33.8 min | −7.3% |
| Median duration | 40.3 min | 35.3 min | −12.3% |

The mean difference is 0.2 points on a 100-point scale, with more losses than wins. This is indistinguishable from noise under the study's design, and the position-control result below prevents a condition-level interpretation.

### By task

| Task | Baseline | UADI | Delta | UADI wins / losses | Baseline min | UADI min |
|---|---:|---:|---:|---:|---:|---:|
| Subscription settings | 89.44 | 85.00 | −4.44 | 1 / 2 | 30.8 | 24.0 |
| First-run onboarding | 82.22 | 92.50 | **+10.28** | 3 / 0 | 36.0 | 34.7 |
| Operations dashboard | 88.61 | 83.33 | −5.28 | 0 / 3 | 42.5 | 42.7 |

The onboarding cell is the only consistently positive one. Subscription and operations favored the baseline. These are hypotheses for a confirmatory study, not findings: the cells are small, judged by one model family, and affected by position bias.

### By rubric dimension

Scores are on the rubric's 0–4 scale.

| Dimension | Weight | Baseline | UADI | Delta |
|---|---:|---:|---:|---:|
| Product understanding | 15% | 3.70 | 3.85 | +0.15 |
| UX reasoning | 20% | 3.59 | 3.48 | −0.11 |
| Design judgment | 15% | 3.70 | 3.70 | 0.00 |
| Visual hierarchy | 15% | 3.15 | 3.33 | +0.19 |
| Interaction completeness | 15% | 3.67 | 3.56 | −0.11 |
| Accessibility and responsiveness | 10% | 2.85 | 2.93 | +0.07 |
| Implementation quality | 10% | 3.33 | 3.22 | −0.11 |

No dimension moved by more than 0.19 points on a 4-point scale. The rubric does not show a broad quality gain.

### Automated rendered checks

These are descriptive counts across the nine runs per condition, not a quality score.

| Check | Baseline | UADI |
|---|---:|---:|
| Axe WCAG violations (total) | 12 | 7 |
| Page-level mobile overflow (runs) | 3 / 9 | 1 / 9 |
| Controls without an accessible name (total) | 0 | 6 |
| Console or page errors (total) | 0 | 0 |
| Lines in `index.html` + `styles.css` + `app.js` | 27,745 | 25,920 |

The UADI runs had fewer axe violations and fewer mobile overflows, but more unnamed controls. Axe covers only the rules it ran; this is not a WCAG conformance claim.

## The position-control finding

After the main panel was locked, each pair was run through one additional fresh judge with the two candidate packets **swapped**: the original Candidate B became Candidate A, and vice versa. The judge used the same prompt and rubric and did not know about the swap.

If judges tracked content, the winner should flip when the labels swap. It often did not.

| Pair | Main winner | Control winner | Same label won? | Control closer to |
|---|---|---|---|---|
| subscription-settings-r1 | A | A | yes | equally close |
| subscription-settings-r2 | A | A | yes | label position |
| subscription-settings-r3 | A | A | yes | label position |
| product-onboarding-r1 | A | A | yes | label position |
| product-onboarding-r2 | A | B | no | content |
| product-onboarding-r3 | B | A | no | content |
| operations-dashboard-r1 | A | A | yes | label position |
| operations-dashboard-r2 | B | A | no | content |
| operations-dashboard-r3 | A | A | yes | label position |

- **6 of 9** pairs produced the same label winner after the swap.
- In **5 of 9** pairs the control scores were closer to the original label than to the swapped content; 1 was equally close; 3 tracked content.
- The three cases that tracked content were the three where the main winner was Candidate B.

Within the main panel, the three passes were consistent: the mean within-pair range across dimensions was 0.94 points, with a maximum of 2. That consistency does not rescue the scores because the passes shared the same candidate order.

The safest reading is that the LLM panel has a substantial Candidate-A preference. The main-panel condition deltas are therefore not a clean measure of UADI's effect. A confirmatory study must balance or alternate candidate order and retain this swapped-label control.

## What the pilot supports

- The full protocol is executable: isolated snapshots, randomized mapping, blinded packets, rendered evidence, preserved transcripts, automated checks and a scored results file.
- The pilot sample-size check passes; the confirmatory multi-model and human-review checks do not.
- There is no overall quality advantage in this pilot, and no task-level result is strong enough to survive the position-control caveat.
- The onboarding cell is the clearest hypothesis to retest: UADI won all three repetitions, with an average +10.3 points. The subscription and operations cells are the opposite hypothesis: the baseline was preferred in five of six repetitions.

## What the pilot does not support

- It does not show that UADI improves design quality.
- It does not show that UADI harms design quality.
- It does not support a claim about any individual rubric dimension, task or model beyond this pilot.
- It does not satisfy the roadmap's Phase 2 success signal, which requires blind or structured review evidence of better outcomes.

## Protocol deviations and limitations

1. **No independent human reviewers.** All 27 main passes and 9 control passes were LLM judges. They are repeated measurements, not independent reviewers, and do not count toward the confirmatory human minimum.
2. **Same model family for builders and judges.** `deepseek-v4.1-flash` produced every candidate and scored every candidate. Self-preference and shared stylistic bias are possible.
3. **One model family.** The confirmatory minimum requires two distinct pinned model families.
4. **Strong position effect.** The swapped-label control is described above.
5. **Concurrent execution.** Condition order was randomized and recorded, but runs were executed concurrently in waves rather than sequentially. Each run used a separate directory and fresh subagent context.
6. **Time budget not enforced.** The prompt suggested about 20 minutes, but recorded durations ranged from about 15 to 49 minutes. Time comparisons are descriptive only.
7. **Default-state screenshots only.** Judges saw the default desktop and mobile renders. Dialogs, loading, error, member and other states were available in source and checks but not rendered for visual scoring.
8. **Local HTTP capture.** Pages were served from a local static server for both conditions to avoid `file://` CORS differences. The delivered projects still open directly.
9. **Synthetic data.** Every prototype uses synthetic accounts, orders and billing data. No real backend, payment provider or telemetry was involved.
10. **Descriptive arithmetic only.** The scorer does not test statistical significance or establish causation.
11. **Baseline isolation is instructed, not proven.** Baseline agents were told not to read outside their project, but their shell history was not independently audited.
12. **Blinding is textual.** The coordinator removed condition names, paths and skill references from packets. Residual stylistic differences may still hint at the condition.

## Preserved evidence

Committed in this directory:

- [`results.json`](results.json) — the scorer input with all nine pairs, three LLM reviewers per condition, durations and model metadata.
- [`scorer-output.json`](scorer-output.json) — the full output of `npm run benchmark:score`.
- [`review-summary.json`](review-summary.json) — derived per-task, per-dimension, position-control and agreement statistics.
- [`prompt-template.md`](prompt-template.md) — the exact condition and judge prompt structure.
- [`judge-results/`](judge-results/) — the 27 blinded main-panel judge outputs.
- [`position-control/`](position-control/) — the nine swapped-label control outputs.

Raw artifacts are preserved locally at `benchmarks/runs/design-intelligence-pilot-2026-11/` (gitignored): each pair's baseline and UADI project, prompt, transcript, screenshots, checks and coordinator-only `mapping.json`.

To reproduce the scored summary:

```bash
npm run benchmark:score -- benchmarks/studies/design-intelligence-pilot-2026-11/results.json
```

To capture rendered evidence for a project:

```bash
node scripts/capture-benchmark-evidence.mjs --project <project-dir> --out <evidence-dir>
```

## Next steps for a confirmatory study

Tracking issue: [#48](https://github.com/nv-hoai/uadi/issues/48).

1. Recruit at least two independent human reviewers per condition who did not produce either candidate. Freeze their scores before revealing the mapping.
2. Add a second pinned model family, with three repetitions per task for each family.
3. Balance candidate order across pairs and passes; keep the swapped-label control as a standard sensitivity check.
4. Capture and judge non-default states: dialogs, validation, loading, error, role-restricted and partial-data views.
5. Run pairs sequentially or record concurrency explicitly; enforce a fixed time budget.
6. Report the result by task and model family, with reviewer disagreement and raw evidence.
7. Only then decide whether the Phase 2 success signal is met.
