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
