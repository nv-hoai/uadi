# Agent loop — cycle 0

First executed iteration of the agent loop defined in
[`benchmarks/CONFIRMATORY-STUDY.md`](../../CONFIRMATORY-STUDY.md): deterministic gates
over real pilot artifacts → smallest guidance change → A/B validation on a public task →
acceptance on a held-out task. Raw run artifacts live in `benchmarks/runs/agent-loop-cycle-0/`
(gitignored); this directory records the cycle, the gate outputs and the pilot sweep.

## Objective

Fix the unnamed-controls defect with the smallest possible guidance change, and prove the
change works beyond the task that motivated it.

## Step 1 — Gates over the pilot's 18 artifacts

`pilot-gate-sweep.json` is the full sweep (9 runs per condition, 3 tasks). Aggregates:

| Metric (sum over 9 runs) | Baseline | UADI |
|---|---:|---:|
| Unnamed controls (static) | 22 | 16 |
| axe critical/serious violations | 64 | 18 |
| Mobile overflow (px) | 428 | 190 |
| Missing states | 12 | 8 |
| Viewport evidence missing | 18 | 18 |
| Claim-behavior gate | 9/9 pass | 9/9 pass |

Honest interpretation: on every measurable defect family UADI was equal or better than
baseline; the defect was shared, not UADI-specific. The pilot's judged delta (+0.76,
interval includes zero) measures perceived quality, a different question — the two findings
are compatible and neither cancels the other.

The loop immediately caught a defect in its own tooling: the claim-behavior gate flagged
analysis.md sentences like "never says a payment succeeded" as false success claims.
The gate was fixed with negation screening (a design principle is not a claim), and the
evidence check now also accepts `evidence/checks.json`. Cycle-0's first lesson: the gates
are hypotheses too, checked against real data.

Viewport evidence was missing in 18/18 pilot runs (screenshots named `desktop.png` /
`mobile.png`, no dimensions). The confirmatory flow now names captures per viewport; the
gates enforce it going forward.

## Step 2 — Reproduce on a live task (current guidance)

A fresh agent run of the public subscription-settings task with current guidance produced
**6 unnamed controls** (two preview-toolbar selects, two preview-period radios, two
cancellation acknowledgment checkboxes) — exactly the defect class from the sweep, with
all other gates passing.

## Step 3 — Smallest guidance change

One bullet added to `docs/QUALITY-GATES.md` (Accessibility section):

> Every icon-only or image-only control exposes an accessible name that matches its
> action (for example `aria-label="Delete project"`). A bare button containing only an
> icon or glyph is never acceptable; an unlabeled interactive element is a critical
> defect, not a minor nit.

No other guidance changed.

## Step 4 — A/B validation (amended guidance run)

The amended-guidance run of the same task produced **0 unnamed controls** and passed every
other gate except viewport evidence (see below). The change eliminated the defect class
in the condition where it had reproduced.

## Step 5 — Held-out acceptance

A held-out run (`held-out-billing-recovery`, never used to design the change) with the
amended guidance also produced **0 unnamed controls** and passed every other gate except
viewport evidence. The fix generalizes to an unwatched scenario.

## Defect found by this cycle, left for cycle 1

The amended and held-out runs **failed viewport evidence**: the agents named captures
`desktop-*.png`/`mobile-*.png` at 1280×800 instead of the required `1280x900`/`390x844`
conventions from the brief. The gates held; the harness needs a ready-made capture script
so agents don't invent naming conventions. That is cycle 1's harness improvement — not a
guidance change, and not a license to rename cycle-0 evidence after the fact.

## What this does not establish

- No general claim that UADI improves design quality. One task, one defect class, one
  model family, agent-session runs.
- The amended run is a single sample; the 22-vs-16 pilot distribution says reproduction
  is probabilistic, so the A/B result is suggestive, not confirmatory.
- The deterministic gates measure defect classes. The dashboard regression in the pilot
  (−4.38 judged delta) is a judgment-dimension issue the gates cannot see.

## Next cycle hypotheses

1. **Prototype chrome is the main defect surface.** The control run's failures were all
   agent-scaffold controls (state preview, role preview, acknowledgments). Next: require
   labels on scaffolding controls or hide them, per the confirmatory spec's
   prototype-chrome rule.
2. **Agents will keep inventing evidence conventions.** Ship a capture script; gate on it.
3. **Evaluate the orthogonal question:** UADI's judged-quality effect remains
   inconclusive until the confirmatory study runs (issue #48).

## References

- Gate outputs: [`gates/current.json`](gates/current.json), [`gates/amended.json`](gates/amended.json), [`gates/heldout.json`](gates/heldout.json)
- Pilot sweep: [`pilot-gate-sweep.json`](pilot-gate-sweep.json)
- Tracking: issue #48; design: [`benchmarks/CONFIRMATORY-STUDY.md`](../../CONFIRMATORY-STUDY.md)
