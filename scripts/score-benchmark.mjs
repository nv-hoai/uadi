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
    assert(reviewer.type === "human" || reviewer.type === "llm", prefix + '.type must be "human" or "llm"');
    assert(typeof reviewer.independent === "boolean", prefix + ".independent must be a boolean");
    if (reviewer.provenance !== undefined) {
      assert(typeof reviewer.provenance === "string" && reviewer.provenance.trim(), prefix + ".provenance must be a non-empty string when supplied");
    }
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

const T_CRITICAL_95 = {
  1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306,
  9: 2.262, 10: 2.228, 11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
  16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086, 21: 2.080, 22: 2.074,
  23: 2.069, 24: 2.064, 25: 2.060, 26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042
};

function tCritical95(degreesOfFreedom) {
  if (degreesOfFreedom < 1) return null;
  return T_CRITICAL_95[degreesOfFreedom] ?? 1.96;
}

function pairedDeltaSummary(deltas) {
  const n = deltas.length;
  const mean = average(deltas);
  if (n < 2) {
    return { n, mean, sd: null, se: null, df: null, ci95: null, method: "paired 95% t interval" };
  }
  const sd = Math.sqrt(deltas.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1));
  const se = sd / Math.sqrt(n);
  const df = n - 1;
  const critical = tCritical95(df);
  return {
    n,
    mean,
    sd,
    se,
    df,
    ci95: critical === null ? null : [mean - critical * se, mean + critical * se],
    method: "paired 95% t interval"
  };
}

function summarizePositions(pairResults) {
  const groups = { A: [], B: [], unknown: [] };
  for (const pair of pairResults) {
    if (pair.uadi_position === "A" || pair.uadi_position === "B") groups[pair.uadi_position].push(pair.delta);
    else groups.unknown.push(pair.delta);
  }
  const summarize = (deltas) => ({ pairs: deltas.length, mean_delta: deltas.length ? average(deltas) : null });
  const a = summarize(groups.A);
  const b = summarize(groups.B);
  return {
    uadi_as_a: a,
    uadi_as_b: b,
    unknown_pairs: groups.unknown.length,
    difference_a_minus_b: a.mean_delta !== null && b.mean_delta !== null ? a.mean_delta - b.mean_delta : null
  };
}

function summarizeOrderBalance(pairResults) {
  const byTask = new Map();
  let unknown = 0;
  let totalA = 0;
  let totalB = 0;
  for (const pair of pairResults) {
    if (!byTask.has(pair.task_id)) byTask.set(pair.task_id, { A: 0, B: 0, unknown: 0 });
    const counts = byTask.get(pair.task_id);
    if (pair.uadi_position === "A" || pair.uadi_position === "B") {
      counts[pair.uadi_position] += 1;
      if (pair.uadi_position === "A") totalA += 1;
      else totalB += 1;
    } else {
      counts.unknown += 1;
      unknown += 1;
    }
  }
  const tasks = {};
  let balanced = true;
  for (const [taskId, counts] of byTask) {
    const known = counts.A + counts.B;
    const taskBalanced = known > 0 && counts.unknown === 0 && Math.abs(counts.A - counts.B) <= known % 2;
    if (!taskBalanced) balanced = false;
    tasks[taskId] = { uadi_a: counts.A, uadi_b: counts.B, unknown: counts.unknown, balanced: taskBalanced };
  }
  const status = pairResults.length === 0 || unknown > 0 ? "unknown" : (balanced ? "balanced" : "unbalanced");
  return { status, balanced: status === "balanced", unknown_pairs: unknown, uadi_a: totalA, uadi_b: totalB, by_task: tasks };
}

