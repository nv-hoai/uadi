#!/usr/bin/env node

export const DIMENSIONS = {
  product_understanding: 15,
  ux_reasoning: 20,
  design_judgment: 15,
  visual_hierarchy: 15,
  interaction_completeness: 15,
  accessibility_responsiveness: 10,
  implementation_quality: 10
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateCondition(condition, label) {
  assert(condition && typeof condition === "object", label + " must be an object");
  assert(Number.isFinite(condition.duration_seconds) && condition.duration_seconds > 0,
    label + ".duration_seconds must be a positive number");
  assert(Array.isArray(condition.reviewers) && condition.reviewers.length >= 2,
    label + ".reviewers must contain at least two independent reviewers");

  const ids = new Set();
  for (const [index, reviewer] of condition.reviewers.entries()) {
    const prefix = label + ".reviewers[" + index + "]";
    assert(reviewer && typeof reviewer.id === "string" && reviewer.id.trim(), prefix + ".id is required");
    assert(!ids.has(reviewer.id), label + " has duplicate reviewer id: " + reviewer.id);
    ids.add(reviewer.id);
    assert(reviewer.scores && typeof reviewer.scores === "object", prefix + ".scores is required");
    for (const dimension of Object.keys(DIMENSIONS)) {
      const score = reviewer.scores[dimension];
      assert(Number.isInteger(score) && score >= 0 && score <= 4,
        prefix + ".scores." + dimension + " must be an integer from 0 to 4");
    }
    const unexpected = Object.keys(reviewer.scores).filter((key) => !(key in DIMENSIONS));
    assert(unexpected.length === 0, prefix + " has unknown dimensions: " + unexpected.join(", "));
  }
  return ids;
}

function weightedScore(scores) {
  return Object.entries(DIMENSIONS).reduce((total, entry) =>
    total + (scores[entry[0]] / 4) * entry[1], 0);
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function scoreBenchmark(input) {
  assert(input && input.schema_version === 1, "schema_version must be 1");
  assert(input.study && typeof input.study.agent === "string" && input.study.agent.trim(), "study.agent is required");
  assert(typeof input.study.model === "string" && input.study.model.trim(), "study.model is required");
  assert(typeof input.study.date === "string" && input.study.date.trim(), "study.date is required");
  assert(typeof input.study.project_snapshot === "string" && input.study.project_snapshot.trim(), "study.project_snapshot is required");
  assert(Array.isArray(input.pairs) && input.pairs.length > 0, "pairs must contain at least one paired run");

  const pairIds = new Set();
  const taskIds = new Set();
  const pairResults = input.pairs.map((pair, index) => {
    const label = "pairs[" + index + "]";
    assert(pair && typeof pair.pair_id === "string" && pair.pair_id.trim(), label + ".pair_id is required");
    assert(!pairIds.has(pair.pair_id), "Duplicate pair_id: " + pair.pair_id);
    pairIds.add(pair.pair_id);
    assert(typeof pair.task_id === "string" && pair.task_id.trim(), label + ".task_id is required");
    taskIds.add(pair.task_id);

    const baselineIds = validateCondition(pair.baseline, label + ".baseline");
    const uadiIds = validateCondition(pair.uadi, label + ".uadi");
    assert(baselineIds.size === uadiIds.size && [...baselineIds].every((id) => uadiIds.has(id)),
      label + " must use the same reviewer IDs for baseline and UADI");

    const dimensions = {};
    for (const dimension of Object.keys(DIMENSIONS)) {
      const baseline = average(pair.baseline.reviewers.map((reviewer) => reviewer.scores[dimension]));
      const uadi = average(pair.uadi.reviewers.map((reviewer) => reviewer.scores[dimension]));
      dimensions[dimension] = { baseline, uadi, delta: uadi - baseline };
    }
    const baselineScore = average(pair.baseline.reviewers.map((reviewer) => weightedScore(reviewer.scores)));
    const uadiScore = average(pair.uadi.reviewers.map((reviewer) => weightedScore(reviewer.scores)));
    return {
      pair_id: pair.pair_id,
      task_id: pair.task_id,
      model_family: pair.model_family ?? input.study.model,
      model_version: pair.model_version ?? input.study.model,
      repetition: pair.repetition ?? null,
      baseline_score: baselineScore,
      uadi_score: uadiScore,
      delta: uadiScore - baselineScore,
      baseline_duration_seconds: pair.baseline.duration_seconds,
      uadi_duration_seconds: pair.uadi.duration_seconds,
      dimensions
    };
  });

  const requiredTasks = ["subscription-settings", "product-onboarding", "operations-dashboard"];
  const modelFamilies = [...new Set(pairResults.map((pair) => pair.model_family))];
  const cellPairs = new Map();
  const versionsByFamily = new Map();
  for (const pair of pairResults) {
    const key = pair.model_family + "::" + pair.task_id;
    if (!cellPairs.has(key)) cellPairs.set(key, []);
    cellPairs.get(key).push(pair);
    if (!versionsByFamily.has(pair.model_family)) versionsByFamily.set(pair.model_family, new Set());
    versionsByFamily.get(pair.model_family).add(pair.model_version);
  }
  const modelMetadataComplete = input.pairs.every((pair) =>
    typeof pair.model_family === "string" && pair.model_family.trim() &&
    typeof pair.model_version === "string" && pair.model_version.trim() &&
    Number.isInteger(pair.repetition) && pair.repetition > 0
  );
  const versionPinnedFamilies = modelFamilies.filter((family) => versionsByFamily.get(family).size === 1);
  const hasCompleteCoverage = (family) => requiredTasks.every((task) => {
    const entries = cellPairs.get(family + "::" + task) ?? [];
    const repetitions = entries.map((entry) => entry.repetition);
    return entries.length === 3 && new Set(repetitions).size === 3;
  });
  const qualifiedFamilies = modelMetadataComplete
    ? versionPinnedFamilies.filter(hasCompleteCoverage)
    : [];
  const pilotMinimumMet = qualifiedFamilies.length >= 1;
  const confirmatoryMinimumMet = qualifiedFamilies.length >= 2;
  const protocolWarnings = [];
  if (!modelMetadataComplete) protocolWarnings.push("Model metadata incomplete: every pair must record model_family, exact model_version and a positive repetition number.");
  for (const family of modelFamilies) {
    if (versionsByFamily.get(family).size > 1) {
      protocolWarnings.push("Model version is not pinned for family " + family + ": use one exact version across its repetitions.");
    }
    for (const task of requiredTasks) {
      const entries = cellPairs.get(family + "::" + task) ?? [];
      const repetitions = entries.map((entry) => entry.repetition);
      if (new Set(repetitions).size !== repetitions.length) {
        protocolWarnings.push("Duplicate repetition number for " + family + " / " + task + ".");
      }
    }
  }
  if (!pilotMinimumMet) protocolWarnings.push("Exploratory pilot minimum not met: require exactly three distinct repetitions for each of the three tasks on one model family with one pinned model version.");
  if (!confirmatoryMinimumMet) protocolWarnings.push("Confirmatory multi-model minimum not met: require two qualifying model families, each with exactly three distinct repetitions for all three tasks.");
  const protocolAssessment = {
    exploratory_pilot_minimum_met: pilotMinimumMet,
    confirmatory_minimum_met: confirmatoryMinimumMet,
    model_families: modelFamilies,
    qualified_model_families: qualifiedFamilies,
    task_coverage: [...taskIds],
    pair_counts_by_model_and_task: Object.fromEntries([...cellPairs.entries()].map(([key, entries]) => [key, entries.length])),
    warnings: protocolWarnings
  };

  const baselineScore = average(pairResults.map((pair) => pair.baseline_score));
  const uadiScore = average(pairResults.map((pair) => pair.uadi_score));
  const baselineTime = average(pairResults.map((pair) => pair.baseline_duration_seconds));
  const uadiTime = average(pairResults.map((pair) => pair.uadi_duration_seconds));
  const dimensionSummary = Object.fromEntries(Object.keys(DIMENSIONS).map((dimension) => [
    dimension,
    {
      baseline: average(pairResults.map((pair) => pair.dimensions[dimension].baseline)),
      uadi: average(pairResults.map((pair) => pair.dimensions[dimension].uadi)),
      delta: average(pairResults.map((pair) => pair.dimensions[dimension].delta))
    }
  ]));

  return {
    study: input.study,
    protocol_assessment: protocolAssessment,
    pair_count: pairResults.length,
    task_count: taskIds.size,
    baseline_weighted_score: baselineScore,
    uadi_weighted_score: uadiScore,
    mean_score_delta: uadiScore - baselineScore,
    pairs_won_by_uadi: pairResults.filter((pair) => pair.delta > 0).length,
    pairs_tied: pairResults.filter((pair) => pair.delta === 0).length,
    pairs_lost_by_uadi: pairResults.filter((pair) => pair.delta < 0).length,
    baseline_mean_duration_seconds: baselineTime,
    uadi_mean_duration_seconds: uadiTime,
    time_change_percent: ((uadiTime - baselineTime) / baselineTime) * 100,
    dimensions: dimensionSummary,
    pairs: pairResults,
    interpretation_note: "Descriptive results only. This scorer does not test statistical significance or establish causation; report sample size, reviewer agreement, raw outputs and study limitations."
  };
}

import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath || inputPath === "--help" || inputPath === "-h") {
    console.log("Usage: node scripts/score-benchmark.mjs <benchmark-results.json>");
    process.exitCode = inputPath ? 0 : 1;
    return;
  }
  const { readFile } = await import("node:fs/promises");
  const input = JSON.parse(await readFile(resolve(inputPath), "utf8"));
  console.log(JSON.stringify(scoreBenchmark(input), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Benchmark scoring failed: " + error.message);
    process.exitCode = 1;
  });
}
