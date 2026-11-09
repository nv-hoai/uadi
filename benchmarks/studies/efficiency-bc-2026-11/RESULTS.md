# B/C efficiency pilot — results

**Status: pilot complete. Quality non-inferiority signal met; formal confirmation not established.** The observed interval is wide and the pilot is underpowered for a worst-case zero effect. Do not describe this as confirmed superiority or as a formal non-inferiority study.

## Sample

- 6 pairs: 3 tasks × 2 repetitions.
- Builder: `deepseek-v4.1-flash` (one pinned version).
- B: pre-Stage-2 skill (commit `83a686f`). C: current `standard` profile.
- Two blinded LLM reviewers, 12 review passes, 12 frozen result files.
- Candidate order balanced: C was Candidate A for 3 pairs and B for 3.

## Quality

| Metric | Value |
|---|---:|
| B weighted mean | 80.83 |
| C weighted mean | 90.31 |
| Mean paired delta C − B | **+9.48** |
| Paired 95% t interval | **+2.68 to +16.28** |
| Pairs won by C / tied / lost | 5 / 0 / 1 |
| Non-inferiority margin | −2.0 |
| Lower bound above margin | **yes** |
| Position sensitivity | C as A +11.88; C as B +7.08; difference 4.79 |

Per pair:

| Pair | Delta C − B |
|---|---:|
| subscription-settings-r1 | +9.38 |
| subscription-settings-r2 | +8.13 |
| product-onboarding-r1 | +13.13 |
| product-onboarding-r2 | +15.63 |
| operations-dashboard-r1 | +13.13 |
| operations-dashboard-r2 | −2.50 |

Reviewer agreement across 42 dimension scores: 30 exact (71.4%), 40 within one point (95.2%), mean absolute difference 0.33. No two-point split survives.

The one negative pair is `operations-dashboard-r2`; the reviewers disagreed on both candidates' information hierarchy, and the pair was close. It is retained, not excluded.

## Efficiency

The build itself did not log per-build input tokens. Context efficiency is measured by the Stage 2 wrapper probes on the same snapshot:

| Probe | B path | C path | Change |
|---|---:|---:|---:|
| Medium subscription settings | 9,597 | 2,612 | −73% |
| Complex onboarding | 10,372 | 2,819 | −73% |

Static runtime profiles: kernel 697; kernel + six modules 3,215; kernel + modules + all risk cards 4,958. Legacy typical playbook path 14,513. These are context-loading measurements, not provider-billed totals.

## Power

Observed paired SD 6.48 points. Under a normal approximation with margin −2 and 4,000 simulations per cell:

| Assumed true delta | Minimum n for 80% power |
|---:|---:|
| 0 | 82 |
| 2 | 21 |
| 3 | 13 |
| 5 | 7 |

At n=6, power is 11% for a true zero effect, 33% for +2, 47% for +3 and 74% for +5. The pilot's positive interval is therefore a signal, not a formal non-inferiority result.

## Decision

**Retain the optimized runtime; do not claim formal non-inferiority yet.**

- The point estimate is positive, the lower bound is above the −2 margin, and the context reduction is large on the probe.
- The pilot is underpowered for the worst case. A formal study should use at least **21 pairs if a true +2 point benefit is assumed**, or **82 pairs for a zero-effect worst case**, with the same margin. Do not relax the margin.
- A larger study should add a second builder family and three repetitions per task, and log per-build context/cost rather than relying on probes.
- The one negative dashboard pair warrants a targeted look at dense data hierarchy, not a global rollback.

## Evidence

- `results.json` — scorer input.
- `scorer-output.json` — weighted means, interval, position sensitivity, order balance.
- `review-summary.json` — per-pair deltas and reviewer agreement.
- `freeze-round1.json` — hashes of all 12 reviewer results.
- `power-analysis.json` — simulation table.
- Raw builds and screenshots: `benchmarks/runs/efficiency-bc-2026-11/` (gitignored).
- Blind packets: `review/` (tracked; no mapping).
