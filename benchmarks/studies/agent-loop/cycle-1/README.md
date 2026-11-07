# Agent loop — cycle 1

Cycle 0 left one open defect: the validated runs failed viewport evidence because the
agents invented screenshot code and conventions (`desktop-*.png` at 1280×800) instead of
following the required viewport naming. This cycle shipped the harness fix and validated
it end to end.

## Objective

Kill the screenshot-convention defect: ship one supported capture script and prove agents
produce gate-passing evidence on both a public task and the held-out suite.

## Step 1 — Shipped capture script

`scripts/capture-evidence.mjs` (`npm run evidence:capture -- --dir <project> --out <evidence/screenshots>`):

- Fixed viewport names and canonical `<viewport>-<state>.png` filenames.
- Activates states through the page itself, in order: `#state=<name>` hash, a
  `<select>` whose option matches the state, or a state-named button.
- Reports per state whether it was actually activated; a state it cannot activate
  produces a screenshot of whatever rendered plus `activated: false` and exit code 1.
  The script never claims a state it did not switch to.
- Uses the renderer's Playwright + chromium, the same environment the quality gates use.

The canonical run procedure is now documented in
[`benchmarks/README.md`](../../README.md#running-a-build): implement → capture with the
shipped script → run gates and keep the JSON → record only checks actually run.

## Step 2 — Public task validation

A fresh agent run of the public subscription-settings task with the updated instructions
capture-evidence `12/12` screenshots ACTIVATED. During capture, the script's screenshot
review exposed a `[hidden]` CSS override bug that had left the cancel dialog overlaid
on the default view; the agent fixed it and re-captured. Final gates, independently
re-run: **6/6 PASS** — accessible-names, viewport-evidence, required-states,
claim-behavior, axe (0 critical/serious), mobile-overflow (0 px).

## Step 3 — Held-out acceptance

A fresh run of `held-out-billing-recovery` with the same instructions: 12/12 ACTIVATED,
gates re-run independently: **6/6 PASS**. The capture convention generalizes to the
unwatched task, and the cycle-0 accessible-names fix held there too.

## What this establishes

- The viewport-evidence defect from cycle 0 is closed on both task surfaces.
- The one capture script plus honest activation reporting is now the supported evidence
  path; agents that invent screenshot code now fail visibly.
- `npm test`: 77/77 pass, including capture-script coverage (canonical naming, honest
  failure for unactivatable states).

## Open problems carried to cycle 2

1. **Prototype chrome remains the likely main defect surface** (unchanged hypothesis from
   cycle 0): the control run's failures were scaffold controls. The names rule fixed
   their naming; the remaining question is whether scaffolding should be hidden from the
   product surface at all, per the confirmatory spec.
2. **Dashboard judged quality (−4.38 in the pilot) is not gate-visible.** No
   deterministic check covers information-density or metric-choice judgments; that
   requires the confirmatory review (issue #48), not another gate.
3. **Single-sample caveat stands:** one run per condition is indicative, not proof.
   Repetition when it matters, in the confirmatory design.
4. **Family selection still blocks the confirmatory run** (`selection_status: pending`).
   The inner loop is now fully functional; the publishable claim still waits on that.

## References

- Gate outputs: [`gates/public.json`](gates/public.json), [`gates/heldout.json`](gates/heldout.json)
- Shipped script: [`scripts/capture-evidence.mjs`](../../../../scripts/capture-evidence.mjs)
- Canonical procedure: [`benchmarks/README.md`](../../README.md#running-a-build)
- Previous cycle: [`cycle 0`](../cycle-0/README.md); tracking: issue #48
