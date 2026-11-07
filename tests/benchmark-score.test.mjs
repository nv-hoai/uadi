import test from "node:test";
import assert from "node:assert/strict";
import { scoreBenchmark, DIMENSIONS } from "../scripts/score-benchmark.mjs";

function reviewer(id, score, overrides = {}) {
  return {
    id,
    type: "human",
    independent: true,
    ...overrides,
    scores: Object.fromEntries(Object.keys(DIMENSIONS).map((key) => [key, score]))
  };
}

function fixture() {
  return {
    schema_version: 2,
    study: { agent: "Example agent", model: "Example model", date: "2026-11-05", project_snapshot: "fixture-commit" },
    pairs: [{
      pair_id: "subscription-01",
      task_id: "subscription-settings",
      model_family: "Example family",
      model_version: "Example model v1",
      repetition: 1,
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
  assert.equal(result.pairs[0].model_family, "Example family");
  assert.equal(result.pairs[0].model_version, "Example model v1");
  assert.equal(result.pairs[0].repetition, 1);
  assert.equal(result.protocol_assessment.exploratory_pilot_minimum_met, false);
  assert.equal(result.protocol_assessment.confirmatory_minimum_met, false);
  assert.equal(result.protocol_assessment.warnings.length, 2);
});

test("requires at least two independent reviewers per condition", () => {
  const input = fixture();
  input.pairs[0].uadi.reviewers.pop();
  assert.throws(() => scoreBenchmark(input), /at least two independent reviewers/);
});

test("requires the versioned reviewer-provenance results format", () => {
  const input = fixture();
  input.schema_version = 1;
  assert.throws(() => scoreBenchmark(input), /schema_version must be 2/);
});

test("requires reviewer type and independence metadata", () => {
  const missingType = fixture();
  delete missingType.pairs[0].baseline.reviewers[0].type;
  assert.throws(() => scoreBenchmark(missingType), /\.type must be "human" or "llm"/);

  const missingIndependence = fixture();
  delete missingIndependence.pairs[0].uadi.reviewers[1].independent;
  assert.throws(() => scoreBenchmark(missingIndependence), /independent must be a boolean/);
});

test("requires the same reviewer type and independence in both conditions", () => {
  const input = fixture();
  input.pairs[0].uadi.reviewers[0].type = "llm";
  assert.throws(() => scoreBenchmark(input), /same type and independence/);
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


test("recognizes the minimum multi-model protocol only with three distinct repetitions per task and model", () => {
  const input = fixture();
  input.pairs = [];
  for (const model_family of ["family-a", "family-b"]) {
    for (const task_id of ["subscription-settings", "product-onboarding", "operations-dashboard"]) {
      for (const repetition of [1, 2, 3]) {
        const pair = fixture().pairs[0];
        input.pairs.push({
          ...pair,
          pair_id: model_family + "-" + task_id + "-" + repetition,
          task_id,
          model_family,
          model_version: model_family + "-v1",
          repetition
        });
      }
    }
  }
  const result = scoreBenchmark(input);
  assert.equal(result.pair_count, 18);
  assert.equal(result.protocol_assessment.exploratory_pilot_minimum_met, true);
  assert.equal(result.protocol_assessment.human_review_minimum_met, true);
  assert.equal(result.protocol_assessment.confirmatory_minimum_met, true);
  assert.deepEqual(result.protocol_assessment.model_families.sort(), ["family-a", "family-b"]);
});

test("an LLM-only panel qualifies a machine-reviewed confirmatory study but not a human review", () => {
  const input = fixture();
  input.pairs = [];
  for (const model_family of ["family-a", "family-b"]) {
    for (const task_id of ["subscription-settings", "product-onboarding", "operations-dashboard"]) {
      for (const repetition of [1, 2, 3]) {
        const pair = fixture().pairs[0];
        const judge = (id, score) => reviewer(id, score, { type: "llm", independent: true, provenance: "machine reviewer pass 1" });
        input.pairs.push({
          ...pair,
          pair_id: model_family + "-" + task_id + "-" + repetition,
          task_id,
          model_family,
          model_version: model_family + "-v1",
          repetition,
          baseline: { duration_seconds: 100, reviewers: [judge("J1", 2), judge("J2", 2)] },
          uadi: { duration_seconds: 90, reviewers: [judge("J1", 3), judge("J2", 3)] }
        });
      }
    }
  }
  const result = scoreBenchmark(input);
  assert.equal(result.protocol_assessment.qualified_model_families.length, 2);
  assert.equal(result.protocol_assessment.machine_review_minimum_met, true);
  assert.equal(result.protocol_assessment.human_review_minimum_met, false);
  assert.equal(result.protocol_assessment.confirmatory_minimum_met, true);
  assert.equal(result.protocol_assessment.evidence_tier, "confirmatory-machine");
  assert.deepEqual(result.protocol_assessment.llm_reviewer_ids.sort(), ["J1", "J2"]);
  assert.ok(result.protocol_assessment.warnings.some((warning) => warning.includes("human-review minimum")));
});

test("does not qualify a confirmatory study when fewer than two reviewers are independent", () => {
  const input = fixture();
  input.pairs = [];
  for (const model_family of ["family-a", "family-b"]) {
    for (const task_id of ["subscription-settings", "product-onboarding", "operations-dashboard"]) {
      for (const repetition of [1, 2, 3]) {
        const pair = fixture().pairs[0];
        const judge = (id, score) => reviewer(id, score, { type: "llm", independent: false });
        input.pairs.push({
          ...pair,
          pair_id: model_family + "-" + task_id + "-" + repetition,
          task_id,
          model_family,
          model_version: model_family + "-v1",
          repetition,
          baseline: { duration_seconds: 100, reviewers: [judge("J1", 2), judge("J2", 2)] },
          uadi: { duration_seconds: 90, reviewers: [judge("J1", 3), judge("J2", 3)] }
        });
      }
    }
  }
  const result = scoreBenchmark(input);
  assert.equal(result.protocol_assessment.machine_review_minimum_met, false);
  assert.equal(result.protocol_assessment.confirmatory_minimum_met, false);
  assert.equal(result.protocol_assessment.evidence_tier, "exploratory-pilot");
  assert.ok(result.protocol_assessment.warnings.some((warning) => warning.includes("Machine-review minimum")));
});


test("does not qualify a pilot when a model family mixes exact model versions", () => {
  const input = fixture();
  input.pairs = [];
  for (const task_id of ["subscription-settings", "product-onboarding", "operations-dashboard"]) {
    for (const repetition of [1, 2, 3]) {
      const pair = fixture().pairs[0];
      input.pairs.push({
        ...pair,
        pair_id: task_id + "-" + repetition,
        task_id,
        model_version: repetition === 3 ? "Example model v2" : "Example model v1",
        repetition
      });
    }
  }
  const result = scoreBenchmark(input);
  assert.equal(result.protocol_assessment.exploratory_pilot_minimum_met, false);
  assert.ok(result.protocol_assessment.warnings.some((warning) => warning.includes("not pinned")));
});

test("qualifies two complete model families even when an extra family is only partially sampled", () => {
  const input = fixture();
  input.pairs = [];
  for (const model_family of ["family-a", "family-b"]) {
    for (const task_id of ["subscription-settings", "product-onboarding", "operations-dashboard"]) {
      for (const repetition of [1, 2, 3]) {
        const pair = fixture().pairs[0];
        input.pairs.push({
          ...pair,
          pair_id: model_family + "-" + task_id + "-" + repetition,
          task_id,
          model_family,
          model_version: model_family + "-v1",
          repetition
        });
      }
    }
  }
  const partial = fixture().pairs[0];
  input.pairs.push({
    ...partial,
    pair_id: "family-c-partial",
    model_family: "family-c",
    model_version: "family-c-v1"
  });
  const result = scoreBenchmark(input);
  assert.equal(result.protocol_assessment.confirmatory_minimum_met, true);
  assert.deepEqual(result.protocol_assessment.qualified_model_families.sort(), ["family-a", "family-b"]);
});

test("does not count duplicate repetition labels toward a sample minimum", () => {
  const input = fixture();
  input.pairs = [];
  for (const task_id of ["subscription-settings", "product-onboarding", "operations-dashboard"]) {
    for (const repetition of [1, 2, 3]) {
      const pair = fixture().pairs[0];
      input.pairs.push({ ...pair, pair_id: task_id + "-" + repetition, task_id, repetition });
    }
  }
  input.pairs.push({ ...input.pairs[0], pair_id: "duplicate-repetition" });
  const result = scoreBenchmark(input);
  assert.equal(result.protocol_assessment.exploratory_pilot_minimum_met, false);
  assert.ok(result.protocol_assessment.warnings.some((warning) => warning.includes("Duplicate repetition")));
});

test("reports a paired interval and position sensitivity instead of a bare mean", () => {
  const input = fixture();
  input.pairs = [];
  const deltas = [0, 25, 50, 25];
  const positions = ["A", "B", "B", "A"];
  for (const [index, delta] of deltas.entries()) {
    const pair = fixture().pairs[0];
    const uadiScore = 2 + delta / 25;
    input.pairs.push({
      ...pair,
      pair_id: "uncertainty-" + index,
      uadi_position: positions[index],
      uadi: { duration_seconds: 90, reviewers: [reviewer("r1", uadiScore), reviewer("r2", uadiScore)] }
    });
  }
  const result = scoreBenchmark(input);
  assert.equal(result.paired_delta.n, 4);
  assert.equal(result.paired_delta.mean, 25);
  assert.ok(result.paired_delta.ci95[0] < 0);
  assert.ok(result.paired_delta.ci95[1] > 50);
  assert.equal(result.position_sensitivity.uadi_as_a.pairs, 2);
  assert.equal(result.position_sensitivity.uadi_as_b.pairs, 2);
  assert.equal(result.position_sensitivity.unknown_pairs, 0);
  assert.equal(result.order_balance.balanced, true);
});

test("a confirmatory design does not qualify with an all-A candidate schedule", () => {
  const input = fixture();
  input.study.design_type = "confirmatory";
  input.pairs = [];
  for (const model_family of ["family-a", "family-b"]) {
    for (const task_id of ["subscription-settings", "product-onboarding", "operations-dashboard"]) {
      for (const repetition of [1, 2, 3]) {
        const pair = fixture().pairs[0];
        input.pairs.push({
          ...pair,
          pair_id: model_family + "-" + task_id + "-" + repetition,
          task_id,
          model_family,
          model_version: model_family + "-v1",
          repetition,
          uadi_position: "A"
        });
      }
    }
  }
  const unbalanced = scoreBenchmark(input);
  assert.equal(unbalanced.order_balance.balanced, false);
  assert.equal(unbalanced.protocol_assessment.confirmatory_minimum_met, false);
  assert.ok(unbalanced.protocol_assessment.warnings.some((warning) => warning.includes("balanced Candidate A/B")));

  for (const pair of input.pairs) pair.uadi_position = pair.model_family === "family-a" ? "A" : "B";
  const balanced = scoreBenchmark(input);
  assert.equal(balanced.order_balance.balanced, true);
  assert.equal(balanced.protocol_assessment.confirmatory_minimum_met, true);
});

test("rejects an unknown candidate position", () => {
  const input = fixture();
  input.pairs[0].uadi_position = "C";
  assert.throws(() => scoreBenchmark(input), /uadi_position must be "A" or "B"/);
});

test("reports token spend and median durations when recorded", () => {
  const input = fixture();
  input.pairs = [];
  const tokens = [5000, 4000];
  const durations = [1200, 1800];
  for (const [index, value] of tokens.entries()) {
    const pair = fixture().pairs[0];
    input.pairs.push({
      ...pair,
      pair_id: "tokens-" + index,
      task_id: "task-" + index,
      baseline: { ...pair.baseline, duration_seconds: durations[index], tokens: value },
      uadi: { ...pair.uadi, duration_seconds: durations[index] + 300, tokens: value * 2 }
    });
  }
  const result = scoreBenchmark(input);
  assert.equal(result.tokens.pairs, 2);
  assert.equal(result.tokens.baseline_mean, 4500);
  assert.equal(result.tokens.uadi_mean, 9000);
  assert.equal(result.tokens.baseline_median, 4500);
  assert.ok(result.tokens.change_percent > 0);
  assert.equal(result.baseline_median_duration_seconds, 1500);
  assert.equal(result.pairs[0].baseline_tokens, 5000);
  assert.equal(result.pairs[0].uadi_tokens, 10000);
});
