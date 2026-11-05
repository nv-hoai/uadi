import test from "node:test";
import assert from "node:assert/strict";
import { scoreBenchmark, DIMENSIONS } from "../scripts/score-benchmark.mjs";

function reviewer(id, score) {
  return { id, scores: Object.fromEntries(Object.keys(DIMENSIONS).map((key) => [key, score])) };
}

function fixture() {
  return {
    schema_version: 1,
    study: { agent: "Example agent", model: "Example model", date: "2026-11-05", project_snapshot: "fixture-commit" },
    pairs: [{
      pair_id: "subscription-01",
      task_id: "subscription-settings",
      baseline: { duration_seconds: 100, reviewers: [reviewer("r1", 2), reviewer("r2", 2)] },
      uadi: { duration_seconds: 90, reviewers: [reviewer("r1", 3), reviewer("r2", 3)] }
    }]
  };
}

test("calculates paired weighted scores, deltas and time change", () => {
  const result = scoreBenchmark(fixture());
  assert.equal(result.baseline_weighted_score, 50);
  assert.equal(result.uadi_weighted_score, 75);
  assert.equal(result.mean_score_delta, 25);
  assert.equal(result.pairs_won_by_uadi, 1);
  assert.equal(result.time_change_percent, -10);
  assert.equal(result.task_count, 1);
});

test("requires at least two independent reviewers per condition", () => {
  const input = fixture();
  input.pairs[0].uadi.reviewers.pop();
  assert.throws(() => scoreBenchmark(input), /at least two independent reviewers/);
});

test("requires the same reviewer panel for both conditions", () => {
  const input = fixture();
  input.pairs[0].uadi.reviewers[1].id = "r3";
  assert.throws(() => scoreBenchmark(input), /same reviewer IDs/);
});

test("rejects scores outside the 0-4 rubric", () => {
  const input = fixture();
  input.pairs[0].baseline.reviewers[0].scores.ux_reasoning = 5;
  assert.throws(() => scoreBenchmark(input), /integer from 0 to 4/);
});

test("rejects duplicate paired run identifiers", () => {
  const input = fixture();
  input.pairs.push({ ...input.pairs[0] });
  assert.throws(() => scoreBenchmark(input), /Duplicate pair_id/);
});
