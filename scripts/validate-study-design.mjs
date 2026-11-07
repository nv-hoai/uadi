#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ARCHETYPES = ["settings", "onboarding", "dashboard"];
const REQUIRED_STATES = ["default", "loading", "empty", "error", "success", "restricted"];
const REQUIRED_VIEWPORTS = ["390x844", "1280x900"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function add(errors, where, message) {
  errors.push({ path: where, message });
}

function addWarning(warnings, where, message) {
  warnings.push({ path: where, message });
}

function countBy(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

export function validateStudyDesign(input) {
  const errors = [];
  const warnings = [];

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, errors: [{ path: "$", message: "study design must be a JSON object" }], warnings, summary: null };
  }

  if (input.schema_version !== 1) add(errors, "schema_version", "must be 1");
  for (const key of ["study_id", "protocol_version", "created_at"]) {
    if (!isNonEmptyString(input[key])) add(errors, key, "is required");
  }
  if (input.status !== "preregistered") add(errors, "status", 'must be "preregistered"');
  if (input.design_type !== "confirmatory-machine") add(errors, "design_type", 'must be "confirmatory-machine"');

  const hypothesis = input.hypothesis ?? {};
  for (const key of ["primary", "direction", "primary_outcome"]) {
    if (!isNonEmptyString(hypothesis[key])) add(errors, "hypothesis." + key, "is required");
  }
  if (!Number.isFinite(hypothesis.minimum_detectable_effect_points) || hypothesis.minimum_detectable_effect_points <= 0) {
    add(errors, "hypothesis.minimum_detectable_effect_points", "must be a positive number");
  }
  if (!Number.isFinite(hypothesis.alpha) || hypothesis.alpha <= 0 || hypothesis.alpha >= 1) {
    add(errors, "hypothesis.alpha", "must be between 0 and 1");
  }

  const builders = Array.isArray(input.builders) ? input.builders : [];
  if (builders.length < 2) add(errors, "builders", "must contain at least two model families");
  const builderFamilies = [];
  const builderSettings = [];
  for (const [index, builder] of builders.entries()) {
    const where = "builders[" + index + "]";
    if (!isNonEmptyString(builder?.model_family)) add(errors, where + ".model_family", "is required");
    else if (builderFamilies.includes(builder.model_family)) add(errors, where + ".model_family", "must be unique");
    else builderFamilies.push(builder.model_family);
    if (!isNonEmptyString(builder?.model_version)) add(errors, where + ".model_version", "is required");
    if (!isNonEmptyString(builder?.agent)) add(errors, where + ".agent", "is required");
    if (!isNonEmptyString(builder?.settings)) add(errors, where + ".settings", "is required");
    else builderSettings.push(builder.settings);
  }
  if (builderSettings.length > 1 && new Set(builderSettings).size > 1) {
    add(errors, "builders[].settings", "builder settings must be identical across model families");
  }

  const tasks = Array.isArray(input.tasks) ? input.tasks : [];
  if (tasks.length < 3) add(errors, "tasks", "must contain at least three public tasks");
  const taskIds = [];
  const taskArchetypes = [];
  for (const [index, task] of tasks.entries()) {
    const where = "tasks[" + index + "]";
    if (!isNonEmptyString(task?.task_id)) add(errors, where + ".task_id", "is required");
    else if (taskIds.includes(task.task_id)) add(errors, where + ".task_id", "must be unique");
    else taskIds.push(task.task_id);
    if (!ARCHETYPES.includes(task?.archetype)) add(errors, where + ".archetype", "must be one of " + ARCHETYPES.join(", "));
    else taskArchetypes.push(task.archetype);
    if (!isNonEmptyString(task?.task_version)) add(errors, where + ".task_version", "is required");
    if (task?.split !== "public") add(errors, where + ".split", 'must be "public"');
  }
  for (const archetype of ARCHETYPES) {
    if (!taskArchetypes.includes(archetype)) add(errors, "tasks", "must cover the " + archetype + " archetype");
  }

  const heldOutTasks = Array.isArray(input.held_out_tasks) ? input.held_out_tasks : [];
  if (heldOutTasks.length < 3) add(errors, "held_out_tasks", "must contain at least three held-out tasks");
  const heldOutIds = [];
  const heldOutArchetypes = [];
  for (const [index, task] of heldOutTasks.entries()) {
    const where = "held_out_tasks[" + index + "]";
    if (!isNonEmptyString(task?.task_id)) add(errors, where + ".task_id", "is required");
    else if (taskIds.includes(task.task_id) || heldOutIds.includes(task.task_id)) add(errors, where + ".task_id", "must not duplicate a public or held-out task");
    else heldOutIds.push(task.task_id);
    if (!ARCHETYPES.includes(task?.archetype)) add(errors, where + ".archetype", "must be one of " + ARCHETYPES.join(", "));
    else heldOutArchetypes.push(task.archetype);
    if (!isNonEmptyString(task?.task_version)) add(errors, where + ".task_version", "is required");
    if (!["ready", "to-author"].includes(task?.status)) add(errors, where + ".status", 'must be "ready" or "to-author"');
    if (task?.status === "to-author") addWarning(warnings, where + ".status", "author and validate this held-out task before running the study");
    if (task?.used_for_guidance_changes !== false) add(errors, where + ".used_for_guidance_changes", "must be false");
  }
  for (const archetype of ARCHETYPES) {
    if (!heldOutArchetypes.includes(archetype)) add(errors, "held_out_tasks", "must cover the " + archetype + " archetype");
  }

  const frozen = input.frozen ?? {};
  let frozenPlaceholders = 0;
  for (const key of ["snapshot_hash", "prompt_hash", "skill_hash"]) {
    if (!isNonEmptyString(frozen[key])) add(errors, "frozen." + key, "is required");
    else if (frozen[key].includes("REPLACE")) frozenPlaceholders += 1;
  }
  if (frozenPlaceholders > 0) {
    addWarning(warnings, "frozen", "replace the template placeholder hashes with the frozen values");
  }
  if (!Number.isFinite(frozen.time_budget_minutes) || frozen.time_budget_minutes <= 0) {
    add(errors, "frozen.time_budget_minutes", "must be a positive number");
  }

  const design = input.design ?? {};
  const repetitions = design.repetitions;
  if (!Number.isInteger(repetitions) || repetitions < 3) add(errors, "design.repetitions", "must be an integer of at least 3");
  const pairs = Array.isArray(design.pairs) ? design.pairs : [];
  const expectedPairs = builderFamilies.length * taskIds.length * (Number.isInteger(repetitions) ? repetitions : 0);
  if (pairs.length !== expectedPairs) {
    add(errors, "design.pairs", "must contain " + expectedPairs + " pairs (builders x tasks x repetitions), found " + pairs.length);
  }

  const pairIds = [];
  const coverage = new Map();
  const positionsByTask = new Map();
  const runPositionsByTask = new Map();
  const execution = input.execution ?? {};
  let placeholderPairs = 0;
  for (const [index, pair] of pairs.entries()) {
    const where = "design.pairs[" + index + "]";
    if (!isNonEmptyString(pair?.pair_id)) add(errors, where + ".pair_id", "is required");
    else if (pairIds.includes(pair.pair_id)) add(errors, where + ".pair_id", "must be unique");
    else pairIds.push(pair.pair_id);

    if (!builderFamilies.includes(pair?.model_family)) add(errors, where + ".model_family", "must reference a builder family");
    if (!taskIds.includes(pair?.task_id)) add(errors, where + ".task_id", "must reference a public task");
    if (!Number.isInteger(pair?.repetition) || pair.repetition < 1 || pair.repetition > repetitions) {
      add(errors, where + ".repetition", "must be between 1 and design.repetitions");
    }
    if (!["A", "B"].includes(pair?.uadi_position)) add(errors, where + ".uadi_position", 'must be "A" or "B"');
    if (![1, 2].includes(pair?.baseline_run_position)) add(errors, where + ".baseline_run_position", "must be 1 or 2");

    let hasPairPlaceholder = false;
    for (const key of ["snapshot_hash", "prompt_hash", "skill_hash"]) {
      const value = pair?.[key] ?? frozen[key];
      if (!isNonEmptyString(value)) add(errors, where + "." + key, "is required (or set frozen." + key + ")");
      else if (pair?.[key] !== undefined && value.includes("REPLACE")) hasPairPlaceholder = true;
    }
    if (hasPairPlaceholder) placeholderPairs += 1;
    const timeBudget = pair?.time_budget_minutes ?? frozen.time_budget_minutes;
    if (!Number.isFinite(timeBudget) || timeBudget <= 0) {
      add(errors, where + ".time_budget_minutes", "must be a positive number");
    } else if (Number.isFinite(execution.time_budget_minutes) && timeBudget !== execution.time_budget_minutes) {
      add(errors, where + ".time_budget_minutes", "must match execution.time_budget_minutes");
    }

    if (isNonEmptyString(pair?.model_family) && isNonEmptyString(pair?.task_id) && Number.isInteger(pair?.repetition)) {
      const key = pair.model_family + "::" + pair.task_id;
      if (!coverage.has(key)) coverage.set(key, []);
      coverage.get(key).push(pair.repetition);
    }
    if (isNonEmptyString(pair?.task_id)) {
      if (!positionsByTask.has(pair.task_id)) positionsByTask.set(pair.task_id, []);
      if (["A", "B"].includes(pair.uadi_position)) positionsByTask.get(pair.task_id).push(pair.uadi_position);
      if (!runPositionsByTask.has(pair.task_id)) runPositionsByTask.set(pair.task_id, []);
      if ([1, 2].includes(pair.baseline_run_position)) runPositionsByTask.get(pair.task_id).push(pair.baseline_run_position);
    }
  }

  if (placeholderPairs > 0) {
    addWarning(warnings, "design.pairs", placeholderPairs + " pairs still contain template placeholder hashes");
  }

  for (const family of builderFamilies) {
    for (const taskId of taskIds) {
      const key = family + "::" + taskId;
      const observed = coverage.get(key) ?? [];
      const expected = Number.isInteger(repetitions) ? Array.from({ length: repetitions }, (_, index) => index + 1) : [];
      if (observed.length !== expected.length || new Set(observed).size !== expected.length ||
          expected.some((repetition) => !observed.includes(repetition))) {
        add(errors, "design.pairs", key + " must contain exactly repetitions 1-" + repetitions + " once each");
      }
    }
  }

  const orderBalanceByTask = {};
  const runBalanceByTask = {};
  for (const taskId of taskIds) {
    const positions = countBy(positionsByTask.get(taskId) ?? []);
    const a = positions.A ?? 0;
    const b = positions.B ?? 0;
    const balanced = a + b > 0 && Math.abs(a - b) <= (a + b) % 2;
    orderBalanceByTask[taskId] = { uadi_a: a, uadi_b: b, balanced };
    if (!balanced) add(errors, "design.pairs", taskId + " must balance UADI Candidate A and B (found " + a + " A, " + b + " B)");

    const runs = countBy(runPositionsByTask.get(taskId) ?? []);
    const first = runs[1] ?? 0;
    const second = runs[2] ?? 0;
    const runBalanced = first + second > 0 && Math.abs(first - second) <= (first + second) % 2;
    runBalanceByTask[taskId] = { baseline_first: first, uadi_first: second, balanced: runBalanced };
    if (!runBalanced) add(errors, "design.pairs", taskId + " must balance baseline-first and UADI-first run order");
  }

  const review = input.review ?? {};
  const reviewerFamilies = Array.isArray(review.reviewer_families) ? review.reviewer_families : [];
  if (reviewerFamilies.length === 0) add(errors, "review.reviewer_families", "must name at least one reviewer model family");
  if (reviewerFamilies.some((family) => !isNonEmptyString(family))) add(errors, "review.reviewer_families", "entries must be non-empty strings");
  if (reviewerFamilies.length === 1) addWarning(warnings, "review.reviewer_families", "one reviewer family shares a single set of blind spots; prefer two");
  const overlap = reviewerFamilies.filter((family) => builderFamilies.includes(family));
  if (overlap.length > 0) add(errors, "review.reviewer_families", "reviewers must not share a builder family: " + overlap.join(", "));
  if (!Number.isInteger(review.reviewers_per_condition) || review.reviewers_per_condition < 2) {
    add(errors, "review.reviewers_per_condition", "must be at least 2");
  }
  if (review.builder_family_excluded !== true) add(errors, "review.builder_family_excluded", "must be true");
  if (review.blinded !== true) add(errors, "review.blinded", "must be true");

  const calibration = review.calibration ?? {};
  if (!Number.isInteger(calibration.seed_pairs) || calibration.seed_pairs < 3) {
    add(errors, "review.calibration.seed_pairs", "must be at least 3");
  }
  if (!Number.isInteger(calibration.clean_seed_pairs) || calibration.clean_seed_pairs < 1) {
    add(errors, "review.calibration.clean_seed_pairs", "must be at least 1");
  }
  if (!Array.isArray(calibration.required_critical_defects) || calibration.required_critical_defects.length < 2) {
    add(errors, "review.calibration.required_critical_defects", "must name at least two seeded defects");
  }
  if (calibration.duplicate_packet !== true) add(errors, "review.calibration.duplicate_packet", "must be true");

  const stateCapture = review.state_capture ?? {};
  const viewports = Array.isArray(stateCapture.viewports) ? stateCapture.viewports : [];
  for (const viewport of REQUIRED_VIEWPORTS) {
    if (!viewports.includes(viewport)) add(errors, "review.state_capture.viewports", "must include " + viewport);
  }
  const states = Array.isArray(stateCapture.required_states) ? stateCapture.required_states : [];
  for (const state of REQUIRED_STATES) {
    if (!states.includes(state)) add(errors, "review.state_capture.required_states", "must include " + state);
  }
  if (stateCapture.hide_prototype_chrome !== true) {
    add(errors, "review.state_capture.hide_prototype_chrome", "must be true so prototype controls do not obscure product evidence");
  }

  const rule = input.decision_rule ?? {};
  if (!isNonEmptyString(rule.primary_outcome)) add(errors, "decision_rule.primary_outcome", "is required");
  if (!isNonEmptyString(rule.confidence_interval)) add(errors, "decision_rule.confidence_interval", "is required");
  if (rule.superiority_requires_ci_lower_bound_above !== 0) {
    add(errors, "decision_rule.superiority_requires_ci_lower_bound_above", "must be 0 for a superiority claim");
  }
  if (!Number.isFinite(rule.minimum_effect_points) || rule.minimum_effect_points <= 0) {
    add(errors, "decision_rule.minimum_effect_points", "must be a positive number");
  } else if (Number.isFinite(hypothesis.minimum_detectable_effect_points) &&
             rule.minimum_effect_points !== hypothesis.minimum_detectable_effect_points) {
    add(errors, "decision_rule.minimum_effect_points", "must match hypothesis.minimum_detectable_effect_points");
  }
  if (!Number.isFinite(rule.no_task_or_family_regression_below_points) || rule.no_task_or_family_regression_below_points > 0) {
    add(errors, "decision_rule.no_task_or_family_regression_below_points", "must be zero or negative");
  }
  for (const key of ["require_order_balance", "require_reviewer_calibration", "require_held_out_suite_for_guidance_changes"]) {
    if (rule[key] !== true) add(errors, "decision_rule." + key, "must be true");
  }

  if (!["sequential", "concurrent-recorded"].includes(execution.mode)) {
    add(errors, "execution.mode", 'must be "sequential" or "concurrent-recorded"');
  }
  if (execution.mode === "concurrent-recorded" && !isNonEmptyString(execution.concurrency)) {
    add(errors, "execution.concurrency", "must describe the concurrency when mode is concurrent-recorded");
  }
  if (execution.mode === "concurrent-recorded") {
    addWarning(warnings, "execution.mode", "concurrency can confound timing; prefer sequential runs");
  }
  if (!Number.isFinite(execution.time_budget_minutes) || execution.time_budget_minutes <= 0) {
    add(errors, "execution.time_budget_minutes", "must be a positive number");
  }
  if (execution.record_tokens !== true) add(errors, "execution.record_tokens", "must be true");
  if (execution.record_cost !== true) add(errors, "execution.record_cost", "must be true");

  const reporting = input.reporting ?? {};
  const reportBy = Array.isArray(reporting.report_by) ? reporting.report_by : [];
  for (const key of ["model_family", "task", "dimension"]) {
    if (!reportBy.includes(key)) add(errors, "reporting.report_by", "must include " + key);
  }
  for (const key of ["publish_reviewer_disagreement", "publish_position_sensitivity", "publish_cost", "publish_negative_results"]) {
    if (reporting[key] !== true) add(errors, "reporting." + key, "must be true");
  }

  // A study that cannot reach the minimum detectable effect is not worth running.
  if (Number.isFinite(hypothesis.minimum_detectable_effect_points) && pairs.length > 0) {
    const claimed = hypothesis.minimum_detectable_effect_points;
    const assumedSd = design.assumed_pair_sd_points;
    if (Number.isFinite(assumedSd) && assumedSd > 0) {
      const halfWidth = 1.96 * assumedSd / Math.sqrt(pairs.length);
      if (claimed < halfWidth) {
        addWarning(warnings, "hypothesis.minimum_detectable_effect_points",
          "with " + pairs.length + " pairs and an assumed pair SD of " + assumedSd +
          ", the expected 95% half-width is about " + halfWidth.toFixed(1) +
          " points; pre-register an MDE at least that large or add pairs");
      }
    }
    if (claimed < 2) addWarning(warnings, "hypothesis.minimum_detectable_effect_points", "a two-point effect is close to the rubric's own noise; consider a larger effect or more pairs");
  }

  const summary = {
    builders: builderFamilies,
    tasks: taskIds,
    held_out_tasks: heldOutIds,
    repetitions: Number.isInteger(repetitions) ? repetitions : null,
    expected_pairs: expectedPairs,
    actual_pairs: pairs.length,
    coverage: Object.fromEntries([...coverage.entries()].map(([key, reps]) => [key, reps.length])),
    order_balance: {
      balanced: Object.values(orderBalanceByTask).every((task) => task.balanced),
      by_task: orderBalanceByTask
    },
    run_order_balance: {
      balanced: Object.values(runBalanceByTask).every((task) => task.balanced),
      by_task: runBalanceByTask
    },
    reviewer_families: reviewerFamilies,
    builder_reviewer_overlap: overlap
  };

  return { valid: errors.length === 0, errors, warnings, summary };
}

async function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const target = args.find((arg) => !arg.startsWith("--"));
  if (!target) {
    console.error("Usage: node scripts/validate-study-design.mjs <study-design.json> [--json]");
    process.exitCode = 2;
    return;
  }
  let input;
  try {
    input = JSON.parse(await readFile(path.resolve(target), "utf8"));
  } catch (error) {
    console.error("FAIL " + target + ": " + error.message);
    process.exitCode = 1;
    return;
  }
  const result = validateStudyDesign(input);
  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log((result.valid ? "PASS " : "FAIL ") + target);
    for (const error of result.errors) console.error("  ERROR " + error.path + ": " + error.message);
    for (const warning of result.warnings) console.warn("  WARN  " + warning.path + ": " + warning.message);
    if (result.summary) {
      console.log("  " + result.summary.actual_pairs + "/" + result.summary.expected_pairs + " pairs, " +
        result.summary.builders.length + " builders, " + result.summary.tasks.length + " public tasks, " +
        result.summary.held_out_tasks.length + " held-out tasks");
      console.log("  order balance: " + (result.summary.order_balance.balanced ? "ok" : "FAILED"));
    }
  }
  process.exitCode = result.valid ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Study design validation failed: " + error.message);
    process.exitCode = 1;
  });
}