export function scoreBenchmark(input) {
  assert(input && input.schema_version === 2, "schema_version must be 2");
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
    if (pair.uadi_position !== undefined) {
      assert(pair.uadi_position === "A" || pair.uadi_position === "B", label + '.uadi_position must be "A" or "B"');
    }
    if (pair.baseline_run_position !== undefined) {
      assert(pair.baseline_run_position === 1 || pair.baseline_run_position === 2,
        label + ".baseline_run_position must be 1 or 2");
    }

    const baselineIds = validateCondition(pair.baseline, label + ".baseline");
    const uadiIds = validateCondition(pair.uadi, label + ".uadi");
    assert(baselineIds.size === uadiIds.size && [...baselineIds].every((id) => uadiIds.has(id)),
      label + " must use the same reviewer IDs for baseline and UADI");
    const baselineById = new Map(pair.baseline.reviewers.map((reviewer) => [reviewer.id, reviewer]));
    const uadiById = new Map(pair.uadi.reviewers.map((reviewer) => [reviewer.id, reviewer]));
    for (const [id, reviewer] of baselineById) {
      const other = uadiById.get(id);
      assert(reviewer.type === other.type && reviewer.independent === other.independent,
        label + " reviewer " + id + " must keep the same type and independence in both conditions");
    }

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
      uadi_position: pair.uadi_position ?? null,
      baseline_run_position: pair.baseline_run_position ?? null,
      baseline_score: baselineScore,
      uadi_score: uadiScore,
      delta: uadiScore - baselineScore,
      baseline_duration_seconds: pair.baseline.duration_seconds,
      uadi_duration_seconds: pair.uadi.duration_seconds,
      dimensions
    };
  });

  const pairedDelta = pairedDeltaSummary(pairResults.map((pair) => pair.delta));
  const positionSensitivity = summarizePositions(pairResults);
  const orderBalance = summarizeOrderBalance(pairResults);
  const isConfirmatoryDesign = typeof input.study.design_type === "string" &&
    input.study.design_type.startsWith("confirmatory");

  const humanReviewers = new Set();
  const llmReviewers = new Set();
  const independentReviewers = new Set();
  let humanReviewMinimumMet = true;
  let machineReviewMinimumMet = true;
  for (const pair of input.pairs) {
    const baselineIndependent = pair.baseline.reviewers.filter((reviewer) => reviewer.independent === true);
    const uadiIndependent = pair.uadi.reviewers.filter((reviewer) => reviewer.independent === true);
    const baselineHumans = baselineIndependent.filter((reviewer) => reviewer.type === "human");
    const uadiHumans = uadiIndependent.filter((reviewer) => reviewer.type === "human");
    if (baselineIndependent.length < 2 || uadiIndependent.length < 2) machineReviewMinimumMet = false;
    if (baselineHumans.length < 2 || uadiHumans.length < 2) humanReviewMinimumMet = false;
    for (const reviewer of baselineIndependent) independentReviewers.add(reviewer.id);
    for (const reviewer of [...pair.baseline.reviewers, ...pair.uadi.reviewers]) {
      if (reviewer.type === "human") humanReviewers.add(reviewer.id);
      if (reviewer.type === "llm") llmReviewers.add(reviewer.id);
    }
  }

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
    return entries.length >= 3 && new Set(repetitions).size === entries.length && new Set(repetitions).size >= 3;
  });
  const qualifiedFamilies = modelMetadataComplete
    ? versionPinnedFamilies.filter(hasCompleteCoverage)
    : [];
  const pilotMinimumMet = qualifiedFamilies.length >= 1;
  const confirmatoryMinimumMet = qualifiedFamilies.length >= 2 && machineReviewMinimumMet &&
    (!isConfirmatoryDesign || orderBalance.balanced);
  const evidenceTier = confirmatoryMinimumMet
    ? (humanReviewMinimumMet ? "confirmatory-human" : "confirmatory-machine")
    : (pilotMinimumMet && machineReviewMinimumMet ? "machine-reviewed-pilot" : (pilotMinimumMet ? "exploratory-pilot" : "insufficient"));
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
  if (!pilotMinimumMet) protocolWarnings.push("Exploratory pilot minimum not met: require at least three unique repetitions for each of the three tasks on one model family with one pinned model version.");
  if (qualifiedFamilies.length < 2) protocolWarnings.push("Confirmatory multi-model minimum not met: require two qualifying model families, each with at least three unique repetitions for all three tasks.");
  if (!machineReviewMinimumMet) protocolWarnings.push("Machine-review minimum not met: every condition requires at least two independent reviewers, human or LLM, who did not produce either candidate.");
  if (!humanReviewMinimumMet) protocolWarnings.push("human-review minimum not met (optional): a machine review cannot establish human-perceived quality.");
  if (llmReviewers.size > 0 && humanReviewers.size === 0) protocolWarnings.push("All reviewers are LLM passes. Machine review is screening-grade and may share model-family blind spots with the builders.");
  if (isConfirmatoryDesign && !orderBalance.balanced) {
    protocolWarnings.push("Confirmatory design requires a balanced Candidate A/B schedule per task; run node scripts/validate-study-design.mjs before the study.");
  }
  if (isConfirmatoryDesign && positionSensitivity.unknown_pairs > 0) {
    protocolWarnings.push("Every pair in a confirmatory design must record uadi_position (A or B) so order sensitivity can be reported.");
  }
  const protocolAssessment = {
    exploratory_pilot_minimum_met: pilotMinimumMet,
    machine_review_minimum_met: machineReviewMinimumMet,
    confirmatory_minimum_met: confirmatoryMinimumMet,
    human_review_minimum_met: humanReviewMinimumMet,
    order_balance_met: orderBalance.status === "unknown" ? null : orderBalance.balanced,
    evidence_tier: evidenceTier,
    independent_reviewer_ids: [...independentReviewers].sort(),
    human_reviewer_ids: [...humanReviewers].sort(),
    llm_reviewer_ids: [...llmReviewers].sort(),
    llm_judge_passes: llmReviewers.size,
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
    paired_delta: pairedDelta,
    position_sensitivity: positionSensitivity,
    order_balance: orderBalance,
    dimensions: dimensionSummary,
    pairs: pairResults,
    interpretation_note: "Descriptive results with a paired 95% t interval. The interval is not a substitute for the study design: report sample size, reviewer agreement, position sensitivity, raw outputs and limitations, and do not claim superiority when the interval includes zero."
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
